// ── Types ──────────────────────────────────────────────

export interface PeerTutor {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  bio: string;
  optedInAt: string;
}

// ── In-memory store ────────────────────────────────────

const tutors: PeerTutor[] = [];
let nextId = 1;

// ── Mutations ──────────────────────────────────────────

export function optInAsTutor(
  userId: string,
  userName: string,
  courseId: string,
  bio: string = '',
): PeerTutor {
  // Already opted in — return existing
  const existing = tutors.find((t) => t.userId === userId && t.courseId === courseId);
  if (existing) return existing;

  const tutor: PeerTutor = {
    id: `tutor_${nextId++}`,
    userId,
    userName,
    courseId,
    bio,
    optedInAt: new Date().toISOString(),
  };
  tutors.push(tutor);
  return tutor;
}

export function optOutAsTutor(userId: string, courseId: string): boolean {
  const idx = tutors.findIndex((t) => t.userId === userId && t.courseId === courseId);
  if (idx === -1) return false;
  tutors.splice(idx, 1);
  return true;
}

// ── Queries ────────────────────────────────────────────

export function getTutorsByCourse(courseId: string): PeerTutor[] {
  return tutors
    .filter((t) => t.courseId === courseId)
    .sort((a, b) => new Date(b.optedInAt).getTime() - new Date(a.optedInAt).getTime());
}

export function isTutor(userId: string, courseId: string): boolean {
  return tutors.some((t) => t.userId === userId && t.courseId === courseId);
}

export function getTutorByUser(userId: string, courseId: string): PeerTutor | undefined {
  return tutors.find((t) => t.userId === userId && t.courseId === courseId);
}

export function getAllTutorsForUser(userId: string): PeerTutor[] {
  return tutors.filter((t) => t.userId === userId);
}

// ── Seed data ──────────────────────────────────────────

function seed() {
  optInAsTutor(
    'student-emma',
    'Emma Wilson',
    'algebra-1',
    'I love algebra and I am happy to help with equations and inequalities!',
  );
  optInAsTutor(
    'student-mia',
    'Mia Rodriguez',
    'biology',
    'Biology is my favorite subject. I can help with cell biology and genetics.',
  );
  optInAsTutor(
    'demo-student',
    'Alex Demo',
    'creative-writing',
    'I enjoy writing and can give feedback on short stories and poetry.',
  );
}

seed();
