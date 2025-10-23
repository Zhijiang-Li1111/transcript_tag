<!--
Sync Impact Report
Version: 0.0.0 -> 1.0.0
Modified Principles:
- (new) Minimal Viable Delivery
- (new) Unified Experience System
- (new) Inclusive Accessibility
- (new) Composable Type-Safe Frontend
- (new) Trustworthy Session Data
Added Sections:
- Operational Guardrails
- Delivery Workflow
Removed Sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .specify/templates/checklist-template.md
- ⚠ .specify/templates/commands (add files when commands are introduced)
Follow-up TODOs:
- TODO(COMMAND_TEMPLATES): Provide command help docs aligned with the constitution once command templates exist.
-->

# Transcript Tag Constitution

## Core Principles

### Minimal Viable Delivery
- MUST scope each feature to the smallest user-visible increment that delivers value on its own.
- MUST pair every plan/spec with a single P1 journey that can ship independently before layering P2+ work.
- MUST postpone new abstractions until two distinct stories require them and remove speculative code during cleanup.
Rationale: Focused increments keep the tool modern, prevent over-design, and sustain feedback velocity.

### Unified Experience System
- MUST reuse shared layout primitives (`MainLayout`, transcript components) and Tailwind tokens to deliver identical interactions across views.
- MUST document any new interaction pattern in the spec and add it to the design glossary before implementation.
- SHOULD provide responsive behaviours covering desktop and tablet breakpoints in the same release.
Rationale: Consistency preserves annotator muscle memory and avoids interface drift.

### Inclusive Accessibility
- MUST implement keyboard-first navigation paths and ARIA roles for every interactive control.
- MUST meet WCAG AA contrast requirements using the global colour definitions.
- SHOULD supply inline guidance and error states that are screen-reader accessible.
Rationale: Accessibility guarantees every annotator can complete tasks without regressions.

### Composable Type-Safe Frontend
- MUST express UI and data contracts in TypeScript types that reside under `src/types/`.
- MUST encapsulate new behaviour in React components or hooks that include prop typings and add unit coverage when logic branches exist.
- SHOULD rely on `yarn lint` and `yarn build` as pre-merge gates; failing TypeScript builds block merges.
Rationale: A typed component system keeps iterations safe while enabling reuse.

### Trustworthy Session Data
- MUST treat transcript files and annotations as user-owned; client-side storage stays scoped to the active session key.
- MUST version annotation payloads and include migration notes when changing schemas.
- SHOULD provide explicit export paths via `utils/annotationExport.ts` before modifying persistence rules.
Rationale: Reliable data handling builds confidence in the tagging workflow.

## Operational Guardrails

- Frontend stack: React 19, Vite 7, TypeScript 5.9, Tailwind CSS 3.4, Yarn package management.
- Styling lives in `src/styles/` and `src/index.css`; introduce new tokens there before usage.
- Prefer `localStorage` for session continuity only; purge persisted data when sessions end unless export is requested.
- Accessibility linting relies on React lint rules; add automated checks when introducing new build tooling.
- Feature toggles remain local to components; avoid global state libraries until justified with a plan.

## Delivery Workflow

1. Capture the smallest viable feature spec highlighting independent user journeys.
2. Produce an implementation plan that confirms Constitution Check gates, including UX reuse and data integrity notes.
3. Generate tasks grouped by user story, ensuring each includes UI, state management, accessibility, and verification steps.
4. Implement incrementally, keeping `yarn lint`, `yarn build`, and manual smoke tests green before merge.
5. Log export format adjustments in `utils/annotationExport.ts` and document them in release notes.

## Governance

This constitution supersedes prior informal practices for the transcript tagging UI.

- Amendments require a dedicated proposal PR referencing the impacted principles, justification, and rollout plan. Approval needs at least one maintainer review.
- Versioning follows semantic rules: patch for wording clarifications, minor for new principles or workflow gates, major for principle removals or incompatible governance shifts.
- Compliance reviews happen during PR checks; reviewers confirm the Constitution Check in plans/specs is resolved, and failing gates block merge until remediated.

**Version**: 1.0.0 | **Ratified**: 2025-10-23 | **Last Amended**: 2025-10-23
