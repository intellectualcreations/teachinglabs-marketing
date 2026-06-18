import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'For Students',
  description:
    'Every student supported. Every student moving forward. Teaching Labs helps students get guidance when they need it.',
};

/* ─── Inline SVG icons ─── */
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
    <div
      className="flex items-center gap-3.5 font-body text-base leading-[1.6]"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0 opacity-70" />
      <span>{children}</span>
    </div>
  );
}

/* ─── Scenario section wrapper (760px column) ─── */
function ScenarioSection({
  bgVar,
  children,
}: {
  bgVar: 'primary' | 'secondary';
  children: React.ReactNode;
}) {
  const bgClass = bgVar === 'primary' ? 'bg-warm-white' : 'bg-bg-secondary';
  return (
    <section className={`${bgClass} transition-[background] duration-[400ms]`}>
      <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
        <div className="fade-up max-w-[760px] mx-auto">{children}</div>
      </div>
    </section>
  );
}

function ScenarioHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-heading font-extrabold mb-6 leading-[1.2]"
      style={{
        fontSize: 'clamp(28px, 3.5vw, 40px)',
        letterSpacing: '-1px',
        color: 'var(--color-text-primary)',
      }}
    >
      {children}
    </h2>
  );
}

function ScenarioLead({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-body text-[18px] leading-[1.7] mb-7"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      {children}
    </p>
  );
}

function ScenarioBody({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-body text-[17px] leading-[1.8] mb-4"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      {children}
    </p>
  );
}

function ScenarioResolve({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-heading text-[17px] font-semibold leading-[1.6]"
      style={{ color: 'var(--color-text-primary)' }}
    >
      {children}
    </p>
  );
}

/* ─── Page ─── */
export default function ForStudentsPage() {
  return (
    <div
      className="min-h-screen bg-warm-white overflow-x-hidden"
      style={{
        fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)",
        color: 'var(--color-text-secondary)',
      }}
    >
      {/* Page-scoped style overrides (keyframes + btn variants) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
/* Hero button — outline primary, matches v4 btn-primary */
.tls-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  padding: 16px 40px;
  border-radius: 40px;
  border: 4px solid #4056F4;
  background: transparent;
  color: #0a1128;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
.tls-btn-primary:hover {
  background: #4056F4;
  color: #ffffff;
  border-color: #4056F4;
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(64, 86, 244, 0.35);
}
.dark .tls-btn-primary {
  color: #ffffff;
  box-shadow: 0 0 20px rgba(64, 86, 244, 0.2);
}
.dark .tls-btn-primary:hover {
  background: #4056F4;
  color: #ffffff;
  border-color: #4056F4;
  box-shadow: 0 6px 28px rgba(64, 86, 244, 0.4);
}

/* Hero blobs — page local (ensures coral too) */
.tls-hero-blob { position: absolute; border-radius: 50%; filter: blur(50px); transition: opacity 0.4s ease; }
.tls-blob-teal {
  width: 500px; height: 500px; background: #00F6ED; opacity: 0.30;
  top: 10%; left: 15%; animation: blobDrift1 12s ease-in-out infinite;
}
.tls-blob-gold {
  width: 450px; height: 450px; background: #4056F4; opacity: 0.25;
  top: 30%; right: 10%; animation: blobDrift2 14s ease-in-out infinite;
}
.tls-blob-coral {
  width: 350px; height: 350px; background: #561F37; opacity: 0.18;
  top: 40%; left: 40%; animation: blobDrift3 10s ease-in-out infinite;
}
.dark .tls-blob-teal { opacity: 0.15; }
.dark .tls-blob-gold { opacity: 0.10; }
.dark .tls-blob-coral { opacity: 0.12; }

@media (max-width: 900px) {
  .tls-blob-teal { width: 300px; height: 300px; opacity: 0.21; }
  .tls-blob-gold { width: 280px; height: 280px; opacity: 0.175; }
  .tls-blob-coral { display: none; }
  .dark .tls-blob-teal { opacity: 0.105; }
  .dark .tls-blob-gold { opacity: 0.07; }
}

/* CTA button pulse — v4 indigo */
.tls-cta-pulse { animation: tlsGentlePulse 2.5s ease-in-out infinite; }
@keyframes tlsGentlePulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(64, 86, 244, 0.3); }
  50% { box-shadow: 0 4px 40px rgba(64, 86, 244, 0.5); }
}

/* Scenario photo hover */
.tls-scenario-photo { border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(20, 33, 61, 0.15); }
.tls-scenario-photo img { transition: transform 0.6s ease; }
.tls-scenario-photo:hover img { transform: scale(1.03); }

/* Hero word reveal (3-line block layout) */
.tls-hero-word {
  display: block;
  opacity: 0;
  transform: translateY(40px);
  animation: tlsHeroWordReveal 0.5s ease forwards;
}
@keyframes tlsHeroWordReveal {
  to { opacity: 1; transform: translateY(0); }
}
.tls-hero-word-0 { animation-delay: 0.3s; }
.tls-hero-word-1 { animation-delay: 0.42s; }
.tls-hero-word-2 { animation-delay: 0.54s; }

.tls-hero-fade {
  opacity: 0;
  transform: translateY(20px);
  animation: tlsHeroFade 0.6s ease forwards;
}
@keyframes tlsHeroFade {
  to { opacity: 1; transform: translateY(0); }
}
.tls-hero-fade-subtitle { animation-delay: 1.2s; }
.tls-hero-fade-tagline  { animation-delay: 1.4s; }
.tls-hero-fade-buttons  { animation-delay: 1.6s; }

/* Gradient word */
.tls-hero-gradient {
  background: linear-gradient(135deg, #00F6ED, #4056F4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding-bottom: 4px;
}
.dark .tls-hero-gradient {
  filter: drop-shadow(0 0 40px rgba(64, 86, 244, 0.3));
}
          `,
        }}
      />

      {/* ── NAV ── */}
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-warm-white transition-[background] duration-[400ms]"
        id="hero"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="tls-hero-blob tls-blob-teal" />
          <div className="tls-hero-blob tls-blob-gold" />
          <div className="tls-hero-blob tls-blob-coral" />
        </div>

        <div className="relative z-[2] text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center font-heading text-xs font-bold tracking-[4px] uppercase mb-6"
            style={{ color: 'var(--tls-eyebrow, #561F37)' }}
          >
            <span
              className="w-2 h-2 rounded-full bg-gold flex-shrink-0"
              style={{ marginRight: '12px' }}
            />
            <span className="dark:text-teal">For Students</span>
          </div>

          {/* Headline — 3 block lines */}
          <h1
            className="font-heading font-extrabold mb-6"
            style={{
              fontSize: 'clamp(42px, 7vw, 76px)',
              letterSpacing: '-2px',
              lineHeight: 1.15,
              color: 'var(--color-text-primary)',
            }}
          >
            <span className="tls-hero-word tls-hero-word-0">Every Student Supported.</span>
            <span className="tls-hero-word tls-hero-word-1">Every Student</span>
            <span className="tls-hero-word tls-hero-word-2 tls-hero-gradient">
              Moving Forward.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="tls-hero-fade tls-hero-fade-subtitle font-body text-xl leading-[1.7] mb-4 max-w-[620px] mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Teaching Labs helps your students get guidance when they need it, without interrupting
            the flow of your classroom. When one student needs extra help and another is ready to
            move ahead, Teaching Labs helps keep everyone learning.
          </p>

          {/* Tagline */}
          <p className="tls-hero-fade tls-hero-fade-tagline font-heading text-xl font-bold text-gold mb-8">
            Your teaching. Extended to every student.
          </p>

          {/* CTA — outline primary */}
          <div className="tls-hero-fade tls-hero-fade-buttons flex gap-4 justify-center flex-wrap mb-8">
            <Link href="/how-it-works" className="tls-btn-primary">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main>
        {/* Scenario 1 */}
        <ScenarioSection bgVar="primary">
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
        <div className="bg-warm-white transition-[background] duration-[400ms]">
          <div className="fade-up max-w-[760px] mx-auto px-12 pb-12 max-md:px-6">
            <div className="tls-scenario-photo">
              <Image
                src="/images/classroom-wide-angle.jpg"
                alt="Busy classroom with students working on laptops while teacher instructs"
                width={760}
                height={507}
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Scenario 2 */}
        <ScenarioSection bgVar="secondary">
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

        {/* Scenario 3 */}
        <ScenarioSection bgVar="primary">
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
        <div className="bg-warm-white transition-[background] duration-[400ms]">
          <div className="fade-up max-w-[760px] mx-auto px-12 pb-12 max-md:px-6">
            <div className="tls-scenario-photo">
              <Image
                src="/images/student-independent-learning.jpg"
                alt="Student focused on independent learning with headphones and laptop"
                width={760}
                height={507}
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Scenario 4 */}
        <ScenarioSection bgVar="secondary">
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

        {/* Scenario 5 */}
        <ScenarioSection bgVar="primary">
          <ScenarioHeading>Learning Doesn&apos;t Stop When Class Ends</ScenarioHeading>
          <ScenarioBody>
            Whether students are working independently, reviewing a lesson, or exploring something
            new, Teaching Labs helps them keep learning.
          </ScenarioBody>
          <ScenarioResolve>
            The support they receive stays connected to the way you teach in class.
          </ScenarioResolve>
        </ScenarioSection>

        {/* ── GAINS — deep navy ── */}
        <section
          className="transition-[background] duration-[400ms]"
          style={{ background: '#0a1128' }}
        >
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] text-center max-md:px-6 max-md:py-[60px]">
            <div className="fade-up">
              <div
                className="inline-flex items-center font-heading text-xs font-bold tracking-[4px] uppercase mb-4"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.3)', marginRight: '12px' }}
                />
                What This Means for Your Students
              </div>
              <div className="grid grid-cols-3 gap-12 mt-12 max-md:grid-cols-1 max-md:gap-9">
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
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="relative overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, #0a1128 0%, #0e1a4a 40%, #0d4a60 75%, #14706e 100%)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)',
            }}
          />
          <div className="fade-up relative z-[2] max-w-[800px] mx-auto px-12 py-[140px] text-center max-md:px-6 max-md:py-20">
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
              className="tls-cta-pulse inline-flex items-center justify-center font-heading text-[17px] font-bold bg-gold text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
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
          borderTop: '1px solid rgba(64,86,244,0.2)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">
            {/* Brand */}
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">Teaching Labs</div>
              <p
                className="text-sm leading-[1.7] mb-5 max-w-[280px]"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                AI-powered teaching platform that learns how you teach and helps every student get
                the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(0,246,237,0.2)]">
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
                ].map(({ label, href }) => (
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
