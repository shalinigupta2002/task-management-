import ExtensionService from "../services/ExtensionService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class ExtensionController {
  getAll = asyncHandler(async (req, res) => {
    const result = await ExtensionService.getAll(req.validatedQuery || req.query, req.user.userId);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const ext = await ExtensionService.getById(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, ext);
  });

  create = asyncHandler(async (req, res) => {
    const ext = await ExtensionService.create(req.validatedBody || req.body, req.user.userId);
    return ApiResponse.created(res, ext, "Extension request submitted successfully");
  });

  approve = asyncHandler(async (req, res) => {
    const ext = await ExtensionService.approve(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, ext, "Extension request approved");
  });

  reject = asyncHandler(async (req, res) => {
    const ext = await ExtensionService.reject(req.validatedParams?.id || req.params.id, req.user.userId);
    return ApiResponse.success(res, ext, "Extension request rejected");
  });
}

export default new ExtensionController();
