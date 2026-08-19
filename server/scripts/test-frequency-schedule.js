import { buildOccurrenceDates } from "../src/utils/taskRecurrence.js";
import { mapFrequencyToRecurrence, resolveFrequencySchedule } from "../src/utils/frequencySchedule.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const dailyFrequency = {
    frequencyName: "Daily",
    daysInterval: 1,
    numberOfDays: 7,
    status: "ACTIVE",
  };

  const schedule = resolveFrequencySchedule(dailyFrequency, {});
  assert(schedule.recurrenceType === "DAILY", "Daily maps to DAILY recurrence");
  assert(schedule.durationDays === 7, "Daily uses 7 numberOfDays");
  assert(schedule.intervalDays === 1, "Daily interval is 1 day");

  const startDate = new Date("2026-08-18T00:00:00.000Z");
  const dates = buildOccurrenceDates({
    recurrenceType: schedule.recurrenceType,
    startDate,
    durationDays: schedule.durationDays,
    intervalDays: schedule.intervalDays,
  });

  assert(dates.length === 7, `Expected 7 daily occurrences, got ${dates.length}`);

  const weeklyFrequency = {
    frequencyName: "Weekly",
    daysInterval: 7,
    numberOfDays: 7,
    status: "ACTIVE",
  };
  const weeklySchedule = resolveFrequencySchedule(weeklyFrequency, {});
  assert(mapFrequencyToRecurrence(weeklyFrequency).recurrenceType === "WEEKLY", "Weekly recurrence");

  const monthlyFrequency = {
    frequencyName: "Monthly",
    daysInterval: 30,
    numberOfDays: 30,
    status: "ACTIVE",
  };
  const monthlySchedule = resolveFrequencySchedule(monthlyFrequency, {});
  assert(monthlySchedule.durationDays === 30, "Monthly uses 30 numberOfDays");

  console.log("All frequency scheduling tests passed.");
}

main();
