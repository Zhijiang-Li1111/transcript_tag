---

description: "Task list for Export Bundle Activation feature"
---

# Tasks: Export Bundle Activation

**Input**: Design documents from `/specs/001-enable-export-zip/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Follow quickstart guidance—add unit, integration, and accessibility coverage when interactions change.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Phase 0: Constitution Alignment (Shared)

**Purpose**: Validate gates before implementation.

- [X] T001 Confirm constitution gates remain satisfied after research/data model additions in `specs/001-enable-export-zip/plan.md`
- [X] T002 [P] Capture reused UI components and accessibility commitments for export control in `specs/001-enable-export-zip/contracts/export-control.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare fixtures and documentation required across the feature.

- [X] T010 Create fully annotated session fixture for export scenarios in `tests/integration/fixtures/exportReadySession.ts`
- [X] T011 [P] Add representative VTT fixture covering varied cue importance levels in `tests/integration/fixtures/export-ready-sample.vtt`
- [X] T012 [P] Extend manual QA pre-checks with export readiness prerequisites in `specs/001-enable-export-zip/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story work.

- [X] T020 Implement `isSessionComplete` and remaining cue selectors in `src/hooks/useAnnotationSession.ts`
- [X] T021 [P] Define `ExportControlViewModel` and readiness helpers in `src/types/annotation.ts`
- [X] T022 [P] Update export packaging to support empty metadata and deterministic filenames in `src/utils/annotationExport.ts`
- [X] T023 [P] Enhance shared button to expose `aria-disabled` and focus styles in `src/components/ui/Button.tsx`

**Checkpoint**: Foundation ready—User Story 1 can now begin.

---

## Phase 3: User Story 1 - Export Completed Session (Priority: P1) 🎯 MVP

**Goal**: Allow annotators to download a JSON+VTT archive once every cue is rated, with accessible state transitions.

**Independent Test**: Upload sample VTT, rate all cues, observe Export control enabling, trigger download, and verify archive contents.

### Tests for User Story 1

> Write tests before implementation; ensure they fail initially.

- [X] T030 [P] [US1] Cover `isSessionComplete` and remaining cue helpers in `tests/utils/useAnnotationSession.test.ts`
- [X] T031 [P] [US1] Simulate end-to-end export activation flow in `tests/integration/exportBundleActivation.test.tsx`
- [X] T032 [P] [US1] Validate export control keyboard/announcement behaviour in `tests/accessibility/exportControl.a11y.test.ts`

### Implementation for User Story 1

- [X] T033 [P] [US1] Create export control component with pending/tooltip states in `src/components/transcript/ExportControls.tsx`
- [X] T034 [US1] Integrate export control into session view and thread readiness state in `src/components/transcript/CueImportanceTagger.tsx`
- [X] T035 [P] [US1] Surface remaining cue guidance alongside controls in `src/components/transcript/CueList.tsx`
- [X] T036 [US1] Trigger export, manage download/toasts, and call `markExported` in `src/components/transcript/ExportControls.tsx`
- [X] T037 [US1] Update manual verification steps post-implementation in `specs/001-enable-export-zip/quickstart.md`

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Stabilise performance and documentation.

- [ ] T040 [P] Record export performance sampling for large transcripts in `specs/001-enable-export-zip/research.md`
- [ ] T041 Log final manual smoke test results following quickstart flow in `specs/001-enable-export-zip/quickstart.md`
- [ ] T042 [P] Review session persistence for redundant flags post-export in `src/hooks/useAnnotationSession.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0** → Must finish before touching infrastructure or UI tasks.
- **Phase 1** → Builds fixtures/docs used across feature; required before foundation to avoid rework.
- **Phase 2** → Blocks all user story work—complete selectors, utilities, and shared UI adjustments first.
- **Phase 3 (US1)** → Starts only after Phase 2; delivers MVP.
- **Polish** → Runs after US1 is validated.

### User Story Dependencies

- **US1 (P1)** depends on foundational selectors/utilities being ready. No other user stories exist in this increment, enabling direct MVP delivery.

### Within User Story 1

1. Execute tests (T030–T032) so they fail.
2. Implement UI components and hook wiring (T033–T036).
3. Update documentation (T037) once functionality passes checks.

### Parallel Opportunities

- Fixture/documentation tasks T010–T012 can run concurrently.
- Foundational enhancements T021–T023 touch separate files and can execute in parallel after T020.
- User Story tests T030–T032 are parallel-safe once fixtures exist.
- Implementation tasks T033 and T035 can progress in parallel; T036 follows once export component scaffolding exists.
- Polish tasks T040 and T042 are parallelizable after US1 completion.

---

## Parallel Example: User Story 1

```bash
# Parallel test development (after fixtures ready)
Task: "- [ ] T030 [P] [US1] Cover isSessionComplete and remaining cue helpers in tests/utils/useAnnotationSession.test.ts"
Task: "- [ ] T031 [P] [US1] Simulate end-to-end export activation flow in tests/integration/exportBundleActivation.test.tsx"
Task: "- [ ] T032 [P] [US1] Validate export control keyboard/announcement behaviour in tests/accessibility/exportControl.a11y.test.ts"

# Parallel UI implementation once foundation is complete
Task: "- [ ] T033 [P] [US1] Create export control component with pending/tooltip states in src/components/transcript/ExportControls.tsx"
Task: "- [ ] T035 [P] [US1] Surface remaining cue guidance alongside controls in src/components/transcript/CueList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 0–2 to satisfy constitution gates and shared infrastructure.
2. Deliver Phase 3 (US1) end-to-end, ensuring tests pass and manual verification succeeds.
3. Stop and validate export bundle functionality before moving to polish.

### Incremental Delivery

1. Ship foundational selectors/utilities alongside fixtures (Phases 1–2).
2. Implement export control UI and automation tests (Phase 3) for MVP release.
3. Execute polish tasks to capture performance metrics and cleanup prior to handoff.

### Parallel Team Strategy

- Developer A: Phase 2 hook + utility work (T020–T022).
- Developer B: Shared UI updates and future ExportControls component (T023, T033, T036).
- Developer C: Testing + documentation (T030–T032, T037, T041).
- All: Converge on polish tasks (T040–T042) after MVP validation.

---

## Notes

- [P] tasks denote safe parallelization (distinct files, no blocking dependencies).
- All tasks reference concrete file paths for clarity.
- Ensure tests fail before implementation to confirm coverage.
- Maintain accessibility and performance guardrails captured in the specification.
