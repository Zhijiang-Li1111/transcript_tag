/**
 * Annotation JSON Import Utilities
 * 
 * Handles parsing and time-based matching of annotation JSON files
 * to existing transcript cues.
 * 
 * Matching Tolerance: ±50ms for both startMs and endMs
 * (configurable constant; accounts for floating-point drift)
 * 
 * All operations are atomic: either all annotations apply or none.
 */

import type { TranscriptCue } from '../types/transcript';

// Tolerance for time matching (milliseconds)
const TIME_MATCH_TOLERANCE_MS = 50;

// Internal types (not exported to keep API surface minimal)
interface ImportedAnnotation {
  startMs: number;
  endMs: number;
  importance: number;
  notes?: string; // Ignored during import
  annotationId?: string; // Ignored during import
}

interface ImportedAnnotationFile {
  version: number;
  meetingId?: string;
  annotator?: string;
  annotations: ImportedAnnotation[];
}

type AnnotationImportIssueType =
  | 'UNMATCHED'
  | 'DUPLICATE'
  | 'OVERLAP'
  | 'INVALID_IMPORTANCE'
  | 'STRUCTURAL';

interface AnnotationImportIssue {
  type: AnnotationImportIssueType;
  annotationIndex: number;
  details: string;
}

type AnnotationImportResult =
  | { kind: 'success'; appliedCount: number; partial: boolean }
  | { kind: 'error'; issues: AnnotationImportIssue[] };

/**
 * Parse and validate JSON annotation file structure
 */
export function parseAnnotationJson(jsonText: string): ImportedAnnotationFile | { error: string } {
  try {
    const parsed = JSON.parse(jsonText);

    // Structural validation
    if (!parsed || typeof parsed !== 'object') {
      return { error: 'Invalid JSON structure: root must be an object' };
    }

    if (typeof parsed.version !== 'number' || parsed.version < 1) {
      return { error: 'Invalid or missing version field (must be number >= 1)' };
    }

    if (!Array.isArray(parsed.annotations)) {
      return { error: 'Missing or invalid annotations array' };
    }

    return parsed as ImportedAnnotationFile;
  } catch (err) {
    return { error: `JSON parse error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Validate individual annotation fields
 */
export function validateAnnotation(ann: ImportedAnnotation, index: number): AnnotationImportIssue | null {
  if (typeof ann.startMs !== 'number' || typeof ann.endMs !== 'number') {
    return {
      type: 'STRUCTURAL',
      annotationIndex: index,
      details: 'Missing or invalid startMs/endMs (must be numbers)',
    };
  }

  if (ann.startMs >= ann.endMs) {
    return {
      type: 'STRUCTURAL',
      annotationIndex: index,
      details: `Invalid time range: startMs (${ann.startMs}) must be < endMs (${ann.endMs})`,
    };
  }

  if (typeof ann.importance !== 'number' || !Number.isInteger(ann.importance)) {
    return {
      type: 'INVALID_IMPORTANCE',
      annotationIndex: index,
      details: `Importance must be an integer, got: ${ann.importance}`,
    };
  }

  if (ann.importance < 0 || ann.importance > 3) {
    return {
      type: 'INVALID_IMPORTANCE',
      annotationIndex: index,
      details: `Importance must be 0-3, got: ${ann.importance}`,
    };
  }

  return null;
}

/**
 * Check if two time ranges match within tolerance
 */
function timeRangesMatch(
  start1: number,
  end1: number,
  start2: number,
  end2: number,
  tolerance: number
): boolean {
  return (
    Math.abs(start1 - start2) <= tolerance &&
    Math.abs(end1 - end2) <= tolerance
  );
}

/**
 * Match imported annotations to transcript cues atomically
 * Returns success only if all annotations match exactly one cue
 */
export function matchAnnotationsToCues(
  imported: ImportedAnnotation[],
  cues: TranscriptCue[],
  toleranceMs: number = TIME_MATCH_TOLERANCE_MS
): AnnotationImportResult {
  const issues: AnnotationImportIssue[] = [];

  // First pass: validate all annotations
  for (let i = 0; i < imported.length; i++) {
    const validationIssue = validateAnnotation(imported[i], i);
    if (validationIssue) {
      issues.push(validationIssue);
    }
  }

  if (issues.length > 0) {
    return { kind: 'error', issues };
  }

  // Second pass: check for duplicates in imported annotations
  const seenRanges = new Map<string, number>();
  for (let i = 0; i < imported.length; i++) {
    const ann = imported[i];
    const key = `${ann.startMs}-${ann.endMs}`;
    if (seenRanges.has(key)) {
      issues.push({
        type: 'DUPLICATE',
        annotationIndex: i,
        details: `Duplicate time range: ${ann.startMs}-${ann.endMs}ms (first seen at index ${seenRanges.get(key)})`,
      });
    } else {
      seenRanges.set(key, i);
    }
  }

  if (issues.length > 0) {
    return { kind: 'error', issues };
  }

  // Third pass: match each annotation to exactly one cue
  const matches: Array<{ cueIndex: number; importance: number }> = [];

  for (let i = 0; i < imported.length; i++) {
    const ann = imported[i];
    const matchingCueIndices: number[] = [];

    for (let j = 0; j < cues.length; j++) {
      const cue = cues[j];
      if (timeRangesMatch(ann.startMs, ann.endMs, cue.startMs, cue.endMs, toleranceMs)) {
        matchingCueIndices.push(j);
      }
    }

    if (matchingCueIndices.length === 0) {
      issues.push({
        type: 'UNMATCHED',
        annotationIndex: i,
        details: `No matching cue found for time range ${ann.startMs}-${ann.endMs}ms`,
      });
    } else if (matchingCueIndices.length > 1) {
      issues.push({
        type: 'OVERLAP',
        annotationIndex: i,
        details: `Ambiguous match: annotation ${ann.startMs}-${ann.endMs}ms matches ${matchingCueIndices.length} cues`,
      });
    } else {
      matches.push({ cueIndex: matchingCueIndices[0], importance: ann.importance });
    }
  }

  if (issues.length > 0) {
    return { kind: 'error', issues };
  }

  // Success: return match details
  const partial = matches.length < cues.length;
  return {
    kind: 'success',
    appliedCount: matches.length,
    partial,
  };
}

/**
 * Apply matched annotations to cues (mutates cue array)
 * Only call after matchAnnotationsToCues returns success
 */
export function applyAnnotationsToCues(
  imported: ImportedAnnotation[],
  cues: TranscriptCue[],
  toleranceMs: number = TIME_MATCH_TOLERANCE_MS
): void {
  const startTime = Date.now();
  
  for (const ann of imported) {
    for (const cue of cues) {
      if (timeRangesMatch(ann.startMs, ann.endMs, cue.startMs, cue.endMs, toleranceMs)) {
        cue.importance = ann.importance;
        break; // Already validated unique match
      }
    }
  }
  
  const elapsed = Date.now() - startTime;
  if (import.meta.env.DEV && elapsed > 100) {
    console.warn(`[annotationImport] applyAnnotationsToCues took ${elapsed}ms for ${imported.length} annotations`);
  }
}

