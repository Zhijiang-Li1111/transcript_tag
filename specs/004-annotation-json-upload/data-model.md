# Data Model: Annotation JSON Upload

**Date**: 2025-11-11
**Branch**: 004-annotation-json-upload

## Entities

### TranscriptCue (existing)
Location: `src/types/transcript.ts`
Fields (relevant): `startMs: number`, `endMs: number`, `text: string`, `importance?: number`
Role: Target for matching imported annotations; `importance` added/overwritten on successful import.

### ImportanceAnnotation (existing)
Location: `src/types/annotation.ts`
Fields: `annotationId: string`, `startMs: number`, `endMs: number`, `importance: number (0-3)`, `notes: string`, `timestamp: string`
Role: Export representation; generated from cues with importance once session is exported.

### ImportedAnnotation (transient)
Location: `src/utils/annotationImport.ts` (not exported globally)
Fields: `startMs: number`, `endMs: number`, `importance: number`
Optional Ignored Fields: `notes?: string`, `annotationId?: string`
Role: Intermediate parsed object from uploaded JSON used for matching before applying importance to cues.

### AnnotationImportResult (transient)
Shape (discriminated union):
```ts
{ kind: 'success'; appliedCount: number; partial: boolean; }
| { kind: 'error'; errors: AnnotationImportIssue[] }
```

### AnnotationImportIssue (transient)
Fields: `type: 'UNMATCHED' | 'DUPLICATE' | 'OVERLAP' | 'INVALID_IMPORTANCE' | 'STRUCTURAL'`, `annotationIndex: number`, `details: string`

## Validation Rules

1. `startMs < endMs` for every imported annotation.
2. `importance` is integer in [0,3].
3. Time matching tolerance: `abs(imported.startMs - cue.startMs) <= 50` AND `abs(imported.endMs - cue.endMs) <= 50`.
4. One imported annotation maps to exactly one cue (no multiple matches).
5. Duplicate imported time ranges (after tolerance normalization) cause failure.
6. Overlapping imported ranges that would span multiple cues cause failure.
7. If any rule fails, entire import result is `error` and no cue importance is modified.

## State Transitions

Session state unaffected (remains `initialized` until user begins or completes annotation). Import applying importance may move progress but not change lifecycle flags; state transitions follow existing logic in `useAnnotationSession`.

## Persistence Impact

- No change to stored session schema; cues receive `importance` values as if annotated manually.
- Export process unchanged: it derives `ImportanceAnnotation` objects from cues.
- No version bump required; import does not extend output fields.

## Migration Considerations

None. Existing sessions without import remain valid. Imported annotations produce identical export output as manual tagging.

## Reuse & Non-Duplication

- Reuse `generateImportanceNotes` for notes derivation during export only.
- Avoid adding new types under `src/types/` for transient import shapes (keep them local to utility to minimize surface area).

## Risks

- Large file parsing blocking UI: mitigated by keeping function pure and allowing future refactor to chunking if needed.
- Tolerance too tight/loose: adjust constant after initial user feedback (document in utility).

## Open Revisions

None pending; data model stable for implementation.
