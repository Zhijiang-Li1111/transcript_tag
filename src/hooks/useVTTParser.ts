import { useState, useCallback, useRef } from 'react';
import type { TranscriptCue, VTTParseError, ParseResult } from '../types/transcript';
import { parseVTTFileWithProgress } from '../utils/vttParser';

// Hook state interface
interface VTTParserState {
  isLoading: boolean;
  progress: number;
  error: VTTParseError | null;
  cues: TranscriptCue[];
  parseResult: ParseResult | null;
  fileName: string | null;
  rawContent: string | null;
}

// Hook return interface
interface UseVTTParserReturn {
  // State
  isLoading: boolean;
  progress: number;
  error: VTTParseError | null;
  cues: TranscriptCue[];
  parseResult: ParseResult | null;
  fileName: string | null;
  rawContent: string | null;
  
  // Actions
  parseFile: (file: File) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for parsing VTT files with progress tracking and error handling
 */
export function useVTTParser(): UseVTTParserReturn {
  const [state, setState] = useState<VTTParserState>({
    isLoading: false,
    progress: 0,
    error: null,
    cues: [],
    parseResult: null,
    fileName: null,
    rawContent: null,
  });

  // Track the current parsing operation to prevent race conditions
  const currentParseRef = useRef<number>(0);

  const parseFile = useCallback(async (file: File): Promise<void> => {
    // Increment operation counter to handle race conditions
    const currentOperation = ++currentParseRef.current;

    // Reset state for new parsing operation
    setState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      error: null,
      cues: [],
      parseResult: null,
      fileName: file.name,
      rawContent: null,
    }));

    try {
      const originalContentPromise: Promise<string | null> = file
        .text()
        .then(content => content)
        .catch(() => null);

      // Progress callback
      const onProgress = (progress: number) => {
        // Only update if this is still the current operation
        if (currentParseRef.current === currentOperation) {
          setState(prev => ({
            ...prev,
            progress: Math.round(progress),
          }));
        }
      };

      // Parse the VTT file with progress tracking
      const result = await parseVTTFileWithProgress(file, onProgress);

      // Only update state if this is still the current operation
      if (currentParseRef.current === currentOperation) {
        if (result.success && result.cues) {
          const rawContent = await originalContentPromise;
          if (currentParseRef.current !== currentOperation) {
            return;
          }
          // Successful parsing
          setState(prev => ({
            ...prev,
            isLoading: false,
            progress: 100,
            cues: result.cues!,
            parseResult: result,
            fileName: file.name,
            rawContent,
            error: null,
          }));
        } else {
          // Parsing failed
          const primaryError = result.errors?.[0] || {
            type: 'CORRUPTED_FILE' as const,
            message: 'Unknown parsing error occurred',
          };

          setState(prev => ({
            ...prev,
            isLoading: false,
            progress: 0,
            error: primaryError,
            cues: [],
            parseResult: result,
            fileName: file.name,
            rawContent: null,
          }));
        }
      }
    } catch (error) {
      // Only update state if this is still the current operation
      if (currentParseRef.current === currentOperation) {
        const parseError: VTTParseError = {
          type: 'CORRUPTED_FILE',
          message: `Failed to parse VTT file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };

        setState(prev => ({
          ...prev,
          isLoading: false,
          progress: 0,
          error: parseError,
          cues: [],
          parseResult: {
            success: false,
            errors: [parseError],
          },
          fileName: file.name,
          rawContent: null,
        }));
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    // Increment operation counter to cancel any ongoing parsing
    currentParseRef.current++;
    
    setState({
      isLoading: false,
      progress: 0,
      error: null,
      cues: [],
      parseResult: null,
      fileName: null,
      rawContent: null,
    });
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    progress: state.progress,
    error: state.error,
    cues: state.cues,
    parseResult: state.parseResult,
  fileName: state.fileName,
  rawContent: state.rawContent,
    
    // Actions
    parseFile,
    clearError,
    reset,
  };
}

// Helper hook for batch processing multiple files
export function useVTTBatchParser() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [results, setResults] = useState<(ParseResult | null)[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const parser = useVTTParser();

  const processFiles = useCallback(async (filesToProcess: File[]) => {
    setFiles(filesToProcess);
    setResults(new Array(filesToProcess.length).fill(null));
    setCurrentFileIndex(0);
    setIsProcessing(true);
    setOverallProgress(0);

    for (let i = 0; i < filesToProcess.length; i++) {
      setCurrentFileIndex(i);
      
      try {
        await parser.parseFile(filesToProcess[i]);
        
        // Update results array
        setResults(prev => {
          const newResults = [...prev];
          newResults[i] = parser.parseResult;
          return newResults;
        });
      } catch (error) {
        // Handle individual file error
        const errorResult: ParseResult = {
          success: false,
          errors: [{
            type: 'CORRUPTED_FILE',
            message: `Failed to process file ${filesToProcess[i].name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };

        setResults(prev => {
          const newResults = [...prev];
          newResults[i] = errorResult;
          return newResults;
        });
      }

      // Update overall progress
      setOverallProgress(Math.round(((i + 1) / filesToProcess.length) * 100));
    }

    setIsProcessing(false);
  }, [parser]);

  const reset = useCallback(() => {
    setFiles([]);
    setCurrentFileIndex(0);
    setResults([]);
    setIsProcessing(false);
    setOverallProgress(0);
    parser.reset();
  }, [parser]);

  return {
    // State
    files,
    currentFileIndex,
    results,
    isProcessing,
    overallProgress,
    currentFileProgress: parser.progress,
    
    // Actions
    processFiles,
    reset,
    
    // Current file parser state
    currentParser: parser,
  };
}

// Utility hook for VTT file validation before parsing
export function useVTTFileValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<VTTParseError[]>([]);

  const validateFile = useCallback(async (file: File): Promise<boolean> => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      // Import validation function dynamically to avoid circular dependencies
      const { validateVTTFile } = await import('../utils/vttParser');
      
      // Basic validation
      const errors = validateVTTFile(file);
      
      // Content-based validation - check if file starts with WEBVTT
      try {
        const headerBlob = file.slice(0, 100);
        const content = await headerBlob.text();
        if (!content.trim().startsWith('WEBVTT')) {
          errors.push({
            type: 'INVALID_FORMAT',
            message: 'File does not start with required WEBVTT header',
          });
        }
      } catch (contentError) {
        errors.push({
          type: 'CORRUPTED_FILE',
          message: 'Unable to read file content for validation',
        });
      }

      setValidationErrors(errors);
      return errors.length === 0;
    } catch (error) {
      const validationError: VTTParseError = {
        type: 'CORRUPTED_FILE',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
      setValidationErrors([validationError]);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationErrors([]);
  }, []);

  return {
    isValidating,
    validationErrors,
    validateFile,
    clearValidation,
    hasErrors: validationErrors.length > 0,
  };
}