/**
 * Full red highlight for overdue tasks — keep consistent across portals.
 */
export const OVERDUE_FULL = {
  bg: "#DC2626",
  color: "#FFFFFF",
  text: "#FFFFFF",
  border: "#B91C1C",
  /** Soft row wash so the whole table/list row reads as overdue */
  rowBg: "#FECACA",
  label: "Overdue",
};

export function isOverdueDisplayStatus(status) {
  const s = String(status || "").trim();
  return s === "Overdue" || s === "OVERDUE";
}

export function normalizeOverdueStatus(status) {
  return isOverdueDisplayStatus(status) ? "Overdue" : status;
}

export default OVERDUE_FULL;
