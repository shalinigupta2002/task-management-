/**
 * Employee Number (User.employeeId) — auto-generation + uniqueness (company-scoped).
 * Usage: node scratch/test-employee-number.js
 */
import prisma from "../src/config/database.js";
import UserService from "../src/services/UserService.js";
import ApiError from "../src/utils/ApiError.js";

async function assertThrows(promise, segment = "") {
  try {
    await promise;
    throw new Error("Expected throw but succeeded");
  } catch (err) {
    if (err.message === "Expected throw but succeeded") throw err;
    if (!(err instanceof ApiError)) {
      throw new Error(`Expected ApiError, got ${err.constructor.name}: ${err.message}`);
    }
    if (segment && !err.message.toLowerCase().includes(segment.toLowerCase())) {
      throw new Error(`Expected "${segment}" in "${err.message}"`);
    }
  }
}

async function main() {
  console.log("=== EMPLOYEE NUMBER / AUTO-CODE TESTS ===\n");

  const xyzAdmin = await prisma.user.findFirst({
    where: { email: { in: ["admin@xyz.test", "rajesh.kumar@techsolutions.com"] }, deletedAt: null },
    include: { role: true, company: true },
  });
  const abcAdmin = await prisma.user.findFirst({
    where: { email: { in: ["admin@abc.test", "amit.patel@greenleaf.com"] }, deletedAt: null },
    include: { role: true, company: true },
  });
  if (!xyzAdmin || !abcAdmin) throw new Error("Seed admins missing");

  const xyzDept = await prisma.department.findFirst({
    where: { companyId: xyzAdmin.companyId, deletedAt: null },
  });
  const abcDept = await prisma.department.findFirst({
    where: { companyId: abcAdmin.companyId, deletedAt: null },
  });

  const xyzCtx = { userId: xyzAdmin.id, role: "MAIN_ADMIN", companyId: xyzAdmin.companyId };
  const abcCtx = { userId: abcAdmin.id, role: "MAIN_ADMIN", companyId: abcAdmin.companyId };
  const stamp = Date.now();
  const created = [];
  const password = "StrongPass@123456";

  try {
    // 1. Auto-generate for EMPLOYEE (client code ignored)
    const e1 = await UserService.createEmployee(
      {
        employeeId: "CLIENT-CODE",
        firstName: "Anita",
        lastName: "Desai",
        email: `anita-${stamp}@xyz.test`,
        password,
        departmentId: xyzDept?.id,
        designation: "Manager",
      },
      xyzCtx
    );
    created.push(e1.id);
    if (!e1.employeeId?.includes("-EMP-")) throw new Error(`Expected auto EMP code, got ${e1.employeeId}`);
    if (e1.employeeId === "CLIENT-CODE") throw new Error("Client employeeId was accepted");
    console.log(`1. ✓ Auto Employee Code generated: ${e1.employeeId}`);

    // 2. Sequential next code
    const e2 = await UserService.createEmployee(
      {
        firstName: "Second",
        lastName: "Emp",
        email: `second-${stamp}@xyz.test`,
        password,
        departmentId: xyzDept?.id,
      },
      xyzCtx
    );
    created.push(e2.id);
    const a = parseInt(e1.employeeId.split("-").pop(), 10);
    const b = parseInt(e2.employeeId.split("-").pop(), 10);
    if (b !== a + 1) throw new Error(`Sequence broken ${e1.employeeId} → ${e2.employeeId}`);
    console.log(`2. ✓ Sequential code: ${e2.employeeId}`);

    // 3. Immutable
    const upd = await UserService.update(e1.id, { employeeId: "HACK", phone: "111" }, xyzCtx);
    if (upd.employeeId !== e1.employeeId) throw new Error("employeeId mutated on update");
    console.log("3. ✓ Employee Code immutable on update");

    // 4. Other company gets own prefix
    const other = await UserService.createEmployee(
      {
        firstName: "Other",
        lastName: "Co",
        email: `other-${stamp}@abc.test`,
        password,
        departmentId: abcDept?.id,
      },
      abcCtx
    );
    created.push(other.id);
    if (!other.employeeId?.startsWith(`${abcAdmin.company.companyCode}-EMP-`)) {
      throw new Error(`Wrong company prefix: ${other.employeeId}`);
    }
    console.log(`4. ✓ Cross-company code scoped: ${other.employeeId}`);

    // 5. Preview
    const preview = await UserService.previewEmployeeCode("EMPLOYEE", xyzCtx);
    if (!preview.employeeId?.includes("-EMP-")) throw new Error("Bad preview");
    console.log(`5. ✓ Preview: ${preview.employeeId}`);

    console.log("\n=== EMPLOYEE NUMBER TESTS PASSED ===");
  } finally {
    for (const id of created) {
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), email: `deleted-empnum-${id}@test.local` },
      }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
