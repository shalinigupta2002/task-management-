import prisma from "../src/config/database.js";
import CompanyService from "../src/services/CompanyService.js";
import AuthService from "../src/services/AuthService.js";
import jwt from "jsonwebtoken";
import config from "../src/config/index.js";

const pwd = `Tf@${Date.now().toString(36)}X7!m`;
const code = `TF${Date.now().toString().slice(-6)}`;
const email = `co.${code.toLowerCase()}@example.com`;
const adminEmail = `admin.${code.toLowerCase()}@example.com`;

async function main() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: { name: "SUPER_ADMIN" }, deletedAt: null },
  });
  if (!superAdmin) throw new Error("No SUPER_ADMIN");

  const plan = await prisma.subscriptionPlan.findFirst({
    where: { status: "ACTIVE", deletedAt: null },
  });
  if (!plan) throw new Error("No plan");

  const ctx = { userId: superAdmin.id, role: "SUPER_ADMIN", companyId: null };
  const created = await CompanyService.create(
    {
      companyName: `Test Co ${code}`,
      companyCode: code,
      email,
      address: "123 Test Street",
      subscriptionPlanId: plan.id,
      mainAdmin: {
        name: "Main Admin",
        email: adminEmail,
        phone: "9999999999",
        password: pwd,
        confirmPassword: pwd,
      },
    },
    ctx
  );

  const serialized = JSON.stringify(created);
  console.log("Created company id:", created.id);
  console.log("Password leaked in response:", serialized.includes(pwd));
  console.log("password field present:", /"password"\s*:/.test(serialized));
  console.log("Main admin email:", created.mainAdmin?.email);
  console.log("Main admin role:", created.mainAdmin?.role?.name);
  console.log("Subscription present:", Boolean(created.subscriptions?.length));

  const login = await AuthService.login(adminEmail, pwd);
  const decoded = jwt.verify(login.accessToken, config.jwt.secret);
  console.log("JWT:", {
    userId: decoded.userId,
    role: decoded.role,
    companyId: decoded.companyId,
  });
  if (decoded.role !== "MAIN_ADMIN" || decoded.companyId !== created.id) {
    throw new Error("JWT claims incorrect");
  }
  console.log("LOGIN OK");

  await prisma.user.update({
    where: { id: created.mainAdmin.id },
    data: { deletedAt: new Date(), email: `deleted_${adminEmail}` },
  });
  await prisma.companySubscription.updateMany({
    where: { companyId: created.id },
    data: { deletedAt: new Date(), subscriptionStatus: "CANCELLED" },
  });
  await prisma.company.update({
    where: { id: created.id },
    data: { deletedAt: new Date(), email: `deleted_${email}`, companyCode: `DEL_${code}` },
  });
}

main()
  .catch((err) => {
    console.error("FAILED:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
