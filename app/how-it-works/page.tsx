import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'How It Works — Teaching Labs',
  description:
    "Teaching Labs creates an AI assistant built from your teaching style. Here's how it works.",
};

/* ─── Shared SVG icons ─── */

function IconChevronDown() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="w-3 h-3"
    >
      <path d="M3 5l3 3 3-3" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4">
      <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Page ─── */
export default function HowItWorksPage() {
  return (
    <div
      className="min-h-screen bg-warm-white text-text-secondary overflow-x-hidden"
      style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}
    >
      {/* ── NAV ── */}
      <MarketingNav />

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-surface">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[15%] max-md:w-[300px] max-md:h-[300px]"
            style={{
              background: '#4FA3A5',
              filter: 'blur(80px)',
              opacity: 'var(--blob-teal-opacity, 0.08)',
            }}
          />
          <div
            className="absolute w-[450px] h-[450px] rounded-full top-[30%] right-[10%] max-md:w-[280px] max-md:h-[280px]"
            style={{
              background: '#F0C95D',
              filter: 'blur(80px)',
              opacity: 'var(--blob-gold-opacity, 0.10)',
            }}
          />
          <div
            className="absolute w-[350px] h-[350px] rounded-full top-[40%] left-[40%] max-md:hidden"
            style={{
              background: '#FF6B6B',
              filter: 'blur(80px)',
              opacity: 'var(--blob-coral-opacity, 0)',
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            How It Works
          </div>

          {/* Headline */}
          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] text-text-primary mb-6"
            style={{ fontSize: 'clamp(44px, 7vw, 80px)' }}
          >
            Meet Your{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4FA3A5, #F0C95D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Teacher Twin
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-xl leading-[1.7] text-text-secondary max-w-[620px] mx-auto">
            Teaching Labs creates an AI assistant built from your teaching style. Here&apos;s how it
            works.
          </p>
        </div>
      </section>

            <ScrollReveal />
      <main>
        {/* ── HERO IMAGE ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[960px] mx-auto px-10 py-12 max-md:px-6 max-md:py-8">
            <Image
              src="/images/teacher-twin-reflection.jpg"
              alt="A teacher interacting with her AI Teacher Twin on a digital display in a modern classroom"
              width={960}
              height={540}
              className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
              loading="lazy"
            />
            <p className="text-center mt-4 text-sm text-text-muted">
              Your expertise, reflected. Your Teacher Twin learns how you teach and extends your
              reach to every student.
            </p>
          </div>
        </section>

        {/* ── STEPS SECTION ── */}
        <section className="fade-up bg-surface">
          <div className="max-w-[800px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">

            {/* Step 1 */}
            <div className="mb-14">
              <Eyebrow>Teach the System</Eyebrow>
              <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
                You share how you teach.
              </h2>
              <p className="text-[17px] leading-[1.8] text-text-secondary">
                Teaching Labs learns from how you explain concepts, guide students through problems,
                and respond when understanding breaks down. The system builds an AI assistant that
                reflects your instructional approach, not a generic chatbot.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mb-14">
              <Eyebrow>Support Every Student</Eyebrow>
              <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
                Your guidance reaches every learner.
              </h2>
              <p className="text-[17px] leading-[1.8] text-text-secondary">
                Your Teacher Twin provides personalized support that sounds like you and teaches like
                you. Students who need help get guidance aligned with your classroom instruction,
                whether you&apos;re available in that moment or not.
              </p>
            </div>

            {/* Step 3 */}
            <div className="mb-14">
              <Eyebrow>Focus Your Attention</Eyebrow>
              <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
                You stay in control of what matters.
              </h2>
              <p className="text-[17px] leading-[1.8] text-text-secondary">
                With routine support handled, you see where students are struggling, what questions
                they&apos;re asking, and where your attention will make the biggest difference.
                Teaching Labs doesn&apos;t replace your judgment. It gives you better information to
                act on.
              </p>
            </div>

            {/* Bridge quote */}
            <blockquote
              className="border-l-4 rounded-xl p-8 pl-6 max-w-[800px] font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary max-md:text-xl max-md:p-6 max-md:pl-5"
              style={{ borderColor: '#FF6B6B', background: 'var(--bridge-bg, rgba(79,163,165,0.04))' }}
            >
              Teaching Labs doesn&apos;t replace great teaching. It helps great teaching reach every
              student.
            </blockquote>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section
          className="fade-up relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)' }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(240,201,93,0.12) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-[120px] text-center max-md:px-6 max-md:py-20">
            <h2
              className="font-heading font-extrabold tracking-[-1px] text-white mb-5 leading-[1.2]"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
            >
              Ready to Meet Your Teacher Twin?
            </h2>
            <p className="text-[17px] leading-[1.7] text-white/65 mb-8 max-w-[500px] mx-auto">
              Get early access and be among the first to see what&apos;s possible.
            </p>
            <Link
              href="/see-the-difference"
              className="inline-flex items-center font-heading text-[17px] font-bold bg-transparent text-text-primary px-12 py-4 rounded-full border-4 border-gold hover:-translate-y-0.5 hover:bg-gold hover:text-deep-navy transition-all duration-300"
            >
              What Is Different
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center font-heading text-[17px] font-semibold bg-transparent text-text-primary px-12 py-4 rounded-full border-4 border-teal hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Early Access
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: 'linear-gradient(180deg, #14213D 0%, #1a2a45 100%)',
          borderTop: '1px solid rgba(240,201,93,0.2)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">
            {/* Brand */}
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-white/55 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get
                the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-[rgba(79,163,165,0.1)] px-4 py-2 rounded-full border border-[rgba(79,163,165,0.2)]">
                <IconStar />
                FERPA &amp; COPPA Compliant
              </div>
            </div>

            {/* Platform */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">
                Platform
              </div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/for-teachers', label: 'For Teachers' },
                  { href: '/for-students', label: 'For Students' },
                  { href: '/for-districts', label: 'For Districts' },
                  { href: '/for-parents', label: 'For Parents' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/55 hover:text-gold transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">
                Company
              </div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/our-story', label: 'Our Story' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/contact', label: 'Contact' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/55 hover:text-gold transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">
                Legal
              </div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '#', label: 'Privacy Policy' },
                  { href: '#', label: 'Terms of Service' },
                  { href: '#', label: 'Cookie Policy' },
                  { href: '#', label: 'Accessibility' },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/55 hover:text-gold transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.08] pt-8 text-center text-[13px] text-white/35">
            &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
