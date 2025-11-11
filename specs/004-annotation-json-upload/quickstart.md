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
3. Click "Upload Annotation JSON" button in the gray box below the VTT uploader.
4. Select sample JSON file from above.
5. Observe success message (green box) showing annotation count applied.
6. Click "Start Annotating Now" button.
7. Navigate to annotation page; confirm cues have importance levels loaded and progress indicator matches count.

## Steps: Error Import (Unmatched)
1. Modify JSON startMs/endMs to values outside tolerance (e.g., add 100ms to each).
2. Re-upload JSON.
3. Expect error message (red box) with issue summary; verify no cues annotated.
4. Correct JSON and retry with valid file.

## Steps: Overwrite Confirmation
1. Upload valid transcript and JSON.
2. After import success, click "Start Annotating Now" and manually annotate one cue.
3. Return to upload page (click "Back to Upload" if needed, or refresh and re-upload VTT).
4. Attempt to re-upload same JSON.
5. Confirm browser confirm() dialog appears asking about overwrite.
6. Click "Cancel" → verify no change to annotations.
7. Retry import and click "OK" → verify importance values replaced.

## Accessibility Checks
- Tab to "Upload Annotation JSON" button; Enter/Space opens file dialog.
- After success, screen reader should announce success message (ARIA live region implicit via React).
- Error messages displayed inline with semantic colors (red for errors, green for success).

## Verification Commands (Optional)
```bash
npm run lint
npm run build
```

## Troubleshooting
- If import silently fails: check browser console for structural JSON errors.
- If performance slow (>2s for 2000 annotations): check dev console for performance warning logged.
- If overwrite dialog missing: ensure VTT re-upload creates session first, then import again.
- If annotations don't persist: localStorage might be disabled; check browser settings.

## Next
After validating, feature is complete for MVP scope. Optional: add US2 modal component for more sophisticated error display or US3 for enhanced progress UI.
