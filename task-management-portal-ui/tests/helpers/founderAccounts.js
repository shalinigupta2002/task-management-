/** Founder-demo seeded accounts */

export const PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD || "DevTest@2026!";
export const API = (process.env.API_BASE || "http://localhost:8080/api/v1").replace(/\/$/, "");
export const FE = (process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:5174").replace(/\/$/, "");

export const ACCOUNTS = {
  SUPER_ADMIN: { email: "superadmin@system.test", password: PASSWORD, role: "SUPER_ADMIN", label: "Super Admin" },
  MAIN_ADMIN_XYZ: { email: "admin@xyz.test", password: PASSWORD, role: "MAIN_ADMIN", label: "Main Admin" },
  SUB_ADMIN_ENG: { email: "subadmin1@xyz.test", password: PASSWORD, role: "SUB_ADMIN", label: "Sub Admin" },
  SUB_ADMIN_OPS: { email: "subadmin2@xyz.test", password: PASSWORD, role: "SUB_ADMIN", label: "Sub Admin" },
  EMP_ENG_1: { email: "employee1@xyz.test", password: PASSWORD, role: "EMPLOYEE", label: "Employee" },
  EMP_ENG_2: { email: "employee2@xyz.test", password: PASSWORD, role: "EMPLOYEE", label: "Employee" },
  EMP_OPS: { email: "employee3@xyz.test", password: PASSWORD, role: "EMPLOYEE", label: "Employee" },
  MAIN_ADMIN_ABC: { email: "admin@abc.test", password: PASSWORD, role: "MAIN_ADMIN", label: "Main Admin" },
  SUB_ADMIN_ABC: { email: "subadmin@abc.test", password: PASSWORD, role: "SUB_ADMIN", label: "Sub Admin" },
  EMP_ABC: { email: "employee@abc.test", password: PASSWORD, role: "EMPLOYEE", label: "Employee" },
};
