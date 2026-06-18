import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';
import MarketingFooter from '@/components/shared/MarketingFooter';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Teaching Labs exists because great teachers deserve tools designed with them in mind. Built by a teacher, for every teacher.',
};

/* ─── Shared Components ─── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-eyebrow font-extrabold flex items-center justify-center gap-3 font-heading text-sm font-bold tracking-[4px] uppercase mb-4">
      <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
      {children}
    </div>
  );
}

function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-underline bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl p-8 pl-6 max-w-3xl font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary mx-auto max-md:text-xl max-md:p-6 max-md:pl-5">
      {children}
    </div>
  );
}

/* ─── Value Card with animated SVG icon ─── */
function ValueCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="card-accent relative bg-card-bg rounded-[20px] p-9 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300">
      <div className="mb-5 card-icon-float-1">{icon}</div>
      <h3 className="font-heading text-[17px] font-bold text-text-primary tracking-[-0.2px] mb-3">{title}</h3>
      <p className="text-[15px] leading-[1.78] text-text-secondary">{text}</p>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function OurStoryPage() {
  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="section-blend relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-deep-navy">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="blob-teal absolute w-[600px] h-[600px] rounded-full top-[8%] left-[5%] max-md:w-[350px] max-md:h-[350px] opacity-[0.15] dark:opacity-[0.10]"
            style={{ background: '#00F6ED', filter: 'blur(100px)' }} />
          <div className="blob-gold absolute w-[550px] h-[550px] rounded-full top-[20%] right-[2%] max-md:w-[320px] max-md:h-[320px] opacity-[0.15] dark:opacity-[0.10]"
            style={{ background: '#4056F4', filter: 'blur(100px)' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full top-[55%] left-[15%] opacity-[0.07] dark:opacity-[0.1] max-md:hidden"
            style={{ background: '#561F37', filter: 'blur(100px)' }} />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          <div className="text-eyebrow font-extrabold inline-flex items-center gap-3 font-heading text-sm font-bold tracking-[4px] uppercase mb-6">
            <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
            About Us
          </div>

          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}
          >
            <span className="text-text-primary hero-word hero-word-0 dark:text-white">Built to Support</span>
            <br />
            <span className="text-text-primary hero-word hero-word-1 dark:text-white">For</span>{' '}
            <span
              className="hero-word hero-word-2"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Every
            </span>{' '}
            <span className="text-text-primary hero-word hero-word-3 dark:text-white">Teacher.</span>
          </h1>

          <p className="hero-subtitle-anim text-text-primary font-body text-xl leading-[1.7] mb-10 max-w-[620px] mx-auto dark:!text-white/70">
            Teaching Labs exists because great teachers deserve tools designed with them in mind — grounded in science, built to give time back, and focused on what actually helps students learn.
          </p>

          <div className="hero-buttons-anim flex gap-4 justify-center flex-wrap mb-8">
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              See How It Works
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      <main>

        {/* ── OUR MISSION ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Our Mission</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                We Believe Every Teacher Deserves a Platform That Puts Learning First
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Most educational technology is sold to administrators and used by teachers who had no say in the purchase. The tools don&apos;t reflect how teaching actually works — they don&apos;t account for the thirty different learners in a single classroom, the prep time that bleeds into evenings, or the invisible labor that keeps a room functioning.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs was built backwards from that problem. Every decision starts with one question: does this make a teacher&apos;s work genuinely better? If the answer isn&apos;t clearly yes, it doesn&apos;t ship.
              </p>
              <Bridge>Not better for a committee reviewing a procurement deck. Better for the person standing in front of 28 kids on a Thursday afternoon.</Bridge>
              {/* Photo */}
              <div className="mt-10 feat-photo-hover">
                <Image
                  src="https://images.unsplash.com/photo-1588072432836-e10032774350?w=900&q=80&auto=format&fit=crop"
                  alt="Students engaged in collaborative, hands-on learning"
                  width={760} height={400}
                  className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── OUR STORY ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Our Story</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Nearly Three Decades in the Making
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <Bridge>&ldquo;I&apos;ve spent almost thirty years inside education technology, and the same question has followed me the entire time: does this actually help students learn?&rdquo;</Bridge>

              <div className="mt-10 space-y-5">
                <p className="text-[17px] text-text-secondary leading-[1.8]">
                  Dottie Stewart started in the classroom. Psychology and sociology shaped how she understood learners. A Masters in Teaching gave her the framework. Years with students gave her the instincts no degree provides.
                </p>
                <p className="text-[17px] text-text-secondary leading-[1.8]">
                  When she moved into EdTech, she carried that question with her through every wave: smart boards, clickers, one-to-one devices, 3D printers. Every time, the technology arrived with big promises. Every time, the same pattern followed.
                </p>
                <p className="text-[17px] text-text-secondary leading-[1.8]">
                  Take 3D printing. Incredibly powerful. Teaches design thinking, problem-solving, real-world engineering skills. And still, years later, it&apos;s not widely adopted. Why? The same underlying realities that have always existed: not enough time, not enough resources, and no matter how hard teachers try, not enough of them to go around.
                </p>
                <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                  The technology was never the problem. The problem was that nobody built it around the reality of being a teacher.
                </p>
                <p className="text-[17px] text-text-secondary leading-[1.8]">
                  Then AI arrived. And she watched the industry rush to build tools that generate answers, automate lesson plans, and replace the parts of teaching that were never the real challenge. The real challenge has always been the same: how do you reach every student, every day, when each one learns differently, and there&apos;s only one of you?
                </p>
                <p className="text-[17px] text-text-secondary leading-[1.8]">
                  After nearly three decades of watching that question go unanswered, she stopped waiting for someone else to build the right thing.
                </p>
              </div>

              <div className="mt-8">
                <Bridge>Teaching Labs is the platform she always wished existed. AI that scaffolds learning instead of replacing thinking. Technology designed to work alongside real books, real experiments, and real teaching.</Bridge>
              </div>

              {/* Photo */}
              <div className="mt-10 feat-photo-hover">
                <Image
                  src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=900&q=80&auto=format&fit=crop"
                  alt="Educator presenting and leading instruction"
                  width={760} height={400}
                  className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT WE BELIEVE ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>What We Believe</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                The Principles That Guide Every Decision
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1 fade-up">
              <ValueCard
                icon={
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M24,8 A16,16 0 0 1 40,24" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M24,13 A11,11 0 0 1 35,24" stroke="var(--color-teal)" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
                    <path d="M24,18 A6,6 0 0 1 30,24" stroke="var(--color-teal)" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
                    <circle cx="24" cy="24" r="3.5" fill="var(--color-teal)" />
                  </svg>
                }
                title="Teachers Are the Point"
                text="AI doesn't replace teachers. It gives great teachers more reach, more time, and more room to do what only humans can do — build the relationships that make learning possible."
              />
              <ValueCard
                icon={
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <ellipse cx="24" cy="24" rx="19" ry="8" stroke="var(--color-teal)" strokeWidth="2" transform="rotate(35 24 24)" opacity="0.85" />
                    <ellipse cx="24" cy="24" rx="19" ry="8" stroke="var(--color-teal)" strokeWidth="1.4" transform="rotate(-35 24 24)" opacity="0.4" />
                    <circle cx="24" cy="24" r="3.5" fill="var(--color-teal)" />
                  </svg>
                }
                title="Grounded in Brain Science"
                text="Every feature traces back to research on memory, attention, retrieval, and cognitive load. We didn't start with a product spec — we started with how humans actually learn."
              />
              <ValueCard
                icon={
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <circle cx="24" cy="24" r="4" fill="var(--color-teal)" />
                    <circle cx="24" cy="10" r="2.5" fill="var(--color-teal)" opacity="0.5" />
                    <circle cx="24" cy="38" r="2.5" fill="var(--color-teal)" opacity="0.5" />
                    <circle cx="10" cy="24" r="2.5" fill="var(--color-teal)" opacity="0.5" />
                    <circle cx="38" cy="24" r="2.5" fill="var(--color-teal)" opacity="0.5" />
                    <circle cx="14.4" cy="14.4" r="2" fill="var(--color-teal)" opacity="0.28" />
                    <circle cx="33.6" cy="33.6" r="2" fill="var(--color-teal)" opacity="0.28" />
                    <circle cx="14.4" cy="33.6" r="2" fill="var(--color-teal)" opacity="0.28" />
                    <circle cx="33.6" cy="14.4" r="2" fill="var(--color-teal)" opacity="0.28" />
                  </svg>
                }
                title="Student Agency Drives Outcomes"
                text="Research is consistent: students learn more deeply when they have agency over the process. We build student agency into the architecture — not as a feature, as a foundation."
              />
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="section-blend relative overflow-hidden bg-white dark:bg-transparent">
          <div className="absolute inset-0 pointer-events-none dark:hidden" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[-10%] opacity-[0.25]"
              style={{ background: '#00F6ED', filter: 'blur(120px)' }} />
            <div className="absolute w-[450px] h-[450px] rounded-full top-[5%] right-[-8%] opacity-[0.25]"
              style={{ background: '#4056F4', filter: 'blur(120px)' }} />
            <div className="absolute w-[350px] h-[350px] rounded-full bottom-[10%] left-[40%] opacity-[0.07]"
              style={{ background: '#7B2D4A', filter: 'blur(120px)' }} />
          </div>
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, #1a3a4a 0%, #152a3a 40%, #0a1128 100%)' }} />
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-36 text-center max-md:px-6 max-md:py-20">
            <div className="text-eyebrow font-extrabold font-heading text-sm font-bold tracking-[4px] uppercase mb-5">
              Join Us
            </div>
            <h2 className="text-text-primary font-heading font-extrabold tracking-[-1.5px] mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Ready to Be Part of What We&apos;re Building?
            </h2>
            <p className="text-text-primary text-lg leading-[1.7] mb-10 max-w-[500px] mx-auto dark:!text-white/65">
              Teaching Labs is in early access. Join us now and help shape the future of AI in education.
            </p>
            <Link
              href="/contact"
              className="inline-flex justify-center items-center font-heading text-[17px] font-bold bg-transparent text-deep-navy dark:text-white border-4 border-gold hover:bg-gold hover:text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300 shadow-[0_4px_20px_rgba(64,86,244,0.3)]"
            >
              Get in Touch
            </Link>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <MarketingFooter />
    </>
  );
}
