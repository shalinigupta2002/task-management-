/**
 * Verifies test seed users: login + multi-tenancy isolation.
 * Run after: npm run db:seed:test
 */

import dotenv from "dotenv";
import prisma from "../src/config/database.js";
import AuthService from "../src/services/AuthService.js";
import UserService from "../src/services/UserService.js";
import TaskService from "../src/services/TaskService.js";
import ApiError from "../src/utils/ApiError.js";
import { authenticate } from "../src/middlewares/auth.middleware.js";
import { verifyToken } from "../src/utils/jwt.js";
import jwt from "jsonwebtoken";
import config from "../src/config/index.js";

dotenv.config();

const DEV_PASSWORD = process.env.SEED_DEV_PASSWORD || "DevTest@2026!";

let passed = 0;
let failed = 0;

function ok(label) {
  passed += 1;
  console.log(`✓ ${label}`);
}

function fail(label, err) {
  failed += 1;
  console.error(`✗ ${label}: ${err?.message || err}`);
}

async function assertThrows(promise, segment = "") {
  try {
    await promise;
    throw new Error("expected rejection");
  } catch (err) {
    if (err.message === "expected rejection") throw err;
    if (segment && !String(err.message).toLowerCase().includes(segment.toLowerCase())) {
      throw new Error(`Expected message containing "${segment}", got "${err.message}"`);
    }
  }
}

async function login(email) {
  return AuthService.login(email, DEV_PASSWORD);
}

async function main() {
  console.log("=== TEST SEED VERIFICATION ===\n");

  const users = {
    super: await prisma.user.findUnique({ where: { email: "superadmin@system.test" }, include: { role: true } }),
    xyzMain: await prisma.user.findUnique({ where: { email: "admin@xyz.test" }, include: { role: true } }),
    xyzSub: await prisma.user.findUnique({ where: { email: "subadmin1@xyz.test" }, include: { role: true } }),
    xyzEmp: await prisma.user.findUnique({ where: { email: "employee1@xyz.test" }, include: { role: true } }),
    abcMain: await prisma.user.findUnique({ where: { email: "admin@abc.test" }, include: { role: true } }),
    abcSub: await prisma.user.findUnique({ where: { email: "subadmin@abc.test" }, include: { role: true } }),
    abcEmp: await prisma.user.findUnique({ where: { email: "employee@abc.test" }, include: { role: true } }),
  };

  for (const [key, u] of Object.entries(users)) {
    if (!u) {
      fail(`User record exists (${key})`, new Error("not found — run npm run db:seed:test"));
    }
  }
  if (failed) process.exit(1);

  const xyzCompany = await prisma.company.findUnique({ where: { companyCode: "XYZ001" } });
  const abcCompany = await prisma.company.findUnique({ where: { companyCode: "ABC001" } });

  // 1–5 Login tests
  const loginCases = [
    ["SUPER_ADMIN login", "superadmin@system.test"],
    ["XYZ MAIN_ADMIN login", "admin@xyz.test"],
    ["XYZ SUB_ADMIN login", "subadmin1@xyz.test"],
    ["XYZ EMPLOYEE login", "employee1@xyz.test"],
    ["ABC MAIN_ADMIN login", "admin@abc.test"],
  ];

  for (const [label, email] of loginCases) {
    try {
      const result = await login(email);
      if (!result.accessToken) throw new Error("no token returned");
      ok(label);
    } catch (err) {
      fail(label, err);
    }
  }

  const xyzCtx = { userId: users.xyzMain.id, role: "MAIN_ADMIN", companyId: users.xyzMain.companyId };
  const xyzSubCtx = { userId: users.xyzSub.id, role: "SUB_ADMIN", companyId: users.xyzSub.companyId };
  const xyzEmpId = users.xyzEmp.id;
  const abcCtx = { userId: users.abcMain.id, role: "MAIN_ADMIN", companyId: users.abcMain.companyId };

  // 6 XYZ MAIN_ADMIN can access XYZ users
  try {
    const list = await UserService.getAll({}, xyzCtx);
    const hasXyz = list.items.some((u) => u.email === "employee1@xyz.test");
    if (!hasXyz) throw new Error("XYZ employee not in list");
    ok("XYZ MAIN_ADMIN can access XYZ users");
  } catch (err) {
    fail("XYZ MAIN_ADMIN can access XYZ users", err);
  }

  // 7 XYZ MAIN_ADMIN cannot access ABC users
  try {
    await assertThrows(UserService.getById(users.abcMain.id, xyzCtx), "access denied");
    ok("XYZ MAIN_ADMIN cannot access ABC users");
  } catch (err) {
    fail("XYZ MAIN_ADMIN cannot access ABC users", err);
  }

  const abcTask = await prisma.task.findFirst({
    where: { companyId: abcCompany.id, deletedAt: null, title: { startsWith: "TEST:" } },
  });
  const xyzTask = await prisma.task.findFirst({
    where: { companyId: xyzCompany.id, deletedAt: null, title: { startsWith: "TEST:" } },
  });

  // 8 XYZ SUB_ADMIN cannot access ABC tasks
  if (abcTask) {
    try {
      await assertThrows(TaskService.getById(abcTask.id, users.xyzSub.id), "access denied");
      ok("XYZ SUB_ADMIN cannot access ABC tasks");
    } catch (err) {
      fail("XYZ SUB_ADMIN cannot access ABC tasks", err);
    }
  } else {
    fail("XYZ SUB_ADMIN cannot access ABC tasks", new Error("no ABC test task found"));
  }

  // 9 XYZ EMPLOYEE cannot access ABC tasks
  if (abcTask) {
    try {
      await assertThrows(TaskService.getById(abcTask.id, xyzEmpId), "access denied");
      ok("XYZ EMPLOYEE cannot access ABC tasks");
    } catch (err) {
      fail("XYZ EMPLOYEE cannot access ABC tasks", err);
    }
  } else {
    fail("XYZ EMPLOYEE cannot access ABC tasks", new Error("no ABC test task found"));
  }

  // 10 ABC users cannot access XYZ data
  if (xyzTask) {
    try {
      await assertThrows(TaskService.getById(xyzTask.id, users.abcMain.id), "access denied");
      await assertThrows(UserService.getById(users.xyzMain.id, abcCtx), "access denied");
      ok("ABC users cannot access XYZ data");
    } catch (err) {
      fail("ABC users cannot access XYZ data", err);
    }
  } else {
    fail("ABC users cannot access XYZ data", new Error("no XYZ test task found"));
  }

  // 11 Multiple assignees
  if (xyzTask) {
    try {
      const full = await TaskService.getById(xyzTask.id, users.xyzMain.id);
      const count = full.assignments?.filter((a) => a.status !== "CANCELLED").length || 0;
      const multiTask = await prisma.task.findFirst({
        where: {
          companyId: xyzCompany.id,
          title: "TEST: Multi-Assignee Compliance Review",
          deletedAt: null,
        },
        include: { assignments: true },
      });
      const multiCount = multiTask?.assignments?.filter((a) => a.status !== "CANCELLED").length || 0;
      if (multiCount < 2) throw new Error(`expected 2+ assignees, got ${multiCount}`);
      ok("Multiple assignees work correctly");
    } catch (err) {
      fail("Multiple assignees work correctly", err);
    }
  }

  // 12 Approver workflow
  try {
    const multi = await prisma.task.findFirst({
      where: { companyId: xyzCompany.id, title: "TEST: Multi-Assignee Compliance Review", deletedAt: null },
    });
    if (!multi?.approverId) throw new Error("approver not set on multi-assignee task");
    ok("Approver workflow configured (designated approver present)");
  } catch (err) {
    fail("Approver workflow configured", err);
  }

  // 13 Recurring task company scoped
  try {
    const daily = await prisma.task.findFirst({
      where: { companyId: xyzCompany.id, title: "TEST: Daily Recurring Standup", deletedAt: null },
      include: { occurrences: true },
    });
    if (!daily || daily.companyId !== xyzCompany.id) throw new Error("daily task missing");
    if (daily.occurrences.length < 2) throw new Error("expected multiple occurrences");
    const abcDaily = await prisma.task.findFirst({
      where: { companyId: abcCompany.id, title: "TEST: Daily Recurring Standup", deletedAt: null },
    });
    if (abcDaily && abcDaily.companyId === xyzCompany.id) {
      throw new Error("ABC daily task has wrong company");
    }
    ok("Recurring task belongs only to its company");
  } catch (err) {
    fail("Recurring task belongs only to its company", err);
  }

  // 14 Invalid JWT
  try {
    let errCaught = null;
    authenticate({ headers: { authorization: "Bearer not-valid" }, cookies: {} }, {}, (e) => { errCaught = e; });
    if (!(errCaught instanceof ApiError) || errCaught.statusCode !== 401) {
      throw new Error("invalid JWT not rejected");
    }
    ok("Invalid JWT rejected");
  } catch (err) {
    fail("Invalid JWT rejected", err);
  }

  // 15 Expired JWT
  try {
    const expired = jwt.sign(
      { userId: users.xyzMain.id, email: users.xyzMain.email, role: "MAIN_ADMIN" },
      config.jwt.secret,
      { expiresIn: "-1s" }
    );
    verifyToken(expired);
    fail("Expired JWT rejected", new Error("token was accepted"));
  } catch {
    ok("Expired JWT rejected");
  }

  console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
