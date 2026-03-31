import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import MarketingNav from '@/components/shared/MarketingNav';

export const metadata: Metadata = {
  title: 'Our Story — Teaching Labs',
  description:
    'Teaching Labs exists because great teachers deserve tools designed with them in mind. Built by a teacher, for every teacher.',
};

export default function OurStoryPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] bg-teal opacity-[0.08] dark:opacity-[0.15] top-[10%] left-[15%] animate-[blobDrift1_12s_ease-in-out_infinite] max-md:w-[300px] max-md:h-[300px]" />
          <div className="absolute w-[450px] h-[450px] rounded-full blur-[80px] bg-gold opacity-[0.1] dark:opacity-[0.12] top-[30%] right-[10%] animate-[blobDrift2_14s_ease-in-out_infinite] max-md:w-[280px] max-md:h-[280px]" />
          <div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] bg-coral opacity-0 dark:opacity-[0.06] top-[40%] left-[40%] animate-[blobDrift3_10s_ease-in-out_infinite] max-md:hidden" />
        </div>

        <div className="relative z-[2] text-center max-w-[900px] px-12 max-md:px-6">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
            About Us
          </div>
          <h1 className="font-heading text-[clamp(40px,6vw,72px)] font-extrabold tracking-[-2px] leading-[1.1] text-text-primary dark:text-white mb-6">
            Built by a Teacher.
            <br />
            For{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Every
            </span>{' '}
            Teacher.
          </h1>
          <p className="font-body text-xl leading-[1.7] text-text-secondary dark:text-white/70 mb-10 max-w-[620px] mx-auto">
            Teaching Labs exists because great teachers deserve tools designed with them in mind
            — grounded in science, built to give time back, and focused on what actually helps
            students learn.
          </p>
          <div className="flex gap-4 justify-center flex-wrap mb-6 max-[500px]:flex-col max-[500px]:items-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-gold text-white px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(64,86,244,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.45)] transition-all duration-300 max-[500px]:w-full max-[500px]:justify-center"
            >
              See How It Works
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 font-heading text-base font-semibold bg-transparent text-teal dark:text-white px-10 py-4 rounded-full border-2 border-teal hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all duration-300 max-[500px]:w-full max-[500px]:justify-center"
            >
              Join the Waitlist
            </Link>
          </div>
          <p className="font-heading text-[13px] text-text-tertiary dark:text-white/45">
            Built by educators, for educators.
          </p>
        </div>
      </section>

      <main>
        {/* Founder Image */}
        <div className="fade-up max-w-[480px] mx-auto my-10 px-10 max-md:px-6">
          <Image
            src="/images/founder-portrait.jpg"
            alt="Education leader and Teaching Labs founder"
            width={480}
            height={600}
            className="w-full rounded-[20px] shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
          />
        </div>

        {/* Mission Section */}
        <section className="bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="fade-up grid grid-cols-2 gap-20 items-center max-md:grid-cols-1 max-md:gap-12">
              <div>
                <span className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
                  Our Mission
                </span>
                <h2 className="font-heading text-[clamp(26px,2.8vw,40px)] font-extrabold text-text-primary dark:text-white leading-[1.2] mb-6 tracking-[-0.5px]">
                  We believe every teacher deserves a platform that puts learning first.
                </h2>
                <p className="font-body text-base leading-[1.88] text-text-secondary dark:text-white/70">
                  Most educational technology is sold to administrators and used by teachers who
                  had no say in the purchase. The tools don&apos;t reflect how teaching actually
                  works — they don&apos;t account for the thirty different learners in a single
                  classroom, the prep time that bleeds into evenings, or the invisible labor that
                  keeps a room functioning.
                </p>
                <p className="font-body text-base leading-[1.88] text-text-secondary dark:text-white/70 mt-[18px]">
                  Teaching Labs was built backwards from that problem. Every decision starts with
                  one question: does this make a teacher&apos;s work genuinely better? If the
                  answer isn&apos;t clearly yes, it doesn&apos;t ship.
                </p>
                <p className="font-body text-base leading-[1.88] text-text-secondary dark:text-white/70 mt-[18px]">
                  Not better for a committee reviewing a procurement deck. Better for the person
                  standing in front of 28 kids on a Thursday afternoon.
                </p>
              </div>
              <div>
                <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
                  <Image
                    src="https://images.unsplash.com/photo-1588072432836-e10032774350?w=900&q=80&auto=format&fit=crop"
                    alt="Students engaged in collaborative, hands-on learning"
                    width={900}
                    height={440}
                    className="w-full h-[440px] object-cover block"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-bg-secondary dark:bg-[#0D1B30] transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="fade-up grid grid-cols-2 gap-20 items-start max-md:grid-cols-1 max-md:gap-12">
              <div>
                <span className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
                  Our Story
                </span>
                <div className="text-[clamp(22px,2.4vw,36px)] font-medium italic font-heading text-text-primary dark:text-white leading-[1.4] tracking-[-0.5px] border-l-4 border-coral p-6 pl-7 mb-10 bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl">
                  &ldquo;I&apos;ve spent almost thirty years inside education technology, and the
                  same question has followed me the entire time: does this actually help students
                  learn?&rdquo;
                </div>
                <div className="space-y-5">
                  <p className="font-body text-base leading-[1.9] text-text-secondary dark:text-white/70">
                    Dottie Stewart started in the classroom. Psychology and sociology shaped how
                    she understood learners. A Masters in Teaching gave her the framework. Years
                    with students gave her the instincts no degree provides.
                  </p>
                  <p className="font-body text-base leading-[1.9] text-text-secondary dark:text-white/70">
                    When she moved into EdTech, she carried that question with her through every
                    wave: smart boards, clickers, one-to-one devices, 3D printers. Every time,
                    the technology arrived with big promises. Every time, the same pattern
                    followed.
                  </p>
                  <p className="font-body text-base leading-[1.9] text-text-secondary dark:text-white/70">
                    Take 3D printing. Incredibly powerful. Teaches design thinking,
                    problem-solving, real-world engineering skills. And still, years later,
                    it&apos;s not widely adopted. Why? The same underlying realities that have
                    always existed: not enough time, not enough resources, and no matter how hard
                    teachers try, not enough of them to go around.
                  </p>
                  <p className="font-body text-base leading-[1.9] text-text-secondary dark:text-white/70">
                    The technology was never the problem. The problem was that nobody built it
                    around the reality of being a teacher.
                  </p>
                  <p className="font-body text-base leading-[1.9] text-text-secondary dark:text-white/70">
                    Then AI arrived. And she watched the industry rush to build tools that
                    generate answers, automate lesson plans, and replace the parts of teaching
                    that were never the real challenge. The real challenge has always been the
                    same: how do you reach every student, every day, when each one learns
                    differently, and there&apos;s only one of you?
                  </p>
                  <p className="font-body text-base leading-[1.9] text-text-secondary dark:text-white/70">
                    After nearly three decades of watching that question go unanswered, she
                    stopped waiting for someone else to build the right thing.
                  </p>
                  <p className="font-body text-base leading-[1.9] text-text-secondary dark:text-white/70">
                    Teaching Labs is the platform she always wished existed. AI that scaffolds
                    learning instead of replacing thinking. Technology designed to work alongside
                    real books, real experiments, and real teaching. Built around brain science,
                    designed with educators, and focused on what actually helps students learn.
                  </p>
                </div>
              </div>
              <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)] sticky top-[100px] max-md:static">
                <Image
                  src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=900&q=80&auto=format&fit=crop"
                  alt="Educator presenting and leading instruction"
                  width={900}
                  height={520}
                  className="w-full h-[520px] object-cover block"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="fade-up">
              <span className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
                What We Believe
              </span>
              <h2 className="font-heading text-[clamp(26px,2.8vw,40px)] font-extrabold text-text-primary dark:text-white leading-[1.2] mb-12 tracking-[-0.5px]">
                The principles that guide every product decision.
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-14 max-md:grid-cols-1">
              {/* Value Card 1 */}
              <div className="fade-up bg-white dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] rounded-[20px] p-10 px-8 relative overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(86,31,55,0.06)] transition-all duration-[400ms] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-teal/30 before:rounded-l-[20px] dark:before:hidden">
                <div className="mb-6">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M24,8 A16,16 0 0 1 40,24" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M24,13 A11,11 0 0 1 35,24" stroke="var(--color-teal)" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
                    <path d="M24,18 A6,6 0 0 1 30,24" stroke="var(--color-teal)" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
                    <circle cx="24" cy="24" r="3.5" fill="var(--color-teal)" />
                  </svg>
                </div>
                <h3 className="font-heading text-[19px] font-bold text-text-primary dark:text-white mb-3">
                  Teachers Are the Point
                </h3>
                <p className="font-body text-[15px] leading-[1.78] text-text-secondary dark:text-white/70">
                  AI doesn&apos;t replace teachers. It gives great teachers more reach, more
                  time, and more room to do what only humans can do — build the relationships
                  that make learning possible.
                </p>
              </div>

              {/* Value Card 2 */}
              <div className="fade-up bg-white dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] rounded-[20px] p-10 px-8 relative overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(86,31,55,0.06)] transition-all duration-[400ms] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-teal/30 before:rounded-l-[20px] dark:before:hidden">
                <div className="mb-6">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <ellipse cx="24" cy="24" rx="19" ry="8" stroke="var(--color-teal)" strokeWidth="2" transform="rotate(35 24 24)" opacity="0.85" />
                    <ellipse cx="24" cy="24" rx="19" ry="8" stroke="var(--color-teal)" strokeWidth="1.4" transform="rotate(-35 24 24)" opacity="0.4" />
                    <circle cx="24" cy="24" r="3.5" fill="var(--color-teal)" />
                  </svg>
                </div>
                <h3 className="font-heading text-[19px] font-bold text-text-primary dark:text-white mb-3">
                  Grounded in Brain Science
                </h3>
                <p className="font-body text-[15px] leading-[1.78] text-text-secondary dark:text-white/70">
                  Every feature traces back to research on memory, attention, retrieval, and
                  cognitive load. We didn&apos;t start with a product spec — we started with how
                  humans actually learn.
                </p>
              </div>

              {/* Value Card 3 */}
              <div className="fade-up bg-white dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] rounded-[20px] p-10 px-8 relative overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(86,31,55,0.06)] transition-all duration-[400ms] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-teal/30 before:rounded-l-[20px] dark:before:hidden">
                <div className="mb-6">
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
                </div>
                <h3 className="font-heading text-[19px] font-bold text-text-primary dark:text-white mb-3">
                  Student Agency Drives Outcomes
                </h3>
                <p className="font-body text-[15px] leading-[1.78] text-text-secondary dark:text-white/70">
                  Research is consistent: students learn more deeply when they have agency over
                  the process. We build student agency into the architecture — not as a feature,
                  as a foundation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="relative overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)',
            }}
          />
          <div className="fade-up max-w-[800px] mx-auto px-12 py-[120px] text-center relative z-[2] max-md:px-6 max-md:py-20">
            <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1px] text-white mb-5 leading-[1.2]">
              Ready to Be Part of What We&apos;re Building?
            </h2>
            <p className="text-[17px] leading-[1.7] text-white/65 mb-10 max-w-[500px] mx-auto">
              Teaching Labs is in early access. Join us now and help shape the future of AI in
              education.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center font-heading text-[17px] font-bold bg-gold text-white px-12 py-4 rounded-full shadow-[0_4px_20px_rgba(64,86,244,0.3)] hover:-translate-y-0.5 transition-transform duration-300"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          background:
            'linear-gradient(180deg, var(--color-deep-navy) 0%, #1a2a45 100%)',
          borderTop: '1px solid rgba(64,86,244,0.2)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">
                Teaching Labs
              </div>
              <p className="text-sm leading-[1.7] text-white/55 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student
                get the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(0,246,237,0.2)]">
                <svg
                  viewBox="0 0 14 14"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
                </svg>
                FERPA &amp; COPPA Compliant
              </div>
            </div>
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
          <div className="border-t border-white/[0.08] pt-8 text-center text-[13px] text-white/35">
            &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
