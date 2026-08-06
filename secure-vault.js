(() => {
  "use strict";

  const VAULT_KEY = "sentinelEncryptedVaultV1";
  const FORMAT = "sentinel-encrypted-vault";
  const VERSION = 1;
  const ITERATIONS = 310000;
  const MIN_PASSPHRASE_LENGTH = 14;
  const MAX_PLAINTEXT_BYTES = 3_500_000;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8", { fatal: true });

  function toBase64(bytes) {
    if (typeof btoa === "function") {
      let binary = "";
      bytes.forEach(byte => { binary += String.fromCharCode(byte); });
      return btoa(binary);
    }
    return Buffer.from(bytes).toString("base64");
  }

  function fromBase64(value) {
    if (typeof atob === "function") {
      const binary = atob(value);
      return Uint8Array.from(binary, char => char.charCodeAt(0));
    }
    return new Uint8Array(Buffer.from(value, "base64"));
  }

  function validatePassphrase(passphrase) {
    if (typeof passphrase !== "string" || passphrase.length < MIN_PASSPHRASE_LENGTH) {
      throw new Error(`Passphrase must contain at least ${MIN_PASSPHRASE_LENGTH} characters.`);
    }
  }

  function validateEnvelope(envelope) {
    const valid = envelope
      && envelope.format === FORMAT
      && envelope.version === VERSION
      && envelope.kdf?.name === "PBKDF2"
      && envelope.kdf?.hash === "SHA-256"
      && envelope.kdf?.iterations === ITERATIONS
      && typeof envelope.kdf?.salt === "string"
      && envelope.cipher?.name === "AES-GCM"
      && envelope.cipher?.length === 256
      && typeof envelope.cipher?.iv === "string"
      && typeof envelope.ciphertext === "string";

    if (!valid) throw new Error("This is not a supported Sentinel encrypted vault.");

    const salt = fromBase64(envelope.kdf.salt);
    const iv = fromBase64(envelope.cipher.iv);
    if (salt.byteLength !== 16 || iv.byteLength !== 12) {
      throw new Error("The encrypted vault metadata is invalid.");
    }
    return envelope;
  }

  async function deriveKey(passphrase, salt, cryptoApi) {
    const keyMaterial = await cryptoApi.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return cryptoApi.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  function aadFor(saltBase64) {
    return encoder.encode(`${FORMAT}|${VERSION}|PBKDF2|SHA-256|${ITERATIONS}|${saltBase64}|AES-GCM|256`);
  }

  async function decryptEnvelope(passphrase, backup, cryptoApi) {
    validatePassphrase(passphrase);
    const envelope = validateEnvelope(backup?.envelope || backup);
    const salt = fromBase64(envelope.kdf.salt);
    const candidateKey = await deriveKey(passphrase, salt, cryptoApi);

    try {
      const plaintext = await cryptoApi.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: fromBase64(envelope.cipher.iv),
          additionalData: aadFor(envelope.kdf.salt),
          tagLength: 128
        },
        candidateKey,
        fromBase64(envelope.ciphertext)
      );
      return { data: JSON.parse(decoder.decode(plaintext)), key: candidateKey, saltBase64: envelope.kdf.salt };
    } catch (_error) {
      throw new Error("Passphrase is incorrect or the encrypted vault has been altered.");
    }
  }

  class SentinelVault {
    constructor(options = {}) {
      this.storage = options.storage || globalThis.localStorage;
      this.crypto = options.crypto || globalThis.crypto;
      this.storageKey = options.storageKey || VAULT_KEY;
      this.key = null;
      this.saltBase64 = null;

      if (!this.storage || !this.crypto?.subtle || typeof this.crypto.getRandomValues !== "function") {
        throw new Error("This browser does not provide the secure storage features Sentinel requires.");
      }
    }

    hasVault() {
      return Boolean(this.storage.getItem(this.storageKey));
    }

    isUnlocked() {
      return Boolean(this.key);
    }

    async create(passphrase, data) {
      validatePassphrase(passphrase);
      const salt = this.crypto.getRandomValues(new Uint8Array(16));
      this.saltBase64 = toBase64(salt);
      this.key = await deriveKey(passphrase, salt, this.crypto);
      await this.save(data);
      return data;
    }

    async unlock(passphrase) {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) throw new Error("No encrypted Sentinel vault exists on this device.");

      let decrypted;
      try {
        decrypted = await decryptEnvelope(passphrase, JSON.parse(raw), this.crypto);
      } catch (error) {
        this.key = null;
        this.saltBase64 = null;
        throw error;
      }
      this.key = decrypted.key;
      this.saltBase64 = decrypted.saltBase64;
      return decrypted.data;
    }

    async decryptBackup(passphrase, backup) {
      const decrypted = await decryptEnvelope(passphrase, backup, this.crypto);
      return decrypted.data;
    }

    async save(data) {
      if (!this.key || !this.saltBase64) throw new Error("Sentinel is locked.");

      const plaintext = encoder.encode(JSON.stringify(data));
      if (plaintext.byteLength > MAX_PLAINTEXT_BYTES) {
        throw new Error("The encrypted local vault is full. Export an encrypted backup and reduce the local dataset.");
      }

      const iv = this.crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await this.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
          additionalData: aadFor(this.saltBase64),
          tagLength: 128
        },
        this.key,
        plaintext
      );

      const envelope = {
        format: FORMAT,
        version: VERSION,
        kdf: {
          name: "PBKDF2",
          hash: "SHA-256",
          iterations: ITERATIONS,
          salt: this.saltBase64
        },
        cipher: {
          name: "AES-GCM",
          length: 256,
          iv: toBase64(iv)
        },
        ciphertext: toBase64(new Uint8Array(ciphertext)),
        updatedAt: new Date().toISOString()
      };

      this.storage.setItem(this.storageKey, JSON.stringify(envelope));
    }

    exportEnvelope() {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) throw new Error("No encrypted Sentinel vault exists on this device.");
      const envelope = validateEnvelope(JSON.parse(raw));
      return {
        sentinelBackup: true,
        backupVersion: 1,
        exportedAt: new Date().toISOString(),
        envelope
      };
    }

    importEnvelope(backup) {
      const envelope = validateEnvelope(backup?.envelope || backup);
      this.storage.setItem(this.storageKey, JSON.stringify(envelope));
      this.lock();
    }

    lock() {
      this.key = null;
      this.saltBase64 = null;
    }

    deleteVault() {
      this.lock();
      this.storage.removeItem(this.storageKey);
    }
  }

  const api = {
    SentinelVault,
    constants: {
      FORMAT,
      VERSION,
      ITERATIONS,
      MIN_PASSPHRASE_LENGTH,
      MAX_PLAINTEXT_BYTES,
      VAULT_KEY
    },
    validateEnvelope
  };

  globalThis.SentinelVault = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
