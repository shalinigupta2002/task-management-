import { Router } from "express";
import ExtensionController from "../controllers/ExtensionController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  extensionCreateSchema,
  extensionQuerySchema,
  idParamSchema,
} from "../validators/task.validators.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Task Extension
 *   description: Due date extension request workflow
 */

/**
 * @swagger
 * /task-extension:
 *   get:
 *     summary: List extension requests
 *     tags: [Task Extension]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: taskId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED] }
 *       - in: query
 *         name: companyId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated extension request list
 */
router.get("/", validate(extensionQuerySchema, "query"), ExtensionController.getAll);

/**
 * @swagger
 * /task-extension/{id}:
 *   get:
 *     summary: Get extension request by ID
 *     tags: [Task Extension]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Extension request details
 */
router.get("/:id", validate(idParamSchema, "params"), ExtensionController.getById);

/**
 * @swagger
 * /task-extension:
 *   post:
 *     summary: Submit due date extension request
 *     tags: [Task Extension]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskId, requestedDueDate, reason]
 *             properties:
 *               taskId: { type: string, format: uuid }
 *               requestedDueDate: { type: string, format: date-time }
 *               reason: { type: string }
 *     responses:
 *       201:
 *         description: Extension request submitted
 */
router.post("/", validate(extensionCreateSchema), ExtensionController.create);

/**
 * @swagger
 * /task-extension/{id}/approve:
 *   patch:
 *     summary: Approve extension request (Main Admin)
 *     tags: [Task Extension]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Extension approved
 */
router.patch(
  "/:id/approve",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(idParamSchema, "params"),
  ExtensionController.approve
);

/**
 * @swagger
 * /task-extension/{id}/reject:
 *   patch:
 *     summary: Reject extension request (Main Admin)
 *     tags: [Task Extension]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Extension rejected
 */
router.patch(
  "/:id/reject",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(idParamSchema, "params"),
  ExtensionController.reject
);

export default router;
