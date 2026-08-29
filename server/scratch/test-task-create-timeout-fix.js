import prisma from "../src/config/database.js";
import TaskService from "../src/services/TaskService.js";

async function main() {
  const admin = await prisma.user.findFirst({
    where: { deletedAt: null, status: "ACTIVE", role: { name: "MAIN_ADMIN" } },
    include: { role: true },
  });
  if (!admin) throw new Error("No MAIN_ADMIN");

  const employees = await prisma.user.findMany({
    where: {
      companyId: admin.companyId,
      deletedAt: null,
      status: "ACTIVE",
      role: { name: "EMPLOYEE" },
    },
    take: 2,
  });
  if (employees.length < 1) throw new Error("Need employees");

  const freqDaily = await prisma.taskFrequency.findFirst({
    where: { frequencyName: "Daily", deletedAt: null },
  });
  const freqWeekly = await prisma.taskFrequency.findFirst({
    where: { frequencyName: "Weekly", deletedAt: null },
  });
  const dept = await prisma.department.findFirst({
    where: { companyId: admin.companyId, deletedAt: null },
  });
  const cat = await prisma.taskCategory.findFirst({
    where: { companyId: admin.companyId, deletedAt: null },
  });

  async function createCase(label, overrides) {
    const payload = {
      title: `Timeout-fix ${label} ${Date.now()}`,
      description: "Verify create no longer hangs",
      priority: "HIGH",
      companyId: admin.companyId,
      departmentId: dept?.id || null,
      categoryId: cat?.id || null,
      assignedToIds: employees.map((e) => e.id),
      approverId: employees[0].id,
      startDate: "2026-08-25T00:00:00.000Z",
      dueDate: "2026-08-31T00:00:00.000Z",
      endDate: "2026-08-31T00:00:00.000Z",
      ...overrides,
    };

    const t0 = Date.now();
    const task = await TaskService.create(payload, admin.id);
    const ms = Date.now() - t0;
    const occ = await prisma.taskOccurrence.count({ where: { taskId: task.id } });
    console.log(`OK ${label} in ${ms}ms — ${task.taskCode} occurrences=${occ}`);
    if (ms > 30000) throw new Error(`${label} still too slow: ${ms}ms`);
    return task;
  }

  console.log("Creating as", admin.email, "assignees", employees.length);

  await createCase("daily", {
    frequencyId: freqDaily.id,
    recurrenceType: "DAILY",
    durationDays: 7,
  });

  await createCase("weekly", {
    frequencyId: freqWeekly.id,
    recurrenceType: "WEEKLY",
    durationDays: 28,
    endDate: "2026-09-15T00:00:00.000Z",
  });

  await createCase("one-time-ish", {
    frequencyId: freqDaily.id,
    recurrenceType: "ONE_TIME",
    durationDays: 1,
    endDate: "2026-08-25T00:00:00.000Z",
    dueDate: "2026-08-25T00:00:00.000Z",
  });

  console.log("ALL CREATE CASES PASSED");
}

main()
  .catch((err) => {
    console.error("FAILED", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
