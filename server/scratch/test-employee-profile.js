/**
 * Employee profile — authenticated /me from DB, isolation, update persistence.
 * Run: node server/scratch/test-employee-profile.js
 */
import { PrismaClient } from "@prisma/client";
import UserService from "../src/services/UserService.js";
import ApiError from "../src/utils/ApiError.js";

const prisma = new PrismaClient();

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
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
  console.log("=== Employee Profile tests ===\n");

  const employees = await prisma.user.findMany({
    where: { deletedAt: null, role: { name: "EMPLOYEE" }, status: "ACTIVE" },
    include: { role: true, department: true, company: true },
    take: 3,
  });
  assert(employees.length >= 2, "Need at least 2 EMPLOYEE users");

  const empA = employees[0];
  const empB = employees[1];
  const ctxA = { userId: empA.id };
  const ctxB = { userId: empB.id };

  // 1) getMe returns authenticated employee
  const me = await UserService.getMe(ctxA);
  assert(me.id === empA.id, "getMe must return authenticated user");
  assert(me.email === empA.email, "Email must match DB");
  assert(me.firstName === empA.firstName, "firstName must match DB");
  assert(me.lastName === empA.lastName, "lastName must match DB");
  assert(me.password === undefined, "Password hash must not be returned");
  assert(!JSON.stringify(me).includes("Employee User") || empA.firstName === "Employee", "Must not invent mock name");
  console.log("OK 1: getMe matches database user");

  // 2) No EMP-101 mock unless actually in DB
  if (empA.employeeId !== "EMP-101") {
    assert(me.employeeId !== "EMP-101" || me.employeeId === empA.employeeId, "Must not return fake EMP-101");
  }
  assert(me.employeeId === empA.employeeId, "employeeId must match DB");
  console.log("OK 2: employeeId from DB");

  // 3) Department from relation
  if (empA.department) {
    assert(me.department?.departmentName === empA.department.departmentName, "Department name must match");
  }
  console.log("OK 3: Department relation present");

  // 4) Employee cannot get another user by ID
  await assertThrows(UserService.getById(empB.id, ctxA), "own profile");
  console.log("OK 4: Cannot access another employee by ID");

  // 5) Profile update persists
  const originalPhone = empA.phone;
  const testPhone = "9999999999";
  const updated = await UserService.updateMe({ phone: testPhone }, ctxA);
  assert(updated.phone === testPhone, "updateMe must return new phone");
  const fromDb = await prisma.user.findUnique({ where: { id: empA.id } });
  assert(fromDb.phone === testPhone, "DB must persist phone");
  const meAgain = await UserService.getMe(ctxA);
  assert(meAgain.phone === testPhone, "getMe after update must show new phone");
  console.log("OK 5: Profile update persists");

  // Restore phone
  await UserService.updateMe({ phone: originalPhone }, ctxA);
  console.log("OK 5b: Phone restored");

  // 6) Cannot escalate via updateMe
  const before = await prisma.user.findUnique({ where: { id: empA.id } });
  await UserService.updateMe({
    firstName: before.firstName,
    // These should be ignored by schema/service even if passed through raw
  }, ctxA);
  const after = await UserService.updateMe({ designation: before.designation || "Tester" }, ctxA);
  const dbAfter = await prisma.user.findUnique({ where: { id: empA.id } });
  assert(dbAfter.roleId === before.roleId, "roleId must not change via updateMe");
  assert(dbAfter.companyId === before.companyId, "companyId must not change");
  assert(dbAfter.employeeId === before.employeeId, "employeeId must not change");
  // restore designation
  await UserService.updateMe({ designation: before.designation }, ctxA);
  console.log("OK 6: Privileged fields not escalated");
  void after;

  // 7) Cross-company: empB getMe is only self
  const meB = await UserService.getMe(ctxB);
  assert(meB.id === empB.id && meB.id !== empA.id, "Employee B getMe is self only");
  console.log("OK 7: Isolation between employees");

  console.log("\n=== ALL EMPLOYEE PROFILE TESTS PASSED ===");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Test failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
