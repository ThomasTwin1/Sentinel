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
    els.milsansAsOfDate.value = toISO(asOfDate);
    renderAll();
  }

  function cacheElements() {
    [
      "loadDemoBtn", "importCsvInput", "importMilsansCsvTopInput", "importInaccessibleCsvInput", "exportCsvBtn", "exportMilsansCsvTopBtn", "printFparCardsBtn", "printMilsansCardsBtn", "exportJsonBtn", "importJsonInput",
      "loadMilsansDemoBtn", "importMilsansCsvInput", "exportMilsansCsvBtn",
      "fparDashboardPanel", "milsansDashboardPanel",
      "asOfDate", "todayBtn", "dashboardSearch", "milsansAsOfDate", "milsansTodayBtn", "milsansDueSearch", "installationFilter",
      "agencyFilter", "inspectorFilter", "statusFilter", "accessFilter", "sortMode", "sortDescription", "summaryCards", "statusKeyGrid",
      "printTitle", "printSummary",
      "recordCount", "trackerTableBody", "facilityForm", "facilityId",
      "facilityName", "buildingNumber", "installation", "agency",
      "assignedInspector", "frequency", "lastConductedDate", "active",
      "inaccessible", "inaccessibilityReason", "inaccessibilityDate",
      "facilityFormTitle", "cancelEditBtn", "duplicateWarning",
      "facilityTableBody", "holidayForm", "holidayDate", "holidayName",
      "holidayScope", "holidayTableBody", "inspectionDialog",
      "inspectionForm", "inspectionDialogTitle", "inspectionFacilityId",
      "conductedDate", "closeInspectionDialog", "cancelInspectionBtn",
      "milsansSearch", "milsansRatingFilter", "milsansFollowUpFilter", "milsansDueStatusResultsFilter", "milsansMonthFilter", "milsansInspectorFilter", "milsansSortMode",
      "milsansSummaryCards", "milsansRatingKey", "milsansDescription", "milsansRecordCount", "milsansTableBody", "milsansResults",
      "milsansDueSummaryCards", "milsansDueRatingFilter", "milsansDueStatusFilter", "milsansDueMonthFilter", "milsansDueInspectorFilter", "milsansDueSortMode", "milsansDueDescription", "milsansDueRecordCount", "milsansDueTableBody", "milsansDueRequirements",
      "quickScrollControls", "scrollToTopBtn", "scrollToBottomBtn", "toast"
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

    els.dashboardSearch.addEventListener("input", renderDashboard);
    els.milsansDueSearch.addEventListener("input", renderMilsansDueDashboard);
    [els.installationFilter, els.agencyFilter, els.inspectorFilter, els.statusFilter, els.accessFilter, els.sortMode]
      .forEach(el => el.addEventListener("input", renderDashboard));
    [els.milsansDueRatingFilter, els.milsansDueStatusFilter, els.milsansDueMonthFilter, els.milsansDueInspectorFilter, els.milsansDueSortMode]
      .forEach(el => el.addEventListener("input", renderMilsansDueDashboard));
    els.milsansDueSummaryCards.addEventListener("click", handleMilsansDueCardClick);

    els.summaryCards.addEventListener("click", handleDashboardShortcutClick);
    els.statusKeyGrid.addEventListener("click", handleDashboardShortcutClick);

    [els.asOfDate, els.milsansAsOfDate].forEach(input => {
      input.addEventListener("change", () => {
        if (!input.value) return;
        asOfDate = parseISO(input.value);
        els.asOfDate.value = toISO(asOfDate);
        els.milsansAsOfDate.value = toISO(asOfDate);
        renderDashboard();
        renderMilsansDueDashboard();
        renderMilsans();
      });
    });

    [els.todayBtn, els.milsansTodayBtn].forEach(button => {
      button.addEventListener("click", () => {
        asOfDate = startOfDay(new Date());
        els.asOfDate.value = toISO(asOfDate);
        els.milsansAsOfDate.value = toISO(asOfDate);
        renderDashboard();
        renderMilsansDueDashboard();
        renderMilsans();
      });
    });

    els.loadDemoBtn.addEventListener("click", loadDemoData);
    els.importCsvInput.addEventListener("change", importInspectionCsv);
    els.importInaccessibleCsvInput.addEventListener("change", importInaccessibleCsv);
    els.exportJsonBtn.addEventListener("click", exportJson);
    els.importJsonInput.addEventListener("change", importJson);
    els.exportCsvBtn.addEventListener("click", exportCsv);
    els.printFparCardsBtn.addEventListener("click", printFparCards);
    els.printMilsansCardsBtn.addEventListener("click", printMilsansCards);
    [els.milsansSearch, els.milsansRatingFilter, els.milsansFollowUpFilter, els.milsansDueStatusResultsFilter, els.milsansMonthFilter, els.milsansInspectorFilter, els.milsansSortMode]
      .forEach(el => el.addEventListener("input", renderMilsans));
    els.milsansSummaryCards.addEventListener("click", handleMilsansCardClick);
    els.milsansRatingKey.addEventListener("click", handleMilsansDueRatingKeyClick);
    els.loadMilsansDemoBtn.addEventListener("click", loadMilsansDemoData);
    els.importMilsansCsvInput.addEventListener("change", importMilsansCsv);
    els.importMilsansCsvTopInput.addEventListener("change", importMilsansCsv);
    els.exportMilsansCsvBtn.addEventListener("click", exportMilsansCsv);
    els.exportMilsansCsvTopBtn.addEventListener("click", exportMilsansCsv);

    els.scrollToTopBtn.addEventListener("click", scrollPageToTop);
    els.scrollToBottomBtn.addEventListener("click", scrollPageToBottom);
    window.addEventListener("scroll", updateQuickScrollControls, { passive: true });
    window.addEventListener("resize", updateQuickScrollControls);
  }

  function switchTab(tabId) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.tab === tabId));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === tabId));
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && Array.isArray(parsed.facilities) && Array.isArray(parsed.customHolidays)) {
        return {
          ...parsed,
          facilities: parsed.facilities.map(withAccessDefaults),
          milsansInspections: Array.isArray(parsed.milsansInspections)
            ? parsed.milsansInspections.map(withMilsansDefaults)
            : [],
          audit: Array.isArray(parsed.audit) ? parsed.audit : []
        };
      }
    } catch (error) {
      console.warn("Could not load saved tracker data.", error);
    }
    return { facilities: [], customHolidays: [], milsansInspections: [], audit: [] };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function renderAll() {
    renderFilterOptions();
    populateMilsansInspectorFilters();
    populateMilsansMonthFilters();
    renderDashboard();
    renderMilsansDueDashboard();
    renderFacilities();
    renderHolidays();
    renderMilsans();
    window.requestAnimationFrame(updateQuickScrollControls);
  }


  function renderDashboard() {
    const rows = state.facilities
      .filter(f => f.active)
      .map(f => ({ facility: f, schedule: calculateSchedule(f, asOfDate, state.customHolidays) }))
      .filter(matchesDashboardFilters)
      .sort(compareDashboardRows);

    const sortDescriptions = {
      URGENCY: "Sorted by urgency, with the most overdue requirement first.",
      BUILDING: "Sorted by building number, from lowest to highest.",
      NAME: "Sorted alphabetically by facility name."
    };
    els.sortDescription.textContent = sortDescriptions[els.sortMode.value] || sortDescriptions.URGENCY;

    const allActiveFacilities = state.facilities.filter(f => f.active);
    renderSummaryCards(allActiveFacilities);
    updateStatusKeySelection();

    els.recordCount.textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;
    if (!rows.length) {
      els.trackerTableBody.innerHTML = `<tr><td class="empty-row" colspan="11">No active facilities match the selected filters.</td></tr>`;
      return;
    }

    els.trackerTableBody.innerHTML = rows.map(({ facility, schedule }) => `
      <tr class="inspection-row" data-inaccessible="${facility.inaccessible ? "true" : "false"}">
        <td class="facility-cell" data-label="Facility">
          <span class="table-primary">${escapeHtml(facility.name)}</span>
          <span class="table-secondary">Building ${escapeHtml(facility.buildingNumber)}</span>
          ${facility.inaccessible ? `<span class="facility-access-alert">Access restricted: ${escapeHtml(facility.inaccessibilityReason || "Reason not listed")}</span>` : ""}
        </td>
        <td class="days-to-due ${statusClass(schedule.status)}" data-label="Days to Due">${schedule.status === "NO_HISTORY" ? "—" : schedule.daysToDue}</td>
        <td class="status-cell" data-label="Status">${statusBadge(schedule.status)}</td>
        <td class="access-cell" data-label="Access">${accessStatusMarkup(facility)}</td>
        <td class="last-inspected-cell" data-label="Last Inspection Date">${facility.lastConductedDate ? formatDate(parseISO(facility.lastConductedDate)) : "—"}</td>
        <td class="due-date-cell" data-label="Due Date">${schedule.nextDue ? formatDate(schedule.nextDue) : "—"}</td>
        <td class="installation-cell" data-label="Installation">${escapeHtml(facility.installation)}</td>
        <td class="agency-cell" data-label="Agency">${escapeHtml(facility.agency)}</td>
        <td class="inspector-cell" data-label="Inspector">${escapeHtml(facility.assignedInspector || "Unassigned")}</td>
        <td class="frequency-cell" data-label="Frequency">${escapeHtml(FREQUENCIES[facility.frequency]?.label || facility.frequency)}</td>
        <td class="action-cell" data-label="Action"><button class="button small primary" data-action="record" data-id="${escapeAttr(facility.id)}">Record Inspection</button></td>
      </tr>
    `).join("");

    els.trackerTableBody.querySelectorAll("[data-action='record']").forEach(button => {
      button.addEventListener("click", () => openInspectionDialog(button.dataset.id));
    });
  }

  function renderSummaryCards(facilities) {
    const schedules = facilities.map(facility =>
      calculateSchedule(facility, asOfDate, state.customHolidays)
    );

    const counts = {
      total: facilities.length,
      OVERDUE: schedules.filter(s => s.status === "OVERDUE").length,
      DUE_TODAY: schedules.filter(s => s.status === "DUE_TODAY").length,
      DUE_SOON: schedules.filter(s => s.status === "DUE_SOON").length,
      UPCOMING: schedules.filter(s => s.status === "UPCOMING").length,
      INACCESSIBLE: facilities.filter(f => f.inaccessible).length
    };

    const selectedStatus = els.statusFilter.value;
    const selectedAccess = els.accessFilter.value;
    const allSelected = !selectedStatus && !selectedAccess;

    els.summaryCards.innerHTML = `
      ${summaryCard("Active", counts.total, "total", { clearAll: true, isSelected: allSelected })}
      ${summaryCard("Overdue", counts.OVERDUE, "overdue", { statusValue: "OVERDUE", isSelected: selectedStatus === "OVERDUE" && !selectedAccess })}
      ${summaryCard("Due Today", counts.DUE_TODAY, "today", { statusValue: "DUE_TODAY", isSelected: selectedStatus === "DUE_TODAY" && !selectedAccess })}
      ${summaryCard("Due Soon", counts.DUE_SOON, "soon", { statusValue: "DUE_SOON", isSelected: selectedStatus === "DUE_SOON" && !selectedAccess })}
      ${summaryCard("Upcoming", counts.UPCOMING, "upcoming", { statusValue: "UPCOMING", isSelected: selectedStatus === "UPCOMING" && !selectedAccess })}
      ${summaryCard("Inaccessible", counts.INACCESSIBLE, "access", { accessValue: "INACCESSIBLE", isSelected: selectedAccess === "INACCESSIBLE" && !selectedStatus })}
    `;
  }

  function summaryCard(label, value, className, options = {}) {
    const {
      statusValue = "",
      accessValue = "",
      clearAll = false,
      isSelected = false
    } = options;

    const filterLabel = clearAll
      ? "Show all active facilities"
      : `Show ${label.toLowerCase()} facilities`;

    return `
      <button
        type="button"
        class="summary-card ${className}${isSelected ? " selected" : ""}"
        data-status-value="${statusValue}"
        data-access-value="${accessValue}"
        data-clear-all="${clearAll ? "true" : "false"}"
        aria-label="${filterLabel}"
        aria-pressed="${isSelected}"
      >
        <span class="label">${label}</span>
        <span class="value">${value}</span>
        <span class="card-action">View records</span>
      </button>
    `;
  }

  function handleDashboardShortcutClick(event) {
    const card = event.target.closest(
      "[data-status-value], [data-access-value], [data-clear-all='true']"
    );
    if (!card) return;

    const requestedStatus = card.dataset.statusValue || "";
    const requestedAccess = card.dataset.accessValue || "";
    const clearAll = card.dataset.clearAll === "true";

    if (clearAll) {
      els.statusFilter.value = "";
      els.accessFilter.value = "";
    } else if (requestedStatus) {
      const alreadySelected =
        els.statusFilter.value === requestedStatus
        && !els.accessFilter.value;

      els.statusFilter.value = alreadySelected ? "" : requestedStatus;
      els.accessFilter.value = "";
    } else if (requestedAccess) {
      const alreadySelected =
        els.accessFilter.value === requestedAccess
        && !els.statusFilter.value;

      els.accessFilter.value = alreadySelected ? "" : requestedAccess;
      els.statusFilter.value = "";
    }

    renderDashboard();
    scrollToFirstVisibleFacility();
  }

  function updateStatusKeySelection() {
    els.statusKeyGrid.querySelectorAll("[data-status-value], [data-access-value]").forEach(card => {
      const statusValue = card.dataset.statusValue || "";
      const accessValue = card.dataset.accessValue || "";
      const selected = statusValue
        ? els.statusFilter.value === statusValue && !els.accessFilter.value
        : els.accessFilter.value === accessValue && !els.statusFilter.value;

      card.classList.toggle("selected", selected);
      card.setAttribute("aria-pressed", String(selected));
    });
  }

  function scrollToFirstVisibleFacility() {
    // Wait for filtered facility cards to render, then position the first
    // matching facility at the top of the screen.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const firstFacility = els.trackerTableBody.querySelector(".inspection-row");
        const target = firstFacility || els.inspectionRequirements;

        if (firstFacility) {
          firstFacility.setAttribute("tabindex", "-1");
        }

        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.focus({ preventScroll: true });
      });
    });
  }

  function matchesDashboardFilters({ facility, schedule }) {
    const query = els.dashboardSearch.value.trim().toLowerCase();
    const searchMatch = !query || `${facility.name} ${facility.buildingNumber} ${facility.inaccessibilityReason || ""}`.toLowerCase().includes(query);
    return searchMatch
      && (!els.installationFilter.value || facility.installation === els.installationFilter.value)
      && (!els.agencyFilter.value || facility.agency === els.agencyFilter.value)
      && (!els.inspectorFilter.value || (facility.assignedInspector || "Unassigned") === els.inspectorFilter.value)
      && (!els.statusFilter.value || schedule.status === els.statusFilter.value)
      && (
        !els.accessFilter.value
        || (els.accessFilter.value === "INACCESSIBLE" && facility.inaccessible)
        || (els.accessFilter.value === "ACCESSIBLE" && !facility.inaccessible)
      );
  }

  function compareDashboardRows(a, b) {
    const mode = els.sortMode?.value || "URGENCY";
    if (mode === "BUILDING") {
      return compareBuildingNumbers(a.facility.buildingNumber, b.facility.buildingNumber)
        || a.facility.name.localeCompare(b.facility.name);
    }
    if (mode === "NAME") {
      return a.facility.name.localeCompare(b.facility.name);
    }

    const aValue = a.schedule.status === "NO_HISTORY" ? Number.MAX_SAFE_INTEGER : a.schedule.daysToDue;
    const bValue = b.schedule.status === "NO_HISTORY" ? Number.MAX_SAFE_INTEGER : b.schedule.daysToDue;
    return aValue - bValue
      || compareBuildingNumbers(a.facility.buildingNumber, b.facility.buildingNumber)
      || a.facility.name.localeCompare(b.facility.name);
  }

  function compareBuildingNumbers(a, b) {
    const aKey = buildingSortKey(a);
    const bKey = buildingSortKey(b);
    if (aKey.group !== bKey.group) return aKey.group - bKey.group;
    if (aKey.number !== bKey.number) return aKey.number - bKey.number;
    return aKey.text.localeCompare(bKey.text);
  }

  function buildingSortKey(value) {
    const text = String(value || "").trim();
    const match = text.match(/\d+/);
    if (match) return { group: 0, number: Number(match[0]), text };
    if (text.toUpperCase() === "MOBILE") return { group: 1, number: Number.MAX_SAFE_INTEGER, text };
    return { group: 2, number: Number.MAX_SAFE_INTEGER, text };
  }

  function renderFacilities() {
    const sorted = [...state.facilities].sort((a, b) => compareBuildingNumbers(a.buildingNumber, b.buildingNumber) || a.name.localeCompare(b.name));
    if (!sorted.length) {
      els.facilityTableBody.innerHTML = `<tr><td class="empty-row" colspan="8">No facilities saved yet.</td></tr>`;
      return;
    }

    els.facilityTableBody.innerHTML = sorted.map(f => `
      <tr>
        <td><span class="table-primary">${escapeHtml(f.name)}</span><span class="table-secondary">${escapeHtml(f.assignedInspector || "Unassigned")}</span></td>
        <td>${escapeHtml(f.buildingNumber)}</td>
        <td>${escapeHtml(f.installation)}</td>
        <td>${escapeHtml(f.agency)}</td>
        <td>${escapeHtml(FREQUENCIES[f.frequency]?.label || f.frequency)}</td>
        <td>${f.active ? `<span class="badge upcoming">Active</span>` : `<span class="badge inactive">Inactive</span>`}</td>
        <td>${accessStatusMarkup(f)}</td>
        <td class="actions">
          <button class="button small secondary" data-action="edit" data-id="${escapeAttr(f.id)}">Edit</button>
          <button class="button small primary" data-action="record" data-id="${escapeAttr(f.id)}">Record</button>
          <button class="button small danger" data-action="delete" data-id="${escapeAttr(f.id)}">Delete</button>
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
      inaccessible: els.inaccessible.checked,
      inaccessibilityReason: els.inaccessible.checked ? els.inaccessibilityReason.value.trim() : "",
      inaccessibilityDate: els.inaccessible.checked ? (els.inaccessibilityDate.value || null) : null,
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
    els.inaccessible.checked = Boolean(facility.inaccessible);
    els.inaccessibilityReason.value = facility.inaccessibilityReason || "";
    els.inaccessibilityDate.value = facility.inaccessibilityDate || "";
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
    els.inaccessible.checked = false;
    els.inaccessibilityReason.value = "";
    els.inaccessibilityDate.value = "";
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
        <td><button class="button small danger" data-id="${escapeAttr(h.id)}">Delete</button></td>
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
      return {
        status: "NO_HISTORY",
        nextDue: null,
        daysToDue: Number.MAX_SAFE_INTEGER,
        daysRemaining: Number.MAX_SAFE_INTEGER,
        countdownLabel: "No inspection history"
      };
    }

    const lastConducted = parseISO(facility.lastConductedDate);
    const nextDue = calculateNextDue(lastConducted, facility.frequency, customHolidays);
    const daily = facility.frequency === "DAILY";
    const daysToDue = daily
      ? businessDayDifference(asOf, nextDue, customHolidays)
      : calendarDayDifference(asOf, nextDue);

    let status;
    if (daysToDue < 0) status = "OVERDUE";
    else if (daysToDue === 0) status = "DUE_TODAY";
    else if (daysToDue <= (FREQUENCIES[facility.frequency]?.dueSoon ?? 0)) status = "DUE_SOON";
    else status = "UPCOMING";

    return {
      status,
      nextDue,
      daysToDue,
      daysRemaining: daysToDue,
      countdownLabel: String(daysToDue)
    };
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
        demoFacility("Freedom Dining Facility", "100", "Example Installation Korea", "Dining Facility", "Inspector Alpha", "WEEKLY", toISO(addDays(today, -14))),
        demoFacility("Liberty Exchange Food Court", "220", "Example Installation Korea", "AAFES", "Inspector Bravo", "MONTHLY", toISO(addDays(today, -27))),
        demoFacility("Patriot Commissary", "310", "Example Installation Korea", "DECA", "Inspector Alpha", "MONTHLY", toISO(addDays(today, -31))),
        demoFacility("Warrior Snack Bar", "415", "Example Installation Korea", "MWR", "Inspector Charlie", "MONTHLY", toISO(addDays(today, -10))),
        demoFacility("Mobile BBQ Truck", "MOBILE", "Example Installation Korea", "AAFES", "Inspector Bravo", "QUARTERLY", toISO(addDays(today, -82)))
      ],
      customHolidays: [],
      milsansInspections: buildFictionalMilsansRecords(today),
      audit: []
    };
    state.facilities[1].inaccessible = true;
    state.facilities[1].inaccessibilityReason = "Temporary renovations";
    state.facilities[1].inaccessibilityDate = toISO(addDays(today, -5));
    saveState();
    renderAll();
    showToast("Fictional demo data loaded.");
  }

  function demoFacility(name, buildingNumber, installation, agency, assignedInspector, frequency, lastConductedDate) {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      name,
      buildingNumber,
      installation,
      agency,
      assignedInspector,
      frequency,
      lastConductedDate,
      active: true,
      inaccessible: false,
      inaccessibilityReason: "",
      inaccessibilityDate: null,
      createdAt: now,
      updatedAt: now
    };
  }


  function loadMilsansDemoData() {
    if (state.milsansInspections?.length && !confirm(
      "Replace current MILSANS result history with fictional demo records?"
    )) return;

    state.milsansInspections = buildFictionalMilsansRecords(startOfDay(new Date()));
    addAudit("MILSANS_DEMO_LOADED", crypto.randomUUID(), null, {
      recordsLoaded: state.milsansInspections.length,
      loadedAt: new Date().toISOString()
    });
    saveState();
    populateMilsansInspectorFilters();
    renderMilsans();
    renderMilsansDueDashboard();
    showToast("Fictional MILSANS results loaded.");
  }

  function buildFictionalMilsansRecords(today) {
    const records = [
      ["MS-1001", "Example Installation North", "Valor Dining Facility Bldg 110", -92, "Completed", "Fully Compliant", "No", 0, 0, 0, 0, "No", ""],
      ["MS-1002", "Example Installation North", "Valor Dining Facility Bldg 110", -28, "Completed", "Substantially Compliant", "No", 0, 0, 2, 1, "No", ""],
      ["MS-1003", "Example Installation Central", "Summit Commissary Bldg 300", -34, "Completed", "Fully Compliant", "No", 0, 0, 1, 1, "No", ""],
      ["MS-1004", "Example Installation South", "Pioneer Exchange Bldg 410", -22, "Completed", "Partially Compliant", "No", 1, 1, 6, 2, "No", ""],
      ["MS-1005", "Example Installation Central", "Mobile Food Truck Bldg 901", -18, "Completed", "Non-Compliant", "No", 1, 0, 1, 0, "Yes", -13],
      ["MS-1006", "Example Installation North", "Discovery School Cafeteria Bldg 520", -12, "Completed", "Fully Compliant", "No", 0, 0, 0, 0, "No", ""],
      ["MS-1007", "Example Installation South", "Harbor Community Club Bldg 620", -8, "Completed", "Substantially Compliant", "No", 0, 0, 3, 1, "No", ""],
      ["MS-1008", "Example Installation Central", "Mobile Food Truck Bldg 901", -2, "In Progress", "", "No", 0, 0, 0, 0, "No", ""]
    ];

    return records.map(([surveyId, installation, facilityName, dateOffset, surveyStatus, rating, ihh, critical, criticalCos, nonCritical, nonCriticalCos, followUp, followUpOffset]) => ({
      id: crypto.randomUUID(),
      surveyId,
      installation,
      facilityName,
      inspectionDate: toISO(addDays(today, dateOffset)),
      surveyStatus,
      rating,
      imminentHealthHazard: ihh === "Yes",
      criticalViolations: critical,
      criticalCos,
      nonCriticalViolations: nonCritical,
      nonCriticalCos,
      followUpRequired: followUp === "Yes",
      followUpDate: followUpOffset === "" ? null : toISO(addDays(today, followUpOffset)),
      frequency: facilityName.includes("Commissary") ? "MONTHLY" : "QUARTERLY",
      buildingNumber: extractBuildingNumber(facilityName),
      routineDueDate: toISO(addCalendarMonths(addDays(today, dateOffset), facilityName.includes("Commissary") ? 1 : 3)),
      dueDate: followUp === "Yes"
        ? toISO(addDays(today, followUpOffset))
        : toISO(addCalendarMonths(addDays(today, dateOffset), facilityName.includes("Commissary") ? 1 : 3)),
      scheduledMonth: formatMonthYear(addCalendarMonths(addDays(today, dateOffset), facilityName.includes("Commissary") ? 1 : 3)),
      dueDateBasis: followUp === "Yes" ? "Required follow-up date" : "Latest completed inspection plus inspection frequency",
      recordType: "Latest completed inspection",
      inspector: Number(surveyId.replace(/\D/g, "")) % 2 === 0 ? "SPC Rivera" : "SGT Morgan",
      recordCreatedBy: Number(surveyId.replace(/\D/g, "")) % 2 === 0 ? "SPC Rivera" : "SGT Morgan",
      scheduledMonthEndDate: toISO(new Date(
        addCalendarMonths(addDays(today, dateOffset), facilityName.includes("Commissary") ? 1 : 3).getFullYear(),
        addCalendarMonths(addDays(today, dateOffset), facilityName.includes("Commissary") ? 1 : 3).getMonth() + 1,
        0
      )),
      scheduledDate: toISO(new Date(
        addCalendarMonths(addDays(today, dateOffset), facilityName.includes("Commissary") ? 1 : 3).getFullYear(),
        addCalendarMonths(addDays(today, dateOffset), facilityName.includes("Commissary") ? 1 : 3).getMonth(),
        25
      )),
      assignedTeam: Number(surveyId.replace(/\D/g, "")) % 3 === 0 ? "Team 3" : "Team 2",
      importedAt: new Date().toISOString()
    }));
  }

  async function importMilsansCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const rows = parseCsv(await file.text());
      const headerIndex = rows.findIndex(row => {
        const normalized = row.map(normalizeHeader);
        return normalized.includes("facility")
          && (
            normalized.includes("overallinspectionrating")
            || normalized.includes("inspectionrating")
            || normalized.includes("rating")
            || normalized.includes("nextactionduedate")
            || normalized.includes("duedate")
          );
      });

      if (headerIndex < 0) {
        throw new Error("Could not find a MILSANS CSV header row containing Facility and either a rating or due-date column.");
      }

      const headers = rows[headerIndex].map(value => String(value || "").trim());
      const headerMap = Object.fromEntries(headers.map((header, index) => [normalizeHeader(header), index]));
      const findColumn = (...aliases) => aliases
        .map(alias => headerMap[normalizeHeader(alias)])
        .find(index => index !== undefined);

      const facilityColumn = findColumn("Facility", "Facility Name");
      const installationColumn = findColumn("Installation", "Location Name");
      const dateColumn = findColumn("Last Inspection Date", "Inspection Date", "Survey Start Date", "Survey Start Date/Time", "Date");
      const ratingColumn = findColumn("Overall Inspection Rating", "Inspection Rating", "Rating");
      const statusColumn = findColumn("Survey Status", "Status");
      const surveyIdColumn = findColumn("Survey ID");
      const ihhColumn = findColumn("Imminent Health Hazard", "IHH");
      const criticalColumn = findColumn("Critical Violations", "Critical Total");
      const criticalCosColumn = findColumn("Critical COS");
      const nonCriticalColumn = findColumn("Non-Critical Violations", "Non Critical Violations", "Non-Critical Total");
      const nonCriticalCosColumn = findColumn("Non-Critical COS", "Non Critical COS");
      const followUpColumn = findColumn("Follow-Up Required", "Follow Up Required");
      const followUpDateColumn = findColumn("Follow-Up Date", "Follow Up Date");
      const frequencyColumn = findColumn("Inspection Frequency", "Frequency");
      const buildingColumn = findColumn("Building Number", "Building");
      const routineDueDateColumn = findColumn("Routine Due Date");
      const dueDateColumn = findColumn("Next Action Due Date", "Due Date");
      const scheduledMonthColumn = findColumn("Scheduled Month", "Next Scheduled Month");
      const scheduledDateColumn = findColumn("Scheduled Date", "Planned Inspection Date");
      const dueDateBasisColumn = findColumn("Due Date Basis");
      const recordTypeColumn = findColumn("Record Type");
      const inspectorColumn = findColumn(
        "Last Inspector", "Inspector", "Surveyor", "Surveyor's Name", "Inspection Completed By", "Completed By", "Inspector / Surveyor"
      );
      const assignedTeamColumn = findColumn(
        "Assigned Team", "Assigned Team / Lead", "Team Assignment", "Team"
      );
      const recordCreatedByColumn = findColumn(
        "DOEHRS Record Created By", "Record Created By", "Created By"
      );
      const scheduledMonthEndColumn = findColumn(
        "Scheduled Month-End Date", "Scheduled Deadline", "Scheduled Due Date"
      );

      const missing = [];
      if (facilityColumn === undefined) missing.push("Facility");
      if (missing.length) throw new Error(`Missing required columns: ${missing.join(", ")}`);

      const importedAt = new Date().toISOString();
      const records = rows.slice(headerIndex + 1)
        .map(row => {
          const facilityName = String(row[facilityColumn] || "").trim();
          const inspectionDate = dateColumn === undefined ? null : parseMilsansDate(row[dateColumn]);
          const rating = ratingColumn === undefined ? "" : normalizeMilsansRating(row[ratingColumn]);
          const surveyStatus = statusColumn === undefined
            ? (inspectionDate && rating ? "Completed" : "No completed report supplied")
            : normalizeSurveyStatus(row[statusColumn]);
          const parsedFollowUpDate = followUpDateColumn === undefined
            ? null
            : parseMilsansDate(row[followUpDateColumn]);
          const parsedRoutineDueDate = routineDueDateColumn === undefined
            ? null
            : parseMilsansDate(row[routineDueDateColumn]);
          const parsedDueDate = dueDateColumn === undefined
            ? null
            : parseMilsansDate(row[dueDateColumn]);
          const parsedScheduledMonthEnd = scheduledMonthEndColumn === undefined
            ? null
            : parseMilsansDate(row[scheduledMonthEndColumn]);
          const parsedScheduledDate = scheduledDateColumn === undefined
            ? null
            : parseMilsansDate(row[scheduledDateColumn]);
          const frequency = normalizeMilsansFrequency(
            frequencyColumn === undefined ? "" : row[frequencyColumn]
          ) || inferMilsansFrequency(facilityName);
          const followUpRequired = followUpColumn === undefined
            ? false
            : parseYesNo(row[followUpColumn]) === true;
          const computedRoutineDue = inspectionDate
            ? calculateMilsansRoutineDue(inspectionDate, frequency)
            : null;

          return {
            id: crypto.randomUUID(),
            surveyId: surveyIdColumn === undefined ? "" : String(row[surveyIdColumn] || "").trim(),
            installation: installationColumn === undefined ? "" : String(row[installationColumn] || "").trim(),
            facilityName,
            buildingNumber: buildingColumn === undefined
              ? extractBuildingNumber(facilityName)
              : String(row[buildingColumn] || "").trim(),
            inspectionDate: inspectionDate ? toISO(inspectionDate) : "",
            surveyStatus,
            rating,
            imminentHealthHazard: ihhColumn === undefined ? false : parseYesNo(row[ihhColumn]) === true,
            criticalViolations: criticalColumn === undefined ? 0 : parseWholeNumber(row[criticalColumn]),
            criticalCos: criticalCosColumn === undefined ? 0 : parseWholeNumber(row[criticalCosColumn]),
            nonCriticalViolations: nonCriticalColumn === undefined ? 0 : parseWholeNumber(row[nonCriticalColumn]),
            nonCriticalCos: nonCriticalCosColumn === undefined ? 0 : parseWholeNumber(row[nonCriticalCosColumn]),
            followUpRequired,
            followUpDate: parsedFollowUpDate ? toISO(parsedFollowUpDate) : null,
            frequency,
            routineDueDate: parsedRoutineDueDate
              ? toISO(parsedRoutineDueDate)
              : (computedRoutineDue ? toISO(computedRoutineDue) : null),
            dueDate: parsedDueDate
              ? toISO(parsedDueDate)
              : (followUpRequired && parsedFollowUpDate
                ? toISO(parsedFollowUpDate)
                : (computedRoutineDue ? toISO(computedRoutineDue) : null)),
            scheduledMonth: scheduledMonthColumn === undefined
              ? (parsedScheduledDate ? formatMonthYear(parsedScheduledDate) : "")
              : String(row[scheduledMonthColumn] || "").trim(),
            dueDateBasis: dueDateBasisColumn === undefined ? "" : String(row[dueDateBasisColumn] || "").trim(),
            recordType: recordTypeColumn === undefined ? "" : String(row[recordTypeColumn] || "").trim(),
            inspector: inspectorColumn === undefined ? "" : String(row[inspectorColumn] || "").trim(),
            assignedTeam: assignedTeamColumn === undefined ? "" : String(row[assignedTeamColumn] || "").trim(),
            scheduledDate: parsedScheduledDate ? toISO(parsedScheduledDate) : null,
            recordCreatedBy: recordCreatedByColumn === undefined ? "" : String(row[recordCreatedByColumn] || "").trim(),
            scheduledMonthEndDate: parsedScheduledMonthEnd ? toISO(parsedScheduledMonthEnd) : null,
            importedAt
          };
        })
        .filter(record => record.facilityName && (record.inspectionDate || record.dueDate));

      if (!records.length) throw new Error("No MILSANS facility records with an inspection date or due date were found.");

      const uniqueRecords = [];
      const seen = new Set();
      records.forEach(record => {
        const key = record.surveyId
          ? `survey|${normalize(record.surveyId)}`
          : `${normalize(record.installation)}|${normalize(record.facilityName)}|${record.inspectionDate || record.dueDate}|${normalize(record.rating)}`;
        if (seen.has(key)) return;
        seen.add(key);
        uniqueRecords.push(record);
      });

      if (state.milsansInspections?.length && !confirm(
        `Replace ${state.milsansInspections.length} stored MILSANS records with ${uniqueRecords.length} records from this CSV?\n\nExport a JSON backup first if needed.`
      )) return;

      state.milsansInspections = uniqueRecords;
      addAudit("MILSANS_CSV_IMPORTED", crypto.randomUUID(), null, {
        fileName: file.name,
        recordsImported: uniqueRecords.length,
        latestCompletedRule: "Latest completed inspection per installation and facility",
        importedAt
      });

      saveState();
      renderAll();
      switchTab("milsans-dashboard");
      showToast(`${uniqueRecords.length} MILSANS facility records imported. MILSANS Dashboard opened.`);
    } catch (error) {
      alert(`Could not import MILSANS CSV: ${error.message}`);
    }
  }


  function renderMilsansDueDashboard() {
    if (!els.milsansDueTableBody) return;

    const allRecords = getMilsansDueRecords();
    renderMilsansDueSummaryCards(allRecords);
    updateMilsansDueRatingKeySelection();

    const query = (els.milsansDueSearch?.value || "").trim().toLowerCase();
    const ratingFilter = els.milsansDueRatingFilter?.value || "";
    const statusFilter = els.milsansDueStatusFilter?.value || "";
    const monthFilter = els.milsansDueMonthFilter?.value || "";
    const inspectorFilter = els.milsansDueInspectorFilter?.value || "";

    const rows = allRecords
      .map(record => ({ record, due: calculateMilsansDue(record, asOfDate) }))
      .filter(({ record, due }) => {
        const searchText = `${record.facilityName} ${record.installation} ${record.buildingNumber || ""} ${record.scheduledMonth || ""} ${record.inspector || ""} ${record.recordCreatedBy || ""} ${record.assignedTeam || ""}`.toLowerCase();
        const inspectorName = record.inspector || "Not listed in DOEHRS survey field";
        return (!query || searchText.includes(query))
          && (!ratingFilter || record.rating === ratingFilter)
          && (!statusFilter || due.status === statusFilter)
          && (!monthFilter || record.scheduledMonth === monthFilter)
          && (!inspectorFilter || inspectorName === inspectorFilter);
      })
      .sort(compareMilsansDueRows);

    const descriptions = {
      URGENCY: "Missed requirements first, arranged by the most overdue required interval.",
      COMING_DUE: "Future MILSANS requirements first, arranged by the soonest required interval. Missed requirements appear afterward.",
      SCHEDULED_MONTH: "Arranged by the locally scheduled month.",
      FACILITY: "Sorted alphabetically by facility name.",
      GRADE: "Sorted by letter grade, from F through A, then by required interval."
    };
    els.milsansDueDescription.textContent = descriptions[els.milsansDueSortMode.value] || descriptions.URGENCY;
    els.milsansDueRecordCount.textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;

    if (!rows.length) {
      els.milsansDueTableBody.innerHTML = `<tr><td class="empty-row" colspan="16">No MILSANS requirements match the selected filters.</td></tr>`;
      return;
    }

    els.milsansDueTableBody.innerHTML = rows.map(({ record, due }) => {
      const totalCos = record.criticalCos + record.nonCriticalCos;
      return `
        <tr class="milsans-due-row">
          <td class="milsans-due-facility" data-label="Facility">
            <span class="table-primary">${escapeHtml(record.facilityName)}</span>
            <span class="table-secondary">${escapeHtml(record.installation || "Installation not listed")}${record.buildingNumber ? ` · Bldg ${escapeHtml(record.buildingNumber)}` : ""}</span>
            ${record.recordType && record.recordType.toLowerCase().includes("schedule only") ? `<span class="facility-access-alert">Schedule only: no completed report was supplied.</span>` : ""}
          </td>
          <td data-label="TSFC Grade">${record.rating ? milsansGradeBadge(record.rating) : `<span class="badge no-history">Not Rated</span>`}</td>
          <td data-label="Rating">${record.rating ? milsansRatingBadge(record.rating) : `<span class="badge no-history">Not Rated</span>`}</td>
          <td class="days-to-due ${statusClass(due.status)}" data-label="Days to Due">${due.status === "NO_DUE_DATE" ? "—" : due.daysToDue}</td>
          <td data-label="Due Status">${milsansDueStatusBadge(due.status)}</td>
          <td class="scheduled-date-cell" data-label="Scheduled Date">${formatMilsansActionDate(record)}</td>
          <td class="assigned-team-cell" data-label="Assigned Team">${escapeHtml(record.assignedTeam || "Unassigned")}</td>
          <td class="last-inspection-date-cell" data-label="Last Inspection Date">${record.inspectionDate ? formatDate(parseISO(record.inspectionDate)) : "—"}</td>
          <td class="last-inspector-cell" data-label="Last Inspector">${escapeHtml(record.inspector || "Not listed in DOEHRS survey field")}</td>
          <td class="missed-dates-cell" data-label="Missed Inspection Dates">${formatMilsansMissedDates(record, asOfDate)}</td>
          <td data-label="Critical">${record.criticalViolations}</td>
          <td data-label="Non-Critical">${record.nonCriticalViolations}</td>
          <td data-label="COS">${totalCos}</td>
          <td data-label="IHH">${record.imminentHealthHazard ? `<span class="badge milsans-non">Yes</span>` : `<span class="badge accessible">No</span>`}</td>
          <td data-label="Follow-Up Required">${milsansFollowUpMarkup(record)}</td>
          <td class="survey-id-cell" data-label="Survey ID">${escapeHtml(record.surveyId || "—")}</td>
        </tr>
      `;
    }).join("");
  }

  function getMilsansDueRecords() {
    const grouped = new Map();

    (state.milsansInspections || []).map(withMilsansDefaults).forEach(record => {
      const key = `${normalize(record.installation)}|${normalize(record.facilityName)}`;
      const group = grouped.get(key) || [];
      group.push(record);
      grouped.set(key, group);
    });

    return [...grouped.values()].map(group => {
      const completed = group
        .filter(record => record.surveyStatus === "Completed" && record.rating && record.inspectionDate)
        .sort((a, b) => parseISO(b.inspectionDate) - parseISO(a.inspectionDate))[0];
      const dueCarrier = group
        .filter(record => record.dueDate || record.routineDueDate || record.scheduledMonth)
        .sort((a, b) => {
          const aDate = a.dueDate ? parseISO(a.dueDate) : (a.inspectionDate ? parseISO(a.inspectionDate) : new Date(0));
          const bDate = b.dueDate ? parseISO(b.dueDate) : (b.inspectionDate ? parseISO(b.inspectionDate) : new Date(0));
          return bDate - aDate;
        })[0];

      return withMilsansDefaults({ ...(completed || dueCarrier || group[0]), ...(dueCarrier || {}), ...(completed || {}) });
    });
  }

  function renderMilsansDueSummaryCards(records) {
    const schedules = records.map(record => calculateMilsansDue(record, asOfDate));
    const counts = {
      total: records.length,
      OVERDUE: schedules.filter(s => s.status === "OVERDUE").length,
      DUE_TODAY: schedules.filter(s => s.status === "DUE_TODAY").length,
      DUE_SOON: schedules.filter(s => s.status === "DUE_SOON").length,
      UPCOMING: schedules.filter(s => s.status === "UPCOMING").length
    };
    const selected = els.milsansDueStatusFilter.value;

    els.milsansDueSummaryCards.innerHTML = `
      ${milsansDueSummaryCard("MILSANS Facilities", counts.total, "milsans-total", "", selected === "")}
      ${milsansDueSummaryCard("Missed", counts.OVERDUE, "overdue", "OVERDUE", selected === "OVERDUE")}
      ${milsansDueSummaryCard("Due Today", counts.DUE_TODAY, "today", "DUE_TODAY", selected === "DUE_TODAY")}
      ${milsansDueSummaryCard("Coming Soon", counts.DUE_SOON, "soon", "DUE_SOON", selected === "DUE_SOON")}
      ${milsansDueSummaryCard("Upcoming", counts.UPCOMING, "upcoming", "UPCOMING", selected === "UPCOMING")}
    `;
  }

  function milsansDueSummaryCard(label, value, className, statusValue, selected) {
    return `
      <button type="button" class="summary-card ${className}${selected ? " selected" : ""}"
        data-milsans-due-status="${statusValue}" aria-pressed="${selected}">
        <span class="label">${escapeHtml(label)}</span>
        <span class="value">${value}</span>
        <span class="card-action">View facilities</span>
      </button>
    `;
  }


  function handleMilsansDueRatingKeyClick(event) {
    const card = event.target.closest("[data-milsans-rating]");
    if (!card) return;

    const rating = card.dataset.milsansRating || "";
    els.milsansDueRatingFilter.value =
      els.milsansDueRatingFilter.value === rating ? "" : rating;

    renderMilsansDueDashboard();
    scrollToFirstMilsansDueRecord();
  }

  function updateMilsansDueRatingKeySelection() {
    if (!els.milsansRatingKey) return;
    const selectedRating = els.milsansDueRatingFilter?.value || "";

    els.milsansRatingKey.querySelectorAll("[data-milsans-rating]").forEach(card => {
      const selected = card.dataset.milsansRating === selectedRating;
      card.classList.toggle("selected", selected);
      card.setAttribute("aria-pressed", String(selected));
    });
  }

  function scrollToFirstMilsansDueRecord() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const first = els.milsansDueTableBody.querySelector(".milsans-due-row");
        const target = first || els.milsansDueRequirements;
        if (first) first.setAttribute("tabindex", "-1");
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.focus({ preventScroll: true });
      });
    });
  }

  function handleMilsansDueCardClick(event) {
    const card = event.target.closest("[data-milsans-due-status]");
    if (!card) return;
    const status = card.dataset.milsansDueStatus || "";
    els.milsansDueStatusFilter.value = els.milsansDueStatusFilter.value === status && status ? "" : status;
    renderMilsansDueDashboard();
    scrollToFirstMilsansDueRecord();
  }

  function calculateMilsansDue(record, asOf) {
    const normalized = withMilsansDefaults(record);

    const followUpDue = normalized.followUpRequired && normalized.followUpDate
      ? parseISO(normalized.followUpDate)
      : null;

    const requiredDue = followUpDue || calculateMilsansRequiredDate(normalized);

    if (!requiredDue) {
      return { status: "NO_DUE_DATE", nextDue: null, daysToDue: Number.MAX_SAFE_INTEGER, basis: "" };
    }

    const daysToDue = calendarDayDifference(asOf, requiredDue);
    const dueSoon = FREQUENCIES[normalized.frequency]?.dueSoon ?? 14;
    const status = daysToDue < 0
      ? "OVERDUE"
      : daysToDue === 0
        ? "DUE_TODAY"
        : daysToDue <= dueSoon
          ? "DUE_SOON"
          : "UPCOMING";

    return {
      status,
      nextDue: requiredDue,
      daysToDue,
      basis: followUpDue ? "Required follow-up date" : "Required monthly or quarterly inspection due by the 25th"
    };
  }

  function calculateMilsansRequiredDate(record) {
    if (!record.inspectionDate) return null;
    const inspectionDate = parseISO(record.inspectionDate);
    const frequency = normalizeMilsansFrequency(record.frequency) || "QUARTERLY";
    const months = frequency === "MONTHLY" ? 1 : frequency === "QUARTERLY" ? 3 : 3;
    const targetMonth = addCalendarMonths(inspectionDate, months);
    return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 25);
  }

  function parseScheduledMonthEnd(value) {
    const text = String(value || "").trim();
    if (!text) return null;

    const match = text.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (!match) return null;

    const monthIndex = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ].indexOf(match[1].toLowerCase());

    if (monthIndex < 0) return null;
    return new Date(Number(match[2]), monthIndex + 1, 0);
  }

  function calculateMilsansRoutineDue(inspectionDate, frequency) {
    const normalized = normalizeMilsansFrequency(frequency) || "QUARTERLY";
    return calculateNextDue(inspectionDate, normalized, state.customHolidays || []);
  }

  function normalizeMilsansFrequency(value) {
    const normalized = normalize(value);
    if (normalized === "monthly") return "MONTHLY";
    if (normalized === "quarterly") return "QUARTERLY";
    if (normalized === "weekly") return "WEEKLY";
    if (normalized === "biannual" || normalized === "semiannual") return "BIANNUAL";
    if (normalized === "annual" || normalized === "annually") return "ANNUAL";
    return "";
  }

  function inferMilsansFrequency(facilityName) {
    return normalize(facilityName).includes("commissary") ? "MONTHLY" : "QUARTERLY";
  }

  function compareMilsansDueRows(a, b) {
    const mode = els.milsansDueSortMode?.value || "URGENCY";
    if (mode === "FACILITY") return a.record.facilityName.localeCompare(b.record.facilityName);
    if (mode === "SCHEDULED_MONTH") {
      return compareScheduledMonths(a.record.scheduledMonth, b.record.scheduledMonth)
        || a.record.facilityName.localeCompare(b.record.facilityName);
    }
    if (mode === "GRADE") {
      const rank = { F: 0, C: 1, B: 2, A: 3, "—": 4 };
      return (rank[tsfcLetterGrade(a.record.rating)] ?? 4) - (rank[tsfcLetterGrade(b.record.rating)] ?? 4)
        || a.due.daysToDue - b.due.daysToDue
        || a.record.facilityName.localeCompare(b.record.facilityName);
    }
    if (mode === "COMING_DUE") {
      const aFuture = a.due.daysToDue >= 0 ? 0 : 1;
      const bFuture = b.due.daysToDue >= 0 ? 0 : 1;
      return aFuture - bFuture
        || (aFuture === 0 ? a.due.daysToDue - b.due.daysToDue : b.due.daysToDue - a.due.daysToDue)
        || a.record.facilityName.localeCompare(b.record.facilityName);
    }
    return a.due.daysToDue - b.due.daysToDue
      || a.record.facilityName.localeCompare(b.record.facilityName);
  }

  function calculateMilsansActionDate(record) {
    const normalized = withMilsansDefaults(record);
    if (normalized.scheduledDate) return parseISO(normalized.scheduledDate);

    const scheduledMonth = normalized.scheduledMonth
      || (normalized.scheduledMonthEndDate ? formatMonthYear(parseISO(normalized.scheduledMonthEndDate)) : "");
    const scheduledDate = parseScheduledMonthDueDate(scheduledMonth);
    if (scheduledDate) return scheduledDate;

    return normalized.inspectionDate
      ? calculateMilsansRequiredDate(normalized)
      : null;
  }

  function parseScheduledMonthDueDate(value) {
    const text = String(value || "").trim();
    if (!text) return null;
    const match = text.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (!match) return null;
    const monthIndex = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ].indexOf(match[1].toLowerCase());
    if (monthIndex < 0) return null;
    return new Date(Number(match[2]), monthIndex, 25);
  }

  function formatMilsansActionDate(record) {
    const actionDate = calculateMilsansActionDate(record);
    return actionDate ? formatDate(actionDate) : "—";
  }

  function calculateMilsansMissedDates(record, asOf) {
    const normalized = withMilsansDefaults(record);
    const asOfDay = startOfDay(asOf);

    if (normalized.followUpRequired && normalized.followUpDate) {
      const followUpDate = parseISO(normalized.followUpDate);
      return followUpDate < asOfDay ? [followUpDate] : [];
    }

    if (!normalized.inspectionDate) return [];

    const frequency = normalizeMilsansFrequency(normalized.frequency) || "QUARTERLY";
    const months = frequency === "MONTHLY" ? 1 : 3;
    const missed = [];
    let dueDate = calculateMilsansRequiredDate(normalized);

    while (dueDate && dueDate < asOfDay) {
      missed.push(dueDate);
      const nextMonth = addCalendarMonths(dueDate, months);
      dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 25);
    }

    return missed;
  }

  function formatMilsansMissedDates(record, asOf) {
    const dates = calculateMilsansMissedDates(record, asOf);
    if (!dates.length) return "—";
    return `<span class="missed-dates-list">${dates.map(date =>
      `<span class="badge overdue">${escapeHtml(formatDate(date))}</span>`
    ).join("")}</span>`;
  }

  function milsansDueStatusBadge(status) {
    const labels = {
      OVERDUE: "Missed",
      DUE_TODAY: "Due Today",
      DUE_SOON: "Coming Soon",
      UPCOMING: "Upcoming"
    };
    if (status === "NO_DUE_DATE") return `<span class="badge no-history">No Due Date</span>`;
    return `<span class="badge ${statusClass(status)}">${labels[status] || status}</span>`;
  }

  function formatMonthYear(date) {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
  }

  function renderMilsans() {
    const latest = getLatestCompletedMilsansRecords();
    renderMilsansSummaryCards(latest);
    updateMilsansRatingKeySelection();

    const query = (els.milsansSearch?.value || "").trim().toLowerCase();
    const ratingFilter = els.milsansRatingFilter?.value || "";
    const followUpFilter = els.milsansFollowUpFilter?.value || "";
    const dueStatusFilter = els.milsansDueStatusResultsFilter?.value || "";
    const monthFilter = els.milsansMonthFilter?.value || "";
    const inspectorFilter = els.milsansInspectorFilter?.value || "";

    const rows = latest
      .filter(record => {
        const searchText = `${record.facilityName} ${record.installation} ${record.surveyId} ${record.inspector || ""} ${record.recordCreatedBy || ""} ${record.assignedTeam || ""}`.toLowerCase();
        const inspectorName = record.inspector || "Not listed in DOEHRS survey field";
        const due = calculateMilsansDue(record, asOfDate);
        return (!query || searchText.includes(query))
          && (!ratingFilter || record.rating === ratingFilter)
          && (!dueStatusFilter || due.status === dueStatusFilter)
          && (!monthFilter || record.scheduledMonth === monthFilter)
          && (!inspectorFilter || inspectorName === inspectorFilter)
          && (
            !followUpFilter
            || (followUpFilter === "YES" && record.followUpRequired)
            || (followUpFilter === "NO" && !record.followUpRequired)
          );
      })
      .sort(compareMilsansRecords);

    const descriptions = {
      DUE_DATE: "Latest completed inspection per facility, arranged by the soonest required interval.",
      COMING_DUE: "Future required intervals first; missed requirements appear afterward.",
      SEVERITY: "Latest completed inspection per facility, arranged by rating severity.",
      DATE: "Latest completed inspection per facility, arranged by newest inspection date.",
      SCHEDULED_MONTH: "Latest completed inspection per facility, arranged by scheduled month.",
      FACILITY: "Latest completed inspection per facility, arranged alphabetically."
    };
    if (els.milsansDescription) {
      els.milsansDescription.textContent =
        descriptions[els.milsansSortMode?.value || "DUE_DATE"] || descriptions.DUE_DATE;
    }

    if (els.milsansRecordCount) {
      els.milsansRecordCount.textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;
    }

    if (!els.milsansTableBody) return;

    if (!rows.length) {
      els.milsansTableBody.innerHTML =
        `<tr><td class="empty-row" colspan="17">No MILSANS records match the selected filters.</td></tr>`;
      return;
    }

    els.milsansTableBody.innerHTML = rows.map(record => {
      const totalCos = record.criticalCos + record.nonCriticalCos;
      const due = calculateMilsansDue(record, asOfDate);
      return `
        <tr class="milsans-row">
          <td class="milsans-facility-cell" data-label="Facility">
            <span class="table-primary">${escapeHtml(record.facilityName)}</span>
            <span class="table-secondary">${escapeHtml(record.installation || "Installation not listed")}</span>
          </td>
          <td data-label="Last Inspection Date">${formatDate(parseISO(record.inspectionDate))}</td>
          <td data-label="Last Inspector">${escapeHtml(record.inspector || "Not listed in DOEHRS survey field")}</td>
          <td data-label="DOEHRS Record Created By">${escapeHtml(record.recordCreatedBy || "—")}</td>
          <td data-label="Rating">${milsansRatingBadge(record.rating)}</td>
          <td class="milsans-grade-cell" data-label="TSFC Grade">${milsansGradeBadge(record.rating)}</td>
          <td class="days-to-due ${statusClass(due.status)}" data-label="Days to Due">${due.status === "NO_DUE_DATE" ? "—" : due.daysToDue}</td>
          <td data-label="Due Status">${milsansDueStatusBadge(due.status)}</td>
          <td class="scheduled-date-cell" data-label="Scheduled Date">${formatMilsansActionDate(record)}</td>
          <td class="assigned-team-cell" data-label="Assigned Team">${escapeHtml(record.assignedTeam || "Unassigned")}</td>
          <td class="missed-dates-cell" data-label="Missed Inspection Dates">${formatMilsansMissedDates(record, asOfDate)}</td>
          <td data-label="Critical">${record.criticalViolations}</td>
          <td data-label="Non-Critical">${record.nonCriticalViolations}</td>
          <td data-label="COS">${totalCos}</td>
          <td data-label="IHH">${record.imminentHealthHazard ? `<span class="badge milsans-non">Yes</span>` : `<span class="badge accessible">No</span>`}</td>
          <td data-label="Follow-Up Required">${milsansFollowUpMarkup(record)}</td>
          <td data-label="Survey ID">${escapeHtml(record.surveyId || "—")}</td>
        </tr>
      `;
    }).join("");
  }

  function getLatestCompletedMilsansRecords() {
    const grouped = new Map();

    (state.milsansInspections || [])
      .map(withMilsansDefaults)
      .filter(record =>
        record.surveyStatus === "Completed"
        && record.rating
        && record.inspectionDate
      )
      .forEach(record => {
        const key = `${normalize(record.installation)}|${normalize(record.facilityName)}`;
        const current = grouped.get(key);
        if (!current || parseISO(record.inspectionDate) > parseISO(current.inspectionDate)) {
          grouped.set(key, record);
        }
      });

    return [...grouped.values()];
  }

  function renderMilsansSummaryCards(records) {
    if (!els.milsansSummaryCards) return;

    const counts = {
      total: records.length,
      "Fully Compliant": records.filter(r => r.rating === "Fully Compliant").length,
      "Substantially Compliant": records.filter(r => r.rating === "Substantially Compliant").length,
      "Partially Compliant": records.filter(r => r.rating === "Partially Compliant").length,
      "Non-Compliant": records.filter(r => r.rating === "Non-Compliant").length,
      followUp: records.filter(r => r.followUpRequired).length
    };

    const selectedRating = els.milsansRatingFilter?.value || "";
    const selectedFollowUp = els.milsansFollowUpFilter?.value || "";
    const allSelected = !selectedRating && !selectedFollowUp;

    els.milsansSummaryCards.innerHTML = `
      ${milsansSummaryCard("Rated Facilities", counts.total, "milsans-total", { clearAll: true, isSelected: allSelected })}
      ${milsansSummaryCard("A — Fully Compliant", counts["Fully Compliant"], "milsans-fully", { rating: "Fully Compliant", isSelected: selectedRating === "Fully Compliant" && !selectedFollowUp })}
      ${milsansSummaryCard("B — Substantially Compliant", counts["Substantially Compliant"], "milsans-substantial", { rating: "Substantially Compliant", isSelected: selectedRating === "Substantially Compliant" && !selectedFollowUp })}
      ${milsansSummaryCard("C — Partially Compliant", counts["Partially Compliant"], "milsans-partial", { rating: "Partially Compliant", isSelected: selectedRating === "Partially Compliant" && !selectedFollowUp })}
      ${milsansSummaryCard("F — Noncompliant", counts["Non-Compliant"], "milsans-non", { rating: "Non-Compliant", isSelected: selectedRating === "Non-Compliant" && !selectedFollowUp })}
      ${milsansSummaryCard("Follow-Up Required", counts.followUp, "milsans-followup", { followUp: "YES", isSelected: selectedFollowUp === "YES" && !selectedRating })}
    `;
  }

  function milsansSummaryCard(label, value, className, options = {}) {
    const { rating = "", followUp = "", clearAll = false, isSelected = false } = options;
    return `
      <button
        type="button"
        class="summary-card ${className}${isSelected ? " selected" : ""}"
        data-milsans-rating="${escapeAttr(rating)}"
        data-milsans-followup="${escapeAttr(followUp)}"
        data-milsans-clear="${clearAll ? "true" : "false"}"
        aria-label="Show ${escapeAttr(label.toLowerCase())}"
        aria-pressed="${isSelected}"
      >
        <span class="label">${escapeHtml(label)}</span>
        <span class="value">${value}</span>
        <span class="card-action">View facilities</span>
      </button>
    `;
  }

  function handleMilsansCardClick(event) {
    const card = event.target.closest("[data-milsans-rating], [data-milsans-followup], [data-milsans-clear]");
    if (!card) return;

    const rating = card.dataset.milsansRating || "";
    const followUp = card.dataset.milsansFollowup || "";
    const clearAll = card.dataset.milsansClear === "true";

    if (clearAll) {
      els.milsansRatingFilter.value = "";
      els.milsansFollowUpFilter.value = "";
    } else if (rating) {
      const alreadySelected = els.milsansRatingFilter.value === rating && !els.milsansFollowUpFilter.value;
      els.milsansRatingFilter.value = alreadySelected ? "" : rating;
      els.milsansFollowUpFilter.value = "";
    } else if (followUp) {
      const alreadySelected = els.milsansFollowUpFilter.value === followUp && !els.milsansRatingFilter.value;
      els.milsansFollowUpFilter.value = alreadySelected ? "" : followUp;
      els.milsansRatingFilter.value = "";
    }

    renderMilsans();
    scrollToFirstMilsansRecord();
  }


  function updateMilsansRatingKeySelection() {
    if (!els.milsansRatingKey) return;
    const selectedRating = els.milsansRatingFilter?.value || "";
    els.milsansRatingKey.querySelectorAll("[data-milsans-rating]").forEach(card => {
      const selected = card.dataset.milsansRating === selectedRating;
      card.classList.toggle("selected", selected);
      card.setAttribute("aria-pressed", String(selected));
    });
  }

  function scrollToFirstMilsansRecord() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const firstRecord = els.milsansTableBody.querySelector(".milsans-row");
        const target = firstRecord || els.milsansResults;
        if (firstRecord) firstRecord.setAttribute("tabindex", "-1");
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.focus({ preventScroll: true });
      });
    });
  }

  function compareMilsansRecords(a, b) {
    const mode = els.milsansSortMode?.value || "DUE_DATE";
    const aDue = calculateMilsansDue(a, asOfDate);
    const bDue = calculateMilsansDue(b, asOfDate);

    if (mode === "DUE_DATE") {
      return aDue.daysToDue - bDue.daysToDue
        || a.facilityName.localeCompare(b.facilityName);
    }
    if (mode === "COMING_DUE") {
      const aFuture = aDue.daysToDue >= 0 ? 0 : 1;
      const bFuture = bDue.daysToDue >= 0 ? 0 : 1;
      return aFuture - bFuture
        || (aFuture === 0 ? aDue.daysToDue - bDue.daysToDue : bDue.daysToDue - aDue.daysToDue)
        || a.facilityName.localeCompare(b.facilityName);
    }
    if (mode === "DATE") {
      return parseISO(b.inspectionDate) - parseISO(a.inspectionDate)
        || a.facilityName.localeCompare(b.facilityName);
    }
    if (mode === "SCHEDULED_MONTH") {
      return compareScheduledMonths(a.scheduledMonth, b.scheduledMonth)
        || a.facilityName.localeCompare(b.facilityName);
    }
    if (mode === "FACILITY") {
      return a.facilityName.localeCompare(b.facilityName)
        || parseISO(b.inspectionDate) - parseISO(a.inspectionDate);
    }

    const rank = {
      "Non-Compliant": 0,
      "Partially Compliant": 1,
      "Substantially Compliant": 2,
      "Fully Compliant": 3
    };
    return (rank[a.rating] ?? 99) - (rank[b.rating] ?? 99)
      || Number(b.followUpRequired) - Number(a.followUpRequired)
      || aDue.daysToDue - bDue.daysToDue
      || a.facilityName.localeCompare(b.facilityName);
  }

  function withMilsansDefaults(record) {
    return {
      ...record,
      surveyId: record.surveyId || "",
      installation: record.installation || "",
      facilityName: record.facilityName || "",
      inspectionDate: record.inspectionDate || "",
      surveyStatus: normalizeSurveyStatus(record.surveyStatus || "Completed"),
      rating: normalizeMilsansRating(record.rating || ""),
      imminentHealthHazard: Boolean(record.imminentHealthHazard),
      criticalViolations: parseWholeNumber(record.criticalViolations),
      criticalCos: parseWholeNumber(record.criticalCos),
      nonCriticalViolations: parseWholeNumber(record.nonCriticalViolations),
      nonCriticalCos: parseWholeNumber(record.nonCriticalCos),
      followUpRequired: Boolean(record.followUpRequired),
      followUpDate: record.followUpDate || null,
      frequency: normalizeMilsansFrequency(record.frequency || record.inspectionFrequency || "") || inferMilsansFrequency(record.facilityName || ""),
      buildingNumber: record.buildingNumber || extractBuildingNumber(record.facilityName || ""),
      routineDueDate: record.routineDueDate || null,
      dueDate: record.dueDate || record.nextActionDueDate || null,
      scheduledMonth: record.scheduledMonth || "",
      dueDateBasis: record.dueDateBasis || "",
      recordType: record.recordType || "",
      inspector: record.inspector || record.lastInspector || record.surveyor || "",
      assignedTeam: record.assignedTeam || "",
      scheduledDate: record.scheduledDate || null,
      recordCreatedBy: record.recordCreatedBy || record.createdBy || "",
      scheduledMonthEndDate: record.scheduledMonthEndDate || null
    };
  }



  function populateMilsansMonthFilters() {
    const months = unique(
      (state.milsansInspections || [])
        .map(withMilsansDefaults)
        .map(record => record.scheduledMonth)
    ).sort(compareScheduledMonths);

    if (els.milsansDueMonthFilter) {
      populateSelect(els.milsansDueMonthFilter, months, "All scheduled months");
    }
    if (els.milsansMonthFilter) {
      populateSelect(els.milsansMonthFilter, months, "All scheduled months");
    }
  }

  function compareScheduledMonths(a, b) {
    const aDate = parseScheduledMonthEnd(a);
    const bDate = parseScheduledMonthEnd(b);
    if (aDate && bDate) return aDate - bDate;
    if (aDate) return -1;
    if (bDate) return 1;
    return String(a || "").localeCompare(String(b || ""));
  }

  function populateMilsansInspectorFilters() {
    const inspectors = unique(
      (state.milsansInspections || [])
        .map(withMilsansDefaults)
        .map(record => record.inspector || "Not listed in DOEHRS survey field")
    );

    if (els.milsansDueInspectorFilter) {
      populateSelect(els.milsansDueInspectorFilter, inspectors, "All inspectors");
    }
    if (els.milsansInspectorFilter) {
      populateSelect(els.milsansInspectorFilter, inspectors, "All inspectors");
    }
  }

  function normalizeMilsansRating(value) {
    const normalized = normalize(value);
    if (normalized === "fullycompliant") return "Fully Compliant";
    if (normalized === "substantiallycompliant") return "Substantially Compliant";
    if (normalized === "partiallycompliant") return "Partially Compliant";
    if (normalized === "noncompliant") return "Non-Compliant";
    return "";
  }


  function tsfcLetterGrade(rating) {
    return {
      "Fully Compliant": "A",
      "Substantially Compliant": "B",
      "Partially Compliant": "C",
      "Non-Compliant": "F"
    }[normalizeMilsansRating(rating)] || "—";
  }

  function normalizeSurveyStatus(value) {
    const normalized = normalize(value);
    if (normalized.includes("inprogress")) return "In Progress";
    if (normalized.includes("complete")) return "Completed";
    return String(value || "").trim() || "Completed";
  }

  function parseMilsansDate(value) {
    const text = String(value || "").trim();
    if (!text) return null;

    const ymd = text.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
    if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
    return parseFlexibleDate(text);
  }

  function parseYesNo(value) {
    const normalized = normalize(value);
    if (["yes", "y", "true", "1", "xyes"].includes(normalized)) return true;
    if (["no", "n", "false", "0", "xno"].includes(normalized)) return false;
    return null;
  }

  function parseWholeNumber(value) {
    const number = Number.parseInt(String(value ?? "").trim(), 10);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  }

  function milsansRatingBadge(rating) {
    const className = {
      "Fully Compliant": "milsans-fully",
      "Substantially Compliant": "milsans-substantial",
      "Partially Compliant": "milsans-partial",
      "Non-Compliant": "milsans-non"
    }[rating] || "no-history";
    return `<span class="badge ${className}">${escapeHtml(rating || "Not Rated")}</span>`;
  }


  function milsansGradeBadge(rating) {
    const grade = tsfcLetterGrade(rating);
    const className = {
      A: "grade-a",
      B: "grade-b",
      C: "grade-c",
      F: "grade-f"
    }[grade] || "grade-none";

    return `
      <span class="tsfc-grade-badge ${className}" aria-label="Tri-Service Food Code grade equivalent ${grade}">
        ${grade}
      </span>
    `;
  }

  function milsansFollowUpMarkup(record) {
    if (!record.followUpRequired) return `<span class="badge accessible">No</span>`;

    const dateText = record.followUpDate
      ? `<span class="access-detail">Due ${formatDate(parseISO(record.followUpDate))}</span>`
      : "";

    return `
      <span class="access-stack">
        <span class="badge milsans-followup">Required</span>
        ${dateText}
      </span>
    `;
  }

  function exportMilsansCsv() {
    const headers = [
      "Survey ID", "Last Inspector", "Assigned Team", "DOEHRS Record Created By", "Installation", "Facility",
      "Last Inspection Date", "Survey Status", "Overall Inspection Rating", "TSFC Letter Grade Equivalent",
      "Imminent Health Hazard", "Critical Violations", "Critical COS",
      "Non-Critical Violations", "Non-Critical COS", "Follow-Up Required", "Follow-Up Date",
      "Inspection Frequency", "Building Number", "Scheduled Month", "Scheduled Date", "Missed Inspection Dates", "Days to Due", "Due Status", "Record Type"
    ];

    const rows = (state.milsansInspections || [])
      .map(withMilsansDefaults)
      .sort((a, b) => parseISO(b.inspectionDate) - parseISO(a.inspectionDate))
      .map(record => {
        const due = calculateMilsansDue(record, asOfDate);
        return [
          record.surveyId,
          record.inspector || "Not listed in DOEHRS survey field",
          record.assignedTeam || "Unassigned",
          record.recordCreatedBy || "",
          record.installation,
          record.facilityName,
          record.inspectionDate,
          record.surveyStatus,
          record.rating,
          tsfcLetterGrade(record.rating),
          record.imminentHealthHazard ? "Yes" : "No",
          record.criticalViolations,
          record.criticalCos,
          record.nonCriticalViolations,
          record.nonCriticalCos,
          record.followUpRequired ? "Yes" : "No",
          record.followUpDate || "",
          FREQUENCIES[record.frequency]?.label || record.frequency,
          record.buildingNumber || "",
          record.scheduledMonth || "",
          calculateMilsansActionDate(record) ? toISO(calculateMilsansActionDate(record)) : "",
          calculateMilsansMissedDates(record, asOfDate).map(toISO).join("; "),
          due.status === "NO_DUE_DATE" ? "" : due.daysToDue,
          { OVERDUE: "Missed", DUE_TODAY: "Due Today", DUE_SOON: "Coming Soon", UPCOMING: "Upcoming", NO_DUE_DATE: "No Due Date" }[due.status] || due.status,
          record.recordType || ""
        ];
      });

    const csv = [headers, ...rows].map(row => row.map(csvEscape).join(",")).join("\n");
    downloadFile(`sentinel-milsans-results-${toISO(new Date())}.csv`, csv, "text/csv;charset=utf-8");
    showToast("MILSANS CSV exported.");
  }


  function previousBusinessDay(date, customHolidays) {
    let candidate = addDays(date, -1);
    while (!isBusinessDay(candidate, customHolidays)) candidate = addDays(candidate, -1);
    return candidate;
  }

  async function importInspectionCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const rows = parseCsv(await file.text());
      const headerIndex = rows.findIndex(row => {
        const normalized = row.map(value => normalizeHeader(value));
        return normalized.includes("facility")
          && normalized.includes("date")
          && normalized.includes("agency");
      });

      if (headerIndex < 0) {
        throw new Error("Could not find the inspection CSV column header row.");
      }

      const headers = rows[headerIndex].map(value => String(value || "").trim());
      const headerMap = Object.fromEntries(headers.map((header, index) => [normalizeHeader(header), index]));
      const required = ["installation", "agency", "facility", "date"];
      const missing = required.filter(name => headerMap[name] === undefined);
      if (missing.length) {
        throw new Error(`Missing required columns: ${missing.join(", ")}`);
      }

      const grouped = new Map();
      let datedRowsConsidered = 0;

      rows.slice(headerIndex + 1).forEach(row => {
        const facilityName = String(row[headerMap.facility] || "").trim();
        const sourceAgency = String(row[headerMap.agency] || "").trim();
        const installation = String(row[headerMap.installation] || "").trim();
        const inspectedDate = parseFparDate(String(row[headerMap.date] || "").trim());

        if (!facilityName || !sourceAgency || !installation || !inspectedDate) return;
        datedRowsConsidered += 1;

        // Sentinel is a workload-visibility tool. Use the latest inspection date
        // listed for each facility, regardless of workflow status.
        const key = `${normalize(installation)}|${normalize(sourceAgency)}|${normalize(facilityName)}`;
        const current = grouped.get(key);
        if (!current || inspectedDate > current.inspectedDate) {
          grouped.set(key, {
            facilityName,
            sourceAgency,
            installation,
            inspectedDate
          });
        }
      });

      if (!grouped.size) {
        throw new Error("No dated inspection records were found.");
      }

      if (state.facilities.length && !confirm(
        `Replace the ${state.facilities.length} facilities currently stored in this browser with ${grouped.size} facilities from this CSV?\n\nExport a JSON backup first if needed.`
      )) {
        return;
      }

      const now = new Date().toISOString();
      const importedFacilities = [...grouped.values()].map(record => {
        const previous = state.facilities.find(f =>
          normalize(f.installation) === normalize(record.installation)
          && normalize(f.name) === normalize(record.facilityName)
        );

        return {
          id: previous?.id || crypto.randomUUID(),
          name: record.facilityName,
          buildingNumber: extractBuildingNumber(record.facilityName),
          installation: record.installation,
          agency: normalizeAgency(record.sourceAgency, record.facilityName),
          assignedInspector: previous?.assignedInspector || "",
          frequency: inferImportFrequency(record.sourceAgency, record.facilityName),
          lastConductedDate: toISO(record.inspectedDate),
          active: previous?.active ?? true,
          inaccessible: Boolean(previous?.inaccessible),
          inaccessibilityReason: previous?.inaccessibilityReason || "",
          inaccessibilityDate: previous?.inaccessibilityDate || null,
          createdAt: previous?.createdAt || now,
          updatedAt: now
        };
      });

      state = {
        facilities: importedFacilities,
        customHolidays: state.customHolidays || [],
        milsansInspections: state.milsansInspections || [],
        audit: state.audit || []
      };

      addAudit("FPAR_CSV_IMPORTED", crypto.randomUUID(), null, {
        fileName: file.name,
        facilitiesImported: importedFacilities.length,
        datedRowsConsidered,
        dateSelectionRule: "Latest inspection date listed for each facility, regardless of workflow status",
        importedAt: now
      });

      saveState();
      renderAll();
      showToast(`${importedFacilities.length} facilities imported. Latest inspection dates were used.`);
    } catch (error) {
      alert(`Could not import inspection CSV: ${error.message}`);
    }
  }


  async function importInaccessibleCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!state.facilities.length) {
      alert("Import the inspection CSV first so Sentinel has facilities to match.");
      return;
    }

    try {
      const rows = parseCsv(await file.text());
      const headerIndex = rows.findIndex(row => {
        const normalized = row.map(value => normalizeHeader(value));
        return normalized.includes("facility")
          && normalized.includes("installation")
          && normalized.includes("inaccessibilityreason");
      });

      if (headerIndex < 0) {
        throw new Error("Could not find the inaccessible facility CSV column header row.");
      }

      const headers = rows[headerIndex].map(value => String(value || "").trim());
      const headerMap = Object.fromEntries(headers.map((header, index) => [normalizeHeader(header), index]));
      const required = ["installation", "facility", "inaccessibilityreason"];
      const missing = required.filter(name => headerMap[name] === undefined);
      if (missing.length) {
        throw new Error(`Missing required columns: ${missing.join(", ")}`);
      }

      const records = rows.slice(headerIndex + 1)
        .map(row => {
          const installation = String(row[headerMap.installation] || "").trim();
          const facilityName = String(row[headerMap.facility] || "").trim();
          const sourceAgency = headerMap.agency === undefined ? "" : String(row[headerMap.agency] || "").trim();
          const reason = String(row[headerMap.inaccessibilityreason] || "").trim();
          const dateValue = headerMap.inaccessibilitydate === undefined ? "" : String(row[headerMap.inaccessibilitydate] || "").trim();
          const parsedDate = parseFlexibleDate(dateValue);

          return {
            installation,
            facilityName,
            sourceAgency,
            reason,
            inaccessibleDate: parsedDate ? toISO(parsedDate) : null
          };
        })
        .filter(record => record.installation && record.facilityName && record.reason);

      if (!records.length) {
        throw new Error("No inaccessible facility records were found.");
      }

      if (!confirm(
        `Apply ${records.length} inaccessible facility records to Sentinel?\n\nExisting inaccessible flags will be cleared first, then matching facilities from this file will be marked inaccessible. Export a JSON backup first if needed.`
      )) {
        return;
      }

      state.facilities = state.facilities.map(f => ({
        ...f,
        inaccessible: false,
        inaccessibilityReason: "",
        inaccessibilityDate: null
      }));

      const unmatched = [];
      let matchedCount = 0;
      const now = new Date().toISOString();

      records.forEach(record => {
        const facility = findAccessImportMatch(record);
        if (!facility) {
          unmatched.push(record.facilityName);
          return;
        }

        facility.inaccessible = true;
        facility.inaccessibilityReason = record.reason;
        facility.inaccessibilityDate = record.inaccessibleDate;
        facility.updatedAt = now;
        matchedCount += 1;
      });

      addAudit("INACCESSIBLE_CSV_IMPORTED", crypto.randomUUID(), null, {
        fileName: file.name,
        recordsRead: records.length,
        facilitiesMatched: matchedCount,
        unmatchedFacilities: unmatched.length,
        importedAt: now
      });

      saveState();
      renderAll();
      showToast(`${matchedCount} facilities marked inaccessible. ${unmatched.length} unmatched.`);

      if (unmatched.length) {
        const preview = unmatched.slice(0, 8).map(name => `• ${name}`).join("\n");
        alert(
          `${unmatched.length} inaccessible record${unmatched.length === 1 ? "" : "s"} could not be matched.\n\n${preview}${unmatched.length > 8 ? "\n• …" : ""}\n\nConfirm the facility names and installation values match the inspection CSV.`
        );
      }
    } catch (error) {
      alert(`Could not import inaccessible facility CSV: ${error.message}`);
    }
  }

  function findAccessImportMatch(record) {
    const sameInstallation = state.facilities.filter(f =>
      normalize(f.installation) === normalize(record.installation)
    );

    const exactName = sameInstallation.filter(f =>
      normalize(f.name) === normalize(record.facilityName)
    );

    if (exactName.length === 1) return exactName[0];

    if (exactName.length > 1 && record.sourceAgency) {
      const normalizedAgency = normalizeAgency(record.sourceAgency, record.facilityName);
      const agencyMatch = exactName.find(f => normalize(f.agency) === normalize(normalizedAgency));
      if (agencyMatch) return agencyMatch;
    }

    const similar = sameInstallation
      .map(f => ({ facility: f, score: similarity(normalize(f.name), normalize(record.facilityName)) }))
      .filter(item => item.score >= 0.90)
      .sort((a, b) => b.score - a.score);

    return similar.length === 1 || (similar[0] && similar[0].score > (similar[1]?.score ?? 0))
      ? similar[0]?.facility || null
      : null;
  }

  function parseFlexibleDate(value) {
    const text = String(value || "").trim();
    if (!text) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return parseISO(text);
    }

    const fparDate = parseFparDate(text);
    if (fparDate) return fparDate;

    const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
      return new Date(Number(slash[3]), Number(slash[1]) - 1, Number(slash[2]));
    }

    return null;
  }

  function inferImportFrequency(sourceAgency, facilityName) {
    const name = String(facilityName || "");
    const agency = String(sourceAgency || "");

    if (/\b(mobile|truck)\b/i.test(name)) return "QUARTERLY";
    if (
      /\bdfac\b/i.test(name)
      || /\bdining\s+facility\b/i.test(name)
      || /\bssmo\b/i.test(name)
      || agency === "Army Troop Feeding"
      || agency === "Hospital Commander"
    ) {
      return "WEEKLY";
    }
    return "MONTHLY";
  }

  function normalizeAgency(sourceAgency, facilityName) {
    if (sourceAgency === "Army Air Force Exchange Service") return "AAFES";
    if (sourceAgency === "Defense Commissary Agency") return "DECA";
    if (sourceAgency === "Morale Welfare & Recreation") return "MWR";
    if (sourceAgency === "Department of Defense Dependent Schools") return "DoDEA";
    if (
      sourceAgency === "Army Troop Feeding"
      || sourceAgency === "Hospital Commander"
      || /\bdfac\b|\bdining\s+facility\b/i.test(facilityName)
    ) {
      return "Dining Facility";
    }
    return "Other";
  }

  function extractBuildingNumber(facilityName) {
    const name = String(facilityName || "").trim();

    if (/\b(mobile|truck)\b/i.test(name) && !/\b(?:bldg|building)\b/i.test(name)) {
      return "MOBILE";
    }

    const labeled = name.match(/\b(?:bldg|bldg\.|building|#bldg|bldg:)\s*[:#-]?\s*([PS]-?\d+(?:\/\d+)?|\d+(?:\/\d+)?)/i);
    if (labeled) return labeled[1].replace(/\s+/g, "");

    const trailing = name.match(/\b(\d{3,5})\s*$/);
    return trailing ? trailing[1] : "";
  }

  function parseFparDate(value) {
    const match = String(value || "").trim().match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/);
    if (!match) return null;

    const monthIndex = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    }[match[1]];

    if (monthIndex === undefined) return null;
    return new Date(Number(match[3]), monthIndex, Number(match[2]));
  }

  function normalizeHeader(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"' && inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(field);
        field = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(field);
        if (row.some(value => value !== "")) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    row.push(field);
    if (row.some(value => value !== "")) rows.push(row);
    return rows;
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
      state = {
        facilities: parsed.facilities.map(withAccessDefaults),
        customHolidays: parsed.customHolidays,
        milsansInspections: Array.isArray(parsed.milsansInspections)
          ? parsed.milsansInspections.map(withMilsansDefaults)
          : [],
        audit: Array.isArray(parsed.audit) ? parsed.audit : []
      };
      saveState();
      renderAll();
      showToast("Backup restored.");
    } catch (error) {
      alert(`Could not restore backup: ${error.message}`);
    }
  }


  function printFparCards() {
    const rows = [...els.trackerTableBody.querySelectorAll(".inspection-row")];
    if (!rows.length) { showToast("No visible FPAR facility cards are available to print."); return; }
    const inaccessible = rows.filter(row => row.dataset.inaccessible === "true").length;
    const status = els.statusFilter.options[els.statusFilter.selectedIndex]?.text || "All statuses";
    const sort = els.sortMode.options[els.sortMode.selectedIndex]?.text || "Current order";
    startCardPrint("fpar", "Sentinel FPAR Facility Cards", `${rows.length} facilities | ${inaccessible} inaccessible | ${status} | ${sort} | Status as of ${formatDate(asOfDate)}`);
  }

  function printMilsansCards() {
    const rows = [...els.milsansDueTableBody.querySelectorAll(".milsans-due-row")];
    if (!rows.length) { showToast("No visible MILSANS facility cards are available to print."); return; }
    const status = els.milsansDueStatusFilter.options[els.milsansDueStatusFilter.selectedIndex]?.text || "All due statuses";
    const month = els.milsansDueMonthFilter.options[els.milsansDueMonthFilter.selectedIndex]?.text || "All scheduled months";
    const inspector = els.milsansDueInspectorFilter.options[els.milsansDueInspectorFilter.selectedIndex]?.text || "All inspectors";
    const sort = els.milsansDueSortMode.options[els.milsansDueSortMode.selectedIndex]?.text || "Current order";
    startCardPrint("milsans-due", "Sentinel MILSANS Facility Cards", `${rows.length} records | ${status} | ${month} | ${inspector} | ${sort} | Status as of ${formatDate(asOfDate)}`);
  }

  function startCardPrint(mode, title, summary) {
    els.printTitle.textContent = title;
    els.printSummary.textContent = summary;
    document.body.classList.remove("printing-cards", "print-mode-fpar", "print-mode-milsans-due", "print-mode-milsans-results", "print-mode-combined");
    document.body.classList.add("printing-cards", `print-mode-${mode}`);
    const cleanup = () => {
      document.body.classList.remove("printing-cards", "print-mode-fpar", "print-mode-milsans-due", "print-mode-milsans-results", "print-mode-combined");
    };
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
  }


  function exportCsv() {
    const headers = ["Facility", "Building Number", "Installation", "Agency", "Assigned Inspector", "Frequency", "Last Inspected", "Due Date", "Days to Due", "Status", "Accessibility", "Inaccessibility Reason", "Inaccessibility Date"];
    const rows = state.facilities
      .filter(f => f.active)
      .map(f => {
        const schedule = calculateSchedule(f, asOfDate, state.customHolidays);
        return [
          f.name,
          f.buildingNumber,
          f.installation,
          f.agency,
          f.assignedInspector || "Unassigned",
          FREQUENCIES[f.frequency]?.label || f.frequency,
          f.lastConductedDate || "",
          schedule.nextDue ? toISO(schedule.nextDue) : "",
          schedule.status === "NO_HISTORY" ? "" : schedule.daysToDue,
          schedule.status,
          f.inaccessible ? "Inaccessible" : "Accessible",
          f.inaccessibilityReason || "",
          f.inaccessibilityDate || ""
        ];
      })
      .sort((a, b) => {
        const aDays = a[8] === "" ? Number.MAX_SAFE_INTEGER : Number(a[8]);
        const bDays = b[8] === "" ? Number.MAX_SAFE_INTEGER : Number(b[8]);
        return aDays - bDays;
      });

    const csv = [headers, ...rows].map(row => row.map(csvEscape).join(",")).join("\n");
    downloadFile(`sentinel-inspection-readiness-${toISO(asOfDate)}.csv`, csv, "text/csv;charset=utf-8");
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


  function withAccessDefaults(facility) {
    return {
      ...facility,
      inaccessible: Boolean(facility.inaccessible),
      inaccessibilityReason: facility.inaccessibilityReason || "",
      inaccessibilityDate: facility.inaccessibilityDate || null
    };
  }

  function accessStatusMarkup(facility) {
    if (!facility.inaccessible) {
      return `<span class="badge accessible">Accessible</span>`;
    }

    const dateText = facility.inaccessibilityDate
      ? `<span class="access-detail">Since ${formatDate(parseISO(facility.inaccessibilityDate))}</span>`
      : "";

    return `
      <span class="access-stack">
        <span class="badge inaccessible">Inaccessible</span>
        <span class="access-detail">${escapeHtml(facility.inaccessibilityReason || "Reason not listed")}</span>
        ${dateText}
      </span>
    `;
  }

  function statusClass(status) {
    return {
      OVERDUE: "overdue",
      DUE_TODAY: "today",
      DUE_SOON: "soon",
      UPCOMING: "upcoming",
      NO_HISTORY: "no-history"
    }[status] || "no-history";
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


  function scrollPageToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollPageToBottom() {
    const pageBottom = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    window.scrollTo({ top: pageBottom, behavior: "smooth" });
  }

  function updateQuickScrollControls() {
    if (!els.quickScrollControls) return;

    const currentTop = window.scrollY || document.documentElement.scrollTop || 0;
    const viewportBottom = currentTop + window.innerHeight;
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    const pageNeedsScrolling = pageHeight > window.innerHeight + 120;
    const nearTop = currentTop <= 80;
    const nearBottom = viewportBottom >= pageHeight - 80;

    els.quickScrollControls.classList.toggle("hidden", !pageNeedsScrolling);
    els.scrollToTopBtn.disabled = nearTop;
    els.scrollToBottomBtn.disabled = nearBottom;
    els.scrollToTopBtn.setAttribute("aria-disabled", String(nearTop));
    els.scrollToBottomBtn.setAttribute("aria-disabled", String(nearBottom));
  }

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
