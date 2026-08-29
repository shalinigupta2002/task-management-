/** Map frequency record to task recurrence type for the task form. */
export function mapFrequencyToRecurrenceType(frequency) {
  if (!frequency) return "ONE_TIME";

  const name = String(frequency.frequencyName || "").trim().toLowerCase();
  const intervalDays = Number(frequency.daysInterval) > 0 ? Number(frequency.daysInterval) : 1;

  if (name === "daily" || intervalDays === 1) return "DAILY";
  if (name === "weekly" || intervalDays === 7) return "WEEKLY";
  if (
    name === "monthly"
    || name === "quarterly"
    || name === "half yearly"
    || name === "yearly"
    || intervalDays >= 28
  ) {
    return "MONTHLY";
  }
  if (intervalDays > 1 && intervalDays < 7) return "DAILY";
  if (intervalDays > 7 && intervalDays < 28) return "WEEKLY";
  return "DAILY";
}

export function applyFrequencyToTaskForm(frequency, currentForm) {
  if (!frequency) {
    return {
      ...currentForm,
      frequencyId: "",
    };
  }

  const recurrenceType = mapFrequencyToRecurrenceType(frequency);
  const durationDays = frequency.numberOfDays ?? currentForm.durationDays;
  const next = {
    ...currentForm,
    frequencyId: frequency.id,
    recurrenceType,
    durationDays,
  };

  if (next.startDate && durationDays) {
    const endDate = addDaysToDateString(next.startDate, durationDays);
    next.endDate = endDate;
    if (!next.dueDate) next.dueDate = endDate;
  }

  return next;
}

function addDaysToDateString(dateStr, days) {
  if (!dateStr || !days) return "";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))
    ? new Date(`${dateStr}T00:00:00.000Z`)
    : new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  d.setUTCDate(d.getUTCDate() + Number(days) - 1);
  return d.toISOString().slice(0, 10);
}
