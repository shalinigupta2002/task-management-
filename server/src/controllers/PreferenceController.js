import PreferenceService from "../services/PreferenceService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class PreferenceController {
  get = asyncHandler(async (req, res) => {
    const preferences = await PreferenceService.get(req.user.userId);
    return ApiResponse.success(res, preferences);
  });

  update = asyncHandler(async (req, res) => {
    const preferences = await PreferenceService.update(
      req.user.userId,
      req.validatedBody || req.body
    );
    return ApiResponse.success(res, preferences, "Preferences updated successfully");
  });
}

export default new PreferenceController();
