'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Auth callback page — handles ALL Supabase auth redirects client-side.
 * 
 * PKCE flow: the verifier is stored in localStorage by @supabase/ssr's
 * createBrowserClient. The code exchange MUST happen client-side where
 * localStorage is accessible. Server-side route handlers cannot access it.
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
      params.get('error_description') || params.get('error') ||
      (hash ? new URLSearchParams(hash.substring(1)).get('error_description') : null);
    if (errorDesc) {
      console.error('Auth error:', errorDesc);
      setStatus(`Sign-in issue: ${errorDesc}`);
      setTimeout(() => (window.location.href = '/login'), 3000);
      return;
    }

    // ---- PKCE code exchange (Google, Microsoft, magic links) ----
    const code = params.get('code');
    if (code) {
      console.log('Auth callback: exchanging PKCE code');
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

    // ---- OTP / magic link token_hash ----
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

    // ---- Implicit flow (#access_token) ----
    if (hash?.includes('access_token')) {
      console.log('Auth callback: implicit flow');
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 600));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setStatus('Setting up your account...');
          await redirectUser(supabase, session.user);
          return;
        }
      }
    }

    // ---- Fallback: check for existing session ----
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setStatus('Setting up your account...');
      await redirectUser(supabase, session.user);
      return;
    }

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
    const res = await fetch(`/api/auth/user-role?userId=${user.id}`);
    const { role: dbRole, displayName: dbName, hasAssessment, hasOnboarding } = res.ok
      ? await res.json()
      : { role: null, displayName: null, hasAssessment: false, hasOnboarding: false };

    const meta = user.user_metadata || {};
    const fullName = (meta.full_name || meta.name || '') as string;
    const pendingRole = localStorage.getItem('pending_role');
    const pendingSchool = localStorage.getItem('pending_school_id');

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

    localStorage.removeItem('pending_role');
    localStorage.removeItem('pending_school_id');
    localStorage.removeItem('pending_class_id');
    localStorage.removeItem('pending_birth_year');
    localStorage.removeItem('pending_student_name');

    if (isNewSignup) {
      if (role === 'student') { window.location.href = '/student/onboarding'; return; }
      if (role === 'teacher') { window.location.href = '/teacher/onboarding'; return; }
    }

    if (role === 'student' && !hasAssessment) {
      window.location.href = '/student/onboarding';
      return;
    }

    if (role === 'teacher' && !hasOnboarding) {
      window.location.href = '/teacher/onboarding';
      return;
    }

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
