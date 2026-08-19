import TaskCommentRepository from "../repositories/TaskCommentRepository.js";
import TaskRepository from "../repositories/TaskRepository.js";
import ApiError from "../utils/ApiError.js";
import {
  loadUserContext, assertTaskAccess, isEmployee,
} from "../utils/taskAccess.js";
import { logActivity } from "../utils/taskActivityLogger.js";
import { ACTIVITY_TYPE } from "../constants/task.constants.js";

class TaskCommentService {
  async getAll(query, userId) {
    if (!query.taskId) {
      throw ApiError.badRequest("taskId is required in query");
    }
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(query.taskId);
    if (!task) throw ApiError.notFound("Task not found");
    await assertTaskAccess(ctx, task);
    return TaskCommentRepository.findAll(query);
  }

  async getById(id, userId) {
    const comment = await TaskCommentRepository.findById(id);
    if (!comment) throw ApiError.notFound("Comment not found");
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(comment.taskId);
    await assertTaskAccess(ctx, task);
    return comment;
  }

  async create(data, userId) {
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(data.taskId);
    await assertTaskAccess(ctx, task);

    const comment = await TaskCommentRepository.create({
      taskId: data.taskId,
      userId: ctx.id,
      comment: data.comment,
    });

    await logActivity(
      data.taskId,
      ctx.id,
      ACTIVITY_TYPE.COMMENT_ADDED,
      `Comment added by ${ctx.firstName} ${ctx.lastName}`
    );

    return comment;
  }

  async update(id, data, userId) {
    const comment = await TaskCommentRepository.findById(id);
    if (!comment) throw ApiError.notFound("Comment not found");
    const ctx = await loadUserContext(userId);

    if (isEmployee(ctx) && comment.userId !== ctx.id) {
      throw ApiError.forbidden("You can only edit your own comments");
    }

    const task = await TaskRepository.findById(comment.taskId);
    await assertTaskAccess(ctx, task);

    return TaskCommentRepository.update(id, { comment: data.comment });
  }

  async remove(id, userId) {
    const comment = await TaskCommentRepository.findById(id);
    if (!comment) throw ApiError.notFound("Comment not found");
    const ctx = await loadUserContext(userId);

    if (isEmployee(ctx) && comment.userId !== ctx.id) {
      throw ApiError.forbidden("You can only delete your own comments");
    }

    const task = await TaskRepository.findById(comment.taskId);
    await assertTaskAccess(ctx, task);

    return TaskCommentRepository.softDelete(id);
  }
}

export default new TaskCommentService();
