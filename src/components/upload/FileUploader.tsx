import React, { useCallback, useState, useRef } from 'react';
import { Button } from '../ui/Button';
import type { FileValidationResult } from '../../utils/fileValidation';
import { validateFile } from '../../utils/fileValidation';
import styles from '../../styles/components/FileUploader.module.css';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onValidationComplete: (result: FileValidationResult) => void;
  acceptedFormats?: string[];
  disabled?: boolean;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onValidationComplete,
  acceptedFormats = ['.vtt'],
  disabled = false,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = useCallback(async (file: File) => {
    if (!file) return;

    setSelectedFile(file);
    setIsValidating(true);

    try {
      // Validate the file
      const result = validateFile(file);
      setValidationResult(result);
      onValidationComplete(result);

      if (result.isValid) {
        onFileSelect(file);
      }
    } catch (error) {
      const errorResult: FileValidationResult = {
        isValid: false,
        errors: [{
          type: 'CORRUPTED_FILE',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
        warnings: [],
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: new Date(file.lastModified),
        },
      };
      setValidationResult(errorResult);
      onValidationComplete(errorResult);
    } finally {
      setIsValidating(false);
    }
  }, [onFileSelect, onValidationComplete]);

  // Handle file input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  }, [handleFileChange]);

  // Handle drag events
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  }, [handleFileChange]);

  // Handle browse button click
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle remove file
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Determine drop zone class based on state
  const getDropZoneClass = () => {
    let className = styles.dropZone;
    if (dragActive) className += ` ${styles.dragActive}`;
    if (validationResult && !validationResult.isValid) className += ` ${styles.error}`;
    if (validationResult && validationResult.isValid) className += ` ${styles.success}`;
    return className;
  };

  return (
    <div className={`${styles.fileUploader} ${className}`}>
      {!selectedFile ? (
        // File Selection Area
        <div
          className={getDropZoneClass()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload VTT file"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
        >
          {/* Upload Icon */}
          <div className={styles.dropIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className={styles.dropText}>
            {dragActive ? 'Drop file here' : 'Upload VTT file'}
          </div>
          
          <p className={styles.dropSubtext}>
            Drag & drop a VTT file, or click to browse
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className={styles.browseButton}
            onClick={(e) => {
              e.stopPropagation();
              handleBrowseClick();
            }}
          >
            Browse Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleInputChange}
            className={styles.fileInput}
            disabled={disabled}
            aria-hidden="true"
          />
        </div>
      ) : (
        // File Info Area
        <div className={styles.fileInfo}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className={styles.fileName}>
                {selectedFile.name}
              </div>
              <div className={styles.fileSize}>
                {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className={styles.removeButton}
              disabled={disabled}
              aria-label="Remove file"
            >
              ✕
            </Button>
          </div>

          {/* Validation Status */}
          {isValidating && (
            <div className="flex items-center mt-3 text-sm text-gray-600">
              <div className={styles.loadingSpinner} />
              <span className="ml-2">Validating file...</span>
            </div>
          )}

          {validationResult && !isValidating && (
            <div className="mt-3">
              {/* Validation Errors */}
              {validationResult.errors.map((error, index) => (
                <div key={index} className={styles.errorMessage}>
                  <div className="flex items-center">
                    <ErrorIcon className={styles.validationIcon} />
                    {error.message}
                  </div>
                  {error.details && (
                    <div className="text-xs text-gray-500 mt-1 ml-4">
                      {error.details}
                    </div>
                  )}
                </div>
              ))}

              {/* Validation Warnings */}
              {validationResult.warnings.map((warning, index) => (
                <div key={index} className="mt-2 text-sm text-yellow-600">
                  <div className="flex items-center">
                    <WarningIcon className={styles.validationIcon} />
                    {warning}
                  </div>
                </div>
              ))}

              {/* Success Message */}
              {validationResult.isValid && (
                <div className={styles.successMessage}>
                  <div className="flex items-center">
                    <SuccessIcon className={styles.validationIcon} />
                    File is valid and ready for processing
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Icon components
const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  </svg>
);

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const SuccessIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);