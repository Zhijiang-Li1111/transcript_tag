---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are only included when the spec or constitution check calls for them. Prefer React Testing Library for UI logic and add accessibility smoke tests when interactions change.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume the transcript tagger React app - adjust if plan.md documents an alternative.

<!--
  Replace the sample tasks below with real tasks derived from the spec/plan.
  Keep tasks self-contained, scoped to the minimal viable story, and note
  any constitution principle that is intentionally deferred (then add a
  Complexity Tracking entry in the plan).
-->

## Phase 0: Constitution Alignment (Shared)

**Purpose**: Validate gates before implementation.

- [ ] T000 Summarise the Constitution Check outputs in plan.md and confirm sign-off.
- [ ] T001 Capture reused component list and any new interaction patterns in `docs/design-glossary.md` (or spec appendix).
- [ ] T002 Update `src/types/annotation.ts` or related contracts when data shape changes (include version bump).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T010 Align feature folder/file structure with plan.md (e.g., create `src/components/[feature]/`).
- [ ] T011 [P] Ensure shared styles/tokens exist in `src/styles/globals.css`; add missing tokens if required.
- [ ] T012 [P] Verify `yarn lint` and `yarn build` pass before story work begins.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T020 Implement shared hook/state update in `src/hooks/` for this feature (if required by multiple stories).
- [ ] T021 [P] Extend shared transcript component(s) in `src/components/transcript/` for new capabilities.
- [ ] T022 Establish accessibility scaffolding (focus order, ARIA labels) for new UI elements.
- [ ] T023 Ensure data persistence/export utilities in `src/utils/` reflect schema changes.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (add when required)

> Write tests before implementation; ensure they fail initially.

- [ ] T030 [P] [US1] React Testing Library scenario covering happy path in `tests/integration/[feature].test.tsx`
- [ ] T031 [P] [US1] Axe-core smoke test for new UI flow in `tests/accessibility/[feature].test.ts`

### Implementation for User Story 1

- [ ] T032 [P] [US1] Build UI components in `src/components/[feature]/` reusing layout primitives.
- [ ] T033 [US1] Wire hook/state updates in `src/hooks/use[Feature].ts`.
- [ ] T034 [US1] Persist session data changes via `src/utils/annotationExport.ts` (if applicable).
- [ ] T035 [US1] Document manual verification steps in `specs/[###-feature-name]/quickstart.md`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (add when required)

- [ ] T040 [P] [US2] Interaction regression test in `tests/integration/[feature]-us2.test.tsx`
- [ ] T041 [US2] Accessibility check for error states in `tests/accessibility/[feature]-errors.test.ts`

### Implementation for User Story 2

- [ ] T042 [P] [US2] Extend shared component props in `src/components/transcript/[file].tsx` (ensure type updates).
- [ ] T043 [US2] Add supporting hook logic in `src/hooks/` (reuse or extend existing sessions).
- [ ] T044 [US2] Update localisation or copy in `src/components/ui/` if messaging changes.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (add when required)

- [ ] T050 [P] [US3] Snapshot or visual regression coverage (if UI changes) using Storybook/Chromatic scripts.
- [ ] T051 [US3] Additional axe-core or keyboard navigation validation.

### Implementation for User Story 3

- [ ] T052 [P] [US3] Add UI updates in `src/components/[feature]/` ensuring responsive behaviour.
- [ ] T053 [US3] Update data transformations in `src/utils/` to support new outputs.
- [ ] T054 [US3] Refresh documentation and screenshots in `specs/[###-feature-name]/quickstart.md`.

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T060 [P] Update product documentation and screenshots.
- [ ] T061 Conduct performance sampling for cue navigation (attach results).
- [ ] T062 [P] Audit accessibility findings and fix outstanding issues.
- [ ] T063 Run full manual smoke test following quickstart.md.
- [ ] T064 Remove feature flags or cleanup deprecated code paths.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Components before hooks when new UI exists
- Hooks before persistence when state shape changes
- Persistence before export when data leaves the app
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Call out any constitution principle you intentionally delay and capture the rationale in the plan
