import { getPrisma } from "../config/database.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { handlePrismaError } from "../utils/prismaError.js";

class TaskActivityRepository {
  async findByTask(taskId, query = {}) {
    try {
      const prisma = getPrisma();
      const { page, limit, skip } = parsePagination(query);
      const where = { taskId };

      const [items, total] = await Promise.all([
        prisma.taskActivity.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            performedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.taskActivity.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async create(data, include = undefined, tx) {
    try {
      const db = tx || getPrisma();
      return await db.taskActivity.create({
        data,
        include: include || {
          performedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

export default new TaskActivityRepository();
