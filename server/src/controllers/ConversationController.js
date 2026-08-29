import ConversationService from "../services/ConversationService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class ConversationController {
  getAll = asyncHandler(async (req, res) => {
    const result = await ConversationService.getAll(
      req.user.userId,
      req.validatedQuery || req.query
    );
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const conversation = await ConversationService.getById(
      req.validatedParams?.id || req.params.id,
      req.user.userId
    );
    return ApiResponse.success(res, conversation);
  });

  create = asyncHandler(async (req, res) => {
    const conversation = await ConversationService.create(
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.created(res, conversation, "Conversation created successfully");
  });

  getEligibleContacts = asyncHandler(async (req, res) => {
    const result = await ConversationService.getEligibleContacts(
      req.user.userId,
      req.validatedQuery || req.query
    );
    return ApiResponse.success(res, result);
  });
}

export default new ConversationController();
