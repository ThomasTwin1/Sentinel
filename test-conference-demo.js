"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

assert.match(html, /data-tab="grade-board"/);
assert.match(html, /DFAC Inspection Letter Grade Board/);
assert.match(html, /name="sentinel-release" content="0\.7\.0"/, "the deployed page must expose its release version");
assert.match(html, /Prototype visualization:/);
assert.match(html, /authoritative result remains the completed inspection record/i);
assert.match(html, /Open fictional conference demo/);

assert.match(app, /function startConferenceDemoMode\(\)/);
assert.match(app, /conferenceDemoMode = true/);
assert.match(app, /state = buildFictionalDemoState/);
assert.match(app, /if \(conferenceDemoMode\) return;/, "fictional conference mode must not persist application state");
assert.match(app, /setImportControlsDisabled\(true\)/, "conference mode must disable file imports");
assert.match(app, /switchTab\("grade-board"\)/);
assert.match(app, /function renderGradeBoard\(\)/);
assert.match(app, /data-grade-board-filter/, "grade summary tiles must expose filter actions");
assert.match(app, /aria-pressed="\$\{gradeBoardFilter === grade\}"/, "grade summary tiles must expose their selected state");
assert.match(app, /gradeBoardFilter === "FOLLOW_UP"/, "the grade board must support a follow-up-required filter");
const summaryFilterBlock = app.match(/function handleGradeBoardSummaryClick[\s\S]*?\n  }/)?.[0] || "";
assert.match(summaryFilterBlock, /gradeBoardFilter === selectedFilter \? "" : selectedFilter/, "tapping a selected summary tile must clear its filter");
assert.match(summaryFilterBlock, /renderGradeBoard\(\)/, "summary filters must refresh the grade board");
assert.match(app, /data-open-grade-facility/, "each DFAC letter grade must expose a details action");
const gradeNavigationBlock = app.match(/function openGradeBoardFacility[\s\S]*?\n  }/)?.[0] || "";
assert.match(gradeNavigationBlock, /switchTab\("milsans"\)/, "grade actions must open the detailed MILSANS results panel");
assert.match(gradeNavigationBlock, /els\.milsansSearch\.value = searchValue/, "grade actions must select the matching inspection record");
assert.match(gradeNavigationBlock, /scrollToFirstMilsansRecord\(\)/, "grade actions must position the matching record for the user");
assert.doesNotMatch(gradeNavigationBlock, /https?:|window\.open/, "grade actions must not disclose facility data to an external service");

const fictionalRecordBlock = app.match(/function buildFictionalMilsansRecords[\s\S]*?return records\.map/)?.[0] || "";
assert.match(fictionalRecordBlock, /Example Installation/);
assert.match(fictionalRecordBlock, /Dining Facility/);
assert.doesNotMatch(fictionalRecordBlock, /Camp Humphreys|Fort Liberty|JBLM|Fort Johnson/i);

assert.match(styles, /\.grade-board-grid/);
assert.match(styles, /\.grade-board-stat:focus-visible/, "grade summary filters must show a keyboard focus indicator");
assert.match(styles, /\.grade-board-stat\[aria-pressed="true"\]/, "the selected grade filter must have a visible state");
assert.match(styles, /\.grade-board-letter:focus-visible/, "clickable grades must show a keyboard focus indicator");
assert.match(styles, /@media \(max-width: 760px\)[\s\S]*\.grade-board-grid \{ grid-template-columns: 1fr; \}/);

console.log("Conference demo policy tests passed.");
