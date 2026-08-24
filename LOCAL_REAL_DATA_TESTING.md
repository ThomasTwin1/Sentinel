# Local Data-Handling Warning

Sentinel's public GitHub repository and GitHub Pages site are for source code and fictional test data only. Real facility schedules, inspection exports, names, contact information, CUI, credentials, and other operational data must never be committed, attached to an issue, pasted into a pull request, or uploaded to GitHub.

## Written approval is required

The repository owner or application developer cannot independently authorize operational data in Sentinel. Before using anything except fictional data, obtain written direction covering the exact data, device, browser, hosting location, users, workflow, retention, exports, and incident-reporting path from the information owner and appropriate security office.

Version 0.8.1 is a no-sign-in session test edition. It automatically loads synthetic records and exposes bounded CSV controls for fictional or approved sanitized testing. Selected files are parsed in the current browser tab; the resulting records are not written to Sentinel browser persistence and are cleared by Reset Demo, refresh, or closing the tab. Encrypted backup/restore remains unavailable. There is no supported operational-data workflow in this public release; use an approved environment and separately reviewed architecture for any future operational evaluation. Review [INTERIM_SECURITY.md](INTERIM_SECURITY.md) for the complete limitations.

The original imported CSV, exported CSVs, printouts, PDFs, screenshots, and clipboard contents remain outside the encrypted vault and must be protected separately.

The Team Completion Board is a fictional demonstration. It does not ingest an alert roster, roster image, personnel file, or operational FPAR export. Do not send those records to personal email, upload them to GitHub, or provide them to an external model. Any future operational matching workflow requires a separately approved architecture and boundary.

## Public testing

Use only the included files whose names begin with `Sentinel_Fictional_`. The repository `.gitignore` blocks CSV, JSON, spreadsheet, PDF, and known export folders by default, with narrow exceptions for these fictional fixtures.

## Before any commit

Run:

```bash
git status --short
git diff --cached --name-only
```

Confirm that every CSV is an approved fictional fixture and that no real installation, facility, inspector, survey, or schedule data appears anywhere in the staged changes.
