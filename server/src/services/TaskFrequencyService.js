import TaskFrequencyRepository from "../repositories/TaskFrequencyRepository.js";
import ApiError from "../utils/ApiError.js";
import { loadUserContext, isSuperAdmin, isMainAdmin, isSubAdmin } from "../utils/taskAccess.js";

function canMutateFrequencies(ctx) {
  return isSuperAdmin(ctx) || isMainAdmin(ctx) || isSubAdmin(ctx);
}

/**
 * Frequency tenancy model:
 * - companyId = null  → platform/global master (readable by all; mutable by SUPER_ADMIN only)
 * - companyId = X     → company-owned custom (readable by that company; mutable by that company's Main/Sub Admin)
 */
class TaskFrequencyService {
  async getAll(query, userId) {
    const ctx = await loadUserContext(userId);
    const scoped = { ...query };
    if (!isSuperAdmin(ctx)) {
      scoped.companyScopeId = ctx.companyId;
    }
    return TaskFrequencyRepository.findAll(scoped);
  }

  async getById(id, userId) {
    const ctx = await loadUserContext(userId);
    const freq = await TaskFrequencyRepository.findById(id);
    if (!freq) throw ApiError.notFound("Task frequency not found");
    if (!isSuperAdmin(ctx)) {
      if (freq.companyId && freq.companyId !== ctx.companyId) {
        throw ApiError.forbidden("Access denied to this frequency");
      }
    }
    return freq;
  }

  async create(data, userId) {
    const ctx = await loadUserContext(userId);
    if (!canMutateFrequencies(ctx)) {
      throw ApiError.forbidden("You do not have permission to create task frequencies");
    }

    const payload = { ...data };
    if (isSuperAdmin(ctx)) {
      if (payload.companyId === undefined) payload.companyId = null;
    } else {
      if (!ctx.companyId) throw ApiError.forbidden("Company context required");
      payload.companyId = ctx.companyId;
    }

    const existing = await TaskFrequencyRepository.findByName(
      payload.frequencyName,
      payload.companyId ?? null
    );
    if (existing) throw ApiError.conflict("This frequency already exists.");
    return TaskFrequencyRepository.create(payload);
  }

  async update(id, data, userId) {
    const ctx = await loadUserContext(userId);
    if (!canMutateFrequencies(ctx)) {
      throw ApiError.forbidden("You do not have permission to update task frequencies");
    }

    const freq = await this.getById(id, userId);
    this.#assertCanMutateRecord(ctx, freq);

    const patch = { ...data };
    delete patch.companyId;

    if (patch.frequencyName) {
      const existing = await TaskFrequencyRepository.findByName(
        patch.frequencyName,
        freq.companyId ?? null
      );
      if (existing && existing.id !== id) {
        throw ApiError.conflict("This frequency already exists.");
      }
    }
    return TaskFrequencyRepository.update(id, patch);
  }

  async remove(id, userId) {
    const ctx = await loadUserContext(userId);
    if (!canMutateFrequencies(ctx)) {
      throw ApiError.forbidden("Only admins can delete task frequencies");
    }
    const freq = await this.getById(id, userId);
    this.#assertCanMutateRecord(ctx, freq);
    return TaskFrequencyRepository.softDelete(id);
  }

  #assertCanMutateRecord(ctx, freq) {
    if (isSuperAdmin(ctx)) return;
    if (!freq.companyId) {
      throw ApiError.forbidden("Only Super Admin can modify platform frequencies");
    }
    if (freq.companyId !== ctx.companyId) {
      throw ApiError.forbidden("Cannot modify another company's frequency");
    }
  }
}

export default new TaskFrequencyService();
