import { Router } from "express";
import TaskController from "../controllers/TaskController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  taskPaginationSchema,
  taskCreateSchema,
  taskUpdateSchema,
  taskAssignSchema,
  taskReassignSchema,
  taskStatusChangeSchema,
  taskExtendDueDateSchema,
  dashboardQuerySchema,
  idParamSchema,
} from "../validators/task.validators.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management — CRUD, assignments, status, dashboard
 */

/**
 * @swagger
 * /tasks/dashboard/stats:
 *   get:
 *     summary: Get task dashboard statistics
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: departmentId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/dashboard/stats", validate(dashboardQuerySchema, "query"), TaskController.getDashboardStats);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List tasks with search, filter, sort, and pagination
 *     tags: [Tasks]
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
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, IN_PROGRESS, COMPLETED, OVERDUE, CANCELLED] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: frequencyId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: departmentId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: assignedToId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [dueDate, priority, createdAt, completedAt] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Paginated task list
 */
router.get("/", validate(taskPaginationSchema, "query"), TaskController.getAll);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get("/:id", validate(idParamSchema, "params"), TaskController.getById);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, companyId]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *               companyId: { type: string, format: uuid }
 *               departmentId: { type: string, format: uuid }
 *               categoryId: { type: string, format: uuid }
 *               frequencyId: { type: string, format: uuid }
 *               assignedToId: { type: string, format: uuid }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Task created
 */
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(taskCreateSchema),
  TaskController.create
);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update task details
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task updated
 */
router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(idParamSchema, "params"),
  validate(taskUpdateSchema),
  TaskController.update
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Soft delete a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(idParamSchema, "params"),
  TaskController.remove
);

/**
 * @swagger
 * /tasks/{id}/assign:
 *   post:
 *     summary: Assign task to an employee
 *     tags: [Tasks]
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
 *             required: [assignedToId]
 *             properties:
 *               assignedToId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task assigned
 */
router.post(
  "/:id/assign",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(idParamSchema, "params"),
  validate(taskAssignSchema),
  TaskController.assign
);

/**
 * @swagger
 * /tasks/{id}/reassign:
 *   post:
 *     summary: Reassign task to another employee
 *     tags: [Tasks]
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
 *             required: [assignedToId]
 *             properties:
 *               assignedToId: { type: string, format: uuid }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Task reassigned
 */
router.post(
  "/:id/reassign",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(idParamSchema, "params"),
  validate(taskReassignSchema),
  TaskController.reassign
);

/**
 * @swagger
 * /tasks/{id}/status:
 *   patch:
 *     summary: Change task status
 *     tags: [Tasks]
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [OPEN, IN_PROGRESS, COMPLETED, OVERDUE, CANCELLED] }
 *               actualHours: { type: number }
 *     responses:
 *       200:
 *         description: Status changed
 */
router.patch(
  "/:id/status",
  validate(idParamSchema, "params"),
  validate(taskStatusChangeSchema),
  TaskController.changeStatus
);

/**
 * @swagger
 * /tasks/{id}/extend-due-date:
 *   patch:
 *     summary: Directly extend task due date (Main Admin only)
 *     tags: [Tasks]
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
 *             required: [dueDate, reason]
 *             properties:
 *               dueDate: { type: string, format: date-time }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Due date extended
 */
router.patch(
  "/:id/extend-due-date",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(idParamSchema, "params"),
  validate(taskExtendDueDateSchema),
  TaskController.extendDueDate
);

/**
 * @swagger
 * /tasks/{id}/activities:
 *   get:
 *     summary: Get task activity log
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated activity list
 */
router.get("/:id/activities", validate(idParamSchema, "params"), TaskController.getActivities);

export default router;
