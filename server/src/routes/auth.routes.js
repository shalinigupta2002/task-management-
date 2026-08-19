import { Router } from "express";
import AuthService from "../services/AuthService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middlewares/validate.middleware.js";
import { loginRateLimit } from "../middlewares/rateLimit.middleware.js";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and obtain JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  loginRateLimit,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.validatedBody.email, req.validatedBody.password);
    return ApiResponse.success(res, result, "Login successful");
  })
);

export default router;
