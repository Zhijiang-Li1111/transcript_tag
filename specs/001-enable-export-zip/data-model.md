# Data Model: Export Bundle Activation

## Core Entities (existing)
- `AnnotationSession`: persisted session object from `useAnnotationSession`. Required fields for export gate (`cues`, `annotations`, `meetingId`, `annotator`, `originalFileName`).
- `AnnotationExportData`: JSON payload produced by `exportAnnotations` containing `meetingId`, `annotator`, `version`, `createdAt`, and `importanceAnnotations` array.
- `ExportResult`: structure returned by `exportAnnotations` (`annotationJson`, `originalVTT`, `zipBlob`, `filename`).

## Derived State
- `exportReady: boolean`: true when every cue in `session.cues` has `importance !== undefined` and required session metadata present. Computed via helper (plan to expose from `useAnnotationSession` or local selector).
- `pending: boolean`: local transient state in export component while awaiting async ZIP generation.
- `exportError?: string`: surfaced on failure from `exportAnnotations` / `downloadFile`.

## New View Model Contract
```
interface ExportControlViewModel {
  disabled: boolean;
  label: string;
  tooltip?: string;
  descriptionId: string; // for aria-describedby
}
```
- Derived from `exportReady`, `pending`, and session progress; consumed by export UI (button + helper text).

## Side Effects & Storage
- No new persistent storage. Export uses in-memory session state and triggers browser download through `downloadFile` (existing utility).
- On successful export, session may transition to `SessionState.EXPORTED` (optional update handled via `useAnnotationSession`).

## File Outputs
- `annotations.json`: pretty-printed `AnnotationExportData` with deterministic ordering of keys.
- `original.vtt`: output from `exportToVTT` including cue-level importance markers when available.
- Archive name template: `${session.meetingId || 'session'}-annotations-${timestamp}.zip`.
