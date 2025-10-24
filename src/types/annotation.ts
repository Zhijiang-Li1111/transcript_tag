import type { TranscriptCue } from './transcript';

// Core annotation entities
export interface ImportanceAnnotation {
  annotationId: string; // A1, A2, A3...
  startMs: number;
  endMs: number;
  importance: number; // 0-3
  notes: string; // Auto-generated description based on importance level
  timestamp: string; // ISO timestamp when annotation was created
}

export interface SessionMetadata {
  meetingId: string;
  annotator: string;
  originalFileName: string;
}

export interface AnnotationSession {
  sessionId: string; // UUID
  meetingId: string;
  annotator: string;
  version: number; // Schema version (starts at 1)
  createdAt: string; // ISO timestamp
  lastModified: string; // ISO timestamp
  originalFileName: string;
  originalFileContent?: string;
  cues: TranscriptCue[];
  annotations: ImportanceAnnotation[];
  status?: SessionState;
  exportedAt?: string;
}

// Session lifecycle states
export const SessionState = {
  INITIALIZED: 'initialized',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  EXPORTED: 'exported',
} as const;

export type SessionState = typeof SessionState[keyof typeof SessionState];

// Export format for JSON output
export interface AnnotationExportData {
  meetingId: string;
  annotator: string;
  version: number;
  createdAt: string;
  importanceAnnotations: ImportanceAnnotation[];
}

export interface ExportResult {
  annotationJson: string;
  originalVTT: string;
  zipBlob: Blob;
  filename: string;
}

export interface ExportControlViewModel {
  disabled: boolean;
  label: string;
  tooltip?: string;
  descriptionId: string;
}

interface ExportControlViewModelParams {
  isSessionComplete: boolean;
  remainingCueCount: number;
  metadataReady: boolean;
  pending?: boolean;
  baseLabel?: string;
  descriptionId?: string;
}

export function createExportControlViewModel({
  isSessionComplete,
  remainingCueCount,
  metadataReady,
  pending = false,
  baseLabel = 'Export annotations',
  descriptionId = 'export-control-helper',
}: ExportControlViewModelParams): ExportControlViewModel {
  if (!isSessionComplete) {
    const cueLabel = remainingCueCount === 1 ? 'cue' : 'cues';
    return {
      disabled: true,
      label: baseLabel,
      tooltip: `Annotate ${remainingCueCount} more ${cueLabel} to export`,
      descriptionId,
    };
  }

  if (!metadataReady) {
    return {
      disabled: true,
      label: baseLabel,
      tooltip: 'Original file metadata missing; confirm upload before exporting.',
      descriptionId,
    };
  }

  if (pending) {
    return {
      disabled: true,
      label: 'Preparing export...',
      descriptionId,
    };
  }

  return {
    disabled: false,
    label: baseLabel,
    tooltip: 'Download JSON + original VTT as a ZIP archive.',
    descriptionId,
  };
}

// Progress tracking
export interface AnnotationProgress {
  totalCues: number;
  annotatedCues: number;
  completionPercentage: number;
  importanceCounts: Record<number, number>;
  currentIndex: number;
}

// Error handling for annotations
export interface AnnotationError {
  type: 'STORAGE_ERROR' | 'EXPORT_ERROR' | 'VALIDATION_ERROR';
  message: string;
  cueId?: string;
  timestamp: string;
}

// Notes generation based on importance levels
export function generateImportanceNotes(importance: number): string {
  switch (importance) {
    case 3:
      return 'Critical decision/commitment';
    case 2:
      return 'Important information/evidence';
    case 1:
      return 'Optional background context';
    case 0:
      return 'Noise/non-informative';
    default:
      throw new Error(`Invalid importance level: ${importance}`);
  }
}

// Generate unique annotation ID
export function generateAnnotationId(index: number): string {
  return `A${index + 1}`;
}

// Generate session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validate annotation session
export function validateAnnotationSession(session: Partial<AnnotationSession>): string[] {
  const errors: string[] = [];

  if (!session.sessionId) {
    errors.push('Session ID is required');
  }

  if (!session.meetingId) {
    errors.push('Meeting ID is required');
  }

  if (!session.annotator) {
    errors.push('Annotator is required');
  }

  if (!session.version || session.version < 1) {
    errors.push('Version must be a positive number');
  }

  if (!session.createdAt) {
    errors.push('Created date is required');
  }

  if (!session.lastModified) {
    errors.push('Last modified date is required');
  }

  if (!session.originalFileName) {
    errors.push('Original filename is required');
  }

  if (!session.cues || !Array.isArray(session.cues)) {
    errors.push('Cues array is required');
  }

  if (!session.annotations || !Array.isArray(session.annotations)) {
    errors.push('Annotations array is required');
  }

  // Validate that annotation count doesn't exceed cue count
  if (session.cues && session.annotations && session.annotations.length > session.cues.length) {
    errors.push('Cannot have more annotations than cues');
  }

  return errors;
}

// Create new annotation from cue
export function createAnnotationFromCue(
  cue: TranscriptCue,
  importance: number,
  index: number
): ImportanceAnnotation {
  if (cue.importance === undefined) {
    throw new Error('Cannot create annotation for cue without importance level');
  }

  return {
    annotationId: generateAnnotationId(index),
    startMs: cue.startMs,
    endMs: cue.endMs,
    importance,
    notes: generateImportanceNotes(importance),
    timestamp: new Date().toISOString(),
  };
}

// Calculate progress statistics
export function calculateProgress(session: AnnotationSession): AnnotationProgress {
  const totalCues = session.cues.length;
  const annotatedCues = session.cues.filter(cue => cue.importance !== undefined).length;
  const completionPercentage = totalCues > 0 ? Math.round((annotatedCues / totalCues) * 100) : 0;

  // Count annotations by importance level
  const importanceCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  session.cues.forEach(cue => {
    if (cue.importance !== undefined) {
      importanceCounts[cue.importance]++;
    }
  });

  return {
    totalCues,
    annotatedCues,
    completionPercentage,
    importanceCounts,
    currentIndex: 0, // This will be managed by the navigation state
  };
}

// Storage key for localStorage
export function getStorageKey(sessionId: string): string {
  return `transcript-session-${sessionId}`;
}

// Check if session is expired (7 days)
export function isSessionExpired(session: AnnotationSession): boolean {
  const expiryTime = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const sessionTime = new Date(session.lastModified).getTime();
  return Date.now() - sessionTime > expiryTime;
}

// Cleanup expired sessions from localStorage
export function cleanupExpiredSessions(): void {
  const keys = Object.keys(localStorage);
  const sessionKeys = keys.filter(key => key.startsWith('transcript-session-'));

  sessionKeys.forEach(key => {
    try {
      const sessionData = localStorage.getItem(key);
      if (sessionData) {
        const session: AnnotationSession = JSON.parse(sessionData);
        if (isSessionExpired(session)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Remove corrupted session data
      localStorage.removeItem(key);
    }
  });
}