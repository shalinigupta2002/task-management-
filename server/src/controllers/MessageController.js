import MessageService from "../services/MessageService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class MessageController {
  getAll = asyncHandler(async (req, res) => {
    const result = await MessageService.getAll(
      req.user.userId,
      req.validatedQuery || req.query
    );
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const message = await MessageService.getById(
      req.validatedParams?.id || req.params.id,
      req.user.userId
    );
    return ApiResponse.success(res, message);
  });

  send = asyncHandler(async (req, res) => {
    const message = await MessageService.send(req.validatedBody || req.body, req.user.userId);
    return ApiResponse.created(res, message, "Message sent successfully");
  });

  update = asyncHandler(async (req, res) => {
    const message = await MessageService.update(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, message, "Message updated successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await MessageService.remove(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Message deleted successfully");
  });

  markRead = asyncHandler(async (req, res) => {
    const result = await MessageService.markRead(req.validatedBody || req.body, req.user.userId);
    return ApiResponse.success(res, result, "Messages marked as read");
  });

  unreadCount = asyncHandler(async (req, res) => {
    const result = await MessageService.getUnreadCount(req.user.userId);
    return ApiResponse.success(res, result);
  });
}

export default new MessageController();
