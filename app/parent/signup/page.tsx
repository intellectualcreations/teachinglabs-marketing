'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UsersThree, ArrowLeft, Eye, EyeSlash, CheckCircle, Spinner } from '@phosphor-icons/react';

// Demo child data that any 6-char code resolves to
const DEMO_CHILD = {
  name: 'Emma Johnson',
  initials: 'EJ',
  className: '5th Grade Math with Mrs. Martinez',
  school: 'Lincoln Elementary',
  district: 'Corydon Central Community Schools',
  teacher: 'Mrs. Jane Martinez',
  grade: '5th Grade',
};

const RELATIONSHIPS = ['Mother', 'Father', 'Stepmother', 'Stepfather', 'Grandmother', 'Grandfather', 'Legal Guardian', 'Other'];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const CORAL = '#E8836B';

export default function ParentSignupPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<1 | 2>(1);

  // Code input
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'found' | 'error'>('idle');
  const [codeConfirmed, setCodeConfirmed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notify section
  const [showNotify, setShowNotify] = useState(false);
  const [notifySent, setNotifySent] = useState(false);
  const [notifyParentFirst, setNotifyParentFirst] = useState('');
  const [notifyParentLast, setNotifyParentLast] = useState('');
  const [notifyChildFirst, setNotifyChildFirst] = useState('');
  const [notifyChildLast, setNotifyChildLast] = useState('');
  const [notifyTeacherEmail, setNotifyTeacherEmail] = useState('');
  const [notifyParentEmail, setNotifyParentEmail] = useState('');

  // Screen 2
  const [parentFirst, setParentFirst] = useState('');
  const [parentLast, setParentLast] = useState('');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const codeString = code.join('');
  const codeComplete = codeString.length === 6 && code.every((c) => c.length === 1);

  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (!codeComplete) {
      setCodeStatus('idle');
      setCodeConfirmed(false);
      return;
    }
    setCodeStatus('checking');
    setCodeConfirmed(false);
    checkTimer.current = setTimeout(() => {
      // Any 6-char code works in the prototype
      setCodeStatus('found');
      setCodeConfirmed(true);
    }, 800);
    return () => { if (checkTimer.current) clearTimeout(checkTimer.current); };
  }, [codeString, codeComplete]);

  function handleCodeInput(idx: number, val: string) {
    const char = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-1);
    const newCode = [...code];
    newCode[idx] = char;
    setCode(newCode);
    if (char && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handleCodeKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      const newCode = [...code];
      newCode[idx - 1] = '';
      setCode(newCode);
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < paste.length; i++) newCode[i] = paste[i];
    setCode(newCode);
    const focusIdx = Math.min(paste.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  function sendNotify() {
    if (!notifyTeacherEmail.trim() || !notifyParentEmail.trim()) return;
    setShowNotify(false);
    setNotifySent(true);
  }

  function goToScreen2() {
    setScreen(2);
    window.scrollTo(0, 0);
  }

  function handleCreate() {
    router.push('/parent/dashboard');
  }

  const SELECT_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col items-center justify-center px-4 py-12">

      <div className="w-full max-w-[460px] mb-4">
        {screen === 1 ? (
          <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft weight="bold" size={16} />
            Choose a different role
          </Link>
        ) : (
          <button onClick={() => { setScreen(1); window.scrollTo(0,0); }}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft weight="bold" size={16} />
            Back
          </button>
        )}
      </div>

      <Link href="/" className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 512 512" fill="none" className="w-6 h-6">
            <g transform="translate(156,106)">
              <rect x="60" y="0" width="80" height="300" fill="#FFF" />
              <rect x="40" y="0" width="160" height="80" fill="#FFF" />
              <circle cx="160" cy="200" r="40" fill="#4FA3A5" />
            </g>
          </svg>
        </div>
        <span className="font-heading font-bold text-xl text-text-primary">TeachingLabs</span>
      </Link>

      {/* Step dots */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((dot) => (
          <div key={dot} className="rounded-full transition-all duration-300" style={{
            width: dot === screen ? 24 : 8, height: 8,
            background: dot <= screen ? CORAL : '#E2E8F0',
          }} />
        ))}
      </div>

      <div className="w-full max-w-[460px] animate-[fadeUp_0.4s_ease-out]">

        {/* Role badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-heading text-[13px] font-semibold"
            style={{ background: 'rgba(232,131,107,0.1)', color: '#C75B3A' }}>
            <UsersThree weight="fill" size={14} />
            Parent / Guardian Account
          </span>
        </div>

        {/* ======= SCREEN 1: Invite code ======= */}
        {screen === 1 && (
          <div className="animate-[fadeUp_0.3s_ease-out]">
            <h1 className="font-heading text-2xl font-bold text-text-primary text-center mb-2">
              Connect with your child
            </h1>
            <p className="text-text-secondary text-[15px] text-center mb-7">
              Enter the parent invite code from your child&apos;s teacher.
            </p>

            {/* Code input */}
            <label className="block font-heading text-sm font-medium text-text-primary text-center mb-3">
              Parent invite code
            </label>
            <div className="flex justify-center gap-2 mb-4" onPaste={handleCodePaste}>
              {code.map((char, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={2}
                  value={char}
                  onChange={(e) => handleCodeInput(idx, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                  onFocus={() => setFocusedIdx(idx)}
                  onBlur={() => setFocusedIdx(null)}
                  className="w-12 h-14 text-center font-heading text-2xl font-bold rounded-xl border-2 bg-surface dark:bg-card-bg text-text-primary outline-none transition-all uppercase"
                  style={{
                    borderColor: char ? CORAL : codeStatus === 'error' ? '#DC2626' : '#E2E8F0',
                    boxShadow: focusedIdx === idx ? `0 0 0 3px rgba(232,131,107,0.15)` : undefined,
                  }}
                />
              ))}
            </div>

            {/* Code status */}
            <div className="flex items-center justify-center gap-2 text-sm min-h-5 mb-4">
              {codeStatus === 'checking' && (
                <><Spinner size={16} className="animate-spin" style={{ color: CORAL }} />
                  <span className="text-text-secondary">Checking code...</span></>
              )}
              {codeStatus === 'found' && (
                <><CheckCircle weight="fill" size={16} style={{ color: '#059669' }} />
                  <span style={{ color: '#059669' }} className="font-medium">Code found!</span></>
              )}
              {codeStatus === 'error' && (
                <span className="text-danger font-medium">Invalid code. Please check and try again.</span>
              )}
            </div>

            {/* Child info card */}
            {codeConfirmed && (
              <div className="rounded-2xl border-2 p-5 mb-5 animate-[fadeUp_0.3s_ease-out]"
                style={{ borderColor: 'rgba(232,131,107,0.3)', background: 'rgba(232,131,107,0.04)' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-lg text-white flex-shrink-0"
                    style={{ background: CORAL }}>
                    {DEMO_CHILD.initials}
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-[17px] text-text-primary">{DEMO_CHILD.name}</div>
                    <div className="text-[13px] text-text-secondary mt-0.5">{DEMO_CHILD.className}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  {[
                    { label: 'School', value: DEMO_CHILD.school },
                    { label: 'District', value: DEMO_CHILD.district },
                    { label: 'Teacher', value: DEMO_CHILD.teacher },
                    { label: 'Grade', value: DEMO_CHILD.grade },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-text-muted mb-1">{label}</div>
                      <div className="text-sm text-text-primary font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={codeConfirmed ? goToScreen2 : undefined}
              disabled={!codeConfirmed}
              className="w-full py-3.5 rounded-xl font-heading font-semibold text-[15px] text-white transition-all"
              style={{ background: CORAL, opacity: codeConfirmed ? 1 : 0.4, cursor: codeConfirmed ? 'pointer' : 'not-allowed' }}
            >
              Yes, that&apos;s my child!
            </button>

            {/* No code section */}
            {!notifySent && (
              <div className="mt-6 text-center p-5 border-2 border-dashed border-border rounded-2xl">
                <p className="text-sm text-text-primary font-semibold mb-1">Don&apos;t have a code?</p>
                <p className="text-sm text-text-secondary mb-4">
                  Your child&apos;s teacher will send you one once they&apos;re set up on TeachingLabs.
                </p>
                {!showNotify ? (
                  <button
                    onClick={() => setShowNotify(true)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                    style={{ background: CORAL }}
                  >
                    Let the teacher know you&apos;re interested
                  </button>
                ) : (
                  <div className="text-left border border-border rounded-2xl p-5 mt-2 animate-[fadeUp_0.3s_ease-out]"
                    style={{ background: 'rgba(232,131,107,0.03)' }}>
                    <p className="font-heading font-semibold text-[15px] text-text-primary mb-1">Let the teacher know</p>
                    <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
                      We&apos;ll email them that a parent is interested in connecting. If they don&apos;t have an account yet, we&apos;ll invite them to join TeachingLabs.
                    </p>

                    <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">Your name</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <input type="text" value={notifyParentFirst} onChange={(e) => setNotifyParentFirst(e.target.value)} placeholder="First name"
                        className="px-3 py-2.5 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none focus:border-teal transition-colors" />
                      <input type="text" value={notifyParentLast} onChange={(e) => setNotifyParentLast(e.target.value)} placeholder="Last name"
                        className="px-3 py-2.5 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none focus:border-teal transition-colors" />
                    </div>

                    <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">Your child&apos;s name</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <input type="text" value={notifyChildFirst} onChange={(e) => setNotifyChildFirst(e.target.value)} placeholder="Child's first name"
                        className="px-3 py-2.5 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none focus:border-teal transition-colors" />
                      <input type="text" value={notifyChildLast} onChange={(e) => setNotifyChildLast(e.target.value)} placeholder="Child's last name"
                        className="px-3 py-2.5 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none focus:border-teal transition-colors" />
                    </div>

                    <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">Teacher&apos;s email</label>
                    <input type="email" value={notifyTeacherEmail} onChange={(e) => setNotifyTeacherEmail(e.target.value)} placeholder="teacher@school.edu"
                      className="w-full px-4 py-2.5 mb-4 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none focus:border-teal transition-colors" />

                    <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">Your email (so they can send you a code)</label>
                    <input type="email" value={notifyParentEmail} onChange={(e) => setNotifyParentEmail(e.target.value)} placeholder="you@email.com"
                      className="w-full px-4 py-2.5 mb-4 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none focus:border-teal transition-colors" />

                    <button onClick={sendNotify}
                      className="w-full py-2.5 rounded-xl font-heading font-semibold text-sm text-white transition-colors"
                      style={{ background: CORAL }}>
                      Send request
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notify sent */}
            {notifySent && (
              <div className="mt-6 text-center p-6 border border-border rounded-2xl animate-[fadeUp_0.3s_ease-out]"
                style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.3)' }}>
                <div className="text-3xl mb-2">✉️</div>
                <p className="font-heading font-semibold text-base text-text-primary mb-2">We&apos;ve reached out!</p>
                <p className="text-sm text-text-secondary leading-relaxed mb-2">
                  We sent a message to your child&apos;s teacher letting them know you&apos;d like to connect on TeachingLabs.
                </p>
                <p className="text-[13px] text-text-secondary">
                  We&apos;ll email you at <strong className="text-text-primary">{notifyParentEmail}</strong> when your code is ready.
                </p>
              </div>
            )}

            <p className="text-center text-sm text-text-secondary mt-6">
              Already have an account?{' '}
              <Link href="/login" className="font-medium hover:underline" style={{ color: CORAL }}>Log in</Link>
            </p>
          </div>
        )}

        {/* ======= SCREEN 2: Account details ======= */}
        {screen === 2 && (
          <div className="animate-[fadeUp_0.3s_ease-out]">
            <h1 className="font-heading text-2xl font-bold text-text-primary text-center mb-2">
              Create your account
            </h1>
            <p className="text-text-secondary text-[15px] text-center mb-6">
              Set up your parent account to stay connected.
            </p>

            {/* Confirmation banner */}
            <div className="rounded-xl p-4 mb-6 text-center text-[15px] text-text-primary leading-relaxed"
              style={{ background: 'rgba(232,131,107,0.05)', border: '1px solid rgba(232,131,107,0.2)' }}>
              You&apos;re connecting as the parent/guardian of<br />
              <strong style={{ color: CORAL }}>{DEMO_CHILD.name}</strong><br />
              <span className="text-[13px] text-text-secondary">{DEMO_CHILD.className} at {DEMO_CHILD.school}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">
                  Your first name <span className="text-danger">*</span>
                </label>
                <input type="text" value={parentFirst} onChange={(e) => setParentFirst(e.target.value)}
                  onBlur={(e) => { const v = e.target.value.trim(); if (v) setParentFirst(v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()); }}
                  placeholder="First"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': `${CORAL}30` } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">
                  Your last name <span className="text-danger">*</span>
                </label>
                <input type="text" value={parentLast} onChange={(e) => setParentLast(e.target.value)}
                  onBlur={(e) => { const v = e.target.value.trim(); if (v) setParentLast(v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()); }}
                  placeholder="Last"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 transition-all"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">Relationship to student</label>
              <select value={relationship} onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: SELECT_ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}>
                <option value="">Select</option>
                {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* SSO — parents only have Google */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary font-medium">Choose how to sign in</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button onClick={handleCreate}
              className="flex items-center justify-center gap-3 w-full px-4 py-3 mb-5 rounded-xl border border-border bg-surface dark:bg-card-bg hover:bg-bg-secondary dark:hover:bg-[#1E2A3A] transition-colors font-heading text-sm font-medium text-text-primary">
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary font-medium">or create with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="mb-4">
              <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all" />
            </div>

            <div className="mb-2">
              <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1.5">At least 8 characters with a number and symbol</p>
            </div>

            <button onClick={handleCreate}
              className="w-full mt-5 py-3.5 rounded-xl font-heading font-semibold text-[15px] text-white transition-colors"
              style={{ background: CORAL }}>
              Create account
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted text-center max-w-sm mt-10 leading-relaxed">
        By creating an account, you agree to our{' '}
        <Link href="#" className="text-teal hover:underline">Terms of Service</Link>,{' '}
        <Link href="#" className="text-teal hover:underline">Privacy Policy</Link>, and{' '}
        <Link href="#" className="text-teal hover:underline">Data Protection Addendum</Link>.
      </p>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.6s linear infinite; }
      `}</style>
    </div>
  );
}
