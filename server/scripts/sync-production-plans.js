import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("sync-production-plans: DATABASE_URL/DIRECT_URL missing");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

const plans = [
  {
    planName: "Professional",
    description: "For growing organizations with advanced needs",
    monthlyPrice: 79,
    yearlyPrice: 810,
    duration: "MONTHLY",
    maxEmployees: 50,
    maxDepartments: 10,
    maxActiveTasks: 500,
    features: ["Everything in Starter", "Approvals", "Calendar", "Priority Support"],
    status: "ACTIVE",
  },
  {
    planName: "Starter",
    description: "For small teams getting started with task management",
    monthlyPrice: 80,
    yearlyPrice: 290,
    duration: "MONTHLY",
    maxEmployees: 10,
    maxDepartments: 3,
    maxActiveTasks: 100,
    features: ["Task Management", "Basic Reports", "Email Support"],
    status: "ACTIVE",
  },
  {
    planName: "Custom",
    description: "For organizations with custom department and task requirements",
    monthlyPrice: 137,
    yearlyPrice: 1370,
    duration: "MONTHLY",
    maxEmployees: 30,
    maxDepartments: 12,
    maxActiveTasks: 200,
    features: ["Custom Workflows", "Dedicated Support"],
    status: "ACTIVE",
  },
  {
    planName: "Enterprise",
    description: "For large organizations with multi-department requirements",
    monthlyPrice: 177,
    yearlyPrice: 1770,
    duration: "MONTHLY",
    maxEmployees: 5,
    maxDepartments: 2,
    maxActiveTasks: 10,
    features: ["Enterprise Security", "Unlimited History"],
    status: "ACTIVE",
  },
];

async function syncPlans() {
  console.log("sync-production-plans: starting non-destructive plan upsert...");
  for (const plan of plans) {
    const res = await prisma.subscriptionPlan.upsert({
      where: { planName: plan.planName },
      update: { ...plan, deletedAt: null },
      create: plan,
    });
    console.log(`sync-production-plans: upserted "${res.planName}" (ID: ${res.id}, Monthly: ${res.monthlyPrice}, Yearly: ${res.yearlyPrice})`);
  }
  console.log("sync-production-plans: completed successfully.");
}

syncPlans()
  .catch((err) => {
    console.error("sync-production-plans failed:", err?.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
