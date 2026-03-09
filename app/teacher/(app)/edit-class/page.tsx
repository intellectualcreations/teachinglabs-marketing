'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest, PencilLine,
  Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, ChartBar, Bank, MapTrifold, Translate, ChatsCircle, Basketball,
  PersonSimpleRun, Books, MaskHappy, Heartbeat, Leaf, Robot,
  Ruler, Target, Lightbulb, Star, HouseLine, Check, CaretLeft, Copy,
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

interface DemoClass {
  name: string;
  subject: string;
  grade: string;
  count: number;
  code: string;
  iconIdx: number;
  desc: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

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

const DEMO_CLASSES: DemoClass[] = [
  { name: '5th Grade Math', subject: 'Math', grade: '5th', count: 14, code: 'TL-X7K2', iconIdx: 0, desc: '' },
  { name: 'Reading Circle', subject: 'English / Language Arts', grade: '4th', count: 10, code: 'TL-M3P9', iconIdx: 1, desc: 'Focused on comprehension and fluency.' },
  { name: 'Science Explorers', subject: 'Science', grade: '5th', count: 12, code: 'TL-Q8R4', iconIdx: 2, desc: '' },
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EditClassPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-text-secondary">Loading...</div>}>
      <EditClassPage />
    </Suspense>
  );
}

function EditClassPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classIndex = parseInt(searchParams.get('class') ?? '0', 10);
  const cls = DEMO_CLASSES[classIndex] ?? DEMO_CLASSES[0];

  // Form state — initialized from demo class
  const [className, setClassName] = useState(cls.name);
  const [subject, setSubject] = useState(cls.subject);
  const [grade, setGrade] = useState(cls.grade);
  const [desc, setDesc] = useState(cls.desc);
  const [selectedIconIdx, setSelectedIconIdx] = useState(cls.iconIdx);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  // Student selection — pre-select first N students
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (let i = 0; i < Math.min(cls.count, ALL_STUDENTS.length); i++) {
      s.add(ALL_STUDENTS[i].id);
    }
    return s;
  });

  // Reset when class index changes
  useEffect(() => {
    setClassName(cls.name);
    setSubject(cls.subject);
    setGrade(cls.grade);
    setDesc(cls.desc);
    setSelectedIconIdx(cls.iconIdx);
    const s = new Set<string>();
    for (let i = 0; i < Math.min(cls.count, ALL_STUDENTS.length); i++) {
      s.add(ALL_STUDENTS[i].id);
    }
    setSelected(s);
  }, [classIndex, cls]);

  function toggleStudent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function copyCode() {
    navigator.clipboard.writeText(cls.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveClass() {
    setSaved(true);
    setTimeout(() => {
      router.push('/teacher/my-classes');
    }, 800);
  }

  function deleteClass() {
    router.push('/teacher/my-classes');
  }

  const IconComp = ICON_OPTIONS[selectedIconIdx]?.icon ?? Star;
  const iconBg = ICON_OPTIONS[selectedIconIdx]?.bg ?? '#4FA3A5';

  return (
    <div className="max-w-[900px] w-full mx-auto py-8 px-6">

      {/* Back link */}
      <button
        onClick={() => router.push('/teacher/my-classes')}
        className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-navy
          transition-colors mb-6 cursor-pointer"
      >
        <CaretLeft size={14} /> Back to My Classes
      </button>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-heading text-[28px] font-bold text-text-primary mb-1.5">
          Edit: {cls.name}
        </h1>
        <p className="text-[15px] text-text-secondary">Update class details, change the icon, or manage students.</p>
      </div>

      {/* ── Class details card ── */}
      <div className="bg-card-bg border border-border rounded-2xl p-8 mb-6">
        <div className="font-heading font-semibold text-[17px] text-text-primary mb-1">Class details</div>
        <div className="text-[14px] text-text-secondary mb-5">Update your class name, subject, or icon.</div>

        {/* Icon picker */}
        <div className="mb-5">
          <label className="block text-[13px] font-semibold text-text-primary mb-2">Class icon</label>
          <div className="flex flex-wrap gap-2.5">
            {ICON_OPTIONS.map((opt, idx) => {
              const Ic = opt.icon;
              const isSel = idx === selectedIconIdx;
              return (
                <button
                  key={opt.val}
                  title={opt.label}
                  onClick={() => setSelectedIconIdx(idx)}
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

      {/* ── Join code card ── */}
      <div className="bg-card-bg border border-border rounded-2xl p-8 mb-6">
        <div className="font-heading font-semibold text-[17px] text-text-primary mb-1">Join code</div>
        <div className="text-[14px] text-text-secondary mb-5">Share this code with students so they can join this class.</div>

        <div className="flex items-center gap-4 px-5 py-4 bg-teal/[0.04] border border-teal/15 rounded-xl">
          <div>
            <div className="font-heading font-bold text-[22px] tracking-[3px] text-teal">{cls.code}</div>
            <div className="text-[13px] text-text-secondary mt-0.5">Class join code</div>
          </div>
          <button
            onClick={copyCode}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 border-[1.5px] border-border
              rounded-lg text-[12px] font-medium text-text-secondary hover:border-teal hover:text-teal
              transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} weight="bold" className="text-teal" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Students card ── */}
      <div className="bg-card-bg border border-border rounded-2xl p-8 mb-6">
        <div className="font-heading font-semibold text-[17px] text-text-primary mb-1">Students in this class</div>
        <div className="text-[14px] text-text-secondary mb-5">Manage which students are in this class.</div>

        <div className="border border-border rounded-lg max-h-[350px] overflow-y-auto">
          {ALL_STUDENTS.map((s, i) => {
            const isSelected = selected.has(s.id);
            const initials = s.first[0] + s.last[0];
            return (
              <div
                key={s.id}
                onClick={() => toggleStudent(s.id)}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                  ${i < ALL_STUDENTS.length - 1 ? 'border-b border-border' : ''}
                  ${isSelected ? 'bg-teal/[0.06]' : 'hover:bg-teal/[0.03]'}`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                    ${isSelected ? 'bg-teal border-teal' : 'border-border'}`}
                >
                  {isSelected && <Check size={12} weight="bold" color="white" />}
                </div>
                <div className="w-8 h-8 rounded-full bg-surface text-navy flex items-center justify-center
                  font-heading font-semibold text-[12px] shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[14px] text-text-primary">{s.first} {s.last}</div>
                  <div className="text-[12px] text-text-secondary font-heading">{s.id}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-navy/[0.08] text-[12px] font-semibold text-navy">
                  {s.grade}th
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-teal/[0.06] border border-teal/20
          rounded-lg mt-4 text-[14px]">
          <span>
            <span className="font-semibold text-teal">{selected.size}</span> students in class
          </span>
        </div>
      </div>

      {/* ── Actions bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/teacher/my-classes')}
            className="px-5 py-2.5 bg-transparent border-[1.5px] border-border rounded-lg text-[14px]
              font-medium text-text-secondary hover:border-navy hover:text-navy transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-transparent border-[1.5px] border-red-300 rounded-lg text-[13px]
              font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            Delete class
          </button>
        </div>
        <button
          onClick={saveClass}
          className="px-7 py-3 bg-navy text-white rounded-lg font-heading font-semibold text-[14px]
            hover:bg-navy/90 transition-colors cursor-pointer flex items-center gap-2"
        >
          {saved ? <><Check size={16} weight="bold" /> Saved!</> : 'Save changes'}
        </button>
      </div>

      {/* ── Delete confirm modal ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-card-bg border border-border rounded-2xl p-8 max-w-sm w-[90%] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading font-bold text-[18px] text-text-primary mb-2">Delete class?</h2>
            <p className="text-[14px] text-text-secondary mb-6">
              Delete &quot;{cls.name}&quot;? This cannot be undone. Students will lose access.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 border-[1.5px] border-border rounded-lg text-[13px] font-semibold
                  text-text-primary hover:border-teal transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={deleteClass}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-[13px] font-bold
                  hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
