"use strict";

const fs = require("fs");

const index = fs.readFileSync(__dirname + "/index.html", "utf8");
const app = fs.readFileSync(__dirname + "/app.js", "utf8");
const styles = fs.readFileSync(__dirname + "/styles.css", "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  index.indexOf("<th>Scheduled Date</th>") < index.indexOf("<th>Assigned Team</th>"),
  "Assigned Team must follow Scheduled Date in the MILSANS Dashboard table."
);

assert(
  app.indexOf('class="scheduled-date-cell" data-label="Scheduled Date"')
    < app.indexOf('class="assigned-team-cell" data-label="Assigned Team"'),
  "Assigned Team must follow Scheduled Date in rendered dashboard records."
);

assert(
  styles.includes('"scheduled assignedteam"'),
  "Mobile and print card layouts must place Scheduled Date beside Assigned Team."
);

console.log("All Sentinel v0.4.8 assigned-team layout tests passed.");
