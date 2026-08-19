import prisma from "../config/database.js";
import BaseRepository from "./BaseRepository.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";

class ReportRepository extends BaseRepository {
  constructor() {
    super(prisma.report);
  }

  async findAll(query) {
    const { companyId, type, period, sortBy, sortOrder } = query;
    const { page, limit, skip } = parsePagination(query);

    const where = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (type) where.type = { contains: type, mode: "insensitive" };
    if (period) where.period = { contains: period, mode: "insensitive" };

    const orderField = ["createdAt", "name", "type", "period"].includes(sortBy) ? sortBy : "createdAt";

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder || "desc" },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      items,
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}

export default new ReportRepository();
