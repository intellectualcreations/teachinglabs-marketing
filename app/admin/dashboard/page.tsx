'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, PaperPlaneTilt, Buildings, ChartBar, Users, Shield, Database } from '@phosphor-icons/react';

const COMING_FEATURES = [
  { icon: ChartBar, label: 'District-wide analytics and reporting' },
  { icon: Users, label: 'Teacher onboarding and management' },
  { icon: Buildings, label: 'School-level usage dashboards' },
  { icon: Shield, label: 'FERPA/COPPA compliance monitoring' },
  { icon: Database, label: 'Roster sync and student data management' },
];

export default function AdminDashboardPage() {
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!feedback.trim()) {
      setFeedbackError(true);
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col items-center justify-center px-4 py-16">

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

      {/* Card */}
      <div className="w-full max-w-[560px] bg-surface dark:bg-card-bg border border-border rounded-[20px] overflow-hidden relative animate-[fadeUp_0.4s_ease-out]">

        {/* Top accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #F59E0B, #4FA3A5)' }} />

        <div className="px-8 py-10 pt-12">

          {/* Check icon */}
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle weight="fill" size={40} style={{ color: '#059669' }} />
          </div>

          {/* Title */}
          <h1 className="font-heading text-2xl font-extrabold text-text-primary text-center mb-2">
            Thanks for creating your account!
          </h1>
          <p className="text-text-secondary text-[15px] text-center mb-6">
            Your administrator profile has been saved.
          </p>

          {/* Coming Soon badge */}
          <div className="flex justify-center mb-6">
            <span
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-heading text-[13px] font-bold"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706' }}
            >
              🚧 Administration Portal Coming Soon
            </span>
          </div>

          <p className="text-[15px] text-text-primary leading-[1.7] text-center mb-6">
            We&apos;re building the admin portal right now and will let you know as soon as it&apos;s ready. You&apos;ll be among the first to access it.
          </p>

          {/* Features list */}
          <div className="rounded-xl border border-border bg-bg-secondary dark:bg-[#1E2A3A] p-5 mb-8">
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-3">
              What&apos;s coming for administrators
            </p>
            <div className="flex flex-col gap-0.5">
              {COMING_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#F59E0B' }} />
                  <span className="text-sm text-text-primary">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-7" />

          {/* Feedback form */}
          {!submitted ? (
            <div>
              <h2 className="font-heading text-base font-bold text-text-primary mb-1">
                What do you want to see?
              </h2>
              <p className="text-[13px] text-text-secondary mb-4">
                Tell us what features matter most to you as an administrator. Your input shapes what we build.
              </p>
              <textarea
                value={feedback}
                onChange={(e) => { setFeedback(e.target.value); setFeedbackError(false); }}
                placeholder="As an administrator, I'd love to be able to..."
                rows={4}
                className={`w-full px-4 py-3.5 rounded-xl border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm resize-y outline-none focus:ring-2 focus:ring-teal/30 transition-all ${feedbackError ? 'border-danger' : 'border-border focus:border-teal'}`}
              />
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 mt-4 px-7 py-3 rounded-xl bg-navy hover:bg-navy/90 text-white font-heading font-bold text-sm transition-colors"
              >
                Send Feedback
                <PaperPlaneTilt weight="fill" size={16} />
              </button>
            </div>
          ) : (
            <div className="text-center py-5 animate-[fadeUp_0.3s_ease-out]">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-heading font-bold text-base" style={{ color: '#059669' }}>
                Thank you for your feedback!
              </p>
              <p className="text-[13px] text-text-secondary mt-1">
                We&apos;ll use this to shape the administrator experience.
              </p>
            </div>
          )}

          {/* Footer */}
          <p className="text-[13px] text-text-secondary text-center mt-8">
            Questions? Reach out at{' '}
            <a href="mailto:support@teachinglabs.com" className="text-teal font-semibold hover:underline">
              support@teachinglabs.com
            </a>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
