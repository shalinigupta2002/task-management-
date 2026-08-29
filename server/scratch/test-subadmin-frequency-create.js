import prisma from "../src/config/database.js";
import TaskFrequencyService from "../src/services/TaskFrequencyService.js";

async function main() {
  const sub = await prisma.user.findFirst({
    where: { deletedAt: null, status: "ACTIVE", role: { name: "SUB_ADMIN" } },
  });
  const employee = await prisma.user.findFirst({
    where: { deletedAt: null, status: "ACTIVE", role: { name: "EMPLOYEE" } },
  });
  if (!sub) throw new Error("No SUB_ADMIN");

  // Clean leftover Custom if present from prior tests
  const existingCustom = await prisma.taskFrequency.findFirst({
    where: { frequencyName: "Custom", deletedAt: null },
  });
  if (existingCustom) {
    await prisma.taskFrequency.update({
      where: { id: existingCustom.id },
      data: { deletedAt: new Date(), frequencyName: `Custom-deleted-${Date.now()}` },
    });
  }

  const created = await TaskFrequencyService.create({
    frequencyName: "Custom",
    daysInterval: 14,
    numberOfDays: 14,
    description: "Sub admin custom frequency test",
    status: "ACTIVE",
  }, sub.id);
  console.log("OK Sub Admin created", created.id, created.frequencyName);

  try {
    await TaskFrequencyService.create({
      frequencyName: "Custom",
      daysInterval: 21,
      numberOfDays: 21,
      status: "ACTIVE",
    }, sub.id);
    console.error("FAIL duplicate allowed");
    process.exitCode = 1;
  } catch (err) {
    console.log("OK duplicate blocked:", err.message);
  }

  if (employee) {
    try {
      await TaskFrequencyService.create({
        frequencyName: "Yearly",
        daysInterval: 365,
        numberOfDays: 365,
        status: "ACTIVE",
      }, employee.id);
      console.error("FAIL employee allowed");
      process.exitCode = 1;
    } catch (err) {
      console.log("OK employee forbidden:", err.message);
    }
  }

  // Soft-delete the test Custom so list stays clean
  const admin = await prisma.user.findFirst({
    where: { deletedAt: null, role: { name: "MAIN_ADMIN" } },
  });
  if (admin) {
    await TaskFrequencyService.remove(created.id, admin.id);
    console.log("OK cleaned up test frequency");
  }

  console.log("FREQUENCY RBAC TESTS PASSED");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
