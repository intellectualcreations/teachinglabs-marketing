import { randomUUID } from 'crypto';
import { users } from '@/lib/users';

// ── Types ──────────────────────────────────────────────

export interface UserPreferences {
  userId: string;
  emailDigest: boolean;
  digestFrequency: 'weekly' | 'daily' | 'never';
  unsubscribeToken: string;
}

// ── In-memory store ────────────────────────────────────

const preferences = new Map<string, UserPreferences>();
const tokenIndex = new Map<string, string>(); // token → userId

// ── Functions ──────────────────────────────────────────

export function getPreferences(userId: string): UserPreferences {
  let prefs = preferences.get(userId);
  if (!prefs) {
    const token = randomUUID();
    prefs = {
      userId,
      emailDigest: true,
      digestFrequency: 'weekly',
      unsubscribeToken: token,
    };
    preferences.set(userId, prefs);
    tokenIndex.set(token, userId);
  }
  return prefs;
}

export function updatePreferences(
  userId: string,
  updates: Partial<Pick<UserPreferences, 'emailDigest' | 'digestFrequency'>>,
): UserPreferences {
  const prefs = getPreferences(userId);
  if (updates.emailDigest !== undefined) {
    prefs.emailDigest = updates.emailDigest;
  }
  if (updates.digestFrequency !== undefined) {
    prefs.digestFrequency = updates.digestFrequency;
  }
  return prefs;
}

export function generateUnsubscribeToken(userId: string): string {
  const prefs = getPreferences(userId);
  // Remove old token from index
  tokenIndex.delete(prefs.unsubscribeToken);
  // Generate new token
  const token = randomUUID();
  prefs.unsubscribeToken = token;
  tokenIndex.set(token, userId);
  return token;
}

export function validateUnsubscribeToken(token: string): string | null {
  return tokenIndex.get(token) || null;
}

// ── Seed defaults for all demo users ───────────────────

function seed() {
  for (const user of users) {
    getPreferences(user.id);
  }
}

seed();
