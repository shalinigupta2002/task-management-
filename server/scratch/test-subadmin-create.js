/**
 * End-to-end Sub Admin create flow:
 * Main Admin → create SUB_ADMIN → DB → managed list → login → update → isolation
 *
 * Run: node server/scratch/test-subadmin-create.js
 */
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../src/config/index.js";
import AuthService from "../src/services/AuthService.js";
import UserService from "../src/services/UserService.js";
import ApiError from "../src/utils/ApiError.js";

const prisma = new PrismaClient();

const PASSWORD = "SubAdmin@Test1!";
const stamp = Date.now();

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
  console.log("=== Sub Admin create E2E tests ===\n");

  const mainAdmin = await prisma.user.findFirst({
    where: { deletedAt: null, role: { name: "MAIN_ADMIN" }, companyId: { not: null }, status: "ACTIVE" },
    include: { role: true, company: true },
  });
  assert(mainAdmin, "Need an ACTIVE MAIN_ADMIN with company");

  const companyId = mainAdmin.companyId;
  const ctx = { userId: mainAdmin.id };

  const department = await prisma.department.findFirst({
    where: { companyId, deletedAt: null, status: "ACTIVE" },
  });
  assert(department, "Need a department in Main Admin company");

  const email = `subadmin.create.${stamp}@test.local`;
  const otherCompany = await prisma.company.findFirst({
    where: { deletedAt: null, id: { not: companyId } },
  });
  const otherMain = otherCompany
    ? await prisma.user.findFirst({
      where: {
        deletedAt: null,
        companyId: otherCompany.id,
        role: { name: "MAIN_ADMIN" },
        status: "ACTIVE",
      },
    })
    : null;

  // 1) Create Sub Admin
  console.log("1. Create Sub Admin via UserService.createSubAdmin...");
  const created = await UserService.createSubAdmin(
    {
      firstName: "Audit",
      lastName: "SubAdmin",
      email,
      phone: "+91 90000 11111",
      password: PASSWORD,
      confirmPassword: PASSWORD,
      departmentId: department.id,
      status: "ACTIVE",
      // Spoof attempts — must be ignored
      companyId: otherCompany?.id || undefined,
      roleId: mainAdmin.roleId,
    },
    ctx
  );
  assert(created?.id, "Create must return user id");
  assert(created.email === email, "Email mismatch");
  assert(!created.password, "Password must never be returned");
  assert(created.role?.name === "SUB_ADMIN", `Role must be SUB_ADMIN, got ${created.role?.name}`);
  assert(created.companyId === companyId, "companyId must match Main Admin company");
  assert(created.departmentId === department.id, "departmentId must match selected department");
  assert(created.employeeId, "Sub Admin must receive auto employee code");
  assert(String(created.employeeId).includes("-SA-"), `Expected -SA- code, got ${created.employeeId}`);
  console.log("   OK HTTP/service create");

  // 2) DB row
  console.log("2. Verify PostgreSQL User row...");
  const dbUser = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: { role: true, company: true, department: true },
  });
  assert(dbUser, "User row must exist in database");
  assert(dbUser.role.name === "SUB_ADMIN", "DB role = SUB_ADMIN");
  assert(dbUser.companyId === companyId, "DB companyId = Main Admin company");
  assert(dbUser.departmentId === department.id, "DB departmentId correct");
  assert(dbUser.status === "ACTIVE", "DB status ACTIVE");
  assert(dbUser.password && dbUser.password !== PASSWORD, "Password must be hashed, not plaintext");
  assert(await bcrypt.compare(PASSWORD, dbUser.password), "bcrypt hash must verify");
  console.log("   OK database persistence + password hash");

  // 3) Role permissions (architecture: RolePermission, not per-user)
  console.log("3. Verify SUB_ADMIN RolePermission...");
  const rolePerms = await prisma.rolePermission.findMany({
    where: { roleId: dbUser.roleId },
    include: { permission: true },
  });
  assert(rolePerms.length >= 1, "SUB_ADMIN role must have permissions");
  const permNames = rolePerms.map((rp) => rp.permission.name);
  assert(permNames.includes("user.read") || permNames.includes("user.write"), "Expected user.* permissions");
  console.log(`   OK permissions via RolePermission: ${permNames.join(", ")}`);

  // 4) Login as Sub Admin
  console.log("4. Login as created Sub Admin...");
  const login = await AuthService.login(email, PASSWORD);
  assert(login.accessToken, "Login must return accessToken");
  assert(login.user.role?.name === "SUB_ADMIN", "Login user role SUB_ADMIN");
  assert(login.user.companyId === companyId, "Login companyId");
  const decoded = jwt.verify(login.accessToken, config.jwt.secret);
  assert(decoded.role === "SUB_ADMIN", "JWT role SUB_ADMIN");
  assert(decoded.companyId === companyId, "JWT companyId");
  assert(decoded.companyCode === mainAdmin.company?.companyCode || decoded.companyCode, "JWT companyCode present");
  console.log("   OK Sub Admin login + JWT");

  // 5) Managed User List includes Sub Admin
  console.log("5. Main Admin managed list returns Sub Admin...");
  const managed = await UserService.getManagedUsers({ limit: 200 }, ctx);
  assert(managed.items.some((u) => u.id === created.id), "Managed list must include new Sub Admin");
  assert(!managed.items.some((u) => u.id === mainAdmin.id), "Managed list must exclude Main Admin self");
  const onlySubs = await UserService.getManagedUsers({ limit: 200, roleName: "SUB_ADMIN" }, ctx);
  assert(onlySubs.items.some((u) => u.id === created.id), "Role=SUB_ADMIN filter includes new user");
  assert(onlySubs.items.every((u) => u.role?.name === "SUB_ADMIN"), "Filter only SUB_ADMIN");
  const onlyEmps = await UserService.getManagedUsers({ limit: 200, roleName: "EMPLOYEE" }, ctx);
  assert(!onlyEmps.items.some((u) => u.id === created.id), "Employee filter excludes Sub Admin");
  console.log("   OK User List visibility + role filters");

  // 6) getUsers Admin Management list
  console.log("6. Admin Management getAll roleName=SUB_ADMIN...");
  const adminList = await UserService.getAll({ limit: 200, roleName: "SUB_ADMIN" }, ctx);
  assert(adminList.items.some((u) => u.id === created.id), "Admin list must include Sub Admin");
  console.log("   OK");

  // 7) Cross-company isolation
  if (otherMain) {
    console.log("7. Cross-company isolation...");
    const otherCtx = { userId: otherMain.id };
    const otherList = await UserService.getManagedUsers({ limit: 200, roleName: "SUB_ADMIN" }, otherCtx);
    assert(!otherList.items.some((u) => u.id === created.id), "Other company must not see Sub Admin");
    await assertThrows(UserService.getById(created.id, otherCtx), "");
    console.log("   OK other company cannot see/access Sub Admin");
  } else {
    console.log("7. SKIP cross-company (only one company)");
  }

  // 8) Duplicate email
  console.log("8. Duplicate email rejected...");
  await assertThrows(
    UserService.createSubAdmin(
      {
        firstName: "Dup",
        lastName: "User",
        email,
        password: PASSWORD,
        departmentId: department.id,
      },
      ctx
    ),
    "email"
  );
  console.log("   OK conflict on duplicate email");

  // 9) Foreign department rejected
  if (otherCompany) {
    console.log("9. Foreign department rejected...");
    const foreignDept = await prisma.department.findFirst({
      where: { companyId: otherCompany.id, deletedAt: null },
    });
    if (foreignDept) {
      await assertThrows(
        UserService.createSubAdmin(
          {
            firstName: "Bad",
            lastName: "Dept",
            email: `bad.dept.${stamp}@test.local`,
            password: PASSWORD,
            departmentId: foreignDept.id,
          },
          ctx
        ),
        "department"
      );
      console.log("   OK foreign department blocked");
    } else {
      console.log("   SKIP no foreign department");
    }
  } else {
    console.log("9. SKIP foreign department");
  }

  // 10) Update Sub Admin
  console.log("10. Update Sub Admin phone/status...");
  const updated = await UserService.update(
    created.id,
    { phone: "+91 98888 77777", status: "INACTIVE" },
    ctx
  );
  assert(updated.phone === "+91 98888 77777", "Phone update");
  assert(updated.status === "INACTIVE", "Status INACTIVE");
  const dbAfter = await prisma.user.findUnique({ where: { id: created.id } });
  assert(dbAfter.phone === "+91 98888 77777", "DB phone persisted");
  assert(dbAfter.status === "INACTIVE", "DB status persisted");

  await assertThrows(AuthService.login(email, PASSWORD), "active");
  console.log("   OK update + inactive blocks login");

  // Reactivate
  await UserService.update(created.id, { status: "ACTIVE" }, ctx);
  const relogin = await AuthService.login(email, PASSWORD);
  assert(relogin.accessToken, "Reactivate allows login");
  console.log("   OK reactivate + login");

  // 11) Spoof companyId on create ignored (already covered) — re-login Main Admin list
  console.log("11. Persistence after re-auth context...");
  const again = await UserService.getManagedUsers({ roleName: "SUB_ADMIN", limit: 200 }, ctx);
  assert(again.items.some((u) => u.id === created.id), "Still in list after re-login path");
  console.log("   OK");

  // Cleanup soft-delete test user
  await prisma.user.update({
    where: { id: created.id },
    data: { deletedAt: new Date(), email: `deleted.${stamp}.${email}` },
  });
  console.log("\n=== ALL SUB ADMIN CREATE TESTS PASSED ===");
}

main()
  .catch((err) => {
    console.error("\nFAILED:", err.message);
    if (err instanceof ApiError) console.error("ApiError status:", err.statusCode);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
