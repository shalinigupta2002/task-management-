import { z } from "zod";
import { emailSchema, phoneSchema, nameSchema, requiredString, optionalString, passwordSchema } from "./common";

export const employeeFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  department: requiredString("Department", 80),
  designation: requiredString("Designation", 80),
  employeeId: requiredString("Employee ID", 30),
});

export const subAdminFormSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  department: requiredString("Department", 80),
  roleId: requiredString("Role", 80),
  status: z.enum(["Active", "Inactive"]),
});

export const companyFormSchema = z.object({
  name: requiredString("Company name", 120),
  code: requiredString("Company code", 30),
  email: emailSchema,
  phone: phoneSchema,
  address: requiredString("Address", 300),
  industry: requiredString("Industry", 80),
  planId: requiredString("Plan", 80),
});

export const taskFormSchema = z.object({
  title: requiredString("Task title", 150),
  description: optionalString(2000),
  category: requiredString("Category", 80),
  priority: z.enum(["High", "Medium", "Low"]),
  frequency: requiredString("Frequency", 40),
  dueDate: requiredString("Due date", 30),
  assignee: optionalString(120),
});

export const departmentFormSchema = z.object({
  name: requiredString("Department name", 80),
  head: optionalString(80),
  description: optionalString(500),
  status: z.enum(["Active", "Inactive"]).optional(),
});

export const extensionRequestSchema = z.object({
  newDueDate: requiredString("New due date", 30),
  reason: requiredString("Reason", 500).min(10, "Please provide at least 10 characters"),
});

export const profileFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  designation: requiredString("Designation", 80),
});

export const registerSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    department: requiredString("Department", 80),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
