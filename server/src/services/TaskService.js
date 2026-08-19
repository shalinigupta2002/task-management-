import TaskRepository from "../repositories/TaskRepository.js";
import TaskOccurrenceRepository from "../repositories/TaskOccurrenceRepository.js";
import TaskActivityRepository from "../repositories/TaskActivityRepository.js";
import NotificationService from "./NotificationService.js";
import ApiError from "../utils/ApiError.js";
import {
  loadUserContext,
  canCreateTask,
  canDeleteTask,
  canAssignTask,
  canExtendDueDateDirectly,
  assertCompanyScope,
  assertAssigneeInScope,
  assertTaskAccess,
  isEmployee,
  isSubAdmin,
  isSuperAdmin,
} from "../utils/taskAccess.js";
import { logAudit, toAuditActor } from "../utils/auditLogger.js";
import { logActivity } from "../utils/taskActivityLogger.js";
import { ACTIVITY_TYPE, TASK_STATUS } from "../constants/task.constants.js";
import {
  buildOccurrenceDates,
  resolveDurationDays,
  resolveEndDate,
} from "../utils/taskRecurrence.js";
import { resolveFrequencySchedule } from "../utils/frequencySchedule.js";
import prisma from "../config/database.js";

class TaskService {
  async validateTaskRelations(data, companyId) {
    if (data.departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: data.departmentId, deletedAt: null },
      });
      if (!dept) throw ApiError.badRequest("Department not found");
      if (dept.companyId !== companyId) {
        throw ApiError.forbidden("Department does not belong to the target company");
      }
    }

    if (data.categoryId) {
      const cat = await prisma.taskCategory.findFirst({
        where: { id: data.categoryId, deletedAt: null },
      });
      if (!cat) throw ApiError.badRequest("Task category not found");
      if (cat.companyId !== companyId) {
        throw ApiError.forbidden("Task category does not belong to the target company");
      }
    }
  }

  buildScope(ctx) {
    if (isSuperAdmin(ctx)) return {};
    if (isEmployee(ctx)) {
      return {
        assignments: { some: { assignedToId: ctx.id, status: { not: "CANCELLED" } } },
      };
    }
    if (isSubAdmin(ctx)) {
      return {
        OR: [
          { departmentId: ctx.departmentId },
          { assignments: { some: { assignedToId: ctx.id } } },
        ],
      };
    }
    return { companyId: ctx.companyId };
  }

  async getAll(query, userId) {
    const ctx = await loadUserContext(userId);
    const q = { ...query };
    if (!q.companyId && ctx.companyId && !isSuperAdmin(ctx)) q.companyId = ctx.companyId;
    if (q.companyId) await assertCompanyScope(ctx, q.companyId);

    const scope = this.buildScope(ctx);
    return TaskRepository.findAll(q, scope);
  }

  async getById(id, userId) {
    const task = await TaskRepository.findById(id);
    if (!task) throw ApiError.notFound("Task not found");
    const ctx = await loadUserContext(userId);
    await assertTaskAccess(ctx, task);
    return task;
  }

  async create(data, userId) {
    const ctx = await loadUserContext(userId);
    if (!canCreateTask(ctx)) throw ApiError.forbidden("You cannot create tasks");

    if (ctx.roleName !== "SUPER_ADMIN") {
      data.companyId = ctx.companyId;
    } else {
      if (!data.companyId) throw ApiError.badRequest("companyId is required for Super Admin");
    }

    await assertCompanyScope(ctx, data.companyId);
    await this.validateTaskRelations(data, data.companyId);

    if (isSubAdmin(ctx) && data.departmentId && data.departmentId !== ctx.departmentId) {
      throw ApiError.forbidden("Sub Admin can only create tasks for their department");
    }

    const {
      assignedToId,
      assignedToIds = [],
      approverId,
      durationDays,
      endDate,
      recurrenceType,
      ...taskFields
    } = data;

    const assigneeIds = [
      ...new Set(
        [...(Array.isArray(assignedToIds) ? assignedToIds : []), assignedToId].filter(Boolean)
      ),
    ];

    if (assigneeIds.length === 0) {
      throw ApiError.badRequest("At least one assignee is required");
    }

    if (approverId) {
      const approver = await assertAssigneeInScope(ctx, approverId, data.companyId);
      if (approver.id === ctx.id && isEmployee(ctx)) {
        throw ApiError.badRequest("Invalid approver");
      }
    }

    const startDate = taskFields.startDate ? new Date(taskFields.startDate) : null;
    let resolvedEndDate = endDate ? new Date(endDate) : null;
    let resolvedDuration = durationDays != null ? Number(durationDays) : null;
    let resolvedRecurrenceType = recurrenceType || "ONE_TIME";
    let resolvedIntervalDays = 1;

    if (taskFields.frequencyId) {
      const frequency = await prisma.taskFrequency.findFirst({
        where: { id: taskFields.frequencyId, deletedAt: null },
      });
      if (!frequency) throw ApiError.badRequest("Selected frequency was not found");
      if (frequency.status === "INACTIVE") {
        throw ApiError.badRequest("Selected frequency is inactive");
      }

      const schedule = resolveFrequencySchedule(frequency, {
        recurrenceType: resolvedRecurrenceType,
        durationDays: resolvedDuration,
      });
      resolvedRecurrenceType = schedule.recurrenceType;
      if (resolvedDuration == null && schedule.durationDays != null) {
        resolvedDuration = schedule.durationDays;
      }
      resolvedIntervalDays = schedule.intervalDays;
    }

    resolvedEndDate = resolveEndDate({ startDate, endDate: resolvedEndDate, durationDays: resolvedDuration });
    resolvedDuration = resolveDurationDays({
      startDate,
      endDate: resolvedEndDate,
      durationDays: resolvedDuration,
    });

    if (startDate && resolvedEndDate && resolvedEndDate < startDate) {
      throw ApiError.badRequest("End date cannot be before start date");
    }

    if (resolvedDuration != null && resolvedDuration < 1) {
      throw ApiError.badRequest("Duration must be at least 1 day");
    }

    let createdTaskId;
    await prisma.$transaction(async (tx) => {
      const taskCode = await TaskRepository.generateTaskCode(data.companyId, tx);

      const task = await TaskRepository.create({
        ...taskFields,
        taskCode,
        createdById: ctx.id,
        updatedById: ctx.id,
        departmentId: taskFields.departmentId || ctx.departmentId,
        approverId: approverId || null,
        durationDays: resolvedDuration,
        endDate: resolvedEndDate,
        dueDate: taskFields.dueDate || resolvedEndDate,
        recurrenceType: resolvedRecurrenceType,
      }, tx);

      createdTaskId = task.id;

      await logActivity(task.id, ctx.id, ACTIVITY_TYPE.TASK_CREATED, `Task "${task.title}" created`, tx);

      for (const assigneeId of assigneeIds) {
        await this._createAssignment(task.id, assigneeId, ctx, { skipCancel: true, tx, skipAudit: true });
      }

      await logAudit(
        toAuditActor(ctx),
        "CREATE_TASK",
        "Task",
        task.id,
        { title: task.title, taskCode: task.taskCode },
        tx
      );
      await logAudit(
        toAuditActor(ctx),
        "ASSIGN_TASK",
        "Task",
        task.id,
        { assigneeIds },
        tx
      );

      const occurrenceDates = buildOccurrenceDates({
        recurrenceType: resolvedRecurrenceType,
        startDate,
        endDate: resolvedEndDate,
        durationDays: resolvedDuration,
        intervalDays: resolvedIntervalDays,
      });

      if (occurrenceDates.length === 0) {
        throw ApiError.badRequest("Could not generate task schedule — check start date, end date and duration");
      }

      await TaskOccurrenceRepository.createManyForTask(task.id, occurrenceDates, assigneeIds, tx);
    }, {
      timeout: 60000
    });

    return TaskRepository.findById(createdTaskId);
  }

  async _createAssignment(taskId, assignedToId, ctx, { skipCancel = false, tx = prisma, skipAudit = false } = {}) {
    const task = await tx.task.findFirst({ where: { id: taskId, deletedAt: null } });
    if (!task) throw ApiError.notFound("Task not found");
    const assignee = await assertAssigneeInScope(ctx, assignedToId, task.companyId, tx);

    if (!skipCancel) {
      await TaskRepository.cancelActiveAssignments(taskId, tx);
    } else {
      const existing = await tx.taskAssignment.findFirst({
        where: { taskId, assignedToId, status: { not: "CANCELLED" } },
      });
      if (existing) return existing;
    }

    const assignment = await TaskRepository.createAssignment({
      taskId,
      assignedById: ctx.id,
      assignedToId,
      status: "PENDING",
    }, tx);

    await TaskRepository.update(taskId, { updatedById: ctx.id }, tx);

    await logActivity(
      taskId,
      ctx.id,
      ACTIVITY_TYPE.TASK_ASSIGNED,
      `Task assigned to ${assignee.firstName} ${assignee.lastName}`,
      tx
    );

    await NotificationService.create({
      userId: assignedToId,
      title: "New task assigned",
      message: `You have been assigned: ${task.title}`,
      type: "TASK_ASSIGNED",
      priority: "MEDIUM",
      referenceType: "TASK",
      referenceId: taskId,
    }, "taskReminder", true);

    return assignment;
  }

  async update(id, data, userId) {
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(id);
    await assertTaskAccess(ctx, task);

    if (isEmployee(ctx)) {
      throw ApiError.forbidden("Employees cannot update task details");
    }

    if (isSubAdmin(ctx)) {
      const canEdit = task.departmentId === ctx.departmentId
        || task.createdById === ctx.id;
      if (!canEdit) throw ApiError.forbidden("Sub Admin can only edit department tasks");
    }

    delete data.companyId;
    await this.validateTaskRelations(data, task.companyId);

    const updated = await TaskRepository.update(id, { ...data, updatedById: ctx.id });
    await logActivity(id, ctx.id, ACTIVITY_TYPE.TASK_UPDATED, `Task "${updated.title}" updated`);
    return updated;
  }

  async remove(id, userId) {
    const ctx = await loadUserContext(userId);
    if (!canDeleteTask(ctx)) throw ApiError.forbidden("You cannot delete tasks");

    const task = await TaskRepository.findById(id);
    await assertTaskAccess(ctx, task);

    await logActivity(id, ctx.id, ACTIVITY_TYPE.TASK_UPDATED, `Task "${task.title}" deleted (soft)`);
    return TaskRepository.softDelete(id);
  }

  async assignTask(id, data, userId) {
    const ctx = await loadUserContext(userId);
    if (!canAssignTask(ctx)) throw ApiError.forbidden("You cannot assign tasks");

    const task = await TaskRepository.findById(id);
    await assertTaskAccess(ctx, task);

    const ids = data.assignedToIds?.length
      ? data.assignedToIds
      : data.assignedToId
        ? [data.assignedToId]
        : [];

    if (!ids.length) throw ApiError.badRequest("At least one assignee is required");

    const assignments = [];
    for (const assignedToId of ids) {
      assignments.push(await this._createAssignment(id, assignedToId, ctx, { skipCancel: true }));
    }

    await logAudit(toAuditActor(ctx), "ASSIGN_TASK", "Task", id, { assigneeIds: ids });

    return assignments.length === 1 ? assignments[0] : assignments;
  }

  async reassignTask(id, data, userId) {
    const ctx = await loadUserContext(userId);
    if (!canAssignTask(ctx)) throw ApiError.forbidden("You cannot reassign tasks");

    const task = await TaskRepository.findById(id);
    await assertTaskAccess(ctx, task);

    const assignee = await assertAssigneeInScope(ctx, data.assignedToId, task.companyId);

    await TaskRepository.cancelActiveAssignments(id);

    const assignment = await TaskRepository.createAssignment({
      taskId: id,
      assignedById: ctx.id,
      assignedToId: data.assignedToId,
      status: "PENDING",
    });

    await TaskRepository.update(id, { updatedById: ctx.id });

    const reason = data.reason ? ` — ${data.reason}` : "";
    await logActivity(
      id,
      ctx.id,
      ACTIVITY_TYPE.TASK_REASSIGNED,
      `Task reassigned to ${assignee.firstName} ${assignee.lastName}${reason}`
    );

    await logAudit(toAuditActor(ctx), "ASSIGN_TASK", "Task", id, {
      assignedToId: data.assignedToId,
      type: "reassign",
    });

    return assignment;
  }

  async changeStatus(id, data, userId) {
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(id);
    await assertTaskAccess(ctx, task);

    const oldStatus = task.status;
    const newStatus = data.status;

    if (oldStatus === newStatus) throw ApiError.badRequest("Task is already in this status");

    const updateData = { status: newStatus, updatedById: ctx.id };
    if (data.actualHours !== undefined) updateData.actualHours = data.actualHours;

    if (newStatus === TASK_STATUS.COMPLETED) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const updated = await TaskRepository.update(id, updateData);

    await TaskRepository.createStatusHistory({
      taskId: id,
      oldStatus,
      newStatus,
      changedById: ctx.id,
    });

    await logActivity(
      id,
      ctx.id,
      ACTIVITY_TYPE.STATUS_CHANGED,
      `Status changed from ${oldStatus} to ${newStatus}`
    );

    if (newStatus === TASK_STATUS.COMPLETED) {
      await logActivity(id, ctx.id, ACTIVITY_TYPE.TASK_COMPLETED, `Task "${task.title}" completed`);
      await logAudit(toAuditActor(ctx), "COMPLETE_TASK", "Task", id, {
        previousStatus: oldStatus,
        title: task.title,
      });
    }

    return updated;
  }

  async extendDueDate(id, data, userId) {
    const ctx = await loadUserContext(userId);
    if (!canExtendDueDateDirectly(ctx)) {
      throw ApiError.forbidden("Use extension request workflow or contact Main Admin");
    }

    const task = await TaskRepository.findById(id);
    await assertTaskAccess(ctx, task);

    if (new Date(data.dueDate) <= new Date()) {
      throw ApiError.badRequest("New due date must be in the future");
    }

    const updated = await TaskRepository.update(id, {
      dueDate: data.dueDate,
      updatedById: ctx.id,
    });

    await logActivity(
      id,
      ctx.id,
      ACTIVITY_TYPE.DUE_DATE_EXTENDED,
      `Due date extended to ${new Date(data.dueDate).toISOString().split("T")[0]} — ${data.reason}`
    );

    return updated;
  }

  async getActivities(id, query, userId) {
    const ctx = await loadUserContext(userId);
    const task = await TaskRepository.findById(id);
    await assertTaskAccess(ctx, task);
    return TaskActivityRepository.findByTask(id, query);
  }

  async getDashboardStats(query, userId) {
    const ctx = await loadUserContext(userId);
    const filters = {};

    if (query.companyId) {
      await assertCompanyScope(ctx, query.companyId);
      filters.companyId = query.companyId;
    } else if (ctx.companyId && !isSuperAdmin(ctx)) {
      filters.companyId = ctx.companyId;
    }

    if (query.departmentId) {
      filters.departmentId = query.departmentId;
    } else if (isSubAdmin(ctx)) {
      filters.departmentId = ctx.departmentId;
    } else if (isEmployee(ctx)) {
      filters.assignments = { some: { assignedToId: ctx.id, status: { not: "CANCELLED" } } };
    }

    return TaskRepository.getDashboardStats(filters);
  }
}

export default new TaskService();
