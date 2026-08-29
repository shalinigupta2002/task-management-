import prisma from "../src/config/database.js";
import UserService from "../src/services/UserService.js";
import TaskService from "../src/services/TaskService.js";
import TaskOccurrenceService from "../src/services/TaskOccurrenceService.js";
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

async function runTests() {
  console.log("=== STARTING EMPLOYEE 'MY TASKS' FOCUSED AUDIT VERIFICATION ===");

  // 1. Resolve seed data
  const companyA = await prisma.company.findFirst({
    where: { companyName: "TechSolutions Pvt Ltd" },
  });
  const apexAdmin = await prisma.user.findFirst({
    where: { email: "amit.patel@greenleaf.com" },
  });
  const companyB = apexAdmin ? await prisma.company.findFirst({
    where: { id: apexAdmin.companyId },
  }) : null;
  const superAdmin = await prisma.user.findFirst({
    where: { email: "superadmin@taskflow.com" },
  });
  const employeeRole = await prisma.role.findFirst({
    where: { name: "EMPLOYEE" },
  });
  const techSolutionsAdmin = await prisma.user.findFirst({
    where: { email: "rajesh.kumar@techsolutions.com" },
  });

  if (!companyA || !companyB || !superAdmin || !employeeRole || !techSolutionsAdmin) {
    console.error("Error: Seed data missing. Detailed states:", {
      companyA: !!companyA,
      companyB: !!companyB,
      superAdmin: !!superAdmin,
      employeeRole: !!employeeRole,
      techSolutionsAdmin: !!techSolutionsAdmin,
    });
    process.exit(1);
  }

  const superCtx = { role: "SUPER_ADMIN", userId: superAdmin.id };
  const companyADepts = await prisma.department.findMany({ where: { companyId: companyA.id, deletedAt: null } });
  const deptA = companyADepts[0];

  // Helper to create test employees
  const createTestEmployee = async (email, companyId, deptId) => {
    return UserService.create({
      employeeId: "EMP-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      firstName: "Test",
      lastName: "Employee",
      email,
      password: "Password@123",
      roleId: employeeRole.id,
      companyId,
      departmentId: deptId || null,
      status: "ACTIVE",
    }, superCtx);
  };

  const randSuffix = () => Math.random().toString(36).substring(2, 8);
  const emailA1 = `empA1_${randSuffix()}@techsolutions.com`;
  const emailA2 = `empA2_${randSuffix()}@techsolutions.com`;
  const emailA3 = `empA3_${randSuffix()}@techsolutions.com`;
  const emailA4 = `empA4_${randSuffix()}@techsolutions.com`;
  const emailB1 = `empB1_${randSuffix()}@greenleaf.com`;

  console.log("Creating test users...");
  const empA1 = await createTestEmployee(emailA1, companyA.id, deptA.id);
  const empA2 = await createTestEmployee(emailA2, companyA.id, deptA.id);
  const empA3 = await createTestEmployee(emailA3, companyA.id, deptA.id);
  const empA4 = await createTestEmployee(emailA4, companyA.id, deptA.id);
  const empB1 = await createTestEmployee(emailB1, companyB.id);

  try {
    // Test 1: New employee with zero assignments -> 0 tasks
    console.log("\nRunning Test 1: New employee with zero assignments sees 0 tasks...");
    const list1 = await TaskService.getAll({}, empA1.id);
    if (list1.items.length !== 0) {
      throw new Error(`Expected 0 tasks, but found ${list1.items.length}`);
    }
    console.log("Success: Brand-new employee has zero tasks.");

    // Create a task
    const category = await prisma.taskCategory.findFirst({ where: { companyId: companyA.id, deletedAt: null } });
    const frequency = await prisma.taskFrequency.findFirst({ where: { deletedAt: null } });
    if (!category || !frequency) {
      throw new Error("Missing task category or frequency in company A.");
    }

    console.log("\nCreating Task A...");
    const taskA = await TaskService.create({
      title: `Task A - Singular Assignment ${randSuffix()}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      categoryId: category.id,
      frequencyId: frequency.id,
      departmentId: deptA.id,
      assignedToId: empA1.id,
      companyId: companyA.id,
    }, techSolutionsAdmin.id);

    // Test 2: Employee A sees only A's assignments
    console.log("\nRunning Test 2: Employee A sees only A's assignments...");
    const list2 = await TaskService.getAll({}, empA1.id);
    if (list2.items.length !== 1 || list2.items[0].id !== taskA.id) {
      throw new Error(`Expected exactly Task A, but got: ${JSON.stringify(list2.items)}`);
    }
    console.log("Success: Employee A sees their assigned task.");

    // Test 3: Employee B cannot see A's tasks
    console.log("\nRunning Test 3: Employee B cannot see A's tasks...");
    const list3 = await TaskService.getAll({}, empA2.id);
    if (list3.items.length !== 0) {
      throw new Error(`Expected Employee B to see 0 tasks, but got ${list3.items.length}`);
    }
    console.log("Success: Employee B is isolated from Employee A's tasks.");

    // Test 4: Multiple assignees work
    console.log("\nCreating Task B with multiple assignees (A1, A2, A3)...");
    const taskB = await TaskService.create({
      title: `Task B - Multiple Assignees ${randSuffix()}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      categoryId: category.id,
      frequencyId: frequency.id,
      departmentId: deptA.id,
      assignedToIds: [empA1.id, empA2.id, empA3.id],
      companyId: companyA.id,
    }, techSolutionsAdmin.id);

    console.log("\nRunning Test 4: Verify multiple assignees access...");
    const listA1 = await TaskService.getAll({}, empA1.id);
    const listA2 = await TaskService.getAll({}, empA2.id);
    const listA3 = await TaskService.getAll({}, empA3.id);
    const listA4 = await TaskService.getAll({}, empA4.id);

    const hasTaskB = (list) => list.items.some((t) => t.id === taskB.id);

    if (!hasTaskB(listA1) || !hasTaskB(listA2) || !hasTaskB(listA3)) {
      throw new Error("Expected empA1, empA2, and empA3 to see Task B.");
    }
    if (hasTaskB(listA4)) {
      throw new Error("Expected empA4 (non-assignee) to NOT see Task B.");
    }
    console.log("Success: Multiple assignee scoping verified.");

    // Test 5: Cross-company task hidden
    console.log("\nRunning Test 5: Cross-company task hidden...");
    const listB1 = await TaskService.getAll({}, empB1.id);
    if (hasTaskB(listB1) || listB1.items.some((t) => t.companyId === companyA.id)) {
      throw new Error("Expected Company B employee to see 0 Company A tasks.");
    }
    console.log("Success: Company isolation verified on task listing.");

    // Test 6: Task ID IDOR blocked
    console.log("\nRunning Test 6: Task ID IDOR blocked...");
    await assertThrows(
      TaskService.getById(taskA.id, empB1.id),
      ApiError,
      "access denied"
    );
    console.log("Success: Direct get by ID cross-company access blocked.");

    // Test 7: Spoofed userId / assignedToId blocked/ignored
    console.log("\nRunning Test 7: Spoofed parameters blocked/ignored...");
    // Employee A2 tries to query A1's tasks by passing assignedToId in query params
    const listSpoof = await TaskService.getAll({ assignedToId: empA1.id }, empA2.id);
    // If it correctly overrides, it should only return tasks assigned to A2 (which is 1 task, Task B)
    if (listSpoof.items.length !== 1 || listSpoof.items[0].id !== taskB.id) {
      throw new Error(`Expected only Task B to be returned for A2, but got: ${JSON.stringify(listSpoof.items)}`);
    }
    console.log("Success: Parameter spoofing ignored. Scoped by authenticated identity.");

    // Test 8: Recurring task occurrences scoped correctly
    console.log("\nCreating a recurring task for Employee A1...");
    const dailyFreq = await prisma.taskFrequency.findFirst({ where: { frequencyName: "Daily", deletedAt: null } });
    if (!dailyFreq) throw new Error("Daily frequency not found.");

    const recurringTask = await TaskService.create({
      title: `Recurring Task - A1 Only ${randSuffix()}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 86400000), // 5 days
      categoryId: category.id,
      frequencyId: dailyFreq.id,
      departmentId: deptA.id,
      assignedToId: empA1.id,
      companyId: companyA.id,
    }, techSolutionsAdmin.id);

    console.log("\nRunning Test 8: Recurring task occurrences scoped correctly...");
    const calendarA1 = await TaskOccurrenceService.getCalendar({}, empA1.id);
    const calendarA2 = await TaskOccurrenceService.getCalendar({}, empA2.id);

    const hasOccsOfTask = (cal, taskId) => cal.some((occ) => occ.taskId === taskId);

    if (!hasOccsOfTask(calendarA1, recurringTask.id)) {
      throw new Error("Expected Employee A1 to see occurrences of the recurring task.");
    }
    if (hasOccsOfTask(calendarA2, recurringTask.id)) {
      throw new Error("Expected Employee A2 to NOT see occurrences of recurring task.");
    }
    console.log("Success: Occurrence calendar is scoped correctly.");

    // Test 9: Search/filter operate on scoped dataset
    console.log("\nRunning Test 9: Search/filter operate on scoped dataset...");
    const listSearchMatch = await TaskService.getAll({ search: "Singular" }, empA1.id);
    if (listSearchMatch.items.length === 0 || !listSearchMatch.items.every(t => t.title.includes("Singular"))) {
      throw new Error("Search filter failed to return matching assigned task.");
    }
    const listSearchNoMatch = await TaskService.getAll({ search: "NonExistentTaskTitlePattern" }, empA1.id);
    if (listSearchNoMatch.items.length !== 0) {
      throw new Error("Search filter returned non-matching task.");
    }
    console.log("Success: Search and filtering verified on scoped dataset.");

    // Test 10: No mock/fallback tasks returned
    console.log("\nRunning Test 10: No mock/fallback tasks returned...");
    const allA1Tasks = await TaskService.getAll({}, empA1.id);
    for (const t of allA1Tasks.items) {
      if (t.id.startsWith("TSK-100")) {
        throw new Error(`Mock task ID found in database response: ${t.id}`);
      }
    }
    console.log("Success: No mock or fallback tasks in API response.");

    console.log("\n=== ALL EMPLOYEE MY TASKS AUDIT TESTS PASSED SUCCESSFULLY ===");

  } finally {
    console.log("\nCleaning up test users and tasks...");
    // Let's delete the created tasks and assignments to keep DB clean
    await prisma.taskOccurrenceAssignee.deleteMany({
      where: { assigneeId: { in: [empA1.id, empA2.id, empA3.id, empA4.id, empB1.id] } }
    });
    await prisma.taskOccurrence.deleteMany({
      where: { taskId: { in: [
        ...(await prisma.task.findMany({ where: { createdById: techSolutionsAdmin.id } })).map(t => t.id)
      ] } }
    });
    await prisma.taskAssignment.deleteMany({
      where: { assignedToId: { in: [empA1.id, empA2.id, empA3.id, empA4.id, empB1.id] } }
    });
    await prisma.task.deleteMany({
      where: {
        title: { contains: "Task A - Singular" }
      }
    });
    await prisma.task.deleteMany({
      where: {
        title: { contains: "Task B - Multiple" }
      }
    });
    await prisma.task.deleteMany({
      where: {
        title: { contains: "Recurring Task - A1" }
      }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [empA1.id, empA2.id, empA3.id, empA4.id, empB1.id] } }
    });
    console.log("Cleanup completed.");
  }
}

runTests().catch((err) => {
  console.error("\nTest suite failed:", err);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
