import prisma from "../config/database.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { handlePrismaError } from "../utils/prismaError.js";

class NotificationRepository {
  buildWhere(query, userId) {
    const where = { userId };
    if (query.type) where.type = query.type;
    if (query.isRead !== undefined) where.isRead = query.isRead;
    return where;
  }

  async findAll(userId, query = {}) {
    try {
      const { page, limit, skip } = parsePagination(query);
      const where = this.buildWhere(query, userId);

      const [items, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.notification.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findUnread(userId, query = {}) {
    return this.findAll(userId, { ...query, isRead: false });
  }

  async findById(id) {
    try {
      return await prisma.notification.findUnique({ where: { id } });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async create(data) {
    try {
      return await prisma.notification.create({ data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async existsDuplicate(userId, type, referenceType, referenceId, since) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type,
        referenceType,
        referenceId,
        createdAt: since ? { gte: since } : undefined,
      },
    });
    return !!existing;
  }

  async markRead(id, userId) {
    try {
      return await prisma.notification.updateMany({
        where: { id, userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async markAllRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async countUnread(userId) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async remove(id, userId) {
    try {
      return await prisma.notification.deleteMany({ where: { id, userId } });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

export default new NotificationRepository();
