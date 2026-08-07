"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

assert.match(app, /const SIGN_IN_DISABLED = true/, "the test edition must explicitly disable the sign-in gate");
const initializeBlock = app.match(/async function initializeSecurity[\s\S]*?\n  }/)?.[0] || "";
assert.match(initializeBlock, /if \(SIGN_IN_DISABLED\)/);
assert.match(initializeBlock, /startConferenceDemoMode\(\)/, "no-sign-in startup must enter memory-only fictional mode");
assert.match(html, /id="securityGate"[^>]*hidden/, "the disabled sign-in gate must not flash before startup");
assert.match(html, /No-sign-in session mode:/);
assert.match(app, /if \(conferenceDemoMode\) return;/, "no-sign-in fictional data must not persist");
assert.match(app, /setImportControlsDisabled\(!SIGN_IN_DISABLED\)/, "no-sign-in mode must enable bounded session CSV imports");
assert.match(app, /setBackupControlsDisabled\(true\)/, "no-sign-in mode must keep encrypted backup controls disabled");
assert.doesNotMatch(styles, /conference-demo-mode \.tabs \.tab:not/, "no-sign-in mode must expose the schedule and dashboard tabs");

assert.match(html, /data-tab="inspection-schedule"/);
assert.match(html, /id="printInspectionScheduleBtn"/);
assert.match(html, /id="scheduleStartDate"/);
assert.match(html, /id="scheduleEndDate"/);
assert.match(html, /id="scheduleSourceFilter"/);
assert.match(app, /function buildInspectionScheduleRows/);
assert.match(app, /program: "FPAR"/);
assert.match(app, /program: "MILSANS"/);
assert.match(app, /firstOccurrenceOnOrAfter/, "FPAR schedule generation must expand recurring inspections");
assert.match(app, /MAX_SCHEDULE_DAYS = 366/, "schedule ranges must be bounded");
assert.match(app, /MAX_SCHEDULE_ROWS = 5000/, "rendered schedule size must be bounded");
assert.match(app, /function printInspectionSchedule/);
assert.match(app, /printing-inspection-schedule/);
assert.match(styles, /body\.printing-inspection-schedule #inspection-schedule/);
assert.match(styles, /@media \(max-width: 760px\)[\s\S]*\.schedule-table \.schedule-row/);

console.log("No-sign-in and printable schedule tests passed.");
