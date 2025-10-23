import React from 'react';
import { IMPORTANCE_CONFIG } from '../../types/transcript';

interface ImportanceLegendProps {
  position?: 'left' | 'right';
  className?: string;
  floating?: boolean;
  topOffsetClass?: string;
}

export const ImportanceLegend: React.FC<ImportanceLegendProps> = ({
  position = 'right',
  className = '',
  floating = false,
  topOffsetClass = 'top-24',
}) => {
  const alignment = position === 'right' ? 'items-end text-right' : 'items-start text-left';
  const positionClass = position === 'right' ? 'right-4' : 'left-4';
  const floatingClasses = floating
    ? `fixed ${positionClass} ${topOffsetClass} z-40 shadow-lg pointer-events-auto`
    : 'lg:sticky lg:top-4';

  return (
    <aside
      className={`
  bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm
        p-4 space-y-3 text-sm max-w-xs
        ${floatingClasses}
        ${className}
      `}
      aria-label="Importance scale reference"
    >
      <header className={`flex ${alignment}`}>
        <span className="text-xs uppercase tracking-wide text-gray-500">
          Importance Scale
        </span>
      </header>

      <div className="space-y-3">
        {IMPORTANCE_CONFIG.map((config) => (
          <div
            key={config.level}
            className="flex items-start space-x-3"
          >
            <div
              className={`
                flex items-center justify-center w-9 h-9 rounded-full font-semibold text-white
                shadow-sm
                ${config.color === 'gray' ? 'bg-gray-500' : ''}
                ${config.color === 'blue' ? 'bg-blue-500' : ''}
                ${config.color === 'orange' ? 'bg-orange-500' : ''}
                ${config.color === 'red' ? 'bg-red-500' : ''}
              `}
              aria-hidden
            >
              {config.level}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {config.label}
              </div>
              <p className="text-xs text-gray-600 leading-snug">
                {config.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
