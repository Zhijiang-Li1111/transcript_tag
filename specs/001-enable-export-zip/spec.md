# Feature Specification: Export Bundle Activation

**Feature Branch**: `001-enable-export-zip`  
**Created**: 2025-10-23  
**Status**: Draft  
**Input**: User description: "我已经实现了很多的内容，现在需要你在这个基础上继续增加功能。这个website没有后台，仅仅是让用户上传vtt文件，然后列出来每一个cue，让用户评价importance，最后输出一个这样的json。{ \"meetingId\": \"mtg_0002\", \"annotator\": \"userA\", \"version\": 1, \"createdAt\": \"2025-10-13T10:00:00Z\", \"importanceAnnotations\": [{\"annotationId\": \"A1\", \"startMs\": 120000, \"endMs\": 132000, \"importance\": 3, \"notes\": \"Decision: switch provider\"}, {\"annotationId\": \"A2\", \"startMs\": 132000, \"endMs\": 150000, \"importance\": 1, \"notes\": \"Background context\"}, {\"annotationId\": \"A3\", \"startMs\": 150000, \"endMs\": 156000, \"importance\": 0, \"notes\": \"Chitchat\"}]} 比如没有meetingId就空着，没有annotator也可以空着。notes也可以先空着，其他的就必填了。我认为我现在的code都具备了，就差在用户打完所有的cues之后，让某个按钮从inactive变成active然后可以export，export的内容就是上述的json+原始vtt文件的zip包。"

## User Scenarios & Testing *(mandatory)*

Each user story delivers an independently shippable slice that reuses the current layout, keeps interactions consistent, and documents accessibility expectations.

### User Story 1 - Export Completed Session (Priority: P1)

Annotator reviews all cues in the transcript view, assigns an importance level to each, and then uses the Export control in the session actions panel to download a bundle containing the annotation JSON and original VTT file.

**Why this priority**: Without a reliable export, the annotation workflow cannot produce shareable output; turning the export control on only when work is complete prevents accidental partial deliveries.

**Independent Test**: Upload a VTT sample, annotate every cue, observe the Export control transition to an enabled state, trigger the download, and verify the resulting archive contents.

**Acceptance Scenarios**:

1. **Given** all cues have an assigned importance level, **When** the annotator focuses the Export control and activates it, **Then** a ZIP archive containing the JSON payload and original VTT starts downloading with a descriptive filename.
2. **Given** the Export control is focused via keyboard after all cues are annotated, **When** the annotator presses `Space` or `Enter`, **Then** the same ZIP archive is downloaded and a confirmation toast announces success.

### Edge Cases

- Transcript with one or more unrated cues must keep the Export control disabled with guidance on what remains incomplete.
- Sessions missing meeting ID or annotator name must still export with those fields rendered as empty strings in JSON while maintaining required fields.
- Repeated exports of the same completed session must produce valid archives without duplicating work or corrupting filenames.
- Very large VTT uploads (e.g., 10 000 cues) must complete export within acceptable time and without freezing the interface.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Export control MUST remain disabled until every cue in the current session has an importance level assigned.
- **FR-002**: Once all cues are annotated, the Export control MUST present an enabled state, be reachable via keyboard focus, and include helper text indicating the download content.
- **FR-003**: Triggering export MUST generate a ZIP archive containing exactly two files: `annotations.json` and the original uploaded VTT (retaining its filename or an agreed naming convention).
- **FR-004**: The JSON document inside the archive MUST include `meetingId`, `annotator`, `version`, `createdAt`, and an `importanceAnnotations` array mirroring the annotated cues; missing metadata MUST be represented as empty strings while numeric fields retain their recorded values.
- **FR-005**: The export process MUST stamp `createdAt` with the time of export, default `version` to 1 unless a future schema update dictates otherwise, and ensure annotation IDs map sequentially to annotated cues.
- **FR-006**: After a successful export, the interface SHOULD surface a confirmation message and update session state to reflect that an export occurred without clearing local progress.

### Data Contracts *(include when data is involved)*

- **Annotation Export Payload**: JSON object with fields `{ meetingId: string, annotator: string, version: number, createdAt: ISO 8601 string, importanceAnnotations: ImportanceAnnotation[] }`, where each `ImportanceAnnotation` includes `{ annotationId: string, startMs: number, endMs: number, importance: 0|1|2|3, notes: string }`. `meetingId`, `annotator`, and `notes` accept empty strings; all numeric and timestamp fields are required.
- **Export Archive Structure**: ZIP package containing `annotations.json` (UTF-8) and the original VTT file (`text/vtt`). Archive filename follows `[meeting-or-session]-annotations-YYYY-MM-DDTHH-MM-SS.zip`, falling back to the original filename prefix when meeting ID is blank.

### Assumptions

- Annotators can optionally supply meeting and annotator metadata before export; when omitted, the system substitutes empty strings without blocking download.
- Notes values may rely on existing auto-generated text derived from importance until manual entry is introduced in a future increment.
- Local storage continues to preserve cue importance states so annotators can re-export without re-rating cues.

## UX & Accessibility Guardrails

- Visual rhythm: Reuse the existing action bar spacing and Tailwind tokens so the enabled Export control aligns with neighbouring buttons without introducing new colour primitives.
- Interaction alignment: Disabled state mirrors current button styling conventions; once enabled, include helper copy (tooltip or inline text) describing the archive contents and optional metadata defaults.
- Accessibility validation: Export control must be reachable via keyboard navigation order, expose `aria-disabled` when inactive, announce state changes via live region on activation, and meet contrast ratios defined in the design system.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sessions with all cues annotated allow export without reloading the page, as verified by manual QA across three representative transcripts.
- **SC-002**: The archive download initiates within 3 seconds for transcripts containing up to 10 000 cues on baseline hardware.
- **SC-003**: Accessibility audit confirms the Export control passes keyboard navigation and screen-reader announcement checks (axe-core smoke test + manual verification).
- **SC-004**: At least 95% of exported archives opened during QA contain both files with correct data schema and non-empty required numeric and timestamp fields.
