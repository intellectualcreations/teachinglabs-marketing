/**
 * Client-side authenticated fetch.
 *
 * The browser Supabase client uses a custom storageKey ('sb-auth-token' in
 * localStorage) and the PKCE flow, so auth cookies are NOT sent with fetch()
 * calls to our /api/* routes. This helper reads the current access token
 * from the browser Supabase session and attaches it as
 * `Authorization: Bearer <access_token>` so that server-side
 * `requireTeacher` / `requireStudent` / `requireAuth` can identify the caller.
 *
 * Usage:
 *   import { authFetch } from '@/lib/api-fetch';
 *   const res = await authFetch('/api/teacher/courses');
 *
 * If there is no active session (e.g. login/signup pages) the helper
 * transparently falls back to a plain `fetch`.
 */

import { createClient } from '@/lib/supabase/client';

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  // Only run on the client — on the server this should not be called.
  if (typeof window === 'undefined') {
    return fetch(input, init);
  }

  let accessToken: string | null = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    accessToken = data.session?.access_token ?? null;
  } catch {
    // If we can't read a session (e.g. during bootstrap), fall back to
    // an unauthenticated request. The server will return 401 if auth is
    // actually required, and public pages (login/signup) keep working.
    accessToken = null;
  }

  // Preserve any caller-provided headers. Support both Headers instance and
  // plain object / array-of-tuples forms.
  const headers = new Headers(init.headers || undefined);
  if (accessToken && !headers.has('authorization')) {
    headers.set('authorization', `Bearer ${accessToken}`);
  }

  return fetch(input, { ...init, headers });
}

export default authFetch;
