/**
 * Task Category + Task Frequency regression tests.
 * Run: node scratch/test-category-frequency.js
 */

import dotenv from "dotenv";
import TaskCategoryRepository from "../src/repositories/TaskCategoryRepository.js";
import TaskCategoryService from "../src/services/TaskCategoryService.js";
import TaskFrequencyRepository from "../src/repositories/TaskFrequencyRepository.js";
import TaskFrequencyService from "../src/services/TaskFrequencyService.js";
import AuthService from "../src/services/AuthService.js";
import { authenticate } from "../src/middlewares/auth.middleware.js";
import ApiError from "../src/utils/ApiError.js";
import { taskCategoryQuerySchema, taskFrequencyQuerySchema } from "../src/validators/task.validators.js";
import prisma from "../src/config/database.js";

dotenv.config();

let passed = 0;
let failed = 0;

function ok(label) {
  passed += 1;
  console.log(`✓ ${label}`);
}

function fail(label, err) {
  failed += 1;
  console.error(`✗ ${label}: ${err.message}`);
}

function assertZodFails(schema, data) {
  if (schema.safeParse(data).success) {
    throw new Error(`Expected validation failure for ${JSON.stringify(data)}`);
  }
}

async function assertThrows(promise, segment = "") {
  try {
    await promise;
    throw new Error("expected throw");
  } catch (err) {
    if (err.message === "expected throw") throw new Error("Expected rejection but succeeded");
    if (segment && !err.message.toLowerCase().includes(segment.toLowerCase())) {
      throw new Error(`Expected "${segment}" in "${err.message}"`);
    }
  }
}

async function run() {
  console.log("=== CATEGORY + FREQUENCY REGRESSION TESTS ===\n");

  const xyzAdmin = await prisma.user.findFirst({ where: { email: "admin@xyz.test" }, include: { role: true } });
  const abcAdmin = await prisma.user.findFirst({ where: { email: "admin@abc.test" }, include: { role: true } });
  const xyzCompany = await prisma.company.findFirst({ where: { companyCode: "XYZ001" } });
  const abcCompany = await prisma.company.findFirst({ where: { companyCode: "ABC001" } });

  // 1–2 List with limit (common BaseRepository bug regression)
  try {
    await TaskCategoryRepository.findAll({ limit: 100 });
    ok("TaskCategory list succeeds with limit=100");
  } catch (err) {
    fail("TaskCategory list succeeds with limit=100", err);
  }

  try {
    await TaskFrequencyRepository.findAll({ limit: 100 });
    ok("TaskFrequency list succeeds with limit=100");
  } catch (err) {
    fail("TaskFrequency list succeeds with limit=100", err);
  }

  // 3–4 Company isolation for categories
  if (xyzAdmin && abcAdmin && xyzCompany && abcCompany) {
    try {
      const xyzCats = await TaskCategoryService.getAll({ limit: 100 }, xyzAdmin.id);
      const abcCats = await TaskCategoryService.getAll({ limit: 100 }, abcAdmin.id);
      if (!xyzCats.items.every((c) => c.companyId === xyzCompany.id)) {
        throw new Error("XYZ admin received non-XYZ category");
      }
      if (!abcCats.items.every((c) => c.companyId === abcCompany.id)) {
        throw new Error("ABC admin received non-ABC category");
      }
      const xyzIds = new Set(xyzCats.items.map((c) => c.id));
      for (const c of abcCats.items) {
        if (xyzIds.has(c.id)) throw new Error("category id overlap between companies");
      }
      ok("TaskCategory company isolation (XYZ vs ABC)");
    } catch (err) {
      fail("TaskCategory company isolation (XYZ vs ABC)", err);
    }

    // 5 Cross-company category read blocked
    try {
      const abcCats = await TaskCategoryService.getAll({ limit: 100 }, abcAdmin.id);
      const abcCat = abcCats.items[0];
      if (abcCat) {
        await assertThrows(TaskCategoryService.getById(abcCat.id, xyzAdmin.id), "access denied");
        ok("XYZ admin cannot access ABC category by ID");
      } else {
        ok("XYZ admin cannot access ABC category by ID [skipped — no ABC categories]");
      }
    } catch (err) {
      fail("XYZ admin cannot access ABC category by ID", err);
    }
  } else {
    ok("TaskCategory company isolation [skipped — test users missing]");
    ok("XYZ admin cannot access ABC category by ID [skipped]");
  }

  // 6 Platform frequencies shared catalog
  try {
    const freqs = await TaskFrequencyService.getAll({ limit: 100 });
    if (!freqs.items.length) throw new Error("expected platform frequencies");
    ok("TaskFrequency platform catalog loads");
  } catch (err) {
    fail("TaskFrequency platform catalog loads", err);
  }

  // 7 Category create uses authenticated companyId
  if (xyzAdmin) {
    try {
      const code = `T${Date.now().toString().slice(-6)}`;
      const created = await TaskCategoryService.create(
        { categoryName: `Test Cat ${code}`, categoryCode: code, description: "regression" },
        xyzAdmin.id
      );
      if (created.companyId !== xyzAdmin.companyId) {
        throw new Error("create used wrong companyId");
      }
      await TaskCategoryRepository.softDelete(created.id);
      ok("TaskCategory create uses authenticated companyId");
    } catch (err) {
      fail("TaskCategory create uses authenticated companyId", err);
    }
  } else {
    ok("TaskCategory create uses authenticated companyId [skipped]");
  }

  // 8 Client cannot override companyId on category list
  if (xyzAdmin && abcCompany) {
    try {
      await assertThrows(
        TaskCategoryService.getAll({ limit: 100, companyId: abcCompany.id }, xyzAdmin.id),
        "access denied"
      );
      ok("Client cannot override companyId on category list");
    } catch (err) {
      fail("Client cannot override companyId on category list", err);
    }
  } else {
    ok("Client cannot override companyId on category list [skipped]");
  }

  // 9–10 Query validation
  try {
    assertZodFails(taskCategoryQuerySchema, { limit: 101 });
    assertZodFails(taskCategoryQuerySchema, { companyId: "not-a-uuid" });
    assertZodFails(taskFrequencyQuerySchema, { limit: 200 });
    ok("Invalid category/frequency query params rejected");
  } catch (err) {
    fail("Invalid category/frequency query params rejected", err);
  }

  // 11–12 JWT
  try {
    let err1 = null;
    authenticate({ headers: {}, cookies: {} }, {}, (e) => { err1 = e; });
    if (!(err1 instanceof ApiError) || err1.statusCode !== 401) throw new Error("missing token not 401");
    ok("Invalid JWT rejected");
  } catch (err) {
    fail("Invalid JWT rejected", err);
  }

  try {
    let err2 = null;
    authenticate({ headers: { authorization: "Bearer bad-token" }, cookies: {} }, {}, (e) => { err2 = e; });
    if (!(err2 instanceof ApiError) || err2.statusCode !== 401) throw new Error("bad token not 401");
    ok("Expired/invalid JWT rejected");
  } catch (err) {
    fail("Expired/invalid JWT rejected", err);
  }

  console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
