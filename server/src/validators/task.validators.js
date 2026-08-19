import { z } from "zod";

const entityStatus = z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]);
const uuid = z.string().uuid("Invalid UUID");
const taskStatus = z.enum([
  "OPEN", "IN_PROGRESS", "COMPLETED", "PENDING_APPROVAL", "APPROVED", "REJECTED", "OVERDUE", "CANCELLED",
]);
const recurrenceType = z.enum(["ONE_TIME", "DAILY", "WEEKLY", "MONTHLY"]);
const taskPriority = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const extensionStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const taskPaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  categoryId: uuid.optional(),
  frequencyId: uuid.optional(),
  departmentId: uuid.optional(),
  companyId: uuid.optional(),
  assignedToId: uuid.optional(),
  dueDateFrom: z.coerce.date().optional(),
  dueDateTo: z.coerce.date().optional(),
  /** Structured due-date windows — prefer over raw date ranges for summary filters */
  dueWindow: z.enum(["nearingDue", "today", "overdue"]).optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
});

export const taskCategoryCreateSchema = z.object({
  categoryName: z.string().min(2).max(150),
  categoryCode: z
    .string()
    .min(1, "Category code is required")
    .max(20)
    .transform((v) => v.trim().toUpperCase())
    .pipe(z.string().min(2).max(20).regex(/^[A-Z0-9-]+$/)),
  description: z.string().max(1000).optional().nullable(),
  status: entityStatus.optional(),
  companyId: uuid,
  departmentId: uuid.optional().nullable(),
});

export const taskCategoryUpdateSchema = taskCategoryCreateSchema.omit({ companyId: true }).partial();

export const taskCategoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  status: entityStatus.optional(),
  companyId: uuid.optional(),
  departmentId: uuid.optional(),
});

export const taskFrequencyCreateSchema = z.object({
  frequencyName: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Half Yearly", "Yearly", "Custom"]),
  daysInterval: z.coerce.number().int().positive(),
  numberOfDays: z.coerce.number().int().positive("Number of days must be a positive whole number"),
  description: z.string().max(500).optional().nullable(),
  status: entityStatus.optional(),
});

export const taskFrequencyUpdateSchema = taskFrequencyCreateSchema.partial();

export const taskFrequencyQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const taskBaseSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().max(5000).optional().nullable(),
  priority: taskPriority.optional(),
  status: taskStatus.optional(),
  startDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  estimatedHours: z.coerce.number().nonnegative().optional().nullable(),
  actualHours: z.coerce.number().nonnegative().optional().nullable(),
  categoryId: uuid.optional().nullable(),
  frequencyId: uuid.optional().nullable(),
  companyId: uuid,
  departmentId: uuid.optional().nullable(),
  assignedToId: uuid.optional(),
  assignedToIds: z.array(uuid).min(1).optional(),
  approverId: uuid.optional().nullable(),
  durationDays: z.coerce.number().int().positive().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  recurrenceType: recurrenceType.optional(),
});

export const taskCreateSchema = taskBaseSchema
  .extend({ assignedToIds: z.array(uuid).min(1).optional() })
  .refine((d) => {
    const hasAssignee = d.assignedToId || (d.assignedToIds && d.assignedToIds.length > 0);
    return hasAssignee;
  }, { message: "At least one assignee is required", path: ["assignedToIds"] })
  .refine((d) => !d.dueDate || !d.startDate || d.dueDate >= d.startDate, {
    message: "dueDate must be on or after startDate",
    path: ["dueDate"],
  })
  .refine((d) => !d.endDate || !d.startDate || d.endDate >= d.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const taskUpdateSchema = taskBaseSchema.omit({ companyId: true }).partial();

export const taskAssignSchema = z.object({
  assignedToId: uuid.optional(),
  assignedToIds: z.array(uuid).min(1).optional(),
}).refine((d) => d.assignedToId || (d.assignedToIds && d.assignedToIds.length > 0), {
  message: "At least one assignee is required",
  path: ["assignedToIds"],
});

export const taskReassignSchema = z.object({
  assignedToId: uuid,
  reason: z.string().max(500).optional(),
});

export const taskStatusChangeSchema = z.object({
  status: taskStatus,
  actualHours: z.coerce.number().nonnegative().optional(),
});

export const taskExtendDueDateSchema = z.object({
  dueDate: z.coerce.date(),
  reason: z.string().min(5).max(1000),
});

export const taskCommentCreateSchema = z.object({
  taskId: uuid,
  comment: z.string().min(1).max(5000),
});

export const taskCommentUpdateSchema = z.object({
  comment: z.string().min(1).max(5000),
});

export const taskCommentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  taskId: uuid.optional(),
});

export const taskAttachmentCreateSchema = z.object({
  taskId: uuid,
  fileName: z.string().min(1).max(255),
  originalName: z.string().min(1).max(255),
  fileType: z.string().min(1).max(100),
  fileSize: z.coerce.number().int().positive().max(52428800),
  fileUrl: z.string().url().or(z.string().min(1)),
});

export const taskAttachmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  taskId: uuid.optional(),
});

export const extensionCreateSchema = z.object({
  taskId: uuid,
  requestedDueDate: z.coerce.date(),
  reason: z.string().min(10).max(2000),
});

export const extensionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  taskId: uuid.optional(),
  status: extensionStatus.optional(),
  companyId: uuid.optional(),
});

export const dashboardQuerySchema = z.object({
  companyId: uuid.optional(),
  departmentId: uuid.optional(),
});

export const idParamSchema = z.object({ id: uuid });

export const taskIdParamSchema = z.object({ taskId: uuid });

export const extensionIdParamSchema = z.object({ id: uuid });

export const taskCalendarQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  assigneeId: uuid.optional(),
  approverId: uuid.optional(),
  status: z.enum([
    "PENDING", "OPEN", "IN_PROGRESS", "COMPLETED", "PENDING_APPROVAL",
    "APPROVED", "REJECTED", "OVERDUE", "CANCELLED",
  ]).optional(),
  companyId: uuid.optional(),
  departmentId: uuid.optional(),
});

export const occurrenceProgressSchema = z.object({
  progress: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS"]).optional(),
});

export const occurrenceRejectSchema = z.object({
  reason: z.string().min(3).max(2000),
  progress: z.coerce.number().min(0).max(100).optional(),
});
