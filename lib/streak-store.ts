interface StreakData {
  userId: string;
  current: number;
  longest: number;
  lastActivity: Date | null;
}

const streaks = new Map<string, StreakData>();

export function updateStreak(userId: string): StreakData {
  const now = new Date();
  const s = streaks.get(userId) || { userId, current: 0, longest: 0, lastActivity: null };
  if (!s.lastActivity) {
    s.current = 1;
  } else {
    const hoursSince = (now.getTime() - s.lastActivity.getTime()) / 3600000;
    if (hoursSince < 48) {
      s.current += 1;
    } else {
      s.current = 1;
    }
  }
  s.longest = Math.max(s.longest, s.current);
  s.lastActivity = now;
  streaks.set(userId, s);
  return s;
}

export function getStreak(userId: string): StreakData {
  return streaks.get(userId) || { userId, current: 0, longest: 0, lastActivity: null };
}

export function getAllStreaks(): StreakData[] {
  return Array.from(streaks.values());
}
