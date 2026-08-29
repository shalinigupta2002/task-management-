export function formatDate(dateString) {
  if (!dateString) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/** Matches My Tasks table format, e.g. "08 Aug 2026" */
export function formatTaskTableDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function getCompleteDateDisplay(task) {
  const isCompleted = task?.status === "Completed" || task?.status === "COMPLETED";
  if (!isCompleted) return "—";
  if (task.completeDate) return task.completeDate;
  if (task.completedAt) return formatTaskTableDate(task.completedAt);
  return "—";
}