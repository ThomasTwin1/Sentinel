// Run with: node test-date-logic.js
// These tests mirror the critical date rules used by app.js.
const assert = require("node:assert/strict");

function parseISO(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function addDays(date, days) {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
}
function daysInMonth(year, monthIndex) { return new Date(year, monthIndex + 1, 0).getDate(); }
function addCalendarMonths(date, months) {
  const originalDay = date.getDate();
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  target.setDate(Math.min(originalDay, daysInMonth(target.getFullYear(), target.getMonth())));
  return startOfDay(target);
}
function nthWeekdayOfMonth(year, monthIndex, weekday, nth) {
  const first = new Date(year, monthIndex, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, monthIndex, 1 + offset + (nth - 1) * 7);
}
function lastWeekdayOfMonth(year, monthIndex, weekday) {
  const last = new Date(year, monthIndex + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, monthIndex + 1, -offset);
}
function getFederalHolidays(year) {
  const dates = [];
  const addObserved = (monthIndex, day) => {
    const actual = new Date(year, monthIndex, day);
    dates.push(toISO(actual));
    if (actual.getDay() === 6) dates.push(toISO(addDays(actual, -1)));
    if (actual.getDay() === 0) dates.push(toISO(addDays(actual, 1)));
  };
  addObserved(0, 1);
  dates.push(toISO(nthWeekdayOfMonth(year, 0, 1, 3)));
  dates.push(toISO(nthWeekdayOfMonth(year, 1, 1, 3)));
  dates.push(toISO(lastWeekdayOfMonth(year, 4, 1)));
  addObserved(5, 19);
  addObserved(6, 4);
  dates.push(toISO(nthWeekdayOfMonth(year, 8, 1, 1)));
  dates.push(toISO(nthWeekdayOfMonth(year, 9, 1, 2)));
  addObserved(10, 11);
  dates.push(toISO(nthWeekdayOfMonth(year, 10, 4, 4)));
  addObserved(11, 25);
  return dates;
}
function federalHolidaySetFor(date) {
  const set = new Set();
  [date.getFullYear() - 1, date.getFullYear(), date.getFullYear() + 1].forEach(year => getFederalHolidays(year).forEach(iso => set.add(iso)));
  return set;
}
function isBusinessDay(date, customHolidays = []) {
  if (date.getDay() === 0 || date.getDay() === 6) return false;
  if (federalHolidaySetFor(date).has(toISO(date))) return false;
  if (customHolidays.some(h => h.date === toISO(date))) return false;
  return true;
}
function nextBusinessDayAfter(date, customHolidays = []) {
  let candidate = addDays(date, 1);
  while (!isBusinessDay(candidate, customHolidays)) candidate = addDays(candidate, 1);
  return candidate;
}

assert.equal(toISO(addCalendarMonths(parseISO("2026-01-31"), 1)), "2026-02-28", "Jan 31 monthly should use final day of February");
assert.equal(toISO(addCalendarMonths(parseISO("2024-01-31"), 1)), "2024-02-29", "Leap-year February should use Feb 29");
assert.equal(toISO(addCalendarMonths(parseISO("2026-01-15"), 3)), "2026-04-15", "Quarterly should add 3 calendar months");
assert.equal(toISO(addCalendarMonths(parseISO("2026-03-10"), 6)), "2026-09-10", "Biannual should add 6 calendar months");
assert.equal(toISO(addCalendarMonths(parseISO("2026-07-19"), 12)), "2027-07-19", "Annual should add 12 calendar months");
assert.equal(toISO(nextBusinessDayAfter(parseISO("2026-07-17"))), "2026-07-20", "Friday daily requirement should move to Monday");
assert.equal(toISO(nextBusinessDayAfter(parseISO("2026-07-17"), [{ date: "2026-07-20" }])), "2026-07-21", "Monday training holiday should move Friday requirement to Tuesday");
assert.ok(getFederalHolidays(2026).includes("2026-07-03"), "Independence Day 2026 should be observed Friday July 3");

console.log("All Sentinel date-logic tests passed.");
