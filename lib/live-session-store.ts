// ── Types ──────────────────────────────────────────────

export interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  url: string;
  scheduledAt: string;
  duration: number; // minutes
}

// ── In-memory store ────────────────────────────────────

const sessions: LiveSession[] = [];
let nextId = 1;

// ── Mutations ──────────────────────────────────────────

export function createLiveSession(
  courseId: string,
  title: string,
  url: string,
  scheduledAt: string,
  duration: number,
): LiveSession {
  const session: LiveSession = {
    id: `live_${nextId++}`,
    courseId,
    title,
    url,
    scheduledAt,
    duration,
  };
  sessions.push(session);
  return session;
}

// ── Queries ────────────────────────────────────────────

export function getSessionsByCourse(courseId: string): LiveSession[] {
  return sessions
    .filter((s) => s.courseId === courseId)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export function getUpcomingSessions(courseId?: string): LiveSession[] {
  const now = new Date();
  return sessions
    .filter((s) => {
      const sessionEnd = new Date(new Date(s.scheduledAt).getTime() + s.duration * 60000);
      const isUpcoming = sessionEnd > now;
      return courseId ? isUpcoming && s.courseId === courseId : isUpcoming;
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export function getAllSessions(): LiveSession[] {
  return [...sessions].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );
}

export function getSessionById(id: string): LiveSession | undefined {
  return sessions.find((s) => s.id === id);
}

// ── Seed data ──────────────────────────────────────────

function seed() {
  // Generate dates relative to "now" so sessions always appear upcoming
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  // Set times to reasonable school hours
  tomorrow.setHours(14, 0, 0, 0);
  dayAfter.setHours(10, 30, 0, 0);
  nextWeek.setHours(15, 0, 0, 0);

  createLiveSession(
    'algebra-1',
    'Equations Review: Q&A Session',
    'https://meet.google.com/abc-defg-hij',
    tomorrow.toISOString(),
    45,
  );

  createLiveSession(
    'biology',
    'Lab Demo: Cell Division Under the Microscope',
    'https://zoom.us/j/1234567890',
    dayAfter.toISOString(),
    60,
  );

  createLiveSession(
    'algebra-1',
    'Inequalities Workshop',
    'https://meet.google.com/klm-nopq-rst',
    nextWeek.toISOString(),
    50,
  );
}

seed();
