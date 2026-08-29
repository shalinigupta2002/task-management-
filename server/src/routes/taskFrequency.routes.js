import { Router } from "express";
import TaskFrequencyController from "../controllers/TaskFrequencyController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  taskFrequencyCreateSchema,
  taskFrequencyUpdateSchema,
  taskFrequencyQuerySchema,
  idParamSchema,
} from "../validators/task.validators.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Task Frequency
 *   description: Task recurrence frequency definitions
 */

/**
 * @swagger
 * /task-frequency:
 *   get:
 *     summary: List task frequencies
 *     tags: [Task Frequency]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated frequency list
 */
router.get("/", validate(taskFrequencyQuerySchema, "query"), TaskFrequencyController.getAll);

/**
 * @swagger
 * /task-frequency/{id}:
 *   get:
 *     summary: Get task frequency by ID
 *     tags: [Task Frequency]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Frequency details
 */
router.get("/:id", validate(idParamSchema, "params"), TaskFrequencyController.getById);

/**
 * @swagger
 * /task-frequency:
 *   post:
 *     summary: Create task frequency
 *     tags: [Task Frequency]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [frequencyName, daysInterval]
 *             properties:
 *               frequencyName:
 *                 type: string
 *                 enum: [Daily, Weekly, Monthly, Quarterly, "Half Yearly", Yearly, Custom]
 *               daysInterval: { type: integer }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Frequency created
 */
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(taskFrequencyCreateSchema),
  TaskFrequencyController.create
);

/**
 * @swagger
 * /task-frequency/{id}:
 *   patch:
 *     summary: Update task frequency
 *     tags: [Task Frequency]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Frequency updated
 */
router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(idParamSchema, "params"),
  validate(taskFrequencyUpdateSchema),
  TaskFrequencyController.update
);

/**
 * @swagger
 * /task-frequency/{id}:
 *   delete:
 *     summary: Soft delete task frequency
 *     tags: [Task Frequency]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Frequency deleted
 */
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(idParamSchema, "params"),
  TaskFrequencyController.remove
);

export default router;
