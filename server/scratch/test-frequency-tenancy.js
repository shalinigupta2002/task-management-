/**
 * TaskFrequency multi-tenant mutation guards.
 * Requires local test users from: npm run db:seed:test
 * Does NOT enable ALLOW_DEMO_SEED.
 *
 * Run: node scratch/test-frequency-tenancy.js
 */
import prisma from "../src/config/database.js";
import TaskFrequencyService from "../src/services/TaskFrequencyService.js";

async function resolveUser(emails) {
  for (const email of emails) {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true },
    });
    if (user) return user;
  }
  return null;
}

async function expectForbidden(promise, label) {
  try {
    await promise;
    throw new Error(`${label}: expected forbidden/error but succeeded`);
  } catch (err) {
    if (err.message?.startsWith(`${label}:`)) throw err;
    const status = err.statusCode || err.status;
    if (status === 403) return;
    if (/forbidden|access denied|cannot modify|only super admin|platform frequency/i.test(err.message || "")) {
      return;
    }
    throw new Error(`${label}: unexpected error: ${err.message}`);
  }
}

async function ensureCompanyCustom(admin, daysInterval) {
  const existing = await prisma.taskFrequency.findFirst({
    where: {
      companyId: admin.companyId,
      frequencyName: "Custom",
      deletedAt: null,
    },
  });
  if (existing) return { freq: existing, created: false };
  const freq = await TaskFrequencyService.create(
    {
      frequencyName: "Custom",
      daysInterval,
      numberOfDays: daysInterval,
      description: `Custom for tenancy test ${Date.now()}`,
    },
    admin.id
  );
  return { freq, created: true };
}

async function main() {
  console.log("=== TaskFrequency tenancy checks ===");

  const xyzAdmin = await resolveUser(["admin@xyz.test", "rajesh.kumar@techsolutions.com"]);
  const abcAdmin = await resolveUser(["admin@abc.test", "amit.patel@greenleaf.com"]);
  const superAdmin = await resolveUser(["superadmin@system.test", "superadmin@taskflow.com"]);

  if (!xyzAdmin || !abcAdmin) {
    console.error(
      "Missing test admins. Run locally:\n  npm run db:seed:test\nDo NOT set ALLOW_DEMO_SEED in production."
    );
    process.exit(1);
  }

  let platform = await prisma.taskFrequency.findFirst({
    where: { companyId: null, deletedAt: null },
  });
  if (!platform && superAdmin) {
    platform = await TaskFrequencyService.create(
      {
        frequencyName: "Daily",
        daysInterval: 1,
        numberOfDays: 1,
        description: "Platform Daily",
      },
      superAdmin.id
    );
  }
  if (!platform) {
    console.error("No platform frequency available and no SUPER_ADMIN to create one.");
    process.exit(1);
  }

  const xyz = await ensureCompanyCustom(xyzAdmin, 3);
  const abc = await ensureCompanyCustom(abcAdmin, 5);

  if (xyz.freq.companyId !== xyzAdmin.companyId) {
    throw new Error("XYZ custom frequency not scoped to XYZ company");
  }
  if (abc.freq.companyId !== abcAdmin.companyId) {
    throw new Error("ABC custom frequency not scoped to ABC company");
  }

  await expectForbidden(
    TaskFrequencyService.update(platform.id, { description: "hacked" }, xyzAdmin.id),
    "Main Admin must not update platform frequency"
  );
  await expectForbidden(
    TaskFrequencyService.remove(platform.id, xyzAdmin.id),
    "Main Admin must not delete platform frequency"
  );
  await expectForbidden(
    TaskFrequencyService.update(abc.freq.id, { description: "cross" }, xyzAdmin.id),
    "XYZ must not update ABC frequency"
  );
  await expectForbidden(
    TaskFrequencyService.remove(abc.freq.id, xyzAdmin.id),
    "XYZ must not delete ABC frequency"
  );
  await expectForbidden(
    TaskFrequencyService.update(xyz.freq.id, { description: "cross" }, abcAdmin.id),
    "ABC must not update XYZ frequency"
  );

  if (xyz.created) await TaskFrequencyService.remove(xyz.freq.id, xyzAdmin.id);
  if (abc.created) await TaskFrequencyService.remove(abc.freq.id, abcAdmin.id);

  console.log("PASS: platform frequencies Super-Admin-only; company frequencies tenant-isolated");
  process.exit(0);
}

main()
  .catch((err) => {
    console.error("FAIL:", err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      /* ignore */
    }
  });
