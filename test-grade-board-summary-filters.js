"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

assert.match(html, /role="group" aria-label="Filter fictional DFAC grades"/);
assert.match(html, /Tap A, B, C, F, or Follow-Up Required to filter the board/);
assert.match(app, /els\.gradeBoardSummary\.addEventListener\("click", handleGradeBoardSummaryClick\)/);
assert.match(app, /data-grade-board-filter="\$\{grade\}"/);
assert.match(app, /data-grade-board-filter="FOLLOW_UP"/);
assert.match(app, /if \(!gradeBoardFilter\) return true/);
assert.match(app, /return tsfcLetterGrade\(record\.rating\) === gradeBoardFilter/);
assert.match(app, /if \(gradeBoardFilter === "FOLLOW_UP"\) return record\.followUpRequired/);
assert.match(app, /gradeBoardFilter = gradeBoardFilter === selectedFilter \? "" : selectedFilter/);
assert.match(app, /gradeBoardFilter = "";[\s\S]*?state = buildFictionalDemoState/, "loading a new fictional scenario must reset the filter");
assert.match(app, /No facilities match this grade filter/);
assert.match(styles, /\.grade-board-stat\[aria-pressed="true"\]/);
assert.doesNotMatch(app.match(/function handleGradeBoardSummaryClick[\s\S]*?\n  }/)?.[0] || "", /https?:|window\.open/);

console.log("Grade Board summary filter tests passed.");
