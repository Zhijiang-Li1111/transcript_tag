# Quickstart: Annotation JSON Upload

## Purpose
Guide developers/testers to validate JSON import of annotations quickly without reading full spec.

## Prerequisites
- Branch: `004-annotation-json-upload`
- Existing working transcript upload (use `test-sample.vtt` or fixtures)
- Sample valid annotation JSON prepared (matching ~5 cues)

## Sample Annotation JSON (valid)
```json
{
  "version": 1,
  "annotations": [
    { "startMs": 0, "endMs": 1500, "importance": 2 },
    { "startMs": 1600, "endMs": 3000, "importance": 1 }
  ]
}
```

## Steps: Successful Import
1. Open Upload page.
2. Upload transcript VTT.
3. Use annotation JSON upload control to select sample file above.
4. Observe success message and importance levels reflected in corresponding cues.
5. Navigate to annotation page; confirm progress indicator matches count.

## Steps: Error Import (Unmatched)
1. Modify JSON startMs/endMs to values outside tolerance.
2. Re-upload JSON.
3. Expect error modal with summary; verify no cues annotated.
4. Close modal via keyboard (Esc) and retry with valid file.

## Accessibility Checks
- Tab to JSON upload control; Enter opens file dialog.
- After success, live region announces summary.
- Error modal traps focus; Shift+Tab cycles within; Esc closes.

## Overwrite Flow
1. Annotate one cue manually.
2. Upload valid JSON.
3. Confirm overwrite dialog appears; cancel keeps existing manual annotation.
4. Retry overwrite and confirm import replaces importance values.

## Verification Commands (Optional)
```bash
npm test -- src/tests/integration/annotationImport.test.tsx
npm run lint
npm run build
```

## Troubleshooting
- If import silently fails: check console for structural JSON errors.
- If performance slow: profile matcher function and consider chunking.
- If overwrite dialog missing: ensure manual annotation set `importance` before import.

## Next
After validating, proceed to implement tests and matcher utility optimizations if needed.
