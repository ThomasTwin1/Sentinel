# Sentinel Facility Due-Date Tracker v0.8.0 No-Sign-In Session Test Edition

A dependency-free browser prototype for validating Sentinel inspection planning and session-only workflow concepts. Version 0.8.0 opens directly into a fictional, memory-only scenario with no sign-in prompt; provides bounded CSV imports for current-tab testing; includes a combined printable schedule for recurring FPAR requirements and next MILSANS actions; and adds a synthetic Operations Hub. Imported and edited records are not persisted. Review [INTERIM_SECURITY.md](INTERIM_SECURITY.md) before use.

## Working criteria in v0.8.0

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
- On iPhone portrait screens, each facility is displayed as a mobile card with **Days to Due**, **Status**, **Last Inspected**, and **Due Date** placed beside the facility first.
- Dashboard summary cards are clickable. Tapping **Active**, **Overdue**, **Due Today**, **Due Soon**, or **Upcoming** filters the inspection table and automatically positions the first matching facility at the top of the screen. Tapping the selected status again clears that filter.
- **Print Facility Cards** prints the currently filtered inspection cards as a clean two-column Letter-size handout. On iPhone, open the print preview, expand the preview with two fingers, and save or share the resulting PDF.

## CSV import

The **Import FPAR CSV** button accepts a VSIMS/FPAR-style CSV export. **Import MILSANS CSV** and **Import Inaccessible CSV** support their corresponding bounded formats. In no-sign-in mode, every import requires confirmation and the resulting records remain in memory only for the current browser tab.

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

The interim encrypted edition is still not authorization for real-data use. Obtain written direction from the information owner and security office before any operational evaluation. Do not import real operational data into the public GitHub Pages copy.

## Run locally

1. Download or clone the repository.
2. Serve the folder over `localhost` and open it in Microsoft Edge, Chrome, or Firefox.
3. Sentinel opens the fictional scenario automatically; no sign-in is required.
4. Confirm due dates, signed Days to Due, colors, sorting, filters, and the Inspection Schedule.

## Test

Run:

```bash
node test-date-logic.js
```

The tests cover monthly month-end behavior, weekly and quarterly calculations, signed overdue values, federal holidays, and imported frequency mapping.

## Architecture

This v0.8.0 build intentionally uses plain HTML, CSS, and JavaScript for rapid workflow validation. The hosted test edition loads fictional records into memory and can replace inspection records with a bounded, user-selected CSV for the current tab, but it does not persist records. Operations Hub personas and records are synthetic and session-only. The encrypted-vault implementation remains in the codebase for future controlled re-enablement, but the no-sign-in experience does not unlock or use a vault. Shared operational access still requires a secure backend, CAC/PIV-backed authentication, server-side permissions, enterprise audit, and an approved hosting environment.

- v0.2.7 fixes the iPhone **Print Facility Cards** button so it correctly opens Safari's print sheet from the local Sentinel build.

## Inaccessible Facility Tracking

- Import the normal inspection CSV first.
- Use **Import Inaccessible CSV** for an export containing Installation, Agency, Facility, Inaccessibility reason, and Inaccessibility Date.
- Sentinel matches each inaccessible record to an existing facility.
- The facility keeps its regular Overdue, Due Today, Due Soon, or Upcoming status.
- A separate **Inaccessible** badge, reason, and date are shown on the dashboard, printed facility cards, saved facility list, and exported CSV.
- Use the Accessibility filter to show only inaccessible or accessible facilities.
- Re-importing the inspection CSV preserves accessibility information when the facility and installation names still match.

## Interactive Dashboard and Due Status Key

- The dashboard now includes a sixth purple **Inaccessible** card with the number of active facilities currently marked inaccessible.
- Tapping **Active**, **Overdue**, **Due Today**, **Due Soon**, **Upcoming**, or **Inaccessible** filters the records and scrolls the first matching facility to the top of the screen.
- Every item in the **Due Status Key** is now interactive and performs the same filter-and-scroll action.
- Selecting a due-status shortcut clears the accessibility filter; selecting **Inaccessible** clears the due-status filter so all inaccessible facilities appear regardless of red, orange, yellow, or green status.
- Tapping the currently selected shortcut again clears that shortcut.


## MILSANS Inspection Rating Cards

The **MILSANS Results** tab adds six interactive cards:

- Rated Facilities
- Fully Compliant
- Substantially Compliant
- Partially Compliant
- Non-Compliant
- Follow-Up Required

The tab uses the latest **completed** inspection for each installation-and-facility combination. An in-progress survey does not replace a completed rating.

### Supported MILSANS CSV fields

Required:
- Facility
- Inspection Date
- Overall Inspection Rating

Recommended:
- Survey ID
- Installation
- Survey Status
- Imminent Health Hazard
- Critical Violations
- Critical COS
- Non-Critical Violations
- Non-Critical COS
- Follow-Up Required
- Follow-Up Date

Tapping a card filters the MILSANS results table and scrolls the first matching facility to the top. JSON backup and restore include MILSANS records.


## TSFC Letter-Grade Equivalents

Sentinel displays the Table 8-4 letter-grade equivalent next to the official MILSANS compliance rating:

- Fully Compliant = A
- Substantially Compliant = B
- Partially Compliant = C
- Noncompliant = F

There is no D grade in Table 8-4.

Sentinel labels these as **TSFC letter-grade equivalents** because official implementation of a letter-grading system requires a formal policy from the regulatory authority. The compliance rating remains displayed with the grade.


## Combined FPAR and MILSANS Dashboard

The Dashboard now has a **Dashboard data** selector:

- FPAR and MILSANS
- FPAR only
- MILSANS only

The MILSANS panel tracks the next required action. An imported required follow-up date takes priority over the routine due date. If no explicit due date is imported, Sentinel calculates it from the latest completed inspection and inspection frequency.

Supported MILSANS schedule fields include:

- Building Number
- Inspection Frequency
- Routine Due Date
- Next Action Due Date
- Scheduled Month
- Due Date Basis
- Record Type

Schedule-only rows are allowed when a facility has a due date but no completed report in the imported set. These rows appear in the MILSANS due dashboard as **Not Rated** and do not appear as completed ratings in the detailed MILSANS Results table.


## MILSANS Inspector and Deadline Tracking

- Imports and displays the DOEHRS **Surveyor / Inspector** separately from the person who created the DOEHRS record.
- When the Surveyor field is blank, Sentinel displays **Not listed in DOEHRS survey field** rather than assuming the record creator performed the inspection.
- Adds inspector filters to the combined MILSANS dashboard and the MILSANS Results tab.
- MILSANS management cards are labeled **Missed**, **Due Today**, **Coming Soon**, and **Upcoming**.
- The local scheduled-month deadline is the last calendar day of the assigned month.
- Next Action Due is the earliest applicable date among:
  1. Required follow-up date,
  2. Regulatory interval deadline based on the latest completed inspection, and
  3. Local scheduled-month deadline.
- The 7-day monthly and 14-day quarterly Coming Soon windows are Sentinel management alerts, not deadlines stated by the Tri-Service Food Code.


## v0.4.2 MILSANS Dashboard and Printing Fixes

- Corrects the dashboard structure so imported MILSANS records appear when **MILSANS only** is selected.
- Adds separate **Import FPAR CSV** and **Import MILSANS CSV** controls at the top.
- Adds top-level **Export FPAR CSV** and **Export MILSANS CSV** controls.
- Routine MILSANS action dates use the last day of the locally scheduled month.
- A required follow-up date still takes priority over the routine month-end action date.
- Adds **Coming up due — future action dates first** sorting.
- Adds an Action Status filter to the MILSANS Results tab.
- Makes every Inspection Rating Key item clickable.
- **Print Current View** now prints:
  - FPAR cards,
  - MILSANS due cards,
  - detailed MILSANS Results, or
  - both FPAR and MILSANS dashboard sections.


## v0.4.3 MILSANS Interval Status and Month Filter

- Removes the visible Next Action Due and Regulatory Due columns.
- A required follow-up date still takes priority when one exists.
- Otherwise, Missed/Due Today/Coming Soon/Upcoming is based on the latest completed inspection:
  - Monthly: plus one calendar month.
  - Quarterly: plus three calendar months.
- Adds a dynamic Coming Due Month filter to both the Dashboard and MILSANS Results.
- Adds Scheduled Month sorting.
- The scheduled month is a local planning field and does not reset an overdue monthly or quarterly interval.
- Exported MILSANS CSV files contain Scheduled Month, Days to Due, and Due Status without exact routine/action due-date columns.


## v0.4.4 Action Date and Reliable Printing
- Restores Action Date. Follow-up date takes priority; otherwise it is the last day of the scheduled month.
- Status remains based on the required monthly or quarterly interval.
- Adds separate Print FPAR Cards and Print MILSANS Cards buttons.
- Fixes the missing printTitle element reference that prevented iPhone Safari from opening the print sheet.


## v0.4.5 Scheduled Date and Missed Month

- Routine MILSANS Scheduled Date is the 25th of the locally scheduled month.
- A documented required follow-up date continues to take priority.
- Cards display Last Inspected, Scheduled Date, and Missed Month.
- Missed Month is based on the monthly or quarterly interval that expired.
- Fixes malformed duplicate mobile CSS that caused Scheduled Month and Follow-Up text to overlap.
- Keeps separate Print FPAR Cards and Print MILSANS Cards controls.


## v0.4.6 Separate Dashboards and Clean MILSANS Cards

- FPAR Dashboard and MILSANS Dashboard are separate tabs.
- MILSANS Results remains a separate detailed-history tab.
- Routine MILSANS required dates are the 25th of the month reached by the monthly or quarterly interval.
- Cards show Last Inspection Date, Scheduled Date, and Missed Inspection Date.
- Scheduled Date uses the 25th of the locally scheduled month unless a required follow-up date applies.
- Missed Inspection Date appears only after the required 25th has passed.
- Rebuilt mobile and print grids to prevent Follow-Up, Survey ID, and date labels from overlapping.


## v0.4.7 Missed History and Assigned Team

- MILSANS Dashboard cards now show rating, TSFC grade, Last Inspector, Assigned Team, Days to Due, Due Status, Scheduled Date, Last Inspection Date, all Missed Inspection Dates, Critical, Non-Critical, COS, IHH, and Follow-Up Required.
- Missed Inspection Dates repeat every one month for monthly facilities or every three months for quarterly facilities, always on the 25th.
- The list resets automatically when a newer completed inspection is imported.
- Required follow-up dates are tracked separately and take precedence over routine cycles.
- CSV import/export supports Last Inspector, Assigned Team, Scheduled Date, and Missed Inspection Dates.


## v0.4.8 Scheduled Date and Assigned Team

- Places **Assigned Team** directly beside **Scheduled Date** on MILSANS Dashboard cards.
- Uses the same side-by-side arrangement on printed MILSANS facility cards.
- Last Inspector remains a separate full-width field so users can distinguish who completed the previous inspection from who owns the upcoming inspection.
- Desktop MILSANS tables also place Assigned Team immediately after Scheduled Date.


## v0.4.9 MILSANS Dashboard Cleanup

- Removes the **MILSANS Results** and **Facilities** navigation tabs.
- Moves the **Inspection Rating Key** into the MILSANS Dashboard.
- Makes the rating key filter the visible MILSANS Dashboard cards.
- Places **Last Inspection Date** beside **Last Inspector**.
- Places **Survey ID** in a full-width final row at the bottom of every MILSANS facility card.
- Preserves Scheduled Date beside Assigned Team on screen and in printed cards.


## v0.6.1 Quick Page Navigation

- Adds floating Up and Down arrow buttons to long pages.
- Up returns to the top of the current page.
- Down moves to the bottom of the current page.
- The button for the direction already reached is disabled.
- The controls hide when the page is too short to require scrolling.
- The controls do not appear on printed facility cards.


## v0.6.2 Clickable DFAC Grades

- Makes every letter grade on the DFAC Grade Board a keyboard- and touch-accessible button.
- Opens the matching latest inspection details inside Sentinel and positions that facility at the top of the results.
- Clears conflicting detail filters so the selected DFAC is not accidentally hidden.
- Keeps facility names and locations inside Sentinel instead of sending them to an external mapping or search service.

## v0.6.3 Clickable Grade Summary Filters

- Makes A, B, C, F, and Follow-Up Required summary tiles keyboard- and touch-accessible filters.
- Shows a visible selected state and scrolls to the first matching facility.
- Tapping the selected tile again restores the complete Grade Board.
- Keeps facility-grade buttons available for opening the exact inspection record inside Sentinel.

## v0.7.0 No-Sign-In Printable Inspection Schedule

- Opens the fictional test scenario automatically without a passphrase or account prompt.
- Keeps all dashboard, Grade Board, calendar, test-guide, and schedule tabs available.
- Disables CSV imports, backups, and browser persistence in no-sign-in mode.
- Builds a date-ordered schedule for a selectable window of up to 366 days.
- Expands recurring FPAR requirements and includes each facility's next MILSANS action.
- Filters by FPAR/MILSANS and facility, installation, inspector, or assigned team.
- Prints the exact filtered schedule with an explicit plaintext-output warning.

## v0.7.1 Session-Only Imports and Facility-Card Printing

- Restores the header controls for **Import FPAR CSV**, **Import MILSANS CSV**, and **Import Inaccessible CSV**.
- Restores **Load Demo Data**, **Print FPAR Cards**, and **Print MILSANS Cards** in no-sign-in mode.
- Keeps CSV size, row, column, field, type, and record-count limits in force.
- Requires a session-only data warning before Sentinel reads a selected CSV.
- Keeps imported and edited records in memory only; Reset Demo, refresh, and closing the tab clear them.
- Keeps encrypted backup/restore and browser persistence disabled.
- Warns before every facility-card, Grade Board, or schedule print action because print destinations and PDFs are outside Sentinel's protection.

## v0.8.0 Session-Only Operations Hub

- Adds an **Operations Hub** without removing or changing the existing FPAR, MILSANS, Grade Board, Inspection Schedule, Business Calendar, Test Guide, import, or print workflows.
- Adds fictional **test personas** that switch inspector workload views. They do not create accounts, authenticate a person, enforce permissions, or produce an audit trail.
- Carries open synthetic deficiencies forward until the tester marks them resolved and tracks pending versus completed fictional work orders.
- Groups assigned facilities into weekly, monthly, and quarterly inspector folders.
- Associates a prototype extension request with a fictional facility. Only an entered reference filename is recorded as in-memory display metadata; Sentinel does not read, retain, or upload attachment contents.
- Adds a fictional sign-out/return roster for equipment, cards, and the duty phone.
- Derives FPAR attention alerts from the current in-memory scenario.
- Adds fixed regulation links and a deterministic local keyword reference helper. Results cite those links, and no prompt, record, or query is sent to an external AI model, API, search service, or reference source.
- Uses synthetic test data only. Reset Demo, refresh, or closing the tab clears all Operations Hub changes and restores the fictional starting scenario on the next load.
