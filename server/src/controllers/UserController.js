import UserService from "../services/UserService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class UserController {
  getAll = asyncHandler(async (req, res) => {
    const result = await UserService.getAll(req.validatedQuery || req.query, req.user);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getEmployees = asyncHandler(async (req, res) => {
    const result = await UserService.getEmployees(req.validatedQuery || req.query, req.user);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  createEmployee = asyncHandler(async (req, res) => {
    const user = await UserService.createEmployee(req.validatedBody || req.body, req.user);
    return ApiResponse.created(res, user, "Employee created successfully");
  });

  getById = asyncHandler(async (req, res) => {
    const user = await UserService.getById(req.validatedParams?.id || req.params.id, req.user);
    return ApiResponse.success(res, user);
  });

  create = asyncHandler(async (req, res) => {
    const user = await UserService.create(req.validatedBody || req.body, req.user);
    return ApiResponse.created(res, user, "User created successfully");
  });

  update = asyncHandler(async (req, res) => {
    const user = await UserService.update(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user
    );
    return ApiResponse.success(res, user, "User updated successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await UserService.remove(req.validatedParams?.id || req.params.id, req.user);
    return ApiResponse.success(res, null, "User deleted successfully");
  });
}

export default new UserController();
