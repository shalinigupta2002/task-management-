import { Router } from "express";
import TaskCategoryController from "../controllers/TaskCategoryController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  taskCategoryCreateSchema,
  taskCategoryUpdateSchema,
  taskCategoryQuerySchema,
  idParamSchema,
} from "../validators/task.validators.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Task Categories
 *   description: Task category management per company
 */

/**
 * @swagger
 * /task-categories:
 *   get:
 *     summary: List task categories
 *     tags: [Task Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema: { type: string, format: uuid }
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
 *         description: Paginated category list
 */
router.get("/", validate(taskCategoryQuerySchema, "query"), TaskCategoryController.getAll);

/**
 * @swagger
 * /task-categories/{id}:
 *   get:
 *     summary: Get task category by ID
 *     tags: [Task Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category details
 */
router.get("/:id", validate(idParamSchema, "params"), TaskCategoryController.getById);

/**
 * @swagger
 * /task-categories:
 *   post:
 *     summary: Create task category
 *     tags: [Task Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryName, companyId]
 *             properties:
 *               categoryName: { type: string }
 *               description: { type: string }
 *               color: { type: string }
 *               companyId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(taskCategoryCreateSchema),
  TaskCategoryController.create
);

/**
 * @swagger
 * /task-categories/{id}:
 *   patch:
 *     summary: Update task category
 *     tags: [Task Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category updated
 */
router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(idParamSchema, "params"),
  validate(taskCategoryUpdateSchema),
  TaskCategoryController.update
);

/**
 * @swagger
 * /task-categories/{id}:
 *   delete:
 *     summary: Soft delete task category
 *     tags: [Task Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(idParamSchema, "params"),
  TaskCategoryController.remove
);

export default router;
