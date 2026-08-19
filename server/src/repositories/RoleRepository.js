import prisma from "../config/database.js";
import BaseRepository from "./BaseRepository.js";
import { handlePrismaError } from "../utils/prismaError.js";

class RoleRepository extends BaseRepository {
  constructor() {
    super("role", {
      searchFields: ["name", "description"],
      sortFields: ["name", "createdAt", "status"],
      defaultSort: "name",
    });
  }

  async findAll(query) {
    return super.findAll(query, {}, {
      _count: { select: { users: true, permissions: true } },
      permissions: { include: { permission: true } },
    });
  }

  async findById(id) {
    return super.findById(id, {
      permissions: { include: { permission: true } },
      _count: { select: { users: true } },
    });
  }

  async findByName(name) {
    return this.client.findFirst({
      where: { name, ...this.notDeleted() },
    });
  }

  async assignPermissions(roleId, permissionIds) {
    try {
      await prisma.rolePermission.deleteMany({ where: { roleId } });
      if (permissionIds?.length) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
          skipDuplicates: true,
        });
      }
      return this.findById(roleId);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

export default new RoleRepository();
