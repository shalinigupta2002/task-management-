export const PLANS_UPDATED_EVENT = "plans:updated";
export const PLANS_LEGACY_UPDATED_EVENT = "sa-plans-updated";
export const PLANS_STORAGE_KEY = "sa_plans";

export function notifyPlansUpdated() {
  window.dispatchEvent(new CustomEvent(PLANS_UPDATED_EVENT));
  window.dispatchEvent(new CustomEvent(PLANS_LEGACY_UPDATED_EVENT));
}
