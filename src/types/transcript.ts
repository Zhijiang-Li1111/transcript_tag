// Transcript-related type definitions
export interface TranscriptCue {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  speaker?: string;
  importance?: number; // 0-3, undefined if not yet rated
}

export interface VTTParseError {
  type: 'INVALID_FORMAT' | 'CORRUPTED_FILE' | 'TOO_LARGE' | 'NO_CUES' | 'INVALID_TIMESTAMP' | 'EMPTY_CUE';
  message: string;
  lineNumber?: number;
  details?: string;
}

export interface ParseResult {
  success: boolean;
  cues?: TranscriptCue[];
  errors?: VTTParseError[];
  warnings?: string[];
}

export interface VTTValidationRules {
  maxFileSize: number; // 50MB
  requiredHeader: string; // "WEBVTT"
  minCues: number;
  maxCues: number;
  maxCueLength: number; // characters
}

export const VTT_VALIDATION_CONFIG: VTTValidationRules = {
  maxFileSize: 50_000_000, // 50MB
  requiredHeader: 'WEBVTT',
  minCues: 1,
  maxCues: 10_000,
  maxCueLength: 5_000, // characters
};

export const ImportanceLevel = {
  NOISE: 0,
  OPTIONAL: 1,
  IMPORTANT: 2,
  CRITICAL: 3,
} as const;

export type ImportanceLevel = typeof ImportanceLevel[keyof typeof ImportanceLevel];

export interface ImportanceLevelConfig {
  level: number;
  label: string;
  description: string;
  color: string;
  shortcut: string;
}

export const IMPORTANCE_CONFIG: ImportanceLevelConfig[] = [
  {
    level: 0,
    label: 'Noise',
    description: 'Small talk, fillers, chit-chat, non-informative',
    color: 'var(--color-noise)',
    shortcut: '0',
  },
  {
    level: 1,
    label: 'Optional',
    description: 'Minor background, explanations, low-value repetitions',
    color: 'var(--color-optional)',
    shortcut: '1',
  },
  {
    level: 2,
    label: 'Important',
    description: 'Core comparisons, key evidence, plan actions, critical questions',
    color: 'var(--color-important)',
    shortcut: '2',
  },
  {
    level: 3,
    label: 'Critical',
    description: 'Decisions / commitments / hard results / key risk confirmations',
    color: 'var(--color-critical)',
    shortcut: '3',
  },
];

// Utility function to get importance level config
export function getImportanceConfig(level: number): ImportanceLevelConfig {
  const config = IMPORTANCE_CONFIG.find(c => c.level === level);
  if (!config) {
    throw new Error(`Invalid importance level: ${level}`);
  }
  return config;
}

// Validation function for TranscriptCue
export function validateTranscriptCue(cue: Partial<TranscriptCue>): string[] {
  const errors: string[] = [];

  if (!cue.id) {
    errors.push('Cue ID is required');
  }

  if (typeof cue.startMs !== 'number' || cue.startMs < 0) {
    errors.push('Start time must be a non-negative number');
  }

  if (typeof cue.endMs !== 'number' || cue.endMs <= 0) {
    errors.push('End time must be a positive number');
  }

  if (typeof cue.startMs === 'number' && typeof cue.endMs === 'number' && cue.endMs <= cue.startMs) {
    errors.push('End time must be greater than start time');
  }

  if (!cue.text || cue.text.trim().length === 0) {
    errors.push('Cue text cannot be empty');
  }

  if (cue.text && cue.text.length > VTT_VALIDATION_CONFIG.maxCueLength) {
    errors.push(`Cue text exceeds maximum length of ${VTT_VALIDATION_CONFIG.maxCueLength} characters`);
  }

  if (cue.importance !== undefined && ![0, 1, 2, 3].includes(cue.importance)) {
    errors.push('Importance level must be 0, 1, 2, or 3');
  }

  return errors;
}

// Utility function to format time for display
export function formatTimeMs(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10); // Display centiseconds

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

// Utility function to parse time string to milliseconds
export function parseTimeToMs(timeStr: string): number {
  // Format: HH:MM:SS.mmm or MM:SS.mmm or SS.mmm
  const parts = timeStr.split(':');
  let hours = 0;
  let minutes = 0;
  let secondsAndMs: string;

  if (parts.length === 3) {
    // HH:MM:SS.mmm
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    secondsAndMs = parts[2];
  } else if (parts.length === 2) {
    // MM:SS.mmm
    minutes = parseInt(parts[0], 10);
    secondsAndMs = parts[1];
  } else {
    // SS.mmm
    secondsAndMs = parts[0];
  }

  const [secondsStr, msStr = '000'] = secondsAndMs.split('.');
  const seconds = parseInt(secondsStr, 10);
  const milliseconds = parseInt(msStr.padEnd(3, '0').slice(0, 3), 10);

  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
}