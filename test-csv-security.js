"use strict";

const assert = require("node:assert/strict");
const { parseCsv, constants } = require("./csv-security.js");

assert.deepEqual(parseCsv("a,b\r\n1,2\n"), [["a", "b"], ["1", "2"]]);
assert.deepEqual(parseCsv('"a,b","escaped ""quote"""'), [["a,b", 'escaped "quote"']]);
assert.throws(() => parseCsv('"unclosed'), /unclosed quoted field/);
assert.throws(() => parseCsv('"closed"suffix'), /content after a closing quote/);
assert.throws(() => parseCsv(`"${"a".repeat(constants.MAX_CSV_FIELD_CHARS)}""x"`), /field exceeds/);
assert.throws(() => parseCsv("x".repeat(constants.MAX_CSV_FIELD_CHARS + 1)), /field exceeds/);
assert.throws(() => parseCsv(Array(constants.MAX_CSV_COLUMNS + 1).fill("x").join(",")), /column safety limit/);
assert.throws(() => parseCsv(Array(constants.MAX_CSV_ROWS + 1).fill("x").join("\n")), /row safety limit/);

console.log("CSV security boundary tests passed.");
