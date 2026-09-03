import BaseRepository from "./BaseRepository.js";
import { handlePrismaError } from "../utils/prismaError.js";
import { sanitizeForLog } from "../utils/sanitize.js";

const userInclude = {
  role: { select: { id: true, name: true, description: true } },
  company: { select: { id: true, companyName: true, companyCode: true } },
  department: { select: { id: true, departmentName: true, departmentCode: true } },
};

class UserRepository extends BaseRepository {
  constructor() {
    super("user", {
      searchFields: ["firstName", "lastName", "email", "employeeId", "designation"],
      sortFields: ["firstName", "lastName", "email", "createdAt", "lastLogin", "status"],
      defaultSort: "createdAt",
    });
  }

  async findAll(query) {
    const { companyId, departmentId, roleId, roleName, roleNames, excludeId, ...rest } = query;
    const extra = {};
    if (companyId) extra.companyId = companyId;
    if (departmentId) extra.departmentId = departmentId;
    if (roleId) extra.roleId = roleId;
    if (Array.isArray(roleNames) && roleNames.length > 0) {
      extra.role = { name: { in: roleNames } };
    } else if (roleName) {
      extra.role = { name: roleName };
    }
    if (excludeId) extra.id = { not: excludeId };

    const result = await super.findAll(rest, extra, userInclude);
    return result;
  }

  async findById(id) {
    return super.findById(id, {
      ...userInclude,
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    });
  }

  async findByEmail(email) {
    try {
      const normalized = String(email || "").trim().toLowerCase();
      return await this.client.findFirst({
        where: { email: { equals: normalized, mode: "insensitive" }, ...this.notDeleted() },
        include: userInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findByEmailWithPassword(email) {
    try {
      const normalized = String(email || "").trim().toLowerCase();
      return await this.client.findFirst({
        where: { email: { equals: normalized, mode: "insensitive" }, ...this.notDeleted() },
        include: { role: true, company: true },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findByEmployeeIdInCompany(companyId, employeeId) {
    if (!companyId || !employeeId) return null;
    try {
      return await this.client.findFirst({
        where: {
          companyId,
          employeeId,
          ...this.notDeleted(),
        },
        include: userInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async create(data, include = userInclude, tx) {
    return super.create(data, include ?? userInclude, tx);
  }

  async update(id, data, include = userInclude, tx) {
    return super.update(id, data, include ?? userInclude, tx);
  }

  async updateLastLogin(id) {
    try {
      return await this.client.update({
        where: { id },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      console.error("[UserRepository.updateLastLogin Error]", sanitizeForLog(error?.message || error));
    }
  }
}

export default new UserRepository();
