# Sentinel Facility Due-Date Tracker v0.2.1

A dependency-free browser prototype for validating Sentinel's first MVP feature: showing which food facilities are overdue, due today, due soon, or upcoming.

## Working criteria in v0.2

- **Last Inspected** uses the latest inspection date listed for each facility.
- Workflow status does not affect the countdown; Draft, Submitted, and Accepted rows are treated the same for date selection.
- **Weekly** requirements are due 7 calendar days after Last Inspected.
- **Monthly** requirements are due 1 calendar month after Last Inspected.
- **Quarterly** requirements are due 3 calendar months after Last Inspected.
- **Days to Due** uses one signed number:
  - Negative = overdue
  - 0 = due today
  - Positive = days remaining
- Due Soon warning windows:
  - Weekly: 1–2 days
  - Monthly: 1–7 days
  - Quarterly: 1–14 days
- Dashboard sorting options:
  - Urgency — most overdue first
  - Building number — lowest first
  - Facility name — A to Z
- Saved Facilities are arranged by building number.

## CSV import

The **Import Inspection CSV** button accepts a VSIMS/FPAR-style CSV export.

The importer:

- Locates the header row automatically.
- Reads Installation, Agency, Facility, and Date.
- Uses the latest dated row for each facility, regardless of workflow status.
- Does not use workflow status to determine what is coming due.
- Does not store Prepared By or Reviewed By names.
- Applies the current working frequency mapping:
  - Dining Facility, DFAC, SSMO, Army Troop Feeding, and Hospital Commander = Weekly
  - Mobile food trucks = Quarterly
  - All other imported facilities = Monthly

## Security limitation

This repository is public and the GitHub Pages application is not an approved Army information system.

Do not upload real facility schedules, CUI, PII, names, credentials, or operational data to the repository. Use the included fictional CSV for public testing. Operational exports should remain local and should only be used in an authorized environment.

## Run locally

1. Download or clone the repository.
2. Open `index.html` in Microsoft Edge, Chrome, or Firefox.
3. Load fictional demo data or import `sentinel-sanitized-import-demo.csv`.
4. Confirm due dates, signed Days to Due, colors, sorting, and filters.

## Test

Run:

```bash
node test-date-logic.js
```

The tests cover monthly month-end behavior, weekly and quarterly calculations, signed overdue values, federal holidays, and imported frequency mapping.

## Architecture

This v0.2 build intentionally uses plain HTML, CSS, and JavaScript for rapid workflow validation. Data remains in browser local storage. Shared team access still requires a secure backend, authentication, permissions, and an approved hosting environment.
