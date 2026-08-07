# Sentinel v0.7.0 No-Sign-In Test Security Guide

The v0.7.0 hosted/test edition opens without a passphrase or account prompt. It automatically loads fictional records into memory, disables file imports and encrypted-backup controls, and does not save edits. This convenience mode is only for synthetic demonstrations and schedule usability testing.

## What this edition improves

- Removes the sign-in/passphrase gate from the fictional hosted test experience.
- Prevents the no-sign-in session from writing application records to browser persistence.
- Disables CSV imports and backup/restore controls while no-sign-in mode is active.
- Adds a bounded, printable inspection schedule using the same fictional FPAR and MILSANS date rules as the dashboards.
- Retains the encrypted-vault implementation and its tests for future controlled re-enablement; no-sign-in mode does not unlock or use that vault.
- Encrypts saved application state with AES-256-GCM before browser persistence.
- Derives the encryption key from a user passphrase with PBKDF2-HMAC-SHA-256 and a unique random salt.
- Uses a new random 96-bit AES-GCM IV for every save and authenticates the vault metadata.
- Keeps the derived key in memory only while Sentinel is unlocked.
- Clears rendered records and releases the in-memory key when locked.
- Locks immediately when the page moves to the background and places an opaque privacy shield over content before asynchronous cleanup begins.
- Migrates older plaintext Sentinel browser data only after the encrypted write succeeds, then removes the legacy plaintext entry.
- Creates encrypted `.sentinel` backups instead of plaintext JSON backups.
- Limits imported files to 2 MB, 10,000 CSV rows, 64 columns, 2,000 characters per field, and 2,000 imported records.
- Rejects binary/null-byte CSV content and unexpected file extensions. The bounded parser accepts common export variations such as whitespace around quoted values and non-structural quote characters inside unquoted labels, while still rejecting unclosed or structurally ambiguous quoted fields with a line and column location.
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
- No supported real-data workflow in v0.7.0. The absence of sign-in is not authorization to enter or import operational information.

Do not use this edition for CUI, PII, classified information, or operational records unless the appropriate information owner and security office provide written approval for the exact device, hosting location, data, and workflow.

## Safe setup

1. Use a current Microsoft Edge, Chrome, Firefox, or Safari browser.
2. Run Sentinel from `https://` or `localhost`.
3. Confirm the header says **No sign-in • fictional data** and CSV import controls are unavailable.
4. Use only the automatically loaded fictional scenario. Do not enter, paste, import, or photograph operational data.
5. Treat printed schedules and saved print-to-PDF files as unencrypted outputs, even when they contain only test data.

For desktop-only development with Python installed:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/` on that same computer. `localhost` is treated as a secure development context by current browsers. Do not expose this development server to a network containing untrusted users.

## Operating rules

- Use **Reset Demo** to discard in-memory edits and restore the fictional scenario.
- Do not re-enable imports or persistence to work around the no-sign-in boundary.
- Treat printed pages, PDFs, screenshots, and clipboard contents as unencrypted.
- Never upload an export, backup, real fixture, or screenshot containing operational data to GitHub.

## Encrypted-vault status

The repository still contains the previously tested encrypted-vault implementation and compatibility tests. Version 0.7.0 does not expose or unlock that vault because sign-in is disabled. Re-enabling the vault or any real-data path requires a separate security review, updated operating instructions, and explicit release approval.

## Verification

Run every included JavaScript test with Node.js 22 or later:

```powershell
Get-ChildItem test-*.js | ForEach-Object { node $_.FullName }
```

Important security checks are in:

- `test-secure-vault.js`: encryption round-trip, wrong-passphrase denial, unique IVs, backup restore, and tamper detection.
- `test-interim-security-policy.js`: CSP, vault integration, output warnings, file limits, and service-worker cache boundaries.
- `test-no-sign-in-schedule.js`: automatic fictional startup, disabled persistence/imports, bounded schedule generation, printing, and mobile layout.
- `test-public-data-policy.js`: prohibited repository data files and fictional-fixture policy.

## Moving to the operational version

Do not expand this client-only design into a shared operational system. The authorized version should replace the local vault as the system of record with an approved backend, CAC/PIV federation, server-side authorization, protected database, centralized audit/SIEM, secure import quarantine, managed devices, and an RMF authorization boundary.
