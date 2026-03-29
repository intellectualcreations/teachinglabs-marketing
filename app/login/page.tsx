'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/shared/ThemeToggle';

function TeachingLabsLogo() {
  return (
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
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function ClassLinkIcon() {
  return (
    <span
      className="flex-shrink-0"
      style={{
        display: 'inline-grid',
        gridTemplateColumns: 'repeat(3, 6px)',
        gap: '2px',
        width: '20px',
        height: '20px',
        placeContent: 'center',
      }}
    >
      {[
        '#2196F3', '#4CAF50', '#FF9800',
        '#F44336', '#9C27B0', '#FFEB3B',
        '#009688', '#E91E63', '#607D8B',
      ].map((color, i) => (
        <span
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: color }}
        />
      ))}
    </span>
  );
}

type AuthMode = 'options' | 'magic-link';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('options');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
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

  function handleGoogleSignIn() {
    // Keep next-auth Google for now; will migrate later
    const { signIn } = require('next-auth/react');
    signIn('google', { callbackUrl: '/dashboard' });
  }

  function handleSSOLogin() {
    // Placeholder for Microsoft/ClassLink SSO
    window.location.href = '/teacher/dashboard';
  }

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Theme toggle */}
      <ThemeToggle className="absolute top-6 right-6" />

      {/* Back link */}
      <div className="w-full max-w-[420px] mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft weight="bold" size={16} />
          Back to home
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-[420px] animate-[fadeUp_0.4s_ease-out]">
        <TeachingLabsLogo />

        <h1 className="font-heading text-2xl font-bold text-text-primary text-center mb-2">
          Welcome back
        </h1>
        <p className="text-text-secondary text-[15px] text-center mb-8">
          Sign in to your account.
        </p>

        {mode === 'options' && !sent && (
          <>
            {/* SSO Buttons — Coming Soon */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                disabled
                className="relative flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg opacity-60 cursor-not-allowed font-heading text-sm font-medium text-text-primary"
              >
                <GoogleIcon />
                Sign in with Google
                <span className="absolute right-3 text-[10px] font-semibold uppercase tracking-wider text-teal bg-teal/10 px-2 py-0.5 rounded-full">Coming Soon</span>
              </button>
              <button
                disabled
                className="relative flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg opacity-60 cursor-not-allowed font-heading text-sm font-medium text-text-primary"
              >
                <MicrosoftIcon />
                Sign in with Microsoft
                <span className="absolute right-3 text-[10px] font-semibold uppercase tracking-wider text-teal bg-teal/10 px-2 py-0.5 rounded-full">Coming Soon</span>
              </button>
              <button
                disabled
                className="relative flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg opacity-60 cursor-not-allowed font-heading text-sm font-medium text-text-primary"
              >
                <ClassLinkIcon />
                Sign in with ClassLink
                <span className="absolute right-3 text-[10px] font-semibold uppercase tracking-wider text-teal bg-teal/10 px-2 py-0.5 rounded-full">Coming Soon</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Magic Link CTA */}
            <button
              onClick={() => setMode('magic-link')}
              className="w-full py-3.5 rounded-xl bg-teal hover:bg-teal/90 text-white font-heading font-semibold text-[15px] transition-colors"
            >
              Sign in with email link
            </button>
          </>
        )}

        {mode === 'magic-link' && !sent && (
          <form onSubmit={handleMagicLink}>
            <div className="mb-4">
              <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@school.edu"
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-all ${
                  error ? 'border-danger' : 'border-border focus:border-teal'
                }`}
              />
              {error && (
                <p className="mt-1.5 text-xs text-danger">{error}</p>
              )}
            </div>

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

            <button
              type="button"
              onClick={() => { setMode('options'); setError(''); }}
              className="w-full mt-3 py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              Back to all sign-in options
            </button>
          </form>
        )}

        {sent && (
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
              Click the link in your email to sign in.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); setMode('options'); }}
              className="text-sm text-teal font-medium hover:underline"
            >
              Use a different email
            </button>
          </div>
        )}

        {/* Footer */}
        {!sent && (
          <p className="text-center text-sm text-text-secondary mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-teal font-medium hover:underline">
              Create one
            </Link>
          </p>
        )}
      </div>

      {/* Legal */}
      <div className="mt-10 flex items-center gap-3 text-xs text-text-muted">
        <Link href="#" className="hover:text-text-secondary transition-colors">Terms of Service</Link>
        <span>·</span>
        <Link href="#" className="hover:text-text-secondary transition-colors">Privacy Policy</Link>
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
