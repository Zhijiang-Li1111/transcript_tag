# Implementation Plan: Annotation JSON Upload

**Branch**: `004-annotation-json-upload` | **Date**: 2025-11-11 | **Spec**: [./spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-annotation-json-upload/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable annotators to import an existing annotation JSON file on the Upload page, parse and time-match each annotation to transcript cues atomically (all-or-nothing). MVP (P1) delivers: upload control, JSON validation, time-based matching with tolerance, atomic apply or blocking error modal, and population of cue importance values. Follow-up stories add robust error modal accessibility and partial coverage progress updates.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19 (Vite 7) (existing stack; no new deps per user request)
**Primary Dependencies**: Existing React components (`MainLayout`, `FileUploader`, `Button`, transcript components), hooks (`useAnnotationSession`, `useVTTParser`), utilities (`vttParser`, `annotationExport`).
**Storage**: Browser `localStorage` via existing session key (`getStorageKey(sessionId)`); fallback to in-memory state if localStorage unavailable (handled inside session hook adjustments).
**Testing**: Reuse existing Jest + React Testing Library setup. Add integration test for successful import, error modal test for mismatch, and utility unit tests for matching logic. Axe accessibility smoke test for modal.
**Target Platform**: Chromium/WebKit desktop + tablet (latest two releases) — unchanged.
**Project Type**: Single-page web application.
**Performance Goals**: JSON parse + match ≤2s for 2000 annotations (median), normal cue navigation unaffected (<100ms median render). Memory overhead minimal (annotations array same scale as cues).
**Constraints**: No new external libraries; keep logic in small pure functions for testability; reuse existing styling (Tailwind + existing component classes); keep atomic import semantics.
**Scale/Scope**: Typical transcripts ≤2000 cues; hard upper bound 10,000 (existing assumption). Import tested up to 2000 annotations; beyond that acceptable but not guaranteed to meet 2s target.
**Security/Privacy**: Client-only processing; no network transmission introduced.
**Internationalization**: Reuse existing English copy; copy strings centralized for future i18n (defer extraction until second usage).
**Open Questions**: None (all assumptions locked in spec; no NEEDS CLARIFICATION markers).

_Update the values when the feature requires different constraints._

## Constitution Check

*Gate: must pass before Phase 0 research and be re-validated after Phase 1 design.*

- [x] **Minimal Viable Delivery**: P1 journey = Import valid JSON and populate cue importance levels atomically.
- [x] **Unified Experience System**: Reuse `MainLayout`, existing Upload page container, `FileUploader` (extend with secondary accept filter or new button), `ImportanceLegend`, progress display. No new styling tokens.
- [x] **Inclusive Accessibility**: Keyboard: Tab -> JSON upload control -> import feedback -> navigation. Modal (error) gets role="dialog", focus trap, Esc close, labelled heading. Colour contrast unchanged (reuse existing legend colours). Live region for success/failure messages.
- [x] **Composable Type-Safe Frontend**: Add small pure matcher utility (`matchAnnotationsToCues`) under `src/utils/annotationImport.ts` (new file) returning discriminated union result. Possibly extend `useAnnotationSession` with `importAnnotations(json: ParsedAnnotationFile)` method.
- [x] **Trustworthy Session Data**: Session updates integrate with existing annotation persistence; no schema change to export format (notes regenerated). No version bump needed (import consumes generic shape, re-emits existing schema). Atomic update ensures integrity.

All gates pass; no violations needing justification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature-name]/
├── plan.md          # This file (/speckit.plan output)
├── research.md      # Phase 0 output
├── data-model.md    # Phase 1 output
├── quickstart.md    # Phase 1 output
├── contracts/       # Optional API/interaction contracts
└── tasks.md         # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── assets/
├── components/
│   ├── layout/
│   ├── transcript/
│   ├── ui/
│   └── upload/
├── hooks/
├── styles/
├── types/
└── utils/

tests/
├── accessibility/
├── integration/
└── utils/
```

**Structure Decision**: Add one new utility file `src/utils/annotationImport.ts` for parsing + matching logic (kept pure). Extend existing `FileUploader` or create a minimal inline control on Upload page (prefer augmenting existing upload area to avoid new component). Hook changes limited to `useAnnotationSession` to expose import function; types remain in `src/types/annotation.ts` (no new types required besides an internal temporary `ImportedAnnotation` interface inside utility). Tests mirror existing folder patterns: new unit tests under `tests/utils/` and integration under `tests/integration/`.

## Complexity Tracking

> Complete only if Constitution Check violations must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| (none) | - | - |
