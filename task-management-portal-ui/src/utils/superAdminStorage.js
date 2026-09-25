/**
 * Legacy Super Admin localStorage helpers.
 * Production Super Admin pages use API services only.
 * These helpers return empty data and clear stale demo keys so refresh
 * cannot resurrect mock companies/plans/audit/notifications.
 */

export {
  getPlans,
  getActivePlans,
  getPlanById,
  setPlans,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlan,
  normalizePlan,
  toApiPlan,
} from "./planStorage";

import { createPlan } from "./planStorage";
import { STORAGE_KEYS } from "../constants/storageKeys";

const KEYS = {
  companies: STORAGE_KEYS.companies,
  messages: STORAGE_KEYS.messages,
  auditLogs: "sa_auditLogs",
  notifications: STORAGE_KEYS.notifications,
  globalSettings: "sa_globalSettings",
  // Legacy aliases that may still exist in older browsers
  legacyAuditLogs: "sa_audit_logs",
  legacyGlobalSettings: "sa_global_settings",
  legacyCompanies: "tm_companies",
};

function clearKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function clearAllDemoKeys() {
  Object.values(KEYS).forEach(clearKey);
}

export function getCompanies() {
  clearKey(KEYS.companies);
  clearKey(KEYS.legacyCompanies);
  return [];
}

export function setCompanies() {
  clearKey(KEYS.companies);
  clearKey(KEYS.legacyCompanies);
}

export function getCompanyById() {
  return null;
}

export function updateCompany() {
  return null;
}

export function deleteCompany() {
  clearKey(KEYS.companies);
}

export function addCompany() {
  clearKey(KEYS.companies);
}

/** Backward-compatible alias for createPlan. */
export function addPlan(plan) {
  return createPlan(plan);
}

export function getMessages() {
  clearKey(KEYS.messages);
  return [];
}

export function getAuditLogs() {
  clearKey(KEYS.auditLogs);
  clearKey(KEYS.legacyAuditLogs);
  return [];
}

export function addAuditLog() {
  clearKey(KEYS.auditLogs);
  clearKey(KEYS.legacyAuditLogs);
}

export function getNotifications() {
  clearKey(KEYS.notifications);
  return [];
}

export function setNotifications() {
  clearKey(KEYS.notifications);
}

export function getGlobalSettings() {
  clearKey(KEYS.globalSettings);
  clearKey(KEYS.legacyGlobalSettings);
  return {};
}

export function setGlobalSettings() {
  clearKey(KEYS.globalSettings);
  clearKey(KEYS.legacyGlobalSettings);
}

/** One-shot cleanup for any lingering Super Admin demo keys. */
export function purgeSuperAdminDemoStorage() {
  clearAllDemoKeys();
}
