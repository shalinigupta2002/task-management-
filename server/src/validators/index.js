import { z } from "zod";

const entityStatus = z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]);
const uuid = z.string().uuid("Invalid UUID");

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  status: entityStatus.optional(),
});

export const idParamSchema = z.object({
  id: uuid,
});

const strongPasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128)
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

const mainAdminCreateSchema = z
  .object({
    name: z.string().min(1, "Main Admin name is required").max(200),
    email: z.string().email("Invalid Main Admin email"),
    phone: z.string().max(30).optional().nullable().or(z.literal("")),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const companyCreateSchema = z.object({
  companyName: z.string().min(2).max(200),
  companyCode: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/i, "Alphanumeric code only").optional(),
  email: z.string().email(),
  phone: z.string().max(30).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  logo: z.string().optional().nullable(),
  status: entityStatus.optional(),
  subscriptionPlanId: uuid,
  mainAdmin: mainAdminCreateSchema,
});

export const companyUpdateSchema = z
  .object({
    companyName: z.string().min(2).max(200).optional(),
    // Accepted only so we can reject immutability attempts with a clear error (not silently strip).
    companyCode: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/i, "Alphanumeric code only").optional(),
    email: z.string().email().optional(),
    phone: z.string().max(30).optional().nullable(),
    website: z.string().url().optional().nullable().or(z.literal("")),
    address: z.string().max(500).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    postalCode: z.string().max(20).optional().nullable(),
    industry: z.string().max(100).optional().nullable(),
    logo: z.string().optional().nullable(),
    status: entityStatus.optional(),
    subscriptionPlanId: uuid.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.companyCode !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "companyCode is immutable and cannot be changed",
        path: ["companyCode"],
      });
    }
  });

export const companyQuerySchema = paginationQuerySchema.extend({
  industry: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

export const departmentCreateSchema = z.object({
  departmentName: z.string().min(2).max(150),
  departmentCode: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/i),
  description: z.string().max(1000).optional().nullable(),
  status: entityStatus.optional(),
  companyId: uuid,
});

export const departmentUpdateSchema = departmentCreateSchema.omit({ companyId: true }).partial();

export const departmentQuerySchema = paginationQuerySchema.extend({
  companyId: uuid.optional(),
});

export const userCreateSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
    .or(z.literal("")),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional().nullable(),
  password: z.string().min(8).max(128),
  profileImage: z.string().optional().nullable(),
  designation: z.string().max(150).optional().nullable(),
  status: entityStatus.optional(),
  companyId: uuid.optional().nullable(),
  departmentId: uuid.optional().nullable(),
  roleId: uuid,
});

/** Dedicated employee-creation payload — role forced EMPLOYEE; employeeId auto-generated */
export const employeeCreateSchema = z.object({
  /** Ignored — system-generated */
  employeeId: z.string().max(50).optional().nullable().or(z.literal("")),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional().nullable().or(z.literal("")),
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1).optional(),
  designation: z.string().max(150).optional().nullable().or(z.literal("")),
  departmentId: uuid.optional().nullable(),
  joiningDate: z.coerce.date().optional().nullable(),
  status: entityStatus.optional(),
  /** Ignored — always EMPLOYEE */
  roleId: uuid.optional(),
}).refine((d) => !d.confirmPassword || d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/** Dedicated Sub Admin creation — role forced SUB_ADMIN; employeeId auto-generated */
export const subAdminCreateSchema = z.object({
  /** Ignored — system-generated */
  employeeId: z.string().max(50).optional().nullable().or(z.literal("")),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional().nullable().or(z.literal("")),
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1).optional(),
  departmentId: uuid,
  status: entityStatus.optional(),
  /** Ignored — always SUB_ADMIN */
  roleId: uuid.optional(),
  /** Ignored — always from authenticated MAIN_ADMIN */
  companyId: uuid.optional().nullable(),
}).refine((d) => !d.confirmPassword || d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/** Preview next auto-generated employee code */
export const employeeCodePreviewQuerySchema = z.object({
  roleName: z.enum(["EMPLOYEE", "SUB_ADMIN", "MAIN_ADMIN"]).default("EMPLOYEE"),
});

/** Authenticated user self-service profile update */
export const userSelfUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional().nullable().or(z.literal("")),
  designation: z.string().max(150).optional().nullable().or(z.literal("")),
  profileImage: z.string().optional().nullable(),
});

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true }).extend({
  password: z.string().min(8).max(128).optional(),
  /** Ignored — employee code is immutable after creation */
  employeeId: z.string().max(50).optional().nullable().or(z.literal("")),
});

export const userQuerySchema = paginationQuerySchema.extend({
  companyId: uuid.optional(),
  departmentId: uuid.optional(),
  roleId: uuid.optional(),
  roleName: z.enum(["SUPER_ADMIN", "MAIN_ADMIN", "SUB_ADMIN", "EMPLOYEE"]).optional(),
});

/** Main Admin User List — only SUB_ADMIN / EMPLOYEE filters allowed */
export const managedUserQuerySchema = paginationQuerySchema.extend({
  departmentId: uuid.optional(),
  roleName: z.enum(["SUB_ADMIN", "EMPLOYEE"]).optional(),
  /** Ignored — tenant always from auth for Main/Sub Admin */
  companyId: uuid.optional(),
});

export const roleCreateSchema = z.object({
  name: z.enum(["SUPER_ADMIN", "MAIN_ADMIN", "SUB_ADMIN", "EMPLOYEE"]),
  description: z.string().max(500).optional().nullable(),
  status: entityStatus.optional(),
  permissionIds: z.array(uuid).optional(),
});

export const roleUpdateSchema = z.object({
  description: z.string().max(500).optional().nullable(),
  status: entityStatus.optional(),
  permissionIds: z.array(uuid).optional(),
});

export const roleQuerySchema = paginationQuerySchema;

export const planCreateSchema = z.object({
  planName: z.enum(["Starter", "Professional", "Enterprise", "Custom"]),
  description: z.string().max(1000).optional().nullable(),
  monthlyPrice: z.coerce.number().nonnegative(),
  yearlyPrice: z.coerce.number().nonnegative(),
  duration: z.enum(["MONTHLY", "YEARLY", "CUSTOM"]).optional(),
  maxEmployees: z.coerce.number().int().positive(),
  maxDepartments: z.coerce.number().int().positive(),
  maxActiveTasks: z.coerce.number().int().positive(),
  features: z.array(z.string()).optional(),
  status: entityStatus.optional(),
});

export const planUpdateSchema = planCreateSchema.partial();

export const planQuerySchema = paginationQuerySchema;

export const subscriptionCreateSchema = z.object({
  companyId: uuid,
  subscriptionPlanId: uuid,
  startDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  subscriptionStatus: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "TRIAL", "PENDING"]).optional(),
}).refine((d) => d.expiryDate > d.startDate, {
  message: "expiryDate must be after startDate",
  path: ["expiryDate"],
});

export const subscriptionUpdateSchema = z.object({
  subscriptionPlanId: uuid.optional(),
  startDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  subscriptionStatus: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "TRIAL", "PENDING"]).optional(),
});

export const subscriptionQuerySchema = paginationQuerySchema.extend({
  companyId: uuid.optional(),
  subscriptionPlanId: uuid.optional(),
  subscriptionStatus: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "TRIAL", "PENDING"]).optional(),
});
