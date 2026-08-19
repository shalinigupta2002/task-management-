import { Router } from "express";
import RoleController from "../controllers/RoleController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  roleCreateSchema,
  roleUpdateSchema,
  roleQuerySchema,
  idParamSchema,
} from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role & permission management
 */

router.get("/", validate(roleQuerySchema, "query"), RoleController.getAll);
router.get("/:id", validate(idParamSchema, "params"), RoleController.getById);
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN),
  validate(roleCreateSchema),
  RoleController.create
);
router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate(idParamSchema, "params"),
  validate(roleUpdateSchema),
  RoleController.update
);
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate(idParamSchema, "params"),
  RoleController.remove
);

export default router;
