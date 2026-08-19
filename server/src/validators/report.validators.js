import { z } from "zod";
import { paginationQuerySchema, idParamSchema } from "./index.js";

const uuid = z.string().uuid("Invalid UUID");

export const reportQuerySchema = paginationQuerySchema.extend({
  companyId: uuid.optional(),
  type: z.string().max(100).optional(),
  period: z.string().max(100).optional(),
});

export const reportCreateSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  period: z.string().min(1).max(100),
  companyId: uuid.optional(),
});

export { idParamSchema as reportIdParamSchema };
