/**
 * Main Admin User List (/managed) — SUB_ADMIN + EMPLOYEE only; excludes self.
 * Run: node server/scratch/test-managed-users.js
 */
import { PrismaClient } from "@prisma/client";
import UserService from "../src/services/UserService.js";
import ApiError from "../src/utils/ApiError.js";

const prisma = new PrismaClient();

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function rolesOf(items) {
  return [...new Set(items.map((u) => u.role?.name).filter(Boolean))];
}

async function assertThrows(promise, segment = "") {
  try {
    await promise;
    throw new Error("Expected throw but succeeded");
  } catch (err) {
    if (err.message === "Expected throw but succeeded") throw err;
    if (segment && !String(err.message).toLowerCase().includes(segment.toLowerCase())) {
      throw new Error(`Expected "${segment}" in "${err.message}"`);
    }
  }
}

async function main() {
  console.log("=== Managed Users (Main Admin User List) tests ===\n");

  const mainAdmin = await prisma.user.findFirst({
    where: { deletedAt: null, role: { name: "MAIN_ADMIN" }, companyId: { not: null } },
    include: { role: true },
  });
  assert(mainAdmin, "Need MAIN_ADMIN");

  const companyId = mainAdmin.companyId;
  const ctx = { userId: mainAdmin.id };

  const companyUsers = await prisma.user.findMany({
    where: { companyId, deletedAt: null },
    include: { role: true },
  });
  const subCount = companyUsers.filter((u) => u.role?.name === "SUB_ADMIN").length;
  const empCount = companyUsers.filter((u) => u.role?.name === "EMPLOYEE").length;
  const mainCount = companyUsers.filter((u) => u.role?.name === "MAIN_ADMIN").length;
  assert(subCount >= 1 || empCount >= 1, "Need SUB_ADMIN or EMPLOYEE in company");
  assert(mainCount >= 1, "Need MAIN_ADMIN in company");

  // 1) Logged-in Main Admin not returned
  const list = await UserService.getManagedUsers({ limit: 200 }, ctx);
  assert(!list.items.some((u) => u.id === mainAdmin.id), "Logged-in Main Admin must not appear");
  console.log("OK 1: Logged-in Main Admin excluded");

  // 2–3) No MAIN_ADMIN / SUPER_ADMIN in results
  const roles = rolesOf(list.items);
  assert(!roles.includes("MAIN_ADMIN"), `MAIN_ADMIN must not appear, got ${roles}`);
  assert(!roles.includes("SUPER_ADMIN"), `SUPER_ADMIN must not appear, got ${roles}`);
  console.log("OK 2-3: MAIN_ADMIN and SUPER_ADMIN excluded");

  // 4–5) Only SUB_ADMIN and/or EMPLOYEE
  assert(roles.every((r) => r === "SUB_ADMIN" || r === "EMPLOYEE"), `Unexpected roles: ${roles}`);
  if (subCount > 0) assert(list.items.some((u) => u.role?.name === "SUB_ADMIN"), "SUB_ADMIN should be returned");
  if (empCount > 0) assert(list.items.some((u) => u.role?.name === "EMPLOYEE"), "EMPLOYEE should be returned");
  console.log("OK 4-5: SUB_ADMIN / EMPLOYEE returned as expected");

  // Stats population equals SUB_ADMIN + EMPLOYEE minus self (self is MAIN_ADMIN so full count)
  const expectedTotal = subCount + empCount;
  assert(
    list.items.length === expectedTotal || list.meta?.total === expectedTotal || list.items.length <= expectedTotal,
    `Expected ~${expectedTotal} managed users, got ${list.items.length}`
  );
  // With excludeId of MAIN_ADMIN, count should equal all SUB+EMP in company
  assert(list.items.length === expectedTotal, `Stats population must be ${expectedTotal}, got ${list.items.length}`);
  console.log("OK stats: Total managed users excludes Main Admin");

  // 6) Role filter Sub Admin
  const subs = await UserService.getManagedUsers({ limit: 200, roleName: "SUB_ADMIN" }, ctx);
  assert(subs.items.every((u) => u.role?.name === "SUB_ADMIN"), "Sub Admin filter leaked other roles");
  assert(!subs.items.some((u) => u.id === mainAdmin.id), "Self still excluded");
  console.log("OK 6: Role filter SUB_ADMIN");

  // 7) Role filter Employee
  const emps = await UserService.getManagedUsers({ limit: 200, roleName: "EMPLOYEE" }, ctx);
  assert(emps.items.every((u) => u.role?.name === "EMPLOYEE"), "Employee filter leaked other roles");
  console.log("OK 7: Role filter EMPLOYEE");

  // 8) Search for Main Admin name/email → zero (or no self)
  const searchSelf = await UserService.getManagedUsers(
    { limit: 200, search: mainAdmin.email },
    ctx
  );
  assert(!searchSelf.items.some((u) => u.id === mainAdmin.id), "Search must not return Main Admin self");
  console.log("OK 8: Search for Main Admin does not return self");

  // Invalid role filter rejected
  await assertThrows(
    UserService.getManagedUsers({ roleName: "MAIN_ADMIN" }, ctx),
    "role"
  );
  console.log("OK: MAIN_ADMIN role filter rejected");

  // 10) Cross-company excluded
  const other = await prisma.company.findFirst({ where: { deletedAt: null, id: { not: companyId } } });
  if (other) {
    await assertThrows(
      UserService.getManagedUsers({ companyId: other.id, limit: 10 }, ctx),
      "company"
    );
    console.log("OK 10: Cross-company companyId blocked");
  } else {
    console.log("SKIP 10: Only one company");
  }

  // 11) Employee-only endpoint still EMPLOYEE only
  const empOnly = await UserService.getEmployees({ limit: 200 }, ctx);
  assert(empOnly.items.every((u) => u.role?.name === "EMPLOYEE"), "getEmployees must stay EMPLOYEE-only");
  console.log("OK 11: Employee-only view still correct");

  console.log("\n=== ALL MANAGED USERS TESTS PASSED ===");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Test failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
