import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(120, "Email must be at most 120 characters");

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^[+]?[\d\s()-]{7,20}$/, "Please enter a valid phone number");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character");

export const nameSchema = z
  .string()
  .min(1, "This field is required")
  .min(2, "Must be at least 2 characters")
  .max(80, "Must be at most 80 characters")
  .regex(/^[a-zA-Z\s.'-]+$/, "Only letters and basic punctuation allowed");

export const requiredString = (label, max = 200) =>
  z.string().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

export const optionalString = (max = 500) => z.string().max(max).optional().or(z.literal(""));

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  role: z.string().min(1, "Please select a role"),
  remember: z.boolean().optional(),
});
