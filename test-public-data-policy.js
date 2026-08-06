"use strict";

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { readFileSync } = require("node:fs");

const trackedFiles = execFileSync(
  "git",
  ["-c", `safe.directory=${process.cwd().replace(/\\/g, "/")}`, "ls-files", "-z"],
  { encoding: "utf8" }
)
  .split("\0")
  .filter(Boolean)
  .map(path => path.replace(/\\/g, "/"));

const allowedCsv = [
  /^Sentinel_Fictional_[^/]+\.csv$/i
];

const forbidden = trackedFiles.filter(path => {
  if (/\.csv$/i.test(path)) return !allowedCsv.some(pattern => pattern.test(path));
  if (/\.(xlsx?|pdf)$/i.test(path)) return true;
  if (/\.sentinel$/i.test(path)) return true;
  if (/^(Milsans|PDF|Regs|VSIMS\/FPARS|__MACOSX)\//i.test(path)) return true;
  if (/(Humphreys|FPARView|InaccessibleFCView)/i.test(path)) return true;
  if (/^sentinel-(tracker-backup|encrypted-backup|inspection-readiness|milsans-)/i.test(path)) return true;
  return false;
});

assert.deepEqual(
  forbidden,
  [],
  `Operational or unapproved data files are tracked:\n${forbidden.join("\n")}`
);

const appSource = readFileSync("app.js", "utf8");
assert.equal(appSource.includes("\u0008"), false, "app.js contains hidden backspace characters.");
assert.match(appSource, /escapeAttr\(facility\.id\)/, "Facility IDs must be escaped before HTML rendering.");
assert.match(appSource, /escapeHtml\(FREQUENCIES\[facility\.frequency\]/, "Restored frequency values must be escaped.");

console.log("Sentinel public-data policy check passed.");
