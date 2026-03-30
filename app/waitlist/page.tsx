'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Sparkle, Users, Eye, Megaphone, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import ScrollReveal from '@/components/shared/ScrollReveal';
import ThemeToggle from '@/components/shared/ThemeToggle';

const GRADE_LEVELS = [
  'Pre-K', 'Kindergarten',
  '1st', '2nd', '3rd', '4th', '5th', '6th',
  '7th', '8th', '9th', '10th', '11th', '12th',
];

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming',
];

const FEATURES = [
  {
    icon: Sparkle,
    title: 'Build Your Teaching Twin',
    description: 'An AI assistant that teaches the way YOU do, trained on your style, your explanations, your approach.',
  },
  {
    icon: Users,
    title: 'Help Every Student',
    description: 'Your twin is available 24/7 to answer questions in your voice, so no student falls behind.',
  },
  {
    icon: Eye,
    title: 'Stay In The Loop',
    description: 'See every conversation and get alerts when students need you. Always in control.',
  },
  {
    icon: Megaphone,
    title: 'Shape The Future',
    description: 'Your feedback directly shapes what we build next. Early access means real influence.',
  },
];

function TeachingLabsLogo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 512 512" fill="none" className="w-6 h-6">
          <g transform="translate(156,106)">
            <rect x="60" y="0" width="80" height="300" fill="#FFF" />
            <rect x="40" y="0" width="160" height="80" fill="#FFF" />
            <circle cx="160" cy="200" r="40" fill="#4FA3A5" />
          </g>
        </svg>
      </div>
      <span className="font-heading font-bold text-xl text-white">TeachingLabs</span>
    </Link>
  );
}

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    schoolName: '',
    gradeLevel: '',
    state: '',
    howHeard: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'duplicate'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
      } else if (res.status === 409) {
        setStatus('duplicate');
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Something went wrong.');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426]">
      <ScrollReveal />

      {/* ── Nav ── */}
      <nav className="bg-[#1F3A5F] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <TeachingLabsLogo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-[#1F3A5F] overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute w-[400px] h-[400px] rounded-full top-[-100px] right-[-50px] opacity-[0.08]"
            style={{ background: '#4FA3A5', filter: 'blur(80px)' }}
          />
          <div
            className="absolute w-[300px] h-[300px] rounded-full bottom-[-80px] left-[10%] opacity-[0.06]"
            style={{ background: '#F0C95D', filter: 'blur(80px)' }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
          {/* Badge */}
          <div className="fade-up inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#4FA3A5] animate-pulse" />
            <span className="text-xs font-heading font-semibold tracking-wide uppercase text-white/90">
              Limited Early Access
            </span>
          </div>

          <h1 className="fade-up font-heading font-extrabold text-white tracking-[-1.5px] leading-[1.12] mb-6 text-3xl md:text-5xl">
            Be One of the First Teachers to Experience Teaching Labs
          </h1>

          <p className="fade-up text-white/75 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-body">
            We&apos;re inviting a small group of teachers to test our AI-powered teaching assistant
            before we open to everyone. Join the waitlist and be among the first to build your Teaching Twin.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <div className="fade-up text-center mb-12">
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-3">
            <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
            What You&apos;ll Get
          </div>
          <h2 className="font-heading font-bold text-text-primary text-2xl md:text-3xl tracking-[-0.5px]">
            Early access to the future of teaching
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="fade-up bg-card-bg rounded-2xl p-8 border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mb-4">
                  <Icon size={24} weight="duotone" className="text-teal" />
                </div>
                <h3 className="font-heading font-semibold text-text-primary text-[16.5px] mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-[15px] leading-[1.7]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Form / Success ── */}
      <section className="max-w-2xl mx-auto px-6 pb-20" id="signup">
        {status === 'success' || status === 'duplicate' ? (
          <div className="fade-up bg-card-bg rounded-2xl border border-border p-10 md:p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} weight="duotone" className="text-teal" />
            </div>
            <h2 className="font-heading font-bold text-text-primary text-2xl md:text-3xl mb-4">
              {status === 'success' ? "You're on the list! 🎉" : "You're already on the list! 🎉"}
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto mb-8">
              {status === 'success'
                ? "We'll email you when it's your turn. In the meantime, tell a fellow teacher about Teaching Labs."
                : "We already have your email. Sit tight, we'll reach out when it's your turn."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-teal font-heading font-semibold text-sm hover:underline"
            >
              Learn more about Teaching Labs
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        ) : (
          <div className="fade-up bg-card-bg rounded-2xl border border-border p-8 md:p-12 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-text-primary text-2xl md:text-3xl tracking-[-0.5px] mb-2">
                Join the Waitlist
              </h2>
              <p className="text-text-secondary text-[15px]">
                Takes less than a minute. No spam, ever.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-1.5">
                    First name <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-warm-white dark:bg-[#0B1426] px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-1.5">
                    Last name <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-warm-white dark:bg-[#0B1426] px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors"
                    placeholder="Smith"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
                  Email <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-warm-white dark:bg-[#0B1426] px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors"
                  placeholder="jane@school.edu"
                />
              </div>

              {/* School name */}
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-text-primary mb-1.5">
                  School name <span className="text-text-secondary/60 text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-warm-white dark:bg-[#0B1426] px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors"
                  placeholder="Lincoln Elementary"
                />
              </div>

              {/* Grade + State row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gradeLevel" className="block text-sm font-medium text-text-primary mb-1.5">
                    Grade level <span className="text-text-secondary/60 text-xs font-normal">(optional)</span>
                  </label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-warm-white dark:bg-[#0B1426] px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors appearance-none"
                  >
                    <option value="">Select grade</option>
                    {GRADE_LEVELS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-text-primary mb-1.5">
                    State <span className="text-text-secondary/60 text-xs font-normal">(optional)</span>
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-warm-white dark:bg-[#0B1426] px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors appearance-none"
                  >
                    <option value="">Select state</option>
                    {US_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* How heard */}
              <div>
                <label htmlFor="howHeard" className="block text-sm font-medium text-text-primary mb-1.5">
                  How did you hear about us? <span className="text-text-secondary/60 text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="howHeard"
                  name="howHeard"
                  type="text"
                  value={formData.howHeard}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-warm-white dark:bg-[#0B1426] px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors"
                  placeholder="A colleague, social media, conference..."
                />
              </div>

              {/* Error message */}
              {status === 'error' && (
                <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-xl px-4 py-3 text-sm text-[#FF6B6B]">
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-teal hover:bg-teal/90 text-white font-heading font-semibold text-base py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {status === 'submitting' ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    Joining...
                  </span>
                ) : (
                  'Join the Waitlist'
                )}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card-bg">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
          <p>Questions? <a href="mailto:hello@teachinglabs.com" className="text-teal hover:underline">hello@teachinglabs.com</a></p>
          <p>&copy; 2026 Teaching Labs by Intellectual Creations</p>
        </div>
      </footer>
    </div>
  );
}
