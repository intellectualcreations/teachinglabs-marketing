// ── Types ──────────────────────────────────────────────

export interface ClassSession {
  id: string;
  courseId: string;
  date: string;
  topic: string;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
}

// ── In-memory stores ───────────────────────────────────

const sessions = new Map<string, ClassSession>();
const attendance = new Map<string, AttendanceRecord>();

let nextSessionId = 1;
let nextAttendanceId = 1;

// ── Session mutations ──────────────────────────────────

export function createSession(
  courseId: string,
  date: string,
  topic: string,
): ClassSession {
  const now = new Date().toISOString();
  const session: ClassSession = {
    id: `session_${nextSessionId++}`,
    courseId,
    date,
    topic,
    createdAt: now,
  };
  sessions.set(session.id, session);
  return session;
}

// ── Session queries ────────────────────────────────────

export function getSession(sessionId: string): ClassSession | undefined {
  return sessions.get(sessionId);
}

export function getSessionsForCourse(courseId: string): ClassSession[] {
  return Array.from(sessions.values())
    .filter((s) => s.courseId === courseId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ── Attendance mutations ───────────────────────────────

export function markAttendance(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
): AttendanceRecord {
  // Upsert — if a record already exists for this student+session, update it
  for (const rec of attendance.values()) {
    if (rec.sessionId === sessionId && rec.studentId === studentId) {
      rec.status = status;
      rec.markedAt = new Date().toISOString();
      return rec;
    }
  }
  const record: AttendanceRecord = {
    id: `att_${nextAttendanceId++}`,
    sessionId,
    studentId,
    status,
    markedAt: new Date().toISOString(),
  };
  attendance.set(record.id, record);
  return record;
}

// ── Attendance queries ─────────────────────────────────

export function getAttendanceForSession(sessionId: string): AttendanceRecord[] {
  return Array.from(attendance.values())
    .filter((a) => a.sessionId === sessionId)
    .sort((a, b) => a.studentId.localeCompare(b.studentId));
}

export function getStudentAttendance(
  courseId: string,
  studentId: string,
): { records: AttendanceRecord[]; total: number; present: number; percentage: number } {
  const courseSessions = getSessionsForCourse(courseId);
  const sessionIds = new Set(courseSessions.map((s) => s.id));

  const records = Array.from(attendance.values())
    .filter((a) => sessionIds.has(a.sessionId) && a.studentId === studentId)
    .sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime());

  const total = courseSessions.length;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return { records, total, present, percentage };
}
