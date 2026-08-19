import TaskService from "../services/TaskService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class TaskController {
  getAll = asyncHandler(async (req, res) => {
    const result = await TaskService.getAll(req.validatedQuery || req.query, req.user.userId);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await TaskService.getDashboardStats(req.validatedQuery || req.query, req.user.userId);
    return ApiResponse.success(res, stats);
  });

  getById = asyncHandler(async (req, res) => {
    const task = await TaskService.getById(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, task);
  });

  create = asyncHandler(async (req, res) => {
    const task = await TaskService.create(req.validatedBody || req.body, req.user.userId);
    return ApiResponse.created(res, task, "Task created successfully");
  });

  update = asyncHandler(async (req, res) => {
    const task = await TaskService.update(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, task, "Task updated successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await TaskService.remove(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Task deleted successfully");
  });

  assign = asyncHandler(async (req, res) => {
    const assignment = await TaskService.assignTask(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, assignment, "Task assigned successfully");
  });

  reassign = asyncHandler(async (req, res) => {
    const assignment = await TaskService.reassignTask(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, assignment, "Task reassigned successfully");
  });

  changeStatus = asyncHandler(async (req, res) => {
    const task = await TaskService.changeStatus(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, task, "Task status updated successfully");
  });

  extendDueDate = asyncHandler(async (req, res) => {
    const task = await TaskService.extendDueDate(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, task, "Due date extended successfully");
  });

  getActivities = asyncHandler(async (req, res) => {
    const result = await TaskService.getActivities(
      req.validatedParams?.id || req.params.id,
      req.validatedQuery || req.query,
      req.user.userId
    );
    return ApiResponse.paginated(res, result.items, result.meta);
  });
}

export default new TaskController();
