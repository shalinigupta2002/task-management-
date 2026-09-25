import { Router } from "express";
import AuthService, { loginSchema, refreshSchema } from "../services/AuthService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { loginRateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post(
  "/login",
  loginRateLimit,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const body = req.validatedBody || req.body;
    const result = await AuthService.login(body.email, body.password);
    return ApiResponse.success(res, result, "Login successful");
  })
);

router.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const body = req.validatedBody || req.body;
    const result = await AuthService.refresh(body.refreshToken);
    return ApiResponse.success(res, result, "Token refreshed");
  })
);

router.post(
  "/logout",
  authenticate,
  asyncHandler(async (req, res) => {
    await AuthService.logout(req.user.userId, {
      companyId: req.user.companyId,
      role: req.user.role,
    });
    return ApiResponse.success(res, { success: true }, "Logged out");
  })
);

export default router;
