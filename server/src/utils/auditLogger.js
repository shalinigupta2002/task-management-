import AuditLogService from "../services/AuditLogService.js";
import prisma from "../config/database.js";

export function toAuditActor(ctx) {
  return {
    companyId: ctx.companyId,
    userId: ctx.id || ctx.userId,
    role: ctx.roleName || ctx.role,
  };
}

export async function logAudit(reqOrUser, action, entity = null, entityId = null, metadata = {}, tx = null) {
  try {
    let companyId = null;
    let userId = null;
    let role = null;
    let ip = null;

    if (reqOrUser && reqOrUser.headers) {
      const user = reqOrUser.user;
      if (user) {
        companyId = user.companyId;
        userId = user.userId || user.id;
        role = user.role;
      }
      ip = reqOrUser.ip || reqOrUser.socket?.remoteAddress;
    } else if (reqOrUser) {
      companyId = reqOrUser.companyId;
      userId = reqOrUser.userId || reqOrUser.id;
      role = reqOrUser.role || reqOrUser.roleName;
    }

    const data = {
      companyId,
      userId,
      role,
      action,
      entity,
      entityId: entityId != null ? String(entityId) : null,
      ip,
      metadata: metadata || {},
    };

    const db = tx || prisma;
    await db.auditLog.create({ data });
  } catch (err) {
    console.error("Failed to log audit activity:", err.message || err);
  }
}

export default { logAudit, toAuditActor };
