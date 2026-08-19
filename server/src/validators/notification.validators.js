import { z } from "zod";

const uuid = z.string().uuid("Invalid UUID");
const notificationType = z.enum([
  "TASK_ASSIGNED", "TASK_UPDATED", "TASK_COMPLETED", "TASK_REMINDER",
  "DUE_TODAY", "OVERDUE", "EXTENSION_REQUESTED", "EXTENSION_APPROVED",
  "EXTENSION_REJECTED", "NEW_MESSAGE", "SYSTEM",
]);
const notificationPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const referenceType = z.enum(["TASK", "MESSAGE", "EXTENSION", "CONVERSATION", "SYSTEM"]);

export const notificationCreateSchema = z.object({
  userId: uuid,
  title: z.string().min(1).max(300),
  message: z.string().min(1).max(5000),
  type: notificationType,
  priority: notificationPriority.optional(),
  referenceType: referenceType.optional().nullable(),
  referenceId: uuid.optional().nullable(),
});

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  type: notificationType.optional(),
  isRead: z.coerce.boolean().optional(),
});

export const preferenceUpdateSchema = z.object({
  taskReminder: z.boolean().optional(),
  overdueReminder: z.boolean().optional(),
  messageNotification: z.boolean().optional(),
  systemNotification: z.boolean().optional(),
  emailNotification: z.boolean().optional(),
  inAppNotification: z.boolean().optional(),
});

export const dashboardQuerySchema = z.object({
  companyId: uuid.optional(),
});

export const idParamSchema = z.object({ id: uuid });
