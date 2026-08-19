import TaskOccurrenceRepository from "../repositories/TaskOccurrenceRepository.js";
import TaskRepository from "../repositories/TaskRepository.js";
import NotificationService from "./NotificationService.js";
import ApiError from "../utils/ApiError.js";
import { logActivity } from "../utils/taskActivityLogger.js";
import { logAudit, toAuditActor } from "../utils/auditLogger.js";
import { ACTIVITY_TYPE } from "../constants/task.constants.js";
import {
  loadUserContext,
  assertTaskAccess,
  isEmployee,
  isSuperAdmin,
  isSubAdmin,
  isMainAdmin,
} from "../utils/taskAccess.js";

const TERMINAL = new Set(["APPROVED", "CANCELLED"]);

class TaskOccurrenceService {
  async getByTask(taskId, userId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw ApiError.notFound("Task not found");
    const ctx = await loadUserContext(userId);
    await assertTaskAccess(ctx, task);
    return TaskOccurrenceRepository.findByTask(taskId);
  }

  async getCalendar(query, userId) {
    const ctx = await loadUserContext(userId);
    const from = query.from ? new Date(query.from) : null;
    const to = query.to ? new Date(query.to) : null;

    let assigneeId = query.assigneeId || null;
    if (isEmployee(ctx)) {
      assigneeId = ctx.id;
    }

    const filters = {
      assigneeId: assigneeId || ctx.id,
      from,
      to,
      status: query.status,
      approverId: query.approverId,
    };

    if (!isEmployee(ctx)) {
      if (query.assigneeId) filters.assigneeId = query.assigneeId;
      else delete filters.assigneeId;

      if (isSubAdmin(ctx) && !query.companyId) {
        filters.departmentId = ctx.departmentId;
      }
      if (ctx.companyId && !isSuperAdmin(ctx)) {
        filters.companyId = ctx.companyId;
      }
    }

    const occurrences = await TaskOccurrenceRepository.findCalendarEvents(filters);

    if (isEmployee(ctx)) {
      return occurrences.map((occ) => ({
        ...occ,
        assignees: occ.assignees.filter((a) => a.assigneeId === ctx.id),
      })).filter((occ) => occ.assignees.length > 0);
    }

    if (filters.assigneeId) {
      return occurrences.map((occ) => ({
        ...occ,
        assignees: occ.assignees.filter((a) => a.assigneeId === filters.assigneeId),
      })).filter((occ) => occ.assignees.length > 0);
    }

    return occurrences;
  }

  async updateAssigneeProgress(occurrenceAssigneeId, data, userId) {
    const ctx = await loadUserContext(userId);
    const full = await this._getAssigneeRecordById(occurrenceAssigneeId);
    if (!full) throw ApiError.notFound("Occurrence assignment not found");

    await assertTaskAccess(ctx, full.occurrence.task);

    if (isEmployee(ctx) && full.assigneeId !== ctx.id) {
      throw ApiError.forbidden("You can only update your own assignment");
    }

    if (TERMINAL.has(full.status)) {
      throw ApiError.badRequest(`Cannot update occurrence in ${full.status} status`);
    }

    const patch = {};
    if (data.progress != null) patch.progress = Math.min(100, Math.max(0, Number(data.progress)));
    if (data.status) {
      const allowed = ["OPEN", "IN_PROGRESS"];
      if (!allowed.includes(data.status)) {
        throw ApiError.badRequest("Use complete/submit endpoints for completion workflow");
      }
      patch.status = data.status;
    }

    const updated = await TaskOccurrenceRepository.updateAssigneeRecord(full.id, patch);
    await logActivity(
      full.occurrence.taskId,
      ctx.id,
      ACTIVITY_TYPE.STATUS_CHANGED,
      `Occurrence ${full.occurrence.occurrenceDate.toISOString().split("T")[0]} progress updated`
    );
    return updated;
  }

  async completeOccurrence(occurrenceAssigneeId, data, userId) {
    const ctx = await loadUserContext(userId);
    const full = await this._getAssigneeRecordById(occurrenceAssigneeId);
    if (!full) throw ApiError.notFound("Occurrence assignment not found");

    await assertTaskAccess(ctx, full.occurrence.task);

    if (isEmployee(ctx) && full.assigneeId !== ctx.id) {
      throw ApiError.forbidden("You can only complete your own assignment");
    }

    if (["COMPLETED", "PENDING_APPROVAL", "APPROVED"].includes(full.status)) {
      throw ApiError.badRequest("This occurrence is already completed or awaiting approval");
    }

    const task = full.occurrence.task;
    const needsApproval = Boolean(task.approverId);

    const updated = await TaskOccurrenceRepository.updateAssigneeRecord(full.id, {
      status: needsApproval ? "PENDING_APPROVAL" : "COMPLETED",
      progress: 100,
      completedAt: new Date(),
      completedById: ctx.id,
      submittedAt: needsApproval ? new Date() : null,
    });

    await logActivity(
      task.id,
      ctx.id,
      ACTIVITY_TYPE.TASK_COMPLETED,
      `Occurrence ${full.occurrence.occurrenceDate.toISOString().split("T")[0]} marked completed`
    );

    await logAudit(toAuditActor(ctx), "COMPLETE_TASK", "Task", task.id, {
      occurrenceAssigneeId: full.id,
      occurrenceDate: full.occurrence.occurrenceDate.toISOString().split("T")[0],
      pendingApproval: needsApproval,
    });

    if (needsApproval && task.approverId) {
      await NotificationService.create({
        userId: task.approverId,
        title: "Task pending approval",
        message: `${task.title} — ${full.occurrence.occurrenceDate.toISOString().split("T")[0]} submitted by ${full.assignee.firstName} ${full.assignee.lastName}`,
        type: "TASK_PENDING_APPROVAL",
        priority: "HIGH",
        referenceType: "TASK",
        referenceId: task.id,
      }, "taskReminder", true);

      await logActivity(
        task.id,
        ctx.id,
        ACTIVITY_TYPE.TASK_PENDING_APPROVAL,
        `Occurrence submitted for approval`
      );
    }

    return updated;
  }

  async approveOccurrence(occurrenceAssigneeId, userId) {
    const ctx = await loadUserContext(userId);
    const full = await this._getAssigneeRecordById(occurrenceAssigneeId);
    if (!full) throw ApiError.notFound("Occurrence assignment not found");

    const task = full.occurrence.task;
    await assertTaskAccess(ctx, task);

    const isDesignatedApprover = task.approverId === ctx.id;
    const isCompanyAdmin = isMainAdmin(ctx) && task.companyId === ctx.companyId;
    const isPlatformAdmin = isSuperAdmin(ctx);

    if (!isDesignatedApprover && !isCompanyAdmin && !isPlatformAdmin) {
      throw ApiError.forbidden("Only the designated approver or company admin can approve this occurrence");
    }

    if (full.status !== "PENDING_APPROVAL") {
      throw ApiError.badRequest("Only occurrences pending approval can be approved");
    }

    const updated = await TaskOccurrenceRepository.updateAssigneeRecord(full.id, {
      status: "APPROVED",
      approvedById: ctx.id,
      approvedAt: new Date(),
      rejectionReason: null,
    });

    await logActivity(task.id, ctx.id, ACTIVITY_TYPE.TASK_APPROVED, `Occurrence approved`);

    await logAudit(toAuditActor(ctx), "APPROVE_TASK", "Task", task.id, {
      occurrenceAssigneeId: full.id,
      assigneeId: full.assigneeId,
    });

    await NotificationService.create({
      userId: full.assigneeId,
      title: "Task approved",
      message: `Your submission for "${task.title}" was approved`,
      type: "TASK_APPROVED",
      priority: "MEDIUM",
      referenceType: "TASK",
      referenceId: task.id,
    }, "taskReminder", true);

    return updated;
  }

  async rejectOccurrence(occurrenceAssigneeId, data, userId) {
    const ctx = await loadUserContext(userId);
    const full = await this._getAssigneeRecordById(occurrenceAssigneeId);
    if (!full) throw ApiError.notFound("Occurrence assignment not found");

    const task = full.occurrence.task;
    await assertTaskAccess(ctx, task);

    const isDesignatedApprover = task.approverId === ctx.id;
    const isCompanyAdmin = isMainAdmin(ctx) && task.companyId === ctx.companyId;
    const isPlatformAdmin = isSuperAdmin(ctx);

    if (!isDesignatedApprover && !isCompanyAdmin && !isPlatformAdmin) {
      throw ApiError.forbidden("Only the designated approver or company admin can reject this occurrence");
    }

    if (full.status !== "PENDING_APPROVAL") {
      throw ApiError.badRequest("Only occurrences pending approval can be rejected");
    }

    const updated = await TaskOccurrenceRepository.updateAssigneeRecord(full.id, {
      status: "REJECTED",
      approvedById: ctx.id,
      approvedAt: new Date(),
      rejectionReason: data.reason || "Rejected by approver",
      submittedAt: null,
      completedAt: null,
      progress: data.progress != null ? Number(data.progress) : 0,
    });

    await logActivity(
      task.id,
      ctx.id,
      ACTIVITY_TYPE.TASK_REJECTED,
      `Occurrence rejected: ${data.reason || "No reason provided"}`
    );

    await logAudit(toAuditActor(ctx), "REJECT_TASK", "Task", task.id, {
      occurrenceAssigneeId: full.id,
      assigneeId: full.assigneeId,
      reason: data.reason || null,
    });

    await NotificationService.create({
      userId: full.assigneeId,
      title: "Task rejected — rework required",
      message: `Your submission for "${task.title}" was rejected. ${data.reason || ""}`.trim(),
      type: "TASK_REJECTED",
      priority: "HIGH",
      referenceType: "TASK",
      referenceId: task.id,
    }, "taskReminder", true);

    return updated;
  }

  async resubmitOccurrence(occurrenceAssigneeId, userId) {
    const ctx = await loadUserContext(userId);
    const full = await this._getAssigneeRecordById(occurrenceAssigneeId);
    if (!full) throw ApiError.notFound("Occurrence assignment not found");

    if (isEmployee(ctx) && full.assigneeId !== ctx.id) {
      throw ApiError.forbidden("You can only resubmit your own assignment");
    }

    if (full.status !== "REJECTED") {
      throw ApiError.badRequest("Only rejected occurrences can be resubmitted");
    }

    return TaskOccurrenceRepository.updateAssigneeRecord(full.id, {
      status: "IN_PROGRESS",
      progress: 0,
      completedAt: null,
      submittedAt: null,
      approvedById: null,
      approvedAt: null,
      rejectionReason: null,
    });
  }

  async _getAssigneeRecordById(id) {
    const prisma = (await import("../config/database.js")).default;
    return prisma.taskOccurrenceAssignee.findUnique({
      where: { id },
      include: {
        occurrence: {
          include: {
            task: {
              include: {
                approver: { select: { id: true, firstName: true, lastName: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }
}

export default new TaskOccurrenceService();
