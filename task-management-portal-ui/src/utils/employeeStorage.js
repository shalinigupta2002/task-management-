import {
  DEFAULT_EMPLOYEE_PROFILE,
  DEFAULT_TASKS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_CHAT_THREADS,
  DEFAULT_ACTIVITY,
} from "../data/employeeData";
import { USE_MOCK_API } from "../constants/config";

const KEYS = {
  profile: "emp_profile",
  tasks: "emp_tasks",
  notifications: "emp_notifications",
  chatThreads: "emp_chatThreads",
  activity: "emp_activity",
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

export function getEmployeeProfile() {
  try {
    const stored = localStorage.getItem("employeeProfile");
    if (stored) {
      const p = JSON.parse(stored);
      return { ...DEFAULT_EMPLOYEE_PROFILE, ...p, firstName: p.firstName || DEFAULT_EMPLOYEE_PROFILE.firstName, lastName: p.lastName || DEFAULT_EMPLOYEE_PROFILE.lastName, email: p.email || DEFAULT_EMPLOYEE_PROFILE.email };
    }
  } catch { /* ignore */ }
  return load(KEYS.profile, DEFAULT_EMPLOYEE_PROFILE);
}

export function setEmployeeProfile(profile) {
  save(KEYS.profile, profile);
  localStorage.setItem("employeeProfile", JSON.stringify(profile));
}

export function getEmployeeTasks() {
  // Demo/localStorage fallback is disabled for the live API — never surface seed tasks.
  if (!USE_MOCK_API) return [];
  const tasks = load(KEYS.tasks, DEFAULT_TASKS);
  const defaultsById = Object.fromEntries(DEFAULT_TASKS.map((t) => [t.id, t]));
  return tasks.map((t) => {
    const def = defaultsById[t.id];
    if (
      def?.completedAt
      && t.status === "Completed"
      && !t.completedAt
      && !t.completeDate
    ) {
      return { ...t, completedAt: def.completedAt, completeDate: def.completeDate };
    }
    return t;
  });
}

export function setEmployeeTasks(tasks) {
  save(KEYS.tasks, tasks);
}

export function getTaskById(id) {
  return getEmployeeTasks().find((t) => t.id === id) || null;
}

export function updateTask(id, updates) {
  const tasks = getEmployeeTasks().map((t) => (t.id === id ? { ...t, ...updates } : t));
  setEmployeeTasks(tasks);
  return tasks.find((t) => t.id === id);
}

export function addTaskTimeline(id, entry) {
  const task = getTaskById(id);
  if (!task) return null;
  return updateTask(id, { timeline: [{ id: `tl-${Date.now()}`, ...entry }, ...task.timeline] });
}

export function addTaskComment(id, comment) {
  const task = getTaskById(id);
  if (!task) return null;
  const comments = [...task.comments, comment];
  addTaskTimeline(id, { type: "comment", text: "Comment added", time: new Date().toLocaleString() });
  return updateTask(id, { comments });
}

export function updateTaskComment(taskId, commentId, text) {
  const task = getTaskById(taskId);
  if (!task) return null;
  const comments = task.comments.map((c) => (c.id === commentId ? { ...c, text } : c));
  return updateTask(taskId, { comments });
}

export function deleteTaskComment(taskId, commentId) {
  const task = getTaskById(taskId);
  if (!task) return null;
  return updateTask(taskId, { comments: task.comments.filter((c) => c.id !== commentId) });
}

export function addTaskAttachment(id, attachment) {
  const task = getTaskById(id);
  if (!task) return null;
  addTaskTimeline(id, { type: "attachment", text: `Attachment link added: ${attachment.name || attachment.url}`, time: new Date().toLocaleString() });
  return updateTask(id, { attachments: [...task.attachments, attachment] });
}

export function requestExtension(id, newDueDate, reason) {
  const task = getTaskById(id);
  if (!task) return null;
  addTaskTimeline(id, { type: "extension", text: `Extension requested: ${reason}`, time: new Date().toLocaleString() });
  addActivity({ type: "extension", text: `Extension requested for Task ${id}`, time: new Date().toLocaleString() });
  return updateTask(id, { extensionStatus: "pending", extensionRequest: { newDueDate, reason, requestedAt: new Date().toLocaleString() } });
}

export function getNotifications() {
  // Never surface demo notifications when using the live API
  if (!USE_MOCK_API) return [];
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

export function getActivity() {
  return load(KEYS.activity, DEFAULT_ACTIVITY);
}

export function addActivity(entry) {
  save(KEYS.activity, [{ id: `act-${Date.now()}`, ...entry }, ...getActivity()]);
}

export function canEmployee(action) {
  const allowed = ["view_tasks", "update_status", "upload_attachments", "comment", "request_extension", "chat", "view_notifications", "edit_profile"];
  const denied = ["create_task", "delete_task", "manage_employees", "manage_departments", "manage_categories", "manage_reports", "manage_company"];
  if (denied.includes(action)) return false;
  return allowed.includes(action);
}
