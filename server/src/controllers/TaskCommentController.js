import TaskCommentService from "../services/TaskCommentService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class TaskCommentController {
  getAll = asyncHandler(async (req, res) => {
    const result = await TaskCommentService.getAll(req.validatedQuery || req.query, req.user.userId);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const comment = await TaskCommentService.getById(
      req.validatedParams?.id || req.params.id,
      req.user.userId
    );
    return ApiResponse.success(res, comment);
  });

  create = asyncHandler(async (req, res) => {
    const comment = await TaskCommentService.create(req.validatedBody || req.body, req.user.userId);
    return ApiResponse.created(res, comment, "Comment added successfully");
  });

  update = asyncHandler(async (req, res) => {
    const comment = await TaskCommentService.update(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, comment, "Comment updated successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await TaskCommentService.remove(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Comment deleted successfully");
  });
}

export default new TaskCommentController();
