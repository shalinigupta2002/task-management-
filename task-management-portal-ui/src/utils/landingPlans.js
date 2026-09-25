import { USE_MOCK_API, API_BASE_URL } from "../constants/config";
import { getActivePlans, computeYearlySavings, normalizePlan } from "./planStorage";

/** Map canonical plan to public pricing card. */
export function mapPlanToLandingCard(plan) {
  const p = normalizePlan(plan);
  const nameLower = (p.name || "").toLowerCase();
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
    billingOptions: p.billingOptions || { monthly: true, yearly: true },
    savings,
  };
}

/** Synchronous read from canonical `sa_plans` storage (enabled plans only). */
export function getLandingPlansFromStorage() {
  return getActivePlans()
    .filter((p) => p.billingOptions?.monthly !== false || p.billingOptions?.yearly !== false)
    .map(mapPlanToLandingCard);
}

/**
 * Load active plans for home / pricing.
 * Unauthenticated + cache-busted only. Do NOT fall back to authenticated
 * planService.getAll() — on public /pricing that 401s/hangs via axios
 * interceptors and left UI stuck on "Loading active subscription plans...".
 */
export async function fetchLandingPlans() {
  if (USE_MOCK_API) {
    return getLandingPlansFromStorage();
  }

  try {
    const url = `${API_BASE_URL}/v1/onboarding/plans?_=${Date.now()}`;
    const publicRes = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!publicRes.ok) {
      console.warn("Public plans fetch failed with status", publicRes.status);
      return [];
    }

    const body = await publicRes.json();
    const publicData = body?.data;
    if (!Array.isArray(publicData) || publicData.length === 0) {
      return [];
    }

    return publicData.map((p) =>
      mapPlanToLandingCard({
        id: p.id,
        name: p.planName || p.name,
        planName: p.planName || p.name,
        description: p.description,
        monthlyPrice: Number(p.monthlyPrice ?? 0),
        yearlyPrice: Number(p.yearlyPrice ?? 0),
        currency: p.currency || "INR",
        users: p.maxEmployees ?? p.users,
        storage: p.storage,
        features: Array.isArray(p.features) ? p.features : [],
        status: p.status,
        enabled: p.status ? p.status === "ACTIVE" : true,
        billingOptions: { monthly: true, yearly: true },
      })
    );
  } catch (err) {
    console.warn("Public plans fetch failed", err);
    return [];
  }
}

export function filterPlansByBilling(plans, yearly) {
  return plans.filter((plan) => {
    const opts = plan.billingOptions || {};
    if (yearly) return opts.yearly !== false && Number(plan.yearlyPrice) > 0;
    return opts.monthly !== false && Number(plan.monthlyPrice) >= 0;
  });
}

export function formatPlanPrice(plan, yearly) {
  if (yearly) {
    return { amount: Number(plan.yearlyPrice) || 0, period: "year", label: "Billed annually" };
  }
  return { amount: Number(plan.monthlyPrice) || 0, period: "month", label: "Billed monthly" };
}
