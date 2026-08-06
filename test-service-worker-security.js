"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

async function run() {
  const listeners = {};
  const deleted = [];
  const navigated = [];
  let claimed = false;
  const cachePuts = [];
  const currentCache = "sentinel-tracker-v0.6.2-clickable-dfac-grades";
  const caches = {
    async keys() { return ["unrelated-app-cache", "sentinel-tracker-v0.5.1-secure", currentCache]; },
    async delete(key) { deleted.push(key); return true; },
    async open() { return { addAll: async () => {}, put: async (request, response) => cachePuts.push([request, response]) }; },
    async match() { return { cached: true }; }
  };
  const self = {
    location: { origin: "https://example.test", href: "https://example.test/service-worker.js" },
    addEventListener(type, handler) { listeners[type] = handler; },
    skipWaiting() {},
    clients: {
      async claim() { claimed = true; },
      async matchAll() { return [{ url: "https://example.test/", async navigate(url) { navigated.push(url); } }]; }
    }
  };
  const context = {
    self,
    caches,
    URL,
    fetch: async () => ({ ok: true, type: "basic", clone() { return { cloned: true }; } }),
    Error,
    Promise,
    Set
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("service-worker.js", "utf8"), context);

  let activatePromise;
  listeners.activate({ waitUntil(promise) { activatePromise = promise; } });
  await activatePromise;
  assert.deepEqual(deleted, ["sentinel-tracker-v0.5.1-secure"], "activation must not delete unrelated origin caches");
  assert.equal(claimed, true);
  assert.deepEqual(navigated, ["https://example.test/"], "a prior Sentinel cache should trigger one controlled client refresh");

  let responsePromise;
  const waitPromises = [];
  const request = { method: "GET", url: "https://example.test/app.js", mode: "same-origin" };
  listeners.fetch({
    request,
    respondWith(promise) { responsePromise = promise; },
    waitUntil(promise) { waitPromises.push(promise); }
  });
  const response = await responsePromise;
  await Promise.all(waitPromises);
  assert.equal(response.ok, true);
  assert.equal(cachePuts.length, 1, "successful same-origin shell responses should refresh the current cache");

  let ignored = false;
  listeners.fetch({
    request: { method: "GET", url: "https://other.test/app.js", mode: "same-origin" },
    respondWith() { ignored = true; },
    waitUntil() {}
  });
  assert.equal(ignored, false, "cross-origin requests must not be intercepted");

  console.log("Service-worker security tests passed.");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
