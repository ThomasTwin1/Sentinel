(() => {
  "use strict";

  const STORAGE_KEY = "sentinelInspectionTrackerV01";
  const FREQUENCIES = {
    DAILY: { label: "Daily", dueSoon: 0 },
    WEEKLY: { label: "Weekly", dueSoon: 2 },
    MONTHLY: { label: "Monthly", dueSoon: 7 },
    QUARTERLY: { label: "Quarterly", dueSoon: 14 },
    BIANNUAL: { label: "Biannual", dueSoon: 30 },
    ANNUAL: { label: "Annual", dueSoon: 60 }
  };

  let state = loadState();
  let asOfDate = startOfDay(new Date());
  let toastTimer;

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindEvents();
    els.asOfDate.value = toISO(asOfDate);
    renderAll();
  }

  function cacheElements() {
    [
      "loadDemoBtn", "exportCsvBtn", "exportJsonBtn", "importJsonInput",
      "asOfDate", "todayBtn", "dashboardSearch", "installationFilter",
      "agencyFilter", "inspectorFilter", "statusFilter", "summaryCards",
      "recordCount", "trackerTableBody", "facilityForm", "facilityId",
      "facilityName", "buildingNumber", "installation", "agency",
      "assignedInspector", "frequency", "lastConductedDate", "active",
      "facilityFormTitle", "cancelEditBtn", "duplicateWarning",
      "facilityTableBody", "holidayForm", "holidayDate", "holidayName",
      "holidayScope", "holidayTableBody", "inspectionDialog",
      "inspectionForm", "inspectionDialogTitle", "inspectionFacilityId",
      "conductedDate", "closeInspectionDialog", "cancelInspectionBtn", "toast"
    ].forEach(id => { els[id] = document.getElementById(id); });
  }

  function bindEvents() {
    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    els.facilityForm.addEventListener("submit", saveFacility);
    els.cancelEditBtn.addEventListener("click", resetFacilityForm);
    els.facilityName.addEventListener("input", updateDuplicateWarning);
    els.installation.addEventListener("input", updateDuplicateWarning);

    els.holidayForm.addEventListener("submit", saveHoliday);
    els.inspectionForm.addEventListener("submit", saveConductedInspection);
    els.closeInspectionDialog.addEventListener("click", closeInspectionDialog);
    els.cancelInspectionBtn.addEventListener("click", closeInspectionDialog);

    [els.dashboardSearch, els.installationFilter, els.agencyFilter, els.inspectorFilter, els.statusFilter]
      .forEach(el => el.addEventListener("input", renderDashboard));

    els.asOfDate.addEventListener("change", () => {
      if (!els.asOfDate.value) return;
      asOfDate = parseISO(els.asOfDate.value);
      renderDashboard();
    });

    els.todayBtn.addEventListener("click", () => {
      asOfDate = startOfDay(new Date());
      els.asOfDate.value = toISO(asOfDate);
      renderDashboard();
    });

    els.loadDemoBtn.addEventListener("click", loadDemoData);
    els.exportJsonBtn.addEventListener("click", exportJson);
    els.importJsonInput.addEventListener("change", importJson);
    els.exportCsvBtn.addEventListener("click", exportCsv);
  }

  function switchTab(tabId) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.tab === tabId));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === tabId));
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && Array.isArray(parsed.facilities) && Array.isArray(parsed.customHolidays)) {
        return parsed;
      }
    } catch (error) {
      console.warn("Could not load saved tracker data.", error);
    }
    return { facilities: [], customHolidays: [], audit: [] };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function renderAll() {
    renderFilterOptions();
    renderDashboard();
    renderFacilities();
    renderHolidays();
  }

  function renderDashboard() {
    const rows = state.facilities
      .filter(f => f.active)
      .map(f => ({ facility: f, schedule: calculateSchedule(f, asOfDate, state.customHolidays) }))
      .filter(matchesDashboardFilters)
      .sort((a, b) => sortValue(a.schedule) - sortValue(b.schedule) || a.facility.name.localeCompare(b.facility.name));

    const allActiveSchedules = state.facilities.filter(f => f.active).map(f => calculateSchedule(f, asOfDate, state.customHolidays));
    renderSummaryCards(allActiveSchedules);

    els.recordCount.textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;
    if (!rows.length) {
      els.trackerTableBody.innerHTML = `<tr><td class="empty-row" colspan="10">No active facilities match the selected filters.</td></tr>`;
      return;
    }

    els.trackerTableBody.innerHTML = rows.map(({ facility, schedule }) => `
      <tr>
        <td><span class="table-primary">${escapeHtml(facility.name)}</span><span class="table-secondary">Building ${escapeHtml(facility.buildingNumber)}</span></td>
        <td>${escapeHtml(facility.installation)}</td>
        <td>${escapeHtml(facility.agency)}</td>
        <td>${escapeHtml(facility.assignedInspector || "Unassigned")}</td>
        <td>${FREQUENCIES[facility.frequency]?.label || facility.frequency}</td>
        <td>${facility.lastConductedDate ? formatDate(parseISO(facility.lastConductedDate)) : "—"}</td>
        <td>${schedule.nextDue ? formatDate(schedule.nextDue) : "—"}</td>
        <td>${escapeHtml(schedule.countdownLabel)}</td>
        <td>${statusBadge(schedule.status)}</td>
        <td><button class="button small primary" data-action="record" data-id="${facility.id}">Record Inspection</button></td>
      </tr>
    `).join("");

    els.trackerTableBody.querySelectorAll("[data-action='record']").forEach(button => {
      button.addEventListener("click", () => openInspectionDialog(button.dataset.id));
    });
  }

  function renderSummaryCards(schedules) {
    const counts = {
      total: schedules.length,
      OVERDUE: schedules.filter(s => s.status === "OVERDUE").length,
      DUE_TODAY: schedules.filter(s => s.status === "DUE_TODAY").length,
      DUE_SOON: schedules.filter(s => s.status === "DUE_SOON").length,
      UPCOMING: schedules.filter(s => s.status === "UPCOMING").length
    };

    els.summaryCards.innerHTML = `
      ${summaryCard("Active", counts.total, "total")}
      ${summaryCard("Overdue", counts.OVERDUE, "overdue")}
      ${summaryCard("Due Today", counts.DUE_TODAY, "today")}
      ${summaryCard("Due Soon", counts.DUE_SOON, "soon")}
      ${summaryCard("Upcoming", counts.UPCOMING, "upcoming")}
    `;
  }

  function summaryCard(label, value, className) {
    return `<div class="summary-card ${className}"><span class="label">${label}</span><span class="value">${value}</span></div>`;
  }

  function matchesDashboardFilters({ facility, schedule }) {
    const query = els.dashboardSearch.value.trim().toLowerCase();
    const searchMatch = !query || `${facility.name} ${facility.buildingNumber}`.toLowerCase().includes(query);
    return searchMatch
      && (!els.installationFilter.value || facility.installation === els.installationFilter.value)
      && (!els.agencyFilter.value || facility.agency === els.agencyFilter.value)
      && (!els.inspectorFilter.value || (facility.assignedInspector || "Unassigned") === els.inspectorFilter.value)
      && (!els.statusFilter.value || schedule.status === els.statusFilter.value);
  }

  function sortValue(schedule) {
    if (schedule.status === "NO_HISTORY") return Number.MAX_SAFE_INTEGER;
    return schedule.daysRemaining;
  }

  function renderFacilities() {
    const sorted = [...state.facilities].sort((a, b) => a.name.localeCompare(b.name));
    if (!sorted.length) {
      els.facilityTableBody.innerHTML = `<tr><td class="empty-row" colspan="7">No facilities saved yet.</td></tr>`;
      return;
    }

    els.facilityTableBody.innerHTML = sorted.map(f => `
      <tr>
        <td><span class="table-primary">${escapeHtml(f.name)}</span><span class="table-secondary">${escapeHtml(f.assignedInspector || "Unassigned")}</span></td>
        <td>${escapeHtml(f.buildingNumber)}</td>
        <td>${escapeHtml(f.installation)}</td>
        <td>${escapeHtml(f.agency)}</td>
        <td>${FREQUENCIES[f.frequency]?.label || f.frequency}</td>
        <td>${f.active ? `<span class="badge upcoming">Active</span>` : `<span class="badge inactive">Inactive</span>`}</td>
        <td class="actions">
          <button class="button small secondary" data-action="edit" data-id="${f.id}">Edit</button>
          <button class="button small primary" data-action="record" data-id="${f.id}">Record</button>
          <button class="button small danger" data-action="delete" data-id="${f.id}">Delete</button>
        </td>
      </tr>
    `).join("");

    els.facilityTableBody.querySelectorAll("[data-action]").forEach(button => {
      const id = button.dataset.id;
      if (button.dataset.action === "edit") button.addEventListener("click", () => editFacility(id));
      if (button.dataset.action === "record") button.addEventListener("click", () => openInspectionDialog(id));
      if (button.dataset.action === "delete") button.addEventListener("click", () => deleteFacility(id));
    });
  }

  function saveFacility(event) {
    event.preventDefault();
    const now = new Date().toISOString();
    const id = els.facilityId.value || crypto.randomUUID();
    const previous = state.facilities.find(f => f.id === id);
    const facility = {
      id,
      name: els.facilityName.value.trim(),
      buildingNumber: els.buildingNumber.value.trim(),
      installation: els.installation.value.trim(),
      agency: els.agency.value,
      assignedInspector: els.assignedInspector.value.trim(),
      frequency: els.frequency.value,
      lastConductedDate: els.lastConductedDate.value || null,
      active: els.active.checked,
      createdAt: previous?.createdAt || now,
      updatedAt: now
    };

    const duplicate = findDuplicate(facility);
    if (duplicate && !confirm(`A similar facility already exists on this installation:\n\n${duplicate.name}, Building ${duplicate.buildingNumber}\n\nSave this record anyway?`)) {
      return;
    }

    if (previous) {
      state.facilities = state.facilities.map(f => f.id === id ? facility : f);
      addAudit("FACILITY_UPDATED", id, previous, facility);
      showToast("Facility updated.");
    } else {
      state.facilities.push(facility);
      addAudit("FACILITY_CREATED", id, null, facility);
      showToast("Facility added.");
    }

    saveState();
    resetFacilityForm();
    renderAll();
  }

  function editFacility(id) {
    const facility = state.facilities.find(f => f.id === id);
    if (!facility) return;
    els.facilityId.value = facility.id;
    els.facilityName.value = facility.name;
    els.buildingNumber.value = facility.buildingNumber;
    els.installation.value = facility.installation;
    els.agency.value = facility.agency;
    els.assignedInspector.value = facility.assignedInspector || "";
    els.frequency.value = facility.frequency;
    els.lastConductedDate.value = facility.lastConductedDate || "";
    els.active.checked = facility.active;
    els.facilityFormTitle.textContent = "Edit Facility";
    els.cancelEditBtn.classList.remove("hidden");
    updateDuplicateWarning();
    switchTab("facilities");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFacilityForm() {
    els.facilityForm.reset();
    els.facilityId.value = "";
    els.active.checked = true;
    els.facilityFormTitle.textContent = "Add Facility";
    els.cancelEditBtn.classList.add("hidden");
    els.duplicateWarning.classList.add("hidden");
  }

  function deleteFacility(id) {
    const facility = state.facilities.find(f => f.id === id);
    if (!facility) return;
    if (!confirm(`Delete ${facility.name}? This cannot be undone unless you restore a backup.`)) return;
    state.facilities = state.facilities.filter(f => f.id !== id);
    addAudit("FACILITY_DELETED", id, facility, null);
    saveState();
    renderAll();
    showToast("Facility deleted.");
  }

  function findDuplicate(candidate) {
    const normalizedName = normalize(candidate.name);
    return state.facilities.find(f =>
      f.id !== candidate.id
      && normalize(f.installation) === normalize(candidate.installation)
      && (normalize(f.name) === normalizedName || similarity(normalize(f.name), normalizedName) >= 0.88)
    );
  }

  function updateDuplicateWarning() {
    const candidate = {
      id: els.facilityId.value,
      name: els.facilityName.value.trim(),
      installation: els.installation.value.trim()
    };
    if (!candidate.name || !candidate.installation) {
      els.duplicateWarning.classList.add("hidden");
      return;
    }
    const duplicate = findDuplicate(candidate);
    if (!duplicate) {
      els.duplicateWarning.classList.add("hidden");
      return;
    }
    els.duplicateWarning.innerHTML = `<strong>Possible duplicate:</strong> ${escapeHtml(duplicate.name)}, Building ${escapeHtml(duplicate.buildingNumber)}, ${escapeHtml(duplicate.agency)} (${duplicate.active ? "Active" : "Inactive"}).`;
    els.duplicateWarning.classList.remove("hidden");
  }

  function openInspectionDialog(id) {
    const facility = state.facilities.find(f => f.id === id);
    if (!facility) return;
    els.inspectionFacilityId.value = id;
    els.inspectionDialogTitle.textContent = `Record Inspection — ${facility.name}`;
    els.conductedDate.value = toISO(asOfDate);
    els.inspectionDialog.showModal();
  }

  function closeInspectionDialog() {
    els.inspectionDialog.close();
    els.inspectionForm.reset();
  }

  function saveConductedInspection(event) {
    event.preventDefault();
    const id = els.inspectionFacilityId.value;
    const facility = state.facilities.find(f => f.id === id);
    if (!facility) return;
    const previousDate = facility.lastConductedDate;
    facility.lastConductedDate = els.conductedDate.value;
    facility.updatedAt = new Date().toISOString();
    addAudit("INSPECTION_CONDUCTED_DATE_UPDATED", id, { lastConductedDate: previousDate }, { lastConductedDate: facility.lastConductedDate });
    saveState();
    closeInspectionDialog();
    renderAll();
    showToast("Inspection date recorded and next due date recalculated.");
  }

  function saveHoliday(event) {
    event.preventDefault();
    const holiday = {
      id: crypto.randomUUID(),
      date: els.holidayDate.value,
      name: els.holidayName.value.trim(),
      scope: els.holidayScope.value.trim() || "All",
      createdAt: new Date().toISOString()
    };
    const existing = state.customHolidays.find(h => h.date === holiday.date && normalize(h.scope) === normalize(holiday.scope));
    if (existing && !confirm("A non-duty day already exists for this date and scope. Add another entry?")) return;
    state.customHolidays.push(holiday);
    addAudit("HOLIDAY_CREATED", holiday.id, null, holiday);
    saveState();
    els.holidayForm.reset();
    renderAll();
    showToast("Non-duty day added.");
  }

  function renderHolidays() {
    const sorted = [...state.customHolidays].sort((a, b) => a.date.localeCompare(b.date));
    if (!sorted.length) {
      els.holidayTableBody.innerHTML = `<tr><td class="empty-row" colspan="4">No custom non-duty days added.</td></tr>`;
      return;
    }
    els.holidayTableBody.innerHTML = sorted.map(h => `
      <tr>
        <td>${formatDate(parseISO(h.date))}</td>
        <td>${escapeHtml(h.name)}</td>
        <td>${escapeHtml(h.scope)}</td>
        <td><button class="button small danger" data-id="${h.id}">Delete</button></td>
      </tr>
    `).join("");
    els.holidayTableBody.querySelectorAll("button[data-id]").forEach(button => {
      button.addEventListener("click", () => deleteHoliday(button.dataset.id));
    });
  }

  function deleteHoliday(id) {
    const holiday = state.customHolidays.find(h => h.id === id);
    if (!holiday || !confirm(`Delete ${holiday.name} on ${holiday.date}?`)) return;
    state.customHolidays = state.customHolidays.filter(h => h.id !== id);
    addAudit("HOLIDAY_DELETED", id, holiday, null);
    saveState();
    renderAll();
    showToast("Non-duty day deleted.");
  }

  function renderFilterOptions() {
    populateSelect(els.installationFilter, unique(state.facilities.map(f => f.installation)), "All installations");
    populateSelect(els.agencyFilter, unique(state.facilities.map(f => f.agency)), "All agencies");
    populateSelect(els.inspectorFilter, unique(state.facilities.map(f => f.assignedInspector || "Unassigned")), "All inspectors");
  }

  function populateSelect(select, values, defaultLabel) {
    const current = select.value;
    select.innerHTML = `<option value="">${defaultLabel}</option>` + values.map(v => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join("");
    if (values.includes(current)) select.value = current;
  }

  function calculateSchedule(facility, asOf, customHolidays) {
    if (!facility.lastConductedDate) {
      return { status: "NO_HISTORY", nextDue: null, daysRemaining: Number.MAX_SAFE_INTEGER, countdownLabel: "No inspection history" };
    }
    const lastConducted = parseISO(facility.lastConductedDate);
    const nextDue = calculateNextDue(lastConducted, facility.frequency, customHolidays);
    const daily = facility.frequency === "DAILY";
    const daysRemaining = daily
      ? businessDayDifference(asOf, nextDue, customHolidays)
      : calendarDayDifference(asOf, nextDue);

    let status;
    if (daysRemaining < 0) status = "OVERDUE";
    else if (daysRemaining === 0) status = "DUE_TODAY";
    else if (daysRemaining <= (FREQUENCIES[facility.frequency]?.dueSoon ?? 0)) status = "DUE_SOON";
    else status = "UPCOMING";

    const unit = daily ? "business day" : "day";
    const absolute = Math.abs(daysRemaining);
    let countdownLabel;
    if (daysRemaining < 0) countdownLabel = `${absolute} ${pluralize(unit, absolute)} overdue`;
    else if (daysRemaining === 0) countdownLabel = "Due today";
    else countdownLabel = `${daysRemaining} ${pluralize(unit, daysRemaining)} remaining`;

    return { status, nextDue, daysRemaining, countdownLabel };
  }

  function calculateNextDue(lastConducted, frequency, customHolidays) {
    switch (frequency) {
      case "DAILY": return nextBusinessDayAfter(lastConducted, customHolidays);
      case "WEEKLY": return addDays(lastConducted, 7);
      case "MONTHLY": return addCalendarMonths(lastConducted, 1);
      case "QUARTERLY": return addCalendarMonths(lastConducted, 3);
      case "BIANNUAL": return addCalendarMonths(lastConducted, 6);
      case "ANNUAL": return addCalendarMonths(lastConducted, 12);
      default: throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  function nextBusinessDayAfter(date, customHolidays) {
    let candidate = addDays(date, 1);
    while (!isBusinessDay(candidate, customHolidays)) candidate = addDays(candidate, 1);
    return candidate;
  }

  function isBusinessDay(date, customHolidays) {
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) return false;
    const iso = toISO(date);
    if (federalHolidaySetFor(date).has(iso)) return false;
    if (customHolidays.some(h => h.date === iso)) return false;
    return true;
  }

  function businessDayDifference(fromDate, toDate, customHolidays) {
    const from = startOfDay(fromDate);
    const to = startOfDay(toDate);
    if (from.getTime() === to.getTime()) return 0;
    const direction = from < to ? 1 : -1;
    let cursor = from;
    let count = 0;
    while (cursor.getTime() !== to.getTime()) {
      cursor = addDays(cursor, direction);
      if (isBusinessDay(cursor, customHolidays)) count += direction;
    }
    return count;
  }

  function federalHolidaySetFor(date) {
    const set = new Set();
    [date.getFullYear() - 1, date.getFullYear(), date.getFullYear() + 1].forEach(year => {
      getFederalHolidays(year).forEach(iso => set.add(iso));
    });
    return set;
  }

  function getFederalHolidays(year) {
    const dates = [];
    const addObserved = (monthIndex, day) => {
      const actual = new Date(year, monthIndex, day);
      dates.push(toISO(actual));
      if (actual.getDay() === 6) dates.push(toISO(addDays(actual, -1)));
      if (actual.getDay() === 0) dates.push(toISO(addDays(actual, 1)));
    };

    addObserved(0, 1);   // New Year's Day
    dates.push(toISO(nthWeekdayOfMonth(year, 0, 1, 3)));  // MLK Day
    dates.push(toISO(nthWeekdayOfMonth(year, 1, 1, 3)));  // Washington's Birthday
    dates.push(toISO(lastWeekdayOfMonth(year, 4, 1)));    // Memorial Day
    addObserved(5, 19);  // Juneteenth
    addObserved(6, 4);   // Independence Day
    dates.push(toISO(nthWeekdayOfMonth(year, 8, 1, 1)));  // Labor Day
    dates.push(toISO(nthWeekdayOfMonth(year, 9, 1, 2)));  // Columbus Day
    addObserved(10, 11); // Veterans Day
    dates.push(toISO(nthWeekdayOfMonth(year, 10, 4, 4))); // Thanksgiving
    addObserved(11, 25); // Christmas
    return dates;
  }

  function nthWeekdayOfMonth(year, monthIndex, weekday, nth) {
    const first = new Date(year, monthIndex, 1);
    const offset = (weekday - first.getDay() + 7) % 7;
    return new Date(year, monthIndex, 1 + offset + (nth - 1) * 7);
  }

  function lastWeekdayOfMonth(year, monthIndex, weekday) {
    const last = new Date(year, monthIndex + 1, 0);
    const offset = (last.getDay() - weekday + 7) % 7;
    return new Date(year, monthIndex + 1, -offset);
  }

  function addCalendarMonths(date, months) {
    const originalDay = date.getDate();
    const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const finalDay = Math.min(originalDay, daysInMonth(target.getFullYear(), target.getMonth()));
    target.setDate(finalDay);
    return startOfDay(target);
  }

  function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function addDays(date, days) {
    const result = startOfDay(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function calendarDayDifference(fromDate, toDate) {
    const ms = startOfDay(toDate).getTime() - startOfDay(fromDate).getTime();
    return Math.round(ms / 86400000);
  }

  function loadDemoData() {
    if (state.facilities.length && !confirm("Replace current tracker data with fictional demo data? Export a backup first if needed.")) return;
    const today = startOfDay(new Date());
    state = {
      facilities: [
        demoFacility("Freedom Dining Facility", "100", "Example Installation Korea", "Dining Facility", "Inspector Alpha", "MONTHLY", toISO(addDays(today, -40))),
        demoFacility("Liberty Exchange Food Court", "220", "Example Installation Korea", "AAFES", "Inspector Bravo", "QUARTERLY", toISO(addDays(today, -80))),
        demoFacility("Patriot Commissary", "310", "Example Installation Korea", "DECA", "Inspector Alpha", "ANNUAL", toISO(addDays(today, -320))),
        demoFacility("Warrior Snack Bar", "415", "Example Installation Korea", "MWR", "Inspector Charlie", "WEEKLY", toISO(addDays(today, -5))),
        demoFacility("Readiness Dining Facility", "520", "Example Installation Korea", "Dining Facility", "Inspector Bravo", "DAILY", toISO(previousBusinessDay(today, [])))
      ],
      customHolidays: [],
      audit: []
    };
    saveState();
    renderAll();
    showToast("Fictional demo data loaded.");
  }

  function demoFacility(name, buildingNumber, installation, agency, assignedInspector, frequency, lastConductedDate) {
    const now = new Date().toISOString();
    return { id: crypto.randomUUID(), name, buildingNumber, installation, agency, assignedInspector, frequency, lastConductedDate, active: true, createdAt: now, updatedAt: now };
  }

  function previousBusinessDay(date, customHolidays) {
    let candidate = addDays(date, -1);
    while (!isBusinessDay(candidate, customHolidays)) candidate = addDays(candidate, -1);
    return candidate;
  }

  function exportJson() {
    downloadFile(`sentinel-tracker-backup-${toISO(new Date())}.json`, JSON.stringify(state, null, 2), "application/json");
    showToast("JSON backup created.");
  }

  async function importJson(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || !Array.isArray(parsed.facilities) || !Array.isArray(parsed.customHolidays)) throw new Error("Invalid backup structure.");
      if (!confirm("Restore this backup and replace current browser data?")) return;
      state = { facilities: parsed.facilities, customHolidays: parsed.customHolidays, audit: Array.isArray(parsed.audit) ? parsed.audit : [] };
      saveState();
      renderAll();
      showToast("Backup restored.");
    } catch (error) {
      alert(`Could not restore backup: ${error.message}`);
    }
  }

  function exportCsv() {
    const headers = ["Facility", "Building Number", "Installation", "Agency", "Assigned Inspector", "Frequency", "Last Conducted", "Next Due", "Countdown", "Status"];
    const rows = state.facilities.filter(f => f.active).map(f => {
      const schedule = calculateSchedule(f, asOfDate, state.customHolidays);
      return [f.name, f.buildingNumber, f.installation, f.agency, f.assignedInspector || "Unassigned", FREQUENCIES[f.frequency]?.label || f.frequency, f.lastConductedDate || "", schedule.nextDue ? toISO(schedule.nextDue) : "", schedule.countdownLabel, schedule.status];
    });
    const csv = [headers, ...rows].map(row => row.map(csvEscape).join(",")).join("\n");
    downloadFile(`sentinel-upcoming-inspections-${toISO(asOfDate)}.csv`, csv, "text/csv;charset=utf-8");
    showToast("CSV exported.");
  }

  function addAudit(action, entityId, previous, next) {
    state.audit = state.audit || [];
    state.audit.push({ id: crypto.randomUUID(), action, entityId, previous, next, timestamp: new Date().toISOString() });
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function statusBadge(status) {
    const map = {
      OVERDUE: ["Overdue", "overdue"],
      DUE_TODAY: ["Due Today", "today"],
      DUE_SOON: ["Due Soon", "soon"],
      UPCOMING: ["Upcoming", "upcoming"],
      NO_HISTORY: ["No History", "no-history"]
    };
    const [label, className] = map[status] || [status, "no-history"];
    return `<span class="badge ${className}">${label}</span>`;
  }

  function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
  function parseISO(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  function toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function formatDate(date) { return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date); }
  function pluralize(unit, count) { return count === 1 ? unit : `${unit}s`; }
  function unique(values) { return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b)); }
  function normalize(value) { return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, ""); }

  function similarity(a, b) {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    return (longer.length - levenshtein(longer, shorter)) / longer.length;
  }

  function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }
  function escapeAttr(value) { return escapeHtml(value); }
  function csvEscape(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

  function showToast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("show");
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  // Exposed only so the included test script can mirror critical rules.
  window.SentinelDateLogic = {
    parseISO, toISO, addCalendarMonths, calculateNextDue, businessDayDifference,
    getFederalHolidays, isBusinessDay, nextBusinessDayAfter
  };
})();
