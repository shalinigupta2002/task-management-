/**
 * Production-readiness regression checks for seed/payment/CORS/tenant guards.
 * Run: node scratch/test-prod-readiness-guards.js
 * Does not print secrets.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL  ${name}: ${err.message}`);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

check("ensure-demo-seed blocked without ALLOW_DEMO_SEED", () => {
  const env = { ...process.env };
  delete env.ALLOW_DEMO_SEED;
  env.NODE_ENV = "development";
  const result = spawnSync(process.execPath, ["./scripts/ensure-demo-seed.js"], {
    cwd: root,
    env,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /ALLOW_DEMO_SEED/);
});

check("destructive seed blocked in production (source)", () => {
  const src = read("prisma/seed.js");
  assert.match(src, /ALLOW_DESTRUCTIVE_SEED/);
  assert.match(src, /NODE_ENV === "production"/);
});

check("payment simulate blocked in production (source)", () => {
  const src = read("src/services/OnboardingService.js");
  assert.match(src, /Payment simulation is disabled in production/);
});

check("CORS wildcard rejected in production validateEnv", () => {
  const src = read("src/config/validateEnv.js");
  assert.match(src, /wildcard \* is not allowed/);
});

check("socket presence company-scoped (source)", () => {
  const src = read("src/socket/index.js");
  assert.match(src, /company:\$\{companyId\}/);
  assert.match(src, /assertConversationMember\(userId, conversationId\)/);
  assert.ok(!/^\s*io\.emit\("user:connected"/m.test(src));
});

check("notification create requires actor tenant check (source)", () => {
  const src = read("src/services/NotificationService.js");
  assert.match(src, /Cannot create notification for a user outside your company/);
});

check("GET /user requires admin authorize (source)", () => {
  const src = read("src/routes/user.routes.js");
  assert.match(
    src,
    /authorize\(ROLES\.SUPER_ADMIN, ROLES\.MAIN_ADMIN, ROLES\.SUB_ADMIN\)[\s\S]*UserController\.getAll/
  );
});

check("health route exists", () => {
  const src = read("src/routes/index.js");
  assert.match(src, /\/health/);
});

console.log(`\nProd readiness guards: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
