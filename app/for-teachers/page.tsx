import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import FadeUp from '@/components/shared/FadeUp';
import MarketingFooter from '@/components/shared/MarketingFooter';

export const metadata: Metadata = {
  title: 'For Teachers — Teaching Labs',
  description:
    'Teaching Labs learns how you teach and helps extend that guidance across your classroom. Support for the moments teachers face every day.',
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
    <>
      <MarketingNav />
      

      {/* ── HERO ── */}
      <section className="section-blend relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-deep-navy">
        {/* Decorative blobs — matching homepage */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="blob-teal absolute w-[600px] h-[600px] rounded-full top-[8%] left-[5%] max-md:w-[350px] max-md:h-[350px] opacity-[0.15] dark:opacity-[0.10]"
            style={{ background: '#00F6ED', filter: 'blur(100px)' }} />
          <div className="blob-gold absolute w-[550px] h-[550px] rounded-full top-[20%] right-[2%] max-md:w-[320px] max-md:h-[320px] opacity-[0.15] dark:opacity-[0.10]"
            style={{ background: '#4056F4', filter: 'blur(100px)' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full top-[55%] left-[15%] opacity-[0.07] dark:opacity-[0.1] max-md:hidden"
            style={{ background: '#561F37', filter: 'blur(100px)' }} />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="text-eyebrow font-extrabold inline-flex items-center gap-3 font-heading text-sm font-bold tracking-[4px] uppercase mb-6">
            <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
            For Teachers
          </div>

          {/* Headline */}
          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}
          >
            <span className="text-text-primary hero-word hero-word-0 dark:text-white">Support for the Moments</span>
            <br />
            <span className="text-text-primary hero-word hero-word-1 dark:text-white">Teachers Face</span>
            <br />
            <span
              className="hero-word hero-word-2"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Every Day
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle-anim text-text-primary font-body text-xl leading-[1.7] mb-10 max-w-[620px] mx-auto dark:!text-white/70">
            Teaching Labs learns how you teach and helps extend that guidance across your classroom.
            So every student keeps learning, even when you&apos;re helping someone else.
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

        {/* ── IT STARTS WITH YOU ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Your Classroom, Your Way</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                It Starts With You
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs doesn&apos;t come preloaded with someone else&apos;s curriculum. It learns from you.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                A short setup captures how you explain concepts, how you respond when students struggle, and what matters most
                in your classroom. Upload your materials. Set your preferences. Define your rules.
              </p>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-8">
                Five minutes of setup. Not another three-hour PD session.
              </p>
              {/* Photo */}
              <div className="feat-photo-hover">
                <Image src="/images/homepage-hero-teacher.jpg" alt="Confident teacher engaging her classroom" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
              </div>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── YOU SEE YOUR WHOLE CLASSROOM ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Real-Time Awareness</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                You See Your Whole Classroom
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Not 47 charts. Not another dashboard you&apos;ll never open.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs gives you clear, simple signals about what&apos;s happening across your class right now:
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>Who needs your help today</MomentItem>
                <MomentItem>Which concepts are landing and which aren&apos;t</MomentItem>
                <MomentItem>Where students are accelerating</MomentItem>
              </div>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                Alerts when something matters. Quiet when it doesn&apos;t.
              </p>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── YOU KNOW WHAT STUDENTS ARE ASKING ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Student Insights</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                You Know What Students Are Asking
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                For the first time, you have a window into the questions students ask when you&apos;re not standing next to them.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs shows you what students asked, how the assistant responded in your style, and what patterns are
                emerging across your class.
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>See the questions you&apos;d never hear in a full classroom</MomentItem>
                <MomentItem>Spot misconceptions before they become habits</MomentItem>
                <MomentItem>Understand how students think, not just what they scored</MomentItem>
              </div>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                This isn&apos;t data. It&apos;s insight into your students&apos; learning.
              </p>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── YOUR VOICE IN THE ROOM ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Your Voice, Extended</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Your Voice in the Room, Even<br />When You&apos;re Not
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Students don&apos;t hear a robot. They hear you.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs uses your voice, your tone, and your way of explaining things. When a student asks for help
                at home, during independent work, or in the middle of a busy classroom, the guidance sounds like it&apos;s
                coming from their teacher.
              </p>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-8">
                Because the best teaching relationships are built on familiarity and trust.
              </p>
              {/* Photo */}
              <div className="feat-photo-hover">
                <Image src="/images/teacher-with-student.jpg" alt="Teacher kneeling beside a student for one-on-one guidance" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
              </div>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── YOU STAY IN CONTROL ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Safety &amp; Privacy</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                You Stay in Control
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                You set the boundaries. You define what the assistant can and can&apos;t do. You see every conversation.
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>Flagged conversations surface anything that needs your attention</MomentItem>
                <MomentItem>Safety guardrails are built in from day one</MomentItem>
                <MomentItem>FERPA and COPPA compliant. No ads. No data selling. Ever.</MomentItem>
              </div>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                Technology helps. But the teacher stays at the center.
              </p>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── Bridge Quote ── */}
        <section className="bg-white dark:bg-deep-navy">
          <FadeUp className="max-w-[1200px] mx-auto px-12 pb-24 max-md:px-6 max-md:pb-16">
            <Bridge>Teaching Labs doesn&apos;t replace great teaching. It helps great teaching reach every student.</Bridge>
          </FadeUp>
        </section>

        {/* ── WHAT TEACHERS GAIN BACK ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>What You Gain Back</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Time. Focus. Energy.
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="grid grid-cols-3 gap-12 max-md:grid-cols-1 max-md:gap-9">
              <GainItem word="Time">
                Less time managing gaps. More time doing what you became a teacher to do.
              </GainItem>
              <GainItem word="Focus">
                Clear signals instead of noise. Know exactly where your attention is needed.
              </GainItem>
              <GainItem word="Energy">
                Stop trying to be everywhere at once. Your teaching reaches every student without burning you out.
              </GainItem>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── CTA SECTION — matches homepage ── */}
        <section className="section-blend relative overflow-hidden bg-white dark:bg-transparent">
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
              Ready to Meet Your Teacher Twin?
            </h2>
            <p className="text-text-primary text-lg leading-[1.7] mb-10 max-w-[600px] mx-auto dark:!text-white/65">
              Get early access to create an AI assistant built from your teaching style. Be among the first to see
              what&apos;s possible.
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
