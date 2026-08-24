"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const worker = fs.readFileSync("service-worker.js", "utf8");

function topLevelSection(id) {
  const marker = `<section id="${id}"`;
  const start = html.indexOf(marker);
  assert.notEqual(start, -1, `#${id} section must exist`);

  const nextSection = html.indexOf("\n    <section id=\"", start + marker.length);
  const mainEnd = html.indexOf("\n  </main>", start + marker.length);
  const candidates = [nextSection, mainEnd].filter(index => index > start);
  const end = candidates.length ? Math.min(...candidates) : html.length;
  return html.slice(start, end);
}

function openingTag(source, id) {
  const match = source.match(new RegExp(`<(?:input|textarea|select|button|div|p|span)\\b[^>]*\\bid="${id}"[^>]*>`, "i"));
  assert.ok(match, `#${id} must have an opening tag`);
  return match[0];
}

function functionBlock(name) {
  const match = app.match(new RegExp(
    `(?:async\\s+)?function\\s+${name}\\s*\\([\\s\\S]*?(?=\\n  (?:async\\s+)?function\\s+|\\n\\}\\)\\(\\);)`,
    "m"
  ));
  assert.ok(match, `${name}() must exist`);
  return match[0];
}

assert.match(html, /name="sentinel-release"\s+content="0\.8\.1"/, "the page must expose release 0.8.1");
assert.match(html, /<title>[^<]*v0\.8\.1[^<]*<\/title>/i, "the document title must identify v0.8.1");
assert.match(worker, /CACHE_NAME\s*=\s*[^;\n]*v0\.8\.1/i, "the service-worker cache must be advanced for v0.8.1");

assert.match(html, /<button\b[^>]*class="[^"]*\btab\b[^"]*"[^>]*data-tab="operations"[^>]*>/, "the Operations Hub needs a navigation tab");
const operations = topLevelSection("operations");
const operationsText = operations.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

for (const id of [
  "operationsProfile",
  "operationsProfileStatus",
  "operationsSummary",
  "deficiencyForm",
  "deficiencyFacility",
  "deficiencyDescription",
  "deficiencyRecurring",
  "deficiencyWorkOrder",
  "deficiencyList",
  "teamCompletionSummary",
  "teamCompletionList",
  "operationsCadenceFilter",
  "operationsAssignmentForm",
  "assignmentFacility",
  "assignmentProfile",
  "operationsFolderList",
  "extensionForm",
  "extensionFacility",
  "extensionThroughDate",
  "extensionReason",
  "extensionAttachmentName",
  "extensionList",
  "rosterStatus",
  "rosterToggleBtn",
  "assetCheckoutList",
  "referenceQuery",
  "referenceSearchBtn",
  "referenceResult",
  "operationsAlertList"
]) {
  assert.match(operations, new RegExp(`\\bid="${id}"`), `#${id} must remain in the Operations Hub`);
}

for (const name of [
  "emptyOperationsState",
  "buildFictionalOperationsState",
  "resetOperationsState",
  "renderOperationsHub",
  "saveDeficiency",
  "handleDeficiencyAction",
  "renderTeamCompletionBoard",
  "saveOperationsAssignment",
  "saveExtensionRequest",
  "handleAssetAction",
  "answerLocalReference"
]) {
  functionBlock(name);
}

assert.match(functionBlock("renderAll"), /renderOperationsHub\(\)/, "the Operations Hub must refresh with the rest of Sentinel");

assert.match(operationsText, /(?:fictional|test)\s+(?:persona|profile)|(?:persona|profile)\s+(?:is\s+)?(?:fictional|for testing)/i,
  "the profile selector must be described as a fictional test persona");
assert.match(operationsText, /(?:not|does not|is not|isn't)[^.]{0,100}(?:login|authentication|identity|permission|access control)/i,
  "the Operations Hub must say that its persona selector is not authentication or access control");

assert.doesNotMatch(operations, /<input\b[^>]*\btype="file"/i,
  "the Operations Hub must not accept deficiency or extension attachments");
assert.doesNotMatch(operations, /<input\b[^>]*\btype="url"/i,
  "regulation destinations must be fixed by the application, not entered by a user");
assert.doesNotMatch(operations, /<iframe\b/i, "the Operations Hub must not embed third-party content");

const attachmentTag = openingTag(operations, "extensionAttachmentName");
assert.doesNotMatch(attachmentTag, /\btype="file"/i, "extension attachments are reference-name metadata only");

for (const id of [
  "deficiencyDescription",
  "deficiencyWorkOrder",
  "extensionReason",
  "extensionAttachmentName",
  "referenceQuery"
]) {
  assert.match(openingTag(operations, id), /\bmaxlength="\d+"/i, `#${id} must have a browser-enforced length bound`);
}
assert.match(openingTag(operations, "extensionThroughDate"), /\btype="date"/i, "extension-through values must use a bounded date control");

const referenceAnchors = operations.match(/<a\b[^>]*\bhref="[^"]+"[^>]*>/gi) || [];
assert.ok(referenceAnchors.length >= 2, "the Operations Hub must provide fixed regulation/reference links");
for (const anchor of referenceAnchors) {
  const href = anchor.match(/\bhref="([^"]+)"/i)?.[1] || "";
  const rel = anchor.match(/\brel="([^"]+)"/i)?.[1].toLowerCase().split(/\s+/) || [];
  assert.match(href, /^https:\/\//i, `reference link must use a fixed HTTPS destination: ${anchor}`);
  assert.doesNotMatch(href, /\$\{|\{\{|javascript:/i, "reference links must not be built from user input");
  assert.match(anchor, /\btarget="_blank"/i, "external references must open separately");
  assert.ok(rel.includes("noopener") && rel.includes("noreferrer"), "external references require rel=\"noopener noreferrer\"");
}

const localReference = functionBlock("answerLocalReference");
assert.doesNotMatch(localReference, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(?/i,
  "the local reference helper must not transmit a query over the network");
assert.doesNotMatch(app, /api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com|api\.cohere\.(?:ai|com)/i,
  "the session-only Operations Hub must not contain an external model endpoint");

const fictionalOperations = functionBlock("buildFictionalOperationsState");
assert.match(fictionalOperations, /Example|Fictional|Inspector Alpha/i, "Operations fixtures must visibly use synthetic identities or locations");

const fictionalDemo = functionBlock("buildFictionalDemoState");
assert.match(fictionalDemo, /Inspector Alpha/,
  "the base fictional scenario must provide synthetic profiles that the Operations Hub can assign");
assert.match(functionBlock("startConferenceDemoMode"), /state\s*=\s*buildFictionalDemoState\(/,
  "opening no-sign-in mode must begin from the complete fictional scenario");
assert.match(functionBlock("startConferenceDemoMode"), /resetOperationsState\(\)/,
  "opening no-sign-in mode must also rebuild fictional Operations Hub records");
assert.match(functionBlock("exitConferenceDemoMode"), /startConferenceDemoMode\(\)/,
  "Reset Demo must rebuild the fictional scenario and clear session changes");

const resetOperations = functionBlock("resetOperationsState");
assert.match(resetOperations, /(?:buildFictionalOperationsState|emptyOperationsState)\(/,
  "Operations reset must replace, not retain, session records");
assert.doesNotMatch(resetOperations, /localStorage|sessionStorage|indexedDB/i,
  "Operations reset must not write session records to browser persistence");

assert.match(functionBlock("saveState"), /if\s*\(conferenceDemoMode\)\s*return;/,
  "Operations changes must retain Sentinel's no-persistence session invariant");

console.log("Operations Hub feature and session-safety tests passed.");
