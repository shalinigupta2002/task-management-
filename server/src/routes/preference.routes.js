import { Router } from "express";
import PreferenceController from "../controllers/PreferenceController.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { preferenceUpdateSchema } from "../validators/notification.validators.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Notification Preferences
 *   description: User notification preference settings
 */

/**
 * @swagger
 * /preferences:
 *   get:
 *     summary: Get notification preferences
 *     tags: [Notification Preferences]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User preferences
 */
router.get("/", PreferenceController.get);

/**
 * @swagger
 * /preferences:
 *   patch:
 *     summary: Update notification preferences
 *     tags: [Notification Preferences]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskReminder: { type: boolean }
 *               overdueReminder: { type: boolean }
 *               messageNotification: { type: boolean }
 *               systemNotification: { type: boolean }
 *               emailNotification: { type: boolean }
 *               inAppNotification: { type: boolean }
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.patch("/", validate(preferenceUpdateSchema), PreferenceController.update);

export default router;
