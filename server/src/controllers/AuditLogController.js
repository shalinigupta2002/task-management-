import AuditLogService from "../services/AuditLogService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class AuditLogController {
  getAll = asyncHandler(async (req, res) => {
    const result = await AuditLogService.getAll(req.validatedQuery || req.query, req.user);
    return ApiResponse.paginated(res, result.items, result.meta);
  });
}

export default new AuditLogController();
