import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import MarketingNav from '@/components/shared/MarketingNav';

export const metadata: Metadata = {
  title: 'Teaching Labs — See the Difference',
  description: 'See how Teaching Labs compares to ChatGPT and Gemini. Only one AI teaches instead of giving answers.',
};

export default function SeeTheDifferencePage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy transition-colors duration-400">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] bg-teal opacity-[0.08] dark:opacity-[0.15] top-[10%] left-[15%] animate-[blobDrift1_12s_ease-in-out_infinite] max-md:w-[300px] max-md:h-[300px]" />
          <div className="absolute w-[450px] h-[450px] rounded-full blur-[80px] bg-gold opacity-[0.1] dark:opacity-[0.12] top-[30%] right-[10%] animate-[blobDrift2_14s_ease-in-out_infinite] max-md:w-[280px] max-md:h-[280px]" />
          <div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] bg-coral opacity-0 dark:opacity-[0.06] top-[40%] left-[40%] animate-[blobDrift3_10s_ease-in-out_infinite] max-md:hidden" />
        </div>

        <div className="relative z-[2] text-center max-w-[900px] px-12 py-20 max-md:px-6 max-md:py-[60px]">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
            The Proof
          </div>
          <h1 className="font-heading text-[clamp(40px,6vw,72px)] font-extrabold tracking-[-2px] leading-[1.1] text-[var(--text-dark)] dark:text-white mb-6 max-md:text-[clamp(32px,7vw,48px)] max-md:tracking-[-1px]">
            Every AI Can Answer a Question.<br />
            Only One{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Teaches.
            </span>
          </h1>
          <p className="font-body text-xl leading-[1.7] text-[var(--text-body)] dark:text-white/70 max-w-[680px] mx-auto">
            We gave three AI tools the same prompt. Two wrote the report. One did something no other tool would do: it taught the student how to write it themselves.
          </p>
        </div>
      </section>

      <main>
        {/* The Prompt */}
        <section className="bg-[var(--bg-secondary)] dark:bg-[#0D1B30] pt-16 pb-6 px-12 text-center max-md:pt-12 max-md:px-6 fade-up">
          <div className="inline-block bg-white dark:bg-white/[0.04] border-2 border-[rgba(0,246,237,0.2)] dark:border-white/[0.08] rounded-[20px] px-12 py-6 text-[22px] font-medium text-[var(--text-dark)] dark:text-white shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] font-body max-md:px-7 max-md:text-lg">
            <span className="block font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-2">
              A student types:
            </span>
            &ldquo;Write me a report on butterflies.&rdquo;
          </div>
        </section>

        {/* Three-Way Comparison */}
        <section className="bg-[var(--bg-secondary)] dark:bg-[#0D1B30] px-12 pb-[100px] pt-6 max-md:px-6 max-md:pb-[60px] max-md:pt-4">
          <div className="grid grid-cols-3 gap-8 max-w-[1200px] mx-auto max-md:grid-cols-1 max-md:max-w-[500px]">
            {/* ChatGPT */}
            <div className="fade-up bg-white dark:bg-white/[0.04] rounded-[20px] overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] border border-transparent dark:border-white/[0.08] relative hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(255,107,107,0.06)] transition-all duration-400 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-[rgba(0,246,237,0.3)] before:rounded-l-[20px] dark:before:hidden">
              <div className="px-6 pt-5 pb-4 text-center border-b border-[rgba(128,128,128,0.1)]">
                <div className="font-heading text-lg font-bold text-[var(--text-dark)] dark:text-white">ChatGPT</div>
                <div className="text-sm text-[var(--text-muted)] dark:text-white/45 mt-1">Writes the report</div>
              </div>
              <div className="leading-[0]">
                <Image src="/images/marketing/chatgpt.png" alt="ChatGPT immediately writes a full report on butterflies" width={400} height={300} className="w-full h-auto block" />
              </div>
              <div className="px-6 py-5 text-center">
                <p className="text-[15px] text-[var(--text-body)] dark:text-white/70 leading-[1.6]">
                  Generates a complete report instantly. The student copies, pastes, and submits. Nothing learned.
                </p>
              </div>
            </div>

            {/* Gemini */}
            <div className="fade-up bg-white dark:bg-white/[0.04] rounded-[20px] overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] border border-transparent dark:border-white/[0.08] relative hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(255,107,107,0.06)] transition-all duration-400 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-[rgba(0,246,237,0.3)] before:rounded-l-[20px] dark:before:hidden">
              <div className="px-6 pt-5 pb-4 text-center border-b border-[rgba(128,128,128,0.1)]">
                <div className="font-heading text-lg font-bold text-[var(--text-dark)] dark:text-white">Gemini</div>
                <div className="text-sm text-[var(--text-muted)] dark:text-white/45 mt-1">Writes the report</div>
              </div>
              <div className="leading-[0]">
                <Image src="/images/marketing/gemini.png" alt="Gemini writes a formatted report with tables about butterflies" width={400} height={300} className="w-full h-auto block" />
              </div>
              <div className="px-6 py-5 text-center">
                <p className="text-[15px] text-[var(--text-body)] dark:text-white/70 leading-[1.6]">
                  Same thing, fancier formatting. Tables, headers, scientific terms. Still does all the thinking for the student.
                </p>
              </div>
            </div>

            {/* Teaching Labs */}
            <div className="fade-up bg-white dark:bg-white/[0.04] rounded-[20px] overflow-hidden border-teal shadow-[0_8px_32px_rgba(0,246,237,0.18)] dark:shadow-[0_8px_32px_rgba(0,246,237,0.15),0_4px_20px_rgba(64,86,244,0.08)] border scale-[1.02] max-md:scale-100 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-400 relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-[rgba(0,246,237,0.3)] before:rounded-l-[20px] dark:before:hidden">
              <div className="px-6 pt-5 pb-4 text-center border-b border-[rgba(128,128,128,0.1)]">
                <div className="font-heading text-lg font-bold text-[var(--text-dark)] dark:text-white">Teaching Labs</div>
                <div className="text-sm text-teal font-semibold mt-1">Teaches the student</div>
              </div>
              <div className="leading-[0]">
                <Image src="/images/marketing/teachinglabspng.png" alt="Teaching Labs refuses to write the report and instead coaches the student through the research process" width={400} height={300} className="w-full h-auto block" />
              </div>
              <div className="px-6 py-5 text-center">
                <p className="text-[15px] text-[var(--text-dark)] dark:text-white font-medium leading-[1.6]">
                  Refuses to write it. Asks clarifying questions. Coaches the student to build a thesis-driven paper they&apos;re proud of.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bridge */}
        <section className="py-[100px] px-12 text-center bg-warm-white dark:bg-deep-navy max-md:py-[60px] max-md:px-6">
          <div className="fade-up" style={{ textAlign: 'center' }}>
            <h2 className="font-heading text-[clamp(36px,5vw,56px)] font-extrabold tracking-[-1.5px] leading-[1.15] text-[var(--text-dark)] dark:text-white mb-5 inline-block relative after:content-[''] after:block after:w-0 after:h-[3px] after:bg-gold after:mt-3 after:rounded-sm">
              But here&apos;s what the others will never show you
            </h2>
            <p className="text-lg text-[var(--text-body)] dark:text-white/70 max-w-[640px] mx-auto leading-[1.7] font-body">
              ChatGPT and Gemini are black boxes. The student gets an answer, and the teacher never knows it happened. With Teaching Labs, every interaction flows back to the person who matters most: you.
            </p>
          </div>
        </section>

        {/* Cheat Sequence */}
        <section className="py-[100px] px-12 bg-[var(--bg-secondary)] dark:bg-[#0D1B30] max-md:py-[60px] max-md:px-6">
          <div className="text-center max-w-[720px] mx-auto mb-14 fade-up">
            <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
              Watch What Happens
            </div>
            <h2 className="font-heading text-[clamp(36px,5vw,56px)] font-extrabold tracking-[-1.5px] leading-[1.15] text-[var(--text-dark)] dark:text-white mb-5 inline-block relative after:content-[''] after:block after:w-0 after:h-[3px] after:bg-gold after:mt-3 after:rounded-sm">
              A Student Tries to Cheat
            </h2>
            <p className="text-lg text-[var(--text-body)] dark:text-white/70 leading-[1.7] font-body">
              A student copies a report from Gemini, pastes it into Teaching Labs, and says &ldquo;I worked hard on this.&rdquo; Here&apos;s what happens next.
            </p>
          </div>

          <div className="max-w-[900px] mx-auto flex flex-col gap-16">
            {/* Step 01 */}
            <div className="fade-up grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:gap-6">
              <div>
                <div className="font-heading text-[13px] font-extrabold tracking-[3px] uppercase text-coral mb-3">Step 01</div>
                <h3 className="font-heading text-2xl font-extrabold text-[var(--text-dark)] dark:text-white mb-3 leading-[1.25] tracking-[-0.5px]">The Paste</h3>
                <p className="font-body text-base text-[var(--text-body)] dark:text-white/70 leading-[1.78]">
                  The student copies Gemini&apos;s butterfly report word-for-word, pastes it in, and claims they spent a lot of time on it.
                </p>
              </div>
              <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <Image src="/images/marketing/cheat-paste.jpg" alt="Student pastes AI-generated text into Teaching Labs and claims it as their own work" width={450} height={300} className="w-full h-auto block hover:scale-[1.03] transition-transform duration-600" />
              </div>
            </div>

            {/* Step 02 (flipped) */}
            <div className="fade-up grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:gap-6">
              <div className="order-2 max-md:order-1">
                <div className="font-heading text-[13px] font-extrabold tracking-[3px] uppercase text-coral mb-3">Step 02</div>
                <h3 className="font-heading text-2xl font-extrabold text-[var(--text-dark)] dark:text-white mb-3 leading-[1.25] tracking-[-0.5px]">Caught</h3>
                <p className="font-body text-base text-[var(--text-body)] dark:text-white/70 leading-[1.78]">
                  Teaching Labs isn&apos;t fooled. It identifies the text as AI-generated, lays out the evidence: zero specificity, no citations, and signature AI phrasing. No guessing. No accusations. Just facts.
                </p>
              </div>
              <div className="order-1 max-md:order-2 rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <Image src="/images/marketing/cheat-caught.jpg" alt="Teaching Labs identifies the submitted work as AI-generated and explains the evidence" width={450} height={300} className="w-full h-auto block hover:scale-[1.03] transition-transform duration-600" />
              </div>
            </div>

            {/* Step 03 */}
            <div className="fade-up grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:gap-6">
              <div>
                <div className="font-heading text-[13px] font-extrabold tracking-[3px] uppercase text-coral mb-3">Step 03</div>
                <h3 className="font-heading text-2xl font-extrabold text-[var(--text-dark)] dark:text-white mb-3 leading-[1.25] tracking-[-0.5px]">Coached to Real Work</h3>
                <p className="font-body text-base text-[var(--text-body)] dark:text-white/70 leading-[1.78]">
                  Instead of punishing, Teaching Labs teaches. It tells the student to handwrite three research questions, photograph them, find real sources, and build their own argument. Every modality engaged. No shortcuts possible.
                </p>
              </div>
              <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <Image src="/images/marketing/cheat-scaffold.jpg" alt="Teaching Labs scaffolds the student with handwriting, research, and original thinking exercises" width={450} height={300} className="w-full h-auto block hover:scale-[1.03] transition-transform duration-600" />
              </div>
            </div>
          </div>

          {/* Cheat Closer */}
          <div className="text-center mt-8 fade-up">
            <div className="font-heading text-[26px] font-medium italic leading-[1.5] text-[var(--text-dark)] dark:text-white border-l-4 border-coral py-8 pl-6 pr-8 bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl max-w-[800px] mx-auto max-md:text-xl max-md:py-6 max-md:pl-5 max-md:pr-6">
              Other AI tools give the answers. Teaching Labs makes learning happen.
            </div>
          </div>
        </section>

        {/* Teacher Dashboard Mockup */}
        <section className="py-[100px] px-12 bg-[var(--bg-secondary)] dark:bg-[#0D1B30] max-md:py-[60px] max-md:px-6">
          <div className="text-center mb-12 fade-up">
            <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
              The Teacher&apos;s View
            </div>
            <h2 className="font-heading text-[clamp(36px,5vw,56px)] font-extrabold tracking-[-1.5px] leading-[1.15] text-[var(--text-dark)] dark:text-white mb-5 inline-block relative after:content-[''] after:block after:w-0 after:h-[3px] after:bg-gold after:mt-3 after:rounded-sm">
              You See the Whole Learning Process
            </h2>
            <p className="text-lg text-[var(--text-body)] dark:text-white/70 max-w-[580px] mx-auto leading-[1.7] font-body">
              With other AI platforms, the teacher sees the final product.<br /><br />
              With Teaching Labs, you understand the process.<br /><br />
              Every question the AI asked, every answer your student gave, where they got stuck, and where they had a breakthrough.<br /><br />
              All captured, all summarized, focusing your attention on the most important needs.
            </p>
          </div>

          <div className="fade-up max-w-[900px] mx-auto bg-white dark:bg-white/[0.04] rounded-[20px] overflow-hidden shadow-[0_8px_40px_rgba(20,33,61,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-transparent dark:border-white/[0.08]">
            {/* Title bar */}
            <div className="bg-deep-navy px-6 py-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
              </div>
              <div className="font-heading text-[13px] font-medium text-white/70">Teaching Labs — Teacher Dashboard</div>
            </div>

            {/* Student header */}
            <div className="px-8 py-7 border-b border-[rgba(128,128,128,0.1)] flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal text-white flex items-center justify-center font-heading font-bold text-lg">MJ</div>
                <div>
                  <div className="font-heading text-xl font-semibold text-[var(--text-dark)] dark:text-white">Marcus Johnson</div>
                  <div className="text-sm text-[var(--text-muted)] dark:text-white/45 mt-0.5">Assignment: Research Report — Butterflies</div>
                </div>
              </div>
              <div className="font-heading text-[13px] font-semibold tracking-[1px] uppercase bg-[rgba(64,86,244,0.15)] text-gold px-4 py-2 rounded-[20px]">In Progress</div>
            </div>

            {/* Body: two panels */}
            <div className="px-8 py-7 grid grid-cols-2 gap-7 max-md:grid-cols-1">
              {/* Left: Interaction Summary */}
              <div className="bg-[var(--bg-secondary)] dark:bg-[#0D1B30] rounded-xl p-6">
                <div className="font-heading text-xs font-bold tracking-[3px] uppercase text-teal mb-4">Interaction Summary</div>
                {[
                  { label: 'Total exchanges', value: '12' },
                  { label: 'Clarifying questions asked', value: '3' },
                  { label: 'Topic narrowed to', value: 'Monarch migration' },
                  { label: 'Student confidence', value: '▲ Growing', color: 'text-teal' },
                  { label: 'Time spent', value: '18 min' },
                ].map((metric, i) => (
                  <div key={i} className={`flex justify-between items-center py-2.5 ${i < 4 ? 'border-b border-[rgba(128,128,128,0.1)]' : ''}`}>
                    <span className="text-sm text-[var(--text-body)] dark:text-white/70">{metric.label}</span>
                    <span className={`text-sm font-semibold font-heading text-[var(--text-dark)] dark:text-white ${metric.color || ''}`}>{metric.value}</span>
                  </div>
                ))}
              </div>

              {/* Right: Key Moments */}
              <div className="bg-[var(--bg-secondary)] dark:bg-[#0D1B30] rounded-xl p-6">
                <div className="font-heading text-xs font-bold tracking-[3px] uppercase text-teal mb-4">Key Moments</div>
                <ul className="list-none p-0">
                  {[
                    'Student initially asked AI to write the full report',
                    'AI redirected to research question development',
                    'Student explored 3 sub-topics before choosing monarch migration patterns',
                    'Built a thesis statement with guided questioning',
                    'Outlined 4 sections independently after scaffolding',
                  ].map((moment, i, arr) => (
                    <li key={i} className={`relative pl-6 text-sm text-[var(--text-body)] dark:text-white/70 leading-[1.5] ${i < arr.length - 1 ? 'pb-4' : ''} before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-2.5 before:h-2.5 before:rounded-full before:bg-teal ${i < arr.length - 1 ? "after:content-[''] after:absolute after:left-1 after:top-[18px] after:w-0.5 after:h-[calc(100%-12px)] after:bg-[rgba(128,128,128,0.15)]" : ''}`}>
                      {moment}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer: Teacher action */}
            <div className="px-8 py-5 border-t border-[rgba(128,128,128,0.1)] bg-[rgba(0,246,237,0.06)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal text-white flex items-center justify-center text-lg flex-shrink-0">💡</div>
              <div className="text-[15px] text-[var(--text-dark)] dark:text-white font-medium leading-[1.5]">
                Suggested next step: <span className="font-normal text-[var(--text-body)] dark:text-white/70">Marcus is ready for a thesis review conversation. He&apos;s narrowed his focus and built an outline. A 3-minute check-in could help him sharpen his argument before drafting.</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(240, 201, 93, 0.12) 0%, transparent 70%)' }} />
          <div className="fade-up max-w-[800px] mx-auto py-[140px] px-12 text-center relative z-[2] max-md:py-20 max-md:px-6">
            <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-white/50 mb-5">See for Yourself</div>
            <h2 className="font-heading text-[clamp(36px,5vw,56px)] font-extrabold tracking-[-1.5px] text-white mb-5 leading-[1.15]">
              Ready to See Your Classroom Like This?
            </h2>
            <p className="text-lg leading-[1.7] text-white/65 mb-10 max-w-[600px] mx-auto">
              Teaching Labs doesn&apos;t replace great teaching. It helps great teaching reach every student, and proves it.
            </p>
            <Link
              href="/join-waitlist"
              className="inline-flex items-center font-heading text-[17px] font-bold bg-gold text-white px-12 py-4 rounded-full animate-[gentlePulse_2.5s_ease-in-out_infinite] hover:-translate-y-0.5 transition-transform duration-300"
            >
              Get Early Access
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: 'linear-gradient(180deg, var(--color-deep-navy) 0%, #1a2a45 100%)', borderTop: '1px solid rgba(64,86,244,0.2)' }}>
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-white/55 mb-5 max-w-[280px]">AI-powered teaching platform that learns how you teach and helps every student get the support they need.</p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(0,246,237,0.2)]">
                <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5"><path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" /></svg>
                FERPA &amp; COPPA Compliant
              </div>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Platform</div>
              <ul className="space-y-3 list-none">
                {[{href:'/for-teachers',label:'For Teachers'},{href:'/for-students',label:'For Students'},{href:'/for-districts',label:'For Districts'},{href:'/for-parents',label:'For Parents'}].map(({href,label})=>(<li key={href}><Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">{label}</Link></li>))}
              </ul>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Company</div>
              <ul className="space-y-3 list-none">
                {[{href:'/our-story',label:'Our Story'},{href:'/how-it-works',label:'How It Works'},{href:'/pricing',label:'Pricing'},{href:'/contact',label:'Contact'}].map(({href,label})=>(<li key={href}><Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">{label}</Link></li>))}
              </ul>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Legal</div>
              <ul className="space-y-3 list-none">
                {[{href:'#',label:'Privacy Policy'},{href:'#',label:'Terms of Service'},{href:'#',label:'Cookie Policy'},{href:'#',label:'Accessibility'}].map(({href,label})=>(<li key={label}><Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">{label}</Link></li>))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.08] pt-8 text-center text-[13px] text-white/35">&copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
