'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, PaperPlaneTilt, ChartLine, ChatCircle, House, Bell } from '@phosphor-icons/react';

const COMING_FEATURES = [
  { icon: ChartLine, label: "Weekly progress reports on your child's learning" },
  { icon: ChatCircle, label: 'Direct messaging with your child\'s teacher' },
  { icon: House, label: '"Help at home" suggestions based on class topics' },
  { icon: Bell, label: 'Alerts when your child needs extra support' },
];

const CORAL = '#E8836B';

export default function ParentDashboardPage() {
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

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${CORAL}, #4FA3A5)` }} />

        <div className="px-8 py-10 pt-12">

          {/* Check icon */}
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle weight="fill" size={40} style={{ color: '#059669' }} />
          </div>

          {/* Title */}
          <h1 className="font-heading text-2xl font-extrabold text-text-primary text-center mb-2">
            You&apos;re connected!
          </h1>
          <p className="text-text-secondary text-[15px] text-center mb-6">
            Your parent account has been created and linked to Emma&apos;s class.
          </p>

          {/* Coming Soon badge */}
          <div className="flex justify-center mb-6">
            <span
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-heading text-[13px] font-bold"
              style={{ background: `rgba(232,131,107,0.1)`, color: '#C75B3A' }}
            >
              🚧 Parent Dashboard Coming Soon
            </span>
          </div>

          <p className="text-[15px] text-text-primary leading-[1.7] text-center mb-6">
            We&apos;re building your parent portal now. Soon you&apos;ll have a beautiful view into your child&apos;s learning journey.
          </p>

          {/* Features list */}
          <div className="rounded-xl border border-border bg-bg-secondary dark:bg-[#1E2A3A] p-5 mb-8">
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-3">
              What&apos;s coming for parents
            </p>
            <div className="flex flex-col gap-0.5">
              {COMING_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 py-2">
                  <Icon weight="fill" size={16} style={{ color: CORAL }} className="flex-shrink-0" />
                  <span className="text-sm text-text-primary">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Child info preview */}
          <div className="rounded-xl border p-4 mb-8 flex items-center gap-4"
            style={{ borderColor: `rgba(232,131,107,0.3)`, background: `rgba(232,131,107,0.04)` }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-heading font-bold text-base text-white flex-shrink-0"
              style={{ background: CORAL }}>
              EJ
            </div>
            <div>
              <div className="font-heading font-semibold text-[15px] text-text-primary">Emma Johnson</div>
              <div className="text-[13px] text-text-secondary">5th Grade Math · Lincoln Elementary</div>
              <div className="text-[12px] text-text-muted mt-0.5">Mrs. Jane Martinez</div>
            </div>
            <div className="ml-auto text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
              ✓ Connected
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-7" />

          {/* Feedback form */}
          {!submitted ? (
            <div>
              <h2 className="font-heading text-base font-bold text-text-primary mb-1">
                What would help you most?
              </h2>
              <p className="text-[13px] text-text-secondary mb-4">
                Tell us what features matter most to you as a parent. We build what you need.
              </p>
              <textarea
                value={feedback}
                onChange={(e) => { setFeedback(e.target.value); setFeedbackError(false); }}
                placeholder="As a parent, the most important thing to me is..."
                rows={4}
                className={`w-full px-4 py-3.5 rounded-xl border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm resize-y outline-none transition-all ${feedbackError ? 'border-danger' : 'border-border'}`}
                style={{ outlineColor: CORAL }}
              />
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 mt-4 px-7 py-3 rounded-xl font-heading font-bold text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: CORAL }}
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
                We&apos;ll use this to build the best parent experience possible.
              </p>
            </div>
          )}

          {/* Footer */}
          <p className="text-[13px] text-text-secondary text-center mt-8">
            Questions? Reach out at{' '}
            <a href="mailto:support@teachinglabs.com" className="font-semibold hover:underline" style={{ color: '#4FA3A5' }}>
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
