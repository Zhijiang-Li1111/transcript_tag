import React, { forwardRef } from 'react';

// Button variant types
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

// Get variant-specific styles
function getVariantStyles(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent';
    case 'secondary':
      return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 border-transparent';
    case 'outline':
      return 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 border-blue-600 hover:border-blue-700';
    case 'ghost':
      return 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500 border-transparent hover:text-gray-900';
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent';
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent';
  }
}

// Get size-specific styles
function getSizeStyles(size: ButtonSize): string {
  switch (size) {
    case 'xs':
      return 'px-3 py-1.5 text-xs';
    case 'sm':
      return 'px-4 py-2.5 text-sm';
    case 'md':
      return 'px-5 py-2.5 text-sm';
    case 'lg':
      return 'px-6 py-3 text-base';
    case 'xl':
      return 'px-7 py-3.5 text-base';
    default:
      return 'px-5 py-2.5 text-sm';
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md border focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variantStyles = getVariantStyles(variant);
    const sizeStyles = getSizeStyles(size);
    const widthStyles = fullWidth ? 'w-full' : '';

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {loading ? (
          <LoadingSpinner size={size} />
        ) : leftIcon ? (
          <span className="mr-2 -ml-1">{leftIcon}</span>
        ) : null}
        
        {/* Button content */}
        {children}
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span className="ml-2 -mr-1">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Loading spinner component
interface LoadingSpinnerProps {
  size?: ButtonSize;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
      case 'xl':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  return (
    <svg
      className={`animate-spin -ml-1 mr-2 ${getSpinnerSize()} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Icon button for compact actions
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className = '', ...props }, ref) => {
    const getIconButtonSize = () => {
      switch (size) {
        case 'xs':
          return 'p-1';
        case 'sm':
          return 'p-1.5';
        case 'md':
          return 'p-2';
        case 'lg':
          return 'p-2.5';
        case 'xl':
          return 'p-3';
        default:
          return 'p-2';
      }
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={`${getIconButtonSize()} ${className}`}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Button group for related actions
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  orientation = 'horizontal',
}) => {
  const orientationStyles = orientation === 'vertical' 
    ? 'flex-col space-y-0 [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:border-t-0'
    : 'flex-row space-x-0 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:border-l-0';

  return (
    <div className={`inline-flex ${orientationStyles} ${className}`} role="group">
      {children}
    </div>
  );
};

// Toggle button for on/off states
interface ToggleButtonProps extends Omit<ButtonProps, 'variant'> {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ pressed, onPressedChange, children, className = '', ...props }, ref) => {
    const variant = pressed ? 'primary' : 'outline';

    return (
      <Button
        ref={ref}
        variant={variant}
        className={className}
        onClick={() => onPressedChange(!pressed)}
        aria-pressed={pressed}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ToggleButton.displayName = 'ToggleButton';