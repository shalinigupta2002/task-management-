import RoleRepository from "../repositories/RoleRepository.js";
import ApiError from "../utils/ApiError.js";

class RoleService {
  async getAll(query) {
    return RoleRepository.findAll(query);
  }

  async getById(id) {
    const role = await RoleRepository.findById(id);
    if (!role) throw ApiError.notFound("Role not found");
    return role;
  }

  async create(data) {
    const existing = await RoleRepository.findByName(data.name);
    if (existing) throw ApiError.conflict("Role already exists");

    const { permissionIds, ...roleData } = data;
    const role = await RoleRepository.create(roleData);

    if (permissionIds?.length) {
      return RoleRepository.assignPermissions(role.id, permissionIds);
    }
    return role;
  }

  async update(id, data) {
    await this.getById(id);
    const { permissionIds, ...roleData } = data;

    const role = await RoleRepository.update(id, roleData);

    if (permissionIds !== undefined) {
      return RoleRepository.assignPermissions(id, permissionIds);
    }
    return role;
  }

  async remove(id) {
    const role = await this.getById(id);
    if (role._count?.users > 0) {
      throw ApiError.badRequest("Cannot delete role assigned to users");
    }
    return RoleRepository.softDelete(id);
  }
}

export default new RoleService();
