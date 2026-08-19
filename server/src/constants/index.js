export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  MAIN_ADMIN: "MAIN_ADMIN",
  SUB_ADMIN: "SUB_ADMIN",
  EMPLOYEE: "EMPLOYEE",
};

export const ENTITY_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  SUSPENDED: "SUSPENDED",
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  TRIAL: "TRIAL",
  PENDING: "PENDING",
};

export const PLAN_NAMES = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
  CUSTOM: "Custom",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
};

export const MESSAGES = {
  NOT_FOUND: "Resource not found",
  VALIDATION_FAILED: "Validation failed",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Insufficient permissions",
  INTERNAL_ERROR: "Internal server error",
  DUPLICATE: "Resource already exists",
};

export const SORT_ORDERS = ["asc", "desc"];

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
