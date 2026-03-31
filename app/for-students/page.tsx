import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'For Students — Teaching Labs',
  description:
    'Every student supported. Every student moving forward. Teaching Labs helps students get guidance when they need it.',
};

/* ─── Inline SVG icon ─── */
function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

/* ─── Scenario moment bullet ─── */
function MomentItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 font-body text-base text-text-secondary dark:text-white/70 leading-[1.6] transition-colors duration-[400ms]">
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
    <section className={`fade-up transition-colors duration-[400ms] ${bg}`}>
      <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
        <div className="max-w-[760px] mx-auto">{children}</div>
      </div>
    </section>
  );
}

function ScenarioHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-heading font-extrabold text-text-primary dark:text-white mb-6 leading-[1.2] transition-colors duration-[400ms]"
      style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-1px' }}
    >
      {children}
    </h2>
  );
}

function ScenarioLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-lg text-text-secondary dark:text-white/70 leading-[1.7] mb-7 transition-colors duration-[400ms]">{children}</p>
  );
}

function ScenarioBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[17px] text-text-secondary dark:text-white/70 leading-[1.8] mb-4 transition-colors duration-[400ms]">{children}</p>
  );
}

function ScenarioResolve({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-heading text-[17px] font-semibold text-text-primary dark:text-white leading-[1.6] transition-colors duration-[400ms]">
      {children}
    </p>
  );
}

/* ─── Page ─── */
export default function ForStudentsPage() {
  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="absolute rounded-full top-[10%] left-[15%] w-[500px] h-[500px] max-md:w-[300px] max-md:h-[300px]"
            style={{ background: '#00F6ED', filter: 'blur(80px)', opacity: 0.08 }}
          />
          <div
            className="absolute rounded-full top-[30%] right-[10%] w-[450px] h-[450px] max-md:w-[280px] max-md:h-[280px]"
            style={{ background: '#4056F4', filter: 'blur(80px)', opacity: 0.10 }}
          />
          {/* Coral blob — dark mode only in v4, but present in DOM */}
          <div
            className="absolute rounded-full top-[40%] left-[40%] w-[350px] h-[350px] opacity-0 dark:opacity-[0.06] max-md:hidden"
            style={{ background: '#561F37', filter: 'blur(80px)' }}
          />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            For Students
          </div>

          {/* Headline */}
          <h1
            className="font-heading font-extrabold leading-[1.05] text-text-primary dark:text-white mb-6 transition-colors duration-[400ms]"
            style={{ fontSize: 'clamp(42px, 7vw, 76px)', letterSpacing: '-2px' }}
          >
            Every Student Supported. Every Student{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Moving Forward.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-xl leading-[1.7] text-text-secondary dark:text-white/70 mb-4 max-w-[620px] mx-auto transition-colors duration-[400ms]">
            Teaching Labs helps your students get guidance when they need it, without interrupting
            the flow of your classroom. When one student needs extra help and another is ready to
            move ahead, Teaching Labs helps keep everyone learning.
          </p>

          {/* Tagline */}
          <p className="font-heading text-xl font-bold text-gold mb-8">
            Your teaching. Extended to every student.
          </p>

          {/* CTA — filled primary button matching v4 */}
          <div className="flex gap-4 justify-center flex-wrap max-[500px]:flex-col max-[500px]:items-center">
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-gold text-white px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(64,86,244,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.45)] transition-all duration-300 max-[500px]:w-full max-[500px]:justify-center"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main>

        {/* ── SCENARIO 1: When You're Helping One Student ── */}
        <ScenarioSection bg="bg-warm-white dark:bg-deep-navy">
          <ScenarioHeading>When You&apos;re Helping One Student...</ScenarioHeading>
          <ScenarioLead>Across the classroom, other students are still learning.</ScenarioLead>
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
        <div className="fade-up bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]" style={{ padding: '0 48px 48px' }}>
          <div className="max-w-[760px] mx-auto max-md:mx-6">
            <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
              <Image
                src="/images/classroom-wide-angle.jpg"
                alt="Busy classroom with students working on laptops while teacher instructs"
                width={760}
                height={400}
                className="w-full object-cover hover:scale-[1.03] transition-transform duration-[600ms]"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* ── SCENARIO 2: Students Get Help Without Waiting ── */}
        <ScenarioSection bg="bg-bg-secondary dark:bg-[#0D1B30]">
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
        <ScenarioSection bg="bg-warm-white dark:bg-deep-navy">
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
        <div className="fade-up bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]" style={{ padding: '0 48px 48px' }}>
          <div className="max-w-[760px] mx-auto max-md:mx-6">
            <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
              <Image
                src="/images/student-independent-learning.jpg"
                alt="Student focused on independent learning with headphones and laptop"
                width={760}
                height={400}
                className="w-full object-cover hover:scale-[1.03] transition-transform duration-[600ms]"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* ── SCENARIO 4: Guidance That Feels Familiar ── */}
        <ScenarioSection bg="bg-bg-secondary dark:bg-[#0D1B30]">
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
        <ScenarioSection bg="bg-warm-white dark:bg-deep-navy">
          <ScenarioHeading>Learning Doesn&apos;t Stop When Class Ends</ScenarioHeading>
          <ScenarioBody>
            Whether students are working independently, reviewing a lesson, or exploring something
            new, Teaching Labs helps them keep learning.
          </ScenarioBody>
          <ScenarioResolve>
            The support they receive stays connected to the way you teach in class.
          </ScenarioResolve>
        </ScenarioSection>

        {/* ── GAINS SECTION ── */}
        <section className="fade-up bg-deep-navy dark:bg-[#0D1B30] transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] text-center max-md:px-6 max-md:py-[60px]">
            <div
              className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-12"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.3)' }}
              />
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
                      background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
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
          style={{
            background: 'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)',
          }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-[140px] text-center max-md:px-6 max-md:py-20">
            <div
              className="font-heading text-xs font-bold tracking-[4px] uppercase mb-5"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
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
              className="cta-button-pulse inline-flex items-center font-heading text-[17px] font-bold bg-gold text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
            >
              Get Early Access
            </Link>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: 'linear-gradient(180deg, var(--color-deep-navy) 0%, #1a2a45 100%)',
          borderTop: '1px solid rgba(64,86,244,0.2)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-white/55 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get
                the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(0,246,237,0.2)]">
                <IconStar />
                FERPA &amp; COPPA Compliant
              </div>
            </div>
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
                    <Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
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
                    <Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
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
                    <Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.08] pt-8 text-center text-[13px] text-white/35">
            &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
