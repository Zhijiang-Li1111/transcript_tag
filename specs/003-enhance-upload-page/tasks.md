# Tasks: Enhance Upload Page with Usage Guide & Remove Transcript Preview

**Input**: Design documents from `/specs/003-enhance-upload-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are not required for this UI-only enhancement feature. Manual verification steps are documented in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown assume the transcript tagger React app per plan.md structure

## Phase 0: Constitution Alignment (Shared)

**Purpose**: Validate gates before implementation.

- [X] T000 Summarize the Constitution Check outputs from plan.md and confirm all 5 gates passed (minimal delivery, unified experience, accessibility, type-safe, session data).
- [X] T001 Verify reused components list matches plan.md: `MainLayout`, `FileUploader`, `Button` components unchanged, `CueList` removed from upload phase only.
- [X] T002 Confirm no data shape changes needed in `src/types/annotation.ts` or `src/types/transcript.ts` per data-model.md findings.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation

- [X] T010 Verify current feature branch `003-enhance-upload-page` is active and plan.md structure aligns with existing `src/App.tsx`.
- [X] T011 [P] Confirm all required Tailwind tokens exist in `src/styles/globals.css` (text-gray-600, text-blue-600, spacing utilities, semantic HTML styling).
- [X] T012 [P] Verify `yarn lint` and `yarn build` pass cleanly on current codebase before making changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core preparation that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T020 Locate and examine existing upload page implementation in `src/App.tsx` lines ~100-220 to understand current structure and conditional rendering.
- [X] T021 [P] Identify exact insertion point for usage guide (above FileUploader, within `!currentSession` conditional) in `src/App.tsx`.
- [X] T022 [P] Identify exact removal section for transcript preview (`CueList` component usage in post-upload state) around lines ~197-210 in `src/App.tsx`.
- [X] T023 Review existing accessibility patterns in `FileUploader` component and `Button` component to ensure consistent semantic HTML approach.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Usage Guide to Upload Page (Priority: P1) 🎯 MVP

**Goal**: Add static usage guide above file uploader explaining workflow, upload methods, and time commitment using semantic HTML and existing Tailwind tokens.

**Independent Test**: Load application, verify guide is visible, readable on desktop/tablet, does not obstruct FileUploader, explains 0-3 rating workflow and time estimate.

### Implementation for User Story 1

- [X] T030 [US1] Create usage guide JSX structure in `src/App.tsx` within upload phase conditional (~line 105-125) using semantic HTML (`<h2>`, `<ul>`, `<li>`).
- [X] T031 [US1] Add guide content sections: file upload instructions (drag & drop or browse), workflow explanation (0-3 importance rating), time commitment (5-10 minutes).
- [X] T032 [US1] Apply Tailwind CSS styling to guide using existing tokens (text-gray-600 for body, text-blue-600 for highlights, proper spacing with mb-4, space-y-2).
- [X] T033 [US1] Ensure guide placement above `<FileUploader>` component and responsive layout with existing container classes (`max-w-3xl mx-auto`).
- [X] T034 [US1] Verify guide appears only when `!currentSession` (upload phase) and not during annotation phase or after "Back to upload" navigation.
- [X] T035 [US1] Test manual verification following quickstart.md test cases 1.1-1.5 (visibility, interaction, responsiveness, keyboard nav, screen reader).

**Checkpoint**: At this point, User Story 1 should be fully functional - usage guide visible and accessible on upload page

---

## Phase 4: User Story 2 - Remove Transcript Preview Section (Priority: P2)

**Goal**: Remove redundant "Transcript Preview" section from post-upload state while keeping "Ready to annotate" section and "Start Annotating Now" functionality intact.

**Independent Test**: Upload VTT file, verify no "Transcript Preview" section shown, "Start Annotating Now" button works, annotation phase shows full CueList as expected.

### Implementation for User Story 2

- [X] T040 [US2] Locate and remove "Transcript Preview" section JSX block in `src/App.tsx` (approximately lines 197-210) including `<h3>` heading and `<CueList>` component.
- [X] T041 [US2] Verify "Ready to annotate" section with cue count and "Start Annotating Now" button remains unchanged and functional.
- [X] T042 [US2] Confirm `CueList` component import is still needed for annotation phase usage (do not remove import, only remove upload phase usage).
- [X] T043 [US2] Test responsive layout improvements on small screens to ensure reduced page height and no unwanted scrolling.
- [X] T044 [US2] Verify annotation session workflow unchanged: clicking "Start Annotating Now" still displays full CueList in annotation phase.
- [X] T045 [US2] Test manual verification following quickstart.md test cases 2.1-2.5 (preview removal, start annotating works, layout improvement, single-cue edge case, back navigation).

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - guide added, preview removed, full workflow intact

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality assurance

- [X] T050 [P] Run complete manual smoke test following all quickstart.md test cases (10 tests total: 5 for US1 guide, 5 for US2 preview removal).
- [X] T051 [P] Verify browser compatibility testing on Chrome and Firefox (desktop and tablet breakpoints as specified in plan.md).
- [X] T052 Confirm `yarn lint` and `yarn build` pass with zero errors or warnings after all changes.
- [X] T053 [P] Validate accessibility requirements: semantic HTML structure, keyboard navigation, screen reader compatibility, WCAG AA contrast.
- [X] T054 Perform final code review checklist: no inline styles, Tailwind tokens only, no new components created, existing functionality preserved.
- [ ] T055 Update any documentation screenshots or examples if needed (though not specified in current scope).

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 0 → Phase 1**: Constitutional validation before setup
2. **Phase 1 → Phase 2**: Setup validation before foundational work  
3. **Phase 2 → Phase 3**: Foundation complete before US1 implementation
4. **Phase 3 → Phase 4**: US1 (guide) should complete before US2 (removal) per spec priority reasoning
5. **Phase 4 → Phase 5**: Both user stories complete before final polish

### User Story Independence

- **US1 (Add Guide)**: Independent - can be implemented and tested alone
- **US2 (Remove Preview)**: Independent - can be implemented and tested alone
- **Recommended Order**: US1 → US2 per spec rationale (add guidance before removing content)

### Parallel Execution Opportunities

**Within Phase 1** (Setup):
- T011 (Tailwind tokens check) ∥ T012 (lint/build check)

**Within Phase 2** (Foundational):  
- T021 (identify guide insertion) ∥ T022 (identify preview removal) ∥ T023 (accessibility review)

**Within Phase 5** (Polish):
- T050 (manual testing) ∥ T051 (browser compat) ∥ T053 (accessibility validation)

### Critical Path

T000 → T010 → T020 → **T030-T035 (US1)** → **T040-T045 (US2)** → T052 (final build validation)

---

## Implementation Strategy

**MVP Scope**: User Story 1 only (add usage guide)
- Delivers immediate user value by improving onboarding clarity
- Can ship independently without US2
- Low risk, high impact enhancement

**Full Feature Scope**: User Stories 1 + 2 
- Complete enhancement with guide addition and preview removal
- Estimated total effort: 4-6 hours for experienced React developer
- All functionality thoroughly tested per quickstart.md criteria

**Risk Mitigation**:
- Each user story has independent test criteria
- No new dependencies or components reduce integration risk  
- Reuse of existing Tailwind tokens ensures style consistency
- Manual testing covers all breakpoints and accessibility requirements

**Success Criteria**:
- All 10 quickstart.md test cases pass
- Build and lint remain clean
- No regressions in existing upload/annotation workflow
- Page height reduced by ~30% as estimated in success criteria SC-003