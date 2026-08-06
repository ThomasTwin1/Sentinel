# Local Data-Handling Warning

Sentinel's public GitHub repository and GitHub Pages site are for source code and fictional test data only. Real facility schedules, inspection exports, names, contact information, CUI, credentials, and other operational data must never be committed, attached to an issue, pasted into a pull request, or uploaded to GitHub.

## Written approval is required

The repository owner or application developer cannot independently authorize operational data in Sentinel. Before using anything except fictional data, obtain written direction covering the exact data, device, browser, hosting location, users, workflow, retention, exports, and incident-reporting path from the information owner and appropriate security office.

Version 0.6.1 encrypts application records before browser persistence and adds stricter validation, fail-closed lifecycle handling, and compatibility with common bounded CSV quote variations. This improves protection at rest but does not provide CAC/PIV, central permissions, enterprise audit, approved hosting, managed-device enforcement, or an authorization to operate. Review [INTERIM_SECURITY.md](INTERIM_SECURITY.md) for the complete limitations.

The original imported CSV, exported CSVs, printouts, PDFs, screenshots, and clipboard contents remain outside the encrypted vault and must be protected separately.

## Public testing

Use only the included files whose names begin with `Sentinel_Fictional_`. The repository `.gitignore` blocks CSV, JSON, spreadsheet, PDF, and known export folders by default, with narrow exceptions for these fictional fixtures.

## Before any commit

Run:

```bash
git status --short
git diff --cached --name-only
```

Confirm that every CSV is an approved fictional fixture and that no real installation, facility, inspector, survey, or schedule data appears anywhere in the staged changes.
