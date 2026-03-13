'use client';

import { useState, useEffect, useRef } from 'react';
import {
  GraduationCap, Key, QrCode, Camera, BookOpenText, MapPin, UsersThree,
  CheckCircle, Info, CaretLeft, ArrowRight,
} from '@phosphor-icons/react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';

// Demo roster
const SAMPLE_ROSTER = [
  { first: 'Alex', last: 'Rivera', id: '847' },
  { first: 'Alex', last: 'Rodriguez', id: '312' },
  { first: 'Emma', last: 'Johnson', id: '453' },
  { first: 'Emma', last: 'Jones', id: '891' },
  { first: 'Sophia', last: 'Martinez', id: '225' },
  { first: 'Liam', last: 'Chen', id: '667' },
  { first: 'Olivia', last: 'Williams', id: '118' },
  { first: 'Noah', last: 'Brown', id: '534' },
  { first: 'Isabella', last: 'Davis', id: '779' },
  { first: 'Mason', last: 'Garcia', id: '302' },
  { first: 'Ava', last: 'Miller', id: '456' },
  { first: 'Ethan', last: 'Wilson', id: '921' },
  { first: 'Charlotte', last: 'Anderson', id: '555' },
  { first: 'James', last: 'Thomas', id: '738' },
];

type RosterStudent = { first: string; last: string; id: string };
type MatchState = 'none' | 'found' | 'ambiguous' | 'not-found';
type Screen = 1 | 2 | 3;
type JoinMethod = 'code' | 'qr';

export default function StudentSignupPage() {
  const [screen, setScreen] = useState<Screen>(1);
  const [joinMethod, setJoinMethod] = useState<JoinMethod>('code');
  const [classCode, setClassCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [classFound, setClassFound] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [matchState, setMatchState] = useState<MatchState>('none');
  const [matchedStudent, setMatchedStudent] = useState<RosterStudent | null>(null);
  const [ambiguousStudents, setAmbiguousStudents] = useState<RosterStudent[]>([]);
  const [studentId3, setStudentId3] = useState('');
  const [qrScanned, setQrScanned] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const codeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const CLASS_INFO = {
    name: '5th Period Math',
    teacher: 'Mrs. Martinez',
    school: 'Lincoln Elementary',
    district: 'Corydon Central Comm Schools',
    count: '28 students',
  };

  // Code validation
  useEffect(() => {
    if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    if (!classCode) { setCodeStatus('idle'); setClassFound(false); return; }
    if (classCode.length < 4) { setCodeStatus('idle'); return; }
    setCodeStatus('checking');
    codeTimerRef.current = setTimeout(() => {
      if (classCode.length >= 5) {
        setCodeStatus('valid');
        setClassFound(true);
      } else {
        setCodeStatus('invalid');
        setClassFound(false);
      }
    }, 600);
    return () => { if (codeTimerRef.current) clearTimeout(codeTimerRef.current); };
  }, [classCode]);

  // Roster matching
  useEffect(() => {
    if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    setMatchState('none');
    setMatchedStudent(null);
    setAmbiguousStudents([]);
    if (!firstName.trim() || !lastName.trim()) return;

    matchTimerRef.current = setTimeout(() => {
      const f = firstName.trim().toLowerCase();
      const l = lastName.trim().toLowerCase();
      const exact = SAMPLE_ROSTER.filter(s => s.first.toLowerCase() === f && s.last.toLowerCase() === l);
      if (exact.length === 1) { setMatchState('found'); setMatchedStudent(exact[0]); return; }
      if (exact.length > 1) { setMatchState('ambiguous'); setAmbiguousStudents(exact); return; }
      const fuzzy = SAMPLE_ROSTER.filter(s =>
        s.first.toLowerCase() === f &&
        (s.last.toLowerCase().startsWith(l) || l.startsWith(s.last.toLowerCase()))
      );
      if (fuzzy.length === 1) { setMatchState('found'); setMatchedStudent(fuzzy[0]); return; }
      if (fuzzy.length > 1) { setMatchState('ambiguous'); setAmbiguousStudents(fuzzy); return; }
      setMatchState('not-found');
    }, 400);
    return () => { if (matchTimerRef.current) clearTimeout(matchTimerRef.current); };
  }, [firstName, lastName]);

  // ID check for ambiguous
  useEffect(() => {
    if (studentId3.length === 3 && ambiguousStudents.length > 0) {
      const match = ambiguousStudents.find(s => s.id === studentId3);
      if (match) { setMatchedStudent(match); setMatchState('found'); }
    }
  }, [studentId3, ambiguousStudents]);

  const canProceedToScreen2 = matchedStudent !== null && classFound;
  const canProceedToScreen3 = true;

  const simulateQrScan = () => {
    setQrScanned(true);
    setTimeout(() => {
      setClassCode('MATH5A');
    }, 1200);
  };

  const formatName = (val: string) => {
    if (!val) return val;
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  };

  const goToScreen2 = () => {
    if (canProceedToScreen2) setScreen(2);
  };

  const stepDots = [1, 2, 3] as const;

  return (
    <div className="min-h-screen bg-warm-white flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Back link */}
      <div className="w-full max-w-[460px] mb-4">
        {screen === 1 ? (
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-teal transition-colors"
          >
            <CaretLeft size={14} weight="fill" />
            Choose a different role
          </Link>
        ) : (
          <button
            onClick={() => setScreen((screen - 1) as Screen)}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-teal transition-colors"
          >
            <CaretLeft size={14} weight="fill" />
            Back
          </button>
        )}
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 512 512" fill="none" className="w-5 h-5">
            <g transform="translate(156,106)">
              <rect x="60" y="0" width="80" height="300" fill="#FFF" />
              <rect x="40" y="0" width="160" height="80" fill="#FFF" />
              <circle cx="160" cy="200" r="40" fill="#4FA3A5" />
            </g>
          </svg>
        </div>
        <span className="font-heading font-bold text-navy text-lg">TeachingLabs</span>
      </div>

      {/* Stepper */}
      <div className="flex gap-2 mb-6">
        {stepDots.map(dot => (
          <div
            key={dot}
            className={`w-2 h-2 rounded-full transition-all ${dot === screen ? 'bg-teal w-5' : 'bg-border'}`}
          />
        ))}
      </div>

      <div className="w-full max-w-[460px]">
        {/* Role badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal/10 text-teal rounded-full font-heading text-xs font-semibold">
            <GraduationCap size={14} weight="fill" />
            Student Account
          </span>
        </div>

        {/* ===== SCREEN 1: Join your class ===== */}
        {screen === 1 && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-text-primary text-center mb-2">Join your class</h1>
            <p className="text-text-secondary text-sm text-center mb-6">How did your teacher share the code?</p>

            {/* Method cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setJoinMethod('code')}
                className={`border-2 rounded-[14px] p-5 text-center cursor-pointer transition-all ${
                  joinMethod === 'code'
                    ? 'border-teal bg-teal/[0.04] shadow-[0_0_0_1px_var(--color-teal)]'
                    : 'border-border hover:border-teal'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <Key size={28} weight="fill" className="text-teal" />
                </div>
                <div className="font-heading font-semibold text-sm text-text-primary mb-1">I have a code</div>
                <div className="text-xs text-text-secondary leading-snug">Type the code your teacher gave you</div>
              </button>
              <button
                onClick={() => setJoinMethod('qr')}
                className={`border-2 rounded-[14px] p-5 text-center cursor-pointer transition-all ${
                  joinMethod === 'qr'
                    ? 'border-teal bg-teal/[0.04] shadow-[0_0_0_1px_var(--color-teal)]'
                    : 'border-border hover:border-teal'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <QrCode size={28} weight="fill" className="text-navy" />
                </div>
                <div className="font-heading font-semibold text-sm text-text-primary mb-1">Scan QR code</div>
                <div className="text-xs text-text-secondary leading-snug">Use your camera to scan the class code</div>
              </button>
            </div>

            {/* Code entry panel */}
            {joinMethod === 'code' && (
              <div className="mb-4">
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={classCode}
                    onChange={e => setClassCode(e.target.value.toUpperCase().slice(0, 8))}
                    placeholder="CLASS CODE"
                    maxLength={8}
                    autoComplete="off"
                    spellCheck={false}
                    className={`w-full font-heading font-bold text-3xl tracking-[6px] text-center uppercase py-5 px-4
                      border-2 rounded-[14px] bg-card-bg text-text-primary outline-none transition-all
                      placeholder:text-sm placeholder:tracking-[3px] placeholder:font-normal placeholder:text-text-muted placeholder:opacity-50
                      focus:border-teal focus:shadow-[0_0_0_3px_rgba(79,163,165,0.15)]
                      ${codeStatus === 'valid' ? 'border-success bg-success/[0.04]' : 'border-border'}`}
                  />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium min-h-6 mb-4">
                  {codeStatus === 'checking' && <span className="text-text-secondary">Checking code...</span>}
                  {codeStatus === 'valid' && (
                    <>
                      <CheckCircle size={16} weight="fill" className="text-success" />
                      <span className="text-success">Class found!</span>
                    </>
                  )}
                  {codeStatus === 'invalid' && (
                    <span className="text-danger text-sm">Code not found. Check with your teacher.</span>
                  )}
                </div>
              </div>
            )}

            {/* QR scan panel */}
            {joinMethod === 'qr' && (
              <div className="mb-4">
                <div className="border-2 border-dashed border-border rounded-[14px] p-10 text-center bg-warm-white hover:border-teal transition-colors mb-3">
                  {!qrScanned ? (
                    <>
                      <Camera size={48} weight="fill" className="mx-auto mb-3 text-text-muted opacity-60" />
                      <p className="text-sm text-text-secondary mb-3">Point your camera at the QR code your teacher is showing</p>
                      <button
                        onClick={simulateQrScan}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal text-white rounded-lg font-heading font-semibold text-sm cursor-pointer"
                      >
                        <Camera size={18} weight="fill" />
                        Open camera
                      </button>
                    </>
                  ) : !classFound ? (
                    <div className="text-center">
                      <div className="text-2xl mb-2">📷</div>
                      <p className="text-text-secondary text-sm">Scanning...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl mb-2">✅</div>
                      <p className="text-success font-semibold text-sm">QR code scanned!</p>
                      <p className="text-text-secondary text-xs mt-1">Code: MATH5A</p>
                    </div>
                  )}
                </div>
                <p className="text-center text-xs text-text-muted">or type the code manually above</p>
              </div>
            )}

            {/* Class info card */}
            {classFound && (
              <div className="bg-teal/[0.06] border border-teal/20 rounded-[14px] p-5 mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[10px] bg-teal text-white flex items-center justify-center flex-shrink-0">
                    <BookOpenText size={20} weight="fill" />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-base text-text-primary">{CLASS_INFO.name}</div>
                    <div className="text-xs text-text-secondary">with {CLASS_INFO.teacher}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} weight="fill" className="text-teal flex-shrink-0" />
                    <span>{CLASS_INFO.school}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UsersThree size={14} weight="fill" className="text-teal flex-shrink-0" />
                    <span>{CLASS_INFO.count}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Name entry */}
            {classFound && (
              <div className="mb-4">
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-text-muted font-medium">Now, find yourself on the roster</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1.5">
                      First name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      onBlur={e => setFirstName(formatName(e.target.value))}
                      placeholder="Alex"
                      className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1.5">
                      Last name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      onBlur={e => setLastName(formatName(e.target.value))}
                      placeholder="Rivera"
                      className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
                    />
                  </div>
                </div>

                {/* Match found */}
                {matchState === 'found' && matchedStudent && (
                  <div className="flex items-center gap-2.5 p-3 bg-success/[0.06] border border-success/20 rounded-lg">
                    <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm text-text-primary">{matchedStudent.first} {matchedStudent.last}</div>
                      <div className="text-xs text-text-secondary">Student ID ending in {matchedStudent.id}</div>
                    </div>
                  </div>
                )}

                {/* Ambiguous match */}
                {matchState === 'ambiguous' && (
                  <div className="p-4 bg-warning/[0.06] border border-warning/30 rounded-lg">
                    <div className="font-semibold text-sm text-warning mb-1">We found more than one match</div>
                    <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                      There are multiple students with that name. Enter the last 3 digits of your Student ID to confirm.
                    </p>
                    <div className="text-center">
                      <input
                        type="text"
                        value={studentId3}
                        onChange={e => setStudentId3(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                        placeholder="_ _ _"
                        inputMode="numeric"
                        className="font-heading font-bold text-2xl tracking-widest text-center w-24 px-3 py-2.5 border-2 border-border rounded-lg bg-card-bg text-text-primary outline-none focus:border-teal"
                      />
                    </div>
                  </div>
                )}

                {/* Not found */}
                {matchState === 'not-found' && (
                  <div className="p-3.5 bg-danger/[0.06] border border-danger/20 rounded-lg text-sm text-danger text-center">
                    We can&apos;t find that name on the class roster. Double-check your spelling or ask your teacher for help.
                  </div>
                )}
              </div>
            )}

            <button
              onClick={goToScreen2}
              disabled={!canProceedToScreen2}
              className="w-full py-3.5 bg-teal text-white font-heading font-semibold rounded-xl text-base mt-2 mb-6 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-teal/90 transition-colors"
            >
              That&apos;s me!
            </button>

            {/* Info banner */}
            <div className="flex items-start gap-2.5 bg-teal/[0.06] border border-teal/20 rounded-lg px-4 py-3.5 mb-4 text-sm text-text-secondary leading-relaxed">
              <Info size={20} weight="fill" className="text-teal flex-shrink-0 mt-0.5" />
              <div>
                <span>Don&apos;t have a code? Your teacher or parent needs to set up the class first.</span>
                {!showInvite && (
                  <div className="mt-2.5">
                    <button
                      onClick={() => setShowInvite(true)}
                      className="px-4 py-2 bg-teal text-white text-xs font-semibold rounded-lg"
                    >
                      Invite your teacher or parent
                    </button>
                  </div>
                )}
              </div>
            </div>

            {showInvite && (
              <div className="border border-border rounded-[14px] p-5 mb-4">
                <label className="block text-xs font-semibold text-text-primary mb-1">Send an invite</label>
                <p className="text-xs text-text-secondary mb-3">We&apos;ll email them instructions to create their account and set up your class.</p>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Their email address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="teacher@school.edu or parent@email.com"
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card-bg text-text-primary outline-none focus:border-teal"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">They are my...</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card-bg text-text-primary outline-none focus:border-teal appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent or guardian</option>
                  </select>
                </div>
                <button className="w-full py-2.5 bg-teal text-white font-semibold text-sm rounded-lg">Send invite</button>
              </div>
            )}

            <p className="text-center text-sm text-text-muted">
              Already have an account?{' '}
              <Link href="/login" className="text-teal font-medium hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* ===== SCREEN 2: Confirm ===== */}
        {screen === 2 && matchedStudent && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-text-primary text-center mb-2">Is this right?</h1>
            <p className="text-text-secondary text-sm text-center mb-6">Make sure everything looks correct before we create your account.</p>

            <div className="bg-teal/[0.06] border border-teal/20 rounded-[14px] p-6 mb-6">
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-teal text-white inline-flex items-center justify-center font-heading font-bold text-xl mb-2">
                  {matchedStudent.first.charAt(0)}{matchedStudent.last.charAt(0)}
                </div>
                <div className="font-heading font-bold text-xl text-text-primary">{matchedStudent.first} {matchedStudent.last}</div>
                <div className="text-sm text-text-secondary mt-0.5">Student</div>
              </div>
              <div className="border-t border-border pt-4 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal text-white flex items-center justify-center flex-shrink-0">
                    <BookOpenText size={18} weight="fill" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-text-primary">{CLASS_INFO.name}</div>
                    <div className="text-xs text-text-secondary">with {CLASS_INFO.teacher}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-navy text-white flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} weight="fill" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-text-primary">{CLASS_INFO.school}</div>
                    <div className="text-xs text-text-secondary">{CLASS_INFO.district}</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setScreen(3)}
              className="w-full py-3.5 bg-teal text-white font-heading font-semibold rounded-xl text-base mb-3 hover:bg-teal/90 transition-colors"
            >
              Yes, that&apos;s me!
            </button>
            <button
              onClick={() => setScreen(1)}
              className="w-full py-3.5 bg-transparent text-text-secondary font-heading font-semibold rounded-xl text-base border border-border hover:border-teal hover:text-text-primary transition-colors"
            >
              No, go back
            </button>

            <p className="text-center text-sm text-text-muted mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-teal font-medium hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* ===== SCREEN 3: Choose how to sign in ===== */}
        {screen === 3 && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-text-primary text-center mb-2">Choose how to sign in</h1>
            <p className="text-text-secondary text-sm text-center mb-6">Pick the easiest way for you to log in next time.</p>

            <div className="flex flex-col gap-2 mb-4">
              {/* Google */}
              <Link
                href="/student/onboarding"
                className="flex items-center gap-3 w-full px-4 py-3.5 border border-border rounded-xl bg-surface hover:bg-card-bg transition-colors font-medium text-sm text-text-primary"
              >
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Link>
              {/* Microsoft */}
              <Link
                href="/student/onboarding"
                className="flex items-center gap-3 w-full px-4 py-3.5 border border-border rounded-xl bg-surface hover:bg-card-bg transition-colors font-medium text-sm text-text-primary"
              >
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                  <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
                  <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
                </svg>
                Continue with Microsoft
              </Link>
              {/* ClassLink */}
              <Link
                href="/student/onboarding"
                className="flex items-center gap-3 w-full px-4 py-3.5 border border-border rounded-xl bg-surface hover:bg-card-bg transition-colors font-medium text-sm text-text-primary"
              >
                <div className="grid grid-cols-3 gap-0.5 w-[22px] h-[22px]">
                  {['#2196F3','#4CAF50','#FF9800','#F44336','#9C27B0','#FFEB3B','#009688','#E91E63','#607D8B'].map((c, i) => (
                    <span key={i} className="w-[6px] h-[6px] rounded-full" style={{ background: c }} />
                  ))}
                </div>
                Continue with ClassLink
              </Link>
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted">or create a username</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Username <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="cool_learner_42"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card-bg text-text-primary outline-none focus:border-teal"
                />
                <span className="text-xs text-text-muted mt-1 block">For safety, don&apos;t use your real name.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card-bg text-text-primary outline-none focus:border-teal"
                />
                <span className="text-xs text-text-muted mt-1 block">At least 8 characters with a number and symbol</span>
              </div>
            </div>

            <Link
              href="/student/onboarding"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-teal text-white font-heading font-semibold rounded-xl text-base mt-2 mb-6 hover:bg-teal/90 transition-colors"
            >
              Create account
              <ArrowRight size={18} weight="fill" />
            </Link>

            <p className="text-center text-sm text-text-muted">
              Already have an account?{' '}
              <Link href="/login" className="text-teal font-medium hover:underline">Log in</Link>
            </p>
          </div>
        )}
      </div>

      <p className="mt-10 text-xs text-text-muted text-center max-w-sm">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-teal hover:underline">Terms of Service</a> and{' '}
        <a href="#" className="text-teal hover:underline">Privacy Policy</a>.
      </p>
    </div>
  );
}
