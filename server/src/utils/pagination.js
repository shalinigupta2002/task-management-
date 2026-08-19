import config from "../config/index.js";
import { DEFAULT_PAGE, MAX_LIMIT } from "../constants/index.js";

export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || config.pagination.defaultLimit)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/** Query keys consumed by list endpoints — must not be passed to Prisma where clauses. */
export const LIST_QUERY_KEYS = new Set([
  "page",
  "limit",
  "sortBy",
  "sortOrder",
  "search",
  "status",
  // Task-list-only filters (shared pagination schema) — invalid on category/frequency models
  "priority",
  "categoryId",
  "frequencyId",
  "assignedToId",
  "dueDateFrom",
  "dueDateTo",
  "dueWindow",
  "startDateFrom",
  "startDateTo",
  "roleName",
  "roleId",
]);

export function stripListQueryParams(query = {}) {
  const filters = {};
  for (const [key, value] of Object.entries(query)) {
    if (!LIST_QUERY_KEYS.has(key)) filters[key] = value;
  }
  return filters;
}

export function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function parseSort(query, allowedFields, defaultField = "createdAt") {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
  return { [sortBy]: sortOrder };
}

export function buildSearchFilter(search, fields) {
  if (!search?.trim()) return {};
  const q = search.trim();
  return {
    OR: fields.map((field) => ({
      [field]: { contains: q, mode: "insensitive" },
    })),
  };
}

export default { parsePagination, buildPaginationMeta, parseSort, buildSearchFilter, stripListQueryParams, LIST_QUERY_KEYS };
