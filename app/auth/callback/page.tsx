'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Auth callback page — handles Supabase auth redirects:
 * 1. PKCE code exchange (?code=...)
 * 2. OTP/magic link token (?token_hash=...&type=...)
 * 3. OAuth implicit (#access_token=...)
 * 4. Error handling
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    // ---- Error check ----
    const errorDesc =
      params.get('error_description') ||
      (hash ? new URLSearchParams(hash.substring(1)).get('error_description') : null);
    if (errorDesc) {
      console.error('Auth error:', errorDesc);
      setStatus(`Sign-in issue: ${errorDesc}`);
      setTimeout(() => (window.location.href = '/login'), 3000);
      return;
    }

    // ---- Method 1: Server already exchanged the code (redirected with ?exchanged=true) ----
    if (params.get('exchanged') === 'true') {
      console.log('Auth callback: code already exchanged server-side');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setStatus('Setting up your account...');
        await redirectUser(supabase, session.user);
        return;
      }
      // Session might need a moment to propagate
      await new Promise((r) => setTimeout(r, 1000));
      const { data: { session: s2 } } = await supabase.auth.getSession();
      if (s2?.user) {
        setStatus('Setting up your account...');
        await redirectUser(supabase, s2.user);
        return;
      }
    }

    // ---- Method 1b: PKCE code exchange (fallback if route handler didn't catch it) ----
    const code = params.get('code');
    if (code) {
      console.log('Auth callback: exchanging PKCE code client-side');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Code exchange failed:', error.message);
        setStatus('Sign-in failed. Redirecting...');
        setTimeout(() => (window.location.href = '/login'), 2500);
        return;
      }
      if (data?.session?.user) {
        setStatus('Setting up your account...');
        await redirectUser(supabase, data.session.user);
        return;
      }
    }

    // ---- Method 2: OTP / magic link token_hash ----
    const tokenHash = params.get('token_hash');
    const type = params.get('type');
    if (tokenHash && type) {
      console.log('Auth callback: verifying token_hash, type:', type);
      const otpType = type === 'signup' ? 'email' : 'magiclink';
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });
      if (error) {
        console.error('verifyOtp failed:', error.message);
        // Try as the other type
        const altType = otpType === 'email' ? 'magiclink' : 'email';
        const { data: d2, error: e2 } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: altType,
        });
        if (e2 || !d2?.session?.user) {
          setStatus('Link expired or invalid. Redirecting...');
          setTimeout(() => (window.location.href = '/login'), 2500);
          return;
        }
        setStatus('Setting up your account...');
        await redirectUser(supabase, d2.session.user);
        return;
      }
      if (data?.session?.user) {
        setStatus('Setting up your account...');
        await redirectUser(supabase, data.session.user);
        return;
      }
    }

    // ---- Method 3: implicit flow (#access_token) ----
    if (hash?.includes('access_token')) {
      console.log('Auth callback: implicit flow');
      // Give Supabase time to process the hash and set the session
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, 600));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setStatus('Setting up your account...');
          await redirectUser(supabase, session.user);
          return;
        }
      }
    }

    // ---- Method 3b: implicit flow fallback (hash may have been consumed) ----
    if (hash) {
      console.log('Auth callback: checking session after hash');
      await new Promise((r) => setTimeout(r, 1500));
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setStatus('Setting up your account...');
        await redirectUser(supabase, session.user);
        return;
      }
    }

    // ---- Fallback: check for existing session ----
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setStatus('Setting up your account...');
      await redirectUser(supabase, session.user);
      return;
    }

    // Nothing worked
    setStatus('No session found. Redirecting to login...');
    setTimeout(() => (window.location.href = '/login'), 2500);
  }

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
    // Get role from admin API (bypasses RLS)
    const res = await fetch(`/api/auth/user-role?userId=${user.id}`);
    const { role: dbRole, displayName: dbName, hasAssessment } = res.ok
      ? await res.json()
      : { role: null, displayName: null, hasAssessment: false };

    const meta = user.user_metadata || {};
    const fullName = (meta.full_name || meta.name || '') as string;
    const pendingRole = localStorage.getItem('pending_role');
    const pendingSchool = localStorage.getItem('pending_school_id');

    // Update profile if there's pending signup data
    if (pendingRole || pendingSchool || fullName) {
      const updates: Record<string, string> = {};
      if (pendingRole && dbRole !== pendingRole) updates.role = pendingRole;
      if (pendingSchool) updates.school_id = pendingSchool;
      if (fullName && (!dbName || dbName.includes('@'))) {
        updates.display_name = fullName;
      }
      if (Object.keys(updates).length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('profiles') as any).update(updates).eq('id', user.id);
      }
    }

    const role: string = dbRole ?? pendingRole ?? 'student';
    const isNewSignup = !!pendingRole || !!localStorage.getItem('pending_school_id');

    // Enroll student in class if pending
    const pendingClassId = localStorage.getItem('pending_class_id');
    if (pendingClassId && role === 'student') {
      try {
        await fetch('/api/classes/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user.id, classId: pendingClassId }),
        });
      } catch (e) {
        console.error('Auto-enroll failed:', e);
      }
    }

    // Clean up localStorage
    localStorage.removeItem('pending_role');
    localStorage.removeItem('pending_school_id');
    localStorage.removeItem('pending_class_id');
    localStorage.removeItem('pending_birth_year');
    localStorage.removeItem('pending_student_name');

    // Route new signups to onboarding
    if (isNewSignup) {
      if (role === 'student') {
        window.location.href = '/student/onboarding';
        return;
      }
      if (role === 'teacher') {
        window.location.href = '/teacher/onboarding';
        return;
      }
    }

    // Returning students without assessment go to onboarding
    if (role === 'student' && !hasAssessment) {
      window.location.href = '/student/onboarding';
      return;
    }

    // Route to dashboard
    const dashboards: Record<string, string> = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      parent: '/parent/dashboard',
    };
    window.location.href = dashboards[role] || '/student/dashboard';
  } catch (err) {
    console.error('redirectUser error:', err);
    window.location.href = '/login';
  }
}
