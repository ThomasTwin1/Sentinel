# Sentinel Upcoming Food Inspection Tracker v0.1

A dependency-free browser prototype for validating Sentinel's first MVP feature: showing how many days remain before food inspections become overdue.

## What this prototype does

- Adds and edits fictional facility records.
- Supports Daily, Weekly, Monthly, Quarterly, Biannual, and Annual frequencies.
- Calculates due dates from the date the inspection was conducted.
- Uses calendar months for Monthly, Quarterly, Biannual, and Annual requirements.
- Excludes weekends, U.S. federal holidays, and custom non-duty days from Daily calculations.
- Shows business days remaining or overdue for Daily requirements.
- Shows calendar days remaining or overdue for all other frequencies.
- Applies frequency-based Due Soon thresholds.
- Searches and filters the tracker.
- Warns about possible duplicate facility names on the same installation.
- Saves data in browser local storage.
- Exports CSV and JSON backups.
- Restores JSON backups.
- Includes a test-date override for user acceptance testing.

## Run it on Windows

1. Unzip the folder.
2. Open `index.html` in Microsoft Edge, Chrome, or Firefox.
3. Select **Load Demo Data** for fictional examples, or create your own sanitized test records.

No installation, server, or internet connection is required.

## Important security limitation

This is a local portfolio prototype, not an approved Army information system. Do not enter:

- CUI
- PII
- Real inspection records
- Real POC information
- Credentials
- Operationally sensitive information

Use fictional or sanitized data only.

## Current assumptions to test

- One active inspection frequency per facility.
- Daily means the next business day.
- Daily excludes weekends, federal holidays, and user-entered non-duty days.
- Weekly and longer frequencies use calendar dates.
- Due Soon thresholds:
  - Daily: Due Today
  - Weekly: 2 days
  - Monthly: 7 days
  - Quarterly: 14 days
  - Biannual: 30 days
  - Annual: 60 days
- The conducted date, not the report approval date, drives the next due date.

## Recommended GitHub workflow

1. Create or update the `Build Upcoming Inspection Tracker` issue.
2. Test each scenario in the in-app Test Guide.
3. Create bug issues for incorrect behavior.
4. Record expected result, actual result, reproduction steps, and screenshots.
5. Revise the requirements when testing reveals an operational rule that was missed.
6. After validation, rebuild the feature in the planned React, TypeScript, Spring Boot, and PostgreSQL architecture.

## Prototype architecture

This v0.1 build intentionally uses plain HTML, CSS, and JavaScript so it can be tested immediately without installing development tools. It is a product-validation prototype, not the final Sentinel architecture.
