import { Router } from "express";
import prisma from "../config/database.js";
import companyRoutes from "./company.routes.js";
import departmentRoutes from "./department.routes.js";
import userRoutes from "./user.routes.js";
import roleRoutes from "./role.routes.js";
import subscriptionRoutes from "./subscription.routes.js";
import taskRoutes from "./task.routes.js";
import taskCategoryRoutes from "./taskCategory.routes.js";
import taskFrequencyRoutes from "./taskFrequency.routes.js";
import taskCommentRoutes from "./taskComment.routes.js";
import taskAttachmentRoutes from "./taskAttachment.routes.js";
import taskExtensionRoutes from "./taskExtension.routes.js";
import taskOccurrenceRoutes from "./taskOccurrence.routes.js";
import conversationRoutes from "./conversation.routes.js";
import messageRoutes from "./message.routes.js";
import notificationRoutes from "./notification.routes.js";
import preferenceRoutes from "./preference.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import auditLogRoutes from "./auditLog.routes.js";
import reportRoutes from "./report.routes.js";
import onboardingRoutes from "./onboarding.routes.js";

const router = Router();

router.use("/company", companyRoutes);
router.use("/department", departmentRoutes);
router.use("/user", userRoutes);
router.use("/role", roleRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/public/onboarding", onboardingRoutes);
router.use("/tasks", taskRoutes);
router.use("/task-categories", taskCategoryRoutes);
router.use("/task-frequency", taskFrequencyRoutes);
router.use("/task-comments", taskCommentRoutes);
router.use("/task-attachments", taskAttachmentRoutes);
router.use("/task-extension", taskExtensionRoutes);
router.use("/task-occurrences", taskOccurrenceRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/preferences", preferenceRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/reports", reportRoutes);

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: "TaskFlow API is running",
      version: "1.0.0",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      success: false,
      message: "Service unavailable",
      database: "disconnected",
    });
  }
});

export default router;
