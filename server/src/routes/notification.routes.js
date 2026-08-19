import { Router } from "express";
import NotificationController from "../controllers/NotificationController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  notificationCreateSchema,
  notificationQuerySchema,
  idParamSchema,
} from "../validators/notification.validators.js";
import { ROLES } from "../constants/index.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notifications
 */

/**
 * @swagger
 * /notifications/count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get("/count", NotificationController.count);

/**
 * @swagger
 * /notifications/unread:
 *   get:
 *     summary: List unread notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Unread notifications
 */
router.get("/unread", validate(notificationQuerySchema, "query"), NotificationController.getUnread);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: List all notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated notifications
 */
router.get("/", validate(notificationQuerySchema, "query"), NotificationController.getAll);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notification details
 */
router.get("/:id", validate(idParamSchema, "params"), NotificationController.getById);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a system notification (admin)
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, message, type]
 *             properties:
 *               userId: { type: string, format: uuid }
 *               title: { type: string }
 *               message: { type: string }
 *               type: { type: string }
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(notificationCreateSchema),
  NotificationController.create
);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All marked read
 */
router.patch("/read-all", NotificationController.markAllRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Marked read
 */
router.patch("/:id/read", validate(idParamSchema, "params"), NotificationController.markRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete("/:id", validate(idParamSchema, "params"), NotificationController.remove);

export default router;
