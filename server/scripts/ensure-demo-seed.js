/**
 * If the database has zero users (fresh Neon / post-migrate empty DB),
 * ensure roles exist and run the idempotent demo seed.
 *
 * Never runs prisma/seed.js (that script deletes all data).
 * Never prints credentials.
 */
import "dotenv/config";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("ensure-demo-seed: DATABASE_URL/DIRECT_URL missing");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

const ROLES = [
  { name: "SUPER_ADMIN", description: "Platform super administrator with full access" },
  { name: "MAIN_ADMIN", description: "Company main administrator" },
  { name: "SUB_ADMIN", description: "Department sub administrator" },
  { name: "EMPLOYEE", description: "Standard employee user" },
];

function runNode(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

try {
  const userCount = await prisma.user.count();
  console.log(`ensure-demo-seed: userCount=${userCount}`);

  if (userCount > 0) {
    console.log("ensure-demo-seed: users already exist — skipping demo seed.");
    process.exit(0);
  }

  console.log("ensure-demo-seed: empty user table — creating roles + demo users...");

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, status: "ACTIVE", deletedAt: null },
      create: { name: role.name, description: role.description, status: "ACTIVE" },
    });
  }

  // Minimal plan so company subscriptions can attach during demo seed.
  const existingPlan = await prisma.subscriptionPlan.findFirst({
    where: { deletedAt: null },
  });
  if (!existingPlan) {
    await prisma.subscriptionPlan.create({
      data: {
        planName: "Starter",
        description: "Demo starter plan",
        monthlyPrice: 0,
        yearlyPrice: 0,
        maxEmployees: 50,
        maxDepartments: 20,
        maxActiveTasks: 500,
        features: ["demo"],
        status: "ACTIVE",
      },
    });
  }

  await prisma.$disconnect();

  runNode("prisma/seed-test-users.js");
  console.log("ensure-demo-seed: demo users seeded.");
} catch (error) {
  console.error("ensure-demo-seed failed:", error?.message || error);
  try {
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
}
