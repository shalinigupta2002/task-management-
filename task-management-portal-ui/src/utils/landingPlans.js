import { USE_MOCK_API } from "../constants/config";
import { getActivePlans, computeYearlySavings, normalizePlan } from "./planStorage";
import planService from "../services/planService";

/** Map canonical plan to public pricing card. */
export function mapPlanToLandingCard(plan) {
  const p = normalizePlan(plan);
  const nameLower = p.name.toLowerCase();
  const savings = computeYearlySavings(p.monthlyPrice, p.yearlyPrice);

  return {
    id: p.id,
    name: p.name,
    desc: p.description,
    monthlyPrice: p.monthlyPrice,
    yearlyPrice: p.yearlyPrice,
    currency: p.currency,
    users: p.users,
    storage: p.storage,
    features: p.features,
    popular: nameLower.includes("professional"),
    cta: "Start Free Trial",
    billingOptions: p.billingOptions,
    savings,
  };
}

/** Synchronous read from canonical `sa_plans` storage (enabled plans only). */
export function getLandingPlansFromStorage() {
  return getActivePlans()
    .filter((p) => p.billingOptions?.monthly !== false || p.billingOptions?.yearly !== false)
    .map(mapPlanToLandingCard);
}

/** Load active plans for home / pricing pages. */
export async function fetchLandingPlans() {
  if (USE_MOCK_API) {
    return getLandingPlansFromStorage();
  }

  try {
    // Prefer public onboarding plans (no auth) so pricing works for anonymous visitors
    const { default: api } = await import("../api/axios");
    const publicRes = await api.get("/v1/onboarding/plans");
    const publicData = publicRes?.data?.data;
    if (Array.isArray(publicData) && publicData.length > 0) {
      return publicData.map((p) => mapPlanToLandingCard({
        id: p.id,
        name: p.planName,
        planName: p.planName,
        description: p.description,
        monthlyPrice: p.monthlyPrice,
        yearlyPrice: p.yearlyPrice,
        currency: "INR",
        users: p.maxEmployees,
        features: p.features,
        status: p.status,
        enabled: true,
        billingOptions: { monthly: true, yearly: true },
      }));
    }
  } catch (err) {
    console.warn("Public plans fetch failed, trying authenticated planService", err);
  }

  try {
    const res = await planService.getAll();
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      const active = res.data
        .filter((p) => p.status === "ACTIVE" || p.enabled !== false)
        .map(mapPlanToLandingCard);
      if (active.length > 0) return active;
    }
  } catch (err) {
    console.warn("Failed to fetch plans for landing page", err);
  }

  return getLandingPlansFromStorage();
}

export function filterPlansByBilling(plans, yearly) {
  return plans.filter((plan) => {
    if (yearly) return plan.billingOptions?.yearly !== false && plan.yearlyPrice > 0;
    return plan.billingOptions?.monthly !== false && plan.monthlyPrice >= 0;
  });
}

export function formatPlanPrice(plan, yearly) {
  if (yearly) {
    return { amount: plan.yearlyPrice, period: "year", label: "Billed annually" };
  }
  return { amount: plan.monthlyPrice, period: "month", label: "Billed monthly" };
}
