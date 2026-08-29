import { Router } from "express";
import UserController from "../controllers/UserController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  userCreateSchema,
  userUpdateSchema,
  userQuerySchema,
  employeeCreateSchema,
  subAdminCreateSchema,
  managedUserQuerySchema,
  userSelfUpdateSchema,
  employeeCodePreviewQuerySchema,
  idParamSchema,
} from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/** Current authenticated user profile */
router.get("/me", UserController.getMe);
router.patch("/me", validate(userSelfUpdateSchema), UserController.updateMe);

/** Preview next auto-generated employee / sub-admin code */
router.get(
  "/employee-code-preview",
  authorize(ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(employeeCodePreviewQuerySchema, "query"),
  UserController.previewEmployeeCode
);

/** Employee Management — always EMPLOYEE role (must be registered before /:id) */
router.get(
  "/employees",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(userQuerySchema, "query"),
  UserController.getEmployees
);

router.post(
  "/employees",
  authorize(ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(employeeCreateSchema),
  UserController.createEmployee
);

/** Sub Admin Management — always SUB_ADMIN role; company from auth */
router.post(
  "/sub-admins",
  authorize(ROLES.MAIN_ADMIN),
  validate(subAdminCreateSchema),
  UserController.createSubAdmin
);

/** Main Admin User List — SUB_ADMIN + EMPLOYEE only; excludes self / MAIN_ADMIN / SUPER_ADMIN */
router.get(
  "/managed",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(managedUserQuerySchema, "query"),
  UserController.getManagedUsers
);

router.get("/", validate(userQuerySchema, "query"), UserController.getAll);
router.get("/:id", validate(idParamSchema, "params"), UserController.getById);
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(userCreateSchema),
  UserController.create
);
router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN),
  validate(idParamSchema, "params"),
  validate(userUpdateSchema),
  UserController.update
);
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(idParamSchema, "params"),
  UserController.remove
);

export default router;
