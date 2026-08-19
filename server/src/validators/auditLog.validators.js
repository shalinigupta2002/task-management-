import { z } from "zod";
import { paginationQuerySchema } from "./index.js";

const uuid = z.string().uuid("Invalid UUID");

export const auditLogQuerySchema = paginationQuerySchema.extend({
  companyId: uuid.optional(),
  userId: uuid.optional(),
  action: z.string().max(100).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sortBy: z.enum(["timestamp", "action"]).optional(),
});
