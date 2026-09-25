import BaseRepository from "./BaseRepository.js";
import { getPrisma } from "../config/database.js";
import { handlePrismaError } from "../utils/prismaError.js";
import {
  parsePagination,
  buildPaginationMeta,
  parseSort,
  buildSearchFilter,
} from "../utils/pagination.js";

class TaskFrequencyRepository extends BaseRepository {
  constructor() {
    super("taskFrequency", {
      searchFields: ["frequencyName", "description"],
      sortFields: ["frequencyName", "daysInterval", "numberOfDays", "createdAt", "status"],
      defaultSort: "frequencyName",
    });
  }

  async findAll(query = {}) {
    try {
      const prisma = getPrisma();
      const { page, limit, skip } = parsePagination(query);
      const orderBy = parseSort(query, this.sortFields, this.defaultSort);

      const and = [{ deletedAt: null }];
      if (query.status) and.push({ status: query.status });

      const search = buildSearchFilter(query.search, this.searchFields);
      if (search?.OR) and.push(search);

      if (query.companyScopeId) {
        and.push({
          OR: [{ companyId: null }, { companyId: query.companyScopeId }],
        });
      } else if (Object.prototype.hasOwnProperty.call(query, "companyId")) {
        and.push({ companyId: query.companyId });
      }

      const where = { AND: and };

      const [items, total] = await Promise.all([
        prisma.taskFrequency.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: { _count: { select: { tasks: true } } },
        }),
        prisma.taskFrequency.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id) {
    return super.findById(id, { _count: { select: { tasks: true } } });
  }

  async findByName(frequencyName, companyId = null) {
    return this.client.findFirst({
      where: {
        frequencyName,
        companyId: companyId ?? null,
        deletedAt: null,
      },
    });
  }
}

export default new TaskFrequencyRepository();
