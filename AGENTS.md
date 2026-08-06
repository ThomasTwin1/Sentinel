# Sentinel engineering rules

## Data boundary

- Use synthetic data only in source control, tests, build logs, screenshots, issues, documentation, and AI prompts.
- Never open, copy, transform, upload, or commit operational CSV files through development tooling.
- Do not add production data, exports, encrypted backups, secrets, credentials, PDFs, spreadsheets, or database copies to the repository.
- The public demonstration is fictional-data-only. Interim encryption does not change that rule.

## Required checks

- Run every `test-*.js` file after relevant changes.
- Treat failed security, secret, data-policy, encryption, or authorization tests as release blockers.
- Inspect staged files before commit and confirm only intentional source, documentation, and synthetic fixtures are present.

## Security invariants

- Application records must be encrypted before browser persistence.
- Never restore plaintext `localStorage` state writing.
- Never store passphrases, derived keys, bearer tokens, or decrypted backups.
- Use Web Crypto primitives through `secure-vault.js`; do not implement custom encryption algorithms.
- Use a fresh AES-GCM IV on every encrypted save.
- Locking must release the in-memory key and clear rendered record data.
- Plaintext output paths must provide a clear exposure warning.
- File imports must remain size-, row-, column-, type-, and field-bounded.
- Do not log raw CSV rows, secrets, passphrases, or record contents.

## Change control

- Encryption-format, KDF, storage, import/export, service-worker, and Content Security Policy changes require focused security tests and review.
- Preserve the ability to restore older supported encrypted backups or document a tested migration.
- Do not publish, deploy, merge, or change repository visibility unless the user explicitly requests that external action.
- Do not claim Army approval, an ATO, FIPS validation, CAC/PIV support, or enterprise permissions for the interim edition.

## Automation

- Automated agents are advisory and use synthetic data.
- Agents do not approve releases, grant access, delete records, disable controls, or transmit operational data.
- External model use with operational data is prohibited until separately authorized inside the approved boundary.

## Documentation

- Update `INTERIM_SECURITY.md`, the threat limitations, tests, and operating instructions when security behavior changes.
- Clearly distinguish interim local protection from the planned authorized operational architecture.
