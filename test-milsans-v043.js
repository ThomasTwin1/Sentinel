"use strict";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function addMonths(dateText, months) {
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const target = new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
  if (target.getDate() !== date.getDate()) {
    return new Date(target.getFullYear(), target.getMonth(), 0);
  }
  return target;
}
function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}
function status(asOf, inspection, frequency, followUp = null) {
  const due = followUp || addMonths(inspection, frequency === "MONTHLY" ? 1 : 3);
  const days = daysBetween(asOf, due);
  const warning = frequency === "MONTHLY" ? 7 : 14;
  if (days < 0) return "MISSED";
  if (days === 0) return "DUE_TODAY";
  if (days <= warning) return "COMING_SOON";
  return "UPCOMING";
}

const asOf = new Date(2026, 7, 4);
assert(status(asOf, "2025-12-29", "QUARTERLY") === "MISSED", "Quarterly record beyond three months must be missed.");
assert(status(asOf, "2026-05-07", "QUARTERLY") === "COMING_SOON", "Quarterly record due in three days must be coming soon.");
assert(status(asOf, "2026-07-29", "MONTHLY") === "UPCOMING", "Monthly record due later in August must be upcoming.");
assert(status(asOf, "2026-06-16", "QUARTERLY", new Date(2026, 5, 23)) === "MISSED", "Past required follow-up must be missed.");

const months = ["October 2026", "August 2026", "September 2026"];
const monthNumber = name => new Date(`${name} 1`).getTime();
months.sort((a, b) => monthNumber(a) - monthNumber(b));
assert(months.join("|") === "August 2026|September 2026|October 2026", "Scheduled months must sort chronologically.");

console.log("All Sentinel v0.4.3 MILSANS tests passed.");
