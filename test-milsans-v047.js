"use strict";
function assert(c,m){if(!c)throw new Error(m)}
function d(s){const [y,m,day]=s.split("-").map(Number);return new Date(y,m-1,day)}
function addMonths(date,months){const t=new Date(date.getFullYear(),date.getMonth()+months,1);return new Date(t.getFullYear(),t.getMonth(),25)}
function missed(last,asOf,months){let due=addMonths(last,months),out=[];while(due<asOf){out.push(due);due=addMonths(due,months)}return out}
let q=missed(d("2026-02-26"),d("2026-09-01"),3);
assert(q.length===2,"Quarterly backlog should contain two missed dates");
assert(q[0].getTime()===d("2026-05-25").getTime(),"First missed quarterly date must be May 25");
assert(q[1].getTime()===d("2026-08-25").getTime(),"Second missed quarterly date must be Aug 25");
let reset=missed(d("2026-08-28"),d("2026-09-01"),3);
assert(reset.length===0,"New completed inspection must reset missed history");
console.log("All Sentinel v0.4.7 missed-history tests passed.");
