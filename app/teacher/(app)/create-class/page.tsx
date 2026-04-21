'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest, PencilLine,
  Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, ChartBar, Bank, MapTrifold, Translate, ChatsCircle, Basketball,
  PersonSimpleRun, Books, MaskHappy, Heartbeat, Leaf, Robot,
  Ruler, Target, Lightbulb, Star, HouseLine, Check, Copy, UsersThree,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IconOption {
  icon: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  bg: string;
  label: string;
  val: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ICON_OPTIONS: IconOption[] = [
  { icon: MathOperations, bg: '#1F3A5F', label: 'Math', val: 'math' },
  { icon: BookOpenText, bg: '#4FA3A5', label: 'Reading', val: 'reading' },
  { icon: Flask, bg: '#7C3AED', label: 'Science', val: 'science' },
  { icon: GlobeHemisphereWest, bg: '#0891B2', label: 'Social Studies', val: 'social' },
  { icon: PencilLine, bg: '#E8836B', label: 'Writing', val: 'writing' },
  { icon: Palette, bg: '#EC4899', label: 'Art', val: 'art' },
  { icon: MusicNotes, bg: '#8B5CF6', label: 'Music', val: 'music' },
  { icon: Desktop, bg: '#334155', label: 'Computer Science', val: 'cs' },
  { icon: Calculator, bg: '#1F3A5F', label: 'Algebra', val: 'algebra' },
  { icon: Article, bg: '#4FA3A5', label: 'Language Arts', val: 'ela' },
  { icon: TestTube, bg: '#059669', label: 'Chemistry', val: 'chem' },
  { icon: Planet, bg: '#6366F1', label: 'Astronomy', val: 'astro' },
  { icon: Dna, bg: '#10B981', label: 'Biology', val: 'bio' },
  { icon: ChartBar, bg: '#F59E0B', label: 'Statistics', val: 'stats' },
  { icon: Bank, bg: '#92400E', label: 'History', val: 'history' },
  { icon: MapTrifold, bg: '#0D9488', label: 'Geography', val: 'geo' },
  { icon: Translate, bg: '#DC2626', label: 'Spanish', val: 'spanish' },
  { icon: ChatsCircle, bg: '#2563EB', label: 'French', val: 'french' },
  { icon: Basketball, bg: '#EA580C', label: 'PE', val: 'pe' },
  { icon: PersonSimpleRun, bg: '#D97706', label: 'Fitness', val: 'fitness' },
  { icon: Books, bg: '#7C3AED', label: 'Library', val: 'library' },
  { icon: MaskHappy, bg: '#BE185D', label: 'Drama', val: 'drama' },
  { icon: Heartbeat, bg: '#DC2626', label: 'Health', val: 'health' },
  { icon: Leaf, bg: '#059669', label: 'Environment', val: 'env' },
  { icon: Robot, bg: '#475569', label: 'Robotics', val: 'robotics' },
  { icon: Ruler, bg: '#1F3A5F', label: 'Geometry', val: 'geometry' },
  { icon: Target, bg: '#E8836B', label: 'Focus', val: 'focus' },
  { icon: Lightbulb, bg: '#F59E0B', label: 'Ideas', val: 'ideas' },
  { icon: Star, bg: '#4FA3A5', label: 'General', val: 'star' },
  { icon: HouseLine, bg: '#64748B', label: 'Homeroom', val: 'homeroom' },
];

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateClassPage() {
  const router = useRouter();

  // Form state
  const [screen, setScreen] = useState<'create' | 'code'>('create');
  const [selectedIcon, setSelectedIcon] = useState<number>(0);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [desc, setDesc] = useState('');
  const [maxStudents, setMaxStudents] = useState(30);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdClass, setCreatedClass] = useState<{
    name: string; subject: string; grade: string; code: string;
    iconIdx: number; desc: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  async function createClass() {
    if (!className.trim()) return;

    setSaving(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be signed in to create a class.');
        setSaving(false);
        return;
      }

      const joinCode = generateCode();

      const { error: insertError } = await (supabase.from as any)('classes').insert({ // eslint-disable-line @typescript-eslint/no-explicit-any
        teacher_id: user.id,
        name: className.trim(),
        subject: subject || null,
        grade_level: grade || null,
        description: desc.trim() || null,
        join_code: joinCode,
        icon: ICON_OPTIONS[selectedIcon].val,
        max_students: maxStudents || 30,
      });

      if (insertError) {
        console.error('Create class error:', insertError);
        setError('Something went wrong. Please try again.');
        setSaving(false);
        return;
      }

      setCreatedClass({
        name: className.trim(),
        subject,
        grade,
        code: joinCode,
        iconIdx: selectedIcon,
        desc: desc.trim(),
      });
      setScreen('code');
      window.scrollTo(0, 0);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const IconComp = ICON_OPTIONS[selectedIcon].icon;
  const iconBg = ICON_OPTIONS[selectedIcon].bg;

  return (
    <div className="max-w-[700px] w-full mx-auto py-8 px-6">

      {/* ── SCREEN: Create ── */}
      {screen === 'create' && (
        <div>
          <div className="mb-8">
            <h1 className="font-heading text-[28px] font-bold text-text-primary mb-1.5">Create a class</h1>
            <p className="text-[15px] text-text-secondary">Set up your class and get a join code. Students will use the code to connect.</p>
          </div>

          {/* Class details card */}
          <div className="bg-card-bg border border-border rounded-2xl p-8 mb-6">
            {/* Preview */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: iconBg }}>
                <IconComp size={28} weight="fill" color="white" />
              </div>
              <div>
                <div className="font-heading font-semibold text-[17px] text-text-primary">
                  {className.trim() || 'Your Class Name'}
                </div>
                <div className="text-[13px] text-text-secondary">
                  {[grade, subject].filter(Boolean).join(' · ') || 'Subject · Grade'}
                </div>
              </div>
            </div>

            {/* Icon picker */}
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-text-primary mb-2">Class icon</label>
              <div className="flex flex-wrap gap-2.5">
                {ICON_OPTIONS.map((opt, idx) => {
                  const Ic = opt.icon;
                  const isSel = idx === selectedIcon;
                  return (
                    <button
                      key={opt.val}
                      title={opt.label}
                      onClick={() => setSelectedIcon(idx)}
                      className="w-12 h-12 rounded-xl border-2 flex items-center justify-center
                        transition-all hover:scale-110 shrink-0 cursor-pointer"
                      style={{
                        background: opt.bg,
                        borderColor: isSel ? 'white' : 'transparent',
                        boxShadow: isSel
                          ? '0 0 0 3px var(--color-teal), 0 4px 12px rgba(79,163,165,0.3)'
                          : undefined,
                      }}
                    >
                      <Ic size={22} weight="fill" color="white" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-4 gap-3 mb-6 max-sm:grid-cols-2">
              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
                  Class name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. 5th Grade Math"
                  className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px]
                    bg-surface text-text-primary outline-none focus:border-navy transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px]
                    bg-surface text-text-primary outline-none focus:border-navy transition-colors"
                >
                  <option value="">Select</option>
                  <option>Math</option>
                  <option>Science</option>
                  <option>English / Language Arts</option>
                  <option>Social Studies</option>
                  <option>All Subjects</option>
                  <option>Art</option>
                  <option>Music</option>
                  <option>PE</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Grade level</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px]
                    bg-surface text-text-primary outline-none focus:border-navy transition-colors"
                >
                  <option value="">Select</option>
                  <option>Pre-K</option><option>K</option>
                  <option>1st</option><option>2nd</option><option>3rd</option>
                  <option>4th</option><option>5th</option><option>6th</option>
                  <option>7th</option><option>8th</option><option>9th</option>
                  <option>10th</option><option>11th</option><option>12th</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">Max students</label>
                <input
                  type="number"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(Math.max(1, Math.min(100, parseInt(e.target.value) || 30)))}
                  min={1}
                  max={100}
                  className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px]
                    bg-surface text-text-primary outline-none focus:border-navy transition-colors"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-text-primary">
                  Description <span className="font-normal text-text-secondary">(optional)</span>
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!className.trim()) return;
                    setGeneratingDesc(true);
                    try {
                      const res = await fetch('/api/teacher/generate-description', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ className: className.trim(), subject, grade, rawDescription: desc.trim() || undefined }),
                      });
                      const data = await res.json();
                      if (data.description) setDesc(data.description);
                    } catch { /* ignore */ }
                    setGeneratingDesc(false);
                  }}
                  disabled={!className.trim() || generatingDesc}
                  className="text-xs font-medium text-teal hover:text-teal/80 disabled:text-text-muted
                    disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-colors"
                >
                  {generatingDesc ? '✨ Polishing...' : desc.trim() ? '✨ Polish with AI' : '✨ Generate with AI'}
                </button>
              </div>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. We'll explore fractions, decimals, and geometry this semester."
                rows={3}
                className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px]
                  bg-surface text-text-primary outline-none focus:border-navy transition-colors resize-y"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* How students join info */}
            <div className="p-4 rounded-xl bg-teal/[0.06] border border-teal/20 mb-6">
              <div className="flex items-start gap-3">
                <UsersThree size={24} weight="fill" className="text-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-medium text-text-primary mb-1">How do students join?</p>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    After creating your class, you&apos;ll get a unique join code. Share it with your students and they&apos;ll use it to sign up and connect to your class automatically.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={createClass}
              disabled={!className.trim() || saving}
              className="w-full px-6 py-3 bg-navy text-white font-heading font-semibold text-[15px] rounded-lg
                hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? 'Creating...' : 'Create Class & Get Join Code'}
            </button>
          </div>
        </div>
      )}

      {/* ── SCREEN: Code ── */}
      {screen === 'code' && createdClass && (
        <div>
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style={{ background: ICON_OPTIONS[createdClass.iconIdx]?.bg ?? '#4FA3A5' }}>
              {(() => {
                const Ic = ICON_OPTIONS[createdClass.iconIdx]?.icon ?? Star;
                return <Ic size={32} weight="fill" color="white" />;
              })()}
            </div>
            <h1 className="font-heading text-[28px] font-bold text-text-primary mb-1.5">
              {createdClass.name} is ready!
            </h1>
            <p className="text-[15px] text-text-secondary">
              Share this join code with your students so they can connect.
            </p>
          </div>

          {/* Join code card */}
          <div className="bg-card-bg border border-border rounded-2xl p-8 mb-6 text-center">
            <p className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Student Join Code</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="font-heading font-bold text-[40px] tracking-[6px] text-navy dark:text-teal">
                {createdClass.code}
              </span>
            </div>
            <button
              onClick={() => copyCode(createdClass.code)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal/[0.08] border border-teal/20
                rounded-lg font-medium text-[14px] text-teal cursor-pointer
                hover:bg-teal/[0.14] transition-colors"
            >
              {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
              {copied ? 'Copied!' : 'Copy code'}
            </button>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-[14px] text-text-secondary leading-relaxed">
                Students go to the signup page, enter this code, and they&apos;re connected to your class. You&apos;ll see them appear on your dashboard as they join.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/teacher/my-classes')}
              className="flex-1 px-6 py-3 bg-teal text-navy rounded-lg font-heading font-semibold text-[14px]
                hover:bg-teal/90 transition-colors cursor-pointer text-center"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
