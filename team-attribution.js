(function attachTeamAttribution(root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SentinelTeamAttribution = api;
})(typeof globalThis === "object" ? globalThis : this, function createTeamAttribution() {
  "use strict";

  function normalizePersonName(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function resolveTeam(inspectorName, teams, reportedTeam = "") {
    const safeTeams = Array.isArray(teams) ? teams : [];
    const reportedKey = normalizePersonName(reportedTeam);
    const reportedMatch = safeTeams.find(team => normalizePersonName(team?.name) === reportedKey);
    const inspectorKey = normalizePersonName(inspectorName);
    if (reportedKey && !reportedMatch) {
      return {
        status: inspectorKey ? "conflict" : "unmatched",
        team: "",
        source: "Reported completion team is not in the synthetic directory"
      };
    }
    if (reportedMatch && !inspectorKey) {
      return {
        status: "reported",
        team: reportedMatch.name,
        source: "Reported completion team"
      };
    }
    if (!inspectorKey) {
      return { status: "unmatched", team: "", source: "Completed-by name not supplied" };
    }

    const matches = safeTeams.filter(team =>
      Array.isArray(team?.members)
      && team.members.some(member => normalizePersonName(member) === inspectorKey)
    );

    if (matches.length > 1) {
      return { status: "ambiguous", team: "", source: "Name appears on more than one synthetic team" };
    }
    if (reportedMatch && (matches.length !== 1 || matches[0].name !== reportedMatch.name)) {
      return {
        status: "conflict",
        team: "",
        source: "Completed-by name conflicts with the reported completion team"
      };
    }
    if (reportedMatch && matches.length === 1) {
      return {
        status: "reported",
        team: reportedMatch.name,
        source: "Reported team and exact synthetic directory match agree"
      };
    }
    if (matches.length === 1) {
      return {
        status: "matched",
        team: matches[0].name,
        source: "Exact synthetic directory match"
      };
    }
    return { status: "unmatched", team: "", source: "No exact synthetic directory match" };
  }

  return { normalizePersonName, resolveTeam };
});
