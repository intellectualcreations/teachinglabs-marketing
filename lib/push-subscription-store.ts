/**
 * In-memory push subscription store.
 * FLU-268: PWA push notifications
 *
 * Mirrors the pattern used by notification-store.ts and enrollment-store.ts.
 */

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
}

// In-memory store — resets on server restart (fine for demo)
const subscriptions = new Map<string, PushSubscriptionRecord>();

let nextId = 1;

function generateId(): string {
  return `push_${nextId++}`;
}

/**
 * Save a push subscription for a user.
 * If the same endpoint already exists for this user, update it.
 */
export function savePushSubscription(
  userId: string,
  endpoint: string,
  p256dh: string,
  auth: string
): PushSubscriptionRecord {
  // Check for existing subscription with same endpoint
  for (const [, sub] of subscriptions) {
    if (sub.userId === userId && sub.endpoint === endpoint) {
      sub.p256dh = p256dh;
      sub.auth = auth;
      return sub;
    }
  }

  const record: PushSubscriptionRecord = {
    id: generateId(),
    userId,
    endpoint,
    p256dh,
    auth,
    createdAt: new Date().toISOString(),
  };

  subscriptions.set(record.id, record);
  return record;
}

/**
 * Remove a push subscription by endpoint for a user.
 */
export function removePushSubscription(userId: string, endpoint: string): boolean {
  for (const [id, sub] of subscriptions) {
    if (sub.userId === userId && sub.endpoint === endpoint) {
      subscriptions.delete(id);
      return true;
    }
  }
  return false;
}

/**
 * Get all push subscriptions for a user.
 */
export function getSubscriptionsByUserId(userId: string): PushSubscriptionRecord[] {
  return Array.from(subscriptions.values()).filter((s) => s.userId === userId);
}

/**
 * Get all push subscriptions (for bulk notification sends).
 */
export function getAllSubscriptions(): PushSubscriptionRecord[] {
  return Array.from(subscriptions.values());
}

/**
 * Check if a user has any active push subscriptions.
 */
export function hasSubscription(userId: string): boolean {
  return Array.from(subscriptions.values()).some((s) => s.userId === userId);
}
