"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const { normalizePersonName, resolveTeam } = require("./team-attribution.js");

const teams = [
  { id: "team-1", name: "Team 1", members: ["Inspector Alpha"] },
  { id: "team-2", name: "Team 2", members: ["SPC Rivera", "Inspector Bravo"] },
  { id: "team-3", name: "Team 3", members: ["SGT Morgan"] }
];

assert.equal(normalizePersonName("  SPC.  RIVERA  "), "spc rivera", "case, punctuation, and spacing should normalize deterministically");
assert.deepEqual(resolveTeam("spc rivera", teams), {
  status: "matched",
  team: "Team 2",
  source: "Exact synthetic directory match"
});
assert.equal(resolveTeam("SPC River", teams).status, "unmatched", "near names must not fuzzy-match");
assert.equal(resolveTeam("", teams).status, "unmatched", "a missing completed-by name must require review");
assert.equal(resolveTeam("", teams, "Team 3").status, "reported", "a known reported team may be used when no completed-by name is supplied");
assert.equal(resolveTeam("Inspector Alpha", teams, "Team 1").status, "reported", "an agreeing name and reported team may be used");
assert.equal(resolveTeam("Inspector Alpha", teams, "Team 3").status, "conflict", "a contradictory team must require review");
assert.equal(resolveTeam("Unknown Person", teams, "Unknown Team").status, "conflict", "an unknown reported team must not be accepted when a name is present");
assert.equal(resolveTeam("", teams, "Unknown Team").status, "unmatched", "an unknown reported-only team must require review");

const ambiguousTeams = [
  ...teams,
  { id: "team-4", name: "Team 4", members: ["Inspector Alpha"] }
];
assert.equal(resolveTeam("Inspector Alpha", ambiguousTeams).status, "ambiguous", "duplicate directory names must never be guessed");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const worker = fs.readFileSync("service-worker.js", "utf8");

function functionBlock(name) {
  const match = app.match(new RegExp(
    `(?:async\\s+)?function\\s+${name}\\s*\\([\\s\\S]*?(?=\\n  (?:async\\s+)?function\\s+|\\n\\}\\)\\(\\);)`,
    "m"
  ));
  assert.ok(match, `${name}() must exist`);
  return match[0];
}

assert.match(html, /id="teamCompletionSummary"/);
assert.match(html, /id="teamCompletionList"/);
assert.match(html, /built-in synthetic team directory/i);
assert.match(html, /Do not load an operational roster/i);
assert.match(html, /<script src="team-attribution\.js"><\/script>[\s\S]*<script src="app\.js"><\/script>/,
  "the local matcher must load before the application");
assert.match(worker, /"\.\/team-attribution\.js"/, "the local matcher must be available in the offline app shell");

const teamRows = functionBlock("buildTeamCompletionRows");
assert.match(teamRows, /lastCompletedBy/);
assert.match(teamRows, /getLatestCompletedMilsansRecords\(\)/);
assert.doesNotMatch(teamRows, /assignedTeam/, "future assignment ownership must not be treated as completion attribution");

const renderBoard = functionBlock("renderTeamCompletionBoard");
assert.match(renderBoard, /escapeHtml\(row\.completedBy/);
assert.match(renderBoard, /Needs review/);
assert.match(renderBoard, /Exact synthetic directory match|resolution\.source/);

const normalizeFacility = functionBlock("normalizeFacilityRecord");
assert.match(normalizeFacility, /lastCompletedBy:[^\n]*boundedString/);
assert.match(normalizeFacility, /completedTeam:[^\n]*boundedString/);

const manualCompletion = functionBlock("saveConductedInspection");
assert.match(manualCompletion, /facility\.lastCompletedBy\s*=\s*""/,
  "recording a newer date must clear stale completed-by attribution");
assert.match(manualCompletion, /facility\.completedTeam\s*=\s*""/,
  "recording a newer date must clear stale completion-team attribution");

const facilitySave = functionBlock("saveFacility");
assert.match(facilitySave, /previous\.lastConductedDate\s*===\s*lastConductedDate/,
  "facility edits must compare the prior and new inspection dates");
assert.match(facilitySave, /lastCompletedBy:\s*keepCompletionAttribution\s*\?/,
  "facility edits must clear stale completed-by attribution when the inspection date changes");
assert.match(facilitySave, /completedTeam:\s*keepCompletionAttribution\s*\?/,
  "facility edits must clear stale team attribution when the inspection date changes");

const fparImport = functionBlock("importInspectionCsv");
assert.match(fparImport, /completedByIndex\s*=\s*headerMap\.completedby/,
  "synthetic FPAR imports may use an optional Completed By column");
assert.match(fparImport, /inspectedDate,\s*\n\s*completedBy/,
  "the completed-by value must travel with the same latest-dated row");
assert.match(fparImport, /lastCompletedBy:\s*record\.completedBy/,
  "the selected latest row must supply completion attribution");

const demoBuilder = functionBlock("buildFictionalDemoState");
assert.match(demoBuilder, /"Inspector Alpha",\s*"Inspector Charlie"/,
  "the fictional demo must visibly separate future assignment from past completion");

const operationsStart = html.indexOf('<section id="operations"');
const operationsEnd = html.indexOf('\n    <section id="', operationsStart + 1);
const operations = html.slice(operationsStart, operationsEnd);
assert.doesNotMatch(operations, /<input\b[^>]*type="file"/i,
  "the completion board must not add a roster or personnel-file upload control");

console.log("Synthetic team-attribution tests passed.");
