const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  return new Date(startOfDay(date).getTime() + days * MS_PER_DAY);
}

function diffDaysInclusive(start, end) {
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  if (e < s) return 0;
  return Math.floor((e - s) / MS_PER_DAY) + 1;
}

/**
 * Build occurrence dates for a task based on recurrence configuration.
 * @returns {Date[]} UTC midnight dates
 */
export function buildOccurrenceDates({
  recurrenceType = "ONE_TIME",
  startDate,
  endDate,
  durationDays,
  intervalDays = 1,
}) {
  if (!startDate) return [];

  const start = startOfDay(startDate);
  let end = endDate ? startOfDay(endDate) : null;
  const step = Number(intervalDays) > 0 ? Number(intervalDays) : 1;

  if (!end && durationDays && durationDays > 0) {
    end = addDays(start, durationDays - 1);
  }

  if (!end) {
    return [start];
  }

  if (end < start) return [];

  const dates = [];
  const type = String(recurrenceType || "ONE_TIME").toUpperCase();

  if (type === "ONE_TIME") {
    dates.push(start);
    return dates;
  }

  if (type === "DAILY") {
    let cursor = start;
    while (cursor <= end) {
      dates.push(new Date(cursor));
      cursor = addDays(cursor, step);
    }
    return dates;
  }

  if (type === "WEEKLY") {
    let cursor = start;
    const weeklyStep = step >= 7 ? step : 7;
    while (cursor <= end) {
      dates.push(new Date(cursor));
      cursor = addDays(cursor, weeklyStep);
    }
    return dates;
  }

  if (type === "MONTHLY") {
    let cursor = new Date(start);
    while (cursor <= end) {
      dates.push(startOfDay(cursor));
      const next = new Date(cursor);
      next.setUTCMonth(next.getUTCMonth() + 1);
      cursor = startOfDay(next);
    }
    return dates;
  }

  return [start];
}

export function resolveEndDate({ startDate, endDate, durationDays }) {
  if (endDate) return startOfDay(endDate);
  if (startDate && durationDays && durationDays > 0) {
    return addDays(startDate, durationDays - 1);
  }
  return endDate ? startOfDay(endDate) : null;
}

export function resolveDurationDays({ startDate, endDate, durationDays }) {
  if (durationDays && durationDays > 0) return durationDays;
  if (startDate && endDate) return diffDaysInclusive(startDate, endDate);
  return null;
}

export { startOfDay, addDays, diffDaysInclusive };
