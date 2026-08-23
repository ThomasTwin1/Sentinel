# Sentinel v0.8.0 No-Sign-In Session Test Security Guide

The v0.8.0 hosted/test edition opens without a passphrase or account prompt. It automatically loads fictional records into memory, adds a session-only Operations Hub, and exposes bounded FPAR, MILSANS, and inaccessible-facility CSV controls for fictional or approved sanitized testing. Parsed records, Operations Hub records, and edits remain only in the current browser tab and are cleared by Reset Demo, refresh, or closing the tab. Encrypted backup/restore remains disabled.

## What this edition improves

- Removes the sign-in/passphrase gate from the fictional hosted test experience.
- Prevents the no-sign-in session from writing application records to browser persistence.
- Enables the three bounded CSV import paths in no-sign-in mode while keeping backup/restore controls disabled.
- Requires an explicit session-only warning before reading a selected CSV.
- Adds a bounded, printable inspection schedule using the same fictional FPAR and MILSANS date rules as the dashboards.
- Adds a session-only Operations Hub for synthetic deficiency follow-through, pending work orders, inspector workload folders, extension-request metadata, equipment sign-out, and FPAR alerts.
- Provides fictional test personas for demonstrating inspector-specific views. Persona switching is not authentication, authorization, identity proofing, access control, or auditing.
- Records only an entered extension-request reference filename as display metadata. Sentinel does not read, retain, transmit, or upload attachment contents.
- Provides a deterministic local keyword helper whose results cite a fixed set of regulation links. It does not send prompts or records to an external AI model, API, search service, or reference source.
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
- No real user accounts or access control. The Operations Hub's test personas only filter fictional workload views.
- No uploaded or retained extension-request attachments. A displayed filename does not prove that a document was reviewed, stored, or approved.
- No external AI reference service. Local helper results are limited to the fixed prototype index and are not authoritative legal, regulatory, medical, or command guidance.
- No supported operational-data workflow in v0.8.0. The presence of CSV buttons, persona controls, or absence of sign-in are not authorization to enter or import operational information.

Do not use this edition for CUI, PII, classified information, or operational records unless the appropriate information owner and security office provide written approval for the exact device, hosting location, data, and workflow.

## Safe setup

1. Use a current Microsoft Edge, Chrome, Firefox, or Safari browser.
2. Run Sentinel from `https://` or `localhost`.
3. Confirm the header says **No sign-in • fictional data** and the three CSV import controls are available.
4. Use only the automatically loaded scenario, repository fictional fixtures, or separately approved sanitized test data. Use the Operations Hub only with its built-in synthetic personas, names, facilities, deficiencies, work orders, extension requests, and sign-out records. Do not enter, paste, import, or photograph operational data.
5. Treat the Operations Hub persona control as a demonstration filter only. It does not sign a user in or restrict what another person using the same tab can see or change.
6. Treat printed schedules and saved print-to-PDF files as unencrypted outputs, even when they contain only test data.

For desktop-only development with Python installed:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/` on that same computer. `localhost` is treated as a secure development context by current browsers. Do not expose this development server to a network containing untrusted users.

## Operating rules

- Use **Reset Demo** to discard in-memory imports and edits and restore the fictional scenario.
- Refreshing or closing the tab also discards Operations Hub changes, including resolved deficiencies, work-order status changes, inspector assignments, extension-request filename metadata, and equipment sign-outs.
- Do not enter real names, work-order identifiers, deficiency details, extension-request filenames, facility assignments, or sign-out information into the Operations Hub.
- Do not treat a test persona as identity verification or rely on it to separate one user's data from another user's data.
- The extension-request control records entered filename metadata only. Do not enter the name of a real operational document, and do not treat the displayed name as a stored attachment.
- The reference helper performs local keyword matching and cites fixed links; it is not an external AI service. Verify every reference and decision against the current authoritative source and applicable command guidance.
- Treat every CSV selected through the import buttons as plaintext outside Sentinel's control; the original file is not protected by this application.
- Do not re-enable persistence or encrypted backup/restore to work around the no-sign-in boundary.
- Treat printed pages, PDFs, screenshots, and clipboard contents as unencrypted.
- Never upload an export, backup, real fixture, or screenshot containing operational data to GitHub.

## Encrypted-vault status

The repository still contains the previously tested encrypted-vault implementation and compatibility tests. Version 0.8.0 does not expose or unlock that vault because sign-in is disabled. Re-enabling the vault, real accounts, permissions, attachment storage, an external AI service, or an operational-data path requires a separate security review, updated operating instructions, and explicit release approval.

## Verification

Run every included JavaScript test with Node.js 22 or later:

```powershell
Get-ChildItem test-*.js | ForEach-Object { node $_.FullName }
```

Important security checks are in:

- `test-secure-vault.js`: encryption round-trip, wrong-passphrase denial, unique IVs, backup restore, and tamper detection.
- `test-interim-security-policy.js`: CSP, vault integration, output warnings, file limits, and service-worker cache boundaries.
- `test-no-sign-in-schedule.js`: automatic fictional startup, disabled persistence/backups, enabled bounded session imports, exposed print/demo controls, schedule generation, printing, and mobile layout.
- `test-public-data-policy.js`: prohibited repository data files and fictional-fixture policy.

## Moving to the operational version

Do not expand this client-only design into a shared operational system. The authorized version should replace the local vault as the system of record with an approved backend, CAC/PIV federation, server-side authorization, protected database, centralized audit/SIEM, secure import quarantine, managed devices, and an RMF authorization boundary.
