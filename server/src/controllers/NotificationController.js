import NotificationService from "../services/NotificationService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class NotificationController {
  getAll = asyncHandler(async (req, res) => {
    const result = await NotificationService.getAll(
      req.user.userId,
      req.validatedQuery || req.query
    );
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getUnread = asyncHandler(async (req, res) => {
    const result = await NotificationService.getUnread(
      req.user.userId,
      req.validatedQuery || req.query
    );
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const notification = await NotificationService.getById(
      req.validatedParams?.id || req.params.id,
      req.user.userId
    );
    return ApiResponse.success(res, notification);
  });

  create = asyncHandler(async (req, res) => {
    const notification = await NotificationService.create(
      req.validatedBody || req.body,
      "system",
      true
    );
    return ApiResponse.created(res, notification, "Notification created successfully");
  });

  markRead = asyncHandler(async (req, res) => {
    const result = await NotificationService.markRead(
      req.validatedParams?.id || req.params.id,
      req.user.userId
    );
    return ApiResponse.success(res, result, "Notification marked as read");
  });

  markAllRead = asyncHandler(async (req, res) => {
    const result = await NotificationService.markAllRead(req.user.userId);
    return ApiResponse.success(res, result, "All notifications marked as read");
  });

  count = asyncHandler(async (req, res) => {
    const result = await NotificationService.getCount(req.user.userId);
    return ApiResponse.success(res, result);
  });

  remove = asyncHandler(async (req, res) => {
    await NotificationService.remove(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Notification deleted successfully");
  });
}

export default new NotificationController();
