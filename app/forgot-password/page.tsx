'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, EnvelopeSimple } from '@phosphor-icons/react';

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resendConfirmed, setResendConfirmed] = useState(false);

  function handleSubmit() {
    if (!email.trim()) {
      setEmailError(true);
      return;
    }
    setSubmittedEmail(email.trim());
    setSubmitted(true);
    window.scrollTo(0, 0);
  }

  function handleResend() {
    setResendConfirmed(true);
    setTimeout(() => setResendConfirmed(false), 3000);
  }

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col items-center justify-center px-4 py-12">

      {/* Back link */}
      <div className="w-full max-w-[420px] mb-4">
        {submitted ? (
          <button
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft weight="bold" size={16} />
            Back to sign in
          </button>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft weight="bold" size={16} />
            Back to sign in
          </Link>
        )}
      </div>

      <div className="w-full max-w-[420px]">
        <TeachingLabsLogo />

        {!submitted ? (
          /* Form state */
          <div className="animate-[fadeUp_0.4s_ease-out]">
            <h1 className="font-heading text-2xl font-bold text-text-primary text-center mb-2">
              Reset your password
            </h1>
            <p className="text-text-secondary text-[15px] text-center mb-8 leading-relaxed">
              Enter the email address you used to create your account. We&apos;ll send you a link to reset your password.
            </p>

            <div className="mb-2">
              <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="you@school.edu"
                className={`w-full px-4 py-3 rounded-xl border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-all ${
                  emailError ? 'border-danger' : 'border-border focus:border-teal'
                }`}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-4 py-3.5 rounded-xl bg-navy hover:bg-navy/90 text-white font-heading font-semibold text-[15px] transition-colors"
            >
              Send reset link
            </button>

            <p className="text-center text-sm text-text-secondary mt-6">
              Remember your password?{' '}
              <Link href="/login" className="text-teal font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          /* Sent state */
          <div className="animate-[fadeUp_0.3s_ease-out] text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle weight="fill" size={36} style={{ color: '#059669' }} />
            </div>

            <h1 className="font-heading text-2xl font-bold text-text-primary mb-3">
              Check your email
            </h1>

            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-teal mb-4"
              style={{ background: 'rgba(79,163,165,0.1)' }}>
              {submittedEmail}
            </span>

            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              If an account exists with that email, we&apos;ve sent a password reset link. Check your inbox (and your spam folder, just in case).
            </p>

            <p className="text-[13px] text-text-secondary mb-1">
              Didn&apos;t get it?{' '}
              <button
                onClick={handleResend}
                className="text-teal font-medium hover:underline cursor-pointer"
              >
                Send again
              </button>
            </p>

            {resendConfirmed && (
              <p className="text-[13px] font-semibold mt-2" style={{ color: '#059669' }}>
                ✓ Sent again!
              </p>
            )}

            <div className="mt-6">
              <Link
                href="/login"
                className="block w-full py-3.5 rounded-xl bg-navy hover:bg-navy/90 text-white font-heading font-semibold text-[15px] text-center transition-colors"
              >
                Back to sign in
              </Link>
            </div>

            <div className="flex items-center gap-3 mt-6 justify-center">
              <EnvelopeSimple size={14} className="text-text-muted" />
              <span className="text-[13px] text-text-muted">
                Check spam if you don&apos;t see it within a few minutes
              </span>
            </div>
          </div>
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
