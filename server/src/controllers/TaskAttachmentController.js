import TaskAttachmentService from "../services/TaskAttachmentService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class TaskAttachmentController {
  getAll = asyncHandler(async (req, res) => {
    const result = await TaskAttachmentService.getAll(req.validatedQuery || req.query, req.user.userId);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const attachment = await TaskAttachmentService.getById(
      req.validatedParams?.id || req.params.id,
      req.user.userId
    );
    return ApiResponse.success(res, attachment);
  });

  create = asyncHandler(async (req, res) => {
    const attachment = await TaskAttachmentService.create(req.validatedBody || req.body, req.user.userId);
    return ApiResponse.created(res, attachment, "Attachment uploaded successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await TaskAttachmentService.remove(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Attachment deleted successfully");
  });
}

export default new TaskAttachmentController();
