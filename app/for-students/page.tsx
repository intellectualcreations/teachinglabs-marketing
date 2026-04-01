import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';
import MarketingFooter from '@/components/shared/MarketingFooter';

export const metadata: Metadata = {
  title: 'For Students — Teaching Labs',
  description:
    'Every student supported. Every student moving forward. Teaching Labs helps students get guidance when they need it.',
};

/* ─── SVG Icons ─── */

/* ─── Eyebrow label (matches homepage) ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-eyebrow font-extrabold flex items-center justify-center gap-3 font-heading text-sm font-bold tracking-[4px] uppercase mb-4">
      <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
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

/* ─── Bridge quote (matches homepage) ─── */
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-underline bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl p-8 pl-6 max-w-3xl font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary mx-auto max-md:text-xl max-md:p-6 max-md:pl-5">
      {children}
    </div>
  );
}

/* ─── Gain item ─── */
function GainItem({ word, children }: { word: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <div
        className="font-heading text-[40px] font-extrabold tracking-[-0.5px] mb-3"
        style={{
          background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {word}
      </div>
      <p className="text-base text-text-secondary leading-[1.7]">{children}</p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ForStudentsPage() {
  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy">
        {/* Decorative blobs — matching homepage */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="blob-teal absolute w-[600px] h-[600px] rounded-full top-[8%] left-[5%] max-md:w-[350px] max-md:h-[350px] opacity-[0.15] dark:opacity-[0.10]"
            style={{ background: '#00F6ED', filter: 'blur(100px)' }} />
          <div className="blob-gold absolute w-[550px] h-[550px] rounded-full top-[20%] right-[2%] max-md:w-[320px] max-md:h-[320px] opacity-[0.15] dark:opacity-[0.10]"
            style={{ background: '#4056F4', filter: 'blur(100px)' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full top-[55%] left-[15%] opacity-[0.07] dark:opacity-[0.1] max-md:hidden"
            style={{ background: '#561F37', filter: 'blur(100px)' }} />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-[200px] dark:hidden"
            style={{ background: 'linear-gradient(to bottom, transparent, #F7F7F8)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] hidden dark:block"
            style={{ background: 'linear-gradient(to bottom, transparent, #0a1128)' }} />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="text-eyebrow font-extrabold inline-flex items-center gap-3 font-heading text-sm font-bold tracking-[4px] uppercase mb-6">
            <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
            For Students
          </div>

          {/* Headline */}
          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}
          >
            <span className="text-text-primary hero-word hero-word-0 dark:text-white">Every Student Supported.</span>
            <br />
            <span className="text-text-primary hero-word hero-word-1 dark:text-white">Every Student</span>{' '}
            <span
              className="hero-word hero-word-2"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Moving Forward.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle-anim text-text-primary font-body text-xl leading-[1.7] mb-10 max-w-[620px] mx-auto dark:!text-white/70">
            Teaching Labs helps your students get guidance when they need it, without interrupting
            the flow of your classroom. When one student needs extra help and another is ready to
            move ahead, Teaching Labs helps keep everyone learning.
          </p>

          {/* Buttons — matching homepage style */}
          <div className="hero-buttons-anim flex gap-4 justify-center flex-wrap mb-8">
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              Join the Waitlist
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      <main>

        {/* ── WHEN YOU'RE HELPING ONE STUDENT ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>The Classroom Reality</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                When You&apos;re Helping One Student...
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Across the classroom, other students are still learning.
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>A student gets stuck on the next step</MomentItem>
                <MomentItem>Another finishes early with nothing to do</MomentItem>
                <MomentItem>A third needs a different explanation than the one you gave</MomentItem>
              </div>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-8">
                Teaching Labs helps guide those moments using your teaching style, so students keep
                moving forward even when you&apos;re focused elsewhere.
              </p>
              {/* Photo */}
              <div className="feat-photo-hover">
                <Image src="/images/classroom-wide-angle.jpg" alt="Busy classroom with students working on laptops while teacher instructs" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* ── STUDENTS GET HELP WITHOUT WAITING ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>No More Waiting</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Students Get Help Without Waiting
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Students can ask questions, practice skills, and work through challenges without waiting
                for the teacher to become available.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Support reflects how you teach, not generic responses. Students can:
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>Ask for help</MomentItem>
                <MomentItem>Try again</MomentItem>
                <MomentItem>See the idea explained a different way</MomentItem>
              </div>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                All without needing to raise their hand or stop the lesson.
              </p>
            </div>
          </div>
        </section>

        {/* ── STRONG STUDENTS KEEP MOVING ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>No Ceiling</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Strong Students Keep Moving
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                When students are ready to go further, Teaching Labs provides deeper challenges and
                extensions of the lesson.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                No more early finishers sitting idle. No extra preparation required. Students can explore:
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>Enrichment activities that extend the lesson</MomentItem>
                <MomentItem>Deeper exploration at their pace</MomentItem>
                <MomentItem>Advanced challenges connected to what they&apos;re learning</MomentItem>
              </div>
              {/* Photo */}
              <div className="feat-photo-hover">
                <Image src="/images/student-independent-learning.jpg" alt="Student focused on independent learning with headphones and laptop" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* ── GUIDANCE THAT FEELS FAMILIAR ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Your Voice, Extended</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Guidance That Feels Familiar
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs reflects how you explain ideas, guide students, and respond when they struggle.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                That means the support students receive stays connected to your classroom and your teaching style.
              </p>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                Students are never learning from a random system. They&apos;re learning through guidance built from their teacher.
              </p>
            </div>
          </div>
        </section>

        {/* ── LEARNING DOESN'T STOP ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Beyond the Bell</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Learning Doesn&apos;t Stop When<br />Class Ends
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Whether students are working independently, reviewing a lesson, or exploring something
                new, Teaching Labs helps them keep learning.
              </p>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                The support they receive stays connected to the way you teach in class.
              </p>
            </div>
          </div>
        </section>

        {/* ── Bridge Quote ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 pb-24 max-md:px-6 max-md:pb-16 fade-up">
            <Bridge>Every student deserves support that reflects how their teacher teaches. Teaching Labs makes that possible.</Bridge>
          </div>
        </section>

        {/* ── WHAT THIS MEANS FOR YOUR STUDENTS ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>What This Means</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Confidence. Challenge. Opportunity.
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-3 gap-12 max-md:grid-cols-1 max-md:gap-9 fade-up">
              <GainItem word="Confidence">
                More confidence when they get stuck.
              </GainItem>
              <GainItem word="Challenge">
                More challenge when they&apos;re ready.
              </GainItem>
              <GainItem word="Opportunity">
                More opportunities to keep learning.
              </GainItem>
            </div>
          </div>
        </section>

        {/* ── CTA SECTION — matches homepage ── */}
        <section className="relative overflow-hidden bg-warm-white dark:bg-transparent">
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-[200px] dark:hidden pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #F7F7F8, transparent)' }} />
          <div className="absolute top-0 left-0 right-0 h-[200px] hidden dark:block pointer-events-none z-[2]"
            style={{ background: 'linear-gradient(to bottom, #0a1128, transparent)' }} />
          {/* Light mode: radiant blobs */}
          <div className="absolute inset-0 pointer-events-none dark:hidden" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[-10%] opacity-[0.25]"
              style={{ background: '#00F6ED', filter: 'blur(120px)' }} />
            <div className="absolute w-[450px] h-[450px] rounded-full top-[5%] right-[-8%] opacity-[0.25]"
              style={{ background: '#4056F4', filter: 'blur(120px)' }} />
            <div className="absolute w-[350px] h-[350px] rounded-full bottom-[10%] left-[40%] opacity-[0.07]"
              style={{ background: '#7B2D4A', filter: 'blur(120px)' }} />
          </div>
          {/* Dark mode: gradient */}
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, #1a3a4a 0%, #152a3a 40%, #0a1128 100%)' }} />
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-36 text-center max-md:px-6 max-md:py-20">
            <div className="text-eyebrow font-extrabold font-heading text-sm font-bold tracking-[4px] uppercase mb-5">
              Early Access
            </div>
            <h2 className="text-text-primary font-heading font-extrabold tracking-[-1.5px] mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Ready to See Every Student Supported?
            </h2>
            <p className="text-text-primary text-lg leading-[1.7] mb-10 max-w-[600px] mx-auto dark:!text-white/65">
              Get early access to Teaching Labs and give your students guidance that reflects how you teach.
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

      {/* ── FOOTER — matches homepage ── */}
      <MarketingFooter />
    </>
  );
}
