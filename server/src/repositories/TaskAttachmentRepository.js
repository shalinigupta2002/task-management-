import prisma from "../config/database.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { handlePrismaError } from "../utils/prismaError.js";

class TaskAttachmentRepository {
  async findAll(query) {
    try {
      const { page, limit, skip } = parsePagination(query);
      const where = { deletedAt: null };
      if (query.taskId) where.taskId = query.taskId;

      const [items, total] = await Promise.all([
        prisma.taskAttachment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.taskAttachment.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id) {
    try {
      return await prisma.taskAttachment.findFirst({
        where: { id, deletedAt: null },
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          task: { select: { id: true, title: true, taskCode: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async create(data) {
    try {
      return await prisma.taskAttachment.create({
        data,
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async softDelete(id) {
    try {
      return await prisma.taskAttachment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

export default new TaskAttachmentRepository();
