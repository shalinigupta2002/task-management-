/**
 * Employee list must return EMPLOYEE only (not MAIN_ADMIN / SUB_ADMIN).
 * Run: node server/scratch/test-employee-list.js
 */
import { PrismaClient } from "@prisma/client";
import UserService from "../src/services/UserService.js";

const prisma = new PrismaClient();

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function rolesOf(items) {
  return new Set(items.map((u) => u.role?.name || u.roleName).filter(Boolean));
}

async function main() {
  const mainAdmin = await prisma.user.findFirst({
    where: { deletedAt: null, role: { name: "MAIN_ADMIN" }, companyId: { not: null } },
    include: { role: true },
  });
  assert(mainAdmin, "Need a MAIN_ADMIN user");

  const ctx = { userId: mainAdmin.id };
  const companyId = mainAdmin.companyId;

  const companyUsers = await prisma.user.findMany({
    where: { companyId, deletedAt: null },
    include: { role: true },
  });
  const employeeCount = companyUsers.filter((u) => u.role?.name === "EMPLOYEE").length;
  const adminCount = companyUsers.filter((u) => u.role?.name === "MAIN_ADMIN").length;
  const subCount = companyUsers.filter((u) => u.role?.name === "SUB_ADMIN").length;
  assert(employeeCount >= 1, "Need at least one EMPLOYEE in company");
  assert(adminCount >= 1, "Need MAIN_ADMIN in company for exclusion check");

  // 1) Employee list returns only EMPLOYEE
  const list = await UserService.getEmployees({ limit: 100 }, ctx);
  const roleSet = rolesOf(list.items);
  assert([...roleSet].every((r) => r === "EMPLOYEE"), "1. Employee list must contain only EMPLOYEE");
  assert(list.items.every((u) => u.companyId === companyId), "1b. Tenant scoped to MAIN_ADMIN company");

  // 2-3) Counts exclude MAIN_ADMIN / SUB_ADMIN
  assert(list.meta.total === employeeCount, `2/3. Total employees=${list.meta.total} expected ${employeeCount} (admins=${adminCount}, subs=${subCount})`);
  assert(!list.items.some((u) => u.id === mainAdmin.id), "2. MAIN_ADMIN not in employee list");
  if (subCount > 0) {
    const aSub = companyUsers.find((u) => u.role?.name === "SUB_ADMIN");
    assert(!list.items.some((u) => u.id === aSub.id), "3. SUB_ADMIN not in employee list");
  }

  // 4-5) Spoofed roleName cannot return admins; search cannot surface MAIN_ADMIN/SUB_ADMIN
  const spoof = await UserService.getEmployees({ limit: 100, roleName: "MAIN_ADMIN" }, ctx);
  assert(rolesOf(spoof.items).size === 0 || [...rolesOf(spoof.items)].every((r) => r === "EMPLOYEE"), "4. Spoof roleName ignored");
  assert(!spoof.items.some((u) => (u.role?.name || "") === "MAIN_ADMIN"), "4b. Search/list cannot return MAIN_ADMIN");

  const searchAdmin = await UserService.getEmployees({ limit: 100, search: mainAdmin.firstName }, ctx);
  assert(!searchAdmin.items.some((u) => u.id === mainAdmin.id), "5. Search cannot return MAIN_ADMIN");
  if (subCount > 0) {
    const aSub = companyUsers.find((u) => u.role?.name === "SUB_ADMIN");
    const searchSub = await UserService.getEmployees({ limit: 100, search: aSub.firstName }, ctx);
    assert(!searchSub.items.some((u) => u.id === aSub.id), "5b. Search cannot return SUB_ADMIN");
  }

  // 6) Pagination only EMPLOYEE
  const page1 = await UserService.getEmployees({ page: 1, limit: 2 }, ctx);
  assert(page1.items.every((u) => u.role?.name === "EMPLOYEE"), "6. Pagination page contains only EMPLOYEE");

  // 7) Department filter only EMPLOYEE
  const withDept = companyUsers.find((u) => u.role?.name === "EMPLOYEE" && u.departmentId);
  if (withDept) {
    const byDept = await UserService.getEmployees({ limit: 100, departmentId: withDept.departmentId }, ctx);
    assert(byDept.items.every((u) => u.role?.name === "EMPLOYEE"), "7. Department filter only EMPLOYEE");
    assert(byDept.items.every((u) => u.departmentId === withDept.departmentId), "7b. Department filter scopes dept");
  } else {
    console.log("  (skip) Department filter — no EMPLOYEE with department");
  }

  // 8) Status filter only EMPLOYEE
  const byStatus = await UserService.getEmployees({ limit: 100, status: "ACTIVE" }, ctx);
  assert(byStatus.items.every((u) => u.role?.name === "EMPLOYEE"), "8. Status filter only EMPLOYEE");

  // 9) Subadmin employee list only EMPLOYEE (+ department)
  const subAdmin = await prisma.user.findFirst({
    where: { companyId, deletedAt: null, role: { name: "SUB_ADMIN" }, departmentId: { not: null } },
  });
  if (subAdmin) {
    const subList = await UserService.getEmployees({ limit: 100 }, { userId: subAdmin.id });
    assert(subList.items.every((u) => u.role?.name === "EMPLOYEE"), "9. Subadmin list only EMPLOYEE");
    assert(subList.items.every((u) => u.departmentId === subAdmin.departmentId), "9b. Subadmin department scoped");
  } else {
    console.log("  (skip) Subadmin employee list — no SUB_ADMIN with department");
  }

  // Generic getAll still can return SUB_ADMIN for Admin Management
  const admins = await UserService.getAll({ roleName: "SUB_ADMIN", limit: 50 }, ctx);
  assert(admins.items.every((u) => u.role?.name === "SUB_ADMIN"), "Admin Management path still returns SUB_ADMIN");

  console.log("\nAll employee-list tests passed.");
}

main()
  .catch((err) => {
    console.error("\nFAILED:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
