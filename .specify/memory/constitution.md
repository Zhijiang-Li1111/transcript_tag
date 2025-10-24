<!--
Sync Impact Report
Version: 1.0.0 -> 1.1.0
Rationale: MINOR version bump - added comprehensive quality & reuse governance without removing prior principles.

Modified Principles:
- Enhanced "Minimal Viable Delivery" with explicit code reuse and speculative code removal guidance.
- Enhanced "Composable Type-Safe Frontend" with stronger type safety, linting enforcement, and holistic review requirements.
- Enhanced "Inclusive Accessibility" with keyboard-first and ARIA documentation requirements.

Added Sections:
- Code Quality & Reuse Standards (new top-level section with quality gates)
- Holistic Change Review (ensures end-to-end validation, not just local optimization)

Removed Sections:
- None

Templates requiring updates:
- ✅ .specify/templates/plan-template.md (existing Constitution Check already aligned)
- ✅ .specify/templates/spec-template.md (already includes reuse requirements)
- ✅ .specify/templates/tasks-template.md (already references code quality)
- ✅ .specify/templates/checklist-template.md (already has type safety gate)
- ℹ Note: No template updates required - existing templates already support enhanced principles.

Follow-up TODOs:
- TODO(COMMAND_TEMPLATES): Provide command help docs aligned with the constitution once command templates exist.
- TODO(CODE_REVIEW_CHECKLIST): Create `.github/PULL_REQUEST_TEMPLATE.md` referencing Constitution requirements.
-->

# Transcript Tag Constitution

## Core Principles

### Minimal Viable Delivery
- MUST scope each feature to the smallest user-visible increment that delivers value on its own.
- MUST pair every plan/spec with a single P1 journey that can ship independently before layering P2+ work.
- MUST postpone new abstractions until two distinct stories require them and remove speculative code during cleanup.
- MUST not introduce new components, hooks, or utilities without examining existing code first; reuse is mandatory before creating new abstractions.
- SHOULD conduct code reuse audits during spec review to prevent duplication and identify refactoring opportunities.
Rationale: Focused increments keep the tool modern, prevent over-design, and sustain feedback velocity. Disciplined reuse avoids technical debt and keeps the codebase maintainable.

### Unified Experience System
- MUST reuse shared layout primitives (`MainLayout`, transcript components) and Tailwind tokens to deliver identical interactions across views.
- MUST document any new interaction pattern in the spec and add it to the design glossary before implementation.
- SHOULD provide responsive behaviours covering desktop and tablet breakpoints in the same release.
Rationale: Consistency preserves annotator muscle memory and avoids interface drift.

### Inclusive Accessibility
- MUST implement keyboard-first navigation paths and ARIA roles for every interactive control.
- MUST meet WCAG AA contrast requirements using the global colour definitions.
- SHOULD supply inline guidance and error states that are screen-reader accessible.
- SHOULD document all new interaction patterns in inline comments, making keyboard and ARIA expectations explicit.
Rationale: Accessibility guarantees every annotator can complete tasks without regressions. Explicit documentation ensures reviewers catch accessibility gaps early.

### Composable Type-Safe Frontend
- MUST express UI and data contracts in TypeScript types that reside under `src/types/`.
- MUST encapsulate new behaviour in React components or hooks that include prop typings and add unit coverage when logic branches exist.
- MUST ensure `yarn lint` and `yarn build` pass cleanly before any code review; failing builds block merges.
- SHOULD review entire feature impact, not just individual files: confirm component placement, hook reuse, style token consistency, and no ad-hoc patterns introduced.
- SHOULD maintain prop interfaces and documentation so future code can reuse components without modification.
Rationale: A typed component system keeps iterations safe while enabling reuse. Holistic review prevents technical drift and ensures best practices permeate the codebase.

### Trustworthy Session Data
- MUST treat transcript files and annotations as user-owned; client-side storage stays scoped to the active session key.
- MUST version annotation payloads and include migration notes when changing schemas.
- SHOULD provide explicit export paths via `utils/annotationExport.ts` before modifying persistence rules.
Rationale: Reliable data handling builds confidence in the tagging workflow.

## Code Quality & Reuse Standards

### Mandatory Quality Gates
- All code MUST pass `yarn lint` and `yarn build` before PR submission.
- Code reviews MUST validate that new components, hooks, and utilities do not duplicate existing implementations.
- When duplicates are found, authors MUST refactor to reuse, not accept "similar but separate" code.
- New functionality MUST be documented in JSDoc/TSDoc where non-obvious; types replace prose where possible.

### Holistic Change Review
- Feature branches MUST not change just one file in isolation; reviewers MUST examine the full impact:
  - Component placement within the component hierarchy (`src/components/`).
  - Prop types and reusability of new components (can future features use them without modification?).
  - Alignment with existing style tokens and no introduction of inline styles or ad-hoc classes.
  - Hook extraction and utility reuse patterns (are duplicate hooks being created?).
  - Session persistence and export paths if data shape changes.
- When revising existing code, authors MUST confirm the change is a best-practice improvement, not a workaround:
  - Is there a less invasive way to achieve the goal?
  - Does the change enable future reuse or just solve today's problem?
  - Would a new component/hook be more maintainable than patching an existing one?

### Code Reuse Audit
- During spec review (gate: Constitution Check), the team MUST list:
  - Existing components being reused (e.g., `Button`, `MainLayout`).
  - Existing hooks and utilities being reused (e.g., `useVTTParser`, `annotationExport`).
  - New components/hooks being introduced and justification if they do not fit an existing pattern.
- Specs flagged as "reuse audit required" MUST complete the list before plan approval.

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

**Version**: 1.1.0 | **Ratified**: 2025-10-23 | **Last Amended**: 2025-10-24
