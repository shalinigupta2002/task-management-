/** Supported TaskFrequency.frequencyName values (matches backend Zod enum). */
export const FREQUENCY_NAME_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Half Yearly",
  "Yearly",
  "Custom",
];

/** Suggested interval/duration defaults for known frequency names (matches seed data). */
export const FREQUENCY_DEFAULTS = {
  Daily: { daysInterval: 1, numberOfDays: 7, description: "Tasks occur every day" },
  Weekly: { daysInterval: 7, numberOfDays: 7, description: "Tasks occur every week" },
  Monthly: { daysInterval: 30, numberOfDays: 30, description: "Tasks occur every month" },
  Quarterly: { daysInterval: 90, numberOfDays: 90, description: "Tasks occur every quarter" },
  "Half Yearly": { daysInterval: 182, numberOfDays: 182, description: "Tasks occur every six months" },
  Yearly: { daysInterval: 365, numberOfDays: 365, description: "Tasks occur once a year" },
  Custom: { daysInterval: "", numberOfDays: "", description: "" },
};
