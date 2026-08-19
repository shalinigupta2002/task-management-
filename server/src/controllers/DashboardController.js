import DashboardService from "../services/DashboardService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class DashboardController {
  getSummary = asyncHandler(async (req, res) => {
    const summary = await DashboardService.getSummary(
      req.user.userId,
      req.validatedQuery || req.query
    );
    return ApiResponse.success(res, summary);
  });
}

export default new DashboardController();
