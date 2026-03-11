import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'For Students — Teaching Labs',
  description:
    'Every student supported. Every student moving forward. Teaching Labs helps students get guidance when they need it, without interrupting the flow of your classroom.',
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

/* ─── Scenario moment bullet ─── */
function MomentItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 font-body text-base text-text-secondary leading-[1.6]">
      <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0 opacity-70" />
      <span>{children}</span>
    </div>
  );
}

/* ─── Photo placeholder (replaces the actual img tags from the HTML) ─── */
function ScenarioPhoto({ label, gradient }: { label: string; gradient: string }) {
  return (
    <div
      className={`w-full h-64 md:h-80 flex items-center justify-center rounded-[20px] ${gradient}`}
      role="img"
      aria-label={label}
    >
      <div className="text-center p-8 opacity-60">
        <div className="w-16 h-16 rounded-full bg-white/30 mx-auto mb-3 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-8 h-8 text-white"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <p className="text-white/80 text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ─── Scenario section heading + body wrapper ─── */
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
        <div className="max-w-[760px] mx-auto">{children}</div>
      </div>
    </section>
  );
}

function ScenarioHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-heading font-extrabold text-text-primary mb-6 leading-[1.2]"
      style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-1px' }}
    >
      {children}
    </h2>
  );
}

function ScenarioBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">{children}</p>
  );
}

function ScenarioResolve({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
      {children}
    </p>
  );
}

/* ─── Page ─── */
export default function ForStudentsPage() {
  return (
    <div
      className="min-h-screen bg-warm-white text-text-secondary overflow-x-hidden"
      style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}
    >
      {/* ── NAV ── */}
      <MarketingNav />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-warm-white">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="blob-teal absolute w-[500px] h-[500px] rounded-full top-[10%] left-[15%] max-md:w-[300px] max-md:h-[300px]"
            style={{ background: '#4FA3A5', filter: 'blur(80px)', opacity: '0.08' }}
          />
          <div
            className="blob-gold absolute w-[450px] h-[450px] rounded-full top-[30%] right-[10%] max-md:w-[280px] max-md:h-[280px]"
            style={{ background: '#F0C95D', filter: 'blur(80px)', opacity: '0.10' }}
          />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            For Students
          </div>

          {/* Headline — 6 words with staggered reveal */}
          <h1
            className="font-heading font-extrabold leading-[1.05] text-text-primary mb-6"
            style={{ fontSize: 'clamp(42px, 7vw, 76px)', letterSpacing: '-2px' }}
          >
            <span className="hero-word hero-word-0 mr-2">Every</span>{' '}
            <span className="hero-word hero-word-1 mr-2">Student</span>{' '}
            <span className="hero-word hero-word-2 mr-2">Supported.</span>{' '}
            <span className="hero-word hero-word-3 mr-2">Every</span>{' '}
            {/* Words 4–5 extend the pattern with inline delays */}
            <span className="hero-word mr-2" style={{ animationDelay: '0.9s' }}>
              Student
            </span>{' '}
            <span
              className="hero-word"
              style={{
                animationDelay: '1.05s',
                background: 'linear-gradient(135deg, #4FA3A5, #F0C95D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Moving Forward.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-subtitle-anim font-body text-xl leading-[1.7] text-text-secondary mb-4 max-w-[620px] mx-auto"
            style={{ animationDelay: '1.4s' }}
          >
            Teaching Labs helps your students get guidance when they need it, without interrupting
            the flow of your classroom. When one student needs extra help and another is ready to
            move ahead, Teaching Labs helps keep everyone learning.
          </p>

          {/* Tagline */}
          <p
            className="hero-subtitle-anim font-heading text-xl font-bold text-gold mb-8"
            style={{ animationDelay: '1.6s' }}
          >
            Your teaching. Extended to every student.
          </p>

          {/* CTA button */}
          <div
            className="hero-buttons-anim flex gap-4 justify-center flex-wrap"
            style={{ animationDelay: '1.8s' }}
          >
            <Link
              href="/see-the-difference"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-transparent text-text-primary px-10 py-4 rounded-full border-4 border-gold hover:-translate-y-0.5 hover:bg-gold hover:text-deep-navy transition-all duration-300"
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
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <ScrollReveal />
      <main>

        {/* ── SCENARIO 1: When You're Helping One Student ── */}
        <ScenarioSection bg="bg-warm-white">
          <ScenarioHeading>When You&apos;re Helping One Student...</ScenarioHeading>
          <p className="font-body text-lg text-text-secondary leading-[1.7] mb-7">
            Across the classroom, other students are still learning.
          </p>
          <div className="flex flex-col gap-3.5 mb-7">
            <MomentItem>A student gets stuck on the next step</MomentItem>
            <MomentItem>Another finishes early with nothing to do</MomentItem>
            <MomentItem>A third needs a different explanation than the one you gave</MomentItem>
          </div>
          <ScenarioResolve>
            Teaching Labs helps guide those moments using your teaching style, so students keep
            moving forward even when you&apos;re focused elsewhere.
          </ScenarioResolve>
        </ScenarioSection>

        {/* Photo 1 */}
        <div className="fade-up bg-warm-white py-12 px-12 max-md:px-6">
          <div className="feat-photo-hover max-w-[760px] mx-auto rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
            <Image src="/images/classroom-wide-angle.jpg" alt="Busy classroom with students working on laptops while teacher instructs" width={760} height={400} className="w-full object-cover" />
          </div>
        </div>

        {/* ── SCENARIO 2: Students Get Help Without Waiting ── */}
        <ScenarioSection bg="bg-bg-secondary">
          <ScenarioHeading>Students Get Help Without Waiting</ScenarioHeading>
          <ScenarioBody>
            Students can ask questions, practice skills, and work through challenges without waiting
            for the teacher to become available.
          </ScenarioBody>
          <ScenarioBody>Support reflects how you teach, not generic responses.</ScenarioBody>
          <ScenarioBody>Students can:</ScenarioBody>
          <div className="flex flex-col gap-3.5 mb-7">
            <MomentItem>Ask for help</MomentItem>
            <MomentItem>Try again</MomentItem>
            <MomentItem>See the idea explained a different way</MomentItem>
          </div>
          <ScenarioResolve>
            All without needing to raise their hand or stop the lesson.
          </ScenarioResolve>
        </ScenarioSection>

        {/* ── SCENARIO 3: Strong Students Keep Moving ── */}
        <ScenarioSection bg="bg-warm-white">
          <ScenarioHeading>Strong Students Keep Moving</ScenarioHeading>
          <ScenarioBody>
            When students are ready to go further, Teaching Labs provides deeper challenges and
            extensions of the lesson.
          </ScenarioBody>
          <ScenarioBody>
            No more early finishers sitting idle. No extra preparation required.
          </ScenarioBody>
          <ScenarioBody>Students can explore:</ScenarioBody>
          <div className="flex flex-col gap-3.5">
            <MomentItem>Enrichment activities that extend the lesson</MomentItem>
            <MomentItem>Deeper exploration at their pace</MomentItem>
            <MomentItem>Advanced challenges connected to what they&apos;re learning</MomentItem>
          </div>
        </ScenarioSection>

        {/* Photo 2 */}
        <div className="fade-up bg-warm-white py-12 px-12 max-md:px-6">
          <div className="feat-photo-hover max-w-[760px] mx-auto rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
            <Image src="/images/student-independent-learning.jpg" alt="Student focused on independent learning with headphones and laptop" width={760} height={400} className="w-full object-cover" />
          </div>
        </div>

        {/* ── SCENARIO 4: Guidance That Feels Familiar ── */}
        <ScenarioSection bg="bg-bg-secondary">
          <ScenarioHeading>Students Learn With Guidance That Feels Familiar</ScenarioHeading>
          <ScenarioBody>
            Teaching Labs reflects how you explain ideas, guide students, and respond when they
            struggle.
          </ScenarioBody>
          <ScenarioBody>
            That means the support students receive stays connected to your classroom and your
            teaching style.
          </ScenarioBody>
          <ScenarioResolve>
            Students are never learning from a random system. They&apos;re learning through guidance
            built from their teacher.
          </ScenarioResolve>
        </ScenarioSection>

        {/* ── SCENARIO 5: Learning Doesn't Stop ── */}
        <ScenarioSection bg="bg-warm-white">
          <ScenarioHeading>Learning Doesn&apos;t Stop When Class Ends</ScenarioHeading>
          <ScenarioBody>
            Whether students are working independently, reviewing a lesson, or exploring something
            new, Teaching Labs helps them keep learning.
          </ScenarioBody>
          <ScenarioResolve>
            The support they receive stays connected to the way you teach in class.
          </ScenarioResolve>
        </ScenarioSection>

        {/* ── GAINS SECTION (dark navy bg) ── */}
        <section className="fade-up" style={{ background: '#0B1426' }}>
          <div className="max-w-[1200px] mx-auto px-12 py-24 text-center max-md:px-6 max-md:py-16">
            <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-12"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.3)' }} />
              What This Means for Your Students
            </div>
            <div className="grid grid-cols-3 gap-12 max-md:grid-cols-1 max-md:gap-9">
              {[
                { word: 'Confidence', desc: 'More confidence when they get stuck.' },
                { word: 'Challenge', desc: "More challenge when they're ready." },
                { word: 'Opportunity', desc: 'More opportunities to keep learning.' },
              ].map(({ word, desc }) => (
                <div key={word} className="text-center">
                  <div
                    className="font-heading text-[40px] font-extrabold mb-3 leading-tight"
                    style={{
                      background: 'linear-gradient(135deg, #4FA3A5, #F0C95D)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {word}
                  </div>
                  <p
                    className="font-body text-base leading-[1.7]"
                    style={{ color: 'rgba(255,255,255,0.72)' }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
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

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-36 text-center max-md:px-6 max-md:py-20">
            <div className="font-heading text-xs font-bold tracking-[4px] uppercase mb-5"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              Early Access
            </div>
            <h2
              className="font-heading font-extrabold text-white mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-1.5px' }}
            >
              Ready to See Every Student Supported?
            </h2>
            <p
              className="text-lg leading-[1.7] mb-10 max-w-[600px] mx-auto"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Get early access to Teaching Labs and give your students guidance that reflects how
              you teach.
            </p>
            <Link
              href="/contact"
              className="cta-button-pulse inline-flex items-center font-heading text-[17px] font-bold bg-gold text-deep-navy px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
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
              <p className="text-sm leading-[1.7] mb-5 max-w-[280px]"
                style={{ color: 'rgba(255,255,255,0.55)' }}>
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
              <div
                className="font-heading text-[13px] font-bold tracking-[2px] uppercase mb-5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
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
                      className="text-sm hover:text-gold transition-colors duration-200"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div
                className="font-heading text-[13px] font-bold tracking-[2px] uppercase mb-5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
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
                      className="text-sm hover:text-gold transition-colors duration-200"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div
                className="font-heading text-[13px] font-bold tracking-[2px] uppercase mb-5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
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
                      className="text-sm hover:text-gold transition-colors duration-200"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div
            className="border-t border-white/[0.08] pt-8 text-center text-[13px]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
