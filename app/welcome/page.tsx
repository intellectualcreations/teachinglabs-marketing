'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChalkboardTeacher,
  Student,
  Brain,
  ChartBar,
  ShieldCheck,
  Megaphone,
  Sparkle,
  ArrowRight,
} from '@phosphor-icons/react';

/* ------------------------------------------------------------------ */
/*  Intersection-observer fade-in hook                                 */
/* ------------------------------------------------------------------ */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('welcome-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} className={`welcome-fade ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Steps component                                                    */
/* ------------------------------------------------------------------ */
function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3 text-left">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/15 text-sm font-semibold text-teal dark:bg-teal/25">
        {number}
      </span>
      <p className="text-[15px] leading-relaxed text-text-secondary">{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature card                                                       */
/* ------------------------------------------------------------------ */
function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} className="welcome-fade rounded-2xl border border-border bg-surface p-6 text-left transition-shadow hover:shadow-lg dark:hover:shadow-teal/5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal/10 text-teal dark:bg-teal/20">
        {icon}
      </div>
      <h3 className="mb-1 font-heading text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{desc}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function WelcomePage() {
  return (
    <>
      {/* Scoped animation styles */}
      <style>{`
        .welcome-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .welcome-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="min-h-screen bg-warm-white font-body dark:bg-deep-navy">
        {/* ---- Hero ---- */}
        <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:px-6 md:pb-24 md:pt-28">
          {/* Decorative gradient blob */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[480px] w-[640px] -translate-x-1/2 rounded-full bg-teal/8 blur-3xl dark:bg-teal/5" />

          <FadeIn>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4 py-1.5 text-sm font-medium text-teal dark:border-teal/30 dark:bg-teal/10">
              <Sparkle weight="fill" size={16} />
              Early Access
            </div>

            <h1 className="mx-auto mt-6 max-w-2xl font-heading text-4xl font-bold leading-tight tracking-tight text-navy sm:text-5xl md:text-6xl dark:text-white">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-teal to-navy bg-clip-text text-transparent dark:from-teal dark:to-teal/60">
                Teaching Labs
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary sm:text-xl">
              You&apos;re one of the first to experience the future of teaching.
            </p>

            <p className="mx-auto mt-3 max-w-lg text-base text-text-muted">
              An AI-powered teaching platform that personalizes learning for every student, amplifies every teacher, and keeps parents in the loop.
            </p>
          </FadeIn>
        </section>

        {/* ---- Two paths ---- */}
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 md:pb-28">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {/* Teacher card */}
            <FadeIn>
              <div className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:shadow-xl dark:hover:shadow-teal/5">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/10 text-navy dark:bg-navy/30 dark:text-teal">
                  <ChalkboardTeacher weight="duotone" size={32} />
                </div>

                <h2 className="mb-4 font-heading text-2xl font-bold text-text-primary">I&apos;m a Teacher</h2>

                <div className="mb-8 flex flex-col gap-3">
                  <Step number={1} text="Create your account with a magic link email" />
                  <Step number={2} text="Set up your AI teaching assistant (personality quiz)" />
                  <Step number={3} text="Create your first class and get a join code" />
                  <Step number={4} text="Share the code with your students" />
                </div>

                <div className="mt-auto">
                  <Link
                    href="/teacher/signup"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-heading text-base font-semibold text-white shadow-md transition-all hover:bg-navy/90 hover:shadow-lg active:scale-[0.98] dark:bg-teal dark:hover:bg-teal/90"
                  >
                    Get Started as a Teacher
                    <ArrowRight weight="bold" size={18} />
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Student card */}
            <FadeIn>
              <div className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:shadow-xl dark:hover:shadow-teal/5">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10 text-teal dark:bg-teal/20">
                  <Student weight="duotone" size={32} />
                </div>

                <h2 className="mb-4 font-heading text-2xl font-bold text-text-primary">I&apos;m a Student</h2>

                <div className="mb-8 flex flex-col gap-3">
                  <Step number={1} text="Get a class code from your teacher" />
                  <Step number={2} text="Create your account" />
                  <Step number={3} text="Take a fun interest quiz (we'll personalize your learning!)" />
                  <Step number={4} text="Start learning with your AI tutor" />
                </div>

                <div className="mt-auto">
                  <Link
                    href="/student/signup"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-6 py-3.5 font-heading text-base font-semibold text-white shadow-md transition-all hover:bg-teal/90 hover:shadow-lg active:scale-[0.98]"
                  >
                    Join a Class
                    <ArrowRight weight="bold" size={18} />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ---- Features ---- */}
        <section className="border-t border-border bg-bg-secondary px-4 py-20 sm:px-6 md:py-28 dark:bg-deep-navy">
          <FadeIn className="text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              What makes Teaching Labs special?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-text-muted">
              Built by educators, powered by AI, designed for real classrooms.
            </p>
          </FadeIn>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:gap-8">
            <Feature
              icon={<Brain weight="duotone" size={24} />}
              title="Personalized AI Tutoring"
              desc="Every student gets a tutor that adapts to their interests and level. Learning feels personal because it is."
            />
            <Feature
              icon={<Megaphone weight="duotone" size={24} />}
              title="Your Teaching Style, Amplified"
              desc="AI assistants that teach the way YOU teach. Your voice, your methods, scaled to every student."
            />
            <Feature
              icon={<ChartBar weight="duotone" size={24} />}
              title="Real-Time Insights"
              desc="See how every student is doing, instantly. No more guessing who needs help."
            />
            <Feature
              icon={<ShieldCheck weight="duotone" size={24} />}
              title="Safe & Private"
              desc="FERPA/COPPA compliant. Student data stays protected. Built with trust at the core."
            />
          </div>
        </section>

        {/* ---- Footer ---- */}
        <footer className="border-t border-border bg-warm-white px-4 py-10 text-center dark:bg-deep-navy">
          <p className="text-sm text-text-muted">
            Questions? Contact us at{' '}
            <a href="mailto:hello@teachinglabs.com" className="font-medium text-teal underline-offset-2 hover:underline">
              hello@teachinglabs.com
            </a>
          </p>
          <p className="mt-2 text-xs text-text-muted/70">
            © 2026 Teaching Labs by Intellectual Creations
          </p>
        </footer>
      </div>
    </>
  );
}
