# Local Real-Data Testing

Sentinel's public GitHub repository and GitHub Pages site are for source code and fictional test data only. Real facility schedules, inspection exports, names, contact information, CUI, credentials, and other operational data must never be committed, attached to an issue, pasted into a pull request, or uploaded to GitHub.

## Authorized local workflow

1. Download or clone Sentinel onto an authorized, organization-managed device.
2. Keep operational CSV files outside the repository folder.
3. Open `index.html` locally in Microsoft Edge, Chrome, or Firefox.
4. Use **Import FPAR CSV**, **Import MILSANS CSV**, or **Import Inaccessible CSV** to select the local export.
5. Validate counts, due dates, filters, and facility matches without taking screenshots that expose operational data.
6. When testing is complete, export an authorized backup only if required, then clear Sentinel site data from the browser and securely remove unneeded downloads.

CSV imports are processed in the browser. The application has no backend and does not transmit imported records, but the records persist in browser local storage and may appear in CSV/JSON downloads. Treat the device, browser profile, screenshots, printouts, and exports as sensitive.

## Public testing

Use only the included files whose names begin with `Sentinel_Fictional_`. The repository `.gitignore` blocks CSV, JSON, spreadsheet, PDF, and known export folders by default, with narrow exceptions for these fictional fixtures.

## Before any commit

Run:

```bash
git status --short
git diff --cached --name-only
```

Confirm that every CSV is an approved fictional fixture and that no real installation, facility, inspector, survey, or schedule data appears anywhere in the staged changes.
