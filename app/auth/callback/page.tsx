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
      // Small delay to avoid auth lock race with other components
      await new Promise(r => setTimeout(r, 300));
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
        setStatus(`Sign-in issue: ${errorDesc}. Redirecting to login...`);
        setTimeout(() => { window.location.href = '/login'; }, 3000);
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
          setStatus('Link expired or invalid. Redirecting to login...');
          const signupRole = localStorage.getItem('pending_role');
          const dest = signupRole === 'student' ? '/student/signup' : '/login';
          setTimeout(() => { window.location.href = dest; }, 2500);
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
        console.log('Auth callback - exchanging code for session');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Code exchange failed:', error.message);
          // Don't give up yet — check if session exists anyway
        }
        if (data?.session?.user) {
          setStatus('Setting up your account...');
          await redirectUser(supabase, data.session.user);
          return;
        }
      }

      // Method 3: hash fragment with access_token (implicit flow)
      if (hash?.includes('access_token')) {
        console.log('Auth callback - hash has access_token, waiting for Supabase to process');
        await new Promise(r => setTimeout(r, 1500));
      }

      // Check if we have a session now (covers both flows)
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

      // Timeout after 12 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        setStatus('Taking longer than expected. Redirecting to login...');
        setTimeout(() => { window.location.href = '/login'; }, 2500);
      }, 15000);
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
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> }
) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single();

    // Ensure profile has correct role and display name
    const meta = user.user_metadata || {};
    const fullName = (meta.full_name || meta.name || '') as string;
    const pendingRole = localStorage.getItem('pending_role');
    const pendingSchool = localStorage.getItem('pending_school_id');

    // Update profile if it needs fixing (role from signup, or missing display name)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    if (pendingRole && (!profile || (profile as { role?: string })?.role !== pendingRole)) {
      updates.role = pendingRole;
    }
    const currentName = (profile as { display_name?: string } | null)?.display_name || '';
    // Update display name if it's missing, is an email address, or we have a better name from SSO
    if (fullName && (!currentName || currentName.includes('@'))) {
      updates.display_name = fullName;
    }
    if (pendingSchool) {
      updates.school_id = pendingSchool;
    }
    if (Object.keys(updates).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('profiles') as any).update(updates).eq('id', user.id);
    }

    const profileRole = (profile as { role?: string } | null)?.role;
    const role: string = profileRole ?? pendingRole ?? 'teacher';

    // Check if this is a new signup (came from signup page)
    const isNewSignup = pendingRole || localStorage.getItem('pending_school_id');

    // Clean up localStorage signup flags
    localStorage.removeItem('pending_role');
    localStorage.removeItem('pending_school_id');

    if (isNewSignup) {
      // New signups go through onboarding
      if (role === 'student') {
        window.location.href = '/student/onboarding';
        return;
      }
      if (role === 'teacher') {
        window.location.href = '/teacher/onboarding';
        return;
      }
    }

    // For returning students: check if they've completed the baseline assessment
    if (role === 'student') {
      try {
        const { data: assessment } = await supabase
          .from('student_assessments')
          .select('completed_at')
          .eq('student_id', user.id)
          .single() as { data: { completed_at: string | null } | null };
        if (!assessment?.completed_at) {
          // No assessment completed — send back to onboarding
          window.location.href = '/student/onboarding';
          return;
        }
      } catch {
        // Table might not exist or query failed — send to onboarding to be safe
        window.location.href = '/student/onboarding';
        return;
      }
    }

    // Existing users go to their role-appropriate dashboard
    const dashboards: Record<string, string> = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      parent: '/parent/dashboard',
    };

    window.location.href = dashboards[role] || (role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
  } catch {
    window.location.href = '/login';
  }
}
