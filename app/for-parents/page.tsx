import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import FadeUp from '@/components/shared/FadeUp';
import MarketingFooter from '@/components/shared/MarketingFooter';

export const metadata: Metadata = {
  title: 'For Parents — Teaching Labs',
  description:
    "Teaching Labs keeps your child's teacher in the driver's seat, and keeps you in the loop. Safe, teacher-guided AI for K-12.",
};

/* ─── SVG Icons ─── */
function IconShield() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
      <defs>
        <linearGradient id="gs1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4056F4" />
          <stop offset="100%" stopColor="#561F37" />
        </linearGradient>
      </defs>
      <path d="M24 4 L40 12 L40 24 C40 34 32 42 24 44 C16 42 8 34 8 24 L8 12 Z" stroke="url(#gs1)" strokeWidth="2.5" strokeLinejoin="round" className="dark:stroke-teal" />
      <path d="M16 24 L22 30 L34 18" stroke="url(#gs1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" className="dark:stroke-teal" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
      <defs>
        <linearGradient id="gb1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4056F4" />
          <stop offset="100%" stopColor="#561F37" />
        </linearGradient>
      </defs>
      <path d="M8 8 C8 8, 16 6, 24 10 C32 6, 40 8, 40 8 L40 38 C40 38, 32 36, 24 40 C16 36, 8 38, 8 38 Z" stroke="url(#gb1)" strokeWidth="2.5" strokeLinejoin="round" className="dark:stroke-teal" />
      <path d="M24 10 L24 40" stroke="url(#gb1)" strokeWidth="2" opacity="0.5" className="dark:stroke-teal" />
      <path d="M14 16 L20 18" stroke="url(#gb1)" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" className="dark:stroke-teal" />
      <path d="M14 22 L20 24" stroke="url(#gb1)" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" className="dark:stroke-teal" />
      <path d="M28 18 L34 16" stroke="url(#gb1)" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" className="dark:stroke-teal" />
      <path d="M28 24 L34 22" stroke="url(#gb1)" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" className="dark:stroke-teal" />
    </svg>
  );
}

function IconHandshake() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
      <defs>
        <linearGradient id="gh1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4056F4" />
          <stop offset="100%" stopColor="#561F37" />
        </linearGradient>
      </defs>
      <path d="M6 20 L14 12 L22 18 L30 12 L42 20" stroke="url(#gh1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-teal" />
      <path d="M14 28 L22 34 L30 28" stroke="url(#gh1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" className="dark:stroke-teal" />
      <circle cx="10" cy="24" r="4" stroke="url(#gh1)" strokeWidth="2" opacity="0.5" className="dark:stroke-teal" />
      <circle cx="38" cy="24" r="4" stroke="url(#gh1)" strokeWidth="2" opacity="0.5" className="dark:stroke-teal" />
    </svg>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-eyebrow font-extrabold flex items-center justify-center gap-3 font-heading text-sm font-bold tracking-[4px] uppercase mb-4">
      <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Bridge quote ─── */
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-underline bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl p-8 pl-6 max-w-3xl font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary mx-auto max-md:text-xl max-md:p-6 max-md:pl-5">
      {children}
    </div>
  );
}

/* ─── Card component ─── */
function Card({
  icon,
  title,
  text,
  floatClass = '',
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  floatClass?: string;
}) {
  return (
    <div className="card-accent relative bg-card-bg rounded-[20px] p-10 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300">
      <div className={`mb-6 ${floatClass}`}>{icon}</div>
      <h3 className="font-heading text-[16.5px] font-semibold text-text-primary mb-3">{title}</h3>
      <p className="text-[15px] leading-[1.78] text-text-secondary">{text}</p>
    </div>
  );
}

/* ─── Section heading with plum underline ─── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2
        className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
        style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
      >
        {children}
      </h2>
      <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
    </>
  );
}

/* ─── (ScenarioSection removed — using inline sections to match homepage format) ─── */


/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function ForParentsPage() {
  return (
    <>
      <MarketingNav />
      

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
            For Parents
          </div>

          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}
          >
            <span className="text-text-primary hero-word hero-word-0 dark:text-white">You Don&apos;t Have to Wonder</span>
            <br />
            <span className="text-text-primary hero-word hero-word-1 dark:text-white">What Your Child Is</span>{' '}
            <span
              className="hero-word hero-word-2"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Learning
            </span>
          </h1>

          <p className="hero-subtitle-anim text-text-primary font-body text-xl leading-[1.7] mb-10 max-w-[620px] mx-auto dark:!text-white/70">
            Teaching Labs keeps your child&apos;s teacher in the driver&apos;s seat, and keeps you in the loop.
          </p>

          <div className="hero-buttons-anim flex gap-4 justify-center flex-wrap mb-8">
            <Link
              href="/see-the-difference"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              See How It Works
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      <main>

        {/* ── 1. YOUR CHILD'S TEACHER BUILT THIS ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Teacher-Created</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Your Child&apos;s Teacher Built This
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                This isn&apos;t a random chatbot from the internet.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                Every Teaching Labs AI is created by your child&apos;s actual teacher. It teaches the way they teach, uses their materials, and follows their standards. When your child works with Teaching Labs, they&apos;re getting guidance shaped by the person who knows their classroom best.
              </p>
              <Bridge>It&apos;s an extension of the classroom your child is already&nbsp;in.</Bridge>
              {/* Photo */}
              <div className="mt-10 feat-photo-hover">
                <Image src="/images/teacher-with-student.jpg" alt="Teacher kneeling beside a student, offering warm one-on-one guidance" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
              </div>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── 2. IT DOESN'T GIVE ANSWERS ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Real Learning</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                It Doesn&apos;t Give Answers. It Asks Questions.
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                When your child asks Teaching Labs to write their homework, it says no.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                Instead, it asks them what they think. It pushes them to develop their own ideas, find their own sources, and build their own arguments. The same thing a great tutor would do sitting at the kitchen table, except it&apos;s available whenever your child needs it.
              </p>
              <Bridge>Your child does the thinking.<br />Teaching Labs just makes sure they don&apos;t get&nbsp;stuck.</Bridge>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── 3. IT CATCHES SHORTCUTS ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Academic Integrity</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                It Catches Shortcuts
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                If your child copies and pastes text from another AI tool,<br />Teaching Labs flags&nbsp;it.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                It asks them to explain it in their own words. No sneaking around. Teaching Labs is designed to make sure the work your child turns in is actually theirs.
              </p>
              {/* Three comparison screenshots */}
              <div className="grid grid-cols-3 gap-4 my-8 max-md:grid-cols-1">
                <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
                  <Image src="/images/chatgpt-butterflies-screenshot.jpg" alt="ChatGPT writes a full report on butterflies for the student" width={400} height={500} className="w-full h-auto block" />
                </div>
                <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
                  <Image src="/images/gemini-butterflies-screenshot.jpg" alt="Gemini writes a full report on butterflies for the student" width={400} height={500} className="w-full h-auto block" />
                </div>
                <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
                  <Image src="/images/teachinglabs-butterflies-response.jpg" alt="Teaching Labs refuses to write the report and teaches instead" width={400} height={500} className="w-full h-auto block" />
                </div>
              </div>
              <Bridge>Other AI tools make it easy to be passive. Teaching Labs makes it hard not to learn.</Bridge>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── 4. TEACHER STAYS CONNECTED ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Always Connected</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Your Child&apos;s Teacher Stays Connected
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                Teaching Labs gives teachers a window into how your child learns, not just what they turn in.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                If your child is struggling with a concept, their teacher knows before the next class. If they&apos;re ready for a challenge, their teacher knows that too. It&apos;s the kind of insight that used to require a one-on-one conversation, now available for every student.
              </p>
              <Bridge>Your child isn&apos;t alone with a machine. Their teacher is always part of the conversation.</Bridge>
              {/* Photo */}
              <div className="mt-10 feat-photo-hover">
                <Image src="/images/parent-teacher-conference.jpg" alt="Teacher and parent reviewing student progress data together on a tablet" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
              </div>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── 5. WHAT COMES HOME IS REAL ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Authentic Work</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                What Comes Home Is Real
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-underline rounded-sm mx-auto mt-3" />
            </FadeUp>
            <FadeUp className="max-w-[760px] mx-auto">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                When your child finishes an assignment with Teaching Labs, they did the work.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                They built the argument. They found the evidence. They figured out where they were wrong and tried again. Teaching Labs guided them through the hard parts, but the thinking, the learning, and the growth are all theirs.
              </p>
              <Bridge>You can trust that what they&apos;re turning in represents what they actually know.</Bridge>
            </FadeUp>
          </FadeUp>
        </section>

        {/* ── GAINS CARDS ── */}
        <section className="bg-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <FadeUp className="text-center mb-14">
              <Eyebrow>Benefits</Eyebrow>
              <SectionHeading>What This Means for Your Family</SectionHeading>
            </FadeUp>
            <FadeUp className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
              <Card
                floatClass="card-icon-float-1"
                icon={<IconShield />}
                title="Safety You Can Trust"
                text="FERPA and COPPA compliant. Your child's data is protected, and the AI is guided by their teacher's standards, not the internet."
              />
              <Card
                floatClass="card-icon-float-2"
                icon={<IconBook />}
                title="Real Learning, Not Shortcuts"
                text="Teaching Labs doesn't do the work for your child. It teaches them how to do it themselves, building skills that last beyond the assignment."
              />
              <Card
                floatClass="card-icon-float-3"
                icon={<IconHandshake />}
                title="Teacher in the Loop"
                text="Every interaction helps the teacher understand your child better. More insight means more personalized support in the classroom."
              />
            </FadeUp>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
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
              For Families
            </div>
            <h2 className="text-text-primary font-heading font-extrabold tracking-[-1.5px] mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Ready to See What Your Child&apos;s Classroom Could Look Like?
            </h2>
            <p className="text-text-primary text-lg leading-[1.7] mb-10 max-w-[600px] mx-auto dark:!text-white/65">
              Teaching Labs is built by teachers, for students, with families in mind. Join the waitlist to be among the first to experience it.
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
      <MarketingFooter />
    </>
  );
}
