/** Default threshold aligned with server TASK_NEARING_DUE_DAYS / reminder DAY_3 */
export const NEARING_DUE_DAYS = 3;

const COMPLETED = new Set(["Completed", "COMPLETED", "APPROVED", "Closed", "CANCELLED", "Cancelled"]);
const OVERDUE = new Set(["Overdue", "OVERDUE"]);

export function startOfDay(date = new Date()) {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(date, days) {
  const d = startOfDay(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function parseTaskDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function normalizeStatus(status) {
  return status == null ? "" : String(status);
}

export function isCompletedOrCancelled(status) {
  return COMPLETED.has(normalizeStatus(status));
}

export function isOverdueStatus(status) {
  return OVERDUE.has(normalizeStatus(status));
}

/**
 * A task is nearing due when:
 * - not completed/cancelled
 * - has a valid due date
 * - due date is after today and on/before today + thresholdDays
 * (Today's tasks are a separate bucket.)
 */
export function isNearingDue(task, today = new Date(), thresholdDays = NEARING_DUE_DAYS) {
  if (!task || isCompletedOrCancelled(task.status)) return false;
  const due = parseTaskDate(task.dueDate || task.occurrenceDate);
  if (!due) return false;
  const todayStart = startOfDay(today);
  const nearingStart = addDays(todayStart, 1);
  const nearingEndExclusive = addDays(todayStart, thresholdDays + 1);
  return due >= nearingStart && due < nearingEndExclusive;
}

export function isDueToday(task, today = new Date()) {
  if (!task || isCompletedOrCancelled(task.status)) return false;
  const due = parseTaskDate(task.dueDate || task.occurrenceDate);
  if (!due) return false;
  return due.getTime() === startOfDay(today).getTime();
}

export function isOverdueTask(task, today = new Date()) {
  if (!task || isCompletedOrCancelled(task.status)) return false;
  if (isOverdueStatus(task.status)) return true;
  const due = parseTaskDate(task.dueDate || task.occurrenceDate);
  if (!due) return false;
  return due < startOfDay(today);
}

export function isCompletedTask(task) {
  return isCompletedOrCancelled(task?.status) && !["CANCELLED", "Cancelled", "Closed"].includes(normalizeStatus(task?.status));
}

/** Split tasks into calendar sidebar buckets (mutually exclusive priority: completed → overdue → today → nearing) */
export function classifyCalendarSidebarTasks(tasks, today = new Date(), thresholdDays = NEARING_DUE_DAYS) {
  const todayList = [];
  const nearingDue = [];
  const completed = [];
  const overdue = [];

  (tasks || []).forEach((task) => {
    const status = normalizeStatus(task.status);
    if (["CANCELLED", "Cancelled"].includes(status)) return;

    if (["Completed", "COMPLETED", "APPROVED"].includes(status) || status === "Closed") {
      completed.push(task);
      return;
    }
    if (isOverdueTask(task, today)) {
      overdue.push(task);
      return;
    }
    if (isDueToday(task, today)) {
      todayList.push(task);
      return;
    }
    if (isNearingDue(task, today, thresholdDays)) {
      nearingDue.push(task);
    }
  });

  return { todayTasks: todayList, nearingDueTasks: nearingDue, completedTasks: completed, overdueTasks: overdue };
}

export function formatNearingDueSubtitle(task, today = new Date()) {
  const due = parseTaskDate(task.dueDate || task.occurrenceDate);
  if (!due) return task.dueDate || "";
  const diff = Math.round((due - startOfDay(today)) / 86400000);
  if (diff === 1) return "Due tomorrow";
  if (diff > 1) return `Due in ${diff} days`;
  return due.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
