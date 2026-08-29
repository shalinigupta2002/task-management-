/**
 * Automatic employee / sub-admin code generation tests.
 * Run: node server/scratch/test-employee-code.js
 */
import { PrismaClient } from "@prisma/client";
import UserService from "../src/services/UserService.js";
import ApiError from "../src/utils/ApiError.js";

const prisma = new PrismaClient();
const stamp = Date.now();
const PASSWORD = "AutoCode@Test1!";

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
  console.log("=== Automatic Employee Code tests ===\n");

  const mainAdmin = await prisma.user.findFirst({
    where: { deletedAt: null, role: { name: "MAIN_ADMIN" }, companyId: { not: null }, status: "ACTIVE" },
    include: { company: true, role: true },
  });
  assert(mainAdmin, "Need MAIN_ADMIN");
  const companyCode = mainAdmin.company.companyCode;
  const ctx = { userId: mainAdmin.id };
  const dept = await prisma.department.findFirst({
    where: { companyId: mainAdmin.companyId, deletedAt: null },
  });
  assert(dept, "Need department");

  const createdIds = [];

  // 1) Create employee → EMP code
  const e1 = await UserService.createEmployee(
    {
      firstName: "Code",
      lastName: "One",
      email: `code.emp1.${stamp}@test.local`,
      password: PASSWORD,
      departmentId: dept.id,
      employeeId: "CLIENT-SHOULD-IGNORE",
    },
    ctx
  );
  createdIds.push(e1.id);
  assert(e1.employeeId, "employeeId must be generated");
  assert(e1.employeeId !== "CLIENT-SHOULD-IGNORE", "Client code must be ignored");
  assert(
    e1.employeeId.startsWith(`${companyCode}-EMP-`),
    `Expected ${companyCode}-EMP-*, got ${e1.employeeId}`
  );
  console.log(`1. OK employee code ${e1.employeeId}`);

  // 2) Second employee increments
  const e2 = await UserService.createEmployee(
    {
      firstName: "Code",
      lastName: "Two",
      email: `code.emp2.${stamp}@test.local`,
      password: PASSWORD,
      departmentId: dept.id,
    },
    ctx
  );
  createdIds.push(e2.id);
  const n1 = parseInt(e1.employeeId.split("-").pop(), 10);
  const n2 = parseInt(e2.employeeId.split("-").pop(), 10);
  assert(n2 === n1 + 1, `Expected sequential EMP codes, got ${e1.employeeId} then ${e2.employeeId}`);
  console.log(`2. OK next employee ${e2.employeeId}`);

  // 3) Sub Admin SA code
  const s1 = await UserService.createSubAdmin(
    {
      firstName: "Code",
      lastName: "SubOne",
      email: `code.sa1.${stamp}@test.local`,
      password: PASSWORD,
      departmentId: dept.id,
      employeeId: "HACK-SA",
    },
    ctx
  );
  createdIds.push(s1.id);
  assert(s1.employeeId.startsWith(`${companyCode}-SA-`), `Expected SA code, got ${s1.employeeId}`);
  console.log(`3. OK sub-admin code ${s1.employeeId}`);

  // 4) Second Sub Admin
  const s2 = await UserService.createSubAdmin(
    {
      firstName: "Code",
      lastName: "SubTwo",
      email: `code.sa2.${stamp}@test.local`,
      password: PASSWORD,
      departmentId: dept.id,
    },
    ctx
  );
  createdIds.push(s2.id);
  const sa1 = parseInt(s1.employeeId.split("-").pop(), 10);
  const sa2 = parseInt(s2.employeeId.split("-").pop(), 10);
  assert(sa2 === sa1 + 1, `SA sequence broken: ${s1.employeeId} → ${s2.employeeId}`);
  console.log(`4. OK next sub-admin ${s2.employeeId}`);

  // 5) Role namespaces independent (same numeric OK)
  assert(
    e1.employeeId.includes("-EMP-") && s1.employeeId.includes("-SA-"),
    "EMP and SA namespaces distinct"
  );
  console.log("5. OK role namespaces independent");

  // 6) Immutable on update
  const before = e1.employeeId;
  const updated = await UserService.update(e1.id, { employeeId: "HACKED-CODE", phone: "999" }, ctx);
  assert(updated.employeeId === before, "employeeId must be immutable");
  const db = await prisma.user.findUnique({ where: { id: e1.id } });
  assert(db.employeeId === before, "DB employeeId unchanged");
  console.log("6. OK code immutable");

  // 7) Soft-delete does not reuse sequence
  await UserService.remove(e2.id, ctx);
  const e3 = await UserService.createEmployee(
    {
      firstName: "Code",
      lastName: "Three",
      email: `code.emp3.${stamp}@test.local`,
      password: PASSWORD,
      departmentId: dept.id,
    },
    ctx
  );
  createdIds.push(e3.id);
  const n3 = parseInt(e3.employeeId.split("-").pop(), 10);
  assert(n3 > n2, `Must not reuse deleted code; got ${e3.employeeId} after deleting ${e2.employeeId}`);
  console.log(`7. OK no reuse after delete → ${e3.employeeId}`);

  // 8) Concurrent creates unique
  const concurrent = await Promise.all(
    [0, 1, 2, 3, 4].map((i) =>
      UserService.createEmployee(
        {
          firstName: "Conc",
          lastName: `U${i}`,
          email: `code.conc.${stamp}.${i}@test.local`,
          password: PASSWORD,
          departmentId: dept.id,
        },
        ctx
      )
    )
  );
  concurrent.forEach((u) => createdIds.push(u.id));
  const codes = concurrent.map((u) => u.employeeId);
  assert(new Set(codes).size === codes.length, `Duplicate concurrent codes: ${codes.join(", ")}`);
  console.log(`8. OK concurrent unique: ${codes.join(", ")}`);

  // 9) Preview
  const preview = await UserService.previewEmployeeCode("EMPLOYEE", ctx);
  assert(preview.employeeId.startsWith(`${companyCode}-EMP-`), "Preview format");
  console.log(`9. OK preview ${preview.employeeId}`);

  // 10) Cross-company other admin cannot collide incorrectly
  const otherMain = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      role: { name: "MAIN_ADMIN" },
      companyId: { not: mainAdmin.companyId },
      status: "ACTIVE",
    },
    include: { company: true },
  });
  if (otherMain) {
    const otherDept = await prisma.department.findFirst({
      where: { companyId: otherMain.companyId, deletedAt: null },
    });
    if (otherDept) {
      const other = await UserService.createEmployee(
        {
          firstName: "Other",
          lastName: "Co",
          email: `code.other.${stamp}@test.local`,
          password: PASSWORD,
          departmentId: otherDept.id,
        },
        { userId: otherMain.id }
      );
      createdIds.push(other.id);
      assert(
        other.employeeId.startsWith(`${otherMain.company.companyCode}-EMP-`),
        "Other company uses own prefix"
      );
      assert(other.employeeId !== e1.employeeId, "Codes not shared across companies wrongly");
      console.log(`10. OK cross-company ${other.employeeId}`);
    } else {
      console.log("10. SKIP no other dept");
    }
  } else {
    console.log("10. SKIP only one company");
  }

  // Cleanup
  for (const id of createdIds) {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), email: `deleted.code.${id.slice(0, 8)}.${stamp}@test.local` },
    }).catch(() => {});
  }

  console.log("\n=== ALL EMPLOYEE CODE TESTS PASSED ===");
}

main()
  .catch((err) => {
    console.error("\nFAILED:", err.message);
    if (err instanceof ApiError) console.error("status", err.statusCode);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
