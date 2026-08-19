import prisma from "../config/database.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { handlePrismaError } from "../utils/prismaError.js";

const messageInclude = {
  sender: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
  receiver: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
};

class MessageRepository {
  buildWhere(query) {
    const where = { deletedAt: null };
    if (query.conversationId) where.conversationId = query.conversationId;
    if (query.search?.trim()) {
      where.message = { contains: query.search.trim(), mode: "insensitive" };
    }
    return where;
  }

  async findAll(query) {
    try {
      const { page, limit, skip } = parsePagination(query);
      const where = this.buildWhere(query);

      const [items, total] = await Promise.all([
        prisma.message.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: messageInclude,
        }),
        prisma.message.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id) {
    try {
      return await prisma.message.findFirst({
        where: { id, deletedAt: null },
        include: messageInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async create(data) {
    try {
      return await prisma.message.create({ data, include: messageInclude });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id, data) {
    try {
      return await prisma.message.update({ where: { id }, data, include: messageInclude });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async softDelete(id) {
    try {
      return await prisma.message.update({
        where: { id },
        data: { deletedAt: new Date(), message: "[deleted]" },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async markRead(ids, receiverId) {
    return prisma.message.updateMany({
      where: { id: { in: ids }, receiverId, isRead: false, deletedAt: null },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markConversationRead(conversationId, receiverId) {
    return prisma.message.updateMany({
      where: { conversationId, receiverId, isRead: false, deletedAt: null },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async countUnread(receiverId) {
    return prisma.message.count({
      where: { receiverId, isRead: false, deletedAt: null },
    });
  }

  async countUnreadByConversation(conversationId, receiverId) {
    return prisma.message.count({
      where: { conversationId, receiverId, isRead: false, deletedAt: null },
    });
  }
}

export default new MessageRepository();
