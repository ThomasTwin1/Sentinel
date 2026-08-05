"use strict";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function iso(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function earliest({ followUp, regulatory, scheduled }) {
  const values = [
    ["follow-up", followUp],
    ["regulatory", regulatory],
    ["scheduled", scheduled]
  ].filter(([, value]) => value).sort((a, b) => a[1] - b[1]);
  return values[0];
}
function status(asOf, due, warningDays) {
  const days = Math.round((due - asOf) / 86400000);
  if (days < 0) return "MISSED";
  if (days === 0) return "DUE_TODAY";
  if (days <= warningDays) return "COMING_SOON";
  return "UPCOMING";
}

assert(earliest({
  followUp: null,
  regulatory: iso("2026-08-07"),
  scheduled: iso("2026-08-31")
})[0] === "regulatory", "Regulatory deadline should win when earlier.");

assert(earliest({
  followUp: null,
  regulatory: iso("2026-10-01"),
  scheduled: iso("2026-09-30")
})[0] === "scheduled", "Scheduled month-end should win when earlier.");

assert(earliest({
  followUp: iso("2026-06-23"),
  regulatory: iso("2026-09-16"),
  scheduled: iso("2026-09-30")
})[0] === "follow-up", "Required follow-up should win when earliest.");

assert(status(iso("2026-08-04"), iso("2026-08-03"), 14) === "MISSED", "Past deadline should be missed.");
assert(status(iso("2026-08-04"), iso("2026-08-04"), 14) === "DUE_TODAY", "Same-day deadline should be due today.");
assert(status(iso("2026-08-04"), iso("2026-08-07"), 14) === "COMING_SOON", "Three days should be coming soon.");
assert(status(iso("2026-08-04"), iso("2026-08-31"), 14) === "UPCOMING", "Twenty-seven days should be upcoming.");

console.log("All Sentinel MILSANS inspector/deadline tests passed.");
