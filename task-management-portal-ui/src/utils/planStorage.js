import { DEFAULT_PLANS } from "../data/superAdminData";
import { notifyPlansUpdated, PLANS_STORAGE_KEY } from "./planEvents";

export { PLANS_STORAGE_KEY };

function inferStorage(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("professional")) return "25 GB";
  if (lower.includes("business")) return "100 GB";
  if (lower.includes("enterprise") || lower.includes("custom")) return "Unlimited";
  return "5 GB";
}

/** Normalize legacy plan records into the canonical storage shape. */
export function normalizePlan(raw = {}) {
  const name = raw.name || raw.planName || "";
  const monthlyPrice = Number(raw.monthlyPrice ?? raw.price ?? 0);

  let yearlyPrice = 0;
  if (raw.yearlyPrice != null && raw.yearlyPrice !== "") {
    yearlyPrice = Number(raw.yearlyPrice);
  } else if (String(raw.billing || "").toLowerCase() === "yearly" && raw.price != null) {
    yearlyPrice = Number(raw.price);
  } else if (monthlyPrice > 0 && raw.monthlyPrice == null && raw.yearlyPrice == null) {
    // Legacy migration: full annual price (no discount). Super Admin can edit yearlyPrice.
    yearlyPrice = monthlyPrice * 12;
  }

  // Prefer explicit `enabled`; legacy `status` applies only when `enabled` is absent.
  const enabled =
    raw.enabled != null ? raw.enabled !== false : raw.status !== "INACTIVE";

  return {
    id: raw.id,
    name,
    description: raw.description || `TaskFlow ${name} Plan`,
    monthlyPrice,
    yearlyPrice,
    currency: raw.currency || "INR",
    users: raw.users ?? raw.maxEmployees ?? 10,
    storage: raw.storage || inferStorage(name),
    features: Array.isArray(raw.features) ? raw.features : [],
    enabled,
    billingOptions: raw.billingOptions || { monthly: true, yearly: true },
    // Backward compatibility for dashboard/reports that read `price`
    price: monthlyPrice,
    billing: "monthly",
  };
}

export function computeYearlySavings(monthlyPrice, yearlyPrice) {
  const monthly = Number(monthlyPrice) || 0;
  const yearly = Number(yearlyPrice) || 0;
  const fullYear = monthly * 12;
  if (monthly <= 0 || yearly <= 0 || yearly >= fullYear) return null;
  const amount = fullYear - yearly;
  const percent = Math.round((amount / fullYear) * 100);
  return { amount, percent };
}

function readRawPlans() {
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeRawPlans(plans) {
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  notifyPlansUpdated();
}

function ensureSeeded() {
  // Seed defaults only when the key is missing — never overwrite existing data (including []).
  if (readRawPlans() === null) {
    writeRawPlans(DEFAULT_PLANS.map((p) => normalizePlan(p)));
  }
}

function persistNormalized(plans) {
  writeRawPlans(plans.map(normalizePlan));
}

/** Canonical read — always returns normalized plans from `sa_plans`. */
export function getPlans() {
  ensureSeeded();
  const raw = readRawPlans() || DEFAULT_PLANS;
  return raw.map(normalizePlan);
}

/** Enabled plans for public pricing. */
export function getActivePlans() {
  return getPlans().filter((p) => p.enabled);
}

export function getPlanById(id) {
  return getPlans().find((p) => p.id === id) || null;
}

export function setPlans(plans) {
  persistNormalized(plans);
}

export function createPlan(plan) {
  const plans = getPlans();
  const normalized = normalizePlan({
    ...plan,
    id: plan.id || `plan-${Date.now()}`,
  });
  persistNormalized([...plans, normalized]);
  return normalized;
}

export function updatePlan(id, updates) {
  const plans = getPlans();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) throw { message: "Plan not found", status: 404 };

  const merged = normalizePlan({ ...plans[idx], ...updates, id });
  const next = plans.map((p) => (p.id === id ? merged : p));
  persistNormalized(next);
  return merged;
}

export function deletePlan(id) {
  persistNormalized(getPlans().filter((p) => p.id !== id));
}

export function togglePlan(id) {
  const plan = getPlanById(id);
  if (!plan) throw { message: "Plan not found", status: 404 };
  return updatePlan(id, { enabled: !plan.enabled });
}

/** Re-seed storage from defaults (dev helper — not used in UI). */
export function resetPlansToDefaults() {
  persistNormalized(DEFAULT_PLANS.map((p) => normalizePlan(p)));
}

/** Map canonical plan to API/service response shape. */
export function toApiPlan(plan) {
  const normalized = normalizePlan(plan);
  return {
    id: normalized.id,
    planName: normalized.name,
    name: normalized.name,
    description: normalized.description,
    monthlyPrice: normalized.monthlyPrice,
    yearlyPrice: normalized.yearlyPrice,
    currency: normalized.currency,
    maxEmployees: normalized.users,
    users: normalized.users,
    storage: normalized.storage,
    features: normalized.features,
    status: normalized.enabled ? "ACTIVE" : "INACTIVE",
    enabled: normalized.enabled,
    billingOptions: normalized.billingOptions,
    price: normalized.monthlyPrice,
  };
}

export function averageMonthlyPrice(plans) {
  if (!plans.length) return 0;
  return Math.round(
    plans.reduce((sum, p) => sum + Number(p.monthlyPrice ?? p.price ?? 0), 0) / plans.length
  );
}

export function averageYearlyPrice(plans) {
  const withYearly = plans.filter((p) => Number(p.yearlyPrice ?? 0) > 0);
  if (!withYearly.length) return 0;
  return Math.round(
    withYearly.reduce((sum, p) => sum + Number(p.yearlyPrice), 0) / withYearly.length
  );
}
