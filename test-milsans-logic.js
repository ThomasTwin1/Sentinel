
"use strict";

function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
function normalizeRating(value) {
  const normalized = normalize(value);
  if (normalized === "fullycompliant") return "Fully Compliant";
  if (normalized === "substantiallycompliant") return "Substantially Compliant";
  if (normalized === "partiallycompliant") return "Partially Compliant";
  if (normalized === "noncompliant") return "Non-Compliant";
  return "";
}
function latestCompleted(records) {
  const grouped = new Map();
  records
    .filter(record => record.status === "Completed" && normalizeRating(record.rating))
    .forEach(record => {
      const key = `${normalize(record.installation)}|${normalize(record.facility)}`;
      const current = grouped.get(key);
      if (!current || record.date > current.date) grouped.set(key, record);
    });
  return [...grouped.values()];
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const records = [
  { installation: "Example", facility: "A", date: "2026-06-01", status: "Completed", rating: "Fully Compliant", followUp: false },
  { installation: "Example", facility: "A", date: "2026-07-01", status: "Completed", rating: "Substantially Compliant", followUp: false },
  { installation: "Example", facility: "A", date: "2026-07-20", status: "In Progress", rating: "Non-Compliant", followUp: true },
  { installation: "Example", facility: "B", date: "2026-07-05", status: "Completed", rating: "Non-Compliant", followUp: true },
];

const latest = latestCompleted(records);
assert(latest.length === 2, "Expected two latest completed facility records.");
assert(latest.find(r => r.facility === "A").rating === "Substantially Compliant", "In-progress record must not replace completed rating.");
assert(latest.filter(r => normalizeRating(r.rating) === "Non-Compliant").length === 1, "Expected one non-compliant facility.");
assert(latest.filter(r => r.followUp).length === 1, "Expected one follow-up-required facility.");
assert(normalizeRating("Noncompliant") === "Non-Compliant", "Noncompliant rating normalization failed.");

console.log("All Sentinel MILSANS logic tests passed.");


function tsfcLetterGrade(rating) {
  return {
    "Fully Compliant": "A",
    "Substantially Compliant": "B",
    "Partially Compliant": "C",
    "Non-Compliant": "F"
  }[normalizeRating(rating)] || "—";
}

assert(tsfcLetterGrade("Fully Compliant") === "A", "Fully Compliant must map to A.");
assert(tsfcLetterGrade("Substantially Compliant") === "B", "Substantially Compliant must map to B.");
assert(tsfcLetterGrade("Partially Compliant") === "C", "Partially Compliant must map to C.");
assert(tsfcLetterGrade("Noncompliant") === "F", "Noncompliant must map to F.");
assert(!["A", "B", "C", "F"].includes("D"), "D must not be a TSFC grade.");
console.log("All Sentinel TSFC letter-grade tests passed.");


function addMonths(iso, months) {
  const d = new Date(`${iso}T00:00:00`);
  const originalDay = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(originalDay, last));
  return target.toISOString().slice(0, 10);
}
function nextAction(record) {
  if (record.followUpRequired && record.followUpDate) return record.followUpDate;
  if (record.dueDate) return record.dueDate;
  if (!record.inspectionDate) return null;
  return addMonths(record.inspectionDate, record.frequency === "MONTHLY" ? 1 : 3);
}
assert(nextAction({followUpRequired:true,followUpDate:"2026-06-23",dueDate:"2026-09-16"}) === "2026-06-23", "Follow-up date must take priority.");
assert(nextAction({followUpRequired:false,dueDate:"2026-08-29"}) === "2026-08-29", "Imported due date must be used.");
assert(nextAction({followUpRequired:false,inspectionDate:"2026-07-29",frequency:"MONTHLY"}) === "2026-08-29", "Monthly routine due calculation failed.");
assert(nextAction({followUpRequired:false,inspectionDate:"2026-07-22",frequency:"QUARTERLY"}) === "2026-10-22", "Quarterly routine due calculation failed.");
console.log("All Sentinel combined MILSANS due-date tests passed.");
