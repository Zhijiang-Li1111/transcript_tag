# Tasks: Annotation JSON Upload

**Input**: Design documents from `/specs/004-annotation-json-upload/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Verify existing environment: run `npm run lint` and `npm test` to ensure green baseline
- [x] T002 Create new utility file `src/utils/annotationImport.ts` (empty scaffold with TODO comment)
- [x] T003 Add placeholder integration test file `tests/integration/annotationImport.test.tsx`
- [x] T004 [P] Add placeholder unit test file `tests/utils/annotationImport.test.ts`
- [x] T005 Document matcher tolerance constant decision in `src/utils/annotationImport.ts` header comment

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T006 Implement pure parser function `parseAnnotationJson(jsonText: string)` in `src/utils/annotationImport.ts`
- [x] T007 Implement validation helpers (importance range, structural checks) in `src/utils/annotationImport.ts`
- [x] T008 Implement time matching function `matchAnnotationsToCues(imported, cues, toleranceMs)` in `src/utils/annotationImport.ts`
- [x] T009 Add discriminated union result types inside `src/utils/annotationImport.ts` (do not export globally)
- [x] T010 [P] Add unit tests for parser (valid JSON, invalid structure) in `tests/utils/annotationImport.test.ts`
- [x] T011 [P] Add unit tests for matching (exact match, tolerance match, mismatch) in `tests/utils/annotationImport.test.ts`
- [x] T012 [P] Add unit tests for duplicates/overlaps error cases in `tests/utils/annotationImport.test.ts`
- [x] T013 Expose import function via `useAnnotationSession` (`src/hooks/useAnnotationSession.ts`) adding `importAnnotations(fileText: string)`
- [x] T014 Update progress calculation invocation after import in `useAnnotationSession.ts`
- [x] T015 Add overwrite confirmation logic stub in `useAnnotationSession.ts` (returns boolean to caller)

## Phase 3: User Story 1 - Import Annotation JSON & Validate (Priority: P1) 🎯 MVP

**Goal**: Allow user to upload JSON and, if all annotations match, apply importance levels atomically.
**Independent Test**: Upload matching JSON file; verify importance values applied; mismatch triggers modal with no partial import.

### Tests (US1)
- [ ] T016 [P] [US1] Integration test: successful full import path in `tests/integration/annotationImport.test.tsx`
- [ ] T017 [P] [US1] Integration test: mismatch triggers modal and no annotations applied in `tests/integration/annotationImport.test.tsx`

### Implementation
- [x] T018 [US1] Extend Upload page UI in `src/components/upload/FileUploader.tsx` to include annotation JSON input control
- [x] T019 [US1] Wire JSON file selection -> read text -> call `importAnnotations` in `FileUploader.tsx`
- [x] T020 [US1] Implement atomic success feedback (inline message) in `FileUploader.tsx`
- [x] T021 [US1] Disable annotation JSON control until VTT loaded (guard) in `FileUploader.tsx`
- [x] T022 [US1] Implement overwrite confirmation (simple confirm dialog) in `FileUploader.tsx`

## Phase 4: User Story 2 - Error Handling & Accessibility Modal (Priority: P2)

**Goal**: Provide accessible modal summarizing mismatches; block partial import.
**Independent Test**: Upload JSON with one bad annotation; modal appears, focus trapped, session unchanged.

### Tests (US2)
- [ ] T023 [P] [US2] Accessibility test for modal focus trap and Esc close in `tests/accessibility/annotationImportModal.a11y.test.ts`
- [ ] T024 [P] [US2] Integration test: unmatched annotations produce list summary in `tests/integration/annotationImportErrors.test.tsx`

### Implementation
- [ ] T025 [US2] Create accessible modal component or reuse existing pattern in `src/components/ui/` (file `AnnotationErrorModal.tsx`)
- [ ] T026 [US2] Add focus trap logic (reuse existing ErrorBoundary patterns if any) in `AnnotationErrorModal.tsx`
- [ ] T027 [US2] Wire modal invocation on import error in `FileUploader.tsx`
- [ ] T028 [US2] Add live region announcement for error summary in `FileUploader.tsx`

## Phase 5: User Story 3 - Partial Coverage & Progress Indication (Priority: P3)

**Goal**: Apply partial annotations, leaving unmatched cues unknown; update progress display.
**Independent Test**: Upload JSON covering subset; progress updates to correct annotated percentage; style distinctions maintained.

### Tests (US3)
- [ ] T029 [P] [US3] Integration test: partial import yields correct progress in `tests/integration/annotationImportPartial.test.tsx`
- [ ] T030 [P] [US3] Visual/DOM test for unknown vs annotated styling in `tests/integration/annotationImportPartial.test.tsx`

### Implementation
- [ ] T031 [US3] Ensure matcher returns success even if coverage < total cues (partial = true) in `annotationImport.ts`
- [ ] T032 [US3] Update progress UI refresh logic in `src/components/transcript/CueList.tsx` or relevant component
- [ ] T033 [US3] Add live region update announcing "X/Y cues annotated" after partial import in `FileUploader.tsx`

## Phase 6: Polish & Cross-Cutting

- [x] T034 [P] Refactor any duplicated utility code discovered during tests (ensure DRY)
- [x] T035 Add performance measurement snippet (Date.now timing) logged in dev mode in `annotationImport.ts`
- [x] T036 [P] Review Tailwind classes for consistency; remove unused styles
- [ ] T037 Accessibility audit: run axe on Upload page after import flows (manual script)
- [x] T038 Update `quickstart.md` with final overwrite + modal examples
- [x] T039 Final lint/build verification and remove TODO comments in `annotationImport.ts`

## Dependencies & Execution Order

- Setup (Phase 1) precedes Foundational (Phase 2).
- Foundational must complete (parser, matcher, hook integration) before US1 tasks.
- US1 (P1) delivers MVP; P2 and P3 can proceed after US1 or partially in parallel once import path stable.
- Polish tasks after all user stories.

## Parallel Opportunities

- Parser, validation, matching unit tests (T010–T012) can run parallel with type additions once file stub created.
- US1 integration tests (T016, T017) parallel after foundational done.
- Modal accessibility and error integration (T023–T027) parallel with partial coverage tests (T029–T030) post-US1.

## MVP Scope

Tasks up to and including T022 deliver MVP (successful import + overwrite confirmation + basic error blocking without full accessibility polish).

## Implementation Strategy

1. Complete Phases 1–2.
2. Implement US1 (import & atomic apply) and validate.
3. Layer US2 (error modal + a11y) for robustness.
4. Add US3 (partial coverage progress) for completeness.
5. Polish and audit performance/accessibility.

## Totals

- Total Tasks: 39
- User Story 1 Tasks: 7 (tests + implementation T016–T022)
- User Story 2 Tasks: 6 (tests + implementation T023–T028)
- User Story 3 Tasks: 5 (tests + implementation T029–T033)

## Notes

Keep code simple; avoid new dependencies. Defer optimization unless performance target missed.
