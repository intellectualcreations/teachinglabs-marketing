'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-side auth callback page.
 *
 * Supabase email links (confirm signup / magic link) redirect here.
 * The auth tokens arrive in the URL hash fragment (#access_token=...),
 * which only the browser can read. This page:
 *   1. Lets Supabase JS detect the hash and set the session automatically
 *   2. Looks up the user's role in the profiles table
 *   3. Redirects to the appropriate onboarding or dashboard page
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient();

      // Supabase JS auto-detects hash fragments and exchanges them for a session.
      // We just need to listen for the auth state change.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            subscription.unsubscribe();
            setStatus('Setting up your account...');
            await redirectUser(supabase, session.user);
          }
        }
      );

      // Also check if there's already a session (e.g. code exchange already happened)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        subscription.unsubscribe();
        setStatus('Setting up your account...');
        await redirectUser(supabase, session.user);
        return;
      }

      // If hash has tokens, Supabase will pick them up via onAuthStateChange above.
      // If not, and there's a code in the URL params, try exchanging it.
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Code exchange failed:', error.message);
          setStatus('Link expired or invalid. Please sign up again.');
          setTimeout(() => {
            window.location.href = '/teacher/signup';
          }, 3000);
          return;
        }
        // Session will be picked up by onAuthStateChange
      }

      // Give it a few seconds to process, then show error
      setTimeout(() => {
        setStatus('Link may have expired. Redirecting to signup...');
        setTimeout(() => {
          window.location.href = '/teacher/signup';
        }, 2000);
      }, 8000);
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
