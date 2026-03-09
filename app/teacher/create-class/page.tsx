'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest, PencilLine,
  Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, ChartBar, Bank, MapTrifold, Translate, ChatsCircle, Basketball,
  PersonSimpleRun, Books, MaskHappy, Heartbeat, Leaf, Robot,
  Ruler, Target, Lightbulb, Star, HouseLine, MagnifyingGlass, Check,
} from '@phosphor-icons/react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
  first: string;
  last: string;
  id: string;
  grade: string;
}

interface IconOption {
  icon: React.ComponentType<any>;
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

const ALL_STUDENTS: Student[] = [
  { first: 'Emma', last: 'Johnson', id: 'STU-10042', grade: '5' },
  { first: 'Liam', last: 'Martinez', id: 'STU-10087', grade: '5' },
  { first: 'Sophia', last: 'Williams', id: 'STU-10103', grade: '5' },
  { first: 'Noah', last: 'Brown', id: 'STU-10156', grade: '5' },
  { first: 'Olivia', last: 'Garcia', id: 'STU-10201', grade: '5' },
  { first: 'Aiden', last: 'Davis', id: 'STU-10245', grade: '5' },
  { first: 'Isabella', last: 'Rodriguez', id: 'STU-10302', grade: '4' },
  { first: 'Mason', last: 'Wilson', id: 'STU-10367', grade: '4' },
  { first: 'Ava', last: 'Anderson', id: 'STU-10412', grade: '4' },
  { first: 'Ethan', last: 'Thomas', id: 'STU-10458', grade: '5' },
  { first: 'Mia', last: 'Jackson', id: 'STU-10503', grade: '5' },
  { first: 'Lucas', last: 'White', id: 'STU-10547', grade: '4' },
  { first: 'Amelia', last: 'Harris', id: 'STU-10602', grade: '5' },
  { first: 'James', last: 'Clark', id: 'STU-10651', grade: '5' },
  { first: 'Harper', last: 'Lewis', id: 'STU-10703', grade: '4' },
  { first: 'Benjamin', last: 'Robinson', id: 'STU-10756', grade: '5' },
  { first: 'Ella', last: 'Walker', id: 'STU-10801', grade: '5' },
  { first: 'Alexander', last: 'Young', id: 'STU-10845', grade: '4' },
  { first: 'Charlotte', last: 'Allen', id: 'STU-10902', grade: '5' },
  { first: 'Daniel', last: 'King', id: 'STU-10958', grade: '5' },
  { first: 'Scarlett', last: 'Wright', id: 'STU-11003', grade: '4' },
  { first: 'Henry', last: 'Scott', id: 'STU-11047', grade: '5' },
  { first: 'Grace', last: 'Adams', id: 'STU-11102', grade: '4' },
  { first: 'Sebastian', last: 'Baker', id: 'STU-11156', grade: '5' },
  { first: 'Chloe', last: 'Gonzalez', id: 'STU-11201', grade: '5' },
];

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepsBar({ step }: { step: 'create' | 'code' }) {
  const steps = [
    { label: 'Add students', state: 'done' },
    { label: 'Create classes', state: step === 'create' ? 'active' : 'done' },
    { label: 'Share join codes', state: step === 'code' ? 'active' : 'idle' },
  ] as const;

  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2 text-[14px] font-medium"
            style={{ color: s.state === 'idle' ? 'var(--text-secondary)' : s.state === 'active' ? 'var(--color-navy)' : 'var(--color-teal)' }}>
            <div
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center font-heading font-semibold text-[13px] shrink-0"
              style={{
                background: s.state === 'done' ? 'var(--color-teal)' : s.state === 'active' ? 'var(--color-navy)' : 'transparent',
                borderColor: s.state === 'done' ? 'var(--color-teal)' : s.state === 'active' ? 'var(--color-navy)' : 'var(--border)',
                color: s.state !== 'idle' ? 'white' : 'var(--text-secondary)',
              }}
            >
              {s.state === 'done' ? '✓' : i + 1}
            </div>
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-3"
              style={{ background: s.state === 'done' ? 'var(--color-teal)' : 'var(--border)' }} />
          )}
        </div>
      ))}
    </div>
  );
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
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | '4' | '5'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [classes, setClasses] = useState<Array<{
    name: string; subject: string; grade: string; count: number; code: string;
    iconIdx: number; desc: string;
  }>>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Filtered students
  const filtered = useMemo(() => {
    return ALL_STUDENTS.filter((s) => {
      if (gradeFilter !== 'all' && s.grade !== gradeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(s.first + ' ' + s.last).toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, gradeFilter]);

  function toggleStudent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((s) => next.add(s.id));
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function createClass() {
    const cls = {
      name: className.trim() || 'Untitled Class',
      subject,
      grade,
      count: selected.size,
      code: generateCode(),
      iconIdx: selectedIcon,
      desc: desc.trim(),
    };
    setClasses((prev) => [...prev, cls]);
    setScreen('code');
    window.scrollTo(0, 0);
  }

  function addAnother() {
    setClassName('');
    setSubject('');
    setGrade('');
    setDesc('');
    setSelected(new Set());
    setSelectedIcon(0);
    setSearch('');
    setGradeFilter('all');
    setScreen('create');
    window.scrollTo(0, 0);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  const IconComp = ICON_OPTIONS[selectedIcon].icon;
  const iconBg = ICON_OPTIONS[selectedIcon].bg;

  return (
    <div className="max-w-[900px] w-full mx-auto py-8 px-6">

      <StepsBar step={screen} />

      {/* ── SCREEN: Create ── */}
      {screen === 'create' && (
        <div>
          <div className="mb-8">
            <h1 className="font-heading text-[28px] font-bold text-text-primary mb-1.5">Create a class</h1>
            <p className="text-[15px] text-text-secondary">Name your class, then pick students from your school roster.</p>
          </div>

          {/* Class details card */}
          <div className="bg-card-bg border border-border rounded-2xl p-8 mb-6">
            <div className="font-heading font-semibold text-[17px] text-text-primary mb-1">Class details</div>
            <div className="text-[14px] text-text-secondary mb-5">What should students see when they join?</div>

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

            {/* 3-col row */}
            <div className="grid grid-cols-3 gap-3 mb-6 max-sm:grid-cols-1">
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
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
                Description <span className="font-normal text-text-secondary">(optional)</span>
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. We'll explore fractions, decimals, and geometry this semester."
                rows={3}
                className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px]
                  bg-surface text-text-primary outline-none focus:border-navy transition-colors resize-y"
              />
            </div>
          </div>

          {/* Student picker card */}
          <div className="bg-card-bg border border-border rounded-2xl p-8 mb-6">
            <div className="font-heading font-semibold text-[17px] text-text-primary mb-1">Add students to this class</div>
            <div className="text-[14px] text-text-secondary mb-5">
              Select students from your school roster (25 students at Lincoln Elementary)
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border-[1.5px] border-border rounded-lg text-[14px]
                    bg-surface text-text-primary outline-none focus:border-navy transition-colors"
                />
              </div>
              <div className="flex gap-1.5">
                {(['all', '4', '5'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGradeFilter(g)}
                    className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium transition-all cursor-pointer
                      ${gradeFilter === g
                        ? 'bg-navy border-navy text-white'
                        : 'bg-transparent border-border text-text-secondary hover:border-navy hover:text-navy'
                      }`}
                  >
                    {g === 'all' ? 'All' : `${g}th`}
                  </button>
                ))}
              </div>
            </div>

            {/* Select actions */}
            <div className="flex items-center gap-3 text-[13px] text-text-secondary mb-3">
              <button onClick={selectAll} className="text-teal font-medium hover:underline cursor-pointer">Select all</button>
              <span>·</span>
              <button onClick={clearSelection} className="text-teal font-medium hover:underline cursor-pointer">Clear selection</button>
              <span className="ml-auto">Showing {filtered.length} students</span>
            </div>

            {/* Student list */}
            <div className="border border-border rounded-lg max-h-[420px] overflow-y-auto">
              {filtered.map((s, i) => {
                const isSelected = selected.has(s.id);
                const initials = s.first[0] + s.last[0];
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleStudent(s.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                      ${i < filtered.length - 1 ? 'border-b border-border' : ''}
                      ${isSelected ? 'bg-teal/[0.06]' : 'hover:bg-teal/[0.03]'}`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                        ${isSelected ? 'bg-teal border-teal' : 'border-border'}`}
                    >
                      {isSelected && <Check size={12} weight="bold" color="white" />}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-surface text-navy flex items-center justify-center
                      font-heading font-semibold text-[12px] shrink-0">
                      {initials}
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <div className="font-medium text-[14px] text-text-primary">{s.first} {s.last}</div>
                      <div className="text-[12px] text-text-secondary font-heading">{s.id}</div>
                    </div>

                    {/* Grade badge */}
                    <span className="px-2.5 py-0.5 rounded-full bg-navy/[0.08] text-[12px] font-semibold text-navy">
                      {s.grade}th
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-teal/[0.06] border border-teal/20
              rounded-lg mt-4 text-[14px]">
              <span>
                <span className="font-semibold text-teal">{selected.size}</span> students selected
              </span>
              <button
                onClick={createClass}
                disabled={selected.size === 0}
                className="px-6 py-2 bg-navy text-white font-heading font-semibold text-[14px] rounded-lg
                  hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Create class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN: Code ── */}
      {screen === 'code' && (
        <div>
          <div className="mb-8">
            <h1 className="font-heading text-[28px] font-bold text-text-primary mb-1.5">Your classes</h1>
            <p className="text-[15px] text-text-secondary">Share these join codes with your students so they can create their accounts.</p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {classes.map((c) => {
              const Ic = ICON_OPTIONS[c.iconIdx]?.icon ?? Star;
              const bg = ICON_OPTIONS[c.iconIdx]?.bg ?? '#4FA3A5';
              return (
                <div key={c.code}
                  className="flex items-center justify-between px-5 py-4 border-[1.5px] border-border
                    rounded-2xl bg-card-bg hover:border-teal transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                      style={{ background: bg }}>
                      <Ic size={20} weight="fill" color="white" />
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-[15px] text-text-primary">{c.name}</div>
                      <div className="text-[13px] text-text-secondary">
                        {[c.grade, c.subject, `${c.count} students`].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => copyCode(c.code)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal/[0.08] border border-teal/20
                        rounded-lg font-heading font-bold text-[15px] tracking-[2px] text-teal cursor-pointer
                        hover:bg-teal/[0.14] transition-colors"
                    >
                      {c.code}
                      {copied === c.code
                        ? <Check size={14} weight="bold" />
                        : <span className="text-[11px] font-normal tracking-normal ml-1">copy</span>
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={addAnother}
              className="px-5 py-2.5 bg-transparent border-[1.5px] border-border rounded-lg text-[14px]
                font-medium text-text-secondary hover:border-navy hover:text-navy transition-colors cursor-pointer"
            >
              + Create another class
            </button>
            <button
              onClick={() => router.push('/teacher/dashboard')}
              className="px-6 py-2.5 bg-teal text-white rounded-lg font-heading font-semibold text-[14px]
                hover:bg-teal/90 transition-colors cursor-pointer"
            >
              Go to dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
