import { PrismaClient } from "@prisma/client";
import { legacyDisplayCodeFromName } from "../src/utils/categoryCode.js";

const prisma = new PrismaClient();

async function uniqueCodeForCompany(companyId, baseCode, excludeId) {
  let candidate = baseCode;
  let suffix = 1;
  while (true) {
    const existing = await prisma.taskCategory.findFirst({
      where: {
        companyId,
        categoryCode: candidate,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    candidate = `${baseCode}${suffix}`.slice(0, 20);
    suffix += 1;
  }
}

async function main() {
  const categories = await prisma.taskCategory.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  let updated = 0;
  for (const category of categories) {
    if (category.categoryCode) continue;

    const baseCode = legacyDisplayCodeFromName(category.categoryName);
    const categoryCode = await uniqueCodeForCompany(category.companyId, baseCode, category.id);

    await prisma.taskCategory.update({
      where: { id: category.id },
      data: { categoryCode },
    });
    updated += 1;
    console.log(`Backfilled ${category.categoryName} -> ${categoryCode}`);
  }

  console.log(`\nBackfill complete. Updated ${updated} of ${categories.length} categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
