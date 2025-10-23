import test from 'node:test';
import assert from 'node:assert/strict';
import type { AnnotationSession } from '../../src/types/annotation';
import { summarizeSessionCompletion } from '../../src/hooks/useAnnotationSession';

const baseSession: AnnotationSession = {
  sessionId: 'session-1',
  meetingId: 'meeting-1',
  annotator: 'annotator-1',
  version: 1,
  createdAt: '2025-10-20T10:00:00.000Z',
  lastModified: '2025-10-20T10:05:00.000Z',
  originalFileName: 'demo.vtt',
  cues: [
    { id: 'cue-1', startMs: 0, endMs: 1000, text: 'Intro', importance: 1 },
    { id: 'cue-2', startMs: 1000, endMs: 2000, text: 'Decision', importance: 3 },
    { id: 'cue-3', startMs: 2000, endMs: 3000, text: 'Wrap up', importance: 2 },
  ],
  annotations: [],
};

test('marks session complete when all cues are annotated', () => {
  const summary = summarizeSessionCompletion(baseSession);

  assert.ok(summary);
  assert.equal(summary?.isSessionComplete, true);
  assert.equal(summary?.remainingCueCount, 0);
  assert.deepEqual(summary?.remainingCueIndices, []);
  assert.equal(summary?.metadataReady, true);
});

test('tracks remaining cues when some cues lack importance', () => {
  const partialSession: AnnotationSession = {
    ...baseSession,
    cues: [
      baseSession.cues[0],
      { ...baseSession.cues[1], importance: undefined },
      { ...baseSession.cues[2], importance: undefined },
    ],
  };

  const summary = summarizeSessionCompletion(partialSession);

  assert.ok(summary);
  assert.equal(summary?.isSessionComplete, false);
  assert.equal(summary?.remainingCueCount, 2);
  assert.deepEqual(summary?.remainingCueIndices, [1, 2]);
  assert.equal(summary?.progressPercentage, 33);
});

test('flags missing original file metadata', () => {
  const missingMetadataSession: AnnotationSession = {
    ...baseSession,
    originalFileName: '',
  };

  const summary = summarizeSessionCompletion(missingMetadataSession);

  assert.ok(summary);
  assert.equal(summary?.metadataReady, false);
  assert.deepEqual(summary?.missingMetadataFields, ['originalFileName']);
});
