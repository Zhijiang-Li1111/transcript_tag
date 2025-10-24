import React, { useState, useMemo, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { TranscriptCue } from '../../types/transcript';
import { formatTimeMs } from '../../types/transcript';

interface CueListProps {
  cues: TranscriptCue[];
  currentIndex?: number;
  onCueSelect?: (index: number) => void;
  showTiming?: boolean;
  showImportance?: boolean;
  className?: string;
  maxHeight?: string;
  fullHeight?: boolean;
  remainingCueCount?: number;
  showInlineRating?: boolean;
  onRateImportance?: (level: 0 | 1 | 2 | 3) => void;
  onClearRating?: () => void;
}

export interface CueListHandle {
  scrollToActiveCue: () => void;
}

function CueListComponent(
  {
    cues,
    currentIndex = -1,
    onCueSelect,
    showTiming = false,
    showImportance = false,
    className = '',
    maxHeight,
    fullHeight = false,
    remainingCueCount,
    showInlineRating = false,
    onRateImportance,
    onClearRating,
  }: CueListProps,
  ref: React.ForwardedRef<CueListHandle>
) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cueRefs = useRef<Array<HTMLDivElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollActiveCueIntoView = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const activeNode = cueRefs.current[currentIndex];
      if (!activeNode) return;

      activeNode.scrollIntoView({ behavior, block: 'center' });
    },
    [currentIndex]
  );

  // Memoize the formatted cues to avoid recalculating on each render
  const formattedCues = useMemo(() => {
    return cues.map((cue, index) => ({
      ...cue,
      index,
      formattedStart: formatTimeMs(cue.startMs),
      formattedEnd: formatTimeMs(cue.endMs),
      duration: cue.endMs - cue.startMs,
    }));
  }, [cues]);

  useEffect(() => {
    scrollActiveCueIntoView('smooth');
  }, [currentIndex, cues.length, scrollActiveCueIntoView]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToActiveCue: () => {
        scrollActiveCueIntoView('smooth');
      },
    }),
    [scrollActiveCueIntoView]
  );

  // Get importance level styling
  const getImportanceStyle = (importance?: number) => {
    switch (importance) {
      case 0:
        return 'bg-gray-100 border-l-gray-400 text-gray-700';
      case 1:
        return 'bg-blue-50 border-l-blue-400 text-blue-700';
      case 2:
        return 'bg-orange-50 border-l-orange-400 text-orange-700';
      case 3:
        return 'bg-red-50 border-l-red-400 text-red-700';
      default:
        return 'bg-white border-l-gray-200 text-gray-900';
    }
  };

  // Get importance label
  const getImportanceLabel = (importance?: number) => {
    switch (importance) {
      case 0: return 'Noise';
      case 1: return 'Optional';
      case 2: return 'Important';
      case 3: return 'Critical';
      default: return 'Unrated';
    }
  };

  if (cues.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No cues available</div>
          <div className="text-sm">Upload a VTT file to see transcript cues</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${fullHeight ? 'flex flex-col h-full' : ''} ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            Transcript Cues ({cues.length})
          </h3>
          <div className="text-xs text-gray-500">
            {currentIndex + 1} of {cues.length}
          </div>
        </div>
        {showImportance && typeof remainingCueCount === 'number' && remainingCueCount > 0 && (
          <p className="mt-2 text-xs text-amber-600">
            {remainingCueCount} {remainingCueCount === 1 ? 'cue needs' : 'cues need'} ratings before export.
          </p>
        )}
      </div>

      {/* Cue List */}
      <div 
        ref={containerRef}
        className={`overflow-y-auto ${fullHeight ? 'flex-1' : ''}`}
        style={fullHeight ? {} : { maxHeight }}
      >
        {formattedCues.map((cue) => {
          const isActive = cue.index === currentIndex;
          const isHovered = cue.index === hoveredIndex;
          const baseImportanceClass = getImportanceStyle(cue.importance);

          let stateClasses = `${baseImportanceClass}`;
          if (isHovered) {
            stateClasses = `${baseImportanceClass} shadow-sm`;
          }
          if (isActive) {
            stateClasses = `${baseImportanceClass} ring-2 ring-blue-300 ring-offset-1 ring-offset-white shadow-md`;
          }
          
          return (
            <div
              key={cue.id}
              ref={(element) => {
                cueRefs.current[cue.index] = element;
              }}
              className={`
                relative border-l-4 transition-all duration-200 cursor-pointer focus:outline-none
                ${stateClasses}
                ${cue.index === 0 ? '' : 'border-t border-gray-100'}
                ${isActive ? 'my-2 mx-1' : 'my-0 mx-0'}
              `}
              onClick={() => onCueSelect?.(cue.index)}
              onMouseEnter={() => setHoveredIndex(cue.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role="button"
              tabIndex={0}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Cue ${cue.index + 1}${cue.speaker ? `, ${cue.speaker}` : ''}: ${cue.text.substring(0, 50)}...`}
              onKeyDown={(e) => {
                // Don't intercept keyboard events - let global keyboard handler manage them
                // Just handle Enter for accessibility
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onCueSelect?.(cue.index);
                }
              }}
            >
              <div className="p-4 space-y-3">
                {/* Timing Information */}
                {showTiming && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-mono text-gray-600">
                      {cue.formattedStart} → {cue.formattedEnd}
                    </div>
                    <div className="text-gray-500">
                      {Math.round(cue.duration / 1000)}s
                    </div>
                  </div>
                )}

                {isActive && (
                  <div className="flex items-center space-x-2 text-xs text-blue-700 uppercase tracking-wide">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 font-semibold shadow-sm">
                      Active Cue
                    </span>
                  </div>
                )}

                {/* Speaker */}
                {cue.speaker && (
                  <div className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                    {cue.speaker}
                  </div>
                )}

                {/* Cue Text */}
                <div className={`text-base leading-relaxed ${isActive ? 'font-semibold' : ''}`}>
                  {cue.text}
                </div>

                {/* Importance Rating with Quick Buttons */}
                {showImportance && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Show inline rating buttons only for selected cue */}
                      {showInlineRating && isActive && onRateImportance && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs text-gray-500 mr-1">Rate:</span>
                          {[
                            { level: 0, label: 'Noise', description: 'Small talk, fillers, chit-chat, non-informative' },
                            { level: 1, label: 'Optional', description: 'Minor background, explanations, low-value repetitions' },
                            { level: 2, label: 'Important', description: 'Core comparisons, key evidence, plan actions, critical questions' },
                            { level: 3, label: 'Critical', description: 'Decisions / commitments / hard results / key risk confirmations' }
                          ].map((config, index, array) => {
                            const isRated = cue.importance === config.level;
                            const tooltipPositionClass = index === 0
                              ? 'left-0 translate-x-0'
                              : index === array.length - 1
                                ? 'right-0 translate-x-0'
                                : 'left-1/2 -translate-x-1/2';
                            return (
                              <div key={config.level} className="relative group flex items-center">
                                <button
                                  type="button"
                                  aria-label={`${config.label}: ${config.description}`}
                                  onClick={() => onRateImportance(config.level as 0 | 1 | 2 | 3)}
                                  className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                    isRated
                                      ? 'bg-blue-600 text-white border border-blue-600'
                                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                                  }`}
                                >
                                  {config.level}
                                </button>
                                  <div className={`pointer-events-none absolute ${tooltipPositionClass} bottom-[120%] z-30 max-w-[13rem] rounded-md bg-slate-900 px-3 py-2 text-[11px] leading-snug text-slate-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100`}>
                                  <div className="text-xs font-semibold text-white">{config.label}</div>
                                  <div className="mt-1 text-[11px] text-slate-200">{config.description}</div>
                                </div>
                              </div>
                            );
                          })}
                          {cue.importance !== undefined && onClearRating && (
                            <button
                              type="button"
                              onClick={onClearRating}
                              className="ml-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                              title="Clear rating"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Show importance badge when not showing inline rating */}
                      {!(showInlineRating && isActive) && (
                        <>
                          {cue.importance !== undefined ? (
                            <span
                              className={`
                                inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                ${cue.importance === 0 ? 'bg-gray-100 text-gray-800 border border-gray-300' : ''}
                                ${cue.importance === 1 ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
                                ${cue.importance === 2 ? 'bg-orange-100 text-orange-800 border border-orange-200' : ''}
                                ${cue.importance === 3 ? 'bg-red-100 text-red-800 border border-red-200' : ''}
                              `}
                            >
                              {getImportanceLabel(cue.importance)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse">
                              Unrated
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="text-xs text-gray-400 font-mono">
                      #{cue.index + 1}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with summary */}
      <div className={`px-4 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg ${fullHeight ? 'flex-shrink-0' : ''}`}>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Total duration: {formatTimeMs(cues[cues.length - 1]?.endMs || 0)}
          </div>
          {showImportance && (
            <div>
              Rated: {cues.filter(c => c.importance !== undefined).length} / {cues.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const CueList = forwardRef<CueListHandle, CueListProps>(CueListComponent);

// Compact version for smaller spaces
interface CompactCueListProps {
  cues: TranscriptCue[];
  currentIndex?: number;
  onCueSelect?: (index: number) => void;
  maxHeight?: string;
  className?: string;
}

export const CompactCueList: React.FC<CompactCueListProps> = ({
  cues,
  currentIndex = 0,
  onCueSelect,
  maxHeight = '300px',
  className = '',
}) => {
  if (cues.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 text-sm ${className}`}>
        No cues available
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded ${className}`}>
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {cues.map((cue, index) => {
          const isActive = index === currentIndex;
          
          return (
            <div
              key={cue.id}
              className={`
                px-3 py-2 text-sm border-b border-gray-100 cursor-pointer transition-colors
                ${isActive ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-50'}
                ${index === cues.length - 1 ? 'border-b-0' : ''}
              `}
              onClick={() => onCueSelect?.(index)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-gray-500">
                  {formatTimeMs(cue.startMs)}
                </span>
                <span className="text-xs text-gray-400">#{index + 1}</span>
              </div>
              {cue.speaker && (
                <div className={`text-xs font-semibold mb-0.5 ${isActive ? 'text-blue-900' : 'text-gray-600'}`}>
                  {cue.speaker}
                </div>
              )}
              <div className="truncate">
                {cue.text}
              </div>
              {cue.importance !== undefined && (
                <div className="mt-1">
                  <span
                    className={`
                      inline-block w-2 h-2 rounded-full
                      ${cue.importance === 0 ? 'bg-gray-400' : ''}
                      ${cue.importance === 1 ? 'bg-blue-400' : ''}
                      ${cue.importance === 2 ? 'bg-orange-400' : ''}
                      ${cue.importance === 3 ? 'bg-red-400' : ''}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};