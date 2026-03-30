/**
 * Attendance tracking types and helpers for TeachingLabs.
 *
 * Includes both type definitions (used by Supabase-backed routes) and
 * in-memory store helpers (used by v1 API routes).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AttendanceRecord {
  id: string;
  courseId: string;
  sessionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  timestamp: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  date: string;
  topic?: string;
  created_at: string;
}

export type AttendanceStatus = AttendanceRecord['status'];

export const VALID_STATUSES: AttendanceStatus[] = ['present', 'absent', 'late'];

export function isValidStatus(status: string): status is AttendanceStatus {
  return VALID_STATUSES.includes(status as AttendanceStatus);
}

// ---------------------------------------------------------------------------
// In-memory store (used by v1 API routes)
// ---------------------------------------------------------------------------

const sessions: AttendanceSession[] = [];
const records: AttendanceRecord[] = [];

export function createSession(courseId: string, date: string, topic: string): AttendanceSession {
  const session: AttendanceSession = {
    id: crypto.randomUUID(),
    courseId,
    date,
    topic,
    created_at: new Date().toISOString(),
  };
  sessions.push(session);
  return session;
}

export function getSession(sessionId: string): AttendanceSession | undefined {
  return sessions.find((s) => s.id === sessionId);
}

export function getSessionsForCourse(courseId: string): AttendanceSession[] {
  return sessions.filter((s) => s.courseId === courseId);
}

export function markAttendance(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
): AttendanceRecord {
  const session = getSession(sessionId);
  const existing = records.find(
    (r) => r.sessionId === sessionId && r.studentId === studentId,
  );
  if (existing) {
    existing.status = status;
    existing.timestamp = new Date().toISOString();
    return existing;
  }
  const record: AttendanceRecord = {
    id: crypto.randomUUID(),
    courseId: session?.courseId ?? '',
    sessionId,
    studentId,
    status,
    timestamp: new Date().toISOString(),
  };
  records.push(record);
  return record;
}

export function getAttendanceForSession(sessionId: string): AttendanceRecord[] {
  return records.filter((r) => r.sessionId === sessionId);
}

export function getStudentAttendance(
  courseId: string,
  studentId: string,
): { sessions: AttendanceSession[]; records: AttendanceRecord[] } {
  const courseSessions = getSessionsForCourse(courseId);
  const sessionIds = new Set(courseSessions.map((s) => s.id));
  const studentRecords = records.filter(
    (r) => r.studentId === studentId && sessionIds.has(r.sessionId),
  );
  return { sessions: courseSessions, records: studentRecords };
}
