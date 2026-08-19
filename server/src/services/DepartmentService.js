import DepartmentRepository from "../repositories/DepartmentRepository.js";
import CompanyRepository from "../repositories/CompanyRepository.js";
import ApiError from "../utils/ApiError.js";
import { assertResourceAccess, loadUserContext } from "../utils/taskAccess.js";

class DepartmentService {
  async getAll(query, userContext) {
    const q = { ...query };
    if (userContext.role !== "SUPER_ADMIN") {
      q.companyId = userContext.companyId;
    }
    return DepartmentRepository.findAll(q);
  }

  async getById(id, userContext) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) throw ApiError.notFound("Department not found");

    const ctx = await loadUserContext(userContext.userId);
    assertResourceAccess(ctx, dept);

    return dept;
  }

  async create(data, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    const payload = { ...data };

    if (ctx.roleName !== "SUPER_ADMIN") {
      payload.companyId = ctx.companyId;
    } else {
      if (!payload.companyId) throw ApiError.badRequest("companyId is required for Super Admin");
    }

    const company = await CompanyRepository.findById(payload.companyId);
    if (!company) throw ApiError.badRequest("Company not found");

    const existing = await DepartmentRepository.findByCode(payload.companyId, payload.departmentCode);
    if (existing) throw ApiError.conflict("Department code already exists for this company");

    return DepartmentRepository.create(payload);
  }

  async update(id, data, userContext) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) throw ApiError.notFound("Department not found");

    const ctx = await loadUserContext(userContext.userId);
    assertResourceAccess(ctx, dept);

    const payload = { ...data };
    if (ctx.roleName !== "SUPER_ADMIN") {
      delete payload.companyId;
    }

    if (payload.departmentCode) {
      const existing = await DepartmentRepository.findByCode(dept.companyId, payload.departmentCode);
      if (existing && existing.id !== id) {
        throw ApiError.conflict("Department code already exists for this company");
      }
    }

    return DepartmentRepository.update(id, payload);
  }

  async remove(id, userContext) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) throw ApiError.notFound("Department not found");

    const ctx = await loadUserContext(userContext.userId);
    assertResourceAccess(ctx, dept);

    return DepartmentRepository.softDelete(id);
  }
}

export default new DepartmentService();
