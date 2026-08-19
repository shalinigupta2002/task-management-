import crypto from "crypto";
import prisma from "../config/database.js";
import CompanyRepository from "../repositories/CompanyRepository.js";
import RoleRepository from "../repositories/RoleRepository.js";
import SubscriptionRepository from "../repositories/SubscriptionRepository.js";
import ApiError from "../utils/ApiError.js";
import { hashPassword } from "../utils/password.js";
import { sanitizeUser } from "../utils/sanitize.js";
import { logAudit } from "../utils/auditLogger.js";

export function splitAdminName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Admin", lastName: "User" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function computeSubscriptionDates(billingCycle) {
  const startDate = new Date();
  const expiryDate = new Date(startDate);
  if (billingCycle === "YEARLY") {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  } else {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  }
  return { startDate, expiryDate };
}

export async function generateUniqueCompanyCode(tx = null) {
  const db = tx || prisma;
  for (let attempts = 0; attempts < 12; attempts += 1) {
    const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
    const code = `TF-${randomStr}`;
    const existing = await db.company.findFirst({
      where: { companyCode: code, deletedAt: null },
    });
    if (!existing) return code;
  }
  throw ApiError.internal("Failed to generate a unique Company Code");
}

/**
 * Shared transactional tenant bootstrap used by:
 * - Super Admin Add Company
 * - Customer self-service onboarding
 */
export async function provisionTenant({
  company: companyInput,
  mainAdmin,
  subscriptionPlanId,
  billingCycle = "MONTHLY",
  amountPaid = null,
  currency = "INR",
  paymentReference = null,
  onboardingId = null,
  auditContext = null,
  auditAction = "CREATE_COMPANY",
}) {
  if (!mainAdmin?.password || !mainAdmin?.confirmPassword) {
    throw ApiError.badRequest("Main Admin password is required");
  }
  if (mainAdmin.password !== mainAdmin.confirmPassword) {
    throw ApiError.badRequest("Passwords do not match.");
  }

  const existingEmail = await CompanyRepository.findByEmail(companyInput.email);
  if (existingEmail) throw ApiError.conflict("Company email already exists");

  const existingAdmin = await prisma.user.findFirst({
    where: { email: mainAdmin.email, deletedAt: null },
  });
  if (existingAdmin) throw ApiError.conflict("Main Admin email already registered");

  const plan = await SubscriptionRepository.findPlanById(subscriptionPlanId);
  if (!plan || plan.status !== "ACTIVE") {
    throw ApiError.badRequest("Invalid or inactive subscription plan");
  }

  const mainAdminRole = await RoleRepository.findByName("MAIN_ADMIN");
  if (!mainAdminRole) throw ApiError.internal("MAIN_ADMIN role is not configured");

  const passwordHash = await hashPassword(mainAdmin.password);
  const { firstName, lastName } = splitAdminName(mainAdmin.name);
  const cycle = billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY";
  const { startDate, expiryDate } = computeSubscriptionDates(cycle);

  const created = await prisma.$transaction(async (tx) => {
    const companyCode = await generateUniqueCompanyCode(tx);

    const company = await tx.company.create({
      data: {
        companyName: companyInput.companyName,
        companyCode,
        email: companyInput.email,
        address: companyInput.address,
        phone: companyInput.phone || null,
        website: companyInput.website || null,
        city: companyInput.city || null,
        state: companyInput.state || null,
        country: companyInput.country || null,
        postalCode: companyInput.postalCode || null,
        industry: companyInput.industry || null,
        logo: companyInput.logo || null,
        status: companyInput.status || "ACTIVE",
      },
    });

    const adminUser = await tx.user.create({
      data: {
        firstName,
        lastName,
        email: mainAdmin.email,
        phone: mainAdmin.phone || null,
        password: passwordHash,
        designation: "Main Admin",
        status: "ACTIVE",
        companyId: company.id,
        roleId: mainAdminRole.id,
      },
      include: {
        role: { select: { id: true, name: true, description: true } },
        company: { select: { id: true, companyName: true, companyCode: true } },
      },
    });

    const subscription = await tx.companySubscription.create({
      data: {
        companyId: company.id,
        subscriptionPlanId: plan.id,
        startDate,
        expiryDate,
        subscriptionStatus: "ACTIVE",
        billingCycle: cycle,
        amountPaid: amountPaid != null ? amountPaid : undefined,
        currency: currency || "INR",
        paymentReference: paymentReference || undefined,
        onboardingId: onboardingId || undefined,
      },
      include: { subscriptionPlan: true },
    });

    return { company, adminUser, subscription };
  });

  if (auditContext) {
    await logAudit(auditContext, auditAction, "Company", created.company.id, {
      companyCode: created.company.companyCode,
      mainAdminEmail: created.adminUser.email,
      source: onboardingId ? "SELF_SERVICE" : "SUPER_ADMIN",
    });
  }

  const company = await CompanyRepository.findById(created.company.id);
  return {
    ...company,
    mainAdmin: sanitizeUser(created.adminUser),
    subscription: created.subscription,
  };
}

export default {
  provisionTenant,
  generateUniqueCompanyCode,
  splitAdminName,
  computeSubscriptionDates,
};
