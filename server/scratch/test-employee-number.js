/**
 * Employee Number (User.employeeId) company-scoped uniqueness & RBAC tests.
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
  console.log("=== EMPLOYEE NUMBER TESTS ===\n");

  const xyzAdmin = await prisma.user.findFirst({
    where: { email: { in: ["admin@xyz.test", "rajesh.kumar@techsolutions.com"] }, deletedAt: null },
    include: { role: true },
  });
  const abcAdmin = await prisma.user.findFirst({
    where: { email: { in: ["admin@abc.test", "amit.patel@greenleaf.com"] }, deletedAt: null },
    include: { role: true },
  });
  const xyzSub = await prisma.user.findFirst({
    where: { email: { in: ["subadmin1@xyz.test"] }, deletedAt: null, role: { name: "SUB_ADMIN" } },
    include: { role: true },
  });
  const empRole = await prisma.role.findFirst({ where: { name: "EMPLOYEE" } });
  if (!xyzAdmin || !abcAdmin || !empRole) throw new Error("Seed admins/roles missing");

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

  try {
    // 1. Required
    await assertThrows(
      UserService.create(
        {
          firstName: "No",
          lastName: "Number",
          email: `nonum-${stamp}@xyz.test`,
          password: "StrongPass@123456",
          roleId: empRole.id,
          departmentId: xyzDept?.id,
        },
        xyzCtx
      ),
      "Employee Number is required"
    );
    console.log("1. ✓ Employee Number required for EMPLOYEE");

    // 2. Accepted
    const e1 = await UserService.create(
      {
        employeeId: `EMP${stamp}`,
        firstName: "Anita",
        lastName: "Desai",
        email: `anita-${stamp}@xyz.test`,
        password: "StrongPass@123456",
        roleId: empRole.id,
        departmentId: xyzDept?.id,
        designation: "Manager",
      },
      xyzCtx
    );
    created.push(e1.id);
    if (e1.employeeId !== `EMP${stamp}`) throw new Error("employeeId not saved");
    console.log("2. ✓ Employee Number accepted");

    // 3. Duplicate in same company rejected
    await assertThrows(
      UserService.create(
        {
          employeeId: `EMP${stamp}`,
          firstName: "Dup",
          lastName: "User",
          email: `dup-${stamp}@xyz.test`,
          password: "StrongPass@123456",
          roleId: empRole.id,
          departmentId: xyzDept?.id,
        },
        xyzCtx
      ),
      "already exists"
    );
    console.log("3. ✓ Duplicate employee number in same company rejected");

    // 4. Same number in other company allowed
    const e2 = await UserService.create(
      {
        employeeId: `EMP${stamp}`,
        firstName: "Amit",
        lastName: "Patel",
        email: `amit-${stamp}@abc.test`,
        password: "StrongPass@123456",
        roleId: empRole.id,
        departmentId: abcDept?.id,
      },
      abcCtx
    );
    created.push(e2.id);
    if (e2.employeeId !== `EMP${stamp}`) throw new Error("ABC employeeId mismatch");
    console.log("4. ✓ Same employee number allowed in different companies");

    // 5. XYZ can access XYZ employee
    const got = await UserService.getById(e1.id, xyzCtx);
    if (got.id !== e1.id) throw new Error("XYZ cannot read own employee");
    console.log("5. ✓ XYZ can access XYZ employee");

    // 6. XYZ cannot access ABC employee
    await assertThrows(UserService.getById(e2.id, xyzCtx), "access denied");
    console.log("6. ✓ XYZ cannot access ABC employee (same EMP number)");

    // 7. Invalid characters rejected
    await assertThrows(
      UserService.create(
        {
          employeeId: "EMP 001!",
          firstName: "Bad",
          lastName: "Code",
          email: `bad-${stamp}@xyz.test`,
          password: "StrongPass@123456",
          roleId: empRole.id,
          departmentId: xyzDept?.id,
        },
        xyzCtx
      ),
      "letters, numbers"
    );
    console.log("7. ✓ Invalid employee number rejected");

    // 8. SUB_ADMIN create in own dept
    if (xyzSub && xyzSub.departmentId) {
      const subCtx = {
        userId: xyzSub.id,
        role: "SUB_ADMIN",
        companyId: xyzSub.companyId,
        departmentId: xyzSub.departmentId,
      };
      const e3 = await UserService.create(
        {
          employeeId: `SUBEMP${stamp}`,
          firstName: "Sub",
          lastName: "Created",
          email: `subemp-${stamp}@xyz.test`,
          password: "StrongPass@123456",
          roleId: empRole.id,
          departmentId: xyzSub.departmentId,
        },
        subCtx
      );
      created.push(e3.id);
      console.log("8. ✓ SUB_ADMIN can create employee with Employee Number in own department");

      // 9. SUB_ADMIN cannot create for other company dept
      if (abcDept) {
        await assertThrows(
          UserService.create(
            {
              employeeId: `HACK${stamp}`,
              firstName: "Hack",
              lastName: "Cross",
              email: `hack-${stamp}@xyz.test`,
              password: "StrongPass@123456",
              roleId: empRole.id,
              departmentId: abcDept.id,
              companyId: abcAdmin.companyId,
            },
            subCtx
          ),
          ""
        );
        console.log("9. ✓ SUB_ADMIN cannot create employee for another company/department");
      }
    } else {
      console.log("8-9. ⊘ SUB_ADMIN seed missing — skipped");
    }

    // 10. Search by employeeId via repository list
    const listed = await UserService.getAll({ search: `EMP${stamp}` }, xyzCtx);
    if (!listed.items.some((u) => u.id === e1.id)) {
      throw new Error("Search by employee number failed");
    }
    console.log("10. ✓ Search by Employee Number works");

    // 11. Update employee number within company
    const updated = await UserService.update(
      e1.id,
      { employeeId: `EMPUPD${stamp}` },
      xyzCtx
    );
    if (updated.employeeId !== `EMPUPD${stamp}`) throw new Error("Update employeeId failed");
    console.log("11. ✓ MAIN_ADMIN can update Employee Number");

    console.log("\n=== ALL EMPLOYEE NUMBER TESTS PASSED ===");
  } finally {
    if (created.length) {
      await prisma.user.deleteMany({ where: { id: { in: created } } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

main().catch(async (err) => {
  console.error("FAILED:", err);
  await prisma.$disconnect();
  process.exit(1);
});
