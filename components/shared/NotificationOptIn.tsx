'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellSlash, CheckCircle } from '@phosphor-icons/react';

type OptInState = 'loading' | 'unsupported' | 'denied' | 'prompt' | 'subscribed';

/**
 * Notification opt-in banner.
 * FLU-268: PWA push notifications
 *
 * Shows a prompt to enable push notifications. Once subscribed,
 * persists state in localStorage so it doesn't re-prompt.
 */
export default function NotificationOptIn() {
  const [state, setState] = useState<OptInState>('loading');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed or subscribed
    const stored = localStorage.getItem('tl-push-opt-in');
    if (stored === 'subscribed' || stored === 'dismissed') {
      setState(stored === 'subscribed' ? 'subscribed' : 'prompt');
      if (stored === 'dismissed') setDismissed(true);
      return;
    }

    // Check browser support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }

    // Check current permission
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }

    if (Notification.permission === 'granted') {
      // Check if we have an active subscription
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setState(sub ? 'subscribed' : 'prompt');
        });
      });
      return;
    }

    setState('prompt');
  }, []);

  const handleSubscribe = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState('denied');
        return;
      }

      // Get VAPID public key
      const keyRes = await fetch('/api/push/vapid-key');
      if (!keyRes.ok) {
        console.error('[Push] Failed to get VAPID key');
        return;
      }
      const { publicKey } = await keyRes.json();

      // Subscribe via service worker
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const subJson = subscription.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          },
        }),
      });

      if (res.ok) {
        setState('subscribed');
        localStorage.setItem('tl-push-opt-in', 'subscribed');
      }
    } catch (err) {
      console.error('[Push] Subscription failed:', err);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem('tl-push-opt-in', 'dismissed');
  }, []);

  // Don't render if unsupported, already subscribed, or dismissed
  if (state === 'loading' || state === 'unsupported' || dismissed) return null;

  if (state === 'subscribed') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
        <CheckCircle size={20} weight="fill" />
        <span>Notifications enabled. You will receive lesson reminders.</span>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        <BellSlash size={20} />
        <span>Notifications blocked. Enable them in your browser settings to receive lesson reminders.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-navy/5 dark:bg-navy/20 border border-navy/10 dark:border-navy/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 dark:bg-navy/30">
          <Bell size={20} className="text-navy dark:text-teal" weight="fill" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Enable lesson reminders
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Get notified when your lessons are about to start.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDismiss}
          className="rounded-md px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Later
        </button>
        <button
          onClick={handleSubscribe}
          className="rounded-md bg-navy px-4 py-1.5 text-xs font-medium text-white hover:bg-navy/90 transition-colors"
        >
          Enable
        </button>
      </div>
    </div>
  );
}

/**
 * Convert a base64-encoded VAPID key to Uint8Array for PushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}
