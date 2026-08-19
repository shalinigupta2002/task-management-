import crypto from "crypto";
import prisma from "../config/database.js";
import ApiError from "../utils/ApiError.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { logAudit } from "../utils/auditLogger.js";
import { handlePrismaError } from "../utils/prismaError.js";
import PaymentProvider from "./PaymentProvider.js";
import { provisionTenant } from "./TenantProvisioningService.js";

const RESUME_STATUSES = new Set([
  "PAYMENT_SUCCESS",
  "ONBOARDING_PENDING",
]);

function toNumber(value) {
  return Number(value);
}

function amountInPaiseFromPlan(plan, billingCycle) {
  const rupees = billingCycle === "YEARLY"
    ? toNumber(plan.yearlyPrice)
    : toNumber(plan.monthlyPrice);
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw ApiError.badRequest("Invalid plan price");
  }
  return Math.round(rupees * 100);
}

function publicOnboardingView(record, plan) {
  return {
    referenceCode: record.referenceCode,
    status: record.status,
    billingCycle: record.billingCycle,
    amountInPaise: record.amountInPaise,
    amountRupees: record.amountInPaise / 100,
    currency: record.currency,
    paymentProvider: record.paymentProvider,
    paymentOrderId: record.paymentOrderId,
    paidAt: record.paidAt,
    expiresAt: record.expiresAt,
    plan: plan
      ? {
        id: plan.id,
        planName: plan.planName,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        description: plan.description,
        features: plan.features,
      }
      : undefined,
    company: record.company
      ? {
        id: record.company.id,
        companyName: record.company.companyName,
        companyCode: record.company.companyCode,
        email: record.company.email,
      }
      : null,
  };
}

class OnboardingService {
  async listPublicPlans() {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
      orderBy: { monthlyPrice: "asc" },
    });
    return plans.map((p) => ({
      id: p.id,
      planName: p.planName,
      description: p.description,
      monthlyPrice: p.monthlyPrice,
      yearlyPrice: p.yearlyPrice,
      currency: "INR",
      maxEmployees: p.maxEmployees,
      maxDepartments: p.maxDepartments,
      maxActiveTasks: p.maxActiveTasks,
      features: p.features,
      status: p.status,
    }));
  }

  async createCheckout({ subscriptionPlanId, billingCycle, contactEmail }) {
    const cycle = billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY";
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id: subscriptionPlanId, deletedAt: null, status: "ACTIVE" },
    });
    if (!plan) throw ApiError.badRequest("Invalid or inactive subscription plan");

    const amountInPaise = amountInPaiseFromPlan(plan, cycle);
    const referenceCode = `ONB-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionTokenHash = await hashPassword(sessionToken);
    const paymentOrderId = `order_${crypto.randomBytes(10).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const record = await prisma.companyOnboarding.create({
      data: {
        referenceCode,
        sessionTokenHash,
        status: "PAYMENT_PENDING",
        subscriptionPlanId: plan.id,
        billingCycle: cycle,
        amountInPaise,
        currency: "INR",
        paymentProvider: PaymentProvider.mode,
        paymentOrderId,
        contactEmail: contactEmail || null,
        expiresAt,
        metadata: {
          lockedPlanName: plan.planName,
          lockedAmountInPaise: amountInPaise,
          lockedBillingCycle: cycle,
        },
      },
      include: { subscriptionPlan: true },
    });

    const order = PaymentProvider.createOrder({
      orderId: paymentOrderId,
      amountInPaise,
      currency: "INR",
      notes: { referenceCode, planId: plan.id, billingCycle: cycle },
    });

    await logAudit(
      { companyId: null, userId: null, role: "SYSTEM" },
      "COMPANY_ONBOARDING_STARTED",
      "CompanyOnboarding",
      record.id,
      { referenceCode, planId: plan.id, billingCycle: cycle, amountInPaise }
    );

    return {
      ...publicOnboardingView(record, record.subscriptionPlan),
      sessionToken,
      checkout: order,
    };
  }

  async getBySession(referenceCode, sessionToken) {
    const record = await this.#loadAuthorized(referenceCode, sessionToken);
    return publicOnboardingView(record, record.subscriptionPlan);
  }

  async verifyPayment({ referenceCode, sessionToken, paymentId, signature, checkoutToken, amountInPaise, subscriptionPlanId, billingCycle }) {
    const record = await this.#loadAuthorized(referenceCode, sessionToken);

    if (record.status === "ONBOARDING_COMPLETED") {
      throw ApiError.conflict("Onboarding already completed");
    }
    if (RESUME_STATUSES.has(record.status)) {
      return {
        ...publicOnboardingView(record, record.subscriptionPlan),
        alreadyPaid: true,
      };
    }
    if (record.status === "PAYMENT_FAILED" || record.status === "CANCELLED") {
      throw ApiError.badRequest("Checkout is no longer payable");
    }
    if (record.expiresAt && record.expiresAt < new Date()) {
      throw ApiError.badRequest("Checkout session expired");
    }

    // Reject client attempts to mutate locked commercial terms
    if (subscriptionPlanId && subscriptionPlanId !== record.subscriptionPlanId) {
      throw ApiError.forbidden("Plan cannot be changed after checkout");
    }
    if (billingCycle && billingCycle !== record.billingCycle) {
      throw ApiError.forbidden("Billing cycle cannot be changed after checkout");
    }
    if (amountInPaise != null && Number(amountInPaise) !== record.amountInPaise) {
      throw ApiError.forbidden("Paid amount does not match locked checkout amount");
    }

    try {
      const verified = PaymentProvider.verifyPayment({
        orderId: record.paymentOrderId,
        amountInPaise: record.amountInPaise,
        currency: record.currency,
        paymentId,
        signature,
        checkoutToken,
      });

      const updated = await prisma.companyOnboarding.update({
        where: { id: record.id },
        data: {
          status: "ONBOARDING_PENDING",
          paymentPaymentId: verified.paymentId,
          paymentSignature: signature || checkoutToken || null,
          paidAt: new Date(),
        },
        include: { subscriptionPlan: true },
      });

      await logAudit(
        { companyId: null, userId: null, role: "SYSTEM" },
        "PAYMENT_VERIFIED",
        "CompanyOnboarding",
        record.id,
        { referenceCode, paymentId: verified.paymentId, amountInPaise: record.amountInPaise }
      );

      return {
        ...publicOnboardingView(updated, updated.subscriptionPlan),
        alreadyPaid: false,
      };
    } catch (err) {
      await prisma.companyOnboarding.update({
        where: { id: record.id },
        data: { status: "PAYMENT_FAILED" },
      }).catch(() => {});
      throw err;
    }
  }

  /** Dev/test helper: simulate INTERNAL provider success after checkout. */
  async simulatePaymentSuccess({ referenceCode, sessionToken }) {
    if (PaymentProvider.mode !== "INTERNAL") {
      throw ApiError.badRequest("Payment simulation is only available for INTERNAL provider");
    }
    const record = await this.#loadAuthorized(referenceCode, sessionToken);
    if (RESUME_STATUSES.has(record.status) || record.status === "ONBOARDING_COMPLETED") {
      return {
        ...publicOnboardingView(record, record.subscriptionPlan),
        alreadyPaid: true,
      };
    }
    const simulated = PaymentProvider.simulateSuccessPayment({
      orderId: record.paymentOrderId,
      amountInPaise: record.amountInPaise,
      currency: record.currency,
    });
    return this.verifyPayment({
      referenceCode,
      sessionToken,
      paymentId: simulated.paymentId,
      checkoutToken: simulated.checkoutToken,
    });
  }

  async markPaymentFailed({ referenceCode, sessionToken }) {
    const record = await this.#loadAuthorized(referenceCode, sessionToken);
    if (RESUME_STATUSES.has(record.status) || record.status === "ONBOARDING_COMPLETED") {
      throw ApiError.badRequest("Payment already succeeded");
    }
    const updated = await prisma.companyOnboarding.update({
      where: { id: record.id },
      data: { status: "PAYMENT_FAILED" },
      include: { subscriptionPlan: true },
    });
    return publicOnboardingView(updated, updated.subscriptionPlan);
  }

  async completeOnboarding({ referenceCode, sessionToken, company, mainAdmin }) {
    const record = await this.#loadAuthorized(referenceCode, sessionToken);

    if (record.status === "ONBOARDING_COMPLETED") {
      throw ApiError.conflict("Onboarding already completed");
    }
    if (!RESUME_STATUSES.has(record.status)) {
      throw ApiError.forbidden("Payment must be verified before onboarding");
    }
    if (record.expiresAt && record.expiresAt < new Date()) {
      throw ApiError.badRequest("Onboarding session expired");
    }

    // Ignore any client-supplied tenant identifiers
    if (company?.companyId || company?.companyCode || mainAdmin?.companyId || mainAdmin?.companyCode) {
      throw ApiError.forbidden("companyId/companyCode cannot be supplied by the client");
    }

    try {
      const amountRupees = record.amountInPaise / 100;
      const provisioned = await provisionTenant({
        company: {
          companyName: company.companyName,
          email: company.email,
          address: company.address,
        },
        mainAdmin,
        subscriptionPlanId: record.subscriptionPlanId,
        billingCycle: record.billingCycle,
        amountPaid: amountRupees,
        currency: record.currency || "INR",
        paymentReference: record.paymentPaymentId || record.paymentOrderId,
        onboardingId: record.id,
        auditContext: { companyId: null, userId: null, role: "SYSTEM" },
        auditAction: "COMPANY_CREATED",
      });

      await prisma.companyOnboarding.update({
        where: { id: record.id },
        data: {
          status: "ONBOARDING_COMPLETED",
          companyId: provisioned.id,
          completedAt: new Date(),
        },
      });

      await logAudit(
        { companyId: provisioned.id, userId: provisioned.mainAdmin?.id, role: "MAIN_ADMIN" },
        "SUBSCRIPTION_ACTIVATED",
        "CompanySubscription",
        provisioned.subscription?.id,
        {
          companyCode: provisioned.companyCode,
          planId: record.subscriptionPlanId,
          billingCycle: record.billingCycle,
        }
      );

      return {
        company: {
          id: provisioned.id,
          companyName: provisioned.companyName,
          companyCode: provisioned.companyCode,
          email: provisioned.email,
        },
        mainAdmin: {
          id: provisioned.mainAdmin.id,
          email: provisioned.mainAdmin.email,
          firstName: provisioned.mainAdmin.firstName,
          lastName: provisioned.mainAdmin.lastName,
          role: provisioned.mainAdmin.role?.name || "MAIN_ADMIN",
        },
        plan: {
          id: record.subscriptionPlanId,
          planName: record.subscriptionPlan?.planName,
          billingCycle: record.billingCycle,
          amountRupees,
          currency: record.currency,
        },
        status: "ACTIVE",
        referenceCode: record.referenceCode,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      handlePrismaError(error);
    }
  }

  async #loadAuthorized(referenceCode, sessionToken) {
    if (!referenceCode || !sessionToken) {
      throw ApiError.unauthorized("Onboarding session required");
    }
    const record = await prisma.companyOnboarding.findFirst({
      where: { referenceCode },
      include: {
        subscriptionPlan: true,
        company: { select: { id: true, companyName: true, companyCode: true, email: true } },
      },
    });
    if (!record) throw ApiError.notFound("Onboarding session not found");

    const valid = await comparePassword(sessionToken, record.sessionTokenHash);
    if (!valid) throw ApiError.forbidden("Invalid onboarding session");

    return record;
  }
}

export default new OnboardingService();
