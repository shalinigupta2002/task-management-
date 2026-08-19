import { Router } from "express";
import AuditLogController from "../controllers/AuditLogController.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { ROLES } from "../constants/index.js";
import { auditLogQuerySchema } from "../validators/auditLog.validators.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), validate(auditLogQuerySchema, "query"), AuditLogController.getAll);

export default router;
