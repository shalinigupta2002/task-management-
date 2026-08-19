import TaskCategoryService from "../services/TaskCategoryService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class TaskCategoryController {
  getAll = asyncHandler(async (req, res) => {
    const result = await TaskCategoryService.getAll(req.validatedQuery || req.query, req.user.userId);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const category = await TaskCategoryService.getById(
      req.validatedParams?.id || req.params.id,
      req.user.userId
    );
    return ApiResponse.success(res, category);
  });

  create = asyncHandler(async (req, res) => {
    const category = await TaskCategoryService.create(req.validatedBody || req.body, req.user.userId);
    return ApiResponse.created(res, category, "Task category created successfully");
  });

  update = asyncHandler(async (req, res) => {
    const category = await TaskCategoryService.update(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, category, "Task category updated successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await TaskCategoryService.remove(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Task category deleted successfully");
  });
}

export default new TaskCategoryController();
