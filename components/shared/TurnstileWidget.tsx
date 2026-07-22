'use client';

import { useEffect, useRef } from 'react';

// Whether Turnstile is active on the client. When the public site key isn't
// configured, the widget renders nothing and forms submit as before (the
// server also skips verification), so the site keeps working without keys.
export const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile widget. Calls `onToken` with the solved token (or '' when
 * it expires/errors). Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset.
 */
export default function TurnstileWidget({
  onToken,
  theme = 'auto',
}: {
  onToken: (token: string) => void;
  theme?: 'auto' | 'light' | 'dark';
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Keep the latest callback without re-running the render effect below.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const timer = setInterval(() => {
      if (cancelled) return;
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
          'error-callback': () => onTokenRef.current(''),
        });
        clearInterval(timer);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* no-op */
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="mt-2" />;
}
