# Quickstart: Enable Export Bundle Download

## Pre-checks

- Confirm `tests/integration/fixtures/exportReadySession.ts` reflects a fully annotated session and update timestamps if scenarios change.
- Ensure a representative VTT such as `tests/integration/fixtures/export-ready-sample.vtt` is available for manual upload during validation.

1. **Expose completion flag** in `useAnnotationSession`: add memoized `isSessionComplete` derived from cue importance coverage plus required metadata checks.
2. **Thread completion state** into `CueImportanceTagger` (and down to export UI) to toggle export button availability and copy.
3. **Update export utilities** to ensure deterministic filenames and reuse `exportAnnotations` return structure; verify JSON + VTT bundling still works for fully annotated sessions.
4. **Implement export control UI** (likely in `CueImportanceTagger` or dedicated component) that calls `exportAnnotations(session)` on click, manages `pending` state, and shows success/error toasts.
5. **Add tests**: unit coverage for `isSessionComplete`, export utility adjustments, and integration test that simulates full annotation flow then asserts enabled export trigger and successful download.

## Manual Verification

1. Upload `tests/integration/fixtures/export-ready-sample.vtt` and annotate every cue; confirm the Export control toggles from disabled to enabled with helper text switching to download messaging.
2. Clear one cue rating and verify the cues panel banner reflects the remaining count while the Export control returns to a disabled state.
3. Trigger Export and confirm the toast copy announces success, `mtg_demo_ready-annotations-*.zip` downloads, and the archive contains `annotations.json` plus the original VTT filename.
4. Inspect the JSON payload to ensure blank metadata fields resolve to empty strings (not `null` or `undefined`) and annotation IDs remain sequential.
