/** Map a stored frequency record to task recurrence settings. */
export function mapFrequencyToRecurrence(frequency) {
  if (!frequency) {
    return { recurrenceType: "ONE_TIME", intervalDays: 1 };
  }

  const name = String(frequency.frequencyName || "").trim().toLowerCase();
  const intervalDays = Number(frequency.daysInterval) > 0 ? Number(frequency.daysInterval) : 1;

  if (name === "daily" || intervalDays === 1) {
    return { recurrenceType: "DAILY", intervalDays };
  }

  if (name === "weekly" || intervalDays === 7) {
    return { recurrenceType: "WEEKLY", intervalDays };
  }

  if (
    name === "monthly"
    || name === "quarterly"
    || name === "half yearly"
    || name === "yearly"
    || intervalDays >= 28
  ) {
    return { recurrenceType: "MONTHLY", intervalDays };
  }

  if (intervalDays > 1 && intervalDays < 7) {
    return { recurrenceType: "DAILY", intervalDays };
  }

  if (intervalDays > 7 && intervalDays < 28) {
    return { recurrenceType: "WEEKLY", intervalDays };
  }

  return { recurrenceType: "DAILY", intervalDays };
}

export function resolveFrequencySchedule(frequency, overrides = {}) {
  if (!frequency) return overrides;

  const { recurrenceType, intervalDays } = mapFrequencyToRecurrence(frequency);
  const numberOfDays = Number(frequency.numberOfDays) > 0 ? Number(frequency.numberOfDays) : null;

  return {
    recurrenceType: overrides.recurrenceType && overrides.recurrenceType !== "ONE_TIME"
      ? overrides.recurrenceType
      : recurrenceType,
    durationDays: overrides.durationDays != null ? overrides.durationDays : numberOfDays,
    intervalDays: overrides.intervalDays != null ? overrides.intervalDays : intervalDays,
  };
}
