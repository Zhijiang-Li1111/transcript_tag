import React, { forwardRef } from 'react';

// Input variant types
type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'error' | 'success';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  required?: boolean;
}

// Get size-specific styles
function getSizeStyles(size: InputSize): string {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm';
    case 'md':
      return 'px-3 py-2 text-sm';
    case 'lg':
      return 'px-4 py-3 text-base';
    default:
      return 'px-3 py-2 text-sm';
  }
}

// Get variant-specific styles
function getVariantStyles(variant: InputVariant): string {
  switch (variant) {
    case 'error':
      return 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500';
    case 'success':
      return 'border-green-300 text-green-900 placeholder-green-300 focus:outline-none focus:ring-green-500 focus:border-green-500';
    case 'default':
    default:
      return 'border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500';
  }
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      fullWidth = false,
      required = false,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Auto-generate ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine variant based on error/success props
    const computedVariant = error ? 'error' : success ? 'success' : variant;
    
    const baseStyles = 'block w-full rounded-md shadow-sm transition-colors';
    const sizeStyles = getSizeStyles(size);
    const variantStyles = getVariantStyles(computedVariant);
    const widthStyles = fullWidth ? 'w-full' : '';
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">{leftIcon}</span>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              ${baseStyles}
              ${sizeStyles}
              ${variantStyles}
              ${widthStyles}
              ${disabledStyles}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">{rightIcon}</span>
            </div>
          )}
        </div>

        {/* Help Text */}
        {(error || success || hint) && (
          <p
            className={`mt-1 text-sm ${
              error
                ? 'text-red-600'
                : success
                ? 'text-green-600'
                : 'text-gray-500'
            }`}
          >
            {error || success || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: InputSize;
  variant?: InputVariant;
  fullWidth?: boolean;
  required?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      success,
      hint,
      size = 'md',
      variant = 'default',
      fullWidth = false,
      required = false,
      disabled,
      resize = 'vertical',
      className = '',
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    const baseStyles = 'block w-full rounded-md shadow-sm transition-colors';
    const sizeStyles = getSizeStyles(size);
    const variantStyles = getVariantStyles(computedVariant);
    const resizeStyles = `resize-${resize}`;
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          className={`
            ${baseStyles}
            ${sizeStyles}
            ${variantStyles}
            ${resizeStyles}
            ${disabledStyles}
            ${className}
          `}
          {...props}
        />

        {(error || success || hint) && (
          <p
            className={`mt-1 text-sm ${
              error
                ? 'text-red-600'
                : success
                ? 'text-green-600'
                : 'text-gray-500'
            }`}
          >
            {error || success || hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select component
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: InputSize;
  variant?: InputVariant;
  fullWidth?: boolean;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      success,
      hint,
      size = 'md',
      variant = 'default',
      fullWidth = false,
      required = false,
      disabled,
      options,
      placeholder,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    const baseStyles = 'block w-full rounded-md shadow-sm transition-colors appearance-none';
    const sizeStyles = getSizeStyles(size);
    const variantStyles = getVariantStyles(computedVariant);
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              ${baseStyles}
              ${sizeStyles}
              ${variantStyles}
              ${disabledStyles}
              pr-10
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {(error || success || hint) && (
          <p
            className={`mt-1 text-sm ${
              error
                ? 'text-red-600'
                : success
                ? 'text-green-600'
                : 'text-gray-500'
            }`}
          >
            {error || success || hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// File Input component
interface FileInputProps extends Omit<InputProps, 'type'> {
  accept?: string;
  multiple?: boolean;
  onFileSelect?: (files: FileList | null) => void;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ onFileSelect, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onFileSelect?.(event.target.files);
      onChange?.(event);
    };

    return (
      <Input
        ref={ref}
        type="file"
        onChange={handleChange}
        {...props}
      />
    );
  }
);

FileInput.displayName = 'FileInput';