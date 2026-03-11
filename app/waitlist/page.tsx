'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';

const ROTATING_WORDS = [
  'Personalized to every student',
  'Adaptive to every level',
  'Safe for every classroom',
  'Built by a teacher, for teachers',
];

export default function WaitlistPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);

  // Rotate words
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend/API
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-warm-white text-text-secondary overflow-x-hidden" style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-2xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 97%, transparent)' }}>
        <div className="max-w-[1200px] mx-auto px-12 h-[72px] flex items-center justify-between max-md:px-6">
          <Link href="/" className="font-heading text-[22px] font-bold text-text-primary">
            Teaching Labs
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle className="border-border text-text-secondary hover:text-text-primary hover:border-navy" />
            <Link href="/" className="font-heading text-sm font-medium text-text-secondary hover:text-gold transition-colors duration-200">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-72px)] flex items-center justify-center overflow-hidden">
        {/* Background blobs matching landing page */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="blob-teal absolute w-[600px] h-[600px] rounded-full top-[5%] left-[10%] max-md:w-[300px] max-md:h-[300px] opacity-[0.08] dark:opacity-[0.15]"
            style={{ background: '#4FA3A5', filter: 'blur(100px)' }} />
          <div className="blob-gold absolute w-[500px] h-[500px] rounded-full top-[20%] right-[5%] max-md:w-[280px] max-md:h-[280px] opacity-[0.10] dark:opacity-[0.12]"
            style={{ background: '#F0C95D', filter: 'blur(100px)' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full bottom-[10%] left-[30%] opacity-0 dark:opacity-[0.06] max-md:hidden"
            style={{ background: '#FF6B6B', filter: 'blur(100px)' }} />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6 py-20">
          {/* Headline */}
          <h1 className="font-heading font-extrabold tracking-[-2px] leading-[1.15] text-text-primary mb-6"
            style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}>
            Your Teaching.{' '}
            <br className="max-md:hidden" />
            Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #4FA3A5, #F0C95D)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Voice.</span>
            <br />
            Your AI<span className="text-coral-bright">.</span>
          </h1>

          {/* Sub-headline */}
          <p className="font-body text-xl leading-[1.7] text-text-secondary mb-6 max-w-[620px] mx-auto max-md:text-lg">
            AI teaching assistants that sound like you, teach like you,
            <br className="max-md:hidden" />
            and adapt to every student.
          </p>

          {/* Rotating words */}
          <div className="flex items-center justify-center gap-3 mb-10 h-8">
            <span className="text-text-muted">—</span>
            <span className="font-heading text-sm font-medium text-teal transition-opacity duration-500">
              {ROTATING_WORDS[currentWord]}
            </span>
          </div>

          {/* Waitlist Form */}
          {!submitted ? (
            <div className="max-w-[640px] mx-auto">
              <form onSubmit={handleSubmit}>
                {/* Desktop row */}
                <div className="hidden md:flex gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-5 py-3.5 rounded-xl bg-card-bg dark:bg-white/[0.06] border border-border dark:border-white/10 text-text-primary placeholder:text-text-muted font-body text-[15px] outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="School email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-5 py-3.5 rounded-xl bg-card-bg dark:bg-white/[0.06] border border-border dark:border-white/10 text-text-primary placeholder:text-text-muted font-body text-[15px] outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-colors"
                  />
                  <button
                    type="submit"
                    className="font-heading text-[15px] font-bold bg-gold text-deep-navy px-8 py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(240,201,93,0.35)] transition-all duration-300 whitespace-nowrap"
                  >
                    Join the Waitlist →
                  </button>
                </div>

                {/* Mobile stack */}
                <div className="flex flex-col gap-3 md:hidden mb-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-card-bg dark:bg-white/[0.06] border border-border dark:border-white/10 text-text-primary placeholder:text-text-muted font-body text-[15px] outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="School email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-card-bg dark:bg-white/[0.06] border border-border dark:border-white/10 text-text-primary placeholder:text-text-muted font-body text-[15px] outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-colors"
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-card-bg dark:bg-white/[0.06] border border-border dark:border-white/10 text-text-primary font-body text-[15px] outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-colors"
                  >
                    <option value="" disabled>I am a...</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">School Administrator</option>
                    <option value="district">District Leader</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full font-heading text-[15px] font-bold bg-gold text-deep-navy px-8 py-4 rounded-xl hover:shadow-[0_4px_20px_rgba(240,201,93,0.35)] transition-all duration-300"
                  >
                    Join 4,000+ Teachers on the Waitlist →
                  </button>
                </div>
              </form>

              <p className="font-heading text-[13px] text-text-muted">
                Free early access <span className="mx-1">·</span> No credit card required <span className="mx-1">·</span> Join 4,000+ teachers
              </p>
            </div>
          ) : (
            <div className="max-w-[500px] mx-auto bg-card-bg dark:bg-white/[0.06] border border-border dark:border-white/10 rounded-2xl p-10 text-center">
              <span className="text-4xl mb-4 block">🎉</span>
              <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">You&apos;re on the list!</h2>
              <p className="text-text-secondary">We&apos;ll be in touch soon. Thank you for joining the Teaching Labs community.</p>
            </div>
          )}

          {/* Stats strip */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {[
              { icon: '🏫', label: 'K–12 Ready' },
              { icon: '🔒', label: 'FERPA & COPPA Compliant' },
              { icon: '🎙️', label: 'Voice-Cloned AI Agents' },
              { icon: '⚡', label: 'Adapts in Real Time' },
            ].map(({ icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-text-secondary bg-card-bg dark:bg-white/[0.06] px-4 py-2 rounded-full border border-border dark:border-white/10">
                <span>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
