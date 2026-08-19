/**
 * Manual verification script for category code behavior.
 * Run: node scripts/test-category-codes.js
 */
import { PrismaClient } from "@prisma/client";
import {
  normalizeCategoryCode,
  legacyDisplayCodeFromName,
  generateCategoryCodeFromName,
  resolveUniqueCategoryCode,
} from "../src/utils/categoryCode.js";
import TaskCategoryService from "../src/services/TaskCategoryService.js";

const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("Testing category code utilities...");
  assert(normalizeCategoryCode("  comp  ") === "COMP", "normalizeCategoryCode trim+uppercase");
  assert(normalizeCategoryCode(" com-01 ") === "COM-01", "normalizeCategoryCode keeps hyphens");
  assert(legacyDisplayCodeFromName("Compliance") === "COMP", "legacy backfill code");
  assert(generateCategoryCodeFromName("Human Resources") === "HR", "generate HR");
  assert(generateCategoryCodeFromName("Compliance") === "COMP", "generate COMP");
  assert(generateCategoryCodeFromName("Finance") === "FIN", "generate FIN");
  assert(generateCategoryCodeFromName("Information Technology") === "IT", "generate IT");
  assert(generateCategoryCodeFromName("Sales & Marketing") === "SM", "generate SM");
  assert(generateCategoryCodeFromName("Customer Support") === "CS", "generate CS");
  assert(resolveUniqueCategoryCode("HR", ["HR"]) === "HR01", "resolve unique HR01");

  const company = await prisma.company.findFirst({ where: { deletedAt: null } });
  assert(company, "Need at least one company");

  const admin = await prisma.user.findFirst({
    where: { deletedAt: null, companyId: company.id },
    include: { role: true },
  });
  assert(admin, "Need at least one user in company");

  const existing = await prisma.taskCategory.findMany({
    where: { companyId: company.id, deletedAt: null },
    take: 1,
  });
  assert(existing.length > 0, "Need existing categories preserved");
  const originalCode = existing[0].categoryCode;
  assert(originalCode, "Existing category must have categoryCode after backfill");

  const testCode = `T${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const testName = `Test Category ${Date.now()}`;
  const created = await TaskCategoryService.create(
    {
      categoryName: testName,
      categoryCode: testCode.toLowerCase(),
      description: "API test category",
      companyId: company.id,
      status: "ACTIVE",
    },
    admin.id
  );
  assert(created.categoryCode === testCode, "Create should uppercase category code");

  let duplicateFailed = false;
  try {
    await TaskCategoryService.create(
      {
        categoryName: "Another Test Category",
        categoryCode: testCode,
        companyId: company.id,
        status: "ACTIVE",
      },
      admin.id
    );
  } catch (error) {
    duplicateFailed = /category code already exists/i.test(error.message);
  }
  assert(duplicateFailed, "Duplicate category code should be rejected");

  const updated = await TaskCategoryService.update(
    created.id,
    { categoryName: `${testName} Renamed` },
    admin.id
  );
  assert(updated.categoryCode === testCode, "Renaming category must not change category code");

  const updatedCode = await TaskCategoryService.update(
    created.id,
    { categoryCode: `${testCode}X` },
    admin.id
  );
  assert(updatedCode.categoryCode === `${testCode}X`, "Explicit category code update should work");

  await TaskCategoryService.remove(created.id, admin.id);

  const preserved = await prisma.taskCategory.findFirst({ where: { id: existing[0].id } });
  assert(preserved.categoryCode === originalCode, "Existing category codes must remain unchanged");

  console.log("\nAll category code tests passed.");
}

main()
  .catch((error) => {
    console.error("\nTest failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
