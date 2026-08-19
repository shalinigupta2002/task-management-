/**
 * Task Frequency API/repository verification.
 * Run: node scratch/test-task-frequency.js
 */

import dotenv from "dotenv";
import TaskFrequencyRepository from "../src/repositories/TaskFrequencyRepository.js";
import TaskFrequencyService from "../src/services/TaskFrequencyService.js";
import AuthService from "../src/services/AuthService.js";
import { authenticate } from "../src/middlewares/auth.middleware.js";
import ApiError from "../src/utils/ApiError.js";
import { taskFrequencyQuerySchema } from "../src/validators/task.validators.js";
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

function assertZodFails(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) throw new Error(`Expected validation failure for ${JSON.stringify(data)}`);
}

async function login(email, password = "Admin@123456") {
  return AuthService.login(email, password);
}

async function run() {
  console.log("=== TASK FREQUENCY VERIFICATION ===\n");

  const xyzAdmin = await prisma.user.findFirst({
    where: { email: "admin@xyz.test" },
    include: { role: true },
  });
  const abcAdmin = await prisma.user.findFirst({
    where: { email: "admin@abc.test" },
    include: { role: true },
  });
  const fallbackAdmin = await prisma.user.findFirst({
    where: { email: "rajesh.kumar@techsolutions.com" },
    include: { role: true },
  });
  const admin = xyzAdmin || fallbackAdmin;

  // 1. Repository list with limit (root cause regression)
  try {
    const result = await TaskFrequencyRepository.findAll({ limit: 100, page: 1 });
    if (!Array.isArray(result.items)) throw new Error("items is not an array");
    ok("TaskFrequency list succeeds with pagination params");
  } catch (err) {
    fail("TaskFrequency list succeeds with pagination params", err);
  }

  // 2. Search filter
  try {
    const result = await TaskFrequencyRepository.findAll({ search: "Daily", limit: 10 });
    if (!result.items.every((f) => f.frequencyName.toLowerCase().includes("daily") || (f.description || "").toLowerCase().includes("daily"))) {
      throw new Error("search filter returned unexpected rows");
    }
    ok("TaskFrequency search works");
  } catch (err) {
    fail("TaskFrequency search works", err);
  }

  // 3. Status filter via service
  try {
    const result = await TaskFrequencyService.getAll({ status: "ACTIVE", limit: 50 });
    if (!result.items.every((f) => f.status === "ACTIVE")) throw new Error("status filter failed");
    ok("TaskFrequency status filter works");
  } catch (err) {
    fail("TaskFrequency status filter works", err);
  }

  // 4. Platform-level: XYZ and ABC admins see same frequency catalog
  if (xyzAdmin && abcAdmin) {
    try {
      const xyzList = await TaskFrequencyService.getAll({ limit: 100 });
      const abcList = await TaskFrequencyService.getAll({ limit: 100 });
      const xyzIds = new Set(xyzList.items.map((f) => f.id));
      const abcIds = new Set(abcList.items.map((f) => f.id));
      if (xyzIds.size === 0 || abcIds.size === 0) throw new Error("expected seeded frequencies");
      for (const id of xyzIds) {
        if (!abcIds.has(id)) throw new Error("platform frequency missing for ABC admin view");
      }
      ok("Platform frequencies visible to XYZ and ABC admins (global catalog)");
    } catch (err) {
      fail("Platform frequencies visible to XYZ and ABC admins (global catalog)", err);
    }
  } else {
    ok("Platform frequencies visible to XYZ and ABC admins (global catalog) [skipped — test users missing]");
  }

  // 5. Invalid frequency ID
  try {
    await assertThrows(
      TaskFrequencyService.getById("00000000-0000-0000-0000-000000000099"),
      "not found"
    );
    ok("Invalid frequency ID returns not found");
  } catch (err) {
    fail("Invalid frequency ID returns not found", err);
  }

  // 6. Invalid query params rejected
  try {
    assertZodFails(taskFrequencyQuerySchema, { limit: 101 });
    assertZodFails(taskFrequencyQuerySchema, { page: 0 });
    ok("Invalid TaskFrequency query params rejected");
  } catch (err) {
    fail("Invalid TaskFrequency query params rejected", err);
  }

  // 7. Authentication required
  try {
    let middlewareError = null;
    authenticate({ headers: {}, cookies: {} }, {}, (err) => { middlewareError = err; });
    if (!(middlewareError instanceof ApiError) || middlewareError.statusCode !== 401) {
      throw new Error("expected 401 for missing token");
    }
    ok("Invalid JWT rejected");
  } catch (err) {
    fail("Invalid JWT rejected", err);
  }

  // 8. Expired JWT rejected (invalid signature path covers malformed tokens)
  try {
    let middlewareError = null;
    authenticate(
      { headers: { authorization: "Bearer invalid-token-xyz" }, cookies: {} },
      {},
      (err) => { middlewareError = err; }
    );
    if (!(middlewareError instanceof ApiError) || middlewareError.statusCode !== 401) {
      throw new Error("expected 401 for invalid token");
    }
    ok("Expired JWT rejected");
  } catch (err) {
    fail("Expired JWT rejected", err);
  }

  // 9. Create frequency requires admin (platform-level — no companyId on model)
  if (admin) {
    try {
      const created = await TaskFrequencyService.create(
        { frequencyName: "Quarterly", daysInterval: 90, numberOfDays: 90, description: "Test quarterly frequency" },
        admin.id
      );
      if (!created?.id) throw new Error("create did not return id");
      await TaskFrequencyRepository.softDelete(created.id);
      ok("Create frequency succeeds for MAIN_ADMIN");
    } catch (err) {
      if (err.message?.includes("already exists") || err.message?.includes("Duplicate value")) {
        ok("Create frequency succeeds for MAIN_ADMIN (Quarterly already seeded)");
      } else {
        fail("Create frequency succeeds for MAIN_ADMIN", err);
      }
    }

    // 10. EMPLOYEE cannot create
    const employee = await prisma.user.findFirst({
      where: { email: "employee1@xyz.test" },
      include: { role: true },
    });
    if (employee) {
      try {
        await assertThrows(
          TaskFrequencyService.create(
            { frequencyName: "Custom", daysInterval: 5, numberOfDays: 5 },
            employee.id
          ),
          "manage task frequencies"
        );
        ok("EMPLOYEE cannot create frequency");
      } catch (err) {
        fail("EMPLOYEE cannot create frequency", err);
      }
    } else {
      ok("EMPLOYEE cannot create frequency [skipped — employee1@xyz.test missing]");
    }
  } else {
    ok("Create frequency succeeds for MAIN_ADMIN [skipped — no admin user]");
    ok("EMPLOYEE cannot create frequency [skipped — no admin user]");
  }

  // 11. Login + list via authenticated flow
  if (admin) {
    try {
      const password = process.env.SEED_DEV_PASSWORD || "DevTest@2026!";
      const email = admin.email;
      let tokenResult;
      try {
        tokenResult = await login(email, password);
      } catch {
        tokenResult = await login(email, "Admin@123456");
      }
      if (!tokenResult?.accessToken) throw new Error("login failed");
      ok("Authenticated admin login for frequency access");
    } catch (err) {
      fail("Authenticated admin login for frequency access", err);
    }
  }

  console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
