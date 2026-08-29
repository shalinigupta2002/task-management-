/** Calendar task colour tones: completed → green, due today → yellow, overdue → full red, future → neutral */
import { OVERDUE_FULL } from "../constants/overdueStyles";

export const CALENDAR_STATUS_STYLES = {
  completed: { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0", label: "Completed" },
  due: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE047", label: "Due" },
  overdue: {
    bg: OVERDUE_FULL.bg,
    text: OVERDUE_FULL.text,
    border: OVERDUE_FULL.border,
    label: OVERDUE_FULL.label,
  },
  neutral: { bg: "#F8FAFC", text: "#334155", border: "#E2E8F0", label: null },
};
const COMPLETED_STATUSES = new Set(["Completed", "COMPLETED", "APPROVED"]);
const OVERDUE_STATUSES = new Set(["Overdue", "OVERDUE"]);

export function startOfDay(date) {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}

/** Parse display dates ("01 Aug 2026"), ISO strings, or Date values — local midnight */
export function parseDisplayDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function isCompletedStatus(status) {
  return COMPLETED_STATUSES.has(status);
}

function isOverdueStatus(status) {
  return OVERDUE_STATUSES.has(status);
}

function getItemDueDate(item) {
  if (item.dueDate) return parseDisplayDate(item.dueDate);
  if (item.occurrenceDate) return parseDisplayDate(item.occurrenceDate);
  return null;
}

/**
 * Priority: completed → green; not completed + past due → red; not completed + due today → yellow; else neutral
 */
export function resolveCalendarVisualStatus(item, today = new Date()) {
  const todayStart = startOfDay(today);
  const status = item?.status;

  if (isCompletedStatus(status)) return "completed";

  const dueDate = getItemDueDate(item);

  if (dueDate) {
    if (dueDate < todayStart) return "overdue";
    if (isSameDay(dueDate, todayStart)) return "due";
  }

  if (isOverdueStatus(status)) return "overdue";

  return "neutral";
}

export function getCalendarStatusStyle(visualStatus) {
  return CALENDAR_STATUS_STYLES[visualStatus] || CALENDAR_STATUS_STYLES.neutral;
}
