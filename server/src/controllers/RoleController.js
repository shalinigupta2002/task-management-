import RoleService from "../services/RoleService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class RoleController {
  getAll = asyncHandler(async (req, res) => {
    const result = await RoleService.getAll(req.validatedQuery || req.query);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const role = await RoleService.getById(req.validatedParams?.id || req.params.id);
    return ApiResponse.success(res, role);
  });

  create = asyncHandler(async (req, res) => {
    const role = await RoleService.create(req.validatedBody || req.body);
    return ApiResponse.created(res, role, "Role created successfully");
  });

  update = asyncHandler(async (req, res) => {
    const role = await RoleService.update(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body
    );
    return ApiResponse.success(res, role, "Role updated successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await RoleService.remove(req.validatedParams?.id || req.params.id);
    return ApiResponse.success(res, null, "Role deleted successfully");
  });
}

export default new RoleController();
