import TaskFrequencyRepository from "../repositories/TaskFrequencyRepository.js";
import ApiError from "../utils/ApiError.js";
import { loadUserContext, isSuperAdmin, isMainAdmin } from "../utils/taskAccess.js";

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
    if (!isSuperAdmin(ctx) && !isMainAdmin(ctx)) {
      throw ApiError.forbidden("Only admins can manage task frequencies");
    }
    const existing = await TaskFrequencyRepository.findByName(data.frequencyName);
    if (existing) throw ApiError.conflict("Frequency name already exists");
    return TaskFrequencyRepository.create(data);
  }

  async update(id, data, userId) {
    const ctx = await loadUserContext(userId);
    if (!isSuperAdmin(ctx) && !isMainAdmin(ctx)) {
      throw ApiError.forbidden("Only admins can manage task frequencies");
    }
    await this.getById(id);
    if (data.frequencyName) {
      const existing = await TaskFrequencyRepository.findByName(data.frequencyName);
      if (existing && existing.id !== id) throw ApiError.conflict("Frequency name already exists");
    }
    return TaskFrequencyRepository.update(id, data);
  }

  async remove(id, userId) {
    const ctx = await loadUserContext(userId);
    if (!isSuperAdmin(ctx) && !isMainAdmin(ctx)) {
      throw ApiError.forbidden("Only admins can manage task frequencies");
    }
    await this.getById(id);
    return TaskFrequencyRepository.softDelete(id);
  }
}

export default new TaskFrequencyService();
