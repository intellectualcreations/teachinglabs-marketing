'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest, PencilLine,
  Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, ChartBar, Bank, MapTrifold, Translate, ChatsCircle, Basketball,
  PersonSimpleRun, Books, MaskHappy, Heartbeat, Leaf, Robot,
  Ruler, Target, Lightbulb, Star, HouseLine, Check, CaretLeft, Copy,
} from '@phosphor-icons/react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrolledStudent {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  enrolled_at: string;
}

interface ClassRecord {
  id: string;
  name: string;
  subject: string | null;
  grade_level: string | null;
  teacher_id: string;
  school_id: string | null;
  join_code: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

interface IconOption {
  icon: React.ComponentType<any>;
  bg: string;
  label: string;
  val: string;
}

// ─── Icon Options ─────────────────────────────────────────────────────────────

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
  const classId = searchParams.get('class') ?? '';

  // Loading / error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classRecord, setClassRecord] = useState<ClassRecord | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);

  // Form state
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedIconIdx, setSelectedIconIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load class data from API
  const loadClassData = useCallback(async () => {
    if (!classId) {
      setError('No class ID provided');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/teacher/class-details?classId=${classId}`);
      if (!res.ok) {
        setError('Class not found');
        setLoading(false);
        return;
      }

      const data = await res.json();
      const cls: ClassRecord = data.class;
      setClassRecord(cls);
      setStudents(data.students ?? []);

      // Populate form state from loaded class
      setClassName(cls.name);
      setSubject(cls.subject ?? '');
      setGrade(cls.grade_level ?? '');
      setDesc(cls.description ?? '');

      // Find matching icon index by val
      const iconIdx = ICON_OPTIONS.findIndex((opt) => opt.val === cls.icon);
      setSelectedIconIdx(iconIdx >= 0 ? iconIdx : 0);

      setLoading(false);
    } catch {
      setError('Failed to load class data');
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadClassData();
  }, [loadClassData]);

  function copyCode() {
    if (!classRecord) return;
    navigator.clipboard.writeText(classRecord.join_code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveClass() {
    if (saving) return;
    setSaving(true);

    try {
      const res = await fetch('/api/teacher/edit-class', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          name: className,
          subject,
          grade_level: grade,
          description: desc,
          icon: ICON_OPTIONS[selectedIconIdx]?.val ?? 'star',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Save failed:', errData.error);
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(() => {
        router.push('/teacher/my-classes');
      }, 800);
    } catch (err) {
      console.error('Save error:', err);
      setSaving(false);
    }
  }

  async function deleteClass() {
    if (deleting) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/teacher/edit-class?classId=${classId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Delete failed:', errData.error);
        setDeleting(false);
        return;
      }

      router.push('/teacher/my-classes');
    } catch (err) {
      console.error('Delete error:', err);
      setDeleting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-[900px] w-full mx-auto py-8 px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-border rounded" />
          <div className="h-8 w-64 bg-border rounded" />
          <div className="h-4 w-96 bg-border rounded" />
          <div className="h-48 bg-border rounded-2xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !classRecord) {
    return (
      <div className="max-w-[900px] w-full mx-auto py-8 px-6">
        <button
          onClick={() => router.push('/teacher/my-classes')}
          className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-navy
            transition-colors mb-6 cursor-pointer"
        >
          <CaretLeft size={14} /> Back to My Classes
        </button>
        <div className="bg-card-bg border border-border rounded-2xl p-8 text-center">
          <p className="text-text-secondary text-[15px]">{error ?? 'Class not found'}</p>
        </div>
      </div>
    );
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
          Edit: {classRecord.name}
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
            <div className="font-heading font-bold text-[22px] tracking-[3px] text-teal">{classRecord.join_code}</div>
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
        <div className="text-[14px] text-text-secondary mb-5">Students currently enrolled in this class.</div>

        {students.length === 0 ? (
          <div className="border border-border rounded-lg px-4 py-8 text-center">
            <p className="text-[14px] text-text-secondary">No students enrolled yet. Share the join code above to invite students.</p>
          </div>
        ) : (
          <div className="border border-border rounded-lg max-h-[350px] overflow-y-auto">
            {students.map((s, i) => {
              const name = s.display_name ?? 'Unknown Student';
              const parts = name.split(' ');
              const initials = parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : name.slice(0, 2).toUpperCase();
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors
                    ${i < students.length - 1 ? 'border-b border-border' : ''}
                    bg-teal/[0.06]`}
                >
                  <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                    bg-teal border-teal">
                    <Check size={12} weight="bold" color="white" />
                  </div>
                  {s.avatar_url ? (
                    <img
                      src={s.avatar_url}
                      alt={name}
                      className="w-8 h-8 rounded-full shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface text-navy flex items-center justify-center
                      font-heading font-semibold text-[12px] shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-[14px] text-text-primary">{name}</div>
                    <div className="text-[12px] text-text-secondary font-heading">
                      Enrolled {new Date(s.enrolled_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 bg-teal/[0.06] border border-teal/20
          rounded-lg mt-4 text-[14px]">
          <span>
            <span className="font-semibold text-teal">{students.length}</span> student{students.length !== 1 ? 's' : ''} enrolled
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
          disabled={saving || saved}
          className="px-7 py-3 bg-navy text-white rounded-lg font-heading font-semibold text-[14px]
            hover:bg-navy/90 transition-colors cursor-pointer flex items-center gap-2
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saved ? <><Check size={16} weight="bold" /> Saved!</> : saving ? 'Saving...' : 'Save changes'}
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
              Delete &quot;{classRecord.name}&quot;? This cannot be undone. Students will lose access.
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
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-[13px] font-bold
                  hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
