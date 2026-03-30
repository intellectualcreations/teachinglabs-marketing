'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Auth callback page — handles ALL Supabase auth redirects:
 *
 * 1. Hash fragment: #access_token=...  (implicit flow)
 * 2. Query param:   ?code=...          (PKCE flow)
 * 3. Query param:   ?token_hash=...    (custom email template)
 * 4. Error:         ?error=... or #error=...
 *
 * After authentication, routes to onboarding or dashboard.
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient();
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);

      // Log for debugging
      console.log('Auth callback - hash:', hash ? 'present' : 'none');
      console.log('Auth callback - search params:', window.location.search);

      // Check for error in hash or query
      if (hash?.includes('error') || params.get('error')) {
        const hashParams = hash ? new URLSearchParams(hash.substring(1)) : null;
        const errorDesc = params.get('error_description')
          || hashParams?.get('error_description')
          || 'Unknown error';
        console.error('Auth error:', errorDesc);
        setStatus('Link expired or invalid. Redirecting to signup...');
        setTimeout(() => { window.location.href = '/teacher/signup'; }, 2500);
        return;
      }

      // Method 1: token_hash from custom email template
      const tokenHash = params.get('token_hash');
      const type = params.get('type') as 'signup' | 'magiclink' | 'email' | undefined;
      if (tokenHash && type) {
        console.log('Auth callback - verifying token_hash, type:', type);
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type === 'signup' ? 'email' : 'magiclink',
        });
        if (error) {
          console.error('Token verification failed:', error.message);
          setStatus('Link expired or invalid. Redirecting to signup...');
          setTimeout(() => { window.location.href = '/teacher/signup'; }, 2500);
          return;
        }
        // Session is now set
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setStatus('Setting up your account...');
          await redirectUser(supabase, session.user);
          return;
        }
      }

      // Method 2: code from PKCE flow
      const code = params.get('code');
      if (code) {
        console.log('Auth callback - exchanging code');
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Code exchange failed:', error.message);
          setStatus('Link expired or invalid. Redirecting to signup...');
          setTimeout(() => { window.location.href = '/teacher/signup'; }, 2500);
          return;
        }
      }

      // Method 3: hash fragment with access_token (implicit flow)
      if (hash?.includes('access_token')) {
        console.log('Auth callback - hash has access_token, waiting for Supabase to process');
        // Supabase JS auto-detects hash tokens
        await new Promise(r => setTimeout(r, 1000));
      }

      // Check if we have a session now
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setStatus('Setting up your account...');
        await redirectUser(supabase, session.user);
        return;
      }

      // Last resort: listen for auth state change
      console.log('Auth callback - waiting for auth state change...');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            subscription.unsubscribe();
            setStatus('Setting up your account...');
            await redirectUser(supabase, session.user);
          }
        }
      );

      // Timeout after 8 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        setStatus('Link expired or invalid. Redirecting to signup...');
        setTimeout(() => { window.location.href = '/teacher/signup'; }, 2500);
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role: string = (profile as { role?: string } | null)?.role ?? 'teacher';

    if (role === 'student') {
      const onboarded = user.user_metadata?.onboarded === true;
      if (!onboarded) {
        window.location.href = '/student/onboarding';
        return;
      }
    }

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
