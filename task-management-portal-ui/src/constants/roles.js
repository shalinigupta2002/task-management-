export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "MAIN_ADMIN",
  SUB_ADMIN: "SUB_ADMIN",
  EMPLOYEE: "EMPLOYEE",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Main Admin",
  [ROLES.SUB_ADMIN]: "Sub Admin",
  [ROLES.EMPLOYEE]: "Employee",
};

/** Role hierarchy — higher index = lower privilege. */
export const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.SUB_ADMIN,
  ROLES.EMPLOYEE,
];

export function hasRoleOrAbove(userRole, requiredRole) {
  const userIdx = ROLE_HIERARCHY.indexOf(userRole);
  const reqIdx = ROLE_HIERARCHY.indexOf(requiredRole);
  if (userIdx === -1 || reqIdx === -1) return false;
  return userIdx <= reqIdx;
}
