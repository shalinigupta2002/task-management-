/**
 * Focused runner for SUBADMIN scoping tests 79-83.
 * Usage: node scratch/test-security-79-83.js
 */
import prisma from "../src/config/database.js";
import ReportService from "../src/services/ReportService.js";
import NotificationService from "../src/services/NotificationService.js";
import ConversationService from "../src/services/ConversationService.js";
import UserService from "../src/services/UserService.js";
import ApiError from "../src/utils/ApiError.js";

async function assertThrows(promise, errorType, expectedMessageSegment = "") {
  try {
    await promise;
    throw new Error("Expected promise to throw but it succeeded");
  } catch (err) {
    if (err.message === "Expected promise to throw but it succeeded") throw err;
    if (errorType && !(err instanceof errorType)) {
      throw new Error(`Expected ${errorType.name} but got ${err.constructor.name}: ${err.message}`);
    }
    if (expectedMessageSegment && !err.message.toLowerCase().includes(expectedMessageSegment.toLowerCase())) {
      throw new Error(`Expected message containing "${expectedMessageSegment}" but got "${err.message}"`);
    }
  }
}

async function resolveUser(emails) {
  for (const email of emails) {
    const u = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (u) return u;
  }
  return null;
}

async function main() {
  console.log("=== TESTS 79-83 (SUBADMIN SCOPING) ===\n");

  const xyzSubadmin = await resolveUser(["subadmin1@xyz.test", "subadmin1@company1.com"]);
  const abcAdmin = await resolveUser(["admin@abc.test", "amit.patel@greenleaf.com"]);
  if (!xyzSubadmin) throw new Error("XYZ subadmin not found in seed data");

  const xyzSubCtx = {
    userId: xyzSubadmin.id,
    role: "SUB_ADMIN",
    companyId: xyzSubadmin.companyId,
    departmentId: xyzSubadmin.departmentId,
  };

  const xyzEmployee = await prisma.user.findFirst({
    where: {
      companyId: xyzSubadmin.companyId,
      departmentId: xyzSubadmin.departmentId,
      role: { name: "EMPLOYEE" },
      deletedAt: null,
    },
  });

  // Test 79
  console.log("Test 79: SUBADMIN reports are scoped...");
  const xyzReport = await ReportService.exportReport(xyzSubCtx);
  const reportLines = xyzReport.split("\n").slice(1).filter(Boolean);
  for (const line of reportLines) {
    const code = line.split(",")[0]?.trim();
    if (!code) continue;
    const task = await prisma.task.findFirst({
      where: { taskCode: code, companyId: xyzSubadmin.companyId, deletedAt: null },
    });
    if (!task) throw new Error(`Test 79 failed: unknown task code ${code}`);
    if (task.departmentId !== xyzSubadmin.departmentId) {
      throw new Error("Test 79 failed: task outside subadmin department.");
    }
  }
  console.log("✓ Test 79 passed\n");

  // Test 80
  console.log("Test 80: SUBADMIN notifications are scoped...");
  const notif80 = await NotificationService.getAll(xyzSubadmin.id, { limit: 50 });
  const foreignNotif = (notif80.items || []).find((n) => n.userId && n.userId !== xyzSubadmin.id);
  if (foreignNotif) throw new Error("Test 80 failed: foreign notification.");
  console.log("✓ Test 80 passed\n");

  // Test 81
  console.log("Test 81: SUBADMIN messages are scoped...");
  const conv81 = await ConversationService.getAll(xyzSubadmin.id, { limit: 50 });
  for (const c of conv81.items || []) {
    const isMember = (c.participants || []).some(
      (p) => p.userId === xyzSubadmin.id || p.user?.id === xyzSubadmin.id
    );
    if (!isMember) throw new Error("Test 81 failed: non-member conversation.");
    if (c.companyId && c.companyId !== xyzSubadmin.companyId) {
      throw new Error("Test 81 failed: cross-company conversation.");
    }
  }
  console.log("✓ Test 81 passed\n");

  // Test 82
  console.log("Test 82: SUBADMIN cannot escalate role...");
  const mainAdminRole = await prisma.role.findFirst({ where: { name: "MAIN_ADMIN" } });
  if (xyzEmployee && mainAdminRole) {
    await assertThrows(
      UserService.update(xyzEmployee.id, { roleId: mainAdminRole.id }, xyzSubCtx),
      ApiError,
      "cannot assign"
    );
    console.log("✓ Test 82 passed\n");
  } else {
    console.log("⊘ Test 82 skipped (missing employee or role)\n");
  }

  // Test 83
  console.log("Test 83: SUBADMIN cannot modify companyId...");
  if (xyzEmployee && abcAdmin) {
    await UserService.update(xyzEmployee.id, { companyId: abcAdmin.companyId }, xyzSubCtx);
    const after83 = await UserService.getById(xyzEmployee.id, xyzSubCtx);
    if (after83.companyId !== xyzSubadmin.companyId) throw new Error("Test 83 failed: companyId changed.");
    console.log("✓ Test 83 passed\n");
  } else {
    console.log("⊘ Test 83 skipped\n");
  }

  console.log("=== ALL FOCUSED TESTS PASSED ===");
}

main()
  .catch((err) => {
    console.error("FAILED:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
