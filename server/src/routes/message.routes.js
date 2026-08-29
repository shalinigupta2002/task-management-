import { Router } from "express";
import MessageController from "../controllers/MessageController.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  messageCreateSchema,
  messageUpdateSchema,
  messageQuerySchema,
  markMessagesReadSchema,
  idParamSchema,
} from "../validators/chat.validators.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Chat messages and attachments
 */

/**
 * @swagger
 * /messages/unread-count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get("/unread-count", MessageController.unreadCount);

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Search and list messages
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated messages
 */
router.get("/", validate(messageQuerySchema, "query"), MessageController.getAll);

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Message details
 */
router.get("/:id", validate(idParamSchema, "params"), MessageController.getById);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message (text or attachment metadata)
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId, message]
 *             properties:
 *               conversationId: { type: string, format: uuid }
 *               message: { type: string }
 *               messageType: { type: string, enum: [TEXT, IMAGE, VIDEO, PDF, DOCX, EXCEL] }
 *               attachmentUrl: { type: string }
 *               attachmentName: { type: string }
 *               attachmentSize: { type: integer }
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post("/", validate(messageCreateSchema), MessageController.send);

/**
 * @swagger
 * /messages/mark-read:
 *   patch:
 *     summary: Mark messages as read (read receipt)
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId]
 *             properties:
 *               conversationId: { type: string, format: uuid }
 *               messageIds: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Messages marked read
 */
router.patch("/mark-read", validate(markMessagesReadSchema), MessageController.markRead);
/** Compatibility alias — older clients used POST */
router.post("/mark-read", validate(markMessagesReadSchema), MessageController.markRead);

/**
 * @swagger
 * /messages/{id}:
 *   patch:
 *     summary: Edit own message
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Message updated
 */
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(messageUpdateSchema),
  MessageController.update
);

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     summary: Delete own message (soft delete)
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete("/:id", validate(idParamSchema, "params"), MessageController.remove);

export default router;
