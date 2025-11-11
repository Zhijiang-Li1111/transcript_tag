# Feature Specification: Annotation JSON Upload

**Feature Branch**: `004-annotation-json-upload`  
**Created**: 2025-11-11  
**Status**: Draft  
**Input**: User description: "在upload page上，可以选择上传annotation json文件。这个文件可以被解析，然后与cue pair，这个pair应该是基于时间的。如果任何一个pair不上，就直接弹窗报错，如果可以的话，就在annoation page直接load这个数据。缺少的，没有annotation的依然是unknown，如果有annotation就展示annotation的level"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Annotation JSON & Validate (Priority: P1)

An annotator opens the existing Upload page, selects an annotation JSON file in addition to (or after) uploading a VTT transcript. The system parses the JSON, matches each annotation against existing transcript cues by time range (startMs/endMs tolerance), and either loads matched importance levels into the session or shows a blocking modal if any annotation fails to match. Reuses `FileUploader`, `useAnnotationSession`, transcript components, and existing layout (`MainLayout`).

**Why this priority**: Core value—enables reuse of previously created annotations, reducing manual re-tagging effort.

**Independent Test**: Provide a valid VTT + valid JSON with full matches; verify all cues with matching annotations display their importance levels immediately on navigation to the annotation page. Provide a JSON with one mismatched time; verify modal error appears and no partial import occurs.

**Acceptance Scenarios**:

1. **Given** a loaded transcript session with cues and no annotations, **When** the user uploads a valid annotation JSON whose entries all match cue time ranges, **Then** all matching cues display their importance level and unknown cues remain unannotated.
2. **Given** keyboard focus on the JSON upload control, **When** the user presses Enter to confirm file selection, **Then** parsing feedback (progress or success) is announced to screen readers and focus moves to the next actionable element (e.g., "Go to annotations" button).

---

### User Story 2 - Error Handling & Accessibility Modal (Priority: P2)

If any annotation in the uploaded JSON cannot be paired by time (outside tolerance or missing), the system shows an accessible modal summarizing mismatches with counts and first few examples, guiding user to correct file or abort. No partial data is loaded.

**Why this priority**: Prevents silent data corruption and ensures trust in imported annotations.

**Independent Test**: Upload JSON with one invalid annotation startMs; verify modal appears, focus trapped, Esc closes modal, and session remains unchanged.

**Acceptance Scenarios**:

1. **Given** a transcript loaded, **When** the user uploads JSON containing at least one unmatched annotation, **Then** a modal appears listing unmatched count and provides actionable guidance; no annotations are applied.
2. **Given** the error modal open, **When** the user navigates with Tab, **Then** focus remains within the modal and Close button announces role and purpose to screen readers.

---

### User Story 3 - Partial Coverage & Progress Indication (Priority: P3)

When the JSON covers only a subset of cues, those cues gain importance levels, others remain "Unknown" (unannotated state). A progress summary updates (e.g., X/Y annotated) without user manual interaction.

**Why this priority**: Supports incremental or partial annotation reuse scenarios.

**Independent Test**: Upload JSON covering 40% of cues; verify progress bar or completion stats show 40% and only matched cues show importance.

**Acceptance Scenarios**:

1. **Given** a transcript with 100 cues, **When** a JSON with 40 matching annotations is imported successfully, **Then** 40 cues display their importance, 60 remain unknown, and progress reflects 40% completion.
2. **Given** a successful partial import, **When** the user filters or navigates cues, **Then** unknown cues retain default styling and annotated cues reflect importance legend colours.

---

### Edge Cases

- JSON contains duplicate time ranges referencing the same cue -> import fails with duplicate error summary.
- Annotation times overlapping multiple cues -> import fails (overlap ambiguity) with count and examples.
- Minor millisecond drift between stored annotation and cue (e.g., ±50ms) -> treated as match within tolerance.
- JSON includes importance outside 0–3 -> fails validation.
- Empty JSON file or empty annotations array -> treated as no-op with accessible message.
- More annotations than cues -> validation fails before matching (consistent with existing `validateAnnotationSession`).
- Large file (>2000 annotations) -> import still completes within performance target; streaming parse considered.
- Timezone or timestamp differences irrelevant (matching uses milliseconds only).
- LocalStorage unavailable -> user notified; import proceeds in memory for current session only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow uploading an annotation JSON file on the Upload page alongside or after VTT upload.
- **FR-002**: On JSON selection, system MUST parse and validate structure before attempting time-based pairing.
- **FR-003**: Matching MUST pair annotations to cues using startMs & endMs with a configurable tolerance (assumed ±50ms) and equal duration requirement.
- **FR-004**: Import MUST abort with a blocking modal if any annotation fails to match uniquely (unmatched, duplicate, overlap, invalid importance).
- **FR-005**: When all annotations match, system MUST apply importance values to corresponding cues and mark others as unknown (no importance property).
- **FR-006**: System MUST update progress statistics immediately after successful import.
- **FR-007**: Error modal MUST be keyboard accessible with focus trap, Esc close, and initial focus on a descriptive heading or summary.
- **FR-008**: Import operation MUST be atomic—either all valid annotations applied or none.
- **FR-009**: System MUST provide user-facing success feedback (e.g., toast or inline message) after successful import.
- **FR-010**: System MUST prevent re-import without user confirmation if annotations already exist (confirmation dialog to overwrite). Assumption: overwrite replaces existing importance values.
- **FR-011**: Session persistence MUST store imported annotations via existing localStorage strategy; absent localStorage falls back to in-memory until page refresh.
- **FR-012**: Validation MUST ensure importance is integer 0–3 and startMs < endMs.
- **FR-013**: Performance MUST handle up to 2000 annotations with parse+match under 2 seconds on a mid-range laptop.
- **FR-014**: Accessibility MUST ensure all interactive controls have appropriate labels (upload control labeled "Annotation JSON Upload").

### Data Contracts

- **Annotation Import File (JSON)**:
	- Root object fields: `version` (number), `meetingId` (string, optional), `annotator` (string, optional), `annotations` (array of objects).
	- Annotation object: `{ startMs: number, endMs: number, importance: number, notes?: string, annotationId?: string }`.
	- Required fields for matching: `startMs`, `endMs`, `importance`.
	- Ignored fields: `notes`, `annotationId` if present (system regenerates).
	- Version mismatch (<1 or non-number) -> validation error.
- **Session Update Behavior**: For each matched annotation, cue gains `importance` property; unknown cues remain unchanged.
- **Tolerance Rule**: Match if absolute difference in startMs and endMs between annotation and cue <= 50ms (assumed default; configurable constant documented).

### UX & Accessibility Guardrails

- Reuse existing `FileUploader` styling; add secondary upload slot labeled clearly.
- Maintain visual distinction between unknown and annotated cues using existing `ImportanceLegend` colour mapping.
- Provide live region announcement "Annotation import succeeded: X annotations applied" or error summary on failure.
- Modal: role="dialog", aria-labelledby summary heading, focus trapped; Close button accessible.
- Keyboard: All upload actions reachable via Tab; Enter/Space triggers file dialog; Esc closes error modal.
- Colour contrast: Importance level indicators meet WCAG AA against background.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of valid annotation JSON imports (no structural errors) complete successfully on first attempt.
- **SC-002**: Successful import of up to 2000 annotations finishes in <2 seconds median on target hardware; UI remains responsive.
- **SC-003**: 100% of error cases present an accessible modal with focus trap and screen reader-announced summary.
- **SC-004**: After import, progress statistics reflect applied annotations accurately (±0 discrepancy) in all tested scenarios.
- **SC-005**: At least 95% of users (usability test sample) report import reduces manual annotation time significantly (>50% perceived reduction).
- **SC-006**: Zero partial imports—either all annotations applied or none—verified by automated tests.

### Assumptions

- Time tolerance ±50ms sufficient for matching floating point drift from source systems.
- Overwrite confirmation required only if at least one cue already has importance.
- Large file performance target (2000 annotations) aligns with expected meeting length limits.
- LocalStorage is primary persistence; fallback option acceptable without offline recovery.

### Out of Scope

- Merging annotations from multiple JSON files sequentially without overwrite.
- Server-side validation or persistence beyond existing client session.
- Automatic inference of missing importance values.

### Risks & Mitigations

- Risk: Large JSON blocks main thread. Mitigation: Use incremental parsing and batch matching (setTimeout/yield) if performance tests fail.
- Risk: Ambiguous overlapping times. Mitigation: Treat any overlap mapping to >1 cue as error.
- Risk: Users forget to upload VTT first. Mitigation: Disable annotation JSON upload until transcript loaded.

### Test Approach (High-Level)

- Unit tests: parser, matcher (tolerance, duplicates, overlaps, invalid importance).
- Integration tests: successful full import, partial import, mismatch error modal accessibility.
- Performance test: 2000 annotations timing.
- Accessibility test: Axe-core scan on modal and upload controls.

### Acceptance Summary

Feature is ready for planning; no outstanding clarifications required based on reasonable defaults.
