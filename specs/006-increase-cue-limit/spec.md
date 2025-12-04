# Feature Specification: Increase VTT Cue Text Length Limit

**Feature Branch**: `006-increase-cue-limit`  
**Created**: 2025-12-04  
**Status**: Draft  
**Input**: User description: "将VTT cue文本的最大字符限制从5000提高到20000，以支持包含长文本内容的转录文件"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload VTT with Long Cues (Priority: P1)

As an annotator, I want to upload VTT files containing long cue text (up to 20,000 characters per cue) so that I can work with transcripts that have extensive content in individual segments, such as detailed meeting notes or lecture transcriptions.

**Why this priority**: This is the core functionality requested. Users are currently blocked from using the application with VTT files that have cues exceeding 5,000 characters.

**Independent Test**: Upload a VTT file with cue text between 5,001 and 20,000 characters and verify it parses successfully without errors.

**Acceptance Scenarios**:

1. **Given** a VTT file with cue text of 10,000 characters, **When** user uploads the file, **Then** the file is parsed successfully and all cues are displayed in the transcript view.
2. **Given** a VTT file with cue text of 19,999 characters, **When** user uploads the file, **Then** the file is parsed successfully without any validation errors.
3. **Given** a VTT file with cue text of exactly 20,000 characters, **When** user uploads the file, **Then** the file is parsed successfully at the boundary limit.

---

### User Story 2 - Reject Cues Exceeding New Limit (Priority: P2)

As an annotator, I want to receive a clear error message when uploading VTT files with cue text exceeding 20,000 characters so that I understand why the file cannot be processed.

**Why this priority**: Error handling is important for user experience but secondary to accepting valid files within the new limit.

**Independent Test**: Upload a VTT file with cue text exceeding 20,000 characters and verify an appropriate error message is displayed.

**Acceptance Scenarios**:

1. **Given** a VTT file with cue text of 20,001 characters, **When** user uploads the file, **Then** a validation error is displayed indicating the cue exceeds the maximum length of 20,000 characters.
2. **Given** a VTT file with multiple cues where one exceeds 20,000 characters, **When** user uploads the file, **Then** the error message identifies which cue(s) exceed the limit.

---

### Edge Cases

- What happens when a cue has exactly 20,000 characters? (Should succeed)
- What happens when a cue has 20,001 characters? (Should fail with clear error)
- Does the UI properly render very long cue text? (Existing scroll/truncation should handle this)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Application MUST accept VTT cue text up to 20,000 characters without validation errors.
- **FR-002**: Application MUST reject VTT cue text exceeding 20,000 characters with a clear error message.
- **FR-003**: Error messages MUST include the actual character count and the limit exceeded.
- **FR-004**: Validation behavior MUST remain consistent with existing VTT parsing logic for all other rules.

### Configuration Changes

- **maxCueLength**: Change from 5,000 to 20,000 characters in `VTT_VALIDATION_CONFIG`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: VTT files with cue text up to 20,000 characters are parsed and displayed successfully.
- **SC-002**: Files previously rejected due to cue length (5,001-20,000 chars) now load without errors.
- **SC-003**: Parse time for files with long cues remains under 3 seconds for typical files.
- **SC-004**: UI remains responsive when displaying cues with up to 20,000 characters of text.

## Assumptions

- The existing UI components (CueList, transcript view) can handle displaying long text content through their existing CSS overflow handling.
- Browser performance is sufficient to render text content up to 20,000 characters per cue.
- The 20,000 character limit provides sufficient headroom for real-world transcript use cases.
