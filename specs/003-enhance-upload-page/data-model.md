# Data Model: Upload Page Enhancement

**Feature**: Enhance Upload Page with Usage Guide & Remove Transcript Preview  
**Branch**: `003-enhance-upload-page`  
**Date**: 2025-10-24  
**Input**: Feature specification and research from plan and research.md

## Overview

This feature makes UI-only changes. **No new data models, types, or interfaces are required.** The feature operates entirely within the existing React component state and uses no new persistence or data structures.

---

## Existing Data Models (Unchanged)

### TranscriptCue (from `src/types/transcript.ts`)
```typescript
export interface TranscriptCue {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  speaker?: string;
  importance?: number; // 0-3, undefined if not yet rated
}
```
**Status**: Not modified. Feature does not change cue parsing or structure.

### AnnotationSession (from `src/types/annotation.ts`)
```typescript
export interface AnnotationSession {
  sessionId: string;
  meetingId: string;
  annotator: string;
  version: number;
  createdAt: string;
  lastModified: string;
  originalFileName: string;
  originalFileContent?: string;
  cues: TranscriptCue[];
  annotations: ImportanceAnnotation[];
  status?: SessionState;
  exportedAt?: string;
}
```
**Status**: Not modified. Feature does not change session lifecycle or data.

### FileValidationResult (from `src/utils/fileValidation.ts`)
**Status**: Not modified. File validation logic unchanged.

---

## Component State & Props (No Changes)

All existing component interfaces remain stable:

### FileUploader Props
```typescript
interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onValidationComplete: (result: FileValidationResult) => void;
  acceptedFormats?: string[];
  disabled?: boolean;
  className?: string;
}
```
**Status**: Unchanged. FileUploader component is used as-is.

### App Component State
```typescript
// In App.tsx
const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
const { cues, error, isLoading, ... } = useVTTParser();
const { currentSession, ... } = useAnnotationSession();
```
**Status**: No new state added. Feature uses existing state to conditionally render guide and hide preview.

---

## UI Content Models (New Inline Content)

No formal data structures needed. Guide content is **static JSX**.

### Usage Guide Content
The guide will display:
1. **Heading**: "How to use this tool"
2. **Section 1**: File Upload Instructions
   - Drag & drop or click to browse
   - Supports VTT/TXT files with VTT content
3. **Section 2**: Workflow Explanation
   - Rate each cue on a scale of 0-3 (Noise → Optional → Important → Critical)
   - Progress saves automatically
   - Export when finished
4. **Section 3**: Time Estimate
   - Expected duration: 5-10 minutes depending on cue count

**Delivery**: Static text/JSX in App.tsx, no data fetching or dynamic content loading.

---

## Integration Points

### With Existing Hooks
- `useVTTParser()`: Provides `cues`, `isLoading`, `error` - used to show guide and post-upload state
- `useAnnotationSession()`: Provides `currentSession` - used to toggle between upload and annotation phases

### With Existing Components
- `MainLayout`: Wrapper component (unchanged)
- `FileUploader`: Dropped into guide area (unchanged)
- `Button`: "Start Annotating Now" (unchanged)
- `CueList`: Removed from upload phase (no changes to component itself)

**Schema Changes**: None. Spec confirms "all other existing functionality remains unchanged."

---

## Summary

| Category | Status |
|----------|--------|
| New Types/Interfaces | ❌ None needed |
| New Data Structures | ❌ None needed |
| Modified Existing Types | ❌ No |
| New Persistence/Storage | ❌ No |
| New Hooks | ❌ No |
| Data Migrations | ❌ Not applicable |
| Export Format Changes | ❌ No |

**Conclusion**: Feature is purely presentational (UI layer). All data handling remains unchanged. Implementation can proceed with confidence in data model stability.
