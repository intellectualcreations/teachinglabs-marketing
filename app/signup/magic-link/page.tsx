'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, ChalkboardTeacher, UsersThree } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/supabase/types';

const ROLES: { value: UserRole; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { value: 'teacher', label: 'Teacher', icon: ChalkboardTeacher, color: '#1F3A5F' },
  { value: 'student', label: 'Student', icon: GraduationCap, color: '#4FA3A5' },
  { value: 'parent', label: 'Parent', icon: UsersThree, color: '#E8836B' },
];

export default function MagicLinkSignupPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!displayName.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName.trim(),
            role: role,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col items-center justify-center px-4 py-12">
      {/* Back */}
      <div className="w-full max-w-[420px] mb-4">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft weight="bold" size={16} />
          Back to signup options
        </Link>
      </div>

      <div className="w-full max-w-[420px] animate-[fadeUp_0.4s_ease-out]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 512 512" fill="none" className="w-6 h-6">
              <g transform="translate(156,106)">
                <rect x="60" y="0" width="80" height="300" fill="#FFF" />
                <rect x="40" y="0" width="160" height="80" fill="#FFF" />
                <circle cx="160" cy="200" r="40" fill="#4FA3A5" />
              </g>
            </svg>
          </div>
          <span className="font-heading font-bold text-xl text-text-primary">TeachingLabs</span>
        </Link>

        {!sent ? (
          <>
            <h1 className="font-heading text-2xl font-bold text-text-primary text-center mb-2">
              Create your account
            </h1>
            <p className="text-text-secondary text-[15px] text-center mb-8">
              We&apos;ll send you a magic link to get started.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Display name */}
              <div className="mb-4">
                <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setError(''); }}
                  placeholder="e.g. Ms. Johnson"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-teal bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-all"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@school.edu"
                  className={`w-full px-4 py-3 rounded-xl border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-all ${
                    error ? 'border-danger' : 'border-border focus:border-teal'
                  }`}
                />
              </div>

              {/* Role selector */}
              <div className="mb-6">
                <label className="block font-heading text-sm font-medium text-text-primary mb-2">
                  I am a...
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-teal bg-teal/5'
                            : 'border-border bg-surface dark:bg-card-bg hover:border-teal/40'
                        }`}
                      >
                        <Icon
                          weight={isSelected ? 'fill' : 'regular'}
                          size={24}
                          style={{ color: isSelected ? r.color : 'var(--text-secondary)' }}
                        />
                        <span className={`text-xs font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="mb-4 text-xs text-danger">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-teal hover:bg-teal/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-heading font-semibold text-[15px] transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending link...
                  </>
                ) : (
                  'Send magic link'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-text-secondary mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-teal font-medium hover:underline">
                Log in
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-2">
              Check your email
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              We sent a magic link to <span className="font-medium text-text-primary">{email}</span>.
              Click the link to finish creating your account.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); setDisplayName(''); }}
              className="text-sm text-teal font-medium hover:underline"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>

      {/* Legal */}
      <div className="mt-10 text-xs text-text-muted text-center max-w-md leading-relaxed">
        By creating an account, you agree to our{' '}
        <Link href="#" className="text-teal hover:underline">Terms of Service</Link>,{' '}
        <Link href="#" className="text-teal hover:underline">Privacy Policy</Link>, and{' '}
        <Link href="#" className="text-teal hover:underline">Data Protection Addendum</Link>.
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
