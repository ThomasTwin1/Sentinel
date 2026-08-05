"use strict";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function iso(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function chooseActionDate({ followUp, scheduledMonthEnd, regulatory }) {
  if (followUp) return ["follow-up", followUp];
  if (scheduledMonthEnd) return ["scheduled-month-end", scheduledMonthEnd];
  if (regulatory) return ["regulatory", regulatory];
  return ["none", null];
}
function compareComingDue(aDays, bDays) {
  const aFuture = aDays >= 0 ? 0 : 1;
  const bFuture = bDays >= 0 ? 0 : 1;
  return aFuture - bFuture
    || (aFuture === 0 ? aDays - bDays : bDays - aDays);
}

assert(
  chooseActionDate({
    followUp: null,
    scheduledMonthEnd: iso("2026-08-31"),
    regulatory: iso("2026-08-07")
  })[0] === "scheduled-month-end",
  "Routine action date must use scheduled month-end."
);

assert(
  chooseActionDate({
    followUp: iso("2026-08-10"),
    scheduledMonthEnd: iso("2026-08-31"),
    regulatory: iso("2026-08-07")
  })[0] === "follow-up",
  "Required follow-up must take priority."
);

assert(compareComingDue(3, 27) < 0, "Sooner future action date must sort first.");
assert(compareComingDue(27, -4) < 0, "Future action dates must appear before missed dates.");
assert(compareComingDue(-2, -10) < 0, "More recent missed date should appear first after future records.");

console.log("All Sentinel v0.4.2 MILSANS tests passed.");
