"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");

const context = {
  window: {},
  document: { addEventListener() {} },
  crypto: webcrypto,
  console
};
vm.createContext(context);
vm.runInContext(fs.readFileSync("app.js", "utf8"), context);

const { normalizePersistedState } = context.window.SentinelSecurityLogic;
const empty = { schemaVersion: 1, facilities: [], customHolidays: [], milsansInspections: [], audit: [] };
assert.deepEqual(JSON.parse(JSON.stringify(normalizePersistedState(empty))), empty);

const validFacility = {
  id: "facility-1",
  name: "Fictional Dining Facility",
  buildingNumber: "100",
  installation: "Example Installation",
  agency: "Dining Facility",
  assignedInspector: "Synthetic Inspector",
  frequency: "QUARTERLY",
  lastConductedDate: "2026-07-01",
  active: true,
  inaccessible: false,
  inaccessibilityReason: "",
  inaccessibilityDate: null,
  createdAt: "2026-07-01T12:00:00.000Z",
  updatedAt: "2026-07-01T12:00:00.000Z"
};

assert.doesNotThrow(() => normalizePersistedState({ ...empty, facilities: [validFacility] }));
assert.throws(
  () => normalizePersistedState({ ...empty, facilities: [validFacility, { ...validFacility }] }),
  /duplicate facility ID/
);
assert.throws(
  () => normalizePersistedState({ ...empty, facilities: [{ ...validFacility, active: "true" }] }),
  /must be true or false/
);
assert.throws(
  () => normalizePersistedState({ ...empty, facilities: [{ ...validFacility, name: "x".repeat(121) }] }),
  /120-character limit/
);
assert.throws(
  () => normalizePersistedState({ ...empty, audit: [{ id: "event-1", action: "TEST", entityId: "facility-1" }] }),
  /Audit timestamp is required/
);
assert.throws(() => normalizePersistedState({ ...empty, schemaVersion: 99 }), /Unsupported Sentinel data version/);

console.log("Persisted-state schema security tests passed.");
