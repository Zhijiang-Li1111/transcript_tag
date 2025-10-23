import type { AnnotationSession, ImportanceAnnotation } from '../../../src/types/annotation';
import { SessionState } from '../../../src/types/annotation';
import type { TranscriptCue } from '../../../src/types/transcript';

const originalVttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
Welcome and introductions.

00:00:05.000 --> 00:00:10.000
Decision: adopt proposed vendor timeline.

00:00:10.000 --> 00:00:15.000
Follow-up items and closing remarks.
`;

const cues: TranscriptCue[] = [
  {
    id: 'cue-001',
    startMs: 0,
    endMs: 5000,
    text: 'Welcome and introductions.',
    importance: 1,
  },
  {
    id: 'cue-002',
    startMs: 5000,
    endMs: 10000,
    text: 'Decision: adopt proposed vendor timeline.',
    importance: 3,
  },
  {
    id: 'cue-003',
    startMs: 10000,
    endMs: 15000,
    text: 'Follow-up items and closing remarks.',
    importance: 2,
  },
];

const annotations: ImportanceAnnotation[] = [
  {
    annotationId: 'A1',
    startMs: cues[0].startMs,
    endMs: cues[0].endMs,
    importance: cues[0].importance!,
    notes: 'Optional background context',
    timestamp: '2025-10-20T10:00:00.000Z',
  },
  {
    annotationId: 'A2',
    startMs: cues[1].startMs,
    endMs: cues[1].endMs,
    importance: cues[1].importance!,
    notes: 'Critical decision/commitment',
    timestamp: '2025-10-20T10:01:00.000Z',
  },
  {
    annotationId: 'A3',
    startMs: cues[2].startMs,
    endMs: cues[2].endMs,
    importance: cues[2].importance!,
    notes: 'Important information/evidence',
    timestamp: '2025-10-20T10:02:00.000Z',
  },
];

export const exportReadySession: AnnotationSession = {
  sessionId: 'session-demo-ready',
  meetingId: 'mtg_demo_ready',
  annotator: 'annotator_demo',
  version: 1,
  createdAt: '2025-10-20T10:00:00.000Z',
  lastModified: '2025-10-20T10:05:00.000Z',
  originalFileName: 'export-ready-sample.vtt',
  originalFileContent: originalVttContent,
  cues,
  annotations,
};

export const exportReadySessionState = SessionState.COMPLETE;
