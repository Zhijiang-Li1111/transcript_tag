# Implementation Plan: Enhance Upload Page with Usage Guide & Remove Transcript Preview

**Branch**: `003-enhance-upload-page` | **Date**: 2025-10-24 | **Spec**: [./spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-enhance-upload-page/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**P1 Story (MVP)**: Add a user-facing usage guide to the upload page explaining how to upload files, what the tagging workflow involves, and expected time. Guide appears above/adjacent to the FileUploader component with clear hierarchy, no new components required.

**P2 Story (Follow-up)**: Remove the redundant "Transcript Preview" section from the post-upload state, reducing page clutter and focusing users on the "Start Annotating Now" action.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19 (Vite 7)
**Primary Dependencies**: React DOM 19, Tailwind CSS 3.4, existing UI components (`Button`, `MainLayout`), existing hooks (`useAnnotationSession`)
**Storage**: N/A (UI-only feature, no persistence changes)
**Testing**: `yarn lint`, `yarn build`, manual smoke tests on upload page (desktop/tablet)
**Target Platform**: Chromium/WebKit desktop + tablet (latest two releases)
**Project Type**: Single-page web application
**Performance Goals**: No new performance concerns; upload page should render <100ms
**Constraints**: Reuse existing components and Tailwind tokens, maintain WCAG AA compliance, responsive design (desktop/tablet/mobile)
**Scale/Scope**: One-time upload per session, no changes to cue processing or annotation workflow
**New Components**: None required - all changes are within `App.tsx` or as inline JSX
**Reused Components**: `MainLayout` (already wrapping upload page), `FileUploader` (unchanged), `Button` (unchanged), `CueList` (removed from upload phase)
**Styling**: Tailwind CSS tokens from `src/styles/globals.css` - no new tokens required

## Constitution Check

*Gate: must pass before Phase 0 research and be re-validated after Phase 1 design.*

- [x] **Minimal Viable Delivery**: P1 story (add guide) delivers standalone value by improving UX clarity. P2 story (remove preview) is follow-up cleanup. No speculative abstractions - reuse existing components only.
- [x] **Unified Experience System**: Reuses `MainLayout`, `FileUploader`, `Button`, existing Tailwind tokens. No new interaction patterns. Guide uses same typography/spacing as existing content (headings, bullet lists, prose).
- [x] **Inclusive Accessibility**: Guide uses semantic HTML (`<h2>`, `<ul>`, `<li>`). All text is screen-reader accessible. Keyboard navigation unchanged (FileUploader remains navigable). Contrast verified via existing Tailwind color tokens (text-gray-600, text-blue-600 meet WCAG AA).
- [x] **Composable Type-Safe Frontend**: No new components or hooks. Changes are inline JSX in `App.tsx` within existing conditional render. All styling via Tailwind classes (no inline styles). No new types required.
- [x] **Trustworthy Session Data**: No session data changes. File upload, parsing, and export workflows unchanged. Spec explicitly states "all other existing functionality remains unchanged."

**Result**: ✅ All gates pass. Feature is straightforward UI enhancement with no code quality risks.

## Project Structure

### Documentation (this feature)

```text
specs/003-enhance-upload-page/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 findings (no clarifications needed)
├── data-model.md        # Phase 1: No new data models
├── quickstart.md        # Phase 1: Testing guide
└── checklists/
    └── requirements.md  # Quality validation (all passed)
```

### Source Code Changes

```text
src/
└── App.tsx              # MODIFIED: Add usage guide section, remove preview section
    - Lines ~105-125: Insert usage guide JSX (P1)
    - Lines ~197-210: Remove CueList preview section (P2)
    - No new files, no new components
```

**Structure Decision**: Feature requires only modifications to the existing upload phase UI in `App.tsx`. The guide is inline JSX reusing existing `MainLayout` container. No component extraction needed because:
1. Guide is static, single-use content (no reuse potential yet)
2. Tailwind utilities provide sufficient styling
3. Semantic HTML (`<h2>`, `<ul>`, `<li>`) requires no special component wrapping
4. Future guides can extract to a component if/when reuse is needed (follows "postpone abstractions until two distinct uses" principle)

## Complexity Tracking

No Constitution Check violations. Feature is low-complexity UI enhancement reusing existing components and patterns. No tracking table needed.
