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

  getManagedUsers = asyncHandler(async (req, res) => {
    const result = await UserService.getManagedUsers(req.validatedQuery || req.query, req.user);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getMe = asyncHandler(async (req, res) => {
    const user = await UserService.getMe(req.user);
    return ApiResponse.success(res, user);
  });

  updateMe = asyncHandler(async (req, res) => {
    const user = await UserService.updateMe(req.validatedBody || req.body, req.user);
    return ApiResponse.success(res, user, "Profile updated successfully");
  });

  createEmployee = asyncHandler(async (req, res) => {
    const user = await UserService.createEmployee(req.validatedBody || req.body, req.user);
    return ApiResponse.created(res, user, "Employee created successfully");
  });

  createSubAdmin = asyncHandler(async (req, res) => {
    const user = await UserService.createSubAdmin(req.validatedBody || req.body, req.user);
    return ApiResponse.created(res, user, "Sub Admin created successfully");
  });

  previewEmployeeCode = asyncHandler(async (req, res) => {
    const roleName = req.validatedQuery?.roleName || req.query.roleName || "EMPLOYEE";
    const preview = await UserService.previewEmployeeCode(roleName, req.user);
    return ApiResponse.success(res, preview);
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
