import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import FadeUp from '@/components/shared/FadeUp';
import ContactForm from './_components/ContactForm';
import MarketingFooter from '@/components/shared/MarketingFooter';

export const metadata: Metadata = {
  title: 'Contact — Teaching Labs',
  description:
    "Get in touch with Teaching Labs. Whether you're a teacher, district leader, or just curious, we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-white dark:bg-deep-navy py-20 pb-[60px] max-md:py-[60px] max-md:pb-10"
      >
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              background: '#00F6ED',
              opacity: 0.08,
              top: '10%',
              left: '15%',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 450,
              height: 450,
              background: '#4056F4',
              opacity: 0.1,
              top: '30%',
              right: '10%',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="relative z-[2] text-center max-w-[900px] px-12 max-md:px-6">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6 inline-flex items-center">
            <span
              className="inline-block w-2 h-2 bg-gold rounded-full mr-3 flex-shrink-0"
            />
            Contact Us
          </div>

          <h1 className="font-heading text-[clamp(40px,6vw,72px)] font-extrabold tracking-[-2px] leading-[1.1] text-text-primary mb-6">
            Let&apos;s Start a{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Conversation
            </span>
          </h1>

          <p className="font-body text-xl leading-[1.7] text-text-secondary mb-10 max-w-[620px] mx-auto">
            Whether you&apos;re a teacher, district leader, or just curious — we&apos;d love to hear from you.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-5 max-[500px]:flex-col max-[500px]:items-center">
            <Link
              href="/see-the-difference"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white border-2 border-gold hover:bg-gold px-10 py-4 rounded-full hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.45)] transition-all"
            >
              See How It Works
            </Link>
            <Link
              href="https://teaching-labs-demo.netlify.app/landing-page/hero-banner.html"
              className="inline-flex items-center gap-2 font-heading text-base font-semibold bg-transparent text-teal px-10 py-4 rounded-full border-2 border-teal hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all"
            >
              Join the Waitlist
            </Link>
          </div>

          <p className="font-heading text-[13px] text-text-muted">
            We respond to every message personally.
          </p>
        </div>
      </section>

      {/* Main Content — Contact Section */}
      <FadeUp className="max-w-[1100px] mx-auto px-12 py-24 grid grid-cols-2 gap-20 items-start max-md:grid-cols-1 max-md:gap-12 max-md:px-6 max-md:py-[60px]">
        {/* LEFT: Info */}
        <div>
          <h2 className="font-heading text-[32px] font-bold text-text-primary mb-4">
            How can we help?
          </h2>
          <p className="text-base text-text-secondary mb-10 leading-[1.7]">
            Teaching Labs is built for educators, by someone who spent 13 years in the classroom. Reach out — we respond to every message personally.
          </p>

          {/* Info Cards */}
          <div
            className="flex gap-[18px] items-start p-6 border border-transparent rounded-[20px] mb-4 bg-surface shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-none dark:border dark:border-white/10 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] transition-all duration-400"
            style={{ borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(180deg, #00F6ED, rgba(0,246,237,0.3))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}
          >
            <div className="w-11 h-11 bg-[rgba(0,246,237,0.1)] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              ✉️
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-text-primary mb-1 tracking-[0.3px]">
                Email Us
              </h3>
              <a
                href="mailto:hello@teachinglabs.com"
                className="text-sm text-text-secondary hover:text-gold transition-colors"
              >
                hello@teachinglabs.com
              </a>
            </div>
          </div>

          <div
            className="flex gap-[18px] items-start p-6 border border-transparent rounded-[20px] mb-4 bg-surface shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-none dark:border dark:border-white/10 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] transition-all duration-400"
            style={{ borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(180deg, #00F6ED, rgba(0,246,237,0.3))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}
          >
            <div className="w-11 h-11 bg-[rgba(0,246,237,0.1)] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              🏫
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-text-primary mb-1 tracking-[0.3px]">
                District &amp; School Partnerships
              </h3>
              <p className="text-sm text-text-secondary leading-[1.5]">
                Interested in piloting Teaching Labs at your school? We&apos;re scheduling early access now.
              </p>
            </div>
          </div>

          <div
            className="flex gap-[18px] items-start p-6 border border-transparent rounded-[20px] mb-4 bg-surface shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-none dark:border dark:border-white/10 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] transition-all duration-400"
            style={{ borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(180deg, #00F6ED, rgba(0,246,237,0.3))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}
          >
            <div className="w-11 h-11 bg-[rgba(0,246,237,0.1)] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              🎤
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-text-primary mb-1 tracking-[0.3px]">
                Speaking &amp; Press
              </h3>
              <p className="text-sm text-text-secondary leading-[1.5]">
                Conference panels, podcast appearances, or media inquiries — we&apos;re happy to connect.
              </p>
            </div>
          </div>

          {/* Audience Tags */}
          <div className="mt-8">
            <h3 className="font-heading text-[11px] font-bold tracking-[2px] uppercase text-text-muted mb-3.5">
              I am a...
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Classroom Teacher', 'School Administrator', 'District Leader', 'EdTech Investor', 'Parent', 'Student', 'Researcher'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-[20px] font-heading text-[13px] font-medium border border-[rgba(128,128,128,0.15)] text-text-secondary bg-surface"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <ContactForm />
      </FadeUp>

      {/* Footer */}
      <MarketingFooter />
    </>
  );
}
