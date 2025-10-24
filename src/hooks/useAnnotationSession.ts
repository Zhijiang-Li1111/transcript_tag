import { useState, useCallback, useEffect, useMemo } from 'react';
import type { AnnotationSession } from '../types/annotation';
import type { TranscriptCue } from '../types/transcript';
import { generateSessionId, SessionState } from '../types/annotation';

interface UseAnnotationSessionOptions {
  autoSave?: boolean;
  storageKey?: string;
}

export interface SessionCompletionSummary {
  totalCues: number;
  ratedCues: number;
  remainingCueCount: number;
  remainingCueIndices: number[];
  progressPercentage: number;
  importanceLevels: {
    noise: number;
    optional: number;
    important: number;
    critical: number;
  };
  isSessionComplete: boolean;
  metadataReady: boolean;
  missingMetadataFields: Array<'originalFileName'>;
}

export function summarizeSessionCompletion(
  session: AnnotationSession | null
): SessionCompletionSummary | null {
  if (!session) {
    return null;
  }

  const totalCues = session.cues.length;
  let ratedCues = 0;
  const remainingCueIndices: number[] = [];
  const importanceLevels = {
    noise: 0,
    optional: 0,
    important: 0,
    critical: 0,
  };

  session.cues.forEach((cue, index) => {
    if (cue.importance === undefined) {
      remainingCueIndices.push(index);
      return;
    }

    ratedCues += 1;
    if (cue.importance === 0) importanceLevels.noise += 1;
    if (cue.importance === 1) importanceLevels.optional += 1;
    if (cue.importance === 2) importanceLevels.important += 1;
    if (cue.importance === 3) importanceLevels.critical += 1;
  });

  const remainingCueCount = Math.max(totalCues - ratedCues, 0);
  const progressPercentage = totalCues > 0 ? Math.round((ratedCues / totalCues) * 100) : 0;
  const metadataSummary = {
    originalFileName: session.originalFileName ?? '',
  };

  const missingMetadataFields: Array<'originalFileName'> = [];
  if (!metadataSummary.originalFileName.trim()) {
    missingMetadataFields.push('originalFileName');
  }

  return {
    totalCues,
    ratedCues,
    remainingCueCount,
    remainingCueIndices,
    progressPercentage,
    importanceLevels,
    isSessionComplete: totalCues > 0 && remainingCueCount === 0,
    metadataReady: missingMetadataFields.length === 0,
    missingMetadataFields,
  };
}

export const useAnnotationSession = (options: UseAnnotationSessionOptions = {}) => {
  const { autoSave = true, storageKey = 'transcript-annotation-session' } = options;
  
  const [currentSession, setCurrentSession] = useState<AnnotationSession | null>(null);
  const [currentCueIndex, setCurrentCueIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    if (autoSave) {
      try {
        const savedSession = localStorage.getItem(storageKey);
        if (savedSession) {
          const session = JSON.parse(savedSession) as AnnotationSession;
          setCurrentSession(session);
          
          // Find the first unrated cue or stay at 0
          const firstUnrated = session.cues.findIndex(cue => cue.importance === undefined);
          setCurrentCueIndex(firstUnrated >= 0 ? firstUnrated : 0);
        }
      } catch (error) {
        console.warn('Failed to load annotation session from localStorage:', error);
      }
    }
  }, [autoSave, storageKey]);

  // Save session to localStorage when it changes
  useEffect(() => {
    if (autoSave && currentSession) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(currentSession));
      } catch (error) {
        console.warn('Failed to save annotation session to localStorage:', error);
      }
    }
  }, [currentSession, autoSave, storageKey]);

  // Create new session from parsed cues
  const createSession = useCallback((cues: TranscriptCue[], filename?: string, originalFileContent?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const session: AnnotationSession = {
        sessionId: generateSessionId(),
        meetingId: `meeting_${Date.now()}`,
        annotator: 'user',
        version: 1,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        originalFileName: filename || 'unknown.vtt',
        originalFileContent: originalFileContent ?? undefined,
        cues: [...cues], // Create a copy to avoid mutations
        annotations: [], // Start with empty annotations
        status: SessionState.INITIALIZED,
      };

      setCurrentSession(session);
      setCurrentCueIndex(0);
      setIsLoading(false);
      
      return session;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create annotation session');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Update importance level for a specific cue
  const updateCueImportance = useCallback((cueIndex: number, importance: number) => {
    if (!currentSession) {
      setError(new Error('No active annotation session'));
      return;
    }

    if (cueIndex < 0 || cueIndex >= currentSession.cues.length) {
      setError(new Error('Invalid cue index'));
      return;
    }

    setCurrentSession(prevSession => {
      if (!prevSession) return null;

      const updatedCues = [...prevSession.cues];
      updatedCues[cueIndex] = {
        ...updatedCues[cueIndex],
        importance,
      };

      const summary = summarizeSessionCompletion({
        ...prevSession,
        cues: updatedCues,
      });

      const updatedSession: AnnotationSession = {
        ...prevSession,
        cues: updatedCues,
        lastModified: new Date().toISOString(),
        annotations: prevSession.annotations, // Keep existing annotations
        status: summary?.isSessionComplete ? SessionState.COMPLETE : SessionState.IN_PROGRESS,
        exportedAt: undefined,
      };

      return updatedSession;
    });

    setError(null);
  }, [currentSession]);

  // Clear importance rating for a specific cue
  const clearCueImportance = useCallback((cueIndex: number) => {
    if (!currentSession) {
      setError(new Error('No active annotation session'));
      return;
    }

    if (cueIndex < 0 || cueIndex >= currentSession.cues.length) {
      setError(new Error('Invalid cue index'));
      return;
    }

    setCurrentSession(prevSession => {
      if (!prevSession) return null;

      const updatedCues = [...prevSession.cues];
      const updatedCue = { ...updatedCues[cueIndex] };
      delete updatedCue.importance;
      updatedCues[cueIndex] = updatedCue;

      const summary = summarizeSessionCompletion({
        ...prevSession,
        cues: updatedCues,
      });

      const updatedSession: AnnotationSession = {
        ...prevSession,
        cues: updatedCues,
        lastModified: new Date().toISOString(),
        annotations: prevSession.annotations,
        status: summary?.isSessionComplete ? SessionState.COMPLETE : SessionState.IN_PROGRESS,
        exportedAt: undefined,
      };

      return updatedSession;
    });

    setError(null);
  }, [currentSession]);

  // Navigate to specific cue
  const goToCue = useCallback((index: number) => {
    if (!currentSession) {
      setError(new Error('No active annotation session'));
      return;
    }

    if (index < 0 || index >= currentSession.cues.length) {
      setError(new Error('Invalid cue index'));
      return;
    }

    setCurrentCueIndex(index);
    setError(null);
  }, [currentSession]);

  // Navigate to next cue
  const nextCue = useCallback(() => {
    if (!currentSession) return;
    
    setCurrentCueIndex((prevIndex) => {
      return Math.min(prevIndex + 1, currentSession.cues.length - 1);
    });
  }, [currentSession]);

  // Navigate to previous cue
  const previousCue = useCallback(() => {
    setCurrentCueIndex((prevIndex) => {
      return Math.max(prevIndex - 1, 0);
    });
  }, []);

  // Find next unrated cue
  const nextUnratedCue = useCallback(() => {
    if (!currentSession) return;

    setCurrentCueIndex((prevIndex) => {
      const nextUnrated = currentSession.cues.findIndex(
        (cue, index) => index > prevIndex && cue.importance === undefined
      );

      if (nextUnrated >= 0) {
        return nextUnrated;
      }
      return prevIndex;
    });
  }, [currentSession]);

  // Find previous unrated cue
  const previousUnratedCue = useCallback(() => {
    if (!currentSession) return;

    // Search backwards from current index
    for (let i = currentCueIndex - 1; i >= 0; i--) {
      if (currentSession.cues[i].importance === undefined) {
        setCurrentCueIndex(i);
        return;
      }
    }
  }, [currentSession, currentCueIndex]);

  // Clear entire session
  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setCurrentCueIndex(0);
    setError(null);
    if (autoSave) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('Failed to clear annotation session from localStorage:', error);
      }
    }
  }, [autoSave, storageKey]);

    const markExported = useCallback(() => {
      setCurrentSession(prevSession => {
        if (!prevSession) return null;

        return {
          ...prevSession,
          status: SessionState.EXPORTED,
          exportedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
    }, []);

  // Get current cue
  const currentCue = currentSession?.cues[currentCueIndex] || null;

  // Get statistics
  const cueMetrics = useMemo(() => summarizeSessionCompletion(currentSession), [currentSession]);

  const statistics = cueMetrics
    ? {
        totalCues: cueMetrics.totalCues,
        ratedCues: cueMetrics.ratedCues,
        unratedCues: cueMetrics.remainingCueCount,
        progressPercentage: cueMetrics.progressPercentage,
        importanceLevels: cueMetrics.importanceLevels,
      }
    : null;

  return {
    // State
    currentSession,
    currentCueIndex,
    currentCue,
    isLoading,
    error,
    statistics,
    
    // Actions
    createSession,
    updateCueImportance,
    clearCueImportance,
    goToCue,
    nextCue,
    previousCue,
    nextUnratedCue,
    previousUnratedCue,
    clearSession,
    markExported,
    
    // Computed
    hasNext: currentSession ? currentCueIndex < currentSession.cues.length - 1 : false,
    hasPrevious: currentCueIndex > 0,
    hasNextUnrated: currentSession ? currentSession.cues.some(
      (cue, index) => index > currentCueIndex && cue.importance === undefined
    ) : false,
    hasPreviousUnrated: currentSession ? currentSession.cues.some(
      (cue, index) => index < currentCueIndex && cue.importance === undefined
    ) : false,
    isSessionComplete: cueMetrics?.isSessionComplete ?? false,
    remainingCueCount: cueMetrics?.remainingCueCount ?? 0,
    remainingCueIndices: cueMetrics?.remainingCueIndices ?? [],
    metadataReady: cueMetrics?.metadataReady ?? false,
    missingMetadataFields: cueMetrics?.missingMetadataFields ?? [],
  };
};

// Hook for batch operations
export const useAnnotationBatch = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const batchUpdateImportance = useCallback(async (
    session: AnnotationSession,
    updates: Array<{ index: number; importance: number }>
  ): Promise<AnnotationSession> => {
    setIsProcessing(true);
    
    try {
      const updatedCues = [...session.cues];
      
      updates.forEach(({ index, importance }) => {
        if (index >= 0 && index < updatedCues.length) {
          updatedCues[index] = {
            ...updatedCues[index],
            importance,
          };
        }
      });

      const updatedSession: AnnotationSession = {
        ...session,
        cues: updatedCues,
        lastModified: new Date().toISOString(),
      };

      setIsProcessing(false);
      return updatedSession;
    } catch (error) {
      setIsProcessing(false);
      throw error;
    }
  }, []);

  return {
    isProcessing,
    batchUpdateImportance,
  };
};