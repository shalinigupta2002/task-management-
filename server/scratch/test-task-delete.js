import prisma from "../src/config/database.js";
import TaskService from "../src/services/TaskService.js";

async function main() {
  const admin = await prisma.user.findFirst({
    where: { deletedAt: null, status: "ACTIVE", role: { name: "MAIN_ADMIN" } },
  });
  if (!admin) throw new Error("No MAIN_ADMIN");

  const employee = await prisma.user.findFirst({
    where: {
      companyId: admin.companyId,
      deletedAt: null,
      status: "ACTIVE",
      role: { name: "EMPLOYEE" },
    },
  });
  const freq = await prisma.taskFrequency.findFirst({
    where: { frequencyName: "Daily", deletedAt: null },
  });

  const created = await TaskService.create({
    title: `Delete-test ${Date.now()}`,
    description: "temp",
    priority: "MEDIUM",
    companyId: admin.companyId,
    frequencyId: freq.id,
    assignedToIds: [employee.id],
    approverId: employee.id,
    recurrenceType: "DAILY",
    durationDays: 3,
    startDate: "2026-08-25T00:00:00.000Z",
    endDate: "2026-08-27T00:00:00.000Z",
    dueDate: "2026-08-27T00:00:00.000Z",
  }, admin.id);

  const occBefore = await prisma.taskOccurrence.count({ where: { taskId: created.id } });
  console.log("Created", created.id, "occurrences", occBefore);

  const result = await TaskService.remove(created.id, admin.id);
  console.log("Delete result", result);

  const soft = await prisma.task.findUnique({ where: { id: created.id } });
  console.log("deletedAt", soft.deletedAt, "status", soft.status);

  const openAssignees = await prisma.taskOccurrenceAssignee.count({
    where: {
      occurrence: { taskId: created.id },
      status: { notIn: ["CANCELLED", "APPROVED"] },
    },
  });
  console.log("open occurrence assignees after delete", openAssignees);

  // Employee should not delete
  try {
    const another = await TaskService.create({
      title: `Delete-forbid ${Date.now()}`,
      companyId: admin.companyId,
      frequencyId: freq.id,
      assignedToIds: [employee.id],
      startDate: "2026-08-25T00:00:00.000Z",
      endDate: "2026-08-25T00:00:00.000Z",
      recurrenceType: "ONE_TIME",
    }, admin.id);
    await TaskService.remove(another.id, employee.id);
    console.error("FAIL: employee was allowed to delete");
    process.exitCode = 1;
  } catch (err) {
    console.log("OK employee forbidden:", err.message);
  }

  console.log("DELETE TESTS PASSED");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
