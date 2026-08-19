/**
 * Self-service onboarding E2E regression tests.
 * Usage: node scratch/test-onboarding.js
 */
import prisma from "../src/config/database.js";
import OnboardingService from "../src/services/OnboardingService.js";
import CompanyService from "../src/services/CompanyService.js";
import AuthService from "../src/services/AuthService.js";
import UserService from "../src/services/UserService.js";
import ApiError from "../src/utils/ApiError.js";
import jwt from "jsonwebtoken";
import config from "../src/config/index.js";

async function assertThrows(promise, segment = "") {
  try {
    await promise;
    throw new Error("Expected throw but succeeded");
  } catch (err) {
    if (err.message === "Expected throw but succeeded") throw err;
    if (!(err instanceof ApiError)) {
      throw new Error(`Expected ApiError, got ${err.constructor.name}: ${err.message}`);
    }
    if (segment && !err.message.toLowerCase().includes(segment.toLowerCase())) {
      throw new Error(`Expected message containing "${segment}", got "${err.message}"`);
    }
  }
}

async function main() {
  console.log("=== SELF-SERVICE ONBOARDING TESTS ===\n");
  const createdCompanyIds = [];
  const createdEmails = [];

  try {
    const plans = await OnboardingService.listPublicPlans();
    if (!plans.length) throw new Error("No public plans available");
    const plan = plans[0];
    console.log(`1. ✓ Plans loaded (${plans.length}), using ${plan.planName}`);

    const checkout = await OnboardingService.createCheckout({
      subscriptionPlanId: plan.id,
      billingCycle: "MONTHLY",
      contactEmail: `buyer-${Date.now()}@example.com`,
    });
    if (!checkout.referenceCode || !checkout.sessionToken || !checkout.paymentOrderId) {
      throw new Error("Checkout incomplete");
    }
    if (checkout.amountInPaise !== Math.round(Number(plan.monthlyPrice) * 100)) {
      throw new Error("Locked amount does not match plan monthly price");
    }
    console.log("2. ✓ Checkout created with locked amount");

    await OnboardingService.markPaymentFailed({
      referenceCode: checkout.referenceCode,
      sessionToken: checkout.sessionToken,
    });
    const afterFail = await prisma.companyOnboarding.findFirst({
      where: { referenceCode: checkout.referenceCode },
    });
    if (afterFail.status !== "PAYMENT_FAILED" || afterFail.companyId) {
      throw new Error("Failed payment incorrectly provisioned tenant");
    }
    console.log("3. ✓ Failed payment does not create company");

    const checkout2 = await OnboardingService.createCheckout({
      subscriptionPlanId: plan.id,
      billingCycle: "YEARLY",
    });

    await assertThrows(
      OnboardingService.verifyPayment({
        referenceCode: checkout2.referenceCode,
        sessionToken: checkout2.sessionToken,
        paymentId: "pay_fake",
        checkoutToken: "bad",
        amountInPaise: 1,
      }),
      "amount"
    );
    console.log("4. ✓ Amount manipulation rejected");

    await assertThrows(
      OnboardingService.verifyPayment({
        referenceCode: checkout2.referenceCode,
        sessionToken: checkout2.sessionToken,
        paymentId: "pay_fake",
        checkoutToken: checkout2.checkout?.checkoutToken || "x",
        subscriptionPlanId: "00000000-0000-4000-8000-000000000001",
      }),
      "Plan"
    );
    console.log("5. ✓ Plan manipulation rejected");

    const paid = await OnboardingService.simulatePaymentSuccess({
      referenceCode: checkout2.referenceCode,
      sessionToken: checkout2.sessionToken,
    });
    if (paid.status !== "ONBOARDING_PENDING") throw new Error("Expected ONBOARDING_PENDING");
    console.log("6. ✓ Payment success → onboarding pending");

    const resumed = await OnboardingService.simulatePaymentSuccess({
      referenceCode: checkout2.referenceCode,
      sessionToken: checkout2.sessionToken,
    });
    if (resumed.status !== "ONBOARDING_PENDING") throw new Error("Resume failed");
    console.log("7. ✓ Resume onboarding without re-payment");

    await assertThrows(
      OnboardingService.getBySession(checkout2.referenceCode, "wrong-session-token-xxxxxxxxxxxxx"),
      "Invalid"
    );
    console.log("8. ✓ Invalid onboarding session rejected");

    const stamp = Date.now();
    const adminEmail = `onboard-admin-${stamp}@example.com`;
    const companyEmail = `onboard-co-${stamp}@example.com`;
    const password = `TaskFlow@${stamp.toString(36)}X9!`;
    createdEmails.push(adminEmail, companyEmail);

    await assertThrows(
      OnboardingService.completeOnboarding({
        referenceCode: checkout2.referenceCode,
        sessionToken: checkout2.sessionToken,
        company: {
          companyName: `Hack Co ${stamp}`,
          email: companyEmail,
          address: "1 Hack St",
          companyCode: "HACK",
        },
        mainAdmin: {
          name: "Hack Admin",
          email: adminEmail,
          password,
          confirmPassword: password,
        },
      }),
      "companyId/companyCode"
    );
    console.log("9. ✓ Client companyCode spoof rejected");

    const completed = await OnboardingService.completeOnboarding({
      referenceCode: checkout2.referenceCode,
      sessionToken: checkout2.sessionToken,
      company: {
        companyName: `Onboard Co ${stamp}`,
        email: companyEmail,
        address: "99 Onboard Street",
      },
      mainAdmin: {
        name: "Onboard Admin",
        email: adminEmail,
        phone: "9000000000",
        password,
        confirmPassword: password,
      },
    });
    createdCompanyIds.push(completed.company.id);

    if (!completed.company.companyCode?.startsWith("TF-")) {
      throw new Error(`Bad companyCode ${completed.company.companyCode}`);
    }
    console.log(`10. ✓ Company created with code ${completed.company.companyCode}`);

    const adminDb = await prisma.user.findFirst({ where: { email: adminEmail } });
    if (!adminDb || adminDb.password === password) throw new Error("Password not hashed");
    if (JSON.stringify(completed).includes(password)) throw new Error("Password leaked in response");
    console.log("11. ✓ Main Admin password hashed; not returned");

    const sub = await prisma.companySubscription.findFirst({
      where: { companyId: completed.company.id, deletedAt: null },
    });
    if (!sub || sub.subscriptionStatus !== "ACTIVE") throw new Error("Subscription missing");
    if (sub.billingCycle !== "YEARLY") throw new Error("Billing cycle not YEARLY");
    console.log("12. ✓ Subscription created and active");

    const login = await AuthService.login(adminEmail, password);
    const decoded = jwt.verify(login.accessToken, config.jwt.secret);
    if (decoded.role !== "MAIN_ADMIN") throw new Error("JWT role incorrect");
    if (decoded.companyId !== completed.company.id) throw new Error("JWT companyId incorrect");
    if (decoded.companyCode !== completed.company.companyCode) throw new Error("JWT companyCode incorrect");
    console.log("13. ✓ Main Admin login + JWT claims OK");

    const mainCtx = {
      userId: adminDb.id,
      role: "MAIN_ADMIN",
      companyId: completed.company.id,
    };
    const users = await UserService.getAll({}, mainCtx);
    if (!users.items.every((u) => u.companyId === completed.company.id)) {
      throw new Error("Main Admin saw cross-company users");
    }
    console.log("14. ✓ Main Admin sees only own company users");

    await assertThrows(
      CompanyService.update(completed.company.id, { companyCode: "NEW-CODE" }, mainCtx),
      "immutable"
    );
    console.log("15. ✓ MAIN_ADMIN cannot change companyCode");

    // Super Admin Add Company still works via shared provisioning
    const superAdmin = await prisma.user.findFirst({
      where: { email: "superadmin@taskflow.com", deletedAt: null },
    });
    if (superAdmin) {
      const saStamp = Date.now();
      const saCompany = await CompanyService.create(
        {
          companyName: `SA Co ${saStamp}`,
          email: `sa-co-${saStamp}@example.com`,
          address: "1 Super Admin Way",
          subscriptionPlanId: plan.id,
          mainAdmin: {
            name: "SA Admin",
            email: `sa-admin-${saStamp}@example.com`,
            password: "StrongPass@123456",
            confirmPassword: "StrongPass@123456",
          },
        },
        { userId: superAdmin.id, role: "SUPER_ADMIN" }
      );
      createdCompanyIds.push(saCompany.id);
      createdEmails.push(`sa-admin-${saStamp}@example.com`, `sa-co-${saStamp}@example.com`);
      if (!saCompany.companyCode?.startsWith("TF-")) throw new Error("SA company code invalid");
      console.log("16. ✓ Super Admin Add Company still works");
    } else {
      console.log("16. ⊘ Super Admin seed user missing — skipped");
    }

    console.log("\n=== ALL ONBOARDING TESTS PASSED ===");
  } finally {
    for (const email of createdEmails) {
      await prisma.user.deleteMany({ where: { email } }).catch(() => {});
    }
    if (createdCompanyIds.length) {
      await prisma.companySubscription.deleteMany({
        where: { companyId: { in: createdCompanyIds } },
      }).catch(() => {});
      await prisma.companyOnboarding.updateMany({
        where: { companyId: { in: createdCompanyIds } },
        data: { companyId: null },
      }).catch(() => {});
      await prisma.company.deleteMany({ where: { id: { in: createdCompanyIds } } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

main().catch(async (err) => {
  console.error("FAILED:", err);
  await prisma.$disconnect();
  process.exit(1);
});
