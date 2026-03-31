import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'For Teachers — Teaching Labs',
  description:
    'Teaching Labs learns how you teach and helps extend that guidance across your classroom. Support for the moments teachers face every day.',
};

/* ─── SVG Icons ─── */

function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-4 ${light ? 'text-white/50' : 'text-teal'}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${light ? 'bg-white/30' : 'bg-teal'}`} />
      {children}
    </div>
  );
}

/* ─── Moment bullet item ─── */
function MomentItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 text-base text-text-secondary leading-[1.6]">
      <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0 opacity-70" />
      <span>{children}</span>
    </div>
  );
}

/* ─── Scenario section wrapper ─── */
function ScenarioSection({
  bg,
  children,
}: {
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`fade-up ${bg}`}>
      <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
        <div className="max-w-[760px] mx-auto">
          {children}
        </div>
      </div>
    </section>
  );
}

/* ─── Scenario heading ─── */
function ScenarioHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-heading font-extrabold text-text-primary tracking-[-1px] leading-[1.2] mb-6"
      style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}
    >
      {children}
    </h2>
  );
}

/* ─── Scenario body text ─── */
function ScenarioBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
      {children}
    </p>
  );
}

/* ─── Scenario resolve (bold closing line) ─── */
function ScenarioResolve({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
      {children}
    </p>
  );
}

/* ─── Bridge quote ─── */
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-coral rounded-xl p-8 pl-6 max-w-3xl font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary mx-auto max-md:text-xl max-md:p-6 max-md:pl-5 bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)]">
      {children}
    </div>
  );
}

/* ─── Gain item ─── */
function GainItem({ word, children }: { word: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="font-heading text-[40px] font-extrabold tracking-[-0.5px] mb-3 bg-gradient-to-br from-teal to-gold bg-clip-text text-transparent">
        {word}
      </div>
      <p className="text-base text-text-secondary leading-[1.7]">{children}</p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ForTeachersPage() {
  return (
    <div className="min-h-screen bg-warm-white dark:bg-deep-navy text-text-secondary overflow-x-hidden" style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}>

      {/* ── NAV ── */}
      <MarketingNav />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy">

        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="blob-teal absolute w-[500px] h-[500px] rounded-full top-[10%] left-[15%] max-md:w-[300px] max-md:h-[300px]"
            style={{ background: 'var(--color-teal)', filter: 'blur(80px)', opacity: 0.08 }}
          />
          <div
            className="blob-gold absolute w-[450px] h-[450px] rounded-full top-[30%] right-[10%] max-md:w-[280px] max-md:h-[280px]"
            style={{ background: 'var(--color-gold)', filter: 'blur(80px)', opacity: 0.10 }}
          />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            For Teachers
          </div>

          {/* Headline — matching v4 3-line layout */}
          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] text-text-primary dark:text-white mb-6"
            style={{ fontSize: 'clamp(42px, 7vw, 76px)' }}
          >
            <span className="block">Support for the Moments</span>
            <span className="block">Teachers Face</span>
            <span className="block pb-1"
              style={{ background: 'linear-gradient(135deg, #561F37, #8B3A62)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Every Day
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle-anim font-body text-xl leading-[1.7] text-text-secondary dark:text-white/70 mb-10 max-w-[620px] mx-auto">
            Teaching Labs learns how you teach and helps extend that guidance across your classroom.
            So every student keeps learning, even when you&apos;re helping someone else.
          </p>

          {/* CTA — outline primary button matching v4 */}
          <div className="hero-buttons-anim flex gap-4 justify-center flex-wrap mb-8">
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <ScrollReveal />
      <main>

        {/* ── It Starts With You ── */}
        <ScenarioSection bg="bg-warm-white dark:bg-deep-navy">
          <ScenarioHeading>It Starts With You</ScenarioHeading>
          <ScenarioBody>Teaching Labs doesn&apos;t come preloaded with someone else&apos;s curriculum. It learns from you.</ScenarioBody>
          <ScenarioBody>
            A short setup captures how you explain concepts, how you respond when students struggle, and what matters most
            in your classroom. Upload your materials. Set your preferences. Define your rules.
          </ScenarioBody>
          <ScenarioResolve>Five minutes of setup. Not another three-hour PD session.</ScenarioResolve>
        </ScenarioSection>

        {/* ── Photo 1 ── */}
        <div className="bg-warm-white dark:bg-deep-navy">
          <div className="fade-up feat-photo-hover max-w-[760px] mx-auto px-12 pb-12 max-md:px-6 max-md:pb-8">
            <Image src="/images/homepage-hero-teacher.jpg" alt="Confident teacher engaging her classroom" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
          </div>
        </div>

        {/* ── You See Your Whole Classroom ── */}
        <ScenarioSection bg="bg-bg-secondary dark:bg-[#0D1B30]">
          <ScenarioHeading>You See Your Whole Classroom</ScenarioHeading>
          <ScenarioBody>Not 47 charts. Not another dashboard you&apos;ll never open.</ScenarioBody>
          <ScenarioBody>Teaching Labs gives you clear, simple signals about what&apos;s happening across your class right now:</ScenarioBody>
          <div className="flex flex-col gap-3.5 mb-7">
            <MomentItem>Who needs your help today</MomentItem>
            <MomentItem>Which concepts are landing and which aren&apos;t</MomentItem>
            <MomentItem>Where students are accelerating</MomentItem>
          </div>
          <ScenarioResolve>Alerts when something matters. Quiet when it doesn&apos;t.</ScenarioResolve>
        </ScenarioSection>

        {/* ── You Know What Students Are Asking ── */}
        <ScenarioSection bg="bg-warm-white dark:bg-deep-navy">
          <ScenarioHeading>You Know What Students Are Asking</ScenarioHeading>
          <ScenarioBody>
            For the first time, you have a window into the questions students ask when you&apos;re not standing next to them.
          </ScenarioBody>
          <ScenarioBody>
            Teaching Labs shows you what students asked, how the assistant responded in your style, and what patterns are
            emerging across your class.
          </ScenarioBody>
          <div className="flex flex-col gap-3.5 mb-7">
            <MomentItem>See the questions you&apos;d never hear in a full classroom</MomentItem>
            <MomentItem>Spot misconceptions before they become habits</MomentItem>
            <MomentItem>Understand how students think, not just what they scored</MomentItem>
          </div>
          <ScenarioResolve>This isn&apos;t data. It&apos;s insight into your students&apos; learning.</ScenarioResolve>
        </ScenarioSection>

        {/* ── Your Voice in the Room ── */}
        <ScenarioSection bg="bg-bg-secondary dark:bg-[#0D1B30]">
          <ScenarioHeading>Your Voice in the Room, Even When You&apos;re Not</ScenarioHeading>
          <ScenarioBody>Students don&apos;t hear a robot. They hear you.</ScenarioBody>
          <ScenarioBody>
            Teaching Labs uses your voice, your tone, and your way of explaining things. When a student asks for help
            at home, during independent work, or in the middle of a busy classroom, the guidance sounds like it&apos;s
            coming from their teacher.
          </ScenarioBody>
          <ScenarioResolve>Because the best teaching relationships are built on familiarity and trust.</ScenarioResolve>
        </ScenarioSection>

        {/* ── Photo 2 ── */}
        <div className="bg-bg-secondary dark:bg-[#0D1B30]">
          <div className="fade-up feat-photo-hover max-w-[760px] mx-auto px-12 pb-12 max-md:px-6 max-md:pb-8">
            <Image src="/images/teacher-with-student.jpg" alt="Teacher kneeling beside a student for one-on-one guidance" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
          </div>
        </div>

        {/* ── You Stay in Control ── */}
        <ScenarioSection bg="bg-warm-white dark:bg-deep-navy">
          <ScenarioHeading>You Stay in Control</ScenarioHeading>
          <ScenarioBody>You set the boundaries. You define what the assistant can and can&apos;t do. You see every conversation.</ScenarioBody>
          <div className="flex flex-col gap-3.5 mb-7">
            <MomentItem>Flagged conversations surface anything that needs your attention</MomentItem>
            <MomentItem>Safety guardrails are built in from day one</MomentItem>
            <MomentItem>FERPA and COPPA compliant. No ads. No data selling. Ever.</MomentItem>
          </div>
          <ScenarioResolve>Technology helps. But the teacher stays at the center.</ScenarioResolve>
        </ScenarioSection>

        {/* ── Bridge Quote ── */}
        <div className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 pb-16 max-md:px-6 max-md:pb-10">
            <Bridge>Teaching Labs doesn&apos;t replace great teaching. It helps great teaching reach every student.</Bridge>
          </div>
        </div>

        {/* ── Teacher Twin section (dark) ── */}
        <section className="fade-up text-center bg-deep-navy dark:bg-[#0D1B30]">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="max-w-[700px] mx-auto">
              <Eyebrow light>The Technology Behind It</Eyebrow>
              <h2
                className="font-heading font-extrabold text-white tracking-[-1.5px] leading-[1.15] mb-6"
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
              >
                Your Teacher Twin at Work
              </h2>
              <p className="text-[18px] text-white/70 leading-[1.8] mb-5">
                Teaching Labs learns how you explain concepts, guide students, and respond to mistakes. Over time it
                creates a Teacher Twin: an assistant that reflects your teaching style across the classroom.
              </p>
              <p className="font-heading text-[22px] font-bold text-gold tracking-[0.02em]">
                Your expertise. Extended.
              </p>
            </div>
          </div>
        </section>

        {/* ── What Teachers Gain Back ── */}
        <section className="fade-up bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-12">
              <Eyebrow>What You Gain Back</Eyebrow>
            </div>
            <div className="grid grid-cols-3 gap-12 max-md:grid-cols-1 max-md:gap-9">
              <GainItem word="Time">
                Less time managing gaps. More time doing what you became a teacher to do.
              </GainItem>
              <GainItem word="Focus">
                Clear signals instead of noise. Know exactly where your attention is needed.
              </GainItem>
              <GainItem word="Energy">
                Stop trying to be everywhere at once. Your teaching reaches every student without burning you out.
              </GainItem>
            </div>
          </div>
        </section>

        {/* ── Closing Line ── */}
        <section className="fade-up bg-bg-secondary dark:bg-[#0D1B30]">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center max-w-[760px] mx-auto">
              <p
                className="font-heading font-semibold text-text-primary leading-[1.55] tracking-[-0.3px]"
                style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}
              >
                Teaching Labs doesn&apos;t replace great teaching.
                <br />
                It helps great teaching reach every student.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section
          className="fade-up relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0a1128 0%, #1a3a4a 50%, #1d4a52 100%)' }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-36 text-center max-md:px-6 max-md:py-20">
            <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-white/50 mb-5">
              Early Access
            </div>
            <h2
              className="font-heading font-extrabold tracking-[-1.5px] text-white mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
            >
              Ready to Meet Your Teacher Twin?
            </h2>
            <p className="text-lg leading-[1.7] text-white/65 mb-10 max-w-[600px] mx-auto">
              Get early access to create an AI assistant built from your teaching style. Be among the first to see
              what&apos;s possible.
            </p>
            <Link
              href="/contact"
              className="cta-button-pulse inline-flex items-center font-heading text-[17px] font-bold bg-transparent text-white border-4 border-gold hover:bg-gold px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
            >
              Get Early Access
            </Link>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(64,86,244,0.2)]" style={{ background: 'linear-gradient(180deg, #0a1128 0%, #0e1a35 100%)' }}>
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">

            {/* Brand */}
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-white/55 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(0,246,237,0.2)]">
                <IconStar />
                FERPA &amp; COPPA Compliant
              </div>
            </div>

            {/* Platform */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Platform</div>
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
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Company</div>
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
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Legal</div>
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
