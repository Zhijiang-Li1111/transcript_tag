import { useState, useCallback } from 'react';
import { MainLayout, Header } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { FileUploader } from './components/upload/FileUploader';
import { CueList } from './components/transcript/CueList';
import { ExportControls } from './components/transcript/ExportControls';
import { Button } from './components/ui/Button';
import { useVTTParser } from './hooks/useVTTParser';
import { useAnnotationSession } from './hooks/useAnnotationSession';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { FileValidationResult } from './utils/fileValidation';

function App() {
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
  
  // VTT Parser hook
  const { isLoading, error, cues, parseFile, clearError, fileName, rawContent } = useVTTParser();
  
  // Annotation Session hook
  const {
    currentSession,
    currentCueIndex,

    statistics,
    createSession,
    updateCueImportance,
    clearCueImportance,
    clearSession,
    goToCue,
    nextCue,
    previousCue,
    markExported,
    isSessionComplete,
    remainingCueCount,
    metadataReady,
    missingMetadataFields,
  } = useAnnotationSession();

    // Keyboard shortcuts
  // Stable keyboard callback for rating
  const handleKeyboardRate = useCallback(
    (level: 0 | 1 | 2 | 3) => {
      if (currentSession) {
        updateCueImportance(currentCueIndex, level);
      }
    },
    [currentSession, currentCueIndex, updateCueImportance]
  );

  // These are now stable because nextCue/previousCue no longer depend on currentCueIndex
  const { shortcuts } = useKeyboardShortcuts({
    onRateImportance: handleKeyboardRate,
    onNextCue: nextCue,
    onPreviousCue: previousCue,
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

  const handleRateCue = useCallback((level: 0 | 1 | 2 | 3) => {
    if (!currentSession) return;
    updateCueImportance(currentCueIndex, level);
  }, [currentSession, currentCueIndex, updateCueImportance]);

  const handleClearRating = useCallback(() => {
    if (!currentSession) return;
    clearCueImportance(currentCueIndex);
  }, [clearCueImportance, currentCueIndex, currentSession]);



  return (
    <ErrorBoundary>
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
                
                {/* Usage Guide */}
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    How to use this tool
                  </h2>
                  <div className="space-y-4 text-gray-600">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">📁 Upload Your File</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Drag and drop a VTT file into the area below, or click "Browse Files" to select one</li>
                        <li>• Supports VTT (WebVTT) subtitle files and text files containing VTT content</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">⭐ Rate Importance</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Rate each transcript cue on a scale of 0-3:</li>
                        <li className="ml-4 space-y-1">
                          <div className="text-gray-700"><span className="font-medium text-gray-400">0 = Noise:</span> Irrelevant content (e.g., "um", "uh", side conversations)</div>
                          <div className="text-gray-700"><span className="font-medium text-blue-500">1 = Optional:</span> Nice to have (e.g., background context, casual remarks)</div>
                          <div className="text-gray-700"><span className="font-medium text-amber-600">2 = Important:</span> Key information (e.g., main discussion points, decisions)</div>
                          <div className="text-gray-700"><span className="font-medium text-red-600">3 = Critical:</span> Must-have content (e.g., action items, key conclusions)</div>
                        </li>
                        <li>• Use quick buttons or keyboard shortcuts (0–3 keys)</li>
                        <li>• Your progress saves automatically as you work</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">⏱️ Time & Export</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Expected duration: <span className="font-medium text-blue-600">5–10 minutes</span> depending on transcript length</li>
                        <li>• After completing all ratings, you can <span className="font-medium text-green-600">export your results</span> as a ZIP file</li>
                        <li>• Export includes annotations.json and the original VTT file for further analysis</li>
                      </ul>
                    </div>
                    
                    {/* Privacy Note */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-green-800 mb-1">🔒 Privacy & Open Source</p>
                          <p className="text-green-700">
                            This tool runs entirely in your browser with no backend. Your transcript data never leaves your device. 
                            Source code available at:{' '}
                            <a 
                              href="https://github.com/Zhijiang-Li1111/transcript_tag/tree/main" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-green-600 hover:text-green-500 underline"
                            >
                              github.com/Zhijiang-Li1111/transcript_tag
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
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
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Annotation Phase
            <div className="h-full flex flex-col">
              <div className="lg:mr-[22rem] flex flex-col space-y-4 flex-1 min-h-0">
                {/* Main Content Area with margin for floating sidebar */}
                <div className="flex flex-col space-y-4 min-h-0">
                  {/* Header with back button and progress */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  </div>

                  {/* Cue List with full height */}
                  <div className="flex-1 min-h-0">
                    <CueList
                      cues={currentSession.cues}
                      currentIndex={currentCueIndex}
                      onCueSelect={goToCue}
                      showTiming={true}
                      showImportance={true}
                      fullHeight={true}
                      remainingCueCount={remainingCueCount}
                      showInlineRating={true}
                      onRateImportance={handleRateCue}
                      onClearRating={handleClearRating}
                    />
                  </div>
                </div>

                {/* Floating Sidebar */}
                <div 
                  className="hidden lg:flex flex-col space-y-4 fixed top-28 z-40 w-80 pointer-events-auto"
                  style={{
                    left: 'calc((100vw + min(100vw, 72rem)) / 2 - 20rem - 1.5rem)',
                    right: 'auto',
                  }}
                >
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

                {/* Mobile/Tablet Progress and Export */}
                <div className="space-y-4 lg:hidden">
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
