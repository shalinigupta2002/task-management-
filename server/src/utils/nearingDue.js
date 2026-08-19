import config from "../config/index.js";

/**
 * Tasks Nearing Due window (excludes today — today has its own bucket).
 * Default: due date is tomorrow through today + thresholdDays (inclusive).
 * Example with threshold=3 on 19 Aug: 20, 21, 22 Aug.
 */
export function getNearingDueDays() {
  const days = Number(config.tasks?.nearingDueDays);
  return Number.isFinite(days) && days > 0 ? Math.floor(days) : 3;
}

export function startOfLocalDay(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addLocalDays(date, days) {
  const d = startOfLocalDay(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * @param {Date} [now]
 * @param {number} [thresholdDays]
 * @returns {{ todayStart: Date, todayEnd: Date, nearingStart: Date, nearingEndExclusive: Date, thresholdDays: number }}
 */
export function getNearingDueWindow(now = new Date(), thresholdDays = getNearingDueDays()) {
  const todayStart = startOfLocalDay(now);
  const todayEnd = addLocalDays(todayStart, 1);
  const nearingStart = todayEnd; // tomorrow 00:00
  const nearingEndExclusive = addLocalDays(todayStart, thresholdDays + 1);
  return { todayStart, todayEnd, nearingStart, nearingEndExclusive, thresholdDays };
}

/** Active (not completed/cancelled) tasks due within the nearing window */
export function nearingDueWhere(now = new Date(), thresholdDays = getNearingDueDays()) {
  const { nearingStart, nearingEndExclusive } = getNearingDueWindow(now, thresholdDays);
  return {
    status: { notIn: ["COMPLETED", "CANCELLED"] },
    dueDate: { gte: nearingStart, lt: nearingEndExclusive },
  };
}

export function todayDueWhere(now = new Date()) {
  const { todayStart, todayEnd } = getNearingDueWindow(now);
  return {
    status: { notIn: ["COMPLETED", "CANCELLED"] },
    dueDate: { gte: todayStart, lt: todayEnd },
  };
}

export function overdueWhere(now = new Date()) {
  return {
    status: { notIn: ["COMPLETED", "CANCELLED"] },
    dueDate: { lt: now },
  };
}
