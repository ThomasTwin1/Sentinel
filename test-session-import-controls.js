"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const id of [
  "loadDemoBtn",
  "importCsvInput",
  "importMilsansCsvTopInput",
  "importInaccessibleCsvInput",
  "printFparCardsBtn",
  "printMilsansCardsBtn"
]) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} must remain available in the page`);
}

assert.equal((html.match(/session-import-control/g) || []).length, 3, "only the three supported header CSV controls should be exposed");
assert.match(styles, /conference-demo-mode \.header-actions[\s\S]*#loadDemoBtn[\s\S]*\.session-import-control[\s\S]*#printFparCardsBtn[\s\S]*#printMilsansCardsBtn/);
assert.match(app, /setImportControlsDisabled\(!SIGN_IN_DISABLED\)/, "no-sign-in mode must enable CSV inputs");
assert.match(app, /setBackupControlsDisabled\(true\)/, "backup and restore must remain disabled");
assert.match(app, /function saveState\(\)[\s\S]*?if \(conferenceDemoMode\) return;/, "session imports must never persist");
assert.match(app, /function confirmSessionCsvImport/);
assert.match(app, /keep the resulting records in memory for this tab only/i);
assert.match(app, /This public site is not approved hosting/i);
assert.match(app, /No-sign-in session mode does not encrypt or save records/, "plaintext output warnings must describe the active no-sign-in boundary");
const loadDemoBlock = app.match(/async function loadDemoData\(\)[\s\S]*?\n  }/)?.[0] || "";
assert.match(loadDemoBlock, /This clears imported records from this tab/, "Load Demo Data must explain the session reset");
assert.match(loadDemoBlock, /await deferFileImportPrompt\(\)/, "Load Demo Data must let the click complete before prompting");

for (const [name, label] of [
  ["importInspectionCsv", "FPAR"],
  ["importMilsansCsv", "MILSANS"],
  ["importInaccessibleCsv", "inaccessible-facility"]
]) {
  const block = app.match(new RegExp(`async function ${name}[\\s\\S]*?\\n  }`))?.[0] || "";
  assert.match(block, /await deferFileImportPrompt\(\)/, `${name} must let the file picker close before showing its warning`);
  assert.match(block, new RegExp(`confirmSessionCsvImport\\(file, "${label}"\\)`), `${name} must warn before reading the file`);
  assert.match(block, /markSessionImportActive\(\)/, `${name} must label the session as imported data`);
}

const gradePrint = app.match(/function printGradeBoard[\s\S]*?\n  }/)?.[0] || "";
const schedulePrint = app.match(/function printInspectionSchedule[\s\S]*?\n  }/)?.[0] || "";
assert.match(gradePrint, /confirmPlaintextOutput/, "Grade Board printing must warn even in session mode");
assert.match(schedulePrint, /confirmPlaintextOutput/, "schedule printing must warn even in session mode");
assert.doesNotMatch(gradePrint, /!conferenceDemoMode/, "imported session data must not bypass the print warning");
assert.doesNotMatch(schedulePrint, /!conferenceDemoMode/, "imported session data must not bypass the print warning");

console.log("Session-only import and facility-card control tests passed.");
