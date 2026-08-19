/**
 * Idempotent platform-level task frequency seed (development/staging).
 * TaskFrequency is global — not company-scoped per schema.prisma.
 *
 * Usage: npm run db:seed:frequencies
 */

import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const PLATFORM_FREQUENCIES = [
  { frequencyName: "Daily", daysInterval: 1, numberOfDays: 7, description: "Tasks occur every day" },
  { frequencyName: "Weekly", daysInterval: 7, numberOfDays: 7, description: "Tasks occur every week" },
  { frequencyName: "Monthly", daysInterval: 30, numberOfDays: 30, description: "Tasks occur every month" },
  { frequencyName: "Custom", daysInterval: 14, numberOfDays: 14, description: "Custom interval schedule" },
];

async function upsertFrequency(def) {
  const existing = await prisma.taskFrequency.findFirst({
    where: { frequencyName: def.frequencyName },
  });

  if (existing) {
    return prisma.taskFrequency.update({
      where: { id: existing.id },
      data: {
        daysInterval: def.daysInterval,
        numberOfDays: def.numberOfDays,
        description: def.description,
        status: "ACTIVE",
        deletedAt: null,
      },
    });
  }

  return prisma.taskFrequency.create({
    data: { ...def, status: "ACTIVE" },
  });
}

async function main() {
  console.log("Seeding platform task frequencies...\n");
  for (const def of PLATFORM_FREQUENCIES) {
    const row = await upsertFrequency(def);
    console.log(`  ✓ ${row.frequencyName} (${row.id})`);
  }
  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
