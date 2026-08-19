import prisma from "../config/database.js";
import BaseRepository from "./BaseRepository.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(prisma.auditLog);
  }

  async findAll(query) {
    const { companyId, userId, action, from, to, sortBy, sortOrder } = query;
    const { page, limit, skip } = parsePagination(query);

    const where = {};
    if (companyId) where.companyId = companyId;
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: "insensitive" };
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    const orderField = sortBy === "action" ? "action" : "timestamp";

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder || "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}

export default new AuditLogRepository();
