"use strict";
function assert(c,m){if(!c)throw new Error(m)}
function scheduledDate(month,year){return new Date(year,month-1,25)}
function fmt(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
assert(fmt(scheduledDate(8,2026))==="2026-08-25","August scheduled date must be Aug 25.");
assert(fmt(scheduledDate(9,2026))==="2026-09-25","September scheduled date must be Sep 25.");
const missed=new Date(2026,2,29);
assert(new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(missed)==="March 2026","Missed month formatting failed.");
console.log("All Sentinel v0.4.5 tests passed.");
