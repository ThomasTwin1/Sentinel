const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const worker = fs.readFileSync("service-worker.js", "utf8");
const vault = fs.readFileSync("secure-vault.js", "utf8");

assert.match(html, /Content-Security-Policy/);
assert.match(html, /csv-security\.js[\s\S]*secure-vault\.js[\s\S]*app\.js/, "security modules must load before application code");
assert.match(html, /Do not use it for CUI, PII, classified, or operational records without written approval/);
assert.doesNotMatch(app, /localStorage\.setItem\s*\(\s*LEGACY_STORAGE_KEY/, "legacy state must never be written as plaintext");
assert.match(app, /vault\.save\(snapshot\)/, "application state must be stored through the encrypted vault");
assert.match(app, /confirmPlaintextOutput/, "plaintext output paths must display a warning");
assert.match(app, /MAX_IMPORT_BYTES/);
assert.match(worker, /requestUrl\.origin !== self\.location\.origin/);
assert.match(worker, /allowedPaths/);
assert.match(worker, /key\.startsWith\(CACHE_PREFIX\)/, "activation must only remove Sentinel-owned caches");
assert.match(worker, /response\.ok && response\.type === "basic"/, "only successful same-origin shell responses may be cached");
assert.match(vault, /AES-GCM/);
assert.match(vault, /PBKDF2/);
assert.match(vault, /additionalData/);

console.log("Interim security policy tests passed.");
