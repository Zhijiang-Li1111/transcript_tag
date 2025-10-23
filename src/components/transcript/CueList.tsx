import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { TranscriptCue } from '../../types/transcript';
import { formatTimeMs } from '../../types/transcript';

interface CueListProps {
  cues: TranscriptCue[];
  currentIndex?: number;
  onCueSelect?: (index: number) => void;
  showTiming?: boolean;
  showImportance?: boolean;
  maxHeight?: string;
  fullHeight?: boolean;
  className?: string;
  remainingCueCount?: number;
}

export const CueList: React.FC<CueListProps> = ({
  cues,
  currentIndex = 0,
  onCueSelect,
  showTiming = true,
  showImportance = true,
  maxHeight = '400px',
  fullHeight = false,
  className = '',
  remainingCueCount,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cueRefs = useRef<Array<HTMLDivElement | null>>([]);

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
    const activeNode = cueRefs.current[currentIndex];
    if (activeNode) {
      activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, cues.length]);

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
        className={`overflow-y-auto ${fullHeight ? 'flex-1' : ''}`}
        style={fullHeight ? {} : { maxHeight }}
      >
        {formattedCues.map((cue) => {
          const isActive = cue.index === currentIndex;
          const isHovered = cue.index === hoveredIndex;
          const baseImportanceClass = getImportanceStyle(cue.importance);

          let stateClasses = `${baseImportanceClass} scale-100`;
          if (isHovered) {
            stateClasses = `${baseImportanceClass} scale-[1.01] shadow-sm`;
          }
          if (isActive) {
            stateClasses = `${baseImportanceClass} scale-[1.03] ring-2 ring-blue-300 ring-offset-1 ring-offset-white shadow-md`;
          }
          
          return (
            <div
              key={cue.id}
              ref={(element) => {
                cueRefs.current[cue.index] = element;
              }}
              className={`
                relative border-l-4 transition-all duration-200 cursor-pointer focus:outline-none transform
                ${stateClasses}
                ${cue.index === 0 ? '' : 'border-t border-gray-100'}
              `}
              onClick={() => onCueSelect?.(cue.index)}
              onMouseEnter={() => setHoveredIndex(cue.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role="button"
              tabIndex={0}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Cue ${cue.index + 1}${cue.speaker ? `, ${cue.speaker}` : ''}: ${cue.text.substring(0, 50)}...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
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
};

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