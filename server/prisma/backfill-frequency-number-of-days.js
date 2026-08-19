import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_NUMBER_OF_DAYS = {
  Daily: 7,
  Weekly: 7,
  Monthly: 30,
  Quarterly: 90,
  "Half Yearly": 182,
  Yearly: 365,
};

function defaultNumberOfDays(frequency) {
  if (DEFAULT_NUMBER_OF_DAYS[frequency.frequencyName] != null) {
    return DEFAULT_NUMBER_OF_DAYS[frequency.frequencyName];
  }
  return Math.max(frequency.daysInterval || 1, 7);
}

async function main() {
  const frequencies = await prisma.taskFrequency.findMany({
    where: { deletedAt: null },
  });

  let updated = 0;
  for (const frequency of frequencies) {
    const numberOfDays = frequency.numberOfDays || defaultNumberOfDays(frequency);
    const status = frequency.status || "ACTIVE";

    if (frequency.numberOfDays === numberOfDays && frequency.status === status) continue;

    await prisma.taskFrequency.update({
      where: { id: frequency.id },
      data: { numberOfDays, status },
    });
    updated += 1;
    console.log(`Backfilled ${frequency.frequencyName}: numberOfDays=${numberOfDays}, status=${status}`);
  }

  console.log(`\nBackfill complete. Updated ${updated} of ${frequencies.length} frequencies.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
