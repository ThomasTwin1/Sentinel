const assert = require("node:assert/strict");
const { webcrypto } = require("node:crypto");
const { SentinelVault, constants } = require("./secure-vault.js");

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

async function expectReject(promise, pattern) {
  try {
    await promise;
    assert.fail("Expected operation to reject.");
  } catch (error) {
    assert.match(error.message, pattern);
  }
}

async function run() {
  const storage = new MemoryStorage();
  const passphrase = "correct horse battery staple";
  const original = {
    facilities: [{ id: "fictional-1", name: "Fictional Test Facility" }],
    customHolidays: [],
    milsansInspections: [],
    audit: []
  };

  const vault = new SentinelVault({ storage, crypto: webcrypto });
  await expectReject(vault.create("too short", original), /at least 14 characters/);
  await vault.create(passphrase, original);

  const rawFirstSave = storage.getItem(constants.VAULT_KEY);
  assert.ok(rawFirstSave, "vault should be persisted");
  assert.equal(rawFirstSave.includes("Fictional Test Facility"), false, "plaintext record must not appear in storage");

  const firstEnvelope = JSON.parse(rawFirstSave);
  assert.equal(firstEnvelope.cipher.name, "AES-GCM");
  assert.equal(firstEnvelope.kdf.name, "PBKDF2");
  assert.equal(firstEnvelope.kdf.iterations, 310000);

  const updated = { ...original, facilities: [...original.facilities, { id: "fictional-2", name: "Synthetic Cafe" }] };
  await vault.save(updated);
  const secondEnvelope = JSON.parse(storage.getItem(constants.VAULT_KEY));
  assert.notEqual(firstEnvelope.cipher.iv, secondEnvelope.cipher.iv, "every save must use a fresh AES-GCM IV");

  vault.lock();
  assert.equal(vault.isUnlocked(), false);
  await expectReject(vault.unlock("incorrect passphrase value"), /incorrect|altered/);
  assert.equal(vault.isUnlocked(), false);
  assert.deepEqual(await vault.unlock(passphrase), updated);

  const backup = vault.exportEnvelope();
  assert.equal(JSON.stringify(backup).includes("Synthetic Cafe"), false, "encrypted backup must contain no plaintext record");
  const currentRaw = storage.getItem(constants.VAULT_KEY);
  assert.deepEqual(await vault.decryptBackup(passphrase, backup), updated, "backup verification should decrypt without importing");
  await expectReject(vault.decryptBackup("incorrect passphrase value", backup), /incorrect|altered/);
  assert.equal(storage.getItem(constants.VAULT_KEY), currentRaw, "wrong-passphrase verification must not alter the current vault");
  assert.equal(vault.isUnlocked(), true, "non-mutating backup verification must not lock the active vault");

  const corruptedBackup = JSON.parse(JSON.stringify(backup));
  corruptedBackup.envelope.ciphertext = `${corruptedBackup.envelope.ciphertext.slice(0, -2)}AA`;
  await expectReject(vault.decryptBackup(passphrase, corruptedBackup), /incorrect|altered/);
  assert.equal(storage.getItem(constants.VAULT_KEY), currentRaw, "corrupted backup verification must not alter the current vault");

  const restoredStorage = new MemoryStorage();
  const restoredVault = new SentinelVault({ storage: restoredStorage, crypto: webcrypto });
  restoredVault.importEnvelope(backup);
  assert.deepEqual(await restoredVault.unlock(passphrase), updated);

  const tampered = JSON.parse(restoredStorage.getItem(constants.VAULT_KEY));
  tampered.ciphertext = `${tampered.ciphertext.slice(0, -2)}AA`;
  restoredStorage.setItem(constants.VAULT_KEY, JSON.stringify(tampered));
  restoredVault.lock();
  await expectReject(restoredVault.unlock(passphrase), /incorrect|altered/);

  console.log("Secure vault tests passed.");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
