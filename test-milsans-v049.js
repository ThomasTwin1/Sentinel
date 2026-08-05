"use strict";

const fs = require("fs");
const index = fs.readFileSync(__dirname + "/index.html", "utf8");
const app = fs.readFileSync(__dirname + "/app.js", "utf8");
const styles = fs.readFileSync(__dirname + "/styles.css", "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(!index.includes('data-tab="milsans">'), "MILSANS Results tab must be removed.");
assert(!index.includes('data-tab="facilities">'), "Facilities tab must be removed.");
assert(
  index.indexOf('id="milsansRatingKey"') < index.indexOf('id="milsansDueRequirements"'),
  "Inspection Rating Key must appear within the MILSANS Dashboard before the facility cards."
);
assert(
  app.includes('data-label="Last Inspection Date"')
    && app.includes('data-label="Last Inspector"'),
  "Last Inspection Date and Last Inspector must both appear on dashboard cards."
);
assert(
  app.includes('class="survey-id-cell" data-label="Survey ID"'),
  "Survey ID must be rendered on each dashboard card."
);
assert(
  styles.includes('"lastdate lastinspector"')
    && styles.includes('"survey survey"'),
  "Mobile and print layouts must pair the last inspection fields and place Survey ID at the bottom."
);
assert(
  app.includes("function handleMilsansDueRatingKeyClick(event)"),
  "Dashboard rating-key handler must exist."
);

console.log("All Sentinel v0.4.9 dashboard-cleanup tests passed.");
