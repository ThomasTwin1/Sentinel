const fs = require("fs");
const path = require("path");
const assert = require("assert");

const app = fs.readFileSync(path.join(process.cwd(), "app.js"), "utf8");
const start = app.indexOf("async function confirmRestoreBackup(event)");
const end = app.indexOf("function printGradeBoard", start);
assert.ok(start >= 0 && end > start, "confirmRestoreBackup must remain directly testable");
const restoreFlow = app.slice(start, end);

assert.match(
  restoreFlow,
  /if \(envelopeReplaced\)[\s\S]*localStorage\.setItem\(storageKey, previousRaw\)[\s\S]*closeRestoreBackupDialog\(\)[\s\S]*await lockApplication\(/,
  "a failure after envelope replacement must roll back storage and fully lock the app"
);
assert.match(
  restoreFlow,
  /\} else \{[\s\S]*restoreBackupError\.textContent[\s\S]*restoreBackupPassphrase\.select\(\)/,
  "a pre-replacement validation failure must keep the current unlocked vault intact and report the error in the restore dialog"
);
assert.doesNotMatch(
  restoreFlow,
  /\n\s*vault\.lock\(\);\s*\n\s*els\.restoreBackupError/,
  "restore errors must never lock only the cryptographic vault while leaving application state visible"
);

console.log("Restore UI fail-closed security tests passed.");
