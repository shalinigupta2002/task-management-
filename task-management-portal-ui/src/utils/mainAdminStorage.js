import {
  DEFAULT_SUB_ADMINS,
  DEFAULT_ROLES,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_CHAT_THREADS,
  DEFAULT_AUDIT_LOGS,
  COMPANY_SETTINGS_DEFAULT,
  NOTIFICATION_SETTINGS_DEFAULT,
  SUB_ADMIN_PROFILE_DEFAULT,
} from "../data/mainAdminData";

const KEYS = {
  subAdmins: "ma_subAdmins",
  roles: "ma_roles",
  notifications: "ma_notifications",
  chatThreads: "ma_chatThreads",
  auditLogs: "ma_auditLogs",
  companySettings: "ma_companySettings",
  notificationSettings: "ma_notificationSettings",
  subAdminProfile: "ma_subAdminProfile",
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

export function getSubAdmins() {
  return load(KEYS.subAdmins, DEFAULT_SUB_ADMINS);
}

export function setSubAdmins(list) {
  save(KEYS.subAdmins, list);
}

export function getSubAdminById(id) {
  return getSubAdmins().find((a) => a.id === id) || null;
}

export function addSubAdmin(admin) {
  const list = [...getSubAdmins(), admin];
  setSubAdmins(list);
  addAuditLog({ action: "Sub Admin Added", user: "Main Admin", target: admin.fullName, timestamp: new Date().toLocaleString(), ip: "192.168.1.5" });
  return admin;
}

export function updateSubAdmin(id, updates) {
  const list = getSubAdmins().map((a) => (a.id === id ? { ...a, ...updates } : a));
  setSubAdmins(list);
  return list.find((a) => a.id === id);
}

export function deleteSubAdmin(id) {
  const admin = getSubAdminById(id);
  setSubAdmins(getSubAdmins().filter((a) => a.id !== id));
  if (admin) addAuditLog({ action: "Sub Admin Removed", user: "Main Admin", target: admin.fullName, timestamp: new Date().toLocaleString(), ip: "192.168.1.5" });
}

export function getRoles() {
  return load(KEYS.roles, DEFAULT_ROLES);
}

export function setRoles(roles) {
  save(KEYS.roles, roles);
}

export function addRole(role) {
  setRoles([...getRoles(), role]);
}

export function updateRole(id, updates) {
  const roles = getRoles().map((r) => (r.id === id ? { ...r, ...updates } : r));
  setRoles(roles);
  addAuditLog({ action: "Permission Changed", user: "Main Admin", target: updates.name || id, timestamp: new Date().toLocaleString(), ip: "192.168.1.5" });
}

export function deleteRole(id) {
  setRoles(getRoles().filter((r) => r.id !== id || r.type === "system"));
}

export function getNotifications() {
  return load(KEYS.notifications, DEFAULT_NOTIFICATIONS);
}

export function setNotifications(list) {
  save(KEYS.notifications, list);
}

export function getChatThreads() {
  return load(KEYS.chatThreads, DEFAULT_CHAT_THREADS);
}

export function setChatThreads(threads) {
  save(KEYS.chatThreads, threads);
}

export function getAuditLogs() {
  return load(KEYS.auditLogs, DEFAULT_AUDIT_LOGS);
}

export function addAuditLog(entry) {
  save(KEYS.auditLogs, [{ id: `al-${Date.now()}`, ...entry }, ...getAuditLogs()]);
}

export function getCompanySettings() {
  return load(KEYS.companySettings, COMPANY_SETTINGS_DEFAULT);
}

export function setCompanySettings(settings) {
  save(KEYS.companySettings, settings);
}

export function getNotificationSettings() {
  return load(KEYS.notificationSettings, NOTIFICATION_SETTINGS_DEFAULT);
}

export function setNotificationSettings(settings) {
  save(KEYS.notificationSettings, settings);
}

export function getSubAdminProfile() {
  return load(KEYS.subAdminProfile, SUB_ADMIN_PROFILE_DEFAULT);
}

export function setSubAdminProfile(profile) {
  save(KEYS.subAdminProfile, profile);
}

export function hasPermission(permissionId) {
  const role = localStorage.getItem("userRole");
  if (role === "ADMIN") return true;
  if (role !== "SUB_ADMIN") return false;
  const profile = getSubAdminProfile();
  return profile.permissions?.includes(permissionId);
}
