import { ROLES } from "../constants/index.js";
import ApiError from "./ApiError.js";

export async function loadUserContext(userId) {
  const prisma = (await import("../config/database.js")).default;
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { role: { select: { name: true } } },
  });
  if (!user) throw ApiError.unauthorized("User not found");
  return { ...user, roleName: user.role.name };
}

export function isSuperAdmin(ctx) {
  return ctx.roleName === ROLES.SUPER_ADMIN;
}

export function isMainAdmin(ctx) {
  return ctx.roleName === ROLES.MAIN_ADMIN;
}

export function isSubAdmin(ctx) {
  return ctx.roleName === ROLES.SUB_ADMIN;
}

export function isEmployee(ctx) {
  return ctx.roleName === ROLES.EMPLOYEE;
}

export function canCreateTask(ctx) {
  return isSuperAdmin(ctx) || isMainAdmin(ctx) || isSubAdmin(ctx);
}

export function canDeleteTask(ctx) {
  return isSuperAdmin(ctx) || isMainAdmin(ctx) || isSubAdmin(ctx);
}

export function canAssignTask(ctx) {
  return isSuperAdmin(ctx) || isMainAdmin(ctx) || isSubAdmin(ctx);
}

export function canApproveExtension(ctx) {
  return isSuperAdmin(ctx) || isMainAdmin(ctx);
}

export function canExtendDueDateDirectly(ctx) {
  return isSuperAdmin(ctx) || isMainAdmin(ctx);
}

export async function assertCompanyScope(ctx, companyId) {
  if (isSuperAdmin(ctx)) return;
  if (!ctx.companyId || ctx.companyId !== companyId) {
    throw ApiError.forbidden("Access denied to this company resource");
  }
}

export async function assertAssigneeInScope(ctx, assigneeId, targetCompanyId = null, tx = null) {
  const prisma = (await import("../config/database.js")).default;
  const db = tx || prisma;
  const assignee = await db.user.findFirst({
    where: { id: assigneeId, deletedAt: null, status: "ACTIVE" },
  });
  if (!assignee) throw ApiError.badRequest("Assignee not found");

  const expectedCompanyId = targetCompanyId || ctx.companyId;
  if (expectedCompanyId && assignee.companyId !== expectedCompanyId) {
    throw ApiError.forbidden("Assignee does not belong to the target company");
  }

  if (!isSuperAdmin(ctx)) {
    if (isSubAdmin(ctx) && assignee.departmentId !== ctx.departmentId) {
      throw ApiError.forbidden("Sub Admin can only assign department employees");
    }
  }
  return assignee;
}

export async function assertTaskAccess(ctx, task) {
  if (!task || task.deletedAt) throw ApiError.notFound("Task not found");
  if (isSuperAdmin(ctx)) return task;
  if (ctx.companyId !== task.companyId) throw ApiError.forbidden("Access denied");

  if (isMainAdmin(ctx)) return task;

  const prisma = (await import("../config/database.js")).default;

  if (isSubAdmin(ctx)) {
    if (task.departmentId && task.departmentId !== ctx.departmentId) {
      const assigned = await prisma.taskAssignment.findFirst({
        where: { taskId: task.id, assignedToId: ctx.id },
      });
      if (!assigned) throw ApiError.forbidden("Access denied to this task");
    }
    return task;
  }

  if (isEmployee(ctx)) {
    const assigned = await prisma.taskAssignment.findFirst({
      where: { taskId: task.id, assignedToId: ctx.id, status: { not: "CANCELLED" } },
    });
    if (!assigned) throw ApiError.forbidden("You are not assigned to this task");
    return task;
  }

  throw ApiError.forbidden("Access denied");
}

/** Assert IDOR/cross-tenant safety for any company-scoped resource */
export function assertResourceAccess(ctx, resource, companyIdField = "companyId") {
  if (!resource) throw ApiError.notFound("Resource not found");
  if (isSuperAdmin(ctx)) return;
  if (!ctx.companyId || resource[companyIdField] !== ctx.companyId) {
    throw ApiError.forbidden("Access denied to this resource");
  }
}

export default {
  loadUserContext,
  canCreateTask,
  canDeleteTask,
  canAssignTask,
  canApproveExtension,
  assertCompanyScope,
  assertAssigneeInScope,
  assertTaskAccess,
  assertResourceAccess,
};
