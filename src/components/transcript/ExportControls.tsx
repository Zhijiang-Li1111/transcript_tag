import { useCallback, useId, useMemo, useState } from 'react';
import type { AnnotationSession } from '../../types/annotation';
import { createExportControlViewModel } from '../../types/annotation';
import { exportAnnotations, downloadFile } from '../../utils/annotationExport';
import { Button } from '../ui/Button';

interface ExportControlsProps {
  session: AnnotationSession;
  remainingCueCount: number;
  isSessionComplete: boolean;
  metadataReady: boolean;
  missingMetadataFields: string[];
  markExported: () => void;
  onExported?: () => void;
}

export function ExportControls({
  session,
  remainingCueCount,
  isSessionComplete,
  metadataReady,
  missingMetadataFields,
  markExported,
  onExported,
}: ExportControlsProps) {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const helperTextId = useId();
  const statusRegionId = useId();

  const viewModel = useMemo(
    () =>
      createExportControlViewModel({
        isSessionComplete,
        remainingCueCount,
        metadataReady,
        pending,
        descriptionId: helperTextId,
      }),
    [helperTextId, isSessionComplete, metadataReady, pending, remainingCueCount]
  );

  const helperMessage = useMemo(() => {
    if (!isSessionComplete) {
      const cueLabel = remainingCueCount === 1 ? 'cue' : 'cues';
      return `Annotate ${remainingCueCount} more ${cueLabel} to enable export.`;
    }

    if (!metadataReady) {
      return 'Original file name missing. Upload transcript again before exporting.';
    }

    return 'Download will include annotations.json and the original VTT file.';
  }, [isSessionComplete, metadataReady, remainingCueCount]);

  const onExport = useCallback(async () => {
    try {
      setPending(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const result = await exportAnnotations(session);
      downloadFile(result.zipBlob, result.filename);
      markExported();
      setSuccessMessage('Export complete. Archive download started.');
      onExported?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown export error';
      setErrorMessage(message);
      setSuccessMessage(null);
    } finally {
      setPending(false);
    }
  }, [markExported, onExported, session]);

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3" aria-labelledby="export-controls-heading">
      <header className="flex items-center justify-between">
        <h2 id="export-controls-heading" className="text-sm font-semibold text-gray-900">
          Export
        </h2>
        {session.exportedAt && (
          <span className="text-xs text-gray-500" aria-live="polite">
            Last exported {new Date(session.exportedAt).toLocaleString()}
          </span>
        )}
      </header>

      <p id={helperTextId} className="text-xs text-gray-600">
        {helperMessage}
      </p>

      {missingMetadataFields.length > 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Missing metadata: {missingMetadataFields.join(', ')}
        </p>
      )}

      <Button
        size="sm"
        variant="primary"
        fullWidth
        disabled={viewModel.disabled}
        onClick={onExport}
        aria-describedby={helperTextId}
      >
        {viewModel.label}
      </Button>

      {viewModel.tooltip && (
        <p className="text-[11px] text-gray-500" role="note">
          {viewModel.tooltip}
        </p>
      )}

      <div id={statusRegionId} className="text-xs" aria-live="polite">
        {pending && <span className="text-gray-500">Preparing export archive...</span>}
        {successMessage && <span className="text-green-600">{successMessage}</span>}
        {errorMessage && <span className="text-red-600">{errorMessage}</span>}
      </div>
    </section>
  );
}
