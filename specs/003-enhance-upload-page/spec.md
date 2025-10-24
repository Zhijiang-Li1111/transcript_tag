# Feature Specification: Enhance Upload Page with Usage Guide & Remove Transcript Preview

**Feature Branch**: `003-enhance-upload-page`  
**Created**: 2025-10-24  
**Status**: Draft  
**Input**: User description: "Enhance upload page by: 1) Adding a usage guide to show users how to use the tool, 2) Removing the transcript preview section as it appears redundant and unnecessary. All other existing functionality remains unchanged."

## User Scenarios & Testing

### User Story 1 - Add Usage Guide to Upload Page (Priority: P1)

Annotators visiting the upload page see clear, concise instructions on how to use the tool. The guide appears prominently in the upload area and explains:
- How to upload a VTT/TXT file (drag & drop or browse)
- What happens after file upload
- What the importance tagging workflow involves
- Expected time commitment

This guide reduces confusion and accelerates first-time user onboarding.

**Why this priority**: Removing the transcript preview without adding guidance would leave the page sparse and unclear. Adding context BEFORE removing the preview ensures users understand the tool's purpose and workflow.

**Independent Test**:
1. Load the application in a fresh browser session (no prior files uploaded)
2. Verify the usage guide is visible on the upload page
3. Confirm all guide sections (file upload, workflow, time estimate) are readable and non-technical
4. Test on desktop and tablet breakpoints to confirm guide remains visible and readable
5. Verify the guide does not block access to the file uploader

**Acceptance Scenarios**:

1. **Given** a user opens the application for the first time, **When** the upload page loads, **Then** a clear usage guide is displayed explaining how to upload a file and what happens next.
2. **Given** the usage guide is displayed, **When** a user reads it, **Then** they understand the importance tagging workflow (e.g., "rate cues on a scale of 0-3") and estimated time commitment.
3. **Given** a user on a tablet device, **When** they view the upload page, **Then** the usage guide remains readable and does not cause horizontal scrolling.
4. **Given** the usage guide is present, **When** a user interacts with the file uploader, **Then** the guide does not obstruct the upload controls or form submission.

---

### User Story 2 - Remove Transcript Preview Section (Priority: P2)

After file upload succeeds, the upload page currently displays a "Transcript Preview" section showing a scrollable list of parsed cues. This preview is removed from the UI, reducing visual clutter and simplifying the post-upload state. Users still see the success message and the "Start Annotating Now" call-to-action without the redundant preview.

**Why this priority**: P2 because it is a cleanup/removal task. Once the guide is in place (P1), removing the preview improves the UX by focusing the user on the next action (start annotating) rather than showing extraneous information.

**Independent Test**:
1. Upload a valid VTT file with multiple cues (e.g., 20-50 cues)
2. Confirm that the file upload succeeds and no validation errors appear
3. Verify that the "Transcript Preview" section is **not** rendered on the page
4. Confirm that the "Ready to annotate" section with the "Start Annotating Now" button is still visible and functional
5. Click "Start Annotating Now" and verify the annotation session begins as expected

**Acceptance Scenarios**:

1. **Given** a valid VTT file has been parsed successfully, **When** the upload page displays the post-upload state, **Then** no "Transcript Preview" section is shown.
2. **Given** the user has uploaded a file, **When** they look at the page, **Then** the only call-to-action visible is "Start Annotating Now" (no redundant cue list).
3. **Given** the file upload succeeds, **When** the user clicks "Start Annotating Now", **Then** the annotation session begins and the full cue list is displayed in the annotation phase (as before).
4. **Given** the transcript preview section is removed, **When** a user on a small screen views the page, **Then** the remaining content fits without unwanted scrolling and layout remains responsive.

---

### Edge Cases

- What if a user uploads a single-cue VTT file? The guide should still be clear and the removal of the preview should not affect the single-cue workflow.
- What if the user's browser has very limited vertical space (e.g., small height)? The guide should remain accessible without forcing excessive scrolling.
- What if a user reaches the upload page after starting an annotation session and clicking "Back to upload"? The guide should still be visible in that context.

## Requirements

### Functional Requirements

- **FR-001**: The upload page MUST display a user-facing usage guide above or adjacent to the file uploader when no session is in progress.
- **FR-002**: The usage guide MUST explain how to upload a VTT/TXT file (drag & drop or browse).
- **FR-003**: The usage guide MUST describe the importance tagging workflow and expected time commitment.
- **FR-004**: The usage guide text MUST be non-technical and suitable for end users (e.g., no mention of VTT schema internals).
- **FR-005**: The "Transcript Preview" section that displays parsed cues after upload MUST be removed from the DOM (not hidden, but not rendered).
- **FR-006**: The "Ready to annotate" section (with cue count and "Start Annotating Now" button) MUST remain visible and fully functional after file upload.
- **FR-007**: UI MUST maintain layout consistency with `MainLayout` and existing upload page styling (Tailwind tokens, spacing).
- **FR-008**: Keyboard navigation MUST not be affected; all interactive elements remain accessible.
- **FR-009**: The usage guide and upload area layout MUST be responsive across desktop, tablet, and mobile breakpoints.

### UX & Accessibility Guardrails

- **Visual rhythm**: The guide and uploader use existing Tailwind tokens (spacing, typography, color). No new tokens introduced. Guide uses a clear hierarchy with headings and bullet points.
- **Interaction alignment**: Reuses `MainLayout`, `FileUploader`, `Button` components. No new components required. Removes `CueList` usage from the upload phase (it will still be used in the annotation phase).
- **Accessibility validation**: 
  - Guide text uses semantic headings and lists (`<h2>`, `<ul>`, `<li>`)
  - All guide copy is accessible to screen readers
  - File uploader remains keyboard-navigable (as designed)
  - Focus order is logical: guide → uploader → action button

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users viewing the upload page see the usage guide without manual scrolling on desktop (content visible on initial load without page scroll).
- **SC-002**: Annotators who read the guide complete their first file upload attempt without needing to re-read instructions (measured via reduced "back" clicks post-guidance addition).
- **SC-003**: Removing the transcript preview reduces post-upload page height by at least 30% (from ~800px to ~550px on desktop, estimated).
- **SC-004**: All interactive elements in the upload area pass keyboard navigation and axe-core accessibility smoke tests with zero violations.
- **SC-005**: The feature works correctly on all target breakpoints (desktop, tablet, mobile) with no layout breakage or unwanted scrolling.

## Assumptions

- The usage guide content can be added as a simple text/heading structure within the existing upload page container (no new data fetching required).
- The transcript preview was displaying the same `CueList` component that is used in the annotation phase; removing it from the upload phase does not require component refactoring.
- Users do not rely on the transcript preview to validate file correctness before starting annotation (file validation UI in `FileUploader` is sufficient).
- The usage guide will be permanently visible for all users, not hidden behind a collapsible section or toggle (simpler, more discoverable).
