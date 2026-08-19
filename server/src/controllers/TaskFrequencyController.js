import TaskFrequencyService from "../services/TaskFrequencyService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class TaskFrequencyController {
  getAll = asyncHandler(async (req, res) => {
    const result = await TaskFrequencyService.getAll(req.validatedQuery || req.query);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const frequency = await TaskFrequencyService.getById(req.validatedParams?.id || req.params.id);
    return ApiResponse.success(res, frequency);
  });

  create = asyncHandler(async (req, res) => {
    const frequency = await TaskFrequencyService.create(req.validatedBody || req.body, req.user.userId);
    return ApiResponse.created(res, frequency, "Task frequency created successfully");
  });

  update = asyncHandler(async (req, res) => {
    const frequency = await TaskFrequencyService.update(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, frequency, "Task frequency updated successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await TaskFrequencyService.remove(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Task frequency deleted successfully");
  });
}

export default new TaskFrequencyController();
