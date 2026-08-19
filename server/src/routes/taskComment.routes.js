import { Router } from "express";
import TaskCommentController from "../controllers/TaskCommentController.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  taskCommentCreateSchema,
  taskCommentUpdateSchema,
  taskCommentQuerySchema,
  idParamSchema,
} from "../validators/task.validators.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Task Comments
 *   description: Task comment management
 */

/**
 * @swagger
 * /task-comments:
 *   get:
 *     summary: List task comments
 *     tags: [Task Comments]
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
 *         description: Paginated comment list
 */
router.get("/", validate(taskCommentQuerySchema, "query"), TaskCommentController.getAll);

/**
 * @swagger
 * /task-comments/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Task Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Comment details
 */
router.get("/:id", validate(idParamSchema, "params"), TaskCommentController.getById);

/**
 * @swagger
 * /task-comments:
 *   post:
 *     summary: Add comment to a task
 *     tags: [Task Comments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskId, comment]
 *             properties:
 *               taskId: { type: string, format: uuid }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post("/", validate(taskCommentCreateSchema), TaskCommentController.create);

/**
 * @swagger
 * /task-comments/{id}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Task Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Comment updated
 */
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(taskCommentUpdateSchema),
  TaskCommentController.update
);

/**
 * @swagger
 * /task-comments/{id}:
 *   delete:
 *     summary: Soft delete a comment
 *     tags: [Task Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete("/:id", validate(idParamSchema, "params"), TaskCommentController.remove);

export default router;
