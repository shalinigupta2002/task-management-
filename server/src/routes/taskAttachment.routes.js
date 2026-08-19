import { Router } from "express";
import TaskAttachmentController from "../controllers/TaskAttachmentController.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  taskAttachmentCreateSchema,
  taskAttachmentQuerySchema,
  idParamSchema,
} from "../validators/task.validators.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Task Attachments
 *   description: Task file attachment metadata management
 */

/**
 * @swagger
 * /task-attachments:
 *   get:
 *     summary: List task attachments
 *     tags: [Task Attachments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: taskId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated attachment list
 */
router.get("/", validate(taskAttachmentQuerySchema, "query"), TaskAttachmentController.getAll);

/**
 * @swagger
 * /task-attachments/{id}:
 *   get:
 *     summary: Get attachment by ID
 *     tags: [Task Attachments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Attachment details
 */
router.get("/:id", validate(idParamSchema, "params"), TaskAttachmentController.getById);

/**
 * @swagger
 * /task-attachments:
 *   post:
 *     summary: Register a task attachment (metadata)
 *     tags: [Task Attachments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskId, fileName, originalName, fileType, fileSize, fileUrl]
 *             properties:
 *               taskId: { type: string, format: uuid }
 *               fileName: { type: string }
 *               originalName: { type: string }
 *               fileType: { type: string }
 *               fileSize: { type: integer }
 *               fileUrl: { type: string }
 *     responses:
 *       201:
 *         description: Attachment registered
 */
router.post("/", validate(taskAttachmentCreateSchema), TaskAttachmentController.create);

/**
 * @swagger
 * /task-attachments/{id}:
 *   delete:
 *     summary: Soft delete an attachment
 *     tags: [Task Attachments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Attachment deleted
 */
router.delete("/:id", validate(idParamSchema, "params"), TaskAttachmentController.remove);

export default router;
