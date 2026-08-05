"use strict";
function assert(c,m){if(!c)throw new Error(m)}
function addMonths25(text,months){const [y,m,d]=text.split("-").map(Number);const target=new Date(y,m-1+months,1);return new Date(target.getFullYear(),target.getMonth(),25)}
const q=addMonths25("2025-12-10",3);assert(q.getFullYear()===2026&&q.getMonth()===2&&q.getDate()===25,"Quarterly due date must be March 25, 2026");
const m=addMonths25("2026-07-29",1);assert(m.getFullYear()===2026&&m.getMonth()===7&&m.getDate()===25,"Monthly due date must be August 25, 2026");
console.log("All Sentinel v0.4.6 MILSANS tests passed.");
