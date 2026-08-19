import prisma from "../src/config/database.js";
import CompanyService from "../src/services/CompanyService.js";
import ApiError from "../src/utils/ApiError.js";

async function assertThrows(promise, errorType, expectedMessageSegment = "") {
  try {
    await promise;
    throw new Error("Expected promise to throw but it succeeded");
  } catch (err) {
    if (err.message === "Expected promise to throw but it succeeded") {
      throw err;
    }
    if (errorType && !(err instanceof errorType)) {
      throw new Error(`Expected error of type ${errorType.name} but got ${err.constructor.name}: ${err.message}`);
    }
    if (expectedMessageSegment && !err.message.toLowerCase().includes(expectedMessageSegment.toLowerCase())) {
      throw new Error(`Expected error message to contain "${expectedMessageSegment}" but got "${err.message}"`);
    }
  }
}

async function runCompanyCodeTests() {
  console.log("=== STARTING COMPANY CODE IMMUTABILITY VERIFICATION ===");

  const realSuperAdmin = await prisma.user.findFirst({
    where: { email: "superadmin@taskflow.com", deletedAt: null },
  });
  if (!realSuperAdmin) {
    console.error("Super Admin user not found. Run migrations/seeds first.");
    process.exit(1);
  }

  const superAdminContext = {
    userId: realSuperAdmin.id,
    role: "SUPER_ADMIN",
    email: realSuperAdmin.email,
  };

  const activePlan = await prisma.subscriptionPlan.findFirst({
    where: { status: "ACTIVE", deletedAt: null },
  });
  if (!activePlan) {
    console.error("No active plans found for testing.");
    process.exit(1);
  }

  const stamp = Date.now();
  const uniqueMail = `immutable-co-${stamp}@example.com`;
  const adminMail = `immutable-admin-${stamp}@example.com`;

  // --- Test 1: Create Company → code generated ---
  console.log("\nRunning Test 1: Create Company → companyCode generated...");
  const createdCompany = await CompanyService.create(
    {
      companyName: "Immutable Code Corp",
      email: uniqueMail,
      address: "123 Business Rd",
      subscriptionPlanId: activePlan.id,
      companyCode: "CLIENT-SHOULD-IGNORE",
      mainAdmin: {
        name: "Immutable Admin",
        email: adminMail,
        password: "StrongPass@123456",
        confirmPassword: "StrongPass@123456",
      },
    },
    superAdminContext
  );

  if (!createdCompany.companyCode || !createdCompany.companyCode.startsWith("TF-")) {
    throw new Error(`FAIL: Expected TF-* code, got "${createdCompany.companyCode}"`);
  }
  if (createdCompany.companyCode === "CLIENT-SHOULD-IGNORE") {
    throw new Error("FAIL: Client-supplied companyCode was accepted.");
  }
  const originalCode = createdCompany.companyCode;
  console.log(`Success: Generated companyCode is "${originalCode}"`);

  // Resolve role contexts against the new company
  const mainAdmin = await prisma.user.findFirst({
    where: { email: adminMail, deletedAt: null },
    include: { role: true },
  });
  if (!mainAdmin || mainAdmin.role?.name !== "MAIN_ADMIN") {
    throw new Error("FAIL: MAIN_ADMIN was not created for the new company.");
  }

  const mainAdminCtx = {
    userId: mainAdmin.id,
    role: "MAIN_ADMIN",
    companyId: createdCompany.id,
  };

  // Prefer an existing SUB_ADMIN; otherwise create a temporary one in this company
  let subAdmin = await prisma.user.findFirst({
    where: { role: { name: "SUB_ADMIN" }, deletedAt: null, companyId: { not: null } },
    include: { role: true },
  });
  let createdTempSub = false;
  if (!subAdmin) {
    const subRole = await prisma.role.findFirst({ where: { name: "SUB_ADMIN" } });
    const hashed = mainAdmin.password; // reuse hash for scratch user only
    subAdmin = await prisma.user.create({
      data: {
        firstName: "Temp",
        lastName: "Sub",
        email: `temp-sub-${stamp}@example.com`,
        password: hashed,
        companyId: createdCompany.id,
        roleId: subRole.id,
        status: "ACTIVE",
      },
      include: { role: true },
    });
    createdTempSub = true;
  }
  const subAdminCtx = {
    userId: subAdmin.id,
    role: "SUB_ADMIN",
    companyId: subAdmin.companyId,
  };

  // --- Test 2: MAIN_ADMIN cannot change companyCode ---
  console.log("\nRunning Test 2: MAIN_ADMIN tries to change companyCode → rejected...");
  await assertThrows(
    CompanyService.update(createdCompany.id, { companyCode: "HACK-MAIN" }, mainAdminCtx),
    ApiError,
    "immutable"
  );
  console.log("Success: MAIN_ADMIN companyCode change rejected.");

  // --- Test 3: SUB_ADMIN cannot change companyCode ---
  console.log("\nRunning Test 3: SUB_ADMIN tries to change companyCode → rejected...");
  // SUB_ADMIN may be denied access to another company's id; still must not succeed in changing code.
  // Use their own company when different, otherwise the created company.
  const subTargetId = subAdmin.companyId || createdCompany.id;
  const subTargetBefore = await prisma.company.findFirst({ where: { id: subTargetId } });
  await assertThrows(
    CompanyService.update(subTargetId, { companyCode: "HACK-SUB" }, subAdminCtx),
    ApiError,
    // either immutable (if they can update) or access denied
    ""
  );
  const subTargetAfter = await prisma.company.findFirst({ where: { id: subTargetId } });
  if (subTargetAfter.companyCode !== subTargetBefore.companyCode) {
    throw new Error("FAIL: SUB_ADMIN changed companyCode.");
  }
  console.log("Success: SUB_ADMIN companyCode change rejected/blocked.");

  // --- Test 4: SUPER_ADMIN cannot change companyCode ---
  console.log("\nRunning Test 4: SUPER_ADMIN tries to change companyCode → rejected...");
  await assertThrows(
    CompanyService.update(createdCompany.id, { companyCode: "HACK-SUPER" }, superAdminContext),
    ApiError,
    "immutable"
  );
  console.log("Success: SUPER_ADMIN companyCode change rejected.");

  // --- Test 5: Normal updates retain the same companyCode ---
  console.log("\nRunning Test 5: Normal company update retains companyCode...");
  const updated = await CompanyService.update(
    createdCompany.id,
    { companyName: "Immutable Code Corp Updated", address: "456 New Street" },
    superAdminContext
  );
  if (updated.companyCode !== originalCode) {
    throw new Error(`FAIL: companyCode changed from ${originalCode} to ${updated.companyCode}`);
  }
  const dbCompany = await prisma.company.findFirst({ where: { id: createdCompany.id } });
  if (dbCompany.companyCode !== originalCode) {
    throw new Error("FAIL: DB companyCode changed after normal update.");
  }
  console.log(`Success: companyCode remained "${originalCode}" after update.`);

  // --- Test 6: Distinct generated codes ---
  console.log("\nRunning Test 6: Second company gets a distinct companyCode...");
  const uniqueMail2 = `immutable-co2-${stamp}@example.com`;
  const adminMail2 = `immutable-admin2-${stamp}@example.com`;
  const createdCompany2 = await CompanyService.create(
    {
      companyName: "Immutable Code Corp 2",
      email: uniqueMail2,
      address: "789 Other Rd",
      subscriptionPlanId: activePlan.id,
      mainAdmin: {
        name: "Immutable Admin 2",
        email: adminMail2,
        password: "StrongPass@123456",
        confirmPassword: "StrongPass@123456",
      },
    },
    superAdminContext
  );
  if (createdCompany2.companyCode === originalCode) {
    throw new Error("FAIL: Duplicate companyCodes generated.");
  }
  console.log(`Success: Distinct codes ("${originalCode}" vs "${createdCompany2.companyCode}")`);

  // Cleanup
  const emailsToDelete = [adminMail, adminMail2];
  if (createdTempSub) emailsToDelete.push(subAdmin.email);
  await prisma.user.deleteMany({ where: { email: { in: emailsToDelete } } });
  await prisma.companySubscription.deleteMany({
    where: { companyId: { in: [createdCompany.id, createdCompany2.id] } },
  });
  await prisma.company.deleteMany({
    where: { id: { in: [createdCompany.id, createdCompany2.id] } },
  });

  console.log("\n=== ALL COMPANY CODE IMMUTABILITY VERIFICATIONS PASSED ===");
}

runCompanyCodeTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
