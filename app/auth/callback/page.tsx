'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-side auth callback page.
 *
 * With implicit flow, Supabase redirects here with tokens in the URL hash:
 *   /auth/callback#access_token=...&refresh_token=...&type=signup
 *
 * This page detects the hash, sets the session, then routes the user
 * to onboarding or dashboard based on their role.
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient();
      const hash = window.location.hash;

      // Implicit flow: tokens arrive in hash fragment
      if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {
        // Supabase JS auto-detects and processes hash tokens when we call getSession
        // after the client is initialized. The createBrowserClient handles this.
        // Just wait a moment for it to process.
        await new Promise(r => setTimeout(r, 500));
      }

      // Check for error in hash (e.g. expired link)
      if (hash && hash.includes('error')) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDesc = params.get('error_description');
        console.error('Auth error:', errorDesc);
        setStatus('Link expired or invalid. Redirecting to signup...');
        setTimeout(() => {
          window.location.href = '/teacher/signup';
        }, 2000);
        return;
      }

      // Check for code in URL params (PKCE fallback)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Code exchange failed:', error.message);
          setStatus('Link expired or invalid. Redirecting to signup...');
          setTimeout(() => {
            window.location.href = '/teacher/signup';
          }, 2000);
          return;
        }
      }

      // Try to get the session (hash tokens should be processed by now)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        // One more try after a longer wait
        await new Promise(r => setTimeout(r, 1500));
        const { data: { session: retrySession } } = await supabase.auth.getSession();

        if (!retrySession?.user) {
          setStatus('Link expired or invalid. Redirecting to signup...');
          setTimeout(() => {
            window.location.href = '/teacher/signup';
          }, 2000);
          return;
        }

        setStatus('Setting up your account...');
        await redirectUser(supabase, retrySession.user);
        return;
      }

      setStatus('Setting up your account...');
      await redirectUser(supabase, session.user);
    }

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white dark:bg-[#0B1426]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary text-lg">{status}</p>
      </div>
    </div>
  );
}

async function redirectUser(
  supabase: ReturnType<typeof createClient>,
  user: { id: string; user_metadata?: Record<string, unknown> }
) {
  try {
    // Check profile for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role: string = (profile as { role?: string } | null)?.role ?? 'teacher';

    // New students go to onboarding
    if (role === 'student') {
      const onboarded = user.user_metadata?.onboarded === true;
      if (!onboarded) {
        window.location.href = '/student/onboarding';
        return;
      }
    }

    // New teachers go to soul quiz
    if (role === 'teacher') {
      const { data: soul } = await supabase
        .from('teacher_souls')
        .select('completed_at')
        .eq('teacher_id', user.id)
        .single() as { data: { completed_at: string | null } | null };

      if (!soul?.completed_at) {
        window.location.href = '/teacher/onboarding';
        return;
      }
    }

    const dashboards: Record<string, string> = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      parent: '/parent/dashboard',
    };

    window.location.href = dashboards[role] || '/teacher/dashboard';
  } catch {
    window.location.href = '/teacher/dashboard';
  }
}
