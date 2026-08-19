import prisma from "../config/database.js";
import MessageRepository from "../repositories/MessageRepository.js";
import NotificationRepository from "../repositories/NotificationRepository.js";
import OnlineUserRepository from "../repositories/OnlineUserRepository.js";
import { loadUserContext, isSuperAdmin } from "../utils/taskAccess.js";
import ApiError from "../utils/ApiError.js";

class DashboardService {
  async getSummary(userId, query = {}) {
    const ctx = await loadUserContext(userId);
    let companyId = query.companyId || ctx.companyId;

    if (query.companyId && !isSuperAdmin(ctx) && ctx.companyId !== query.companyId) {
      throw ApiError.forbidden("Access denied to this company");
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const taskWhere = { deletedAt: null, ...(companyId ? { companyId } : {}) };

    if (ctx.roleName === "EMPLOYEE") {
      taskWhere.assignments = {
        some: { assignedToId: ctx.id, status: { not: "CANCELLED" } },
      };
    } else if (ctx.roleName === "SUB_ADMIN" && ctx.departmentId) {
      taskWhere.departmentId = ctx.departmentId;
    }

    const [unreadMessages, unreadNotifications, overdueTasks, todayReminders, onlineUsers] =
      await Promise.all([
        MessageRepository.countUnread(userId),
        NotificationRepository.countUnread(userId),
        prisma.task.count({
          where: {
            ...taskWhere,
            status: { notIn: ["COMPLETED", "CANCELLED"] },
            dueDate: { lt: now },
          },
        }),
        prisma.task.count({
          where: {
            ...taskWhere,
            status: { notIn: ["COMPLETED", "CANCELLED"] },
            dueDate: { gte: todayStart, lt: todayEnd },
          },
        }),
        companyId
          ? OnlineUserRepository.findOnlineByCompany(companyId)
          : Promise.resolve([]),
      ]);

    return {
      unreadMessages,
      unreadNotifications,
      onlineUsers,
      todayReminders,
      overdueTasks,
    };
  }
}

export default new DashboardService();
