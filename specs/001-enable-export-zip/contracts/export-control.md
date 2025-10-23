# Contract: Export Control Integration

## Purpose
Expose a durable interface between the transcript annotation workspace and the export trigger that enforces readiness gating and consistent messaging across UI layers.

## Producer Responsibilities (`useAnnotationSession`)
- Provide session object containing up-to-date `cues`, `annotations`, and metadata fields.
- Surface a computed `isSessionComplete` boolean (new selector) that evaluates to true only when every cue has an `importance` value.
- Expose `markExported()` callback (existing or new) to flip session state to `SessionState.EXPORTED` after download.

## Consumer Responsibilities (`CueImportanceTagger` → `CueList` → `ExportControls`)
- Subscribe to `session` and `isSessionComplete`; derive UI-friendly `exportDisabled`, `statusMessage`, and `aria-describedby` values.
- Invoke `exportAnnotations(session)` when the export button is activated and `isSessionComplete` is true.
- Handle async lifecycle: set `pending` state during export, catch errors, invoke `downloadFile` with returned blob + filename.
- Call `markExported()` on success to persist state for analytics / UX messaging.

## Interaction Notes
- Button visible at all times but disabled until `isSessionComplete`.
- Tooltip/message explains remaining cues count when disabled (e.g., "3 cues left to annotate").
- Toast or alert region announces success/failure per accessibility requirements.
- Contract validated via integration test to ensure disabled → enabled transition when final cue is rated.

## Reused Components & Accessibility Commitments
- Reuse `src/components/ui/Button.tsx` for the control shell, inheriting focus outlines and disabled styling tokens.
- Integrate with `src/components/transcript/CueImportanceTagger.tsx` layout slots to avoid introducing alternative action patterns.
- Maintain `aria-disabled`, live-region announcements via existing toast utility, and keyboard activation parity (Enter/Space) across states.
