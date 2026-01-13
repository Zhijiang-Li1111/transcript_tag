import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAnnotationJson,
  validateAnnotation,
  matchAnnotationsToCues,
} from '../../src/utils/annotationImport';
import type { TranscriptCue } from '../../src/types/transcript';

// Parser tests
test('parseAnnotationJson: valid structure', () => {
  const json = JSON.stringify({
    version: 1,
    annotations: [
      { startMs: 0, endMs: 1000, importance: 2 },
    ],
  });
  const result = parseAnnotationJson(json);
  assert.ok(!('error' in result));
  assert.strictEqual(result.version, 1);
  assert.strictEqual(result.annotations.length, 1);
});

test('parseAnnotationJson: accepts string version (semver)', () => {
  const json = JSON.stringify({
    version: '2.0.0',
    annotations: [
      { startMs: 0, endMs: 1000, importance: 2 },
    ],
  });
  const result = parseAnnotationJson(json);
  assert.ok(!('error' in result));
  if (!('error' in result)) {
    assert.strictEqual(result.version, '2.0.0');
    assert.strictEqual(result.annotations.length, 1);
  }
});

test('parseAnnotationJson: missing version', () => {
  const json = JSON.stringify({ annotations: [] });
  const result = parseAnnotationJson(json);
  assert.ok('error' in result);
  assert.match(result.error, /version/i);
});

test('parseAnnotationJson: invalid JSON', () => {
  const result = parseAnnotationJson('{ invalid json }');
  assert.ok('error' in result);
  assert.match(result.error, /parse/i);
});

test('parseAnnotationJson: missing annotations array', () => {
  const json = JSON.stringify({ version: 1 });
  const result = parseAnnotationJson(json);
  assert.ok('error' in result);
  assert.match(result.error, /annotations/i);
});

// Validation tests
test('validateAnnotation: valid annotation', () => {
  const ann = { startMs: 0, endMs: 1000, importance: 2 };
  const issue = validateAnnotation(ann, 0);
  assert.strictEqual(issue, null);
});

test('validateAnnotation: invalid time range', () => {
  const ann = { startMs: 1000, endMs: 500, importance: 2 };
  const issue = validateAnnotation(ann, 0);
  assert.ok(issue !== null);
  assert.strictEqual(issue.type, 'STRUCTURAL');
});

test('validateAnnotation: invalid importance (out of range)', () => {
  const ann = { startMs: 0, endMs: 1000, importance: 5 };
  const issue = validateAnnotation(ann, 0);
  assert.ok(issue !== null);
  assert.strictEqual(issue.type, 'INVALID_IMPORTANCE');
});

test('validateAnnotation: invalid importance (not integer)', () => {
  const ann = { startMs: 0, endMs: 1000, importance: 2.5 };
  const issue = validateAnnotation(ann, 0);
  assert.ok(issue !== null);
  assert.strictEqual(issue.type, 'INVALID_IMPORTANCE');
});

// Matching tests
test('matchAnnotationsToCues: exact match', () => {
  const cues: TranscriptCue[] = [
    { id: 'c1', startMs: 0, endMs: 1000, text: 'Test', importance: undefined },
  ];
  const imported = [{ startMs: 0, endMs: 1000, importance: 2 }];
  const result = matchAnnotationsToCues(imported, cues);
  assert.strictEqual(result.kind, 'success');
  if (result.kind === 'success') {
    assert.strictEqual(result.appliedCount, 1);
    assert.strictEqual(result.partial, false);
  }
});

test('matchAnnotationsToCues: within tolerance', () => {
  const cues: TranscriptCue[] = [
    { id: 'c1', startMs: 0, endMs: 1000, text: 'Test', importance: undefined },
  ];
  const imported = [{ startMs: 25, endMs: 1025, importance: 2 }];
  const result = matchAnnotationsToCues(imported, cues);
  assert.strictEqual(result.kind, 'success');
});

test('matchAnnotationsToCues: outside tolerance', () => {
  const cues: TranscriptCue[] = [
    { id: 'c1', startMs: 0, endMs: 1000, text: 'Test', importance: undefined },
  ];
  const imported = [{ startMs: 100, endMs: 1100, importance: 2 }];
  const result = matchAnnotationsToCues(imported, cues);
  assert.strictEqual(result.kind, 'error');
  if (result.kind === 'error') {
    assert.strictEqual(result.issues[0].type, 'UNMATCHED');
  }
});

test('matchAnnotationsToCues: duplicate annotations', () => {
  const cues: TranscriptCue[] = [
    { id: 'c1', startMs: 0, endMs: 1000, text: 'Test', importance: undefined },
  ];
  const imported = [
    { startMs: 0, endMs: 1000, importance: 2 },
    { startMs: 0, endMs: 1000, importance: 3 },
  ];
  const result = matchAnnotationsToCues(imported, cues);
  assert.strictEqual(result.kind, 'error');
  if (result.kind === 'error') {
    assert.strictEqual(result.issues[0].type, 'DUPLICATE');
  }
});

test('matchAnnotationsToCues: overlapping match', () => {
  const cues: TranscriptCue[] = [
    { id: 'c1', startMs: 0, endMs: 1000, text: 'Test1', importance: undefined },
    { id: 'c2', startMs: 10, endMs: 1010, text: 'Test2', importance: undefined },
  ];
  const imported = [{ startMs: 5, endMs: 1005, importance: 2 }];
  const result = matchAnnotationsToCues(imported, cues);
  assert.strictEqual(result.kind, 'error');
  if (result.kind === 'error') {
    assert.strictEqual(result.issues[0].type, 'OVERLAP');
  }
});

test('matchAnnotationsToCues: partial coverage', () => {
  const cues: TranscriptCue[] = [
    { id: 'c1', startMs: 0, endMs: 1000, text: 'Test1', importance: undefined },
    { id: 'c2', startMs: 1000, endMs: 2000, text: 'Test2', importance: undefined },
  ];
  const imported = [{ startMs: 0, endMs: 1000, importance: 2 }];
  const result = matchAnnotationsToCues(imported, cues);
  assert.strictEqual(result.kind, 'success');
  if (result.kind === 'success') {
    assert.strictEqual(result.appliedCount, 1);
    assert.strictEqual(result.partial, true);
  }
});

