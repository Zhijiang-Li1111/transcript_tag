import test from 'node:test';
import assert from 'node:assert/strict';
import { createExportControlViewModel } from '../../src/types/annotation';

test('export control communicates remaining cues in tooltip', () => {
  const viewModel = createExportControlViewModel({
    isSessionComplete: false,
    remainingCueCount: 3,
    metadataReady: true,
    descriptionId: 'export-help-text',
  });

  assert.equal(viewModel.disabled, true);
  assert.equal(viewModel.descriptionId, 'export-help-text');
  assert.match(viewModel.tooltip ?? '', /Annotate 3 more cues/);
});

test('export control reflects pending state for assistive tech', () => {
  const viewModel = createExportControlViewModel({
    isSessionComplete: true,
    remainingCueCount: 0,
    metadataReady: true,
    pending: true,
  });

  assert.equal(viewModel.disabled, true);
  assert.equal(viewModel.label, 'Preparing export...');
  assert.equal(viewModel.tooltip, undefined);
});
