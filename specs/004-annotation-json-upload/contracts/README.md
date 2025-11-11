# Contracts: Annotation JSON Upload

No external API or network contracts introduced. All operations are client-side.

## Internal Function Contracts

### matchAnnotationsToCues(imported: ImportedAnnotation[], cues: TranscriptCue[], toleranceMs: number)
Returns discriminated union:
```ts
{ kind: 'success'; applied: { cueIndex: number; importance: number }[]; issues: [] } |
{ kind: 'error'; issues: AnnotationImportIssue[] }
```
- Atomic: success only if no issues.
- Issues include: UNMATCHED, DUPLICATE, OVERLAP, INVALID_IMPORTANCE, STRUCTURAL.

### importAnnotations(jsonText: string)
Responsible for: parse → structural validate → call matcher → apply importance → update progress.
Provided by enhancement to `useAnnotationSession` or local Upload page controller.

## Notes
Transient types remain local to utility file to avoid expanding global type surface.
