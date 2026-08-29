import { formatTaskTableDate, getCompleteDateDisplay } from "./dateUtils";

const STATUS_MAP = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
  DRAFT: "Draft",
};

const PRIORITY_MAP = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  CRITICAL: "High",
};

function personName(user) {
  if (!user) return "—";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email || "—";
}

/**
 * Map API Task (+ assignments) into Employee My Tasks row shape.
 * Prefer the current user's assignment when authUserId is provided.
 */
export function mapEmployeeTask(task, authUserId = null) {
  const assignments = (task.assignments || []).filter((a) => a.status !== "CANCELLED");
  const mine = authUserId
    ? assignments.find((a) => a.assignedToId === authUserId || a.assignedTo?.id === authUserId)
    : null;
  const primary = mine || assignments[0] || null;

  const statusLabel = STATUS_MAP[task.status] || task.status || "Open";
  const mapped = {
    id: task.id,
    taskCode: task.taskCode || task.id,
    title: task.title,
    description: task.description || "",
    category: task.category?.categoryName || "—",
    priority: PRIORITY_MAP[task.priority] || task.priority || "Medium",
    frequency: task.frequency?.frequencyName || task.recurrenceType || "—",
    status: statusLabel,
    rawStatus: task.status,
    assignedBy: personName(primary?.assignedBy || task.createdBy),
    assignedDate: formatTaskTableDate(primary?.assignedDate || task.createdAt) || "—",
    dueDate: formatTaskTableDate(task.dueDate) || "—",
    dueDateRaw: task.dueDate || null,
    completedAt: task.completedAt || null,
    completeDate: task.completedAt ? formatTaskTableDate(task.completedAt) : null,
    assignedDepartment: task.department?.departmentName || "—",
    attachments: [],
    comments: [],
    timeline: [],
  };

  mapped.completeDateDisplay = getCompleteDateDisplay(mapped);
  return mapped;
}

export { STATUS_MAP, PRIORITY_MAP };
