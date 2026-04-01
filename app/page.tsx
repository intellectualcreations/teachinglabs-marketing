import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ScrollReveal from '@/components/shared/ScrollReveal';
import MarketingNav from '@/components/shared/MarketingNav';


export const metadata: Metadata = {
  title: 'Teaching Labs — AI-Powered Teaching Platform for K-12',
  description:
    'Teaching Labs learns how you teach and helps every student get the support they need. AI-powered K-12 teaching platform.',
};

/* ─── Inline SVG icons ─── */

function IconDiverge() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-teal">
      <path d="M24 8 C16 16, 8 28, 8 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M24 8 C24 18, 24 28, 24 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M24 8 C32 16, 40 28, 40 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function IconConcentric() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-teal">
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

function IconNetwork() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-teal">
      <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <circle cx="34" cy="14" r="4" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <circle cx="24" cy="30" r="4" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      <circle cx="10" cy="38" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="38" cy="38" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="14" y1="18" x2="24" y2="26" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="34" y1="18" x2="24" y2="26" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="24" y1="34" x2="10" y2="35" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="24" y1="34" x2="38" y2="35" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function IconOrbit() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-teal">
      <ellipse cx="24" cy="24" rx="20" ry="10" stroke="currentColor" strokeWidth="2" opacity="0.4" transform="rotate(-30 24 24)" />
      <ellipse cx="24" cy="24" rx="20" ry="10" stroke="currentColor" strokeWidth="2" opacity="0.6" transform="rotate(30 24 24)" />
      <ellipse cx="24" cy="24" rx="20" ry="10" stroke="currentColor" strokeWidth="2" opacity="0.8" transform="rotate(90 24 24)" />
      <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function IconFunnel() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-teal">
      <path d="M8 12 Q18 24, 24 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M24 12 Q24 24, 24 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <path d="M40 12 Q30 24, 24 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="24" cy="38" r="3" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function IconVenn() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-teal">
      <circle cx="18" cy="24" r="10" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <circle cx="30" cy="24" r="10" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <circle cx="24" cy="16" r="10" stroke="currentColor" strokeWidth="2" opacity="0.4" />
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

/* ─── Card component ─── */
function Card({
  icon,
  title,
  text,
  floatClass,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  floatClass: string;
}) {
  return (
    <div className="card-accent relative bg-card-bg rounded-[20px] p-10 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300">
      <div className={`mb-6 ${floatClass}`}>{icon}</div>
      <h3 className="font-heading text-[16.5px] font-semibold text-text-primary mb-3">{title}</h3>
      <p className="text-[15px] leading-[1.78] text-text-secondary">{text}</p>
    </div>
  );
}

/* ─── Bridge quote ─── */
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-coral bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl p-8 pl-6 max-w-3xl font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary mt-12 max-md:text-xl max-md:p-6 max-md:pl-5">
      {children}
    </div>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[#7B2D4A] dark:text-[#00F6ED] font-extrabold flex items-center justify-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-4">
      <span className="bg-[#7B2D4A] dark:bg-[#00F6ED] w-2 h-2 rounded-full flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Main page ─── */
export default function HomePage() {
  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="blob-teal absolute w-[600px] h-[600px] rounded-full top-[8%] left-[5%] max-md:w-[350px] max-md:h-[350px] opacity-[0.3] dark:opacity-[0.2]"
            style={{ background: '#00F6ED', filter: 'blur(100px)' }} />
          <div className="blob-gold absolute w-[550px] h-[550px] rounded-full top-[20%] right-[2%] max-md:w-[320px] max-md:h-[320px] opacity-[0.3] dark:opacity-[0.18]"
            style={{ background: '#4056F4', filter: 'blur(100px)' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full top-[55%] left-[15%] opacity-[0.15] dark:opacity-[0.1] max-md:hidden"
            style={{ background: '#561F37', filter: 'blur(100px)' }} />
          {/* Bottom fade to blend hero into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-[200px] dark:hidden"
            style={{ background: 'linear-gradient(to bottom, transparent, #F7F7F8)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] hidden dark:block"
            style={{ background: 'linear-gradient(to bottom, transparent, #0a1128)' }} />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="text-[#7B2D4A] dark:text-[#00F6ED] font-extrabold inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-6">
            <span className="bg-[#7B2D4A] dark:bg-[#00F6ED] w-2 h-2 rounded-full flex-shrink-0" />
            AI-Powered Teaching Platform · K-12
          </div>

          {/* Headline */}
          <h1 className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}>
            <span className="text-black dark:text-white hero-word hero-word-0 mr-2">Your</span>
            <span className="text-black dark:text-white hero-word hero-word-1 mr-2">Teaching</span>
            <span className="text-black dark:text-white hero-word hero-word-2 mr-2">Power,</span>
            <span
              className="hero-word hero-word-3"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Multiplied
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle-anim text-black dark:text-white font-body text-xl leading-[1.7] mb-10 max-w-[620px] mx-auto">
            Not another edtech tool.<br />
            A teaching assistant built from your expertise.
          </p>

          {/* Intro line */}
          <p className="hero-intro-anim text-black dark:text-white font-body text-[19px] leading-[1.7] mb-10 max-w-[700px] mx-auto max-md:text-[17px]">
            Teaching Labs learns how you teach and helps every student get the support they need,
            while you focus on the moments that matter most.
          </p>

          {/* Buttons — matching v4: outline styles with 4px borders */}
          <div className="hero-buttons-anim flex gap-4 justify-center flex-wrap mb-8">
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              Join the Waitlist
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-coral dark:border-teal dark:shadow-[0_0_20px_rgba(0,246,237,0.15)] hover:bg-coral dark:hover:bg-teal hover:text-white dark:hover:text-deep-navy hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(86,31,55,0.3)] dark:hover:shadow-[0_6px_28px_rgba(0,246,237,0.35)] transition-all duration-300"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      <main>



        {/* ── PROBLEM SECTION ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>The Challenge</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                The Reality of Today&apos;s Classroom
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-3 gap-8 mb-12 max-md:grid-cols-1 fade-up">
              <Card
                floatClass="card-icon-float-1"
                icon={<IconDiverge />}
                title="Every student learns differently."
                text="In every classroom you'll find students ready to move ahead, students struggling to keep up, and students who just need a different explanation. Teachers are asked to meet every learner where they are, often all at the same time."
              />
              <Card
                floatClass="card-icon-float-2"
                icon={<IconConcentric />}
                title="Time is the scarcest resource."
                text="Between planning, grading, communication, and classroom management, teachers are already stretched thin. Finding the time to truly personalize learning for every student can feel impossible."
              />
              <Card
                floatClass="card-icon-float-3"
                icon={<IconNetwork />}
                title="Technology hasn't solved the problem."
                text="Classrooms have more devices than ever. But great learning still depends on explanation, feedback, practice, and connection. Technology should support those moments, not replace them."
              />
            </div>

            <div className="fade-up">
              <Bridge>Teachers already know how to reach every student. They just need the support to do it.</Bridge>
            </div>
          </div>
        </section>

        {/* ── SOLUTION SECTION ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Our Approach</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Teaching Labs Works the Way<br />Teachers Work
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-3 gap-8 mb-12 max-md:grid-cols-1 fade-up">
              <Card
                floatClass="card-icon-float-1"
                icon={<IconOrbit />}
                title="Your Teaching, Scaled"
                text="Teaching Labs learns how you explain ideas, correct mistakes, and guide students. Students get help in your voice and your style, even when you can't be everywhere at once."
              />
              <Card
                floatClass="card-icon-float-2"
                icon={<IconFunnel />}
                title="Every Student Gets Support"
                text="Students move through learning differently. Teaching Labs adapts in real time, giving struggling students extra help and letting advanced students keep moving. No one waits. No one gets left behind."
              />
              <Card
                floatClass="card-icon-float-3"
                icon={<IconVenn />}
                title="Designed for Real Classrooms"
                text="Built with teachers and grounded in learning science. Every feature is designed to support attention, retrieval, mastery, and confidence."
              />
            </div>

            <div className="fade-up">
              <Bridge>Finally, a teaching assistant that learns from you, and helps you reach every student.</Bridge>
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="relative overflow-hidden bg-warm-white dark:bg-transparent" style={{ background: undefined }}>
          {/* Top fade to blend with section above */}
          <div className="absolute top-0 left-0 right-0 h-[200px] dark:hidden pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #F7F7F8, transparent)' }} />
          <div className="absolute top-0 left-0 right-0 h-[200px] hidden dark:block pointer-events-none z-[2]"
            style={{ background: 'linear-gradient(to bottom, #0a1128, transparent)' }} />
          {/* Light mode: radiant blobs like hero */}
          <div className="absolute inset-0 pointer-events-none dark:hidden" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[-10%] opacity-[0.25]"
              style={{ background: '#00F6ED', filter: 'blur(120px)' }} />
            <div className="absolute w-[450px] h-[450px] rounded-full top-[5%] right-[-8%] opacity-[0.25]"
              style={{ background: '#4056F4', filter: 'blur(120px)' }} />
            <div className="absolute w-[350px] h-[350px] rounded-full bottom-[10%] left-[40%] opacity-[0.12]"
              style={{ background: '#7B2D4A', filter: 'blur(120px)' }} />
          </div>
          {/* Dark mode: gradient that fades to footer color at bottom */}
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, #1a3a4a 0%, #152a3a 40%, #0a1128 100%)' }} />
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-36 text-center max-md:px-6 max-md:py-20">
            <div className="text-[#7B2D4A] dark:text-[#00F6ED] font-extrabold font-heading text-xs font-bold tracking-[4px] uppercase mb-5 dark:text-white/50">
              Early Access
            </div>
            <h2 className="text-black dark:text-white font-heading font-extrabold tracking-[-1.5px] mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Join the Waitlist
            </h2>
            <p className="text-black dark:text-white text-lg leading-[1.7] mb-10 max-w-[600px] mx-auto dark:!text-white/65">
              Be among the first to bring Teaching Labs into your classroom. No credit card. No commitment. Just better teaching.
            </p>
            <Link
              href="/waitlist"
              className="inline-flex justify-center items-center font-heading text-[17px] font-bold bg-transparent text-deep-navy dark:text-white border-4 border-gold hover:bg-gold hover:text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300 shadow-[0_4px_20px_rgba(64,86,244,0.3)]"
            >
              Join the Waitlist
            </Link>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="relative overflow-hidden bg-warm-white dark:bg-transparent">
        {/* Light mode: subtle blobs */}
        <div className="absolute inset-0 pointer-events-none dark:hidden" aria-hidden="true">
          <div className="absolute w-[500px] h-[500px] rounded-full top-[-20%] left-[-5%] opacity-[0.2]"
            style={{ background: '#00F6ED', filter: 'blur(130px)' }} />
          <div className="absolute w-[450px] h-[450px] rounded-full bottom-[-10%] right-[-5%] opacity-[0.2]"
            style={{ background: '#4056F4', filter: 'blur(130px)' }} />
        </div>
        {/* Dark mode: gradient with top blend */}
        <div className="absolute top-0 left-0 right-0 h-[200px] hidden dark:block pointer-events-none z-[2]"
          style={{ background: 'linear-gradient(to bottom, #0a1128, transparent)' }} />
        <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
          style={{ background: 'linear-gradient(180deg, var(--color-deep-navy) 0%, #1a2a45 100%)' }} />
        <div className="relative z-10 max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">

            {/* Brand */}
            <div>
              <div className="font-heading text-xl font-bold text-black dark:text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-black dark:text-white/90 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-gold dark:text-teal bg-[rgba(64,86,244,0.08)] dark:bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(64,86,244,0.15)] dark:border-[rgba(0,246,237,0.2)]">
                <IconStar />
                FERPA &amp; COPPA Compliant
              </div>
            </div>

            {/* Platform */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-black/70 dark:text-white/60 mb-5">Platform</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/for-teachers', label: 'For Teachers' },
                  { href: '/for-students', label: 'For Students' },
                  { href: '/for-districts', label: 'For Districts' },
                  { href: '/for-parents', label: 'For Parents' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-black dark:text-white/90 hover:text-gold transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-black/70 dark:text-white/60 mb-5">Company</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/our-story', label: 'Our Story' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/contact', label: 'Contact' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-black dark:text-white/90 hover:text-gold transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-black/70 dark:text-white/60 mb-5">Legal</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '#', label: 'Privacy Policy' },
                  { href: '#', label: 'Terms of Service' },
                  { href: '#', label: 'Cookie Policy' },
                  { href: '#', label: 'Accessibility' },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-black dark:text-white/90 hover:text-gold transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-black/10 dark:border-white/[0.08] pt-8 text-center text-[13px] text-black/70 dark:text-white/60">
            &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
