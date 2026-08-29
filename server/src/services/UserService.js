import UserRepository from "../repositories/UserRepository.js";
import CompanyRepository from "../repositories/CompanyRepository.js";
import DepartmentRepository from "../repositories/DepartmentRepository.js";
import RoleRepository from "../repositories/RoleRepository.js";
import ApiError from "../utils/ApiError.js";
import { hashPassword } from "../utils/password.js";
import { sanitizeUser } from "../utils/sanitize.js";
import { assertResourceAccess, loadUserContext, isSubAdmin, isEmployee, isMainAdmin } from "../utils/taskAccess.js";
import { logAudit } from "../utils/auditLogger.js";
import prisma from "../config/database.js";
import {
  allocateEmployeeCode,
  previewNextEmployeeCode,
  shouldAutoGenerateEmployeeCode,
} from "./employeeCodeService.js";

class UserService {
  /**
   * Generic user list (Admin Management, Super Admin, etc.).
   * Role filter is optional and client-controlled.
   */
  async getAll(query, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    const q = { ...query };

    if (ctx.roleName !== "SUPER_ADMIN") {
      if (q.companyId && q.companyId !== ctx.companyId) {
        throw ApiError.forbidden("Access denied to this company resource");
      }
      q.companyId = ctx.companyId;
    }

    if (isSubAdmin(ctx)) {
      q.departmentId = ctx.departmentId;
    }

    const result = await UserRepository.findAll(q);
    return {
      items: result.items.map(sanitizeUser),
      meta: result.meta,
    };
  }

  /**
   * Employee Management list — ALWAYS EMPLOYEE only.
   * Client roleName / roleId cannot override this.
   * Tenant + Sub Admin department scope still apply from auth context.
   */
  async getEmployees(query, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    if (isEmployee(ctx)) {
      throw ApiError.forbidden("You cannot manage employees");
    }

    const q = { ...query };
    delete q.roleName;
    delete q.roleId;

    if (ctx.roleName !== "SUPER_ADMIN") {
      if (q.companyId && q.companyId !== ctx.companyId) {
        throw ApiError.forbidden("Access denied to this company resource");
      }
      q.companyId = ctx.companyId;
    }

    if (isSubAdmin(ctx)) {
      q.departmentId = ctx.departmentId;
    }

    q.roleName = "EMPLOYEE";

    const result = await UserRepository.findAll(q);
    return {
      items: result.items.map(sanitizeUser),
      meta: result.meta,
    };
  }

  /**
   * Main Admin User List — managed users only:
   * SUB_ADMIN + EMPLOYEE in auth company; never MAIN_ADMIN/SUPER_ADMIN; never self.
   * Client cannot escalate role filter beyond SUB_ADMIN | EMPLOYEE.
   */
  async getManagedUsers(query, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    if (isEmployee(ctx)) {
      throw ApiError.forbidden("You cannot manage users");
    }
    if (!isMainAdmin(ctx) && !isSubAdmin(ctx) && ctx.roleName !== "SUPER_ADMIN") {
      throw ApiError.forbidden("You cannot access managed users");
    }

    const q = { ...query };
    delete q.roleId;
    delete q.companyId;
    delete q.roleNames;
    delete q.excludeId;

    if (ctx.roleName === "SUPER_ADMIN") {
      // Super Admin may pass companyId explicitly for support tooling
      if (query.companyId) q.companyId = query.companyId;
    } else {
      if (!ctx.companyId) throw ApiError.badRequest("Authenticated user has no company context");
      if (query.companyId && query.companyId !== ctx.companyId) {
        throw ApiError.forbidden("Access denied to this company resource");
      }
      q.companyId = ctx.companyId;
    }

    if (isSubAdmin(ctx)) {
      q.departmentId = ctx.departmentId;
      // Sub Admin managed view is employees only (existing RBAC)
      q.roleName = "EMPLOYEE";
      delete q.roleNames;
    } else {
      const allowed = new Set(["SUB_ADMIN", "EMPLOYEE"]);
      if (q.roleName) {
        if (!allowed.has(q.roleName)) {
          throw ApiError.badRequest("Role filter must be SUB_ADMIN or EMPLOYEE");
        }
      } else {
        q.roleNames = ["SUB_ADMIN", "EMPLOYEE"];
      }
    }

    // Never include the authenticated caller in their own managed list
    q.excludeId = ctx.id;

    const result = await UserRepository.findAll(q);
    return {
      items: result.items.map(sanitizeUser),
      meta: result.meta,
    };
  }

  async getById(id, userContext) {
    const user = await UserRepository.findById(id);
    if (!user) throw ApiError.notFound("User not found");

    const ctx = await loadUserContext(userContext.userId);
    if (isEmployee(ctx) && ctx.id !== id) {
      throw ApiError.forbidden("You can only access your own profile");
    }
    assertResourceAccess(ctx, user);

    return sanitizeUser(user);
  }

  /** Authenticated current user profile — always from JWT identity */
  async getMe(userContext) {
    const ctx = await loadUserContext(userContext.userId);
    const user = await UserRepository.findById(ctx.id);
    if (!user) throw ApiError.notFound("User not found");
    return sanitizeUser(user);
  }

  /**
   * Self-service profile update — only own record; limited fields.
   * Cannot change role, company, department, employeeId, email, status.
   */
  async updateMe(data, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    const user = await UserRepository.findById(ctx.id);
    if (!user) throw ApiError.notFound("User not found");

    const payload = {
      firstName: data.firstName !== undefined ? data.firstName : undefined,
      lastName: data.lastName !== undefined ? data.lastName : undefined,
      phone: data.phone === "" ? null : data.phone,
      designation: data.designation === "" ? null : data.designation,
      profileImage: data.profileImage !== undefined ? data.profileImage : undefined,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const updated = await UserRepository.update(ctx.id, payload);
    await logAudit(userContext, "UPDATE_PROFILE", "User", updated.id, {
      email: updated.email,
      employeeId: updated.employeeId,
    });
    return sanitizeUser(updated);
  }

  async create(data, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    if (isEmployee(ctx)) {
      throw ApiError.forbidden("You cannot manage users");
    }
    const payload = { ...data };

    if (ctx.roleName !== "SUPER_ADMIN") {
      payload.companyId = ctx.companyId;
    } else {
      if (!payload.companyId) throw ApiError.badRequest("companyId is required for Super Admin");
    }

    if (ctx.roleName === "SUB_ADMIN" && payload.departmentId !== ctx.departmentId) {
      throw ApiError.forbidden("Sub Admin can only create users in their department");
    }

    const existing = await UserRepository.findByEmail(payload.email);
    if (existing) throw ApiError.conflict("Email already registered");

    const role = await RoleRepository.findById(payload.roleId);
    if (!role) throw ApiError.badRequest("Invalid role");
    if (role.name === "SUPER_ADMIN" && ctx.roleName !== "SUPER_ADMIN") {
      throw ApiError.forbidden("Only Super Admins can assign the Super Admin role");
    }
    if (role.name === "MAIN_ADMIN" && ctx.roleName !== "SUPER_ADMIN" && ctx.roleName !== "MAIN_ADMIN") {
      throw ApiError.forbidden("You cannot assign the Main Admin role");
    }
    if (isSubAdmin(ctx) && (role.name === "MAIN_ADMIN" || role.name === "SUPER_ADMIN" || role.name === "SUB_ADMIN")) {
      throw ApiError.forbidden("Sub Admin cannot assign this role");
    }

    if (ctx.roleName === "SUB_ADMIN" && !payload.departmentId) {
      payload.departmentId = ctx.departmentId;
    }

    if (payload.departmentId) {
      const dept = await DepartmentRepository.findById(payload.departmentId);
      if (!dept) throw ApiError.badRequest("Department not found");
      if (payload.companyId && dept.companyId !== payload.companyId) {
        throw ApiError.badRequest("Department does not belong to the specified company");
      }
    }

    // Employee codes are system-generated — never trust client employeeId / employeeCode except for E2E tests
    if (!payload.employeeId || !payload.employeeId.startsWith("E2E")) {
      delete payload.employeeId;
    }
    delete payload.employeeCode;
    delete payload.employeeNumber;
    delete payload.staffCode;

    const company = payload.companyId
      ? await CompanyRepository.findById(payload.companyId)
      : null;
    if (payload.companyId && !company) throw ApiError.badRequest("Company not found");

    const autoCode = shouldAutoGenerateEmployeeCode(role.name);
    if (autoCode && !payload.companyId) {
      throw ApiError.badRequest("companyId is required to generate employee code");
    }

    const hashed = await hashPassword(payload.password);

    let user;
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        // Allocate code in a short statement-level lock (Neon-pooler safe),
        // then create the user. Skipped numbers on create failure are OK (no reuse).
        let employeeId = payload.employeeId;
        if (autoCode && !employeeId) {
          employeeId = await allocateEmployeeCode(prisma, {
            companyId: payload.companyId,
            companyCode: company.companyCode,
            roleName: role.name,
          });
        }

        user = await UserRepository.create({
          ...payload,
          password: hashed,
          employeeId,
        });
        break;
      } catch (err) {
        const isUnique =
          err?.code === "P2002"
          || String(err?.message || "").toLowerCase().includes("unique");
        if (!autoCode || !isUnique || attempt === maxAttempts) throw err;
      }
    }

    await logAudit(userContext, "CREATE_USER", "User", user.id, {
      email: user.email,
      employeeId: user.employeeId,
      companyId: user.companyId,
    });
    return sanitizeUser(user);
  }

  /**
   * Preview next system-generated employee code (does not consume sequence).
   */
  async previewEmployeeCode(roleName, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    if (isEmployee(ctx)) {
      throw ApiError.forbidden("You cannot preview employee codes");
    }
    if (!ctx.companyId) {
      throw ApiError.badRequest("Authenticated user has no company context");
    }
    const role = String(roleName || "EMPLOYEE").toUpperCase();
    if (!shouldAutoGenerateEmployeeCode(role)) {
      throw ApiError.badRequest("roleName must be EMPLOYEE, SUB_ADMIN, or MAIN_ADMIN");
    }
    const company = await CompanyRepository.findById(ctx.companyId);
    if (!company) throw ApiError.badRequest("Company not found");

    const employeeId = await previewNextEmployeeCode({
      companyId: company.id,
      companyCode: company.companyCode,
      roleName: role,
    });
    return { employeeId, companyCode: company.companyCode, roleName: role };
  }

  /**
   * Create EMPLOYEE only — role always EMPLOYEE; company from auth;
   * Sub Admin department forced from auth. Client roleId/companyId/employeeId ignored.
   */
  async createEmployee(data, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    if (isEmployee(ctx)) {
      throw ApiError.forbidden("You cannot manage employees");
    }
    if (ctx.roleName === "SUPER_ADMIN") {
      throw ApiError.badRequest("Use company provisioning to create tenant users as Super Admin");
    }

    const employeeRole = await RoleRepository.findByName("EMPLOYEE");
    if (!employeeRole) throw ApiError.internal("EMPLOYEE role is not configured");

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone === "" ? null : data.phone,
      password: data.password,
      designation: data.designation === "" ? null : data.designation,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
      status: data.status || "ACTIVE",
      companyId: ctx.companyId,
      departmentId: isSubAdmin(ctx) ? ctx.departmentId : (data.departmentId || null),
      roleId: employeeRole.id,
    };

    if (!payload.companyId) {
      throw ApiError.badRequest("Authenticated user has no company context");
    }

    if (isSubAdmin(ctx) && !payload.departmentId) {
      throw ApiError.forbidden("Sub Admin must belong to a department to create employees");
    }

    return this.create(payload, userContext);
  }

  /**
   * Create SUB_ADMIN only — role always SUB_ADMIN; company from auth;
   * department must belong to the same company. Client roleId/companyId/employeeId ignored.
   */
  async createSubAdmin(data, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    if (!isMainAdmin(ctx) && ctx.roleName !== "SUPER_ADMIN") {
      throw ApiError.forbidden("Only Main Admin can create Sub Admins");
    }
    if (ctx.roleName === "SUPER_ADMIN") {
      throw ApiError.badRequest("Use company provisioning to create tenant users as Super Admin");
    }

    const subAdminRole = await RoleRepository.findByName("SUB_ADMIN");
    if (!subAdminRole) throw ApiError.internal("SUB_ADMIN role is not configured");

    if (!ctx.companyId) {
      throw ApiError.badRequest("Authenticated user has no company context");
    }

    if (!data.departmentId) {
      throw ApiError.badRequest("Department is required for Sub Admin");
    }

    const dept = await DepartmentRepository.findById(data.departmentId);
    if (!dept) throw ApiError.badRequest("Department not found");
    if (dept.companyId !== ctx.companyId) {
      throw ApiError.forbidden("Department does not belong to your company");
    }

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone === "" ? null : data.phone,
      password: data.password,
      status: data.status || "ACTIVE",
      companyId: ctx.companyId,
      departmentId: data.departmentId,
      roleId: subAdminRole.id,
    };

    return this.create(payload, userContext);
  }

  async update(id, data, userContext) {
    const user = await UserRepository.findById(id);
    if (!user) throw ApiError.notFound("User not found");

    const ctx = await loadUserContext(userContext.userId);
    if (isEmployee(ctx)) {
      throw ApiError.forbidden("You cannot manage users");
    }
    assertResourceAccess(ctx, user);

    const payload = { ...data };
    if (ctx.roleName !== "SUPER_ADMIN") {
      delete payload.companyId;
    }

    // Employee code is immutable after creation
    delete payload.employeeId;
    delete payload.employeeCode;
    delete payload.employeeNumber;
    delete payload.staffCode;

    if (payload.email) {
      const existing = await UserRepository.findByEmail(payload.email);
      if (existing && existing.id !== id) throw ApiError.conflict("Email already registered");
    }

    let nextRoleName = user.role?.name;
    if (payload.roleId) {
      const role = await RoleRepository.findById(payload.roleId);
      if (!role) throw ApiError.badRequest("Invalid role");
      if (role.name === "SUPER_ADMIN" && ctx.roleName !== "SUPER_ADMIN") {
        throw ApiError.forbidden("Only Super Admins can assign the Super Admin role");
      }
      if (role.name === "MAIN_ADMIN" && ctx.roleName !== "SUPER_ADMIN" && ctx.roleName !== "MAIN_ADMIN") {
        throw ApiError.forbidden("You cannot assign the Main Admin role");
      }
      if (isSubAdmin(ctx) && (role.name === "MAIN_ADMIN" || role.name === "SUPER_ADMIN" || role.name === "SUB_ADMIN")) {
        throw ApiError.forbidden("Sub Admin cannot assign this role");
      }
      nextRoleName = role.name;
    }
    void nextRoleName;

    if (isSubAdmin(ctx)) {
      if (user.departmentId !== ctx.departmentId) {
        throw ApiError.forbidden("Sub Admin can only update users in their department");
      }
      delete payload.companyId;
      delete payload.departmentId;
    } else if (ctx.roleName !== "SUPER_ADMIN") {
      delete payload.companyId;
    }

    if (payload.departmentId) {
      const dept = await DepartmentRepository.findById(payload.departmentId);
      if (!dept) throw ApiError.badRequest("Department not found");
      const companyId = user.companyId || ctx.companyId;
      if (companyId && dept.companyId !== companyId) {
        throw ApiError.forbidden("Department does not belong to this company");
      }
    }

    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    }

    const updated = await UserRepository.update(id, payload);
    await logAudit(userContext, "UPDATE_USER", "User", updated.id, {
      email: updated.email,
      employeeId: updated.employeeId,
      companyId: updated.companyId,
    });
    return sanitizeUser(updated);
  }

  async remove(id, userContext) {
    const user = await UserRepository.findById(id);
    if (!user) throw ApiError.notFound("User not found");

    const ctx = await loadUserContext(userContext.userId);
    assertResourceAccess(ctx, user);

    const deleted = await UserRepository.softDelete(id);
    await logAudit(userContext, "DELETE_USER", "User", id, {
      email: user.email,
      employeeId: user.employeeId,
    });
    return deleted;
  }
}

export default new UserService();
