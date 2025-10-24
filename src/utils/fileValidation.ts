import type { VTTParseError, VTTValidationRules } from '../types/transcript';
import { VTT_VALIDATION_CONFIG } from '../types/transcript';

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  errors: VTTParseError[];
  warnings: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    lastModified: Date;
  };
}

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  VTT: {
    extensions: ['.vtt', '.txt'],
    mimeTypes: ['text/vtt', 'text/plain'],
    description: 'WebVTT subtitle files or text files with VTT content',
  },
} as const;

/**
 * Comprehensive file validation for VTT files
 * @param file File to validate
 * @param validationRules Optional validation rules
 * @returns Detailed validation result
 */
export function validateFile(
  file: File,
  validationRules: VTTValidationRules = VTT_VALIDATION_CONFIG
): FileValidationResult {
  const errors: VTTParseError[] = [];
  const warnings: string[] = [];

  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified),
  };

  // Basic file existence check
  if (!file) {
    errors.push({
      type: 'CORRUPTED_FILE',
      message: 'No file provided',
    });
    return { isValid: false, errors, warnings, fileInfo };
  }

  // File name validation
  if (!file.name || file.name.trim().length === 0) {
    errors.push({
      type: 'INVALID_FORMAT',
      message: 'File name is required',
    });
  }

  // File extension validation
  const fileExtension = getFileExtension(file.name);
  if (!SUPPORTED_FILE_TYPES.VTT.extensions.includes(fileExtension as '.vtt' | '.txt')) {
    errors.push({
      type: 'INVALID_FORMAT',
      message: `Unsupported file extension: ${fileExtension}. Expected: ${SUPPORTED_FILE_TYPES.VTT.extensions.join(', ')}`,
    });
  }

  // MIME type validation (if available)
  if (file.type) {
    const isSupportedMimeType = SUPPORTED_FILE_TYPES.VTT.mimeTypes.includes(file.type as 'text/vtt' | 'text/plain');
    if (!isSupportedMimeType) {
      warnings.push(
        `Unexpected MIME type: ${file.type}. Expected: ${SUPPORTED_FILE_TYPES.VTT.mimeTypes.join(', ')}`
      );
    }
  }

  // File size validation
  if (file.size === 0) {
    errors.push({
      type: 'CORRUPTED_FILE',
      message: 'File is empty',
    });
  } else if (file.size > validationRules.maxFileSize) {
    errors.push({
      type: 'TOO_LARGE',
      message: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(validationRules.maxFileSize)})`,
    });
  }

  // File age warning
  const fileAge = Date.now() - file.lastModified;
  const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
  if (fileAge > oneYearInMs) {
    warnings.push('File is more than a year old. Please verify it contains the expected content.');
  }

  // File name pattern warnings
  if (file.name.includes(' ')) {
    warnings.push('File name contains spaces. Consider using underscores or hyphens instead.');
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    warnings.push('File name contains special characters that may cause issues.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo,
  };
}

/**
 * Validate multiple files at once
 * @param files Array of files to validate
 * @param validationRules Optional validation rules
 * @returns Array of validation results
 */
export function validateMultipleFiles(
  files: File[],
  validationRules: VTTValidationRules = VTT_VALIDATION_CONFIG
): FileValidationResult[] {
  if (files.length === 0) {
    return [{
      isValid: false,
      errors: [{
        type: 'CORRUPTED_FILE',
        message: 'No files provided',
      }],
      warnings: [],
      fileInfo: {
        name: '',
        size: 0,
        type: '',
        lastModified: new Date(),
      },
    }];
  }

  const results = files.map(file => validateFile(file, validationRules));
  
  // Add warnings for duplicate file names
  const fileNames = files.map(f => f.name);
  const duplicateNames = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
  
  if (duplicateNames.length > 0) {
    results.forEach(result => {
      if (duplicateNames.includes(result.fileInfo.name)) {
        result.warnings.push('Duplicate file name detected');
      }
    });
  }

  return results;
}

/**
 * Get file extension including the dot
 * @param fileName File name to extract extension from
 * @returns File extension (e.g., '.vtt')
 */
export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex >= 0 ? fileName.substring(lastDotIndex).toLowerCase() : '';
}

/**
 * Format file size in human-readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file is likely a VTT file based on content preview
 * @param file File to check
 * @returns Promise that resolves to boolean
 */
export async function isVTTFile(file: File): Promise<boolean> {
  try {
    // Read first 100 characters to check for VTT header
    const blob = file.slice(0, 100);
    const text = await blob.text();
    
    return text.trim().startsWith('WEBVTT');
  } catch {
    return false;
  }
}

/**
 * Validate file content without full parsing
 * @param file File to validate
 * @returns Promise that resolves to validation result
 */
export async function validateFileContent(file: File): Promise<{
  hasValidHeader: boolean;
  estimatedCueCount: number;
  errors: VTTParseError[];
}> {
  const errors: VTTParseError[] = [];

  try {
    // Read first 1KB for header validation
    const headerBlob = file.slice(0, 1024);
    const headerText = await headerBlob.text();

    const hasValidHeader = headerText.trim().startsWith('WEBVTT');
    if (!hasValidHeader) {
      errors.push({
        type: 'INVALID_FORMAT',
        message: 'File does not start with required WEBVTT header',
        lineNumber: 1,
      });
    }

    // Read full file to estimate cue count
    const fullText = await file.text();
    const estimatedCueCount = (fullText.match(/-->/g) || []).length;

    if (estimatedCueCount === 0) {
      errors.push({
        type: 'NO_CUES',
        message: 'No cues found in file (no --> timing markers detected)',
      });
    }

    return {
      hasValidHeader,
      estimatedCueCount,
      errors,
    };

  } catch (error) {
    return {
      hasValidHeader: false,
      estimatedCueCount: 0,
      errors: [{
        type: 'CORRUPTED_FILE',
        message: `Failed to read file content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }],
    };
  }
}

/**
 * Create a file validation summary for display
 * @param results Array of validation results
 * @returns Summary object
 */
export function createValidationSummary(results: FileValidationResult[]): {
  totalFiles: number;
  validFiles: number;
  totalErrors: number;
  totalWarnings: number;
  totalSize: number;
  hasBlockingErrors: boolean;
} {
  const totalFiles = results.length;
  const validFiles = results.filter(r => r.isValid).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const totalSize = results.reduce((sum, r) => sum + r.fileInfo.size, 0);
  const hasBlockingErrors = results.some(r => 
    r.errors.some(e => e.type === 'TOO_LARGE' || e.type === 'CORRUPTED_FILE')
  );

  return {
    totalFiles,
    validFiles,
    totalErrors,
    totalWarnings,
    totalSize,
    hasBlockingErrors,
  };
}

/**
 * Filter files by validation result
 * @param files Array of files
 * @param results Array of validation results
 * @param filterType Type of filter to apply
 * @returns Filtered array of files
 */
export function filterFilesByValidation(
  files: File[],
  results: FileValidationResult[],
  filterType: 'valid' | 'invalid' | 'warnings'
): File[] {
  return files.filter((_, index) => {
    const result = results[index];
    if (!result) return false;

    switch (filterType) {
      case 'valid':
        return result.isValid;
      case 'invalid':
        return !result.isValid;
      case 'warnings':
        return result.warnings.length > 0;
      default:
        return true;
    }
  });
}

/**
 * Check if browser supports File API
 * @returns Boolean indicating File API support
 */
export function isFileAPISupported(): boolean {
  return (
    typeof FileReader !== 'undefined' &&
    typeof File !== 'undefined' &&
    typeof FileList !== 'undefined'
  );
}

/**
 * Get recommended file size limits based on browser capabilities
 * @returns Object with recommended limits
 */
export function getRecommendedFileLimits(): {
  maxFileSize: number;
  maxConcurrentFiles: number;
  warningSize: number;
} {
  // Detect available memory (rough estimate)
  const nav = navigator as any;
  const deviceMemory = nav.deviceMemory || 4; // Default to 4GB if not available
  
  return {
    maxFileSize: Math.min(deviceMemory * 1024 * 1024 * 10, VTT_VALIDATION_CONFIG.maxFileSize), // 10MB per GB of RAM
    maxConcurrentFiles: Math.max(1, Math.floor(deviceMemory / 2)), // 1 file per 2GB of RAM
    warningSize: 5 * 1024 * 1024, // 5MB warning threshold
  };
}