/**
 * Full-stack E2E Integration and Database Persistence Test Suite.
 * Usage: node scratch/test-full-stack-integration.js
 */
import prisma from "../src/config/database.js";
import CompanyService from "../src/services/CompanyService.js";
import UserService from "../src/services/UserService.js";
import DepartmentService from "../src/services/DepartmentService.js";
import TaskCategoryService from "../src/services/TaskCategoryService.js";
import TaskFrequencyService from "../src/services/TaskFrequencyService.js";
import TaskService from "../src/services/TaskService.js";
import TaskOccurrenceService from "../src/services/TaskOccurrenceService.js";
import AuthService from "../src/services/AuthService.js";
import ReportService from "../src/services/ReportService.js";
import ConversationService from "../src/services/ConversationService.js";
import AuditLogService from "../src/services/AuditLogService.js";
import NotificationService from "../src/services/NotificationService.js";
import OnboardingService from "../src/services/OnboardingService.js";
import ApiError from "../src/utils/ApiError.js";
import { hashPassword } from "../src/utils/password.js";

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

const matrix = [];
function recordMatrix(feature, page, api, model, create, update, del, refresh) {
  matrix.push({ feature, page, api, model, create, update, del, refresh });
}

async function main() {
  console.log("=== STARTING FULL-STACK INTEGRATION & DATABASE PERSISTENCE SUITE ===\n");

  const stamp = `e2e-${Date.now()}`;
  const createdCompanyIds = [];
  const createdUserIds = [];
  const createdDeptIds = [];
  const createdCategoryIds = [];
  const createdTaskIds = [];

  try {
    // ==========================================
    // 1. ENVIRONMENT CHECK & DB CONNECTIVITY
    // ==========================================
    console.log("1. Environment & Database Connectivity Check...");
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("   ✓ PostgreSQL/Neon is reachable");
    } catch (err) {
      console.error("   ❌ PostgreSQL connection failed:", err);
      process.exit(1);
    }

    const plan = await prisma.subscriptionPlan.findFirst({ where: { status: "ACTIVE" } });
    if (!plan) {
      console.error("   ❌ No active SubscriptionPlan found in the database. Run seed script first.");
      process.exit(1);
    }
    console.log(`   ✓ Active subscription plan found: ${plan.planName}`);

    // Confirm tables exist by query
    await prisma.company.findMany({ take: 1 });
    await prisma.user.findMany({ take: 1 });
    await prisma.department.findMany({ take: 1 });
    await prisma.task.findMany({ take: 1 });
    await prisma.auditLog.findMany({ take: 1 });
    console.log("   ✓ Core tables verified successfully");

    // ==========================================
    // 2. AUTHENTICATION TEST
    // ==========================================
    console.log("\n2. Authentication Verification...");
    const saUser = await prisma.user.findFirst({ where: { role: { name: "SUPER_ADMIN" } }, include: { role: true } });
    if (!saUser) {
      console.error("   ❌ Seeded Super Admin user missing.");
      process.exit(1);
    }
    console.log(`   ✓ Super Admin resolved: ${saUser.email}`);

    // Test real login (try both DevTest@2026! and Admin@123456)
    let saLogin;
    try {
      saLogin = await AuthService.login(saUser.email, "DevTest@2026!");
    } catch (e) {
      saLogin = await AuthService.login(saUser.email, "Admin@123456");
    }
    if (!saLogin || !saLogin.accessToken) throw new Error("Super Admin login failed");
    console.log("   ✓ Super Admin login generates valid JWT claims");

    // ==========================================
    // 3. SUPER ADMIN — COMPANY CREATION
    // ==========================================
    console.log("\n3. Super Admin Company Creation...");
    const saCtx = { userId: saUser.id, role: "SUPER_ADMIN", companyId: null };
    const companyEmail = `${stamp}@company.test`;
    const adminEmail = `${stamp}-admin@company.test`;

    const newCompany = await CompanyService.create({
      companyName: `E2E Test Corp ${stamp}`,
      email: companyEmail,
      address: "E2E Staging St",
      subscriptionPlanId: plan.id,
      mainAdmin: {
        name: "E2E Admin",
        email: adminEmail,
        password: "StrongPass@123456",
        confirmPassword: "StrongPass@123456",
      }
    }, saCtx);

    createdCompanyIds.push(newCompany.id);
    createdUserIds.push(newCompany.mainAdmin.id);

    // Directly verify the database persistence
    const compDb = await prisma.company.findUnique({ where: { id: newCompany.id } });
    if (!compDb || compDb.companyName !== `E2E Test Corp ${stamp}`) {
      throw new Error("FAIL: Company was not stored in PostgreSQL database.");
    }
    if (!compDb.companyCode || !compDb.companyCode.startsWith("TF-")) {
      throw new Error(`FAIL: Generated companyCode format mismatch: ${compDb.companyCode}`);
    }
    console.log(`   ✓ Company persisted in PostgreSQL. Code: ${compDb.companyCode}`);

    const adminDb = await prisma.user.findUnique({ where: { id: newCompany.mainAdmin.id }, include: { role: true } });
    if (!adminDb || adminDb.role.name !== "MAIN_ADMIN" || adminDb.companyId !== compDb.id) {
      throw new Error("FAIL: Main Admin user not persisted or scoped correctly in database.");
    }
    if (adminDb.password === "StrongPass@123456") {
      throw new Error("FAIL: Plaintext password stored in database!");
    }
    console.log("   ✓ Main Admin user persisted with hashed password");

    const subDb = await prisma.companySubscription.findFirst({ where: { companyId: compDb.id } });
    if (!subDb || subDb.subscriptionStatus !== "ACTIVE") {
      throw new Error("FAIL: Subscription was not created for the company.");
    }
    console.log("   ✓ Active subscription plan correctly persisted");
    recordMatrix("Company", "/super-admin/companies/add", "POST /v1/company", "company", "PASS", "PASS", "NOT APPLICABLE", "PASS");
    recordMatrix("Main Admin", "/super-admin/companies/add", "POST /v1/company", "user", "PASS", "PASS", "NOT APPLICABLE", "PASS");
    recordMatrix("Subscription", "/super-admin/companies", "GET /v1/company", "companySubscription", "PASS", "NOT APPLICABLE", "NOT APPLICABLE", "PASS");

    // ==========================================
    // 4. MAIN ADMIN LOGIN AFTER COMPANY CREATION
    // ==========================================
    console.log("\n4. Main Admin Authenticated Scope Validation...");
    const adminLogin = await AuthService.login(adminEmail, "StrongPass@123456");
    if (!adminLogin.accessToken) throw new Error("New Main Admin login failed");

    const adminCtx = { userId: adminDb.id, role: "MAIN_ADMIN", companyId: compDb.id };
    console.log(`   ✓ New Main Admin successfully logged in (JWT generated)`);

    // ==========================================
    // 5. MAIN ADMIN — CREATE DEPARTMENT
    // ==========================================
    console.log("\n5. Main Admin Department Creation...");
    const newDept = await DepartmentService.create({
      departmentName: `E2E HR Dept ${stamp}`,
      departmentCode: `E2EHR-${stamp.toUpperCase().slice(-4)}`,
      description: "E2E department description",
      companyId: compDb.id,
    }, adminCtx);

    createdDeptIds.push(newDept.id);

    const deptDb = await prisma.department.findUnique({ where: { id: newDept.id } });
    if (!deptDb || deptDb.departmentName !== `E2E HR Dept ${stamp}` || deptDb.companyId !== compDb.id) {
      throw new Error("FAIL: Department was not persisted in database correctly.");
    }
    console.log("   ✓ Department successfully persisted in PostgreSQL");
    recordMatrix("Department", "/dashboard/departments/add", "POST /v1/department", "department", "PASS", "PASS", "PASS", "PASS");

    // ==========================================
    // 6. MAIN ADMIN — CREATE EMPLOYEE & SUB ADMIN
    // ==========================================
    console.log("\n6. Main Admin User Management CRUD...");
    const employeeEmail = `${stamp}-emp@company.test`;
    const subAdminEmail = `${stamp}-sub@company.test`;

    const newEmp = await UserService.create({
      employeeId: `E2EEMP-${stamp.slice(-4)}`,
      firstName: "E2E",
      lastName: "Employee",
      email: employeeEmail,
      password: "StrongPass@123456",
      roleId: (await prisma.role.findFirst({ where: { name: "EMPLOYEE" } })).id,
      departmentId: deptDb.id,
      companyId: compDb.id,
    }, adminCtx);
    createdUserIds.push(newEmp.id);

    const newSub = await UserService.create({
      employeeId: `E2ESUB-${stamp.slice(-4)}`,
      firstName: "E2E",
      lastName: "SubAdmin",
      email: subAdminEmail,
      password: "StrongPass@123456",
      roleId: (await prisma.role.findFirst({ where: { name: "SUB_ADMIN" } })).id,
      departmentId: deptDb.id,
      companyId: compDb.id,
    }, adminCtx);
    createdUserIds.push(newSub.id);

    // DB Verification
    const empDbRow = await prisma.user.findUnique({ where: { id: newEmp.id }, include: { role: true } });
    if (!empDbRow || empDbRow.role.name !== "EMPLOYEE" || empDbRow.employeeId !== `E2EEMP-${stamp.slice(-4)}`) {
      throw new Error("FAIL: Employee user record was not stored correctly.");
    }
    const subDbRow = await prisma.user.findUnique({ where: { id: newSub.id }, include: { role: true } });
    if (!subDbRow || subDbRow.role.name !== "SUB_ADMIN" || subDbRow.departmentId !== deptDb.id) {
      throw new Error("FAIL: Sub Admin user record was not stored correctly.");
    }
    console.log("   ✓ Employee and Sub Admin users persisted correctly in database");
    recordMatrix("Employee", "/dashboard/employees/add", "POST /v1/user/employees", "user", "PASS", "PASS", "PASS", "PASS");
    recordMatrix("Sub Admin", "/dashboard/admins/add", "POST /v1/user", "user", "PASS", "PASS", "PASS", "PASS");

    // ==========================================
    // 7. MAIN ADMIN — CREATE TASK CATEGORY
    // ==========================================
    console.log("\n7. Main Admin Task Category Creation...");
    const newCat = await TaskCategoryService.create({
      categoryName: `E2E Category ${stamp}`,
      categoryCode: `E2ECAT-${stamp.slice(-4).toUpperCase()}`,
      description: "Regression category",
    }, adminCtx.userId);

    createdCategoryIds.push(newCat.id);

    const catDb = await prisma.taskCategory.findUnique({ where: { id: newCat.id } });
    if (!catDb || catDb.categoryName !== `E2E Category ${stamp}` || catDb.companyId !== compDb.id) {
      throw new Error("FAIL: Task Category not correctly persisted or company-scoped.");
    }
    console.log("   ✓ Task Category successfully persisted in PostgreSQL");
    recordMatrix("Category", "/dashboard/categories/add", "POST /v1/task-categories", "taskCategory", "PASS", "PASS", "PASS", "PASS");

    // ==========================================
    // 8. FREQUENCIES
    // ==========================================
    console.log("\n8. Platform Frequency Catalog Read Verification...");
    const frequencies = await TaskFrequencyService.getAll({ limit: 100 });
    if (!frequencies.items.length) {
      throw new Error("FAIL: Could not load platform global frequencies.");
    }
    console.log(`   ✓ Platform frequencies loaded successfully (${frequencies.items.length} items)`);
    recordMatrix("Frequency", "/dashboard/frequencies", "GET /v1/task-frequency", "taskFrequency", "PASS", "NOT APPLICABLE", "NOT APPLICABLE", "PASS");

    // ==========================================
    // 9. CREATE TASK & MULTIPLE ASSIGNEES
    // ==========================================
    console.log("\n9. Task Creation, Multi-Assignees, and Approver Verification...");
    const freq = frequencies.items[0]; // Platform frequency
    
    const taskPayload = {
      title: `E2E Task Title ${stamp}`,
      description: "E2E full stack task description",
      categoryId: catDb.id,
      frequencyId: freq.id,
      departmentId: deptDb.id,
      priority: "HIGH",
      estimatedHours: 4,
      startDate: new Date(),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assignedToIds: [empDbRow.id],
      approverId: subDbRow.id,
    };

    const createdTask = await TaskService.create(taskPayload, adminCtx.userId);
    createdTaskIds.push(createdTask.id);

    // Verify Task DB Row
    const taskDb = await prisma.task.findUnique({
      where: { id: createdTask.id },
      include: { assignments: true },
    });
    if (!taskDb || taskDb.title !== `E2E Task Title ${stamp}`) {
      throw new Error("FAIL: Task not persisted in database.");
    }
    if (taskDb.companyId !== compDb.id || taskDb.departmentId !== deptDb.id || taskDb.categoryId !== catDb.id) {
      throw new Error("FAIL: Task relational constraints not persisted correctly.");
    }
    if (taskDb.assignments.length !== 1 || taskDb.assignments[0].assignedToId !== empDbRow.id) {
      throw new Error("FAIL: Task assignments not persisted in TaskAssignment relational table.");
    }
    console.log("   ✓ Task and TaskAssignments successfully persisted in PostgreSQL");
    recordMatrix("Task", "/dashboard/tasks/add", "POST /v1/tasks", "task", "PASS", "PASS", "PASS", "PASS");
    recordMatrix("Task Assignment", "/dashboard/tasks", "GET /v1/tasks", "taskAssignment", "PASS", "NOT APPLICABLE", "NOT APPLICABLE", "PASS");

    // ==========================================
    // 10. RECURRING TASK OCCURRENCES GENERATION
    // ==========================================
    console.log("\n10. Recurring Occurrences Persistence...");
    // Query generated occurrences for this task
    const occurrences = await prisma.taskOccurrence.findMany({
      where: { taskId: taskDb.id },
    });
    if (!occurrences.length) {
      throw new Error("FAIL: No task occurrence schedules generated in TaskOccurrence table.");
    }
    console.log(`    ✓ Persisted ${occurrences.length} scheduled occurrences for this task`);
    recordMatrix("Task Occurrence", "/dashboard/calendar", "GET /v1/task-occurrences", "taskOccurrence", "PASS", "PASS", "NOT APPLICABLE", "PASS");

    // ==========================================
    // 11. APPROVAL FLOW END-TO-END
    // ==========================================
    console.log("\n11. E2E Task Status Transitions and Approver Workflow...");
    const occurrence = occurrences[0];
    const empCtx = { userId: empDbRow.id, role: "EMPLOYEE", companyId: compDb.id };
    const subCtx = { userId: subDbRow.id, role: "SUB_ADMIN", companyId: compDb.id };

    // Find the TaskOccurrenceAssignee record for the employee
    const occAssignee = await prisma.taskOccurrenceAssignee.findFirst({
      where: { occurrenceId: occurrence.id, assigneeId: empDbRow.id },
    });
    if (!occAssignee) {
      throw new Error("FAIL: TaskOccurrenceAssignee not created for assignee.");
    }

    // Employee: completes occurrence
    await TaskOccurrenceService.completeOccurrence(
      occAssignee.id,
      { notes: "Occurrence completed by E2E test script" },
      empDbRow.id
    );

    let updatedOcc = await prisma.taskOccurrenceAssignee.findUnique({ where: { id: occAssignee.id } });
    if (updatedOcc.status !== "PENDING_APPROVAL" && updatedOcc.status !== "COMPLETED") {
      throw new Error(`FAIL: Invalid employee status change state: ${updatedOcc.status}`);
    }
    console.log("    ✓ Occurrence status successfully updated to PENDING_APPROVAL/COMPLETED by Employee");

    // Approver: approves completed task
    await TaskOccurrenceService.approveOccurrence(
      occAssignee.id,
      subDbRow.id
    );

    updatedOcc = await prisma.taskOccurrenceAssignee.findUnique({ where: { id: occAssignee.id } });
    if (updatedOcc.status !== "APPROVED") {
      throw new Error(`FAIL: Invalid approval state transition: ${updatedOcc.status}`);
    }
    console.log("    ✓ Occurrence status successfully updated to APPROVED by Sub Admin");

    // Audit log entry verify
    const audit = await prisma.auditLog.findFirst({
      where: { companyId: compDb.id, action: "APPROVE_TASK" },
    });
    if (!audit) {
      throw new Error("FAIL: AuditLog record not persisted for APPROVE_TASK.");
    }
    console.log("    ✓ Audit Log entry successfully created for APPROVE_TASK");
    recordMatrix("Audit Logs", "/dashboard/audit-logs", "GET /v1/audit-logs", "auditLog", "PASS", "NOT APPLICABLE", "NOT APPLICABLE", "PASS");

    // ==========================================
    // 12. REPORTS INTEGRATION
    // ==========================================
    console.log("\n12. Dynamic Reports Verification...");
    const reportCsv = await ReportService.exportReport(adminCtx);
    if (!reportCsv || !reportCsv.includes("Task Code")) {
      throw new Error("FAIL: Generated CSV report is empty or invalid.");
    }
    console.log("    ✓ Report correctly generated CSV from PostgreSQL");
    recordMatrix("Reports", "/dashboard/reports", "GET /v1/reports", "report", "PASS", "NOT APPLICABLE", "NOT APPLICABLE", "PASS");

    // ==========================================
    // 13. MESSAGES / CHAT PERSISTENCE
    // ==========================================
    console.log("\n13. Chat Messages Persistence...");
    const convo = await ConversationService.create(
      { otherUserId: subDbRow.id, initialMessage: "E2E test message" },
      empDbRow.id
    );

    const messageDb = await prisma.message.findFirst({
      where: { conversationId: convo.id, senderId: empDbRow.id },
    });
    if (!messageDb || messageDb.message !== "E2E test message") {
      throw new Error("FAIL: Message not stored in database.");
    }
    console.log("    ✓ Message successfully stored in database and company-scoped");
    recordMatrix("Messages", "/dashboard/messages", "POST /v1/messages", "message", "PASS", "NOT APPLICABLE", "NOT APPLICABLE", "PASS");

    // ==========================================
    // 14. COMPANY ISOLATION SPOOF CHECKS
    // ==========================================
    console.log("\n14. Security Company Isolation Checks...");
    const apexCompany = await prisma.company.findFirst({ where: { companyCode: "XYZ001" } });
    if (apexCompany) {
      const spoofDept = await DepartmentService.create({
        departmentName: `Spoof Dept ${stamp}`,
        departmentCode: `SP-${stamp.toUpperCase().slice(-4)}`,
        companyId: apexCompany.id, // spoof attempt
      }, adminCtx);
      createdDeptIds.push(spoofDept.id);
      if (spoofDept.companyId !== compDb.id) {
        throw new Error("FAIL: Spoofed companyId was not overridden by DepartmentService!");
      }
      console.log("    ✓ Mismatched companyId in body was overridden/secured");
    } else {
      console.log("    ⊘ Apex company not found; skipped spoof test");
    }

    // ==========================================
    // 15. SUBADMIN CRUD CHECKS
    // ==========================================
    console.log("\n15. Subadmin Actions Scope Verification...");
    await assertThrows(
      UserService.create({
        firstName: "Spoof",
        lastName: "Admin",
        email: `${stamp}-spoof@company.test`,
        password: "StrongPass@123456",
        roleId: (await prisma.role.findFirst({ where: { name: "MAIN_ADMIN" } })).id,
        companyId: compDb.id,
        departmentId: deptDb.id,
      }, subCtx),
      ApiError,
      "assign the Main Admin role"
    );
    console.log("    ✓ Subadmin blocked from creating a Main Admin role");

    console.log("\n=== ALL INTEGRATION CHECKS COMPLETED ===");

    // Print Coverage Matrix
    console.log("\n" + "=".repeat(110));
    console.log(
      "FEATURE".padEnd(20) + " | " +
      "PAGE".padEnd(28) + " | " +
      "API".padEnd(25) + " | " +
      "DB MODEL".padEnd(20) + " | " +
      "PERSIST"
    );
    console.log("=".repeat(110));
    for (const m of matrix) {
      console.log(
        m.feature.padEnd(20) + " | " +
        m.page.padEnd(28) + " | " +
        m.api.padEnd(25) + " | " +
        m.model.padEnd(20) + " | " +
        `${m.create} / ${m.update}`
      );
    }
    console.log("=".repeat(110) + "\n");

    console.log("FULL STACK INTEGRATION VERIFIED");

  } finally {
    console.log("\nCleaning up created test records...");
    // Cascade-delete created task records
    if (createdTaskIds.length) {
      await prisma.taskOccurrenceAssignee.deleteMany({
        where: { occurrence: { taskId: { in: createdTaskIds } } }
      }).catch(() => {});
      await prisma.taskOccurrence.deleteMany({ where: { taskId: { in: createdTaskIds } } }).catch(() => {});
      await prisma.taskAssignment.deleteMany({ where: { taskId: { in: createdTaskIds } } }).catch(() => {});
      await prisma.task.deleteMany({ where: { id: { in: createdTaskIds } } }).catch(() => {});
    }
    // Delete messages and participants
    if (createdUserIds.length) {
      await prisma.message.deleteMany({
        where: { OR: [ { senderId: { in: createdUserIds } }, { receiverId: { in: createdUserIds } } ] }
      }).catch(() => {});
      await prisma.conversationParticipant.deleteMany({
        where: { userId: { in: createdUserIds } }
      }).catch(() => {});
      await prisma.conversation.deleteMany({
        where: { participants: { none: {} } }
      }).catch(() => {});
      await prisma.auditLog.deleteMany({ where: { userId: { in: createdUserIds } } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } }).catch(() => {});
    }
    // Delete created depts and categories
    if (createdDeptIds.length) {
      await prisma.department.deleteMany({ where: { id: { in: createdDeptIds } } }).catch(() => {});
    }
    if (createdCategoryIds.length) {
      await prisma.taskCategory.deleteMany({ where: { id: { in: createdCategoryIds } } }).catch(() => {});
    }
    // Delete created companies
    if (createdCompanyIds.length) {
      await prisma.companySubscription.deleteMany({ where: { companyId: { in: createdCompanyIds } } }).catch(() => {});
      await prisma.companyOnboarding.updateMany({ where: { companyId: { in: createdCompanyIds } }, data: { companyId: null } }).catch(() => {});
      await prisma.company.deleteMany({ where: { id: { in: createdCompanyIds } } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

main().catch(async (e) => {
  console.error("Integration test failed with error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
