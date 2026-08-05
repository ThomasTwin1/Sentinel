"use strict";
const fs=require("fs");const html=fs.readFileSync(__dirname+"/index.html","utf8");
function assert(c,m){if(!c)throw new Error(m)}
assert(html.includes('data-tab="fpar-dashboard"'),"FPAR Dashboard tab missing");
assert(html.includes('data-tab="milsans-dashboard"'),"MILSANS Dashboard tab missing");
assert(!html.includes('id="dashboardView"'),"Combined dashboard selector should be removed");
console.log("All Sentinel separate-dashboard tests passed.");
