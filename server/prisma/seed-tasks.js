import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FREQUENCIES = [
  { frequencyName: "Daily", daysInterval: 1, numberOfDays: 7, description: "Repeats every day" },
  { frequencyName: "Weekly", daysInterval: 7, numberOfDays: 7, description: "Repeats every week" },
  { frequencyName: "Monthly", daysInterval: 30, numberOfDays: 30, description: "Repeats every month" },
  { frequencyName: "Quarterly", daysInterval: 90, numberOfDays: 90, description: "Repeats every quarter" },
  { frequencyName: "Half Yearly", daysInterval: 182, numberOfDays: 182, description: "Repeats every six months" },
  { frequencyName: "Yearly", daysInterval: 365, numberOfDays: 365, description: "Repeats every year" },
];

const CATEGORY_DEFS = [
  { name: "Development", code: "DEV" },
  { name: "Design", code: "DSGN" },
  { name: "Marketing", code: "MKT" },
  { name: "Operations", code: "OPS" },
  { name: "Support", code: "SUP" },
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["OPEN", "IN_PROGRESS", "COMPLETED", "OVERDUE", "CANCELLED"];
const EXT_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding Task Management data...\n");

  const companies = await prisma.company.findMany({ where: { deletedAt: null } });
  if (companies.length === 0) {
    throw new Error("No companies found. Run `npm run db:seed` first.");
  }

  // Clean task data (preserve org data)
  await prisma.taskActivity.deleteMany();
  await prisma.taskStatusHistory.deleteMany();
  await prisma.extensionRequest.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.taskCategory.deleteMany();
  await prisma.taskFrequency.deleteMany();

  // Frequencies
  const frequencies = [];
  for (const f of FREQUENCIES) {
    frequencies.push(await prisma.taskFrequency.create({ data: f }));
  }
  console.log(`Created ${frequencies.length} task frequencies`);

  // Categories (5 per company = 10 total)
  const categories = [];
  for (const company of companies) {
    for (const cat of CATEGORY_DEFS) {
      categories.push(
        await prisma.taskCategory.create({
          data: {
            categoryName: cat.name,
            categoryCode: cat.code,
            description: `${cat.name} tasks for ${company.companyName}`,
            status: "ACTIVE",
            companyId: company.id,
          },
        })
      );
    }
  }
  console.log(`Created ${categories.length} task categories`);

  const departments = await prisma.department.findMany({ where: { deletedAt: null } });
  const employees = await prisma.user.findMany({
    where: { deletedAt: null, role: { name: "EMPLOYEE" } },
    include: { role: true },
  });
  const admins = await prisma.user.findMany({
    where: { deletedAt: null, role: { name: { in: ["MAIN_ADMIN", "SUB_ADMIN"] } } },
    include: { role: true },
  });

  if (employees.length === 0 || admins.length === 0) {
    throw new Error("No users found. Run `npm run db:seed` first.");
  }

  const now = new Date();
  const tasks = [];
  const taskCounters = Object.fromEntries(companies.map((c) => [c.id, 0]));

  // 100 Tasks
  for (let i = 1; i <= 100; i++) {
    const company = pick(companies);
    taskCounters[company.id] += 1;
    const companyDepts = departments.filter((d) => d.companyId === company.id);
    const companyCats = categories.filter((c) => c.companyId === company.id);
    const companyEmployees = employees.filter((e) => e.companyId === company.id);
    const companyAdmins = admins.filter((a) => a.companyId === company.id);
    const creator = pick(companyAdmins.length ? companyAdmins : admins);
    const assignee = pick(companyEmployees.length ? companyEmployees : employees);
    const status = pick(STATUSES);
    const startDate = addDays(now, -Math.floor(Math.random() * 30));
    const dueDate = addDays(startDate, Math.floor(Math.random() * 60) + 7);

    const task = await prisma.task.create({
      data: {
        taskCode: `TSK-${String(taskCounters[company.id]).padStart(4, "0")}`,
        title: `Task ${i}: ${pick(["Review", "Implement", "Fix", "Update", "Prepare"])} ${pick(["report", "module", "feature", "documentation", "process"])}`,
        description: `Auto-seeded task #${i} for testing task management APIs.`,
        priority: pick(PRIORITIES),
        status,
        startDate,
        dueDate,
        completedAt: status === "COMPLETED" ? addDays(startDate, 5) : null,
        estimatedHours: Math.floor(Math.random() * 40) + 1,
        actualHours: status === "COMPLETED" ? Math.floor(Math.random() * 40) + 1 : null,
        categoryId: pick(companyCats).id,
        frequencyId: pick(frequencies).id,
        companyId: company.id,
        departmentId: pick(companyDepts).id,
        createdById: creator.id,
        updatedById: creator.id,
      },
    });

    await prisma.taskAssignment.create({
      data: {
        taskId: task.id,
        assignedById: creator.id,
        assignedToId: assignee.id,
        status: status === "COMPLETED" ? "ACCEPTED" : "PENDING",
        acceptedAt: status === "COMPLETED" ? addDays(startDate, 1) : null,
      },
    });

    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        performedById: creator.id,
        activityType: "TASK_CREATED",
        description: `Task "${task.title}" created`,
      },
    });

    tasks.push(task);
  }
  console.log("Created 100 tasks with assignments");

  // 200 Comments
  for (let i = 0; i < 200; i++) {
    const task = pick(tasks);
    const commenter = pick(employees.filter((e) => e.companyId === task.companyId).length
      ? employees.filter((e) => e.companyId === task.companyId)
      : employees);

    await prisma.taskComment.create({
      data: {
        taskId: task.id,
        userId: commenter.id,
        comment: `Comment #${i + 1}: ${pick(["Progress update", "Need clarification", "Blocked by dependency", "Completed section", "Review requested"])} on this task.`,
      },
    });
  }
  console.log("Created 200 task comments");

  // 100 Attachments
  const fileTypes = ["application/pdf", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  for (let i = 0; i < 100; i++) {
    const task = pick(tasks);
    const uploader = pick(employees.filter((e) => e.companyId === task.companyId).length
      ? employees.filter((e) => e.companyId === task.companyId)
      : employees);
    const ext = pick(["pdf", "png", "docx"]);

    await prisma.taskAttachment.create({
      data: {
        taskId: task.id,
        uploadedById: uploader.id,
        fileName: `file-${i + 1}.${ext}`,
        originalName: `document-${i + 1}.${ext}`,
        fileType: pick(fileTypes),
        fileSize: Math.floor(Math.random() * 5000000) + 10000,
        fileUrl: `https://storage.example.com/tasks/${task.id}/file-${i + 1}.${ext}`,
      },
    });
  }
  console.log("Created 100 task attachments");

  // 50 Extension Requests
  const mainAdmins = await prisma.user.findMany({
    where: { deletedAt: null, role: { name: "MAIN_ADMIN" } },
  });

  for (let i = 0; i < 50; i++) {
    const task = pick(tasks.filter((t) => t.dueDate));
    if (!task.dueDate) continue;

    const requester = pick(employees.filter((e) => e.companyId === task.companyId));
    const extStatus = pick(EXT_STATUSES);
    const requestedDueDate = addDays(task.dueDate, Math.floor(Math.random() * 14) + 3);
    const approver = extStatus !== "PENDING" ? pick(mainAdmins.filter((a) => a.companyId === task.companyId)) : null;

    await prisma.extensionRequest.create({
      data: {
        taskId: task.id,
        requestedById: requester.id,
        currentDueDate: task.dueDate,
        requestedDueDate,
        reason: `Extension request #${i + 1}: Need additional time due to ${pick(["resource constraints", "scope change", "dependency delay", "review cycle"])}.`,
        status: extStatus,
        approvedById: approver?.id ?? null,
        approvedDate: approver ? addDays(now, -Math.floor(Math.random() * 5)) : null,
      },
    });
  }
  console.log("Created 50 extension requests");

  console.log("\nTask seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Task seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
