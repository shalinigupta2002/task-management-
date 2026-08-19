import { z } from "zod";
import { validateSecureHttpsUrl } from "../utils/urlValidation.js";

const uuid = z.string().uuid("Invalid UUID");
const messageType = z.enum(["TEXT", "IMAGE", "VIDEO", "PDF", "DOCX", "EXCEL"]);

const secureAttachmentUrl = z
  .string()
  .optional()
  .nullable()
  .superRefine((val, ctx) => {
    if (val == null || val === "") return;
    try {
      validateSecureHttpsUrl(val);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err.message || "Only secure HTTPS links are allowed",
      });
    }
  });

export const conversationCreateSchema = z.object({
  otherUserId: uuid,
  initialMessage: z.string().min(1).max(5000).optional(),
});

export const conversationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  companyId: uuid.optional(),
});

export const messageCreateSchema = z.object({
  conversationId: uuid,
  message: z.string().min(1).max(10000),
  messageType: messageType.optional(),
  attachmentUrl: secureAttachmentUrl,
  attachmentName: z.string().max(255).optional().nullable(),
  attachmentSize: z.coerce.number().int().positive().max(52428800).optional().nullable(),
});

export const messageUpdateSchema = z.object({
  message: z.string().min(1).max(10000),
});

export const messageQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  conversationId: uuid.optional(),
  search: z.string().optional(),
});

export const markMessagesReadSchema = z.object({
  conversationId: uuid,
  messageIds: z.array(uuid).optional(),
});

export const idParamSchema = z.object({ id: uuid });
