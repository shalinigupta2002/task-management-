import {
  DEFAULT_COMPANIES,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_NOTIFICATIONS,
  GLOBAL_SETTINGS_DEFAULT,
} from "../data/superAdminData";

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

const KEYS = {
  companies: "sa_companies",
  messages: "sa_messages",
  auditLogs: "sa_auditLogs",
  notifications: "sa_notifications",
  globalSettings: "sa_globalSettings",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getCompanies() {
  return load(KEYS.companies, DEFAULT_COMPANIES);
}

export function setCompanies(companies) {
  save(KEYS.companies, companies);
}

export function getCompanyById(id) {
  return getCompanies().find((c) => c.id === id) || null;
}

export function updateCompany(id, updates) {
  const companies = getCompanies().map((c) => (c.id === id ? { ...c, ...updates } : c));
  setCompanies(companies);
  return companies.find((c) => c.id === id);
}

export function deleteCompany(id) {
  setCompanies(getCompanies().filter((c) => c.id !== id));
}

export function addCompany(company) {
  setCompanies([...getCompanies(), company]);
}

/** Backward-compatible alias for createPlan. */
export function addPlan(plan) {
  return createPlan(plan);
}

export function getMessages() {
  // Deprecated: Super Admin Messages uses conversationService / messageService.
  // Keep empty to avoid resurrecting localStorage mock inbox data.
  try {
    localStorage.removeItem(KEYS.messages);
  } catch {
    /* ignore */
  }
  return [];
}

export function getAuditLogs() {
  return load(KEYS.auditLogs, DEFAULT_AUDIT_LOGS);
}

export function addAuditLog(entry) {
  save(KEYS.auditLogs, [entry, ...getAuditLogs()]);
}

export function getNotifications() {
  return load(KEYS.notifications, DEFAULT_NOTIFICATIONS);
}

export function setNotifications(list) {
  save(KEYS.notifications, list);
}

export function getGlobalSettings() {
  return load(KEYS.globalSettings, GLOBAL_SETTINGS_DEFAULT);
}

export function setGlobalSettings(settings) {
  save(KEYS.globalSettings, settings);
}
