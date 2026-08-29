import TaskFrequencyRepository from "../repositories/TaskFrequencyRepository.js";
import ApiError from "../utils/ApiError.js";
import { loadUserContext, isSuperAdmin, isMainAdmin, isSubAdmin } from "../utils/taskAccess.js";

function canManageFrequencies(ctx) {
  return isSuperAdmin(ctx) || isMainAdmin(ctx) || isSubAdmin(ctx);
}

class TaskFrequencyService {
  async getAll(query) {
    return TaskFrequencyRepository.findAll(query);
  }

  async getById(id) {
    const freq = await TaskFrequencyRepository.findById(id);
    if (!freq) throw ApiError.notFound("Task frequency not found");
    return freq;
  }

  async create(data, userId) {
    const ctx = await loadUserContext(userId);
    if (!canManageFrequencies(ctx)) {
      throw ApiError.forbidden("You do not have permission to create task frequencies");
    }
    const existing = await TaskFrequencyRepository.findByName(data.frequencyName);
    if (existing) throw ApiError.conflict("This frequency already exists.");
    return TaskFrequencyRepository.create(data);
  }

  async update(id, data, userId) {
    const ctx = await loadUserContext(userId);
    if (!canManageFrequencies(ctx)) {
      throw ApiError.forbidden("You do not have permission to update task frequencies");
    }
    await this.getById(id);
    if (data.frequencyName) {
      const existing = await TaskFrequencyRepository.findByName(data.frequencyName);
      if (existing && existing.id !== id) {
        throw ApiError.conflict("This frequency already exists.");
      }
    }
    return TaskFrequencyRepository.update(id, data);
  }

  async remove(id, userId) {
    const ctx = await loadUserContext(userId);
    // Soft-delete remains Main Admin / Super Admin / Sub Admin
    if (!canManageFrequencies(ctx)) {
      throw ApiError.forbidden("Only admins can delete task frequencies");
    }
    await this.getById(id);
    return TaskFrequencyRepository.softDelete(id);
  }
}

export default new TaskFrequencyService();
