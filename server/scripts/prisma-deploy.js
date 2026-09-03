/**
 * Ensures Prisma CLI has DATABASE_URL + DIRECT_URL, then generate + migrate deploy.
 * Safe for Render builds. Never prints connection strings or credentials.
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
  console.error("Missing DATABASE_URL - set it in the Render environment.");
  process.exit(1);
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
  console.warn(
    "DIRECT_URL is not set; falling back to DATABASE_URL for Prisma migrate. For Neon, set DIRECT_URL to the non-pooled connection string."
  );
}

console.log(`Prisma datasource host (pooled/app): ${hostOf(process.env.DATABASE_URL)}`);
console.log(`Prisma migrate host (direct): ${hostOf(process.env.DIRECT_URL)}`);

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
