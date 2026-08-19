import { z } from "zod";

const strongPasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128)
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

const uuid = z.string().uuid("Invalid UUID");

export const onboardingCheckoutSchema = z.object({
  subscriptionPlanId: uuid,
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  contactEmail: z.string().email().optional().nullable(),
});

export const onboardingSessionQuerySchema = z.object({
  referenceCode: z.string().min(8).max(64),
  sessionToken: z.string().min(16).max(200),
});

export const onboardingSessionBodySchema = z.object({
  referenceCode: z.string().min(8).max(64),
  sessionToken: z.string().min(16).max(200),
});

export const onboardingPaymentVerifySchema = z.object({
  referenceCode: z.string().min(8).max(64),
  sessionToken: z.string().min(16).max(200),
  paymentId: z.string().min(4).max(100),
  signature: z.string().max(255).optional().nullable(),
  checkoutToken: z.string().max(255).optional().nullable(),
  // Optional spoof attempts — rejected in service if mismatched
  amountInPaise: z.coerce.number().int().nonnegative().optional(),
  subscriptionPlanId: uuid.optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
});

export const onboardingCompleteSchema = z.object({
  referenceCode: z.string().min(8).max(64),
  sessionToken: z.string().min(16).max(200),
  company: z.object({
    companyName: z.string().min(2).max(200),
    email: z.string().email(),
    address: z.string().min(1).max(500),
    companyId: z.any().optional(),
    companyCode: z.any().optional(),
  }),
  mainAdmin: z
    .object({
      name: z.string().min(1).max(200),
      email: z.string().email(),
      phone: z.string().max(30).optional().nullable().or(z.literal("")),
      password: strongPasswordSchema,
      confirmPassword: z.string().min(1),
      companyId: z.any().optional(),
      companyCode: z.any().optional(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }),
});
