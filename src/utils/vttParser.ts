import type {
  TranscriptCue,
  VTTParseError,
  ParseResult,
  VTTValidationRules,
} from '../types/transcript';
import { VTT_VALIDATION_CONFIG, parseTimeToMs, validateTranscriptCue } from '../types/transcript';

/**
 * Parse VTT file content into structured transcript cues
 * @param fileContent The VTT file content as string
 * @param validationRules Optional validation rules (uses defaults if not provided)
 * @returns ParseResult with success status and parsed cues or errors
 */
export async function parseVTTFile(
  fileContent: string,
  validationRules: VTTValidationRules = VTT_VALIDATION_CONFIG
): Promise<ParseResult> {
  const errors: VTTParseError[] = [];
  const warnings: string[] = [];
  const cues: TranscriptCue[] = [];

  try {
    // Basic validation
    if (!fileContent || fileContent.trim().length === 0) {
      return {
        success: false,
        errors: [{
          type: 'CORRUPTED_FILE',
          message: 'File content is empty',
        }],
      };
    }

    // Split content into lines and clean up
    const lines = fileContent.split(/\r?\n/).map(line => line.trim());
    
    // Validate VTT header
    if (!lines[0] || !lines[0].startsWith(validationRules.requiredHeader)) {
      errors.push({
        type: 'INVALID_FORMAT',
        message: `File must start with "${validationRules.requiredHeader}" header`,
        lineNumber: 1,
      });
    }

    // Parse cues
    let currentLine = 1; // Start after header
    let cueIndex = 0;

    while (currentLine < lines.length) {
      // Skip empty lines and comments
      if (!lines[currentLine] || lines[currentLine].startsWith('NOTE')) {
        currentLine++;
        continue;
      }

      // Look for timing line (format: HH:MM:SS.mmm --> HH:MM:SS.mmm)
      const timingMatch = lines[currentLine].match(
        /^(\d{1,2}:)?(\d{1,2}):(\d{1,2})\.(\d{1,3})\s*-->\s*(\d{1,2}:)?(\d{1,2}):(\d{1,2})\.(\d{1,3})(.*)$/
      );

      if (timingMatch) {
        try {
          const startTime = timingMatch[0].split(' --> ')[0];
          const endTime = timingMatch[0].split(' --> ')[1].split(' ')[0]; // Remove any additional settings

          const startMs = parseTimeToMs(startTime);
          const endMs = parseTimeToMs(endTime);

          // Validate timing
          if (startMs >= endMs) {
            errors.push({
              type: 'INVALID_TIMESTAMP',
              message: 'Start time must be less than end time',
              lineNumber: currentLine + 1,
              details: `Start: ${startTime}, End: ${endTime}`,
            });
            currentLine++;
            continue;
          }

          // Collect cue text (lines after timing until empty line or next cue)
          const textLines: string[] = [];
          currentLine++;

          while (currentLine < lines.length && lines[currentLine] !== '') {
            // Skip if this line looks like a timing line (start of next cue)
            if (lines[currentLine].includes(' --> ')) {
              break;
            }
            textLines.push(lines[currentLine]);
            currentLine++;
          }

          // Clean up cue text (remove HTML tags and normalize)
          const { speaker, textLines: contentLines } = extractSpeakerFromTextLines(textLines);
          const rawText = contentLines.join(' ');
          const cleanText = cleanVTTText(rawText);

          if (cleanText.length === 0) {
            warnings.push(`Empty cue text at line ${currentLine - textLines.length + 1}`);
            continue;
          }

          if (cleanText.length > validationRules.maxCueLength) {
            warnings.push(
              `Cue text exceeds maximum length (${cleanText.length}/${validationRules.maxCueLength}) at line ${currentLine - textLines.length + 1}`
            );
          }

          // Create cue
          const cue: TranscriptCue = {
            id: generateCueId(cueIndex, startMs),
            startMs,
            endMs,
            text: cleanText,
            speaker,
          };

          // Validate cue
          const validationErrors = validateTranscriptCue(cue);
          if (validationErrors.length > 0) {
            errors.push({
              type: 'INVALID_FORMAT',
              message: `Invalid cue: ${validationErrors.join(', ')}`,
              lineNumber: currentLine - textLines.length,
              details: `Cue ID: ${cue.id}`,
            });
          } else {
            cues.push(cue);
            cueIndex++;
          }

        } catch (parseError) {
          errors.push({
            type: 'INVALID_TIMESTAMP',
            message: `Failed to parse timing: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
            lineNumber: currentLine + 1,
            details: lines[currentLine],
          });
        }
      } else {
        // Skip non-timing lines (might be cue IDs or settings)
        currentLine++;
      }
    }

    // Final validation
    if (cues.length === 0) {
      errors.push({
        type: 'NO_CUES',
        message: 'No valid cues found in file',
      });
    }

    if (cues.length < validationRules.minCues) {
      errors.push({
        type: 'NO_CUES',
        message: `File must contain at least ${validationRules.minCues} cue(s), found ${cues.length}`,
      });
    }

    if (cues.length > validationRules.maxCues) {
      errors.push({
        type: 'TOO_LARGE',
        message: `File contains too many cues (${cues.length}/${validationRules.maxCues})`,
      });
    }

    // Check for overlapping cues (warning only)
    checkOverlappingCues(cues, warnings);

    // Sort cues by start time
    cues.sort((a, b) => a.startMs - b.startMs);

    return {
      success: errors.length === 0,
      cues: errors.length === 0 ? cues : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };

  } catch (error) {
    return {
      success: false,
      errors: [{
        type: 'CORRUPTED_FILE',
        message: `Failed to parse VTT file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }],
    };
  }
}

/**
 * Clean VTT text by removing HTML tags and normalizing whitespace
 * @param text Raw VTT text
 * @returns Cleaned text
 */
function extractSpeakerFromTextLines(textLines: string[]): { speaker?: string; textLines: string[] } {
  if (textLines.length === 0) {
    return { textLines };
  }

  const remainingLines = [...textLines];
  const firstLine = remainingLines[0];

  const voiceTagMatch = firstLine.match(/^<v\s+([^>]+)>(.*)$/i);
  if (voiceTagMatch) {
    const [, speakerRaw, contentAfterTag] = voiceTagMatch;
    const trimmedContent = contentAfterTag.trim();

    if (trimmedContent.length > 0) {
      remainingLines[0] = trimmedContent;
    } else {
      remainingLines.shift();
    }

    return {
      speaker: speakerRaw.trim(),
      textLines: remainingLines,
    };
  }

  const colonMatch = firstLine.match(/^([\w .,'"\-()]+):\s*(.*)$/);
  if (colonMatch) {
    const speakerCandidate = colonMatch[1].trim();
    const remainder = colonMatch[2].trim();

    if (speakerCandidate.length > 0 && speakerCandidate.length <= 60) {
      if (remainder.length > 0) {
        remainingLines[0] = remainder;
      } else {
        remainingLines.shift();
      }

      return {
        speaker: speakerCandidate,
        textLines: remainingLines,
      };
    }
  }

  const bracketMatch = firstLine.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (bracketMatch) {
    const speakerCandidate = bracketMatch[1].trim();
    const remainder = bracketMatch[2].trim();

    if (speakerCandidate.length > 0 && speakerCandidate.length <= 60) {
      if (remainder.length > 0) {
        remainingLines[0] = remainder;
      } else {
        remainingLines.shift();
      }

      return {
        speaker: speakerCandidate,
        textLines: remainingLines,
      };
    }
  }

  return { textLines };
}

function cleanVTTText(text: string): string {
  return text
    // Remove HTML tags but preserve their content
    .replace(/<[^>]*>/g, '')
    // Remove VTT positioning and styling tags
    .replace(/\{[^}]*\}/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();
}

/**
 * Generate unique cue ID
 * @param index Cue index
 * @param startMs Start time in milliseconds
 * @returns Unique cue ID
 */
function generateCueId(index: number, startMs: number): string {
  return `cue_${index + 1}_${startMs}`;
}

/**
 * Check for overlapping cues and add warnings
 * @param cues Array of cues to check
 * @param warnings Array to add warnings to
 */
function checkOverlappingCues(cues: TranscriptCue[], warnings: string[]): void {
  for (let i = 0; i < cues.length - 1; i++) {
    const currentCue = cues[i];
    const nextCue = cues[i + 1];

    if (currentCue.endMs > nextCue.startMs) {
      warnings.push(
        `Overlapping cues detected: ${currentCue.id} (${currentCue.endMs}ms) overlaps with ${nextCue.id} (${nextCue.startMs}ms)`
      );
    }
  }
}

/**
 * Validate VTT file before parsing
 * @param file File to validate
 * @param validationRules Optional validation rules
 * @returns Validation errors, if any
 */
export function validateVTTFile(
  file: File,
  validationRules: VTTValidationRules = VTT_VALIDATION_CONFIG
): VTTParseError[] {
  const errors: VTTParseError[] = [];

  // Check file size
  if (file.size > validationRules.maxFileSize) {
    errors.push({
      type: 'TOO_LARGE',
      message: `File size exceeds maximum allowed size (${file.size}/${validationRules.maxFileSize} bytes)`,
    });
  }

  // Check file type - allow both .vtt and .txt
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.vtt') && !fileName.endsWith('.txt')) {
    errors.push({
      type: 'INVALID_FORMAT',
      message: 'File must have .vtt or .txt extension',
    });
  }

  // Check MIME type if available
  if (file.type && !['text/vtt', 'text/plain', ''].includes(file.type)) {
    errors.push({
      type: 'INVALID_FORMAT',
      message: `Invalid file type: ${file.type}. Expected text/vtt or text/plain`,
    });
  }

  return errors;
}

/**
 * Read file content as text
 * @param file File to read
 * @returns Promise that resolves to file content
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Parse VTT file with progress tracking
 * @param file File to parse
 * @param onProgress Optional progress callback
 * @param validationRules Optional validation rules
 * @returns Promise that resolves to ParseResult
 */
export async function parseVTTFileWithProgress(
  file: File,
  onProgress?: (progress: number) => void,
  validationRules: VTTValidationRules = VTT_VALIDATION_CONFIG
): Promise<ParseResult> {
  onProgress?.(0);

  // Validate file first
  const validationErrors = validateVTTFile(file, validationRules);
  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors,
    };
  }

  onProgress?.(25);

  try {
    // Read file content
    const content = await readFileAsText(file);
    onProgress?.(50);

    // Parse content
    const result = await parseVTTFile(content, validationRules);
    onProgress?.(100);

    return result;

  } catch (error) {
    return {
      success: false,
      errors: [{
        type: 'CORRUPTED_FILE',
        message: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }],
    };
  }
}

/**
 * Convert parsed cues back to VTT format
 * @param cues Array of transcript cues
 * @param includeImportance Whether to include importance as comments
 * @returns VTT formatted string
 */
export function exportToVTT(cues: TranscriptCue[], includeImportance = false): string {
  const lines = ['WEBVTT', ''];

  cues.forEach((cue, index) => {
    // Add cue number
    lines.push(`${index + 1}`);

    // Add timing line
    const startTime = formatVTTTime(cue.startMs);
    const endTime = formatVTTTime(cue.endMs);
    lines.push(`${startTime} --> ${endTime}`);

    // Add importance comment if requested
    if (includeImportance && cue.importance !== undefined) {
      lines.push(`NOTE: Importance Level ${cue.importance}`);
    }

  // Add cue text, re-attaching speaker label if available
  const cueLine = cue.speaker ? `${cue.speaker}: ${cue.text}` : cue.text;
  lines.push(cueLine);
    lines.push(''); // Empty line between cues
  });

  return lines.join('\n');
}

/**
 * Format milliseconds as VTT time string
 * @param milliseconds Time in milliseconds
 * @returns Formatted time string (HH:MM:SS.mmm)
 */
function formatVTTTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}