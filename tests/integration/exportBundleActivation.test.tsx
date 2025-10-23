import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { summarizeSessionCompletion } from '../../src/hooks/useAnnotationSession';
import { createExportControlViewModel } from '../../src/types/annotation';
import { exportAnnotations } from '../../src/utils/annotationExport';
import { exportReadySession } from './fixtures/exportReadySession';

test('export control remains disabled until all cues are annotated', async () => {
  const partialSession = globalThis.structuredClone(exportReadySession);
  partialSession.cues[partialSession.cues.length - 1] = {
    ...partialSession.cues[partialSession.cues.length - 1],
    importance: undefined,
  };

  const beforeSummary = summarizeSessionCompletion(partialSession);
  const beforeViewModel = createExportControlViewModel({
    isSessionComplete: beforeSummary?.isSessionComplete ?? false,
    remainingCueCount: beforeSummary?.remainingCueCount ?? 0,
    metadataReady: beforeSummary?.metadataReady ?? false,
  });

  assert.equal(beforeViewModel.disabled, true);
  assert.match(beforeViewModel.tooltip ?? '', /Annotate 1 more cue/);

  // Simulate annotator finishing the last cue
  partialSession.cues[partialSession.cues.length - 1] = {
    ...partialSession.cues[partialSession.cues.length - 1],
    importance: 2,
  };

  const afterSummary = summarizeSessionCompletion(partialSession);
  const afterViewModel = createExportControlViewModel({
    isSessionComplete: afterSummary?.isSessionComplete ?? false,
    remainingCueCount: afterSummary?.remainingCueCount ?? 0,
    metadataReady: afterSummary?.metadataReady ?? false,
  });

  assert.equal(afterViewModel.disabled, false);
  assert.equal(afterViewModel.tooltip, 'Download JSON + original VTT as a ZIP archive.');

  const exportResult = await exportAnnotations(partialSession);

  assert.ok(exportResult.zipBlob instanceof Blob);
  assert.match(exportResult.filename, /mtg_demo_ready-annotations-/);
  assert.match(exportResult.annotationJson, /"importanceAnnotations"/);
  assert.match(exportResult.annotationJson, /"A3"/);

  const zipBuffer = await exportResult.zipBlob.arrayBuffer();
  const zip = await JSZip.loadAsync(zipBuffer);
  const entryNames = Object.keys(zip.files);

  assert.equal(entryNames.length, 2);
  const vttEntryName = entryNames.find(name => name.toLowerCase().endsWith('.vtt'));
  assert.ok(vttEntryName);

  const expectedVttContent = await readFile(new URL('./fixtures/export-ready-sample.vtt', import.meta.url), 'utf-8');
  const zippedVttContent = await zip.file(vttEntryName!)?.async('string');
  assert.ok(zippedVttContent);
  assert.equal(zippedVttContent.replace(/\r\n/g, '\n'), expectedVttContent.replace(/\r\n/g, '\n'));

  const annotationsEntry = await zip.file('annotations.json')?.async('string');
  assert.ok(annotationsEntry);
  assert.match(annotationsEntry, /"meetingId"/);
});
