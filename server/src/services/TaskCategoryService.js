import TaskCategoryRepository from "../repositories/TaskCategoryRepository.js";
import ApiError from "../utils/ApiError.js";
import { assertCompanyScope, loadUserContext } from "../utils/taskAccess.js";
import { normalizeCategoryCode } from "../utils/categoryCode.js";

class TaskCategoryService {
  prepareData(data) {
    const next = { ...data };
    if (data.categoryCode != null) {
      next.categoryCode = normalizeCategoryCode(data.categoryCode);
      if (!next.categoryCode) throw ApiError.badRequest("Category code is required");
    }
    return next;
  }

  async getAll(query, userId) {
    const ctx = await loadUserContext(userId);
    const q = { ...query };
    if (!q.companyId && ctx.companyId) q.companyId = ctx.companyId;
    if (q.companyId) await assertCompanyScope(ctx, q.companyId);
    return TaskCategoryRepository.findAll(q);
  }

  async getById(id, userId) {
    const category = await TaskCategoryRepository.findById(id);
    if (!category) throw ApiError.notFound("Task category not found");
    const ctx = await loadUserContext(userId);
    await assertCompanyScope(ctx, category.companyId);
    return category;
  }

  async create(data, userId) {
    const ctx = await loadUserContext(userId);
    const payload = this.prepareData(data);
    if (!payload.categoryCode) throw ApiError.badRequest("Category code is required");

    if (ctx.roleName !== "SUPER_ADMIN") {
      payload.companyId = ctx.companyId;
    } else {
      if (!payload.companyId) throw ApiError.badRequest("companyId is required for Super Admin");
    }

    await assertCompanyScope(ctx, payload.companyId);

    const existingName = await TaskCategoryRepository.findByName(payload.companyId, payload.categoryName);
    if (existingName) throw ApiError.conflict("Category name already exists for this company");

    const existingCode = await TaskCategoryRepository.findByCode(payload.companyId, payload.categoryCode);
    if (existingCode) throw ApiError.conflict("Category code already exists for this company");

    return TaskCategoryRepository.create(payload);
  }

  async update(id, data, userId) {
    const category = await this.getById(id, userId);
    const payload = this.prepareData({ ...data });

    if (payload.categoryName) {
      const existing = await TaskCategoryRepository.findByName(category.companyId, payload.categoryName);
      if (existing && existing.id !== id) throw ApiError.conflict("Category name already exists");
    }

    if (payload.categoryCode) {
      const existing = await TaskCategoryRepository.findByCode(category.companyId, payload.categoryCode);
      if (existing && existing.id !== id) throw ApiError.conflict("Category code already exists for this company");
    }

    return TaskCategoryRepository.update(id, payload);
  }

  async remove(id, userId) {
    await this.getById(id, userId);
    return TaskCategoryRepository.softDelete(id);
  }
}

export default new TaskCategoryService();
