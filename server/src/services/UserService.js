import UserRepository from "../repositories/UserRepository.js";
import CompanyRepository from "../repositories/CompanyRepository.js";
import DepartmentRepository from "../repositories/DepartmentRepository.js";
import RoleRepository from "../repositories/RoleRepository.js";
import ApiError from "../utils/ApiError.js";
import { hashPassword } from "../utils/password.js";
import { sanitizeUser } from "../utils/sanitize.js";
import { assertResourceAccess, loadUserContext, isSubAdmin, isEmployee } from "../utils/taskAccess.js";
import { logAudit } from "../utils/auditLogger.js";

const EMPLOYEE_NUMBER_RE = /^[A-Za-z0-9_-]+$/;

function normalizeEmployeeNumber(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function assertValidEmployeeNumber(employeeId, { required = false } = {}) {
  if (employeeId == null || employeeId === "") {
    if (required) throw ApiError.badRequest("Employee Number is required");
    return null;
  }
  if (employeeId.length > 50) {
    throw ApiError.badRequest("Employee Number must be at most 50 characters");
  }
  if (!EMPLOYEE_NUMBER_RE.test(employeeId)) {
    throw ApiError.badRequest(
      "Employee Number may only contain letters, numbers, hyphens, and underscores"
    );
  }
  return employeeId;
}

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

  async getById(id, userContext) {
    const user = await UserRepository.findById(id);
    if (!user) throw ApiError.notFound("User not found");

    const ctx = await loadUserContext(userContext.userId);
    assertResourceAccess(ctx, user);

    return sanitizeUser(user);
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

    if (payload.companyId) {
      const company = await CompanyRepository.findById(payload.companyId);
      if (!company) throw ApiError.badRequest("Company not found");
    }

    if (payload.departmentId) {
      const dept = await DepartmentRepository.findById(payload.departmentId);
      if (!dept) throw ApiError.badRequest("Department not found");
      if (payload.companyId && dept.companyId !== payload.companyId) {
        throw ApiError.badRequest("Department does not belong to the specified company");
      }
    }

    const requiresEmployeeNumber = role.name === "EMPLOYEE";
    payload.employeeId = assertValidEmployeeNumber(
      normalizeEmployeeNumber(payload.employeeId),
      { required: requiresEmployeeNumber }
    );

    if (payload.employeeId && payload.companyId) {
      const dup = await UserRepository.findByEmployeeIdInCompany(
        payload.companyId,
        payload.employeeId
      );
      if (dup) {
        throw ApiError.conflict("Employee Number already exists in this company");
      }
    }

    const hashed = await hashPassword(payload.password);
    const user = await UserRepository.create({ ...payload, password: hashed });
    await logAudit(userContext, "CREATE_USER", "User", user.id, {
      email: user.email,
      employeeId: user.employeeId,
      companyId: user.companyId,
    });
    return sanitizeUser(user);
  }

  /**
   * Create EMPLOYEE only — role always EMPLOYEE; company from auth;
   * Sub Admin department forced from auth. Client roleId/companyId ignored.
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
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone === "" ? null : data.phone,
      password: data.password,
      designation: data.designation === "" ? null : data.designation,
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

    if (isSubAdmin(ctx)) {
      if (user.departmentId !== ctx.departmentId) {
        throw ApiError.forbidden("Sub Admin can only update users in their department");
      }
      delete payload.companyId;
      delete payload.departmentId;
    } else if (ctx.roleName !== "SUPER_ADMIN") {
      delete payload.companyId;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "employeeId")) {
      const requiresEmployeeNumber = nextRoleName === "EMPLOYEE";
      payload.employeeId = assertValidEmployeeNumber(
        normalizeEmployeeNumber(payload.employeeId),
        { required: requiresEmployeeNumber }
      );

      if (payload.employeeId) {
        const companyId = user.companyId;
        const dup = await UserRepository.findByEmployeeIdInCompany(companyId, payload.employeeId);
        if (dup && dup.id !== id) {
          throw ApiError.conflict("Employee Number already exists in this company");
        }
      }
    } else if (nextRoleName === "EMPLOYEE" && !user.employeeId) {
      throw ApiError.badRequest("Employee Number is required");
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
