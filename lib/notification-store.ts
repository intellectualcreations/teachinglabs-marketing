// ── Types ──────────────────────────────────────────────

export type NotificationType = 'quiz_graded' | 'quiz_submitted' | 'course_completed';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  metadata: Record<string, string>;
}

// ── In-memory store ────────────────────────────────────

const notifications: Notification[] = [];
let nextId = 1;

// ── Mutations ──────────────────────────────────────────

export function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  metadata: Record<string, string> = {},
): Notification {
  const notification: Notification = {
    id: `notif_${nextId++}`,
    userId,
    type,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    metadata,
  };
  notifications.push(notification);
  return notification;
}

// ── Query functions ────────────────────────────────────

export function getNotifications(userId: string): Notification[] {
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnreadCount(userId: string): number {
  return notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function markRead(id: string): Notification | undefined {
  const notif = notifications.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
  }
  return notif;
}

export function markAllRead(userId: string): number {
  let count = 0;
  for (const n of notifications) {
    if (n.userId === userId && !n.read) {
      n.read = true;
      count++;
    }
  }
  return count;
}

// ── Seed data ──────────────────────────────────────────

function seed() {
  createNotification(
    'demo-student',
    'quiz_graded',
    'Your quiz "Variables & Expressions Check" was graded: 95%',
    { quizId: 'quiz_1', courseId: 'algebra-1', score: '95' },
  );

  createNotification(
    'demo-student',
    'course_completed',
    'Congratulations! You completed "Creative Writing"',
    { courseId: 'creative-writing' },
  );

  createNotification(
    'instructor-park',
    'quiz_submitted',
    'Alex Demo submitted quiz "Variables & Expressions Check"',
    { quizId: 'quiz_1', studentId: 'demo-student', courseId: 'algebra-1' },
  );

  createNotification(
    'instructor-park',
    'quiz_submitted',
    'Emma Wilson submitted quiz "Variables & Expressions Check"',
    { quizId: 'quiz_1', studentId: 'student-emma', courseId: 'algebra-1' },
  );
}

seed();
