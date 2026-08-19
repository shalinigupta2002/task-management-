import { Router } from "express";
import TaskOccurrenceController from "../controllers/TaskOccurrenceController.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  taskCalendarQuerySchema,
  taskIdParamSchema,
  idParamSchema,
  occurrenceProgressSchema,
  occurrenceRejectSchema,
} from "../validators/task.validators.js";

const router = Router();

router.use(authenticate);

router.get("/calendar", validate(taskCalendarQuerySchema, "query"), TaskOccurrenceController.getCalendar);
router.get("/task/:taskId", validate(taskIdParamSchema, "params"), TaskOccurrenceController.getByTask);
router.patch("/:id/progress", validate(idParamSchema, "params"), validate(occurrenceProgressSchema), TaskOccurrenceController.updateProgress);
router.post("/:id/complete", validate(idParamSchema, "params"), TaskOccurrenceController.complete);
router.post("/:id/approve", validate(idParamSchema, "params"), TaskOccurrenceController.approve);
router.post("/:id/reject", validate(idParamSchema, "params"), validate(occurrenceRejectSchema), TaskOccurrenceController.reject);
router.post("/:id/resubmit", validate(idParamSchema, "params"), TaskOccurrenceController.resubmit);

export default router;
