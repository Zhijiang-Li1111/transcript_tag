# Research: Annotation JSON Upload

**Date**: 2025-11-11
**Branch**: 004-annotation-json-upload

## Decisions & Rationale

### 1. Atomic Import Strategy
- **Decision**: All-or-nothing application of annotations; abort on any mismatch.
- **Rationale**: Prevents partial data corruption and unclear mixed state.
- **Alternatives Considered**: Partial merge with warnings (rejected: increases complexity and user confusion); interactive conflict resolution (rejected: out of MVP scope).

### 2. Time Matching Tolerance (±50ms)
- **Decision**: Accept annotations if startMs and endMs differ by ≤50ms from cue times.
- **Rationale**: Accounts for minor floating point or rounding differences between systems.
- **Alternatives Considered**: Exact match only (rejected: fragile); percentage-based tolerance (rejected: unnecessary complexity).

### 3. Duplicate / Overlap Handling
- **Decision**: Any annotation time range mapping to more than one cue or duplicate ranges triggers import failure.
- **Rationale**: Ambiguity undermines data reliability.
- **Alternatives Considered**: Choose first matching cue (rejected: non-deterministic); merge duplicates (rejected: unclear semantics).

### 4. Notes Field in Import JSON
- **Decision**: Ignore incoming `notes`; regenerate based on imported importance value.
- **Rationale**: Ensures consistency with existing `generateImportanceNotes` logic.
- **Alternatives Considered**: Preserve provided notes (rejected: may diverge from standard taxonomy).

### 5. Performance Approach
- **Decision**: Synchronous parse and match for ≤2000 annotations; fallback micro-task batching only if profiling reveals UI jank.
- **Rationale**: Keep simple; avoid premature complexity.
- **Alternatives Considered**: Web Worker parsing (rejected for MVP: added build complexity, no proven need yet).

### 6. Error Presentation
- **Decision**: Accessible modal with summary counts and first few mismatches (cap at e.g. 10 examples).
- **Rationale**: Provides actionable feedback without overwhelming UI.
- **Alternatives Considered**: Inline error list beneath uploader (rejected: less prominent, risk of unnoticed failure).

### 7. Overwrite Existing Annotations
- **Decision**: Prompt user for confirmation when any cue already annotated before applying imported set.
- **Rationale**: Prevent accidental data loss.
- **Alternatives Considered**: Silent overwrite (rejected: risk); merge only new (rejected: complexity and unclear semantics).

### 8. Data Model Stability
- **Decision**: No schema version bump; imported data normalized to existing `ImportanceAnnotation` list.
- **Rationale**: Feature is ingest-only, does not alter export contract.
- **Alternatives Considered**: Increment version for provenance tracking (rejected: overhead without functional change).

### 9. Fallback When localStorage Unavailable
- **Decision**: Proceed in-memory; user warned that imported annotations will not persist after refresh.
- **Rationale**: Maintains usability rather than hard failure.
- **Alternatives Considered**: Block import entirely (rejected: reduces flexibility).

### 10. UI Placement
- **Decision**: Extend existing Upload page section with secondary JSON upload control (no new page or major layout changes).
- **Rationale**: Keeps cognitive load low; reuses established patterns.
- **Alternatives Considered**: Separate "Import Annotations" page (rejected: fragmentation).

## Summary of Resolved Unknowns
No outstanding clarifications; all key technical and UX choices documented with rationale supporting simplicity and reuse.

## Next Steps
Proceed to design data model alignment (`data-model.md`), implement matcher utility, and extend upload UI.
