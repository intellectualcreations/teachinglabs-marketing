/**
 * Office Hours Q&A Store — in-memory, resets on server restart (fine for demo).
 * Handles scheduled office-hours sessions and text-based Q&A.
 */

export interface OfficeHoursSession {
  id: string;
  courseId: string;
  instructorId: string;
  title: string;
  scheduledAt: string;
  status: 'scheduled' | 'live' | 'ended';
  createdAt: string;
}

export interface QAQuestion {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  status: 'pending' | 'answered';
  createdAt: string;
}

const sessions = new Map<string, OfficeHoursSession>();
const questions = new Map<string, QAQuestion>();

let sessionCounter = 1;
let questionCounter = 1;

function genSessionId(): string {
  return `oh_${sessionCounter++}`;
}

function genQuestionId(): string {
  return `qa_${questionCounter++}`;
}

// ── CRUD ────────────────────────────────────────────────

export function createOfficeHoursSession(
  courseId: string,
  instructorId: string,
  title: string,
  scheduledAt: string,
): OfficeHoursSession {
  const id = genSessionId();
  const session: OfficeHoursSession = {
    id,
    courseId,
    instructorId,
    title,
    scheduledAt,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };
  sessions.set(id, session);
  return session;
}

export function getSessionsByCourse(courseId: string): OfficeHoursSession[] {
  const results: OfficeHoursSession[] = [];
  for (const s of sessions.values()) {
    if (s.courseId === courseId) results.push(s);
  }
  return results.sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
}

export function getSessionById(id: string): OfficeHoursSession | undefined {
  return sessions.get(id);
}

export function getSessionsByInstructor(instructorId: string): OfficeHoursSession[] {
  const results: OfficeHoursSession[] = [];
  for (const s of sessions.values()) {
    if (s.instructorId === instructorId) results.push(s);
  }
  return results.sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
}

export function updateSessionStatus(
  id: string,
  status: OfficeHoursSession['status'],
): OfficeHoursSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  session.status = status;
  return session;
}

export function submitQuestion(
  sessionId: string,
  studentId: string,
  studentName: string,
  question: string,
): QAQuestion {
  const id = genQuestionId();
  const q: QAQuestion = {
    id,
    sessionId,
    studentId,
    studentName,
    question,
    answer: null,
    answeredAt: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  questions.set(id, q);
  return q;
}

export function answerQuestion(
  questionId: string,
  answer: string,
): QAQuestion | undefined {
  const q = questions.get(questionId);
  if (!q) return undefined;
  q.answer = answer;
  q.answeredAt = new Date().toISOString();
  q.status = 'answered';
  return q;
}

export function getQuestionsBySession(sessionId: string): QAQuestion[] {
  const results: QAQuestion[] = [];
  for (const q of questions.values()) {
    if (q.sessionId === sessionId) results.push(q);
  }
  return results.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getTranscript(sessionId: string): {
  session: OfficeHoursSession | undefined;
  questions: QAQuestion[];
} {
  const session = sessions.get(sessionId);
  const answered = getQuestionsBySession(sessionId).filter(
    (q) => q.status === 'answered',
  );
  return { session, questions: answered };
}

// ── Seed data ───────────────────────────────────────────

function seed() {
  // Session 1: live session for algebra-1
  const s1: OfficeHoursSession = {
    id: genSessionId(),
    courseId: 'algebra-1',
    instructorId: 'instructor-park',
    title: 'Algebra I — Midterm Review Q&A',
    scheduledAt: '2026-03-22T15:00:00Z',
    status: 'live',
    createdAt: '2026-03-18T10:00:00Z',
  };
  sessions.set(s1.id, s1);

  // Session 2: scheduled session for biology
  const s2: OfficeHoursSession = {
    id: genSessionId(),
    courseId: 'biology',
    instructorId: 'instructor-park',
    title: 'Biology — Lab Report Help',
    scheduledAt: '2026-03-25T14:00:00Z',
    status: 'scheduled',
    createdAt: '2026-03-20T09:00:00Z',
  };
  sessions.set(s2.id, s2);

  // Session 3: ended session for algebra-1
  const s3: OfficeHoursSession = {
    id: genSessionId(),
    courseId: 'algebra-1',
    instructorId: 'instructor-park',
    title: 'Algebra I — Homework Help',
    scheduledAt: '2026-03-15T16:00:00Z',
    status: 'ended',
    createdAt: '2026-03-10T08:00:00Z',
  };
  sessions.set(s3.id, s3);

  // Questions for session 1 (live) — mix of pending and answered
  const q1: QAQuestion = {
    id: genQuestionId(),
    sessionId: s1.id,
    studentId: 'demo-student',
    studentName: 'Alex Demo',
    question: 'Can you explain how to solve systems of equations using substitution?',
    answer: 'Sure! Start by isolating one variable in one equation, then substitute that expression into the other equation. Solve for the remaining variable, then back-substitute to find the first.',
    answeredAt: '2026-03-22T15:05:00Z',
    status: 'answered',
    createdAt: '2026-03-22T15:02:00Z',
  };
  questions.set(q1.id, q1);

  const q2: QAQuestion = {
    id: genQuestionId(),
    sessionId: s1.id,
    studentId: 'student-emma',
    studentName: 'Emma Wilson',
    question: 'What topics will be on the midterm exam?',
    answer: null,
    answeredAt: null,
    status: 'pending',
    createdAt: '2026-03-22T15:08:00Z',
  };
  questions.set(q2.id, q2);

  const q3: QAQuestion = {
    id: genQuestionId(),
    sessionId: s1.id,
    studentId: 'student-liam',
    studentName: 'Liam Brooks',
    question: 'Is there extra credit available for the midterm?',
    answer: null,
    answeredAt: null,
    status: 'pending',
    createdAt: '2026-03-22T15:10:00Z',
  };
  questions.set(q3.id, q3);

  // Questions for session 3 (ended) — all answered
  const q4: QAQuestion = {
    id: genQuestionId(),
    sessionId: s3.id,
    studentId: 'demo-student',
    studentName: 'Alex Demo',
    question: 'How do I graph a linear inequality?',
    answer: 'Graph the boundary line (solid for ≤/≥, dashed for </>) then shade the region that satisfies the inequality. Test a point to confirm which side to shade.',
    answeredAt: '2026-03-15T16:12:00Z',
    status: 'answered',
    createdAt: '2026-03-15T16:05:00Z',
  };
  questions.set(q4.id, q4);

  const q5: QAQuestion = {
    id: genQuestionId(),
    sessionId: s3.id,
    studentId: 'student-emma',
    studentName: 'Emma Wilson',
    question: 'What is the difference between a function and a relation?',
    answer: 'A function is a special relation where each input has exactly one output. Use the vertical line test on a graph: if any vertical line crosses the graph more than once, it is not a function.',
    answeredAt: '2026-03-15T16:20:00Z',
    status: 'answered',
    createdAt: '2026-03-15T16:15:00Z',
  };
  questions.set(q5.id, q5);
}

seed();
