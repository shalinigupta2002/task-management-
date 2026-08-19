import { Router } from "express";
import DepartmentController from "../controllers/DepartmentController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  departmentCreateSchema,
  departmentUpdateSchema,
  departmentQuerySchema,
  idParamSchema,
} from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: Department management
 */

router.get("/", validate(departmentQuerySchema, "query"), DepartmentController.getAll);
router.get("/:id", validate(idParamSchema, "params"), DepartmentController.getById);
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(departmentCreateSchema),
  DepartmentController.create
);
router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(idParamSchema, "params"),
  validate(departmentUpdateSchema),
  DepartmentController.update
);
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(idParamSchema, "params"),
  DepartmentController.remove
);

export default router;
