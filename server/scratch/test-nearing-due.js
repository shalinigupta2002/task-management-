/**
 * Tasks Nearing Due — classification + tenant isolation smoke tests.
 * Run: node server/scratch/test-nearing-due.js
 */
import { PrismaClient } from "@prisma/client";
import {
  getNearingDueWindow,
  nearingDueWhere,
  getNearingDueDays,
  startOfLocalDay,
  addLocalDays,
} from "../src/utils/nearingDue.js";

const prisma = new PrismaClient();

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const now = new Date();
  const todayStart = startOfLocalDay(now);
  const threshold = getNearingDueDays();
  const { nearingStart, nearingEndExclusive } = getNearingDueWindow(now, threshold);

  console.log(`Threshold days: ${threshold}`);
  console.log(`Today: ${todayStart.toISOString()}`);
  console.log(`Nearing window: [${nearingStart.toISOString()} .. ${nearingEndExclusive.toISOString()})`);

  assert(nearingStart.getTime() === addLocalDays(todayStart, 1).getTime(), "nearing starts tomorrow");
  assert(nearingEndExclusive.getTime() === addLocalDays(todayStart, threshold + 1).getTime(), "nearing ends after threshold");

  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    take: 2,
    orderBy: { createdAt: "asc" },
  });
  assert(companies.length >= 1, "Need at least one company in DB");

  const companyA = companies[0];
  const companyB = companies[1] || null;

  const mainAdmin = await prisma.user.findFirst({
    where: {
      companyId: companyA.id,
      deletedAt: null,
      role: { name: "MAIN_ADMIN" },
    },
    include: { role: true },
  });
  assert(mainAdmin, "Need MAIN_ADMIN for company A");

  const dept = await prisma.department.findFirst({
    where: { companyId: companyA.id, deletedAt: null },
  });
  assert(dept, "Need a department in company A");

  const category = await prisma.taskCategory.findFirst({
    where: { companyId: companyA.id, deletedAt: null },
  });

  const suffix = Date.now().toString(36);
  const mkDue = (offsetDays) => {
    const d = addLocalDays(todayStart, offsetDays);
    d.setHours(17, 0, 0, 0);
    return d;
  };

  const base = {
    companyId: companyA.id,
    departmentId: dept.id,
    ...(category?.id ? { categoryId: category.id } : {}),
    createdById: mainAdmin.id,
    priority: "MEDIUM",
    recurrenceType: "ONE_TIME",
  };

  const created = [];
  async function createTask(title, dueOffset, status = "OPEN") {
    const task = await prisma.task.create({
      data: {
        ...base,
        title,
        taskCode: `ND-${suffix}-${created.length + 1}`,
        status,
        dueDate: dueOffset == null ? null : mkDue(dueOffset),
        startDate: todayStart,
      },
    });
    created.push(task.id);
    return task;
  }

  const dueToday = await createTask("ND Today", 0);
  const dueTomorrow = await createTask("ND Tomorrow", 1);
  const dueIn2 = await createTask("ND In 2", 2);
  const dueIn3 = await createTask("ND In 3", 3);
  const dueIn4 = await createTask("ND Outside", 4);
  const completedNear = await createTask("ND Completed Near", 1, "COMPLETED");
  const overdueTask = await createTask("ND Overdue", -2, "OVERDUE");

  let otherCompanyTask = null;
  if (companyB) {
    const adminB = await prisma.user.findFirst({
      where: { companyId: companyB.id, deletedAt: null },
    });
    const deptB = await prisma.department.findFirst({
      where: { companyId: companyB.id, deletedAt: null },
    });
    if (adminB && deptB) {
      otherCompanyTask = await prisma.task.create({
        data: {
          companyId: companyB.id,
          departmentId: deptB.id,
          createdById: adminB.id,
          title: "ND Other Company Near",
          taskCode: `ND-${suffix}-X`,
          status: "OPEN",
          dueDate: mkDue(1),
          startDate: todayStart,
          priority: "MEDIUM",
          recurrenceType: "ONE_TIME",
        },
      });
      created.push(otherCompanyTask.id);
    }
  }

  const whereA = { deletedAt: null, companyId: companyA.id, ...nearingDueWhere(now, threshold) };
  const nearingIds = new Set(
    (await prisma.task.findMany({ where: whereA, select: { id: true } })).map((t) => t.id)
  );

  assert(nearingIds.has(dueTomorrow.id), "1. Tomorrow appears in Nearing Due");
  assert(nearingIds.has(dueIn2.id), "2. Due in 2 days appears in Nearing Due");
  assert(nearingIds.has(dueIn3.id), "3. Due within threshold appears in Nearing Due");
  assert(!nearingIds.has(dueIn4.id), "4. Outside threshold NOT in Nearing Due");
  assert(!nearingIds.has(completedNear.id), "5. Completed NOT in Nearing Due");
  assert(!nearingIds.has(overdueTask.id), "6. Overdue NOT in Nearing Due");
  assert(!nearingIds.has(dueToday.id), "Today is NOT in Nearing Due (separate bucket)");

  const todayWhere = {
    deletedAt: null,
    companyId: companyA.id,
    status: { notIn: ["COMPLETED", "CANCELLED"] },
    dueDate: { gte: todayStart, lt: addLocalDays(todayStart, 1) },
  };
  const todayIds = new Set(
    (await prisma.task.findMany({ where: todayWhere, select: { id: true } })).map((t) => t.id)
  );
  assert(todayIds.has(dueToday.id), "7. Due today appears in Today's Tasks");

  const overdueWhereClause = {
    deletedAt: null,
    companyId: companyA.id,
    status: { notIn: ["COMPLETED", "CANCELLED"] },
    dueDate: { lt: now },
  };
  const overdueIds = new Set(
    (await prisma.task.findMany({ where: overdueWhereClause, select: { id: true } })).map((t) => t.id)
  );
  assert(overdueIds.has(overdueTask.id), "8. Overdue appears in Overdue Tasks");

  if (otherCompanyTask) {
    assert(!nearingIds.has(otherCompanyTask.id), "9. Cross-company nearing task not visible in company A filter");
  } else {
    console.log("  (skip) Cross-company check — only one company seeded");
  }

  const subAdmin = await prisma.user.findFirst({
    where: {
      companyId: companyA.id,
      deletedAt: null,
      role: { name: "SUB_ADMIN" },
      departmentId: { not: null },
    },
  });
  if (subAdmin?.departmentId) {
    const otherDept = await prisma.department.findFirst({
      where: { companyId: companyA.id, deletedAt: null, id: { not: subAdmin.departmentId } },
    });
    if (otherDept) {
      const foreignDeptTask = await prisma.task.create({
        data: {
          ...base,
          departmentId: otherDept.id,
          title: "ND Other Dept",
          taskCode: `ND-${suffix}-D`,
          status: "OPEN",
          dueDate: mkDue(1),
          startDate: todayStart,
        },
      });
      created.push(foreignDeptTask.id);
      const subWhere = {
        deletedAt: null,
        companyId: companyA.id,
        departmentId: subAdmin.departmentId,
        ...nearingDueWhere(now, threshold),
      };
      const subIds = new Set(
        (await prisma.task.findMany({ where: subWhere, select: { id: true } })).map((t) => t.id)
      );
      assert(!subIds.has(foreignDeptTask.id), "10. Subadmin does not see other-department nearing due");
    } else {
      console.log("  (skip) Subadmin multi-dept check — only one department");
    }
  } else {
    console.log("  (skip) Subadmin check — no SUB_ADMIN with department");
  }

  console.log("\nAll nearing-due tests passed.");
  await prisma.task.deleteMany({ where: { id: { in: created } } });
}

main()
  .catch((err) => {
    console.error("\nFAILED:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
