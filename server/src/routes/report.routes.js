import { Router } from "express";
import ReportController from "../controllers/ReportController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { ROLES } from "../constants/index.js";
import {
  reportQuerySchema,
  reportCreateSchema,
  reportIdParamSchema,
} from "../validators/report.validators.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.SUB_ADMIN));

router.get("/export", ReportController.exportReport);
router.get("/", validate(reportQuerySchema, "query"), ReportController.getAll);
router.get("/:id", validate(reportIdParamSchema, "params"), ReportController.getById);
router.post("/", validate(reportCreateSchema), ReportController.create);

export default router;
