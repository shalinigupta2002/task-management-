import prisma from "../config/database.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { handlePrismaError } from "../utils/prismaError.js";

const include = {
  task: { select: { id: true, title: true, taskCode: true, dueDate: true, companyId: true } },
  requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true } },
};

class ExtensionRepository {
  async findAll(query) {
    try {
      const { page, limit, skip } = parsePagination(query);
      const where = {};
      if (query.taskId) where.taskId = query.taskId;
      if (query.status) where.status = query.status;
      if (query.companyId) where.task = { companyId: query.companyId };

      const [items, total] = await Promise.all([
        prisma.extensionRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include,
        }),
        prisma.extensionRequest.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id) {
    try {
      return await prisma.extensionRequest.findUnique({ where: { id }, include });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findPendingByTask(taskId) {
    return prisma.extensionRequest.findFirst({
      where: { taskId, status: "PENDING" },
    });
  }

  async create(data) {
    try {
      return await prisma.extensionRequest.create({ data, include });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id, data) {
    try {
      return await prisma.extensionRequest.update({ where: { id }, data, include });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

export default new ExtensionRepository();
