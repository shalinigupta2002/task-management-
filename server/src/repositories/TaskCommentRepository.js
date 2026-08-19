import prisma from "../config/database.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { handlePrismaError } from "../utils/prismaError.js";

class TaskCommentRepository {
  async findAll(query) {
    try {
      const { page, limit, skip } = parsePagination(query);
      const where = { deletedAt: null };
      if (query.taskId) where.taskId = query.taskId;

      const [items, total] = await Promise.all([
        prisma.taskComment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        }),
        prisma.taskComment.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id) {
    try {
      return await prisma.taskComment.findFirst({
        where: { id, deletedAt: null },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          task: { select: { id: true, title: true, taskCode: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async create(data) {
    try {
      return await prisma.taskComment.create({
        data,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id, data) {
    try {
      return await prisma.taskComment.update({
        where: { id },
        data,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async softDelete(id) {
    try {
      return await prisma.taskComment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

export default new TaskCommentRepository();
