import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'See the Difference — Teaching Labs',
  description:
    'Every AI can answer a question. Only one teaches. See how Teaching Labs compares to ChatGPT and Gemini.',
};

/* ─── SVG Icons ─── */

function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-teal flex-shrink-0 mt-0.5">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

/* ─── Eyebrow ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[#7B2D4A] dark:text-[#00F6ED] font-extrabold flex items-center justify-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-4">
      <span className="bg-[#7B2D4A] dark:bg-[#00F6ED] w-2 h-2 rounded-full flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Bridge quote ─── */
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-coral bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl p-8 pl-6 max-w-3xl font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary mx-auto max-md:text-xl max-md:p-6 max-md:pl-5">
      {children}
    </div>
  );
}

/* ─── Step card ─── */
function StepCard({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card-accent bg-card-bg rounded-[20px] p-8 shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300 fade-up">
      <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-coral dark:text-teal mb-3">
        {step}
      </div>
      <h3 className="font-heading text-xl font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-base text-text-secondary leading-[1.7]">{children}</p>
    </div>
  );
}

/* ─── Comparison card ─── */
function CompareCard({
  name,
  verdict,
  verdictColor,
  imageSrc,
  children,
}: {
  name: string;
  verdict: string;
  verdictColor: string;
  imageSrc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-accent bg-card-bg rounded-[20px] p-8 shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300 fade-up flex flex-col">
      <h3 className="font-heading text-2xl font-bold text-text-primary mb-3 text-center">{name}</h3>
      <div className="flex justify-center mb-5">
        <span className="font-heading text-xs font-bold tracking-[2px] uppercase px-4 py-1.5 rounded-full" style={{ color: verdictColor, border: `2px solid ${verdictColor}` }}>
          {verdict}
        </span>
      </div>
      {imageSrc && (
        <div className="rounded-xl overflow-hidden mb-5 border border-black/5 dark:border-white/10">
          <Image src={imageSrc} alt={`${name} response`} width={600} height={400} className="w-full h-auto" />
        </div>
      )}
      <p className="text-base text-text-secondary leading-[1.7]">{children}</p>
    </div>
  );
}

/* ─── Dashboard stat ─── */
function DashStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-black/5 dark:border-white/10">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="font-heading font-bold text-text-primary">{value}</span>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SeeTheDifferencePage() {
  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="blob-teal absolute w-[600px] h-[600px] rounded-full top-[8%] left-[5%] max-md:w-[350px] max-md:h-[350px] opacity-[0.3] dark:opacity-[0.2]"
            style={{ background: '#00F6ED', filter: 'blur(100px)' }} />
          <div className="blob-gold absolute w-[550px] h-[550px] rounded-full top-[20%] right-[2%] max-md:w-[320px] max-md:h-[320px] opacity-[0.3] dark:opacity-[0.18]"
            style={{ background: '#4056F4', filter: 'blur(100px)' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full top-[55%] left-[15%] opacity-[0.15] dark:opacity-[0.1] max-md:hidden"
            style={{ background: '#561F37', filter: 'blur(100px)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] dark:hidden"
            style={{ background: 'linear-gradient(to bottom, transparent, #F7F7F8)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] hidden dark:block"
            style={{ background: 'linear-gradient(to bottom, transparent, #0a1128)' }} />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          <div className="text-[#7B2D4A] dark:text-[#00F6ED] font-extrabold inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-6">
            <span className="bg-[#7B2D4A] dark:bg-[#00F6ED] w-2 h-2 rounded-full flex-shrink-0" />
            The Proof
          </div>

          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}
          >
            <span className="text-text-primary hero-word hero-word-0 dark:text-white">Every AI Can Answer a Question.</span>
            <br />
            <span className="text-text-primary hero-word hero-word-1 dark:text-white">Only One</span>{' '}
            <span
              className="hero-word hero-word-2"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Teaches.
            </span>
          </h1>

          <p className="hero-subtitle-anim text-text-primary font-body text-xl leading-[1.7] mb-10 max-w-[620px] mx-auto dark:!text-white/70">
            We gave three AI tools the same prompt. Two wrote the report. One did something no other tool would do: it taught the student how to write it themselves.
          </p>

          <div className="hero-buttons-anim flex gap-4 justify-center flex-wrap mb-8">
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              Join the Waitlist
            </Link>
            <Link
              href="/for-teachers"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-coral dark:border-teal dark:shadow-[0_0_20px_rgba(0,246,237,0.15)] hover:bg-coral dark:hover:bg-teal hover:text-white dark:hover:text-deep-navy hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(86,31,55,0.3)] dark:hover:shadow-[0_6px_28px_rgba(0,246,237,0.35)] transition-all duration-300"
            >
              Learn More
            </Link>
          </div>

          <p className="text-xs text-text-muted mt-4">
            A student types: &ldquo;Write me a report on butterflies.&rdquo;
          </p>
        </div>
      </section>

      <main>
        {/* ── COMPARISON SECTION ── */}
        <section className="relative py-28 max-md:py-16 bg-warm-white dark:bg-deep-navy overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[10%] right-[5%] opacity-[0.12] dark:opacity-[0.08]"
              style={{ background: '#4056F4', filter: 'blur(100px)' }} />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-12 max-md:px-6">
            <Eyebrow>Side by Side</Eyebrow>
            <h2
              className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary text-center mb-16 fade-up"
              style={{ fontSize: 'clamp(30px, 4vw, 48px)' }}
            >
              Three AI Tools. One Prompt. <br className="max-md:hidden" />
              <span
                style={{
                  background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Three Very Different Outcomes.
              </span>
            </h2>

            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1 mb-16">
              <CompareCard name="ChatGPT" verdict="Writes the report" verdictColor="#EF4444" imageSrc="/images/chatgpt.png">
                Generates a complete report instantly. The student copies, pastes, and submits. Nothing learned.
              </CompareCard>
              <CompareCard name="Gemini" verdict="Writes the report" verdictColor="#F59E0B" imageSrc="/images/gemini.png">
                Same thing, fancier formatting. Tables, headers, scientific terms. Still does all the thinking for the student.
              </CompareCard>
              <CompareCard name="Teaching Labs" verdict="Assists the student" verdictColor="#00F6ED" imageSrc="/images/teachinglabs-butterflies-response.jpg">
                Refuses to write it. Asks clarifying questions. Coaches the student to build a thesis-driven paper they&apos;re proud of.
              </CompareCard>
            </div>

            <Bridge>
              But here&apos;s what the others will never show you. ChatGPT and Gemini are black boxes. The student gets an answer, and the teacher never knows it happened. With Teaching Labs, every interaction flows back to the person who matters most: you.
            </Bridge>
          </div>
        </section>

        {/* ── WHAT HAPPENS NEXT (Steps) ── */}
        <section className="relative py-28 max-md:py-16 bg-bg-secondary dark:bg-[#0e1a35] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute w-[450px] h-[450px] rounded-full bottom-[10%] left-[5%] opacity-[0.15] dark:opacity-[0.08]"
              style={{ background: '#00F6ED', filter: 'blur(100px)' }} />
          </div>

          <div className="relative z-10 max-w-[1000px] mx-auto px-12 max-md:px-6">
            <Eyebrow>Watch What Happens</Eyebrow>
            <h2
              className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary text-center mb-6 fade-up"
              style={{ fontSize: 'clamp(30px, 4vw, 48px)' }}
            >
              AI Should Help Students{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Think
              </span>
              , Not Think for Them
            </h2>
            <p className="text-center text-text-secondary text-lg leading-[1.7] mb-16 max-w-[700px] mx-auto fade-up">
              A student pastes an AI-generated report into Teaching Labs. Instead of giving a grade, Teaching Labs turns it into a learning moment. Here&apos;s what happens next.
            </p>

            <div className="grid grid-cols-1 gap-6">
              <StepCard step="Step 01" title="The Paste">
                The student copies Gemini&apos;s butterfly report word-for-word, pastes it in, and claims they spent a lot of time on it.
              </StepCard>
              <StepCard step="Step 02" title="Caught">
                Teaching Labs isn&apos;t fooled. It identifies the text as AI-generated, lays out the evidence: zero specificity, no citations, and signature AI phrasing. No guessing. No accusations. Just facts.
              </StepCard>
              <StepCard step="Step 03" title="Coached to Real Work">
                Instead of punishing, Teaching Labs teaches. It tells the student to handwrite three research questions, photograph them, find real sources, and build their own argument. Every modality engaged. No shortcuts possible.
              </StepCard>
            </div>

            <div className="mt-16 fade-up">
              <Bridge>
                Other AI tools give the answers. Teaching Labs makes learning happen.
              </Bridge>
            </div>
          </div>
        </section>

        {/* ── TEACHER DASHBOARD VIEW ── */}
        <section className="relative py-28 max-md:py-16 bg-warm-white dark:bg-deep-navy overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[20%] left-[10%] opacity-[0.12] dark:opacity-[0.06]"
              style={{ background: '#561F37', filter: 'blur(100px)' }} />
          </div>

          <div className="relative z-10 max-w-[1000px] mx-auto px-12 max-md:px-6">
            <Eyebrow>The Teacher&apos;s View</Eyebrow>
            <h2
              className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary text-center mb-6 fade-up"
              style={{ fontSize: 'clamp(30px, 4vw, 48px)' }}
            >
              You See the{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Whole Learning Process
              </span>
            </h2>
            <p className="text-center text-text-secondary text-lg leading-[1.7] mb-16 max-w-[700px] mx-auto fade-up">
              With other AI platforms, the teacher sees the final product.
              With Teaching Labs, you understand the process.
            </p>

            {/* Dashboard mockup */}
            <div className="card-accent bg-card-bg rounded-[20px] p-8 max-md:p-5 shadow-[0_2px_20px_rgba(20,33,61,0.05)] fade-up">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-black/5 dark:border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal to-gold flex items-center justify-center text-white font-heading font-bold text-lg">
                  MJ
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">Marcus Johnson</h3>
                  <p className="text-sm text-text-secondary">Assignment: Research Report — Butterflies</p>
                </div>
                <span className="ml-auto font-heading text-xs font-bold tracking-[2px] uppercase text-teal border-2 border-teal rounded-full px-3 py-1">
                  In Progress
                </span>
              </div>

              {/* Stats */}
              <div className="mb-6">
                <h4 className="font-heading text-sm font-bold tracking-[2px] uppercase text-coral dark:text-teal mb-4">
                  Interaction Summary
                </h4>
                <DashStat label="Total exchanges" value="12" />
                <DashStat label="Clarifying questions asked" value="3" />
                <DashStat label="Topic narrowed to" value="Monarch migration" />
                <DashStat label="Student confidence" value="▲ Growing" />
                <DashStat label="Time spent" value="18 min" />
              </div>

              {/* Key Moments */}
              <div className="mb-6">
                <h4 className="font-heading text-sm font-bold tracking-[2px] uppercase text-coral dark:text-teal mb-4">
                  Key Moments
                </h4>
                <div className="space-y-3">
                  {[
                    'Student initially asked AI to write the full report',
                    'AI redirected to research question development',
                    'Student explored 3 sub-topics before choosing monarch migration patterns',
                    'Built a thesis statement with guided questioning',
                    'Outlined 4 sections independently after scaffolding',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <IconCheck />
                      <span className="text-sm text-text-secondary leading-[1.6]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested next step */}
              <div className="bg-[rgba(0,246,237,0.06)] dark:bg-[rgba(0,246,237,0.08)] rounded-xl p-5 border-l-4 border-teal">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                    <span className="font-heading font-bold text-sm text-text-primary">Suggested next step: </span>
                    <span className="text-sm text-text-secondary leading-[1.6]">
                      Marcus is ready for a thesis review conversation. He&apos;s narrowed his focus and built an outline. A 3-minute check-in could help him sharpen his argument before drafting.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative py-28 max-md:py-16 bg-bg-secondary dark:bg-[#0e1a35] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[30%] right-[10%] opacity-[0.15] dark:opacity-[0.08]"
              style={{ background: '#4056F4', filter: 'blur(100px)' }} />
          </div>

          <div className="relative z-10 max-w-[800px] mx-auto px-12 max-md:px-6 text-center">
            <Eyebrow>See for Yourself</Eyebrow>
            <h2
              className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary mb-6 fade-up"
              style={{ fontSize: 'clamp(30px, 4vw, 48px)' }}
            >
              Ready to See Your Classroom{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Like This?
              </span>
            </h2>
            <p className="text-text-secondary text-lg leading-[1.7] mb-10 fade-up">
              Teaching Labs doesn&apos;t replace great teaching. It helps great teaching reach every student, and proves it.
            </p>
            <div className="flex gap-4 justify-center flex-wrap fade-up">
              <Link
                href="/waitlist"
                className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
              >
                Get Early Access
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-coral dark:border-teal dark:shadow-[0_0_20px_rgba(0,246,237,0.15)] hover:bg-coral dark:hover:bg-teal hover:text-white dark:hover:text-deep-navy hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(86,31,55,0.3)] dark:hover:shadow-[0_6px_28px_rgba(0,246,237,0.35)] transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-deep-navy text-white/60 py-16">
        <div className="max-w-[1200px] mx-auto px-12 max-md:px-6 grid grid-cols-4 gap-10 max-md:grid-cols-2 max-sm:grid-cols-1 mb-12">
          <div>
            <div className="font-heading font-extrabold text-2xl text-white tracking-[-1px] mb-4">
              Teaching Labs
            </div>
            <p className="text-sm leading-[1.8] text-white/50">
              AI-powered teaching platform that learns how you teach and helps every student get the support they need.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-white/40">
              <IconStar />
              <span>FERPA &amp; COPPA Compliant</span>
            </div>
          </div>
          {[
            {
              heading: 'Platform',
              links: [
                { label: 'For Teachers', href: '/for-teachers' },
                { label: 'For Students', href: '/for-students' },
                { label: 'For Districts', href: '/for-districts' },
                { label: 'For Parents', href: '/for-parents' },
              ],
            },
            {
              heading: 'Company',
              links: [
                { label: 'Our Story', href: '/our-story' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Contact', href: '/contact' },
              ],
            },
            {
              heading: 'Legal',
              links: [
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Cookie Policy', href: '#' },
                { label: 'Accessibility', href: '#' },
              ],
            },
          ].map((col) => (
            <div key={col.heading}>
              <h4 className="font-heading text-sm font-bold tracking-[3px] uppercase text-white/30 mb-5">
                {col.heading}
              </h4>
              <div className="space-y-3">
                {col.links.map((lnk) => (
                  <Link key={lnk.label} href={lnk.href} className="block text-sm text-white/50 hover:text-teal transition-colors">
                    {lnk.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[1200px] mx-auto px-12 max-md:px-6 pt-8 border-t border-white/10 text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} Intellectual Creations / Teaching Labs. All rights reserved.
        </div>
      </footer>
    </>
  );
}
