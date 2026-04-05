'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Star,
  UsersThree,
  ChatText,
  ChartBar,
  EnvelopeSimple,
  Sparkle,
  RocketLaunch,
} from '@phosphor-icons/react';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function TeacherWelcomePage() {
  const router = useRouter();

  const features = [
    { icon: Star, text: 'Create one class (limit during early access)' },
    { icon: UsersThree, text: 'Add up to 30 students' },
    { icon: Sparkle, text: 'Students get a join code to connect' },
    { icon: ChatText, text: 'Students can chat with your teaching twin for help' },
    { icon: ChartBar, text: "You'll see all chat conversations" },
    { icon: RocketLaunch, text: 'Your twin will alert you if a student needs extra help' },
  ];

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle className="w-10 h-10 rounded-full bg-card-bg border border-border shadow-sm z-50" />
      </div>

      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#00F6ED]/20 dark:bg-teal/5 blob-teal" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#00F6ED]/15 dark:bg-gold/5 blob-gold" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Early Access Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/10 border border-navy/20 text-navy dark:bg-teal/10 dark:border-teal/20 dark:text-teal text-sm font-semibold">
            <Sparkle size={16} weight="fill" />
            Early Access
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-navy dark:text-white mb-4 leading-tight">
            Welcome to Your Teaching Assistant!
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
            Your teaching twin is ready. Here&apos;s what you can do during this early testing phase.
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-4 mb-12">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-border/50 backdrop-blur-sm"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo/10 dark:bg-teal/10 flex items-center justify-center text-navy dark:text-teal">
                  <Icon size={24} weight="fill" />
                </div>
                <p className="text-text-primary font-medium text-base pt-1.5">{feature.text}</p>
              </div>
            );
          })}
        </div>

        {/* What to expect */}
        <div className="rounded-2xl bg-navy/5 border border-navy/20 dark:bg-teal/5 dark:border-teal/20 p-6 mb-10">
          <div className="flex items-start gap-3 mb-3">
            <RocketLaunch size={22} weight="fill" className="text-navy dark:text-teal flex-shrink-0 mt-0.5" />
            <h2 className="font-heading text-lg font-bold text-text-primary">What to expect</h2>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed pl-[34px]">
            This is an early version and we&apos;re actively building. Give it a test drive and share your feedback — it helps our team build exactly what you need!
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mb-10">
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-navy text-white dark:bg-teal dark:text-navy font-heading font-semibold text-lg rounded-full hover:bg-navy/90 dark:hover:bg-teal/90 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Dashboard
            <ArrowRight size={20} weight="bold" />
          </button>
        </div>

        {/* Feedback card */}
        <div className="rounded-xl bg-transparent dark:bg-transparent border border-border/50 p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <EnvelopeSimple size={18} weight="fill" className="text-navy dark:text-teal" />
            <p className="text-text-primary font-medium text-sm">Questions or feedback?</p>
          </div>
          <a
            href="mailto:hello@teachinglabs.com"
            className="text-navy hover:text-navy/80 dark:text-teal dark:hover:text-teal/80 transition-colors text-sm font-medium underline underline-offset-2"
          >
            hello@teachinglabs.com
          </a>
        </div>
      </div>
    </div>
  );
}
