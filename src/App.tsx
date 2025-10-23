import { useState, useCallback } from 'react';
import { MainLayout, Header } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { FileUploader } from './components/upload/FileUploader';
import { CueList } from './components/transcript/CueList';
import { CueImportanceTagger } from './components/transcript/CueImportanceTagger';
import { ImportanceLegend } from './components/transcript/ImportanceLegend';
import { ExportControls } from './components/transcript/ExportControls';
import { Button } from './components/ui/Button';
import { useVTTParser } from './hooks/useVTTParser';
import { useAnnotationSession } from './hooks/useAnnotationSession';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { formatTimeMs } from './types/transcript';
import type { FileValidationResult } from './utils/fileValidation';

function App() {
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
  
  // VTT Parser hook
  const { isLoading, error, cues, parseFile, clearError, fileName, rawContent } = useVTTParser();
  
  // Annotation Session hook
  const {
    currentSession,
    currentCueIndex,
    currentCue,
    statistics,
    createSession,
    updateCueImportance,
    clearCueImportance,
    clearSession,
    goToCue,
    nextCue,
    previousCue,
    nextUnratedCue,
    markExported,
    isSessionComplete,
    remainingCueCount,
    metadataReady,
    missingMetadataFields,
  } = useAnnotationSession();

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onRateImportance: (level) => {
      if (currentSession) {
        updateCueImportance(currentCueIndex, level);
      }
    },
    onNextCue: nextCue,
    onPreviousCue: previousCue,
    onNextUnrated: nextUnratedCue,
    enabled: !!currentSession, // Only enable when annotation session is active
  });

  const handleBackToUpload = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // Handle file selection from FileUploader
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      clearError();
      await parseFile(file);
    } catch (error) {
      console.error('Failed to parse file:', error);
    }
  }, [parseFile, clearError]);



  // Handle file validation completion
  const handleValidationComplete = useCallback((result: FileValidationResult) => {
    setValidationResult(result);
  }, []);

  return (
    <ErrorBoundary>
      {currentSession && (
        <div
          className="hidden lg:flex flex-col space-y-4 fixed top-28 z-40 w-80 pointer-events-auto"
          style={{
            left: 'clamp(16px, calc((100vw - min(100vw, 72rem)) / 2 + ((min(100vw, 72rem) - 3rem) * 2 / 3) + 1.5rem), calc(100vw - 16px - 20rem))',
          }}
        >
          <ImportanceLegend position="right" className="w-full" />
          {currentCue && (
            <CueImportanceTagger
              cue={currentCue}
              onImportanceChange={(importance) => updateCueImportance(currentCueIndex, importance)}
              onClear={() => clearCueImportance(currentCueIndex)}
            />
          )}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="pt-3 border-t border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Keyboard Shortcuts</h5>
              <div className="space-y-1 text-xs text-gray-600">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-mono bg-gray-100 px-1 rounded">{shortcut.key}</span>
                    <span>{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {statistics && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-3">Progress</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{statistics.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${statistics.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total Cues:</span>
                    <span>{statistics.totalCues}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rated:</span>
                    <span>{statistics.ratedCues}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span>{statistics.unratedCues}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <ExportControls
            session={currentSession}
            remainingCueCount={remainingCueCount}
            isSessionComplete={isSessionComplete}
            metadataReady={metadataReady}
            missingMetadataFields={missingMetadataFields}
            markExported={markExported}
          />
        </div>
      )}
      <MainLayout
        header={
          <Header
            title="Transcript Importance Tagger"
            subtitle="Upload VTT files and assign importance levels to transcript cues"
          />
        }
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {!currentSession ? (
            // File Upload Phase
            <div className="text-center py-12 space-y-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Get Started
                </h2>
                <p className="text-gray-600 mb-8">
                  Upload a VTT (WebVTT) subtitle file to begin annotating transcript importance levels.
                </p>
                
                <FileUploader
                  onFileSelect={handleFileSelect}
                  onValidationComplete={handleValidationComplete}
                  disabled={isLoading}
                />
                
                {/* Show parsing progress */}
                {isLoading && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Processing VTT file...
                  </div>
                )}
                
                {/* Show parsing error */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800">Parse Error</h4>
                    <p className="text-sm text-red-600 mt-1">{error.message}</p>
                    {error.details && (
                      <p className="text-xs text-red-500 mt-1">{error.details}</p>
                    )}
                  </div>
                )}
                
                {/* Show validation warnings */}
                {validationResult && validationResult.warnings.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800">Warnings</h4>
                    <ul className="text-sm text-yellow-600 mt-1 space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Show success message and cue count */}
                {cues.length > 0 && !currentSession && (
                  <div className="mt-6 space-y-6">
                    <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-6 lg:p-8 text-left">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide">
                            Ready to annotate
                          </div>
                          <h4 className="text-2xl font-semibold text-gray-900">
                            Processed {cues.length} cue{cues.length !== 1 ? 's' : ''}. Let’s tag their importance.
                          </h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                              Use quick buttons or keyboard shortcuts (0–3) to rate cues.
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                              Progress saves automatically—you can pause anytime.
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                              Export annotated transcripts when you're finished.
                            </li>
                          </ul>
                        </div>

                        <div className="flex-shrink-0">
                          <Button
                            size="lg"
                            className="px-6 py-3 text-base shadow-md hover:shadow-lg"
                            onClick={() => createSession(cues, fileName || 'uploaded.vtt', rawContent || undefined)}
                            rightIcon={(
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            )}
                          >
                            Start Annotating Now
                          </Button>
                          <p className="mt-3 text-xs text-gray-500 text-center lg:text-left">
                            Estimated time: 5–10 minutes depending on cue count.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview of parsed cues */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Transcript Preview
                      </h3>
                      <CueList
                        cues={cues}
                        currentIndex={0}
                        showTiming={true}
                        showImportance={false}
                        maxHeight="300px"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Annotation Phase
            <div className="h-full flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Main Content Area */}
                <div className="lg:col-span-2 flex flex-col space-y-4 min-h-0">
                  {/* Current Cue Display */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBackToUpload}
                          className="px-2"
                          leftIcon={(
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          )}
                        >
                          Back to upload
                        </Button>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Cue {currentCueIndex + 1} of {currentSession.cues.length}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-500">
                        {statistics && `${statistics.progressPercentage}% complete`}
                        {isSessionComplete ? (
                          <span className="ml-2 text-green-600">Ready to export</span>
                        ) : remainingCueCount > 0 ? (
                          <span className="ml-2 text-amber-600">
                            {remainingCueCount} {remainingCueCount === 1 ? 'cue left' : 'cues left'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    
                    {currentCue && (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600 font-mono">
                          {formatTimeMs(currentCue.startMs)} → {formatTimeMs(currentCue.endMs)}
                        </div>
                        <div className="text-lg leading-relaxed text-gray-800 bg-gray-50 p-4 rounded-lg">
                          {currentCue.text}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cue List with full height */}
                  <div className="flex-1 min-h-0">
                    <ImportanceLegend className="mb-4 lg:hidden" position="left" />
                    <CueList
                      cues={currentSession.cues}
                      currentIndex={currentCueIndex}
                      onCueSelect={goToCue}
                      showTiming={true}
                      showImportance={true}
                      fullHeight={true}
                      remainingCueCount={remainingCueCount}
                    />
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 lg:ml-4">
                  {/* Placeholder to reserve column width on lg */}
                  <div className="hidden lg:block" aria-hidden="true" />

                  {/* Mobile/Tablet stack */}
                  <div className="space-y-4 lg:hidden">
                    {currentCue && (
                      <CueImportanceTagger
                        cue={currentCue}
                        onImportanceChange={(importance) => updateCueImportance(currentCueIndex, importance)}
                        onClear={() => clearCueImportance(currentCueIndex)}
                      />
                    )}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="pt-3 border-t border-gray-200">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Keyboard Shortcuts</h5>
                        <div className="space-y-1 text-xs text-gray-600">
                          {shortcuts.map((shortcut, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="font-mono bg-gray-100 px-1 rounded">{shortcut.key}</span>
                              <span>{shortcut.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {statistics && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Progress</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Overall Progress</span>
                              <span>{statistics.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${statistics.progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Total Cues:</span>
                              <span>{statistics.totalCues}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rated:</span>
                              <span>{statistics.ratedCues}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Remaining:</span>
                              <span>{statistics.unratedCues}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <ExportControls
                      session={currentSession}
                      remainingCueCount={remainingCueCount}
                      isSessionComplete={isSessionComplete}
                      metadataReady={metadataReady}
                      missingMetadataFields={missingMetadataFields}
                      markExported={markExported}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-700">Processing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
