'use client';

import Link from 'next/link';
import Image from 'next/image';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

/* ─── Small decorative icons ─── */
function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

export default function SeeTheDifferencePage() {
  return (
    <>
      <MarketingNav />

      {/* ── HERO ── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-warm-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-[15%] left-[10%] w-[400px] h-[400px] rounded-full opacity-[var(--blob-teal-opacity,0.08)]"
            style={{ background: '#4FA3A5', filter: 'blur(80px)' }}
          />
          <div
            className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] rounded-full opacity-[var(--blob-gold-opacity,0.10)]"
            style={{ background: '#F0C95D', filter: 'blur(80px)' }}
          />
          <div
            className="absolute top-[60%] left-[60%] w-[300px] h-[300px] rounded-full opacity-[0.06] max-md:hidden"
            style={{ background: '#FF6B6B', filter: 'blur(80px)' }}
          />
        </div>

        <div className="relative text-center px-6 max-w-[820px] mx-auto">
          <p className="hero-eyebrow-anim font-heading text-sm font-semibold tracking-[0.15em] uppercase text-teal mb-6" style={{ animationDelay: '0.3s' }}>
            The Proof
          </p>
          <h1 className="hero-title-anim font-heading text-[clamp(40px,6vw,72px)] font-bold text-text-primary leading-[1.1] tracking-[-1px] mb-6 max-md:text-[32px]" style={{ animationDelay: '0.5s' }}>
            Every AI Can Answer a Question.{' '}
            <span className="bg-gradient-to-r from-teal to-[#F0C95D] bg-clip-text text-transparent">
              Only One Teaches.
            </span>
          </h1>
          <p className="hero-subtitle-anim font-body text-[20px] text-text-secondary leading-[1.7] max-w-[640px] mx-auto mb-10" style={{ animationDelay: '1s' }}>
            We gave three AI tools the same prompt. Two wrote the report. One did something no other tool would do: it taught the student how to write it themselves.
          </p>
        </div>
      </section>

      <ScrollReveal />
      <main>
        {/* ── The Prompt ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[800px] mx-auto px-12 py-16 max-md:px-6 text-center">
            <div className="inline-block bg-card-bg border border-border rounded-[20px] px-10 py-6 shadow-[0_2px_20px_rgba(20,33,61,0.05)]">
              <p className="font-body text-sm text-text-muted mb-1">A student types:</p>
              <p className="font-heading text-[26px] font-bold text-text-primary max-md:text-[20px]">
                &ldquo;Write me a report on butterflies.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* ── Three-Way Comparison ── */}
        <section className="fade-up" style={{ background: '#0B1426' }}>
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="grid grid-cols-3 gap-8 max-lg:grid-cols-1 max-lg:gap-12">
              {/* ChatGPT */}
              <div className="text-center">
                <div className="mb-3">
                  <span className="inline-block font-heading text-sm font-bold text-white/40 tracking-[0.1em] uppercase">ChatGPT</span>
                </div>
                <p className="font-body text-xs text-white/30 mb-4">Writes the report</p>
                <div className="rounded-[16px] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-white/10">
                  <Image src="/images/chatgpt.png" alt="ChatGPT immediately writes a full report on butterflies" width={400} height={600} className="w-full object-cover" />
                </div>
                <p className="mt-4 font-body text-[17px] text-white/50 leading-[1.6]">
                  Generates a complete report instantly. The student copies, pastes, and submits. Nothing learned.
                </p>
              </div>

              {/* Gemini */}
              <div className="text-center">
                <div className="mb-3">
                  <span className="inline-block font-heading text-sm font-bold text-white/40 tracking-[0.1em] uppercase">Gemini</span>
                </div>
                <p className="font-body text-xs text-white/30 mb-4">Writes the report</p>
                <div className="rounded-[16px] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-white/10">
                  <Image src="/images/gemini.png" alt="Gemini writes a formatted report with tables about butterflies" width={400} height={600} className="w-full object-cover" />
                </div>
                <p className="mt-4 font-body text-[17px] text-white/50 leading-[1.6]">
                  Same thing, fancier formatting. Tables, headers, scientific terms. Still does all the thinking for the student.
                </p>
              </div>

              {/* Teaching Labs */}
              <div className="text-center">
                <div className="mb-3">
                  <span className="inline-block font-heading text-sm font-bold text-teal tracking-[0.1em] uppercase">Teaching Labs</span>
                </div>
                <p className="font-body text-xs text-teal/60 mb-4">Teaches the student</p>
                <div className="rounded-[16px] overflow-hidden shadow-[0_8px_40px_rgba(79,163,165,0.2)] border border-teal/20">
                  <Image src="/images/teachinglabspng.png" alt="Teaching Labs refuses to write the report and coaches the student through research" width={400} height={600} className="w-full object-cover" />
                </div>
                <p className="mt-4 font-body text-[17px] text-teal leading-[1.6]">
                  Refuses to write it. Asks clarifying questions. Coaches the student to build a thesis-driven paper they&apos;re proud of.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bridge ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[800px] mx-auto px-12 py-[80px] max-md:px-6 max-md:py-[50px] text-center">
            <h2 className="font-heading text-[clamp(36px,5vw,56px)] font-bold text-text-primary leading-[1.2] mb-6 max-md:text-[26px]">
              But here&apos;s what the others will never show you
            </h2>
            <p className="font-body text-[20px] text-text-secondary leading-[1.7]">
              ChatGPT and Gemini are black boxes. The student gets an answer, and the teacher never knows it happened. With Teaching Labs, every interaction flows back to the person who matters most: you.
            </p>
          </div>
        </section>

        {/* ── A Student Tries to Cheat ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="text-center mb-16">
              <p className="font-heading text-sm font-semibold tracking-[0.15em] uppercase text-teal mb-4">
                Watch What Happens
              </p>
              <h2 className="font-heading text-[clamp(36px,5vw,56px)] font-bold text-text-primary leading-[1.2] mb-4 max-md:text-[32px]">
                A Student Tries to Cheat
              </h2>
              <p className="font-body text-[20px] text-text-secondary leading-[1.7] max-w-[640px] mx-auto">
                A student copies a report from Gemini, pastes it into Teaching Labs, and says &ldquo;I worked hard on this.&rdquo; Here&apos;s what happens next.
              </p>
            </div>

            {/* Step 1 */}
            <div className="fade-up flex items-center gap-12 mb-20 max-lg:flex-col max-lg:gap-8">
              <div className="flex-1">
                <p className="font-heading text-sm font-semibold tracking-[0.15em] uppercase text-teal mb-3">Step 01</p>
                <h3 className="font-heading text-[32px] font-bold text-text-primary mb-4">The Paste</h3>
                <p className="font-body text-[18px] text-text-secondary leading-[1.7]">
                  The student copies Gemini&apos;s butterfly report word-for-word, pastes it in, and claims they spent a lot of time on it.
                </p>
              </div>
              <div className="flex-1 rounded-[16px] overflow-hidden shadow-[0_8px_40px_rgba(20,33,61,0.10)]">
                <Image src="/images/cheat-paste.jpg" alt="Student pastes AI-generated text and claims it as their own" width={600} height={400} className="w-full object-cover" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="fade-up flex items-center gap-12 mb-20 max-lg:flex-col max-lg:gap-8">
              <div className="flex-1 order-2 max-lg:order-1">
                <p className="font-heading text-sm font-semibold tracking-[0.15em] uppercase text-teal mb-3">Step 02</p>
                <h3 className="font-heading text-[32px] font-bold text-text-primary mb-4">Caught</h3>
                <p className="font-body text-[18px] text-text-secondary leading-[1.7]">
                  Teaching Labs isn&apos;t fooled. It identifies the text as AI-generated, lays out the evidence: zero specificity, no citations, and signature AI phrasing. No guessing. No accusations. Just facts.
                </p>
              </div>
              <div className="flex-1 order-1 max-lg:order-2 rounded-[16px] overflow-hidden shadow-[0_8px_40px_rgba(20,33,61,0.10)]">
                <Image src="/images/cheat-caught.jpg" alt="Teaching Labs identifies submitted work as AI-generated with evidence" width={600} height={400} className="w-full object-cover" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="fade-up flex items-center gap-12 mb-12 max-lg:flex-col max-lg:gap-8">
              <div className="flex-1">
                <p className="font-heading text-sm font-semibold tracking-[0.15em] uppercase text-teal mb-3">Step 03</p>
                <h3 className="font-heading text-[32px] font-bold text-text-primary mb-4">Coached to Real Work</h3>
                <p className="font-body text-[18px] text-text-secondary leading-[1.7]">
                  Instead of punishing, Teaching Labs teaches. It tells the student to handwrite three research questions, photograph them, find real sources, and build their own argument. Every modality engaged. No shortcuts possible.
                </p>
              </div>
              <div className="flex-1 rounded-[16px] overflow-hidden shadow-[0_8px_40px_rgba(20,33,61,0.10)]">
                <Image src="/images/cheat-scaffold.jpg" alt="Teaching Labs scaffolds the student with research and original thinking" width={600} height={400} className="w-full object-cover" />
              </div>
            </div>

            <div className="fade-up text-center mt-12">
              <p className="font-heading text-[24px] font-semibold text-teal">
                Other AI tools give the answers. Teaching Labs makes learning happen.
              </p>
            </div>
          </div>
        </section>

        {/* ── Teacher Dashboard View ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[1000px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="text-center mb-12">
              <p className="font-heading text-sm font-semibold tracking-[0.15em] uppercase text-teal mb-4">
                The Teacher&apos;s View
              </p>
              <h2 className="font-heading text-[clamp(36px,5vw,56px)] font-bold text-text-primary leading-[1.2] mb-4 max-md:text-[32px]">
                You See the Whole Learning Process
              </h2>
              <p className="font-body text-[20px] text-text-secondary leading-[1.7] max-w-[640px] mx-auto">
                With other AI platforms, the teacher sees the final product. With Teaching Labs, you understand the process. Every question the AI asked, every answer your student gave, where they got stuck, and where they had a breakthrough.
              </p>
            </div>

            {/* Dashboard mockup */}
            <div className="bg-card-bg border border-border rounded-[20px] overflow-hidden shadow-[0_8px_40px_rgba(20,33,61,0.08)]">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 bg-bg-secondary border-b border-border">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <span className="ml-4 text-xs text-text-muted font-heading">Teaching Labs — Teacher Dashboard</span>
              </div>

              {/* Student header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-border max-sm:flex-col max-sm:gap-3 max-sm:items-start">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal/15 text-teal font-heading text-sm font-bold flex items-center justify-center">MJ</div>
                  <div>
                    <p className="font-heading text-[17px] font-semibold text-text-primary">Marcus Johnson</p>
                    <p className="font-body text-xs text-text-muted">Assignment: Research Report — Butterflies</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full">
                  In Progress
                </span>
              </div>

              {/* Body panels */}
              <div className="grid grid-cols-2 max-md:grid-cols-1">
                {/* Left: Interaction Summary */}
                <div className="px-8 py-6 border-r border-border max-md:border-r-0 max-md:border-b">
                  <p className="font-heading text-xs font-semibold tracking-[0.1em] uppercase text-text-muted mb-4">Interaction Summary</p>
                  {[
                    ['Total exchanges', '12'],
                    ['Clarifying questions asked', '3'],
                    ['Topic narrowed to', 'Monarch migration'],
                    ['Student confidence', '▲ Growing'],
                    ['Time spent', '18 min'],
                  ].map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-border last:border-b-0">
                      <span className="font-body text-sm text-text-secondary">{label}</span>
                      <span className={`font-heading text-sm font-semibold ${label === 'Student confidence' ? 'text-teal' : 'text-text-primary'}`}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Right: Key Moments */}
                <div className="px-8 py-6">
                  <p className="font-heading text-xs font-semibold tracking-[0.1em] uppercase text-text-muted mb-4">Key Moments</p>
                  <ul className="space-y-3">
                    {[
                      'Student initially asked AI to write the full report',
                      'AI redirected to research question development',
                      'Student explored 3 sub-topics before choosing monarch migration patterns',
                      'Built a thesis statement with guided questioning',
                      'Outlined 4 sections independently after scaffolding',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 flex-shrink-0" />
                        <span className="font-body text-sm text-text-secondary leading-[1.6]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer suggestion */}
              <div className="flex items-start gap-3 px-8 py-5 border-t border-border bg-teal/5">
                <span className="text-lg flex-shrink-0">💡</span>
                <p className="font-body text-sm text-text-secondary leading-[1.6]">
                  <span className="font-semibold text-text-primary">Suggested next step:</span> Marcus is ready for a thesis review conversation. He&apos;s narrowed his focus and built an outline. A 3-minute check-in could help him sharpen his argument before drafting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="fade-up relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)' }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(79,163,165,0.15) 0%, transparent 70%)' }}
            />
          </div>
          <div className="relative max-w-[800px] mx-auto text-center px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <p className="font-heading text-sm font-semibold tracking-[0.15em] uppercase text-teal mb-4">
              See for Yourself
            </p>
            <h2 className="font-heading text-[clamp(36px,5vw,56px)] font-bold text-white leading-[1.15] mb-6 max-md:text-[32px]">
              Ready to See Your Classroom Like This?
            </h2>
            <p className="font-body text-[20px] text-white/70 leading-[1.7] max-w-[560px] mx-auto mb-10">
              Teaching Labs doesn&apos;t replace great teaching. It helps great teaching reach every student, and proves it.
            </p>
            <Link
              href="/waitlist"
              className="cta-button-pulse inline-flex items-center font-heading text-[20px] font-bold bg-gold text-deep-navy px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
            >
              Get Early Access
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-surface border-t border-border">
          <div className="max-w-[1200px] mx-auto px-12 py-16 max-md:px-6 max-md:py-10">
            <div className="grid grid-cols-4 gap-10 max-md:grid-cols-2 max-sm:grid-cols-1">
              <div>
                <p className="font-heading text-lg font-bold text-text-primary mb-3">Teaching Labs</p>
                <p className="font-body text-sm text-text-secondary leading-[1.7] mb-4">
                  AI-powered teaching platform that learns how you teach and helps every student get the support they need.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-teal font-heading">
                  <IconStar /> FERPA &amp; COPPA Compliant
                </div>
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-text-primary mb-3 tracking-wide uppercase">Platform</p>
                <ul className="space-y-2 font-body text-sm text-text-secondary">
                  <li><Link href="/for-teachers" className="hover:text-teal transition-colors">For Teachers</Link></li>
                  <li><Link href="/for-students" className="hover:text-teal transition-colors">For Students</Link></li>
                  <li><Link href="/for-districts" className="hover:text-teal transition-colors">For Districts</Link></li>
                  <li><Link href="/for-parents" className="hover:text-teal transition-colors">For Parents</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-text-primary mb-3 tracking-wide uppercase">Company</p>
                <ul className="space-y-2 font-body text-sm text-text-secondary">
                  <li><Link href="/our-story" className="hover:text-teal transition-colors">Our Story</Link></li>
                  <li><Link href="/how-it-works" className="hover:text-teal transition-colors">How It Works</Link></li>
                  <li><Link href="/pricing" className="hover:text-teal transition-colors">Pricing</Link></li>
                  <li><Link href="/contact" className="hover:text-teal transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-text-primary mb-3 tracking-wide uppercase">Legal</p>
                <ul className="space-y-2 font-body text-sm text-text-secondary">
                  <li><span className="text-text-muted">Privacy Policy</span></li>
                  <li><span className="text-text-muted">Terms of Service</span></li>
                  <li><span className="text-text-muted">Cookie Policy</span></li>
                  <li><span className="text-text-muted">Accessibility</span></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-6 border-t border-border text-center">
              <p className="font-body text-xs text-text-muted">
                &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
