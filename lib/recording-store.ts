// ── Types ──────────────────────────────────────────────

export type RecordingStatus = 'PENDING' | 'RECORDING' | 'COMPLETED' | 'FAILED';

export interface Recording {
  id: string;
  sessionId: string;
  lessonId: string;
  storageUrl: string;
  duration: number; // seconds
  status: RecordingStatus;
  createdAt: string;
  updatedAt: string;
}

// ── In-memory store ────────────────────────────────────

const recordings: Recording[] = [];
let nextId = 1;

// ── Mutations ──────────────────────────────────────────

export function createRecording(
  sessionId: string,
  lessonId: string,
): Recording {
  const now = new Date().toISOString();
  const recording: Recording = {
    id: `rec_${nextId++}`,
    sessionId,
    lessonId,
    storageUrl: '',
    duration: 0,
    status: 'RECORDING',
    createdAt: now,
    updatedAt: now,
  };
  recordings.push(recording);
  return recording;
}

export function completeRecording(
  id: string,
  storageUrl: string,
  duration: number,
): Recording | undefined {
  const recording = recordings.find((r) => r.id === id);
  if (!recording) return undefined;
  recording.storageUrl = storageUrl;
  recording.duration = duration;
  recording.status = 'COMPLETED';
  recording.updatedAt = new Date().toISOString();
  return recording;
}

export function failRecording(id: string): Recording | undefined {
  const recording = recordings.find((r) => r.id === id);
  if (!recording) return undefined;
  recording.status = 'FAILED';
  recording.updatedAt = new Date().toISOString();
  return recording;
}

// ── Queries ────────────────────────────────────────────

export function getRecordingById(id: string): Recording | undefined {
  return recordings.find((r) => r.id === id);
}

export function getRecordingBySession(sessionId: string): Recording | undefined {
  return recordings.find(
    (r) => r.sessionId === sessionId && r.status === 'COMPLETED',
  );
}

export function getRecordingByLesson(lessonId: string): Recording | undefined {
  return recordings.find(
    (r) => r.lessonId === lessonId && r.status === 'COMPLETED',
  );
}

export function getRecordingsBySession(sessionId: string): Recording[] {
  return recordings.filter((r) => r.sessionId === sessionId);
}

export function getActiveRecording(sessionId: string): Recording | undefined {
  return recordings.find(
    (r) => r.sessionId === sessionId && r.status === 'RECORDING',
  );
}
