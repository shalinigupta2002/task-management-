/**
 * Development / staging test users and sample data.
 * Safe to re-run — uses upserts; does NOT delete existing records.
 *
 * Prerequisites: roles/permissions (run `npm run db:seed` once if missing).
 *
 * Usage:
 *   SEED_DEV_PASSWORD='YourDevPassword!' npm run db:seed:test
 *   npm run db:seed:verify
 */

import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";
import { buildOccurrenceDates } from "../src/utils/taskRecurrence.js";

dotenv.config();

// Prefer DIRECT_URL for seed interactive transactions.
// Neon's pooled URL (pgbouncer) commonly closes interactive txs → Prisma P2028.
const prisma = new PrismaClient(
  process.env.DIRECT_URL
    ? { datasources: { db: { url: process.env.DIRECT_URL } } }
    : undefined
);

const DEV_PASSWORD_FALLBACK = "DevTest@2026!";
const DEV_PASSWORD = process.env.SEED_DEV_PASSWORD || DEV_PASSWORD_FALLBACK;

const COMPANIES = [
  {
    companyCode: "XYZ001",
    companyName: "XYZ Technologies",
    email: "contact@xyz.test",
    industry: "Technology",
  },
  {
    companyCode: "ABC001",
    companyName: "ABC Solutions",
    email: "contact@abc.test",
    industry: "Consulting",
  },
];

const XYZ_USERS = [
  { key: "super", role: "SUPER_ADMIN", firstName: "System", lastName: "Super Admin", email: "superadmin@system.test", employeeId: "SYS-SA-001", companyCode: null, deptCode: null },
  { key: "main", role: "MAIN_ADMIN", firstName: "XYZ", lastName: "Main Admin", email: "admin@xyz.test", employeeId: "XYZ-MA-001", companyCode: "XYZ001", deptCode: "XYZ-ENG" },
  { key: "sub1", role: "SUB_ADMIN", firstName: "XYZ Subadmin", lastName: "One", email: "subadmin1@xyz.test", employeeId: "XYZ-SA-001", companyCode: "XYZ001", deptCode: "XYZ-ENG" },
  { key: "sub2", role: "SUB_ADMIN", firstName: "XYZ Subadmin", lastName: "Two", email: "subadmin2@xyz.test", employeeId: "XYZ-SA-002", companyCode: "XYZ001", deptCode: "XYZ-OPS" },
  { key: "emp1", role: "EMPLOYEE", firstName: "XYZ Employee", lastName: "One", email: "employee1@xyz.test", employeeId: "XYZ-EM-001", companyCode: "XYZ001", deptCode: "XYZ-ENG" },
  { key: "emp2", role: "EMPLOYEE", firstName: "XYZ Employee", lastName: "Two", email: "employee2@xyz.test", employeeId: "XYZ-EM-002", companyCode: "XYZ001", deptCode: "XYZ-ENG" },
  { key: "emp3", role: "EMPLOYEE", firstName: "XYZ Employee", lastName: "Three", email: "employee3@xyz.test", employeeId: "XYZ-EM-003", companyCode: "XYZ001", deptCode: "XYZ-OPS" },
];

const ABC_USERS = [
  { key: "main", role: "MAIN_ADMIN", firstName: "ABC", lastName: "Main Admin", email: "admin@abc.test", employeeId: "ABC-MA-001", companyCode: "ABC001", deptCode: "ABC-HR" },
  { key: "sub", role: "SUB_ADMIN", firstName: "ABC", lastName: "Subadmin", email: "subadmin@abc.test", employeeId: "ABC-SA-001", companyCode: "ABC001", deptCode: "ABC-HR" },
  { key: "emp", role: "EMPLOYEE", firstName: "ABC", lastName: "Employee", email: "employee@abc.test", employeeId: "ABC-EM-001", companyCode: "ABC001", deptCode: "ABC-HR" },
];

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function requireRole(name) {
  const role = await prisma.role.findFirst({ where: { name, deletedAt: null } });
  if (!role) {
    throw new Error(
      `Role "${name}" not found. Run \`npm run db:seed\` once to create roles/permissions, then re-run this script.`
    );
  }
  return role;
}

async function upsertCompany(def) {
  return prisma.company.upsert({
    where: { companyCode: def.companyCode },
    update: {
      companyName: def.companyName,
      email: def.email,
      industry: def.industry,
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      companyCode: def.companyCode,
      companyName: def.companyName,
      email: def.email,
      phone: "+91 90000 00000",
      city: "Test City",
      state: "Test State",
      country: "India",
      industry: def.industry,
      status: "ACTIVE",
    },
  });
}

async function upsertDepartment(companyId, code, name) {
  const existing = await prisma.department.findFirst({
    where: { companyId, departmentCode: code, deletedAt: null },
  });
  if (existing) {
    return prisma.department.update({
      where: { id: existing.id },
      data: { departmentName: name, status: "ACTIVE" },
    });
  }
  return prisma.department.create({
    data: {
      companyId,
      departmentCode: code,
      departmentName: name,
      description: `${name} (test seed)`,
      status: "ACTIVE",
    },
  });
}

async function upsertCategory(companyId, code, name) {
  const existing = await prisma.taskCategory.findFirst({
    where: { companyId, categoryCode: code, deletedAt: null },
  });
  if (existing) {
    return prisma.taskCategory.update({
      where: { id: existing.id },
      data: { categoryName: name, status: "ACTIVE" },
    });
  }
  return prisma.taskCategory.create({
    data: {
      companyId,
      categoryCode: code,
      categoryName: name,
      description: `${name} category (test seed)`,
      status: "ACTIVE",
    },
  });
}

async function upsertUser(def, roleId, companyId, departmentId, hashedPassword) {
  const data = {
    employeeId: def.employeeId,
    firstName: def.firstName,
    lastName: def.lastName,
    phone: "+91 90000 12345",
    password: hashedPassword,
    designation: def.role.replace("_", " "),
    status: "ACTIVE",
    roleId,
    companyId: companyId ?? null,
    departmentId: departmentId ?? null,
  };

  return prisma.user.upsert({
    where: { email: def.email },
    update: data,
    create: { ...data, email: def.email },
  });
}

async function ensureSubscription(companyId) {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { deletedAt: null, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });
  if (!plan) return;

  const existing = await prisma.companySubscription.findFirst({
    where: { companyId, deletedAt: null, subscriptionStatus: "ACTIVE" },
  });
  if (existing) return;

  const now = new Date();
  const expiry = addDays(now, 365);
  await prisma.companySubscription.create({
    data: {
      companyId,
      subscriptionPlanId: plan.id,
      startDate: now,
      expiryDate: expiry,
      subscriptionStatus: "ACTIVE",
    },
  });
}

async function ensurePlatformFrequencies() {
  const defs = [
    { frequencyName: "Daily", daysInterval: 1, numberOfDays: 7, description: "Daily recurrence (test seed)" },
    { frequencyName: "Weekly", daysInterval: 7, numberOfDays: 7, description: "Weekly recurrence (test seed)" },
    { frequencyName: "Monthly", daysInterval: 30, numberOfDays: 30, description: "Monthly recurrence (test seed)" },
  ];
  const out = {};
  for (const def of defs) {
    let freq = await prisma.taskFrequency.findFirst({
      where: { frequencyName: def.frequencyName, deletedAt: null },
    });
    if (!freq) {
      freq = await prisma.taskFrequency.create({ data: { ...def, status: "ACTIVE" } });
    }
    out[def.frequencyName] = freq;
  }
  return out.Daily;
}

async function nextTaskCode(companyId) {
  const count = await prisma.task.count({ where: { companyId } });
  return `TSK-${String(count + 1).padStart(4, "0")}`;
}

async function createTestTaskDirect({
  companyId,
  title,
  creatorId,
  departmentId,
  categoryId,
  assigneeIds,
  approverId,
  recurrenceType = "ONE_TIME",
  frequencyId = null,
  startDate,
  endDate,
}) {
  const existing = await prisma.task.findFirst({
    where: { companyId, title, deletedAt: null },
  });
  if (existing) return existing;

  const uniqueAssignees = [...new Set(assigneeIds.filter(Boolean))];
  const taskCode = await nextTaskCode(companyId);

  // Compute dates outside the transaction to keep the tx short.
  const occurrenceDates = buildOccurrenceDates({
    recurrenceType,
    startDate,
    endDate,
    durationDays: null,
    intervalDays: 1,
  });

  return prisma.$transaction(
    async (tx) => {
      const task = await tx.task.create({
        data: {
          taskCode,
          title,
          description: `${title} (development test seed)`,
          priority: "MEDIUM",
          status: "OPEN",
          companyId,
          departmentId,
          categoryId,
          frequencyId,
          recurrenceType,
          approverId: approverId || null,
          startDate,
          endDate,
          dueDate: endDate,
          createdById: creatorId,
          updatedById: creatorId,
        },
      });

      if (uniqueAssignees.length > 0) {
        await tx.taskAssignment.createMany({
          data: uniqueAssignees.map((assigneeId) => ({
            taskId: task.id,
            assignedById: creatorId,
            assignedToId: assigneeId,
            status: "PENDING",
          })),
        });
      }

      if (occurrenceDates.length > 0) {
        await tx.taskOccurrence.createMany({
          data: occurrenceDates.map((occurrenceDate, i) => ({
            taskId: task.id,
            occurrenceDate,
            sequenceNumber: i + 1,
          })),
        });

        const createdOccurrences = await tx.taskOccurrence.findMany({
          where: { taskId: task.id },
          select: { id: true },
          orderBy: { sequenceNumber: "asc" },
        });

        if (uniqueAssignees.length > 0 && createdOccurrences.length > 0) {
          await tx.taskOccurrenceAssignee.createMany({
            data: createdOccurrences.flatMap((occurrence) =>
              uniqueAssignees.map((assigneeId) => ({
                occurrenceId: occurrence.id,
                assigneeId,
                status: "OPEN",
              }))
            ),
          });
        }
      }

      await tx.taskActivity.create({
        data: {
          taskId: task.id,
          performedById: creatorId,
          activityType: "TASK_CREATED",
          description: `Task "${title}" created (test seed)`,
        },
      });

      return task;
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    }
  );
}

async function seedCompanyTasks(company, users, departments, categories, dailyFreq) {
  const main = users.main;
  const sub1 = users.sub1 || users.sub || main;
  const emp1 = users.emp1 || users.emp;
  const emp2 = users.emp2 || users.emp;
  const emp3 = users.emp3 || users.emp;
  const assigneePool = [...new Set([emp1?.id, emp2?.id, emp3?.id].filter(Boolean))];

  const dept = departments[0];
  const cat = categories[0];
  const now = new Date();
  const end = addDays(now, 14);
  const dailyEnd = addDays(now, 5);

  await createTestTaskDirect({
    companyId: company.id,
    title: "TEST: Multi-Assignee Compliance Review",
    creatorId: main.id,
    departmentId: dept.id,
    categoryId: cat.id,
    assigneeIds: assigneePool.length >= 2 ? assigneePool : [emp1.id, main.id],
    approverId: sub1.id,
    startDate: now,
    endDate: end,
  });

  await createTestTaskDirect({
    companyId: company.id,
    title: "TEST: Daily Recurring Standup",
    creatorId: main.id,
    departmentId: dept.id,
    categoryId: cat.id,
    assigneeIds: [emp1.id],
    approverId: main.id,
    recurrenceType: "DAILY",
    frequencyId: dailyFreq.id,
    startDate: now,
    endDate: dailyEnd,
  });

  await createTestTaskDirect({
    companyId: company.id,
    title: "TEST: Standard Operations Task",
    creatorId: main.id,
    departmentId: dept.id,
    categoryId: categories[1]?.id || cat.id,
    assigneeIds: [emp2?.id || emp1.id],
    startDate: now,
    endDate: end,
  });
}

async function main() {
  console.log("=== TaskFlow TEST USER SEED (development/staging only) ===\n");

  try {
    const seedUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    console.log("Seed DB host:", seedUrl ? new URL(seedUrl).hostname : "(missing)");
  } catch {
    console.log("Seed DB host: (unparseable)");
  }

  if (!process.env.SEED_DEV_PASSWORD) {
    console.warn(
      "⚠️  SEED_DEV_PASSWORD not set — using built-in DEV-ONLY fallback password.\n" +
      "   Set SEED_DEV_PASSWORD in .env for local testing.\n"
    );
  }

  const roles = {};
  for (const name of ["SUPER_ADMIN", "MAIN_ADMIN", "SUB_ADMIN", "EMPLOYEE"]) {
    roles[name] = await requireRole(name);
  }

  const hashedPassword = await hashPassword(DEV_PASSWORD);
  const companyMap = {};

  for (const def of COMPANIES) {
    const company = await upsertCompany(def);
    companyMap[def.companyCode] = company;
    await ensureSubscription(company.id);
    console.log(`Company upserted: ${company.companyName} (${company.companyCode}) → ${company.id}`);
  }

  const xyz = companyMap.XYZ001;
  const abc = companyMap.ABC001;

  const xyzDepts = {
    XYZ001: [
      await upsertDepartment(xyz.id, "XYZ-ENG", "Engineering"),
      await upsertDepartment(xyz.id, "XYZ-OPS", "Operations"),
    ],
  };
  const abcDepts = {
    ABC001: [
      await upsertDepartment(abc.id, "ABC-HR", "Human Resources"),
      await upsertDepartment(abc.id, "ABC-FIN", "Finance"),
    ],
  };

  const xyzCats = [
    await upsertCategory(xyz.id, "XYZ-COMP", "Compliance"),
    await upsertCategory(xyz.id, "XYZ-OPS", "Operations"),
  ];
  const abcCats = [
    await upsertCategory(abc.id, "ABC-COMP", "Compliance"),
    await upsertCategory(abc.id, "ABC-OPS", "Operations"),
  ];

  const deptByCode = (companyId, code) => {
    const all = [...xyzDepts.XYZ001, ...abcDepts.ABC001];
    return all.find((d) => d.companyId === companyId && d.departmentCode === code);
  };

  const userRecords = { xyz: {}, abc: {} };

  for (const def of XYZ_USERS) {
    const companyId = def.companyCode ? companyMap[def.companyCode].id : null;
    const dept = def.deptCode ? deptByCode(companyId, def.deptCode) : null;
    const user = await upsertUser(def, roles[def.role].id, companyId, dept?.id, hashedPassword);
    if (def.companyCode === "XYZ001" || !def.companyCode) userRecords.xyz[def.key] = user;
    console.log(`User upserted: ${def.email} (${def.role})`);
  }

  for (const def of ABC_USERS) {
    const companyId = companyMap[def.companyCode].id;
    const dept = deptByCode(companyId, def.deptCode);
    const user = await upsertUser(def, roles[def.role].id, companyId, dept?.id, hashedPassword);
    userRecords.abc[def.key] = user;
    console.log(`User upserted: ${def.email} (${def.role})`);
  }

  const dailyFreq = await ensurePlatformFrequencies();

  console.log("\nSeeding test tasks (skipped if title already exists)...");
  await seedCompanyTasks(
    xyz,
    userRecords.xyz,
    xyzDepts.XYZ001,
    xyzCats,
    dailyFreq
  );
  await seedCompanyTasks(
    abc,
    userRecords.abc,
    abcDepts.ABC001,
    abcCats,
    dailyFreq
  );

  console.log("\n=== TEST SEED COMPLETE ===");
  console.log("─────────────────────────────────────────");
  console.log("DEVELOPMENT / TEST ONLY — do not use in production");
  console.log("Password source:", process.env.SEED_DEV_PASSWORD ? "SEED_DEV_PASSWORD env var" : "built-in fallback");
  console.log("Login emails:");
  console.log("  superadmin@system.test   (SUPER_ADMIN, platform-level)");
  console.log("  admin@xyz.test         (XYZ MAIN_ADMIN)");
  console.log("  subadmin1@xyz.test     (XYZ SUB_ADMIN)");
  console.log("  employee1@xyz.test     (XYZ EMPLOYEE)");
  console.log("  admin@abc.test         (ABC MAIN_ADMIN)");
  console.log("  subadmin@abc.test      (ABC SUB_ADMIN)");
  console.log("  employee@abc.test      (ABC EMPLOYEE)");
  console.log("Verify: npm run db:seed:verify");
  console.log("─────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("Test seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
