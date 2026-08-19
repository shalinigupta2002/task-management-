import { Router } from "express";
import DashboardController from "../controllers/DashboardController.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { dashboardQuerySchema } from "../validators/notification.validators.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard notification and activity summary
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Dashboard summary — unread messages, notifications, online users, reminders, overdue
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadMessages: { type: integer }
 *                 unreadNotifications: { type: integer }
 *                 onlineUsers: { type: array }
 *                 todayReminders: { type: integer }
 *                 overdueTasks: { type: integer }
 */
router.get("/", validate(dashboardQuerySchema, "query"), DashboardController.getSummary);

export default router;
