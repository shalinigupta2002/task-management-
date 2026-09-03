/**
 * Ensures Prisma CLI has DATABASE_URL + DIRECT_URL, then generate + migrate deploy.
 * Safe for Render builds. Never prints connection strings or credentials.
 *
 * Loads local `.env` via dotenv when present (local `npm run build`).
 * On Render, Environment Variables are injected into process.env instead.
 */
import "dotenv/config";
import { spawnSync } from "node:child_process";

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "(unparseable)";
  }
}

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL - set the Neon pooled connection in the environment.");
  process.exit(1);
}

if (!process.env.DIRECT_URL) {
  console.error(
    "Missing DIRECT_URL - set the Neon direct (non-pooler) connection for prisma migrate deploy."
  );
  process.exit(1);
}

console.log(`Prisma datasource host (pooled/app): ${hostOf(process.env.DATABASE_URL)}`);
console.log(`Prisma migrate host (direct): ${hostOf(process.env.DIRECT_URL)}`);

if (hostOf(process.env.DATABASE_URL).includes("-pooler") === false) {
  console.warn(
    "DATABASE_URL host does not look pooled (-pooler). Prefer Neon's pooled URL for the app."
  );
}
if (hostOf(process.env.DIRECT_URL).includes("-pooler")) {
  console.warn(
    "DIRECT_URL host looks pooled (-pooler). Prefer Neon's direct URL for migrate deploy."
  );
}

function runPrisma(args) {
  const result = spawnSync("npx", ["prisma", ...args], {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runPrisma(["generate"]);
runPrisma(["migrate", "deploy"]);
console.log("Prisma generate + migrate deploy completed.");

// Fresh/empty DB only: create demo login users (skipped when any user exists).
const seedResult = spawnSync(process.execPath, ["./scripts/ensure-demo-seed.js"], {
  stdio: "inherit",
  env: process.env,
  shell: false,
});
if (seedResult.status !== 0) {
  process.exit(seedResult.status ?? 1);
}