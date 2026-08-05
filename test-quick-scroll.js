"use strict";

const fs = require("fs");
const index = fs.readFileSync(__dirname + "/index.html", "utf8");
const app = fs.readFileSync(__dirname + "/app.js", "utf8");
const styles = fs.readFileSync(__dirname + "/styles.css", "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(index.includes('id="quickScrollControls"'), "Quick-scroll navigation is missing.");
assert(index.includes('id="scrollToTopBtn"'), "Top button is missing.");
assert(index.includes('id="scrollToBottomBtn"'), "Bottom button is missing.");
assert(app.includes("function scrollPageToTop()"), "Top-scroll function is missing.");
assert(app.includes("function scrollPageToBottom()"), "Bottom-scroll function is missing.");
assert(app.includes("function updateQuickScrollControls()"), "Scroll-state function is missing.");
assert(app.includes('behavior: "smooth"'), "Smooth scrolling is missing.");
assert(styles.includes(".quick-scroll-controls"), "Quick-scroll styling is missing.");
assert(styles.includes("display: none !important"), "Print exclusion is missing.");

console.log("All Sentinel quick-scroll tests passed.");
