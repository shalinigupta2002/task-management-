import { Router } from "express";
import CompanyController from "../controllers/CompanyController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  companyCreateSchema,
  companyUpdateSchema,
  companyQuerySchema,
  idParamSchema,
} from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company management
 */

router.get("/", validate(companyQuerySchema, "query"), CompanyController.getAll);
router.get("/:id", validate(idParamSchema, "params"), CompanyController.getById);
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN),
  validate(companyCreateSchema),
  CompanyController.create
);
router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN),
  validate(idParamSchema, "params"),
  validate(companyUpdateSchema),
  CompanyController.update
);
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate(idParamSchema, "params"),
  CompanyController.remove
);

export default router;
