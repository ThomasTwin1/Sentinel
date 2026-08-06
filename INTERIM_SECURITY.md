# Sentinel v0.6.0 Interim Security Guide

## What this edition improves

- Encrypts saved application state with AES-256-GCM before browser persistence.
- Derives the encryption key from a user passphrase with PBKDF2-HMAC-SHA-256 and a unique random salt.
- Uses a new random 96-bit AES-GCM IV for every save and authenticates the vault metadata.
- Keeps the derived key in memory only while Sentinel is unlocked.
- Clears rendered records and releases the in-memory key when locked.
- Locks immediately when the page moves to the background and places an opaque privacy shield over content before asynchronous cleanup begins.
- Migrates older plaintext Sentinel browser data only after the encrypted write succeeds, then removes the legacy plaintext entry.
- Creates encrypted `.sentinel` backups instead of plaintext JSON backups.
- Limits imported files to 2 MB, 10,000 CSV rows, 64 columns, 2,000 characters per field, and 2,000 imported records.
- Rejects binary/null-byte CSV content and unexpected file extensions.
- Warns before plaintext CSV export or printing and neutralizes common spreadsheet-formula injection prefixes.
- Validates a backup's passphrase and complete versioned state schema before replacing the current encrypted vault; failed verification leaves the previous vault unchanged.
- Adds a restrictive browser Content Security Policy and limits offline caching to the application shell with release-scoped, network-first cache updates.

## What it does not provide

This is an interim local protection layer, not an enterprise security boundary.

- No CAC/PIV or centrally managed identity.
- No server-enforced roles, organization scoping, or permissions.
- No centrally protected or immutable audit trail.
- No approved DoD hosting or authorization to operate.
- No managed-device enforcement, remote wipe, DLP, or enterprise incident response.
- No protection when records are visible on screen, copied, printed, screenshotted, or exported.
- No protection from malicious browser extensions, malware, a compromised device, or malicious changes to the hosted application code.
- No shared or synchronized team database. Each browser profile has a separate vault.
- No passphrase recovery.
- No claim that the browser's cryptographic module is FIPS validated.

Do not use this edition for CUI, PII, classified information, or operational records unless the appropriate information owner and security office provide written approval for the exact device, hosting location, data, and workflow.

## Safe setup

1. Use a current Microsoft Edge, Chrome, Firefox, or Safari browser on an approved, encrypted, managed device.
2. Run Sentinel from `https://` or `localhost`. The application refuses to open when the required Web Crypto features are unavailable.
3. Create a unique passphrase containing at least 14 characters. A long, high-entropy multi-word passphrase is strongly recommended because this local edition cannot centrally throttle offline guessing against a copied vault.
4. Do not reuse an Army, work, email, banking, or personal account password.
5. Store the passphrase separately in an organization-approved password manager. Sentinel cannot recover it.
6. Use fictional data unless written authorization specifically permits other data.

For desktop-only development with Python installed:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/` on that same computer. `localhost` is treated as a secure development context by current browsers. Do not expose this development server to a network containing untrusted users.

## Operating rules

- Lock Sentinel before leaving the device or sharing the screen.
- Do not give teammates a shared passphrase. Each authorized person/device should have its own local vault for this interim edition.
- Create an encrypted backup before browser upgrades, site-data cleanup, or major imports.
- Keep the `.sentinel` backup and its passphrase separate. Anyone with both can decrypt the backup.
- Remember that the original CSV remains wherever it was selected from; Sentinel cannot encrypt or delete that original file.
- Treat exported CSVs, printed pages, PDFs, screenshots, and clipboard contents as unencrypted.
- Never upload an export, backup, real fixture, or screenshot containing operational data to GitHub.
- Clearing browser site data or selecting **Delete encrypted data on this device** removes the local vault. Recovery requires an encrypted backup and its passphrase.

## Backup and recovery

1. Unlock Sentinel.
2. Select **Encrypted Backup**.
3. Store the resulting `.sentinel` file in an approved location.
4. To restore, select **Restore Encrypted Backup** and choose the file.
5. Enter the backup's passphrase. Sentinel decrypts and validates the complete backup before replacing anything, then opens the restored vault only if verification succeeds.

The backup contains the complete encrypted vault and metadata needed for key derivation. It does not contain the passphrase.

## Verification

Run every included JavaScript test with Node.js 22 or later:

```powershell
Get-ChildItem test-*.js | ForEach-Object { node $_.FullName }
```

Important security checks are in:

- `test-secure-vault.js`: encryption round-trip, wrong-passphrase denial, unique IVs, backup restore, and tamper detection.
- `test-interim-security-policy.js`: CSP, vault integration, output warnings, file limits, and service-worker cache boundaries.
- `test-public-data-policy.js`: prohibited repository data files and fictional-fixture policy.

## Moving to the operational version

Do not expand this client-only design into a shared operational system. The authorized version should replace the local vault as the system of record with an approved backend, CAC/PIV federation, server-side authorization, protected database, centralized audit/SIEM, secure import quarantine, managed devices, and an RMF authorization boundary.
