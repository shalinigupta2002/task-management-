import { Router } from "express";
import ConversationController from "../controllers/ConversationController.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  conversationCreateSchema,
  conversationQuerySchema,
  idParamSchema,
} from "../validators/chat.validators.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: One-to-one chat conversations
 */

/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: List user conversations
 *     tags: [Conversations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: companyId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Paginated conversation list
 */
router.get("/", validate(conversationQuerySchema, "query"), ConversationController.getAll);

/**
 * @swagger
 * /conversations/{id}:
 *   get:
 *     summary: Get conversation by ID
 *     tags: [Conversations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Conversation details
 */
router.get("/:id", validate(idParamSchema, "params"), ConversationController.getById);

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Create or resume a direct conversation
 *     tags: [Conversations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otherUserId]
 *             properties:
 *               otherUserId: { type: string, format: uuid }
 *               initialMessage: { type: string }
 *     responses:
 *       201:
 *         description: Conversation created
 */
router.post("/", validate(conversationCreateSchema), ConversationController.create);

export default router;
