import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'Our Story — Teaching Labs',
  description:
    'Teaching Labs exists because great teachers deserve tools designed with them in mind. Built by a teacher, for every teacher.',
};

/* ─── Inline SVG icons ─── */

function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

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

/* ─── Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4">
      <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Section label (inline version used in two-col sections) ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4">
      <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Values icon: Signal / Radar ─── */
function IconSignal() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24,8 A16,16 0 0 1 40,24" stroke="var(--teal,#00F6ED)" strokeWidth="2" strokeLinecap="round" />
      <path d="M24,13 A11,11 0 0 1 35,24" stroke="var(--teal,#00F6ED)" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      <path d="M24,18 A6,6 0 0 1 30,24" stroke="var(--teal,#00F6ED)" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
      <circle cx="24" cy="24" r="3.5" fill="var(--teal,#00F6ED)" />
    </svg>
  );
}

/* ─── Values icon: Orbit / Brain Science ─── */
function IconOrbit() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <ellipse
        cx="24" cy="24" rx="19" ry="8"
        stroke="var(--teal,#00F6ED)" strokeWidth="2"
        transform="rotate(35 24 24)" opacity="0.85"
      />
      <ellipse
        cx="24" cy="24" rx="19" ry="8"
        stroke="var(--teal,#00F6ED)" strokeWidth="1.4"
        transform="rotate(-35 24 24)" opacity="0.4"
      />
      <circle cx="24" cy="24" r="3.5" fill="var(--teal,#00F6ED)" />
    </svg>
  );
}

/* ─── Values icon: Network / Student Agency ─── */
function IconNetwork() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="4" fill="var(--teal,#00F6ED)" />
      <circle cx="24" cy="10" r="2.5" fill="var(--teal,#00F6ED)" opacity="0.5" />
      <circle cx="24" cy="38" r="2.5" fill="var(--teal,#00F6ED)" opacity="0.5" />
      <circle cx="10" cy="24" r="2.5" fill="var(--teal,#00F6ED)" opacity="0.5" />
      <circle cx="38" cy="24" r="2.5" fill="var(--teal,#00F6ED)" opacity="0.5" />
      <circle cx="14.4" cy="14.4" r="2" fill="var(--teal,#00F6ED)" opacity="0.28" />
      <circle cx="33.6" cy="33.6" r="2" fill="var(--teal,#00F6ED)" opacity="0.28" />
      <circle cx="14.4" cy="33.6" r="2" fill="var(--teal,#00F6ED)" opacity="0.28" />
      <circle cx="33.6" cy="14.4" r="2" fill="var(--teal,#00F6ED)" opacity="0.28" />
    </svg>
  );
}

/* ─── Main page ─── */
export default function OurStoryPage() {
  return (
    <div
      className="min-h-screen bg-warm-white text-text-secondary overflow-x-hidden"
      style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}
    >

      {/* ── NAV ── */}
      <MarketingNav />

      {/* ── HERO ── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-warm-white">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[15%] max-md:w-[300px] max-md:h-[300px]"
            style={{
              background: '#00F6ED',
              filter: 'blur(80px)',
              opacity: 'var(--blob-teal-opacity, 0.08)',
            }}
          />
          <div
            className="absolute w-[450px] h-[450px] rounded-full top-[30%] right-[10%] max-md:w-[280px] max-md:h-[280px]"
            style={{
              background: '#4056F4',
              filter: 'blur(80px)',
              opacity: 'var(--blob-gold-opacity, 0.10)',
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            About Us
          </div>

          {/* Headline — CSS-animated word reveal */}
          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] text-text-primary mb-6"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
          >
            {/* Line 1 */}
            {(['Built', 'by', 'a', 'Teacher.'] as const).map((word, i) => (
              <span
                key={word + i}
                className="inline-block mr-[0.25em]"
                style={{
                  animation: `heroWordReveal 0.5s ease forwards`,
                  animationDelay: `${0.3 + i * 0.1}s`,
                  opacity: 0,
                }}
              >
                {word}
              </span>
            ))}
            <br />
            {/* Line 2 */}
            {(['For'] as const).map((word, i) => (
              <span
                key={word}
                className="inline-block mr-[0.25em]"
                style={{
                  animation: `heroWordReveal 0.5s ease forwards`,
                  animationDelay: `${0.3 + (4 + i) * 0.1}s`,
                  opacity: 0,
                }}
              >
                {word}
              </span>
            ))}
            <span
              className="inline-block mr-[0.25em]"
              style={{
                background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'heroWordReveal 0.5s ease forwards',
                animationDelay: `${0.3 + 5 * 0.1}s`,
                opacity: 0,
              }}
            >
              Every
            </span>
            <span
              className="inline-block"
              style={{
                animation: 'heroWordReveal 0.5s ease forwards',
                animationDelay: `${0.3 + 6 * 0.1}s`,
                opacity: 0,
              }}
            >
              Teacher.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="font-body text-xl leading-[1.7] text-text-secondary mb-10 max-w-[620px] mx-auto"
            style={{
              animation: 'heroFadeUp 0.6s ease forwards',
              animationDelay: '1.3s',
              opacity: 0,
            }}
          >
            Teaching Labs exists because great teachers deserve tools designed with them in mind —
            grounded in science, built to give time back, and focused on what actually helps students learn.
          </p>

          {/* Buttons */}
          <div
            className="flex gap-4 justify-center flex-wrap mb-8"
            style={{
              animation: 'heroFadeUp 0.6s ease forwards',
              animationDelay: '1.5s',
              opacity: 0,
            }}
          >
            <Link
              href="/see-the-difference"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-transparent text-text-primary px-10 py-4 rounded-full border-4 border-gold hover:-translate-y-0.5 hover:bg-gold hover:text-white transition-all duration-300"
            >
              What Is Different
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 font-heading text-base font-semibold bg-transparent text-text-primary px-10 py-4 rounded-full border-4 border-teal hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              Join the Waitlist
            </Link>
          </div>

          {/* Footnote */}
          <p
            className="font-heading text-[13px] text-text-muted"
            style={{
              animation: 'heroFadeUp 0.6s ease forwards',
              animationDelay: '1.7s',
              opacity: 0,
            }}
          >
            Built by educators, for educators.
          </p>
        </div>

        {/* Keyframe styles injected via a style tag — only affects hero animations */}
        <style>{`
          @keyframes heroWordReveal {
            from { opacity: 0; transform: translateY(40px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes heroFadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes gentleFloat {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-6px); }
          }
          @keyframes gentlePulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(64,86,244,0.3); }
            50%       { box-shadow: 0 4px 40px rgba(64,86,244,0.5); }
          }
        `}</style>
      </section>

            <ScrollReveal />
      <main>

        {/* ── FOUNDER IMAGE ── */}
        <div className="max-w-[480px] mx-auto px-10 my-10 max-md:px-6">
          <Image
            src="/images/founder-portrait.jpg"
            alt="Education leader and Teaching Labs founder"
            width={800}
            height={450}
            className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
            loading="lazy"
          />
        </div>

        {/* ── MISSION SECTION ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="grid grid-cols-2 gap-20 items-center max-md:grid-cols-1 max-md:gap-12">

              {/* Text column */}
              <div>
                <SectionLabel>Our Mission</SectionLabel>
                <h2
                  className="font-heading font-extrabold text-text-primary leading-[1.2] mb-6 tracking-[-0.5px]"
                  style={{ fontSize: 'clamp(26px, 2.8vw, 40px)' }}
                >
                  We believe every teacher deserves a platform that puts learning first.
                </h2>
                <p className="text-base leading-[1.88] text-text-secondary mb-[18px]">
                  Most educational technology is sold to administrators and used by teachers
                  who had no say in the purchase. The tools don&apos;t reflect how teaching actually
                  works — they don&apos;t account for the thirty different learners in a single
                  classroom, the prep time that bleeds into evenings, or the invisible labor
                  that keeps a room functioning.
                </p>
                <p className="text-base leading-[1.88] text-text-secondary mb-[18px]">
                  Teaching Labs was built backwards from that problem. Every decision starts with
                  one question: does this make a teacher&apos;s work genuinely better? If the answer
                  isn&apos;t clearly yes, it doesn&apos;t ship.
                </p>
                <p className="text-base leading-[1.88] text-text-secondary">
                  Not better for a committee reviewing a procurement deck.
                  Better for the person standing in front of 28 kids on a Thursday afternoon.
                </p>
              </div>

              {/* Photo column */}
              <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1588072432836-e10032774350?w=900&q=80&auto=format&fit=crop"
                  alt="Students engaged in collaborative, hands-on learning"
                  className="w-full h-[440px] object-cover block"
                  loading="lazy"
                />
              </div>

            </div>
          </div>
        </section>

        {/* ── STORY SECTION ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="grid grid-cols-2 gap-20 items-start max-md:grid-cols-1 max-md:gap-12">

              {/* Story text column */}
              <div>
                <SectionLabel>Our Story</SectionLabel>

                {/* Pull quote */}
                <blockquote
                  className="font-heading font-medium italic leading-[1.4] text-text-primary border-l-4 border-[#FF6B6B] bg-[rgba(0,246,237,0.04)] rounded-xl p-6 pl-7 mb-10 tracking-[-0.5px]"
                  style={{ fontSize: 'clamp(22px, 2.4vw, 36px)' }}
                >
                  &ldquo;I&apos;ve spent almost thirty years inside education technology, and the same
                  question has followed me the entire time: does this actually help students learn?&rdquo;
                </blockquote>

                {/* Story body */}
                <div className="space-y-5">
                  {[
                    `Dottie Stewart started in the classroom. Psychology and sociology shaped how she understood learners. A Masters in Teaching gave her the framework. Years with students gave her the instincts no degree provides.`,
                    `When she moved into EdTech, she carried that question with her through every wave: smart boards, clickers, one-to-one devices, 3D printers. Every time, the technology arrived with big promises. Every time, the same pattern followed.`,
                    `Take 3D printing. Incredibly powerful. Teaches design thinking, problem-solving, real-world engineering skills. And still, years later, it's not widely adopted. Why? The same underlying realities that have always existed: not enough time, not enough resources, and no matter how hard teachers try, not enough of them to go around.`,
                    `The technology was never the problem. The problem was that nobody built it around the reality of being a teacher.`,
                    `Then AI arrived. And she watched the industry rush to build tools that generate answers, automate lesson plans, and replace the parts of teaching that were never the real challenge. The real challenge has always been the same: how do you reach every student, every day, when each one learns differently, and there's only one of you?`,
                    `After nearly three decades of watching that question go unanswered, she stopped waiting for someone else to build the right thing.`,
                    `Teaching Labs is the platform she always wished existed. AI that scaffolds learning instead of replacing thinking. Technology designed to work alongside real books, real experiments, and real teaching. Built around brain science, designed with educators, and focused on what actually helps students learn.`,
                  ].map((para, i) => (
                    <p key={i} className="text-base leading-[1.9] text-text-secondary">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Sticky photo column */}
              <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)] md:sticky md:top-[100px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=900&q=80&auto=format&fit=crop"
                  alt="Educator presenting and leading instruction"
                  className="w-full h-[520px] object-cover block max-md:h-[320px]"
                  loading="lazy"
                />
              </div>

            </div>
          </div>
        </section>

        {/* ── VALUES SECTION ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div>
              <SectionLabel>What We Believe</SectionLabel>
              <h2
                className="font-heading font-extrabold text-text-primary leading-[1.2] mb-14 tracking-[-0.5px]"
                style={{ fontSize: 'clamp(26px, 2.8vw, 40px)' }}
              >
                The principles that guide every product decision.
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">

              {/* Value Card 1 */}
              <div
                className="card-accent relative bg-card-bg border border-border rounded-[20px] p-10 overflow-hidden shadow-[var(--card-shadow,0_2px_20px_rgba(20,33,61,0.05))] hover:shadow-[var(--card-hover-shadow,0_8px_40px_rgba(20,33,61,0.10))] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div
                  className="mb-6"
                  style={{ animation: 'gentleFloat 3s ease-in-out infinite 0s' }}
                >
                  <IconSignal />
                </div>
                <h3 className="font-heading text-[19px] font-bold text-text-primary mb-3">
                  Teachers Are the Point
                </h3>
                <p className="text-[15px] leading-[1.78] text-text-secondary">
                  AI doesn&apos;t replace teachers. It gives great teachers more reach, more time, and more
                  room to do what only humans can do — build the relationships that make learning possible.
                </p>
              </div>

              {/* Value Card 2 */}
              <div
                className="card-accent relative bg-card-bg border border-border rounded-[20px] p-10 overflow-hidden shadow-[var(--card-shadow,0_2px_20px_rgba(20,33,61,0.05))] hover:shadow-[var(--card-hover-shadow,0_8px_40px_rgba(20,33,61,0.10))] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div
                  className="mb-6"
                  style={{ animation: 'gentleFloat 3s ease-in-out infinite 0.5s' }}
                >
                  <IconOrbit />
                </div>
                <h3 className="font-heading text-[19px] font-bold text-text-primary mb-3">
                  Grounded in Brain Science
                </h3>
                <p className="text-[15px] leading-[1.78] text-text-secondary">
                  Every feature traces back to research on memory, attention, retrieval, and cognitive
                  load. We didn&apos;t start with a product spec — we started with how humans actually learn.
                </p>
              </div>

              {/* Value Card 3 */}
              <div
                className="card-accent relative bg-card-bg border border-border rounded-[20px] p-10 overflow-hidden shadow-[var(--card-shadow,0_2px_20px_rgba(20,33,61,0.05))] hover:shadow-[var(--card-hover-shadow,0_8px_40px_rgba(20,33,61,0.10))] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div
                  className="mb-6"
                  style={{ animation: 'gentleFloat 3s ease-in-out infinite 1s' }}
                >
                  <IconNetwork />
                </div>
                <h3 className="font-heading text-[19px] font-bold text-text-primary mb-3">
                  Student Agency Drives Outcomes
                </h3>
                <p className="text-[15px] leading-[1.78] text-text-secondary">
                  Research is consistent: students learn more deeply when they have agency over the
                  process. We build student agency into the architecture — not as a feature, as a
                  foundation.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section
          className="fade-up relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a1128 0%, #1a3a4a 50%, #1d4a52 100%)',
          }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-[120px] text-center max-md:px-6 max-md:py-20">
            <h2
              className="font-heading font-extrabold tracking-[-1px] text-white mb-5 leading-[1.2]"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
            >
              Ready to Be Part of What We&apos;re Building?
            </h2>
            <p className="text-[17px] leading-[1.7] text-white/65 mb-10 max-w-[500px] mx-auto">
              Teaching Labs is in early access. Join us now and help shape the future of AI in education.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center font-heading text-[17px] font-bold bg-gold text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
              style={{ animation: 'gentlePulse 2.5s ease-in-out infinite' }}
            >
              Get in Touch
            </Link>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: 'linear-gradient(180deg, #0a1128 0%, #1a2a45 100%)',
          borderTop: '1px solid rgba(64,86,244,0.2)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">

            {/* Brand */}
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-white/55 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get the
                support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(0,246,237,0.2)]">
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
                    <Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">
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
                    <Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">
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
                    <Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">
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
