import {
  parsePagination,
  buildPaginationMeta,
  parseSort,
  buildSearchFilter,
  stripListQueryParams,
} from "../utils/pagination.js";
import { handlePrismaError } from "../utils/prismaError.js";
import { getPrisma } from "../config/database.js";
import config from "../config/index.js";

export default class BaseRepository {
  constructor(model, { searchFields = [], sortFields = ["createdAt"], defaultSort = "createdAt" } = {}) {
    this.model = model;
    this.searchFields = searchFields;
    this.sortFields = sortFields;
    this.defaultSort = defaultSort;
  }

  get client() {
    return getPrisma()[this.model];
  }

  notDeleted() {
    return { deletedAt: null };
  }

  buildWhere(query = {}, extraFilters = {}) {
    const { search, status } = query;
    const where = { ...this.notDeleted(), ...extraFilters };

    if (status) where.status = status;
    Object.assign(where, buildSearchFilter(search, this.searchFields));

    const filterParams = stripListQueryParams(query);
    for (const [key, value] of Object.entries(filterParams)) {
      if (value !== undefined && value !== "") where[key] = value;
    }

    return where;
  }

  async findAll(query = {}, extraFilters = {}, include = undefined) {
    try {
      const prisma = getPrisma();
      const { page, limit, skip } = parsePagination(query);
      const where = this.buildWhere(query, extraFilters);
      const orderBy = parseSort(query, this.sortFields, this.defaultSort);

      if (config.env !== "production") {
        console.debug("[BaseRepository.findAll]", {
          model: this.model,
          where,
          orderBy,
          skip,
          take: limit,
        });
      }

      const [items, total] = await Promise.all([
        prisma[this.model].findMany({ where, skip, take: limit, orderBy, include }),
        prisma[this.model].count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id, include = undefined, tx) {
    try {
      const db = tx || getPrisma();
      return await db[this.model].findFirst({
        where: { id, ...this.notDeleted() },
        include,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async create(data, include = undefined, tx) {
    try {
      const db = tx || getPrisma();
      return await db[this.model].create({ data, include });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id, data, include = undefined, tx) {
    try {
      const db = tx || getPrisma();
      return await db[this.model].update({
        where: { id },
        data,
        include,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async softDelete(id, tx) {
    try {
      const db = tx || getPrisma();
      return await db[this.model].update({
        where: { id },
        data: { deletedAt: new Date(), status: "INACTIVE" },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async hardDelete(id, tx) {
    try {
      const db = tx || getPrisma();
      return await db[this.model].delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
