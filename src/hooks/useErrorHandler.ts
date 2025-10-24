import React from 'react';

/**
 * Hook for using error boundary imperatively
 * Extracted to separate file to comply with React Fast Refresh requirements
 * (Fast refresh only works when a file only exports components)
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    resetError,
    captureError,
  };
};
