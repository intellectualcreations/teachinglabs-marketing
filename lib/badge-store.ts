export type BadgeType = 'FIRST_LESSON' | 'COURSE_COMPLETE' | 'STREAK_7' | 'STREAK_30' | 'TOP_STUDENT';

export interface Badge {
  userId: string;
  type: BadgeType;
  awardedAt: Date;
  courseId?: string;
}

const badges: Badge[] = [];

export function awardBadge(userId: string, type: BadgeType, courseId?: string): Badge {
  if (hasBadge(userId, type, courseId)) {
    return badges.find(b => b.userId === userId && b.type === type && b.courseId === courseId)!;
  }
  const b: Badge = { userId, type, awardedAt: new Date(), courseId };
  badges.push(b);
  return b;
}

export function getUserBadges(userId: string): Badge[] {
  return badges.filter(b => b.userId === userId);
}

export function hasBadge(userId: string, type: BadgeType, courseId?: string): boolean {
  return badges.some(b => b.userId === userId && b.type === type && b.courseId === courseId);
}

export function getAllBadges(): Badge[] { return badges; }
