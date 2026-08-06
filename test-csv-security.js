"use strict";

const assert = require("node:assert/strict");
const { parseCsv, constants } = require("./csv-security.js");

assert.deepEqual(parseCsv("a,b\r\n1,2\n"), [["a", "b"], ["1", "2"]]);
assert.deepEqual(parseCsv('"a,b","escaped ""quote"""'), [["a,b", 'escaped "quote"']]);
assert.deepEqual(parseCsv('facility,notes\nExample DFAC,Serving line 12"'), [["facility", "notes"], ["Example DFAC", 'Serving line 12"']]);
assert.deepEqual(parseCsv('facility,notes\nExample DFAC, "quoted, note" \t'), [["facility", "notes"], ["Example DFAC", "quoted, note"]]);
assert.throws(() => parseCsv('"unclosed'), /unclosed quoted field/);
assert.throws(() => parseCsv('"closed"suffix'), /content after a closing quote near line 1, column 9/);
assert.throws(() => parseCsv('"closed" "again"'), /unexpected quote near line 1, column 10/);
assert.throws(() => parseCsv(`"${"a".repeat(constants.MAX_CSV_FIELD_CHARS)}""x"`), /field exceeds/);
assert.throws(() => parseCsv("x".repeat(constants.MAX_CSV_FIELD_CHARS + 1)), /field exceeds/);
assert.throws(() => parseCsv(Array(constants.MAX_CSV_COLUMNS + 1).fill("x").join(",")), /column safety limit/);
assert.throws(() => parseCsv(Array(constants.MAX_CSV_ROWS + 1).fill("x").join("\n")), /row safety limit/);

console.log("CSV security boundary tests passed.");
