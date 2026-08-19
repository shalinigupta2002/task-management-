import TaskActivityRepository from "../repositories/TaskActivityRepository.js";
import TaskRepository from "../repositories/TaskRepository.js";
import ApiError from "../utils/ApiError.js";
import { loadUserContext, assertTaskAccess } from "../utils/taskAccess.js";

class TaskActivityService {
  async getByTask(taskId, query, userId) {
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(taskId);
    if (!task) throw ApiError.notFound("Task not found");
    await assertTaskAccess(ctx, task);
    return TaskActivityRepository.findByTask(taskId, query);
  }
}

export default new TaskActivityService();
