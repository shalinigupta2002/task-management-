import ExtensionRepository from "../repositories/ExtensionRepository.js";
import TaskRepository from "../repositories/TaskRepository.js";
import ApiError from "../utils/ApiError.js";
import {
  loadUserContext,
  assertTaskAccess,
  canApproveExtension,
  isEmployee,
} from "../utils/taskAccess.js";
import { logActivity } from "../utils/taskActivityLogger.js";
import { ACTIVITY_TYPE } from "../constants/task.constants.js";

class ExtensionService {
  async getAll(query, userId) {
    const ctx = await loadUserContext(userId);
    const q = { ...query };
    if (!q.companyId && ctx.companyId) q.companyId = ctx.companyId;
    return ExtensionRepository.findAll(q);
  }

  async getById(id, userId) {
    const ext = await ExtensionRepository.findById(id);
    if (!ext) throw ApiError.notFound("Extension request not found");
    const ctx = await loadUserContext(userId);
    await assertTaskAccess(ctx, ext.task);
    return ext;
  }

  async create(data, userId) {
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(data.taskId);
    await assertTaskAccess(ctx, task);

    if (!task.dueDate) throw ApiError.badRequest("Task has no due date to extend");

    const pending = await ExtensionRepository.findPendingByTask(data.taskId);
    if (pending) throw ApiError.conflict("A pending extension request already exists for this task");

    if (new Date(data.requestedDueDate) <= new Date(task.dueDate)) {
      throw ApiError.badRequest("Requested due date must be after current due date");
    }

    const ext = await ExtensionRepository.create({
      taskId: data.taskId,
      requestedById: ctx.id,
      currentDueDate: task.dueDate,
      requestedDueDate: data.requestedDueDate,
      reason: data.reason,
      status: "PENDING",
    });

    await logActivity(
      data.taskId,
      ctx.id,
      ACTIVITY_TYPE.EXTENSION_REQUESTED,
      `Extension requested until ${new Date(data.requestedDueDate).toISOString().split("T")[0]}`
    );

    return ext;
  }

  async approve(id, userId) {
    const ctx = await loadUserContext(userId);
    if (!canApproveExtension(ctx)) throw ApiError.forbidden("Only Main Admin can approve extensions");

    const ext = await ExtensionRepository.findById(id);
    if (!ext) throw ApiError.notFound("Extension request not found");
    if (ext.status !== "PENDING") throw ApiError.badRequest("Request is not pending");

    await assertTaskAccess(ctx, ext.task);

    const updated = await ExtensionRepository.update(id, {
      status: "APPROVED",
      approvedById: ctx.id,
      approvedDate: new Date(),
    });

    await TaskRepository.update(ext.taskId, {
      dueDate: ext.requestedDueDate,
      updatedById: ctx.id,
    });

    await logActivity(
      ext.taskId,
      ctx.id,
      ACTIVITY_TYPE.EXTENSION_APPROVED,
      `Extension approved — new due date: ${ext.requestedDueDate.toISOString().split("T")[0]}`
    );

    await logActivity(
      ext.taskId,
      ctx.id,
      ACTIVITY_TYPE.DUE_DATE_EXTENDED,
      `Due date extended to ${ext.requestedDueDate.toISOString().split("T")[0]}`
    );

    return updated;
  }

  async reject(id, userId) {
    const ctx = await loadUserContext(userId);
    if (!canApproveExtension(ctx)) throw ApiError.forbidden("Only Main Admin can reject extensions");

    const ext = await ExtensionRepository.findById(id);
    if (!ext) throw ApiError.notFound("Extension request not found");
    if (ext.status !== "PENDING") throw ApiError.badRequest("Request is not pending");

    await assertTaskAccess(ctx, ext.task);

    const updated = await ExtensionRepository.update(id, {
      status: "REJECTED",
      approvedById: ctx.id,
      approvedDate: new Date(),
    });

    await logActivity(
      ext.taskId,
      ctx.id,
      ACTIVITY_TYPE.EXTENSION_REJECTED,
      "Extension request rejected"
    );

    return updated;
  }
}

export default new ExtensionService();
