export type UserRole = 'student' | 'instructor' | 'admin';
export type SubscriptionTier = 'free' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStartedAt?: string;
}

/**
 * Demo user directory — in-memory, resets on restart.
 * Instructor names match the `instructor` field on courses in courses.ts.
 */
export const users: User[] = [
  // Instructors (matching course data)
  { id: 'instructor-harper', name: 'Ms. Harper', email: 'harper@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-park', name: 'Mr. Daniel Park', email: 'park@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-torres', name: 'Ms. Rachel Torres', email: 'torres@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-liu', name: 'Dr. James Liu', email: 'liu@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-sharma', name: 'Ms. Priya Sharma', email: 'sharma@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-chen', name: 'Mr. Alex Chen', email: 'chen@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-gonzalez', name: 'Dr. Maria Gonzalez', email: 'gonzalez@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-grant', name: 'Ms. Olivia Grant', email: 'grant@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-okafor', name: 'Mr. David Okafor', email: 'okafor@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-lee', name: 'Ms. Hannah Lee', email: 'lee@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-johnson', name: 'Mr. Marcus Johnson', email: 'johnson@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-martinez', name: 'Ms. Sofia Martinez', email: 'martinez@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-kim', name: 'Dr. Robert Kim', email: 'kim@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-tanaka', name: 'Ms. Aiko Tanaka', email: 'tanaka@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-patel', name: 'Mr. Kevin Patel', email: 'patel@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },
  { id: 'instructor-rivera', name: 'Mr. Carlos Rivera', email: 'rivera@teachinglabs.io', role: 'instructor', subscriptionTier: 'free' },

  // Students
  { id: 'demo-student', name: 'Alex Demo', email: 'alex@student.teachinglabs.io', role: 'student', subscriptionTier: 'free' },
  { id: 'student-emma', name: 'Emma Wilson', email: 'emma@student.teachinglabs.io', role: 'student', subscriptionTier: 'pro', stripeSubscriptionId: 'sub_demo_emma', subscriptionStartedAt: '2026-02-01T00:00:00Z' },
  { id: 'student-liam', name: 'Liam Brooks', email: 'liam@student.teachinglabs.io', role: 'student', subscriptionTier: 'free' },
  { id: 'student-mia', name: 'Mia Rodriguez', email: 'mia@student.teachinglabs.io', role: 'student', subscriptionTier: 'pro', stripeSubscriptionId: 'sub_demo_mia', subscriptionStartedAt: '2026-02-15T00:00:00Z' },
  { id: 'student-noah', name: 'Noah Kim', email: 'noah@student.teachinglabs.io', role: 'student', subscriptionTier: 'free' },

  // Admin
  { id: 'admin-dottie', name: 'Dottie Stewart', email: 'dottie@teachinglabs.io', role: 'admin', subscriptionTier: 'free' },
];

/** Map of instructor name → user id for looking up by course.instructor string */
const instructorNameMap = new Map<string, string>();
for (const u of users) {
  if (u.role === 'instructor') {
    instructorNameMap.set(u.name, u.id);
  }
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getInstructorById(id: string): User | undefined {
  const u = users.find((u) => u.id === id);
  return u?.role === 'instructor' ? u : undefined;
}

export function getInstructorByName(name: string): User | undefined {
  const id = instructorNameMap.get(name);
  return id ? getUserById(id) : undefined;
}

export function getStudentById(id: string): User | undefined {
  const u = users.find((u) => u.id === id);
  return u?.role === 'student' ? u : undefined;
}

/**
 * Get the "current user" for the demo.
 * Accepts an optional role hint from a cookie or query param.
 * Defaults to the demo instructor (Ms. Harper) for instructor routes,
 * demo-student for student routes.
 */
export function getCurrentUser(roleHint?: string): User {
  if (roleHint === 'student') {
    return users.find((u) => u.id === 'demo-student')!;
  }
  if (roleHint === 'admin') {
    return users.find((u) => u.id === 'admin-dottie')!;
  }
  // Default: demo instructor
  return users.find((u) => u.id === 'instructor-park')!;
}

export function getAllStudents(): User[] {
  return users.filter((u) => u.role === 'student');
}

export function getAllInstructors(): User[] {
  return users.filter((u) => u.role === 'instructor');
}

/** Free tier course enrollment limit */
export const FREE_TIER_MAX_COURSES = 3;

/** Pro subscription price in cents */
export const PRO_PRICE_CENTS = 2999; // $29.99/mo

export function updateUserSubscription(
  userId: string,
  tier: SubscriptionTier,
  stripeSubscriptionId?: string,
): User | undefined {
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;
  user.subscriptionTier = tier;
  if (stripeSubscriptionId) {
    user.stripeSubscriptionId = stripeSubscriptionId;
  }
  if (tier === 'pro') {
    user.subscriptionStartedAt = new Date().toISOString();
  }
  return user;
}

export function setStripeCustomerId(
  userId: string,
  customerId: string,
): User | undefined {
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;
  user.stripeCustomerId = customerId;
  return user;
}

export function getSubscriptionStats() {
  const allUsers = users.filter((u) => u.role === 'student');
  const proUsers = allUsers.filter((u) => u.subscriptionTier === 'pro');
  const freeUsers = allUsers.filter((u) => u.subscriptionTier === 'free');
  const mrr = proUsers.length * PRO_PRICE_CENTS;
  return {
    totalStudents: allUsers.length,
    proCount: proUsers.length,
    freeCount: freeUsers.length,
    mrrCents: mrr,
    churnRate: 0, // Would track cancellations over time in production
  };
}
