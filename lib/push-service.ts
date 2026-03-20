/**
 * Push notification service using web-push.
 * FLU-268: PWA push notifications
 *
 * VAPID keys are read from environment variables:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
 */

import webpush from 'web-push';
import { getSubscriptionsByUserId, type PushSubscriptionRecord } from './push-subscription-store';

let configured = false;

function ensureConfigured(): void {
  if (configured) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || 'mailto:support@teachinglabs.io';

  if (!publicKey || !privateKey) {
    console.warn('[Push] VAPID keys not configured. Push notifications disabled.');
    return;
  }

  webpush.setVapidDetails(email, publicKey, privateKey);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Send a push notification to all subscriptions for a given user.
 * Returns the number of notifications successfully sent.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  ensureConfigured();
  if (!configured) return 0;

  const subs = getSubscriptionsByUserId(userId);
  if (subs.length === 0) return 0;

  let sent = 0;
  const results = await Promise.allSettled(
    subs.map((sub) => sendToSubscription(sub, payload))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      sent++;
    } else {
      console.error('[Push] Failed to send:', result.reason);
    }
  }

  return sent;
}

/**
 * Send a push notification to a single subscription record.
 */
async function sendToSubscription(
  sub: PushSubscriptionRecord,
  payload: PushPayload
): Promise<void> {
  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  };

  await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
}

/**
 * Get the public VAPID key for client-side subscription.
 */
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}
