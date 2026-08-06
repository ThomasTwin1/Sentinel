# Sentinel

> **Secure conference prototype (v0.6.3):** This branch combines a passphrase-encrypted local vault with an in-memory, fictional DFAC Grade Board for phone and conference demonstrations. The A, B, C, F, and Follow-Up Required summary tiles filter the board, while facility letter grades open the matching inspection details inside Sentinel. It also includes transactional backup verification, immediate background privacy locking, bounded imports with common CSV quote compatibility, and safe service-worker upgrades. It is **not** an approved Army information system and does not authorize CUI, PII, classified, or operational data. See [INTERIM_SECURITY.md](INTERIM_SECURITY.md).

**Protecting Soldiers Through Smarter Food Protection.**

[Live fictional demo](https://thomastwin1.github.io/Sentinel/) · [Feature and test guide](TRACKER_README.md) · [Interim security boundary](INTERIM_SECURITY.md) · [Local data rules](LOCAL_REAL_DATA_TESTING.md) · [Security reporting](SECURITY.md)

Sentinel is an AI-powered **Army Veterinary Services Operations Suite** focused on food protection, food inspections, food defense, foodborne illness investigations, and operational readiness.

The project is designed to support Army Veterinary Services personnel and partner public health teams by improving inspection workflows, strengthening documentation, accelerating investigation support, and giving leaders clearer visibility into food safety risk across operational environments.

## Mission

Sentinel's mission is to help protect Soldiers by making food protection operations faster, more consistent, and more intelligence-driven.

Army Veterinary Services plays a critical role in sustaining the force through food safety, approved source verification, sanitation oversight, food defense, and investigation support. Sentinel exists to organize that work into a modern operational platform that helps teams identify risk, prioritize action, and maintain readiness.

## Vision

Sentinel aims to become the digital operations backbone for Army Veterinary Services food protection missions.

The long-term vision is a platform that helps units:

- Coordinate food inspection requirements across garrison, field, deployment, and contingency environments.
- Standardize inspection documentation and corrective action tracking.
- Identify food safety and food defense risks earlier.
- Support foodborne illness investigations with organized timelines, evidence, and reporting.
- Improve communication between Veterinary Services, Preventive Medicine, supported units, and command teams.
- Give leaders real-time visibility into inspection status, risk trends, readiness impacts, and mission coverage.

## Purpose

Sentinel is built to improve:

- Food safety.
- Food inspection workflows.
- Food defense.
- Foodborne illness investigation support.
- Operational readiness.
- Command visibility.
- Soldier protection.

## Primary Users

Sentinel is intended to support:

- **Veterinary Food Inspection Specialists (68R):** Execute inspections, document findings, track deficiencies, and support food protection missions.
- **Veterinary Service NCOICs:** Manage inspection schedules, personnel workload, compliance tracking, and mission execution.
- **Veterinary Officers:** Oversee risk assessment, reporting, operational planning, and technical guidance.
- **Preventive Medicine Teams:** Coordinate public health surveillance, outbreak response, environmental health concerns, and risk mitigation.
- **Commanders:** Maintain visibility into food protection posture, readiness risks, and corrective action status.

## Product Principles

- **Soldier protection first:** Every workflow should support the safety, health, and readiness of the force.
- **Operational clarity:** Users should quickly understand what requires attention, who owns it, and what risk it represents.
- **Inspection discipline:** Sentinel should reinforce consistent documentation, repeatable processes, and accountable corrective actions.
- **Assistive AI with human oversight:** AI should support summarization, prioritization, drafting, and pattern recognition while preserving professional judgment and command authority.
- **Field-aware design:** The platform should work for garrison operations, field feeding environments, deployments, and constrained connectivity.
- **Security-minded architecture:** Food defense, mission readiness, and operational data should be protected with strong access control, audit trails, and responsible data handling.

## MVP Scope

The MVP should prove that Sentinel can improve Army Veterinary Services food protection operations by centralizing inspection activity, surfacing risk, and reducing administrative burden.

### Core MVP Features

#### 1. Operations Dashboard

A mission-focused overview of food protection activity, including:

- Open inspections.
- Overdue inspections.
- High-risk facilities or vendors.
- Deficiency status.
- Corrective action progress.
- Investigation activity.
- Unit and location coverage.
- Readiness-impacting risks.

#### 2. Food Inspection Workflow Management

Structured tools for planning, executing, and closing inspections, including:

- Inspection type selection.
- Facility, vendor, unit, or site profile.
- Checklist-based inspection capture.
- Deficiency documentation.
- Corrective action assignment.
- Re-inspection tracking.
- Final inspection summary.

#### 3. AI-Assisted Inspection Documentation

AI support for inspection documentation and administrative drafting, including:

- Draft inspection summaries.
- Findings organization.
- Corrective action language suggestions.
- Risk statement drafts.
- Follow-up task generation.
- Command update drafts.

All AI-generated content should require review and approval by authorized personnel before use.

#### 4. Food Defense Risk Tracking

Tools for identifying, documenting, and monitoring food defense concerns, including:

- Vulnerability observations.
- Access control concerns.
- Supply chain risk notes.
- Tampering indicators.
- High-risk event tracking.
- Mitigation actions.
- Escalation status.

#### 5. Foodborne Illness Investigation Support

A structured workspace for investigation coordination, including:

- Incident intake.
- Affected unit or population details.
- Food exposure timeline.
- Suspected source tracking.
- Interview note organization.
- Sample and evidence tracking.
- Coordination notes with Preventive Medicine.
- Investigation status and final summary.

#### 6. Corrective Action and Task Management

Accountability tools for operational follow-through, including:

- Assigned actions.
- Responsible person or section.
- Due dates.
- Priority levels.
- Completion status.
- Overdue escalation.
- Supporting documentation.

#### 7. Reporting and Readiness Visibility

Initial reporting for leaders and staff, including:

- Inspection completion rates.
- Deficiency trends.
- Repeat finding patterns.
- High-risk locations.
- Corrective action closure rates.
- Investigation status.
- Mission coverage gaps.
- Readiness-impacting food protection risks.

## Future Roadmap

### Phase 1: MVP Validation

- Build the food protection operations dashboard.
- Implement core inspection workflow management.
- Add AI-assisted documentation with human review controls.
- Support deficiency, corrective action, and follow-up tracking.
- Validate workflows with Army Veterinary Services use cases.
- Establish role-based access and audit logging foundations.

### Phase 2: Advanced Inspection Intelligence

- Add historical trend analysis.
- Identify repeat deficiencies by site, vendor, unit, or inspection type.
- Recommend inspection priorities based on risk patterns.
- Generate standardized command briefs and operational summaries.
- Support offline-first inspection capture for field environments.

### Phase 3: Food Defense and Supply Chain Risk

- Expand food defense assessment tools.
- Add vendor and approved source risk profiles.
- Track high-risk events and mitigation actions.
- Support suspicious activity documentation.
- Improve visibility into supply chain vulnerabilities.

### Phase 4: Investigation and Public Health Coordination

- Enhance foodborne illness investigation workflows.
- Add exposure mapping and timeline visualization.
- Improve coordination with Preventive Medicine and command teams.
- Support evidence package generation.
- Add after-action review and lessons learned tracking.

### Phase 5: Command and Enterprise Reporting

- Add unit, installation, region, and enterprise-level dashboards.
- Provide readiness risk summaries for commanders.
- Compare inspection coverage and deficiency trends across locations.
- Support recurring reporting requirements.
- Enable exportable briefings and executive summaries.

### Phase 6: Operational Integration

- Explore integration with approved Army systems and reporting channels.
- Support identity, access, and authorization requirements.
- Add secure data import and export workflows.
- Connect inspection activity to broader force health protection and readiness reporting.
- Prepare for deployment in constrained, disconnected, intermittent, or limited-bandwidth environments.

## Success Metrics

Sentinel should be measured by its ability to improve outcomes such as:

- Faster inspection documentation.
- Higher inspection completion visibility.
- Reduced overdue corrective actions.
- Better identification of repeat deficiencies.
- Improved food defense risk awareness.
- Faster foodborne illness investigation coordination.
- Stronger communication between Veterinary Services, Preventive Medicine, and commanders.
- Clearer readiness visibility tied to food protection operations.

## Current Status

Sentinel now includes a dependency-free browser prototype for FPAR and MILSANS inspection tracking. The current v0.6.3 build supports separate dashboards, a fictional DFAC letter-grade conference view with clickable summary filters and direct internal links to each facility's inspection details, bounded local CSV imports, due-date and missed-history calculations, inaccessible-facility tracking, printable facility cards and Grade Board, and encrypted browser-local backups.

See [TRACKER_README.md](TRACKER_README.md) for feature details and test commands. Public testing must use fictional fixtures. Authorized operational-data evaluation must use a downloaded local copy and follow [LOCAL_REAL_DATA_TESTING.md](LOCAL_REAL_DATA_TESTING.md); real exports must never be uploaded or committed to this public repository.

## Project Direction

Near-term work should focus on:

1. Defining Army Veterinary Services food protection workflows.
2. Documenting MVP requirements for inspections, food defense, investigations, and reporting.
3. Designing the data model for inspections, deficiencies, corrective actions, locations, units, vendors, and investigations.
4. Mapping AI-assisted workflows and required human review points.
5. Defining roles and permissions for 68R personnel, NCOICs, Veterinary Officers, Preventive Medicine, and commanders.
6. Choosing the initial technical architecture.
7. Validating and hardening the current inspection-tracking prototype before adding corrective action, food defense, and investigation modules.

## License

License information has not been selected yet.
