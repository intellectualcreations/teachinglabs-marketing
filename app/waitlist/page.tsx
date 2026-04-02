'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import MarketingNav from '@/components/shared/MarketingNav';
import MarketingFooter from '@/components/shared/MarketingFooter';
import ScrollReveal from '@/components/shared/ScrollReveal';

const ROTATING_WORDS = [
  'Personalized to every student',
  'Adaptive to every level',
  'Safe for every classroom',
  'Built by a teacher, for teachers',
];

const CONFETTI_COLORS = ['#00F6ED', '#4056F4', '#561F37', '#0a1128'];

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; w: number; h: number;
      color: string; rotation: number; rotSpeed: number;
      vx: number; vy: number; gravity: number; opacity: number;
    }[] = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        gravity: 0.05,
        opacity: 1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) p.opacity -= 0.02;
        if (p.opacity <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      aria-hidden="true"
    />
  );
}

export default function WaitlistPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [currentWord, setCurrentWord] = useState(0);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const mountTimeRef = useRef<number>(0);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => { mountTimeRef.current = Date.now(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!formRef.current) return;
    const inputs = formRef.current.querySelectorAll('.waitlist-input');
    inputs.forEach((input) => {
      if (focusedInput && input.getAttribute('data-input-id') !== focusedInput) {
        input.classList.add('sibling-focused');
      } else {
        input.classList.remove('sibling-focused');
      }
    });
  }, [focusedInput]);

  const handleFocus = useCallback((inputId: string) => setFocusedInput(inputId), []);
  const handleBlur = useCallback(() => setFocusedInput(null), []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - mountTimeRef.current < 2000) return;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, role, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEmailError(data.error || 'Something went wrong. Please try again.');
        return;
      }
    } catch {
      setEmailError('Network error. Please try again.');
      return;
    }
    setSubmitted(true);
  };

  const handleShare = () => {
    const shareText = 'I just joined the Teaching Labs waitlist! AI teaching assistants that adapt to every student. Check it out:';
    const shareUrl = 'https://teachinglabs.com/waitlist';
    if (navigator.share) {
      navigator.share({ title: 'Teaching Labs', text: shareText, url: shareUrl });
    } else {
      window.open(
        `mailto:?subject=${encodeURIComponent('Check out Teaching Labs')}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
        '_blank'
      );
    }
  };

  const inputClassName = (inputId: string) =>
    `waitlist-input px-5 py-3 text-[15px] font-body` +
    (focusedInput && focusedInput !== inputId ? ' sibling-focused' : '');

  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      <main className="min-h-screen bg-white dark:bg-transparent overflow-x-hidden">
        {/* ── HERO ── */}
        <section className="section-blend relative overflow-hidden">
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute w-[600px] h-[600px] rounded-full top-[5%] left-[10%] max-md:w-[300px] max-md:h-[300px] opacity-[0.10] dark:opacity-[0.08]"
              style={{ background: '#00F6ED', filter: 'blur(80px)' }} />
            <div className="absolute w-[500px] h-[500px] rounded-full top-[20%] right-[5%] max-md:w-[280px] max-md:h-[280px] opacity-[0.10] dark:opacity-[0.08]"
              style={{ background: '#4056F4', filter: 'blur(80px)' }} />
            <div className="absolute w-[400px] h-[400px] rounded-full bottom-[10%] left-[30%] opacity-[0.05] dark:opacity-[0.06] max-md:hidden"
              style={{ background: '#561F37', filter: 'blur(80px)' }} />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-12 max-md:px-6 py-32 max-md:py-20 text-center">
            <div className="fade-up">
              <h1 className="font-heading font-extrabold tracking-[-2px] leading-[1.15] text-text-primary mb-6"
                style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}>
                Your Teaching.{' '}
                <br className="max-md:hidden" />
                Your{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Voice.</span>
                <br />
                Your AI<span className="text-underline">.</span>
              </h1>
            </div>

            <div className="fade-up">
              <p className="font-body text-xl leading-[1.7] text-text-secondary mb-6 max-w-[620px] mx-auto max-md:text-lg">
                AI teaching assistants that sound like you, teach like you,
                <br className="max-md:hidden" />
                and adapt to every student where they are.
              </p>
            </div>

            {/* Rotating words */}
            <div className="flex items-center justify-center gap-3 mb-10 h-8 fade-up">
              <span className="text-text-muted">—</span>
              <span className="font-heading text-sm font-medium text-eyebrow transition-opacity duration-500">
                {ROTATING_WORDS[currentWord]}
              </span>
            </div>

            {/* Waitlist Form */}
            {!submitted ? (
              <div className="max-w-[960px] mx-auto fade-up" ref={formRef}>
                <form onSubmit={handleSubmit}>
                  {/* Honeypot */}
                  <div className="absolute" style={{ left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off"
                      value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </div>

                  {/* Desktop row */}
                  <div className="hidden md:flex justify-center gap-3 mb-4">
                    <input type="text" placeholder="First name" required data-input-id="firstName"
                      value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => handleFocus('firstName')} onBlur={handleBlur}
                      className={`${inputClassName('firstName')} w-[160px]`} />
                    <input type="text" placeholder="Last name" required data-input-id="lastName"
                      value={lastName} onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => handleFocus('lastName')} onBlur={handleBlur}
                      className={`${inputClassName('lastName')} w-[160px]`} />
                    <select required data-input-id="role" value={role}
                      onChange={(e) => setRole(e.target.value)}
                      onFocus={() => handleFocus('role')} onBlur={handleBlur}
                      className={`${inputClassName('role')} w-[180px] appearance-none`}>
                      <option value="" disabled>I am a...</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">School Administrator</option>
                      <option value="district">District Leader</option>
                      <option value="parent">Parent</option>
                      <option value="other">Other</option>
                    </select>
                    <input type="email" placeholder="School email address" required data-input-id="email"
                      value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      onFocus={() => handleFocus('email')} onBlur={handleBlur}
                      className={`${inputClassName('email')} w-[440px]${emailError ? ' !border-red-500' : ''}`} />
                    <button type="submit"
                      className="font-heading text-[15px] font-bold text-text-primary px-6 py-3 rounded-full border-2 border-gold bg-transparent hover:bg-gold hover:text-white hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap cursor-pointer">
                      Join the Waitlist →
                    </button>
                  </div>

                  {/* Mobile stack */}
                  <div className="flex flex-col gap-3 md:hidden mb-4">
                    <input type="text" placeholder="First name" required data-input-id="firstName"
                      value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => handleFocus('firstName')} onBlur={handleBlur}
                      className={`${inputClassName('firstName')} w-full`} />
                    <input type="text" placeholder="Last name" required data-input-id="lastName"
                      value={lastName} onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => handleFocus('lastName')} onBlur={handleBlur}
                      className={`${inputClassName('lastName')} w-full`} />
                    <select required data-input-id="role" value={role}
                      onChange={(e) => setRole(e.target.value)}
                      onFocus={() => handleFocus('role')} onBlur={handleBlur}
                      className={`${inputClassName('role')} w-full appearance-none`}>
                      <option value="" disabled>I am a...</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">School Administrator</option>
                      <option value="district">District Leader</option>
                      <option value="parent">Parent</option>
                      <option value="other">Other</option>
                    </select>
                    <input type="email" placeholder="School email address" required data-input-id="email"
                      value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      onFocus={() => handleFocus('email')} onBlur={handleBlur}
                      className={`${inputClassName('email')} w-full${emailError ? ' !border-red-500' : ''}`} />
                    <button type="submit"
                      className="w-full font-heading text-[15px] font-bold text-text-primary px-6 py-3.5 rounded-full border-2 border-gold bg-transparent hover:bg-gold hover:text-white transition-all duration-300 cursor-pointer">
                      Join the Waitlist →
                    </button>
                  </div>

                  {emailError && (
                    <p className="text-red-500 text-sm font-medium mt-1 mb-2">{emailError}</p>
                  )}
                </form>

                <p className="font-heading text-[13px] text-text-muted">
                  Free early access <span className="mx-1">·</span> No credit card required <span className="mx-1">·</span> Join 4,000+ teachers
                </p>
              </div>
            ) : (
              <>
                <ConfettiCanvas />
                <div className="relative z-10 flex flex-col items-center justify-center py-10">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="mb-8">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#00F6ED" strokeWidth="4" className="success-circle" />
                    <path d="M30 52 L44 66 L70 38" fill="none" stroke="#00F6ED" strokeWidth="4"
                      strokeLinecap="round" strokeLinejoin="round" className="success-check" />
                  </svg>
                  <h2 className="font-heading font-extrabold text-text-primary mb-4 success-fade-up"
                    style={{ fontSize: 'clamp(36px, 5vw, 56px)', animationDelay: '0.8s' }}>
                    You&apos;re on the list!
                  </h2>
                  <p className="font-body text-xl text-text-secondary mb-2 success-fade-up" style={{ animationDelay: '1.1s' }}>
                    Welcome to the future of learning.
                  </p>
                  <p className="font-body text-lg text-text-muted mb-8 success-fade-up" style={{ animationDelay: '1.4s' }}>
                    We&apos;ll reach out as soon as your spot opens.
                  </p>
                  <button onClick={handleShare}
                    className="font-heading text-[15px] font-bold text-text-primary px-8 py-3 rounded-full border-2 border-gold bg-transparent hover:bg-gold hover:text-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer success-fade-up"
                    style={{ animationDelay: '1.7s' }}>
                    Tell a colleague →
                  </button>
                </div>
              </>
            )}

            {/* Stats strip */}
            <div className="flex flex-wrap justify-center gap-4 mt-12 fade-up">
              {[
                { icon: '🏫', label: 'K–12 Ready' },
                { icon: '🔒', label: 'FERPA & COPPA Compliant' },
                { icon: '🎙️', label: 'Voice-Cloned AI Agents' },
                { icon: '⚡', label: 'Adapts in Real Time' },
              ].map(({ icon, label }) => (
                <div key={label} className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-text-secondary bg-card-bg dark:bg-white/[0.06] px-4 py-2 rounded-full border border-[rgba(128,128,128,0.15)] dark:border-white/10">
                  <span>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
