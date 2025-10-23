# Implementation Plan: Export Bundle Activation

**Branch**: `001-enable-export-zip` | **Date**: 2025-10-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-enable-export-zip/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable the Export control in the transcript tagging UI once every cue has an assigned importance rating, then package the annotation JSON (matching the agreed schema) with the original VTT file into a downloadable ZIP archive. The work focuses on wiring the readiness check, aligning button states and accessibility messaging, and reusing the existing export utilities to generate compliant payloads.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19 (Vite 7)
**Primary Dependencies**: React DOM 19, Tailwind CSS 3.4, existing annotation export utilities in `src/utils/annotationExport.ts`
**Storage**: Browser `localStorage` scoped by session key (note deviations if any)
**Testing**: `yarn lint`, `yarn build`, targeted React Testing Library checks for export activation + accessibility smoke tests
**Target Platform**: Chromium/WebKit desktop + tablet (latest two releases)
**Project Type**: Single-page web application
**Performance Goals**: Cue navigation <100 ms median, export archive build <3 s for 10 000 cues
**Constraints**: Reuse shared layout, avoid speculative abstractions, uphold WCAG AA compliance
**Scale/Scope**: One annotator per session, transcripts up to 10 000 cues

_Update the values when the feature requires different constraints._

## Constitution Check

*Gate: must pass before Phase 0 research and be re-validated after Phase 1 design.*

- [x] **Minimal Viable Delivery**: P1 journey is “annotator completes cue ratings and downloads the export bundle.” No additional scope bundled.
- [x] **Unified Experience System**: Reuse existing `Button` component and transcript layout; only adjust state/labels without introducing new patterns.
- [x] **Inclusive Accessibility**: Plan covers focus management, `aria-disabled` handling, and confirmation messaging for the Export control.
- [x] **Composable Type-Safe Frontend**: Updates limited to existing React components/hooks plus TypeScript definitions in `src/types/annotation.ts`.
- [x] **Trustworthy Session Data**: Export reuses `annotationExport` utilities, ensures schema fidelity, and leaves local session persistence intact.

_Revalidated on 2025-10-23 after research/data-model deliverables; no additional gates triggered._

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

**Structure Decision**: Changes concentrate in `src/components/transcript/CueList.tsx` and/or `CueImportanceTagger.tsx` for control state, `src/components/ui/Button.tsx` for styling tweaks if needed, `src/hooks/useAnnotationSession.ts` for readiness signals, and `src/utils/annotationExport.ts` for JSON/ZIP behaviour. Tests land under `tests/integration/` and `tests/accessibility/` reusing existing structure.

## Complexity Tracking

> Complete only if Constitution Check violations must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| – | – | – |
