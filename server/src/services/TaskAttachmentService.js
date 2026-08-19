import TaskAttachmentRepository from "../repositories/TaskAttachmentRepository.js";
import TaskRepository from "../repositories/TaskRepository.js";
import ApiError from "../utils/ApiError.js";
import { validateSecureHttpsUrl } from "../utils/urlValidation.js";
import { loadUserContext, assertTaskAccess } from "../utils/taskAccess.js";
import { logActivity } from "../utils/taskActivityLogger.js";
import { ACTIVITY_TYPE } from "../constants/task.constants.js";

class TaskAttachmentService {
  async getAll(query, userId) {
    if (!query.taskId) {
      throw ApiError.badRequest("taskId is required in query");
    }
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(query.taskId);
    if (!task) throw ApiError.notFound("Task not found");
    await assertTaskAccess(ctx, task);
    return TaskAttachmentRepository.findAll(query);
  }

  async getById(id, userId) {
    const attachment = await TaskAttachmentRepository.findById(id);
    if (!attachment) throw ApiError.notFound("Attachment not found");
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(attachment.taskId);
    await assertTaskAccess(ctx, task);
    return attachment;
  }

  async create(data, userId) {
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(data.taskId);
    await assertTaskAccess(ctx, task);

    if (data.fileUrl) {
      validateSecureHttpsUrl(data.fileUrl);
    }

    const attachment = await TaskAttachmentRepository.create({
      ...data,
      uploadedById: ctx.id,
    });

    await logActivity(
      data.taskId,
      ctx.id,
      ACTIVITY_TYPE.ATTACHMENT_UPLOADED,
      `Attachment "${data.originalName}" uploaded by ${ctx.firstName} ${ctx.lastName}`
    );

    return attachment;
  }

  async remove(id, userId) {
    const ctx = await loadUserContext(userId);
    const attachment = await this.getById(id, userId);

    if (ctx.roleName === "EMPLOYEE" && attachment.uploadedById !== ctx.id) {
      throw ApiError.forbidden("You can only delete your own attachments");
    }

    return TaskAttachmentRepository.softDelete(id);
  }
}

export default new TaskAttachmentService();
