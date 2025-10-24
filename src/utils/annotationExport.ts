import JSZip from 'jszip';
import type {
  AnnotationSession,
  AnnotationExportData,
  ExportResult,
  ImportanceAnnotation,
} from '../types/annotation';
import { createAnnotationFromCue } from '../types/annotation';
import { exportToVTT } from './vttParser';

/**
 * Export annotation session to downloadable files
 * @param session Complete annotation session
 * @returns Export result with JSON, VTT, and ZIP blob
 */
export async function exportAnnotations(session: AnnotationSession): Promise<ExportResult> {
  try {
    // Generate annotations from annotated cues
    const annotations = generateAnnotationsFromSession(session);

    const exportTimestamp = new Date().toISOString();
    const safeMeetingId = sanitizeOptionalString(session.meetingId);
    const safeAnnotator = sanitizeOptionalString(session.annotator);
    const safeOriginalFileName = deriveOriginalFilename(session.originalFileName);
    const archivePrefix = deriveArchivePrefix(safeMeetingId, safeOriginalFileName);
    const version = typeof session.version === 'number' && session.version > 0 ? session.version : 1;
    
    // Create annotation export data
    const annotationData: AnnotationExportData = {
      meetingId: safeMeetingId,
      annotator: safeAnnotator,
      version,
      createdAt: exportTimestamp,
      importanceAnnotations: annotations,
    };

    // Convert to JSON
    const annotationJson = JSON.stringify(annotationData, null, 2);

    // Generate original VTT with importance comments
  const originalVTT = session.originalFileContent ?? exportToVTT(session.cues, true);
    const vttFilename = ensureVttExtension(safeOriginalFileName);

    // Create ZIP file containing both files
    const zipBlob = await createZipFile([
      { filename: 'annotations.json', content: annotationJson, type: 'application/json' },
      { filename: vttFilename, content: originalVTT, type: 'text/vtt' },
    ]);

    // Generate filename with timestamp
    const timestamp = exportTimestamp.replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${archivePrefix}-annotations-${timestamp}.zip`;

    return {
      annotationJson,
      originalVTT,
      zipBlob,
      filename,
    };

  } catch (error) {
    throw new Error(`Failed to export annotations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate importance annotations from session cues
 * @param session Annotation session
 * @returns Array of importance annotations
 */
function generateAnnotationsFromSession(session: AnnotationSession): ImportanceAnnotation[] {
  const annotations: ImportanceAnnotation[] = [];
  let annotationIndex = 0;

  session.cues.forEach(cue => {
    if (cue.importance !== undefined) {
      const annotation = createAnnotationFromCue(cue, cue.importance, annotationIndex);
      annotations.push(annotation);
      annotationIndex++;
    }
  });

  return annotations;
}

/**
 * Create ZIP file from multiple files
 * @param files Array of files to include in ZIP
 * @returns Promise that resolves to ZIP blob
 */
async function createZipFile(files: Array<{
  filename: string;
  content: string;
  type: string;
}>): Promise<Blob> {
  const zip = new JSZip();

  files.forEach(file => {
    zip.file(file.filename, file.content, {
      binary: false,
      createFolders: false,
    });
  });

  try {
    return await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  } catch (error) {
    throw new Error(`ZIP creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function sanitizeOptionalString(value: string | undefined | null): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function deriveOriginalFilename(originalFileName: string | undefined | null): string {
  const fallback = 'original.vtt';
  if (typeof originalFileName !== 'string') {
    return fallback;
  }

  const trimmed = originalFileName.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function ensureVttExtension(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.vtt') || lower.endsWith('.txt')) {
    // Replace txt with vtt for export, keep vtt as is
    if (lower.endsWith('.txt')) {
      return filename.slice(0, -4) + '.vtt';
    }
    return filename;
  }
  const sanitized = filename.replace(/\.[^/.]+$/, '');
  return `${sanitized}.vtt`;
}

function deriveArchivePrefix(meetingId: string, originalFileName: string): string {
  const preferred = meetingId || removeExtension(originalFileName) || 'session';
  return sanitizeFilenameSegment(preferred);
}

function removeExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) {
    return filename;
  }
  return filename.slice(0, lastDot);
}

function sanitizeFilenameSegment(raw: string): string {
  const sanitized = raw.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
  return sanitized.length > 0 ? sanitized.toLowerCase() : 'session';
}

// Removed text archive fallback now that we rely on JSZip

/**
 * Download file using browser APIs
 * @param blob File blob to download
 * @param filename Desired filename
 */
export function downloadFile(blob: Blob, filename: string): void {
  try {
    // Create object URL
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to DOM and trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export annotations as JSON only
 * @param session Annotation session
 * @returns JSON string
 */
export function exportAnnotationsAsJSON(session: AnnotationSession): string {
  const annotations = generateAnnotationsFromSession(session);
  
  const annotationData: AnnotationExportData = {
    meetingId: session.meetingId,
    annotator: session.annotator,
    version: session.version,
    createdAt: session.createdAt,
    importanceAnnotations: annotations,
  };

  return JSON.stringify(annotationData, null, 2);
}

/**
 * Export session statistics
 * @param session Annotation session
 * @returns Statistics object
 */
export function exportSessionStatistics(session: AnnotationSession): {
  summary: {
    totalCues: number;
    annotatedCues: number;
    completionPercentage: number;
    sessionDuration: number; // in minutes
  };
  importanceDistribution: Record<number, number>;
  timeDistribution: {
    level: number;
    totalDuration: number; // in seconds
    percentage: number;
  }[];
  qualityMetrics: {
    averageImportance: number;
    criticalMoments: number;
    noisyContent: number;
  };
} {
  const totalCues = session.cues.length;
  const annotatedCues = session.cues.filter(cue => cue.importance !== undefined);
  const completionPercentage = totalCues > 0 ? (annotatedCues.length / totalCues) * 100 : 0;
  
  // Calculate session duration
  const sessionStart = new Date(session.createdAt).getTime();
  const sessionEnd = new Date(session.lastModified).getTime();
  const sessionDuration = Math.round((sessionEnd - sessionStart) / 60000); // minutes

  // Calculate importance distribution
  const importanceDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  annotatedCues.forEach(cue => {
    if (cue.importance !== undefined) {
      importanceDistribution[cue.importance]++;
    }
  });

  // Calculate time distribution by importance level
  const timeDistribution = [0, 1, 2, 3].map(level => {
    const cuesAtLevel = annotatedCues.filter(cue => cue.importance === level);
    const totalDuration = cuesAtLevel.reduce((sum, cue) => sum + (cue.endMs - cue.startMs), 0) / 1000; // seconds
    const percentage = annotatedCues.length > 0 ? (cuesAtLevel.length / annotatedCues.length) * 100 : 0;
    
    return {
      level,
      totalDuration,
      percentage,
    };
  });

  // Calculate quality metrics
  const importanceValues = annotatedCues
    .map(cue => cue.importance!)
    .filter(importance => importance !== undefined);
  
  const averageImportance = importanceValues.length > 0
    ? importanceValues.reduce((sum, importance) => sum + importance, 0) / importanceValues.length
    : 0;

  const criticalMoments = importanceDistribution[3];
  const noisyContent = importanceDistribution[0];

  return {
    summary: {
      totalCues,
      annotatedCues: annotatedCues.length,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      sessionDuration,
    },
    importanceDistribution,
    timeDistribution,
    qualityMetrics: {
      averageImportance: Math.round(averageImportance * 100) / 100,
      criticalMoments,
      noisyContent,
    },
  };
}

/**
 * Create a preview of the export for user review
 * @param session Annotation session
 * @returns Preview object
 */
export function createExportPreview(session: AnnotationSession): {
  filename: string;
  fileCount: number;
  totalSize: number;
  annotationCount: number;
  preview: {
    sampleAnnotations: ImportanceAnnotation[];
    statistics: ReturnType<typeof exportSessionStatistics>;
  };
} {
  const annotations = generateAnnotationsFromSession(session);
  const statistics = exportSessionStatistics(session);
  
  // Estimate file sizes (rough calculation)
  const jsonSize = JSON.stringify({
    meetingId: session.meetingId,
    annotator: session.annotator,
    version: session.version,
    createdAt: session.createdAt,
    importanceAnnotations: annotations,
  }, null, 2).length;
  
  const vttSize = exportToVTT(session.cues, true).length;
  const totalSize = jsonSize + vttSize;
  
  // Generate filename preview
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${session.meetingId}-annotations-${timestamp}.zip`;
  
  // Get sample annotations (first 3 and last 3)
  const sampleAnnotations = annotations.length <= 6 
    ? annotations 
    : [
        ...annotations.slice(0, 3),
        ...annotations.slice(-3),
      ];

  return {
    filename,
    fileCount: 2, // JSON + VTT
    totalSize,
    annotationCount: annotations.length,
    preview: {
      sampleAnnotations,
      statistics,
    },
  };
}

/**
 * Validate export readiness
 * @param session Annotation session
 * @returns Validation result
 */
export function validateExportReadiness(session: AnnotationSession): {
  isReady: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!session.meetingId) {
    errors.push('Meeting ID is required for export');
  }

  if (!session.annotator) {
    errors.push('Annotator name is required for export');
  }

  // Check annotation completeness
  const annotatedCues = session.cues.filter(cue => cue.importance !== undefined);
  if (annotatedCues.length === 0) {
    errors.push('No annotations found to export');
  }

  const completionPercentage = (annotatedCues.length / session.cues.length) * 100;
  if (completionPercentage < 50) {
    warnings.push(`Only ${Math.round(completionPercentage)}% of cues are annotated`);
  }

  // Check for unusual patterns
  const importanceDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  annotatedCues.forEach(cue => {
    if (cue.importance !== undefined) {
      importanceDistribution[cue.importance]++;
    }
  });

  if (importanceDistribution[0] > annotatedCues.length * 0.8) {
    warnings.push('Most cues are marked as noise - please verify annotations');
  }

  if (importanceDistribution[3] > annotatedCues.length * 0.5) {
    warnings.push('Most cues are marked as critical - please verify annotations');
  }

  return {
    isReady: errors.length === 0,
    errors,
    warnings,
  };
}