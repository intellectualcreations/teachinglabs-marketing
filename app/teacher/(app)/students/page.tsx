'use client';

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MagnifyingGlass, Plus, DotsThree, Users, FunnelSimple,
  ArrowsDownUp, Export, Robot, UserPlus, X, CheckCircle, CaretDown, Flag,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Class } from '@/lib/supabase/types';

/* ─── Types ─── */
type SortOption = 'first-az' | 'first-za' | 'last-az' | 'last-za' | 'enrollment';
type NameFormat = 'first-last' | 'last-first';

interface StudentRow {
  id: string;
  displayName: string;
  first: string;
  last: string;
  email: string;
  classNames: string[];
  classIds: string[];
  enrolledAt: string;
  baselineDate: string | null;
  preferredName: string | null;
  nameFlagged: boolean;
  superheroName: string | null;
  superpowerAvatar: string | null;
  learningStyle: string | null;
  baselineLevel: 'Emerging' | 'Developing' | 'Proficient' | 'Advanced' | 'Exemplary' | null;
  color: string;
  studentNumber: string | null;
}

const AVATAR_COLORS = [
  '#1F3A5F', '#4FA3A5', '#E8836B', '#F59E0B', '#8B5CF6',
  '#059669', '#3B82F6', '#DC2626', '#6366F1', '#0891B2',
];

const SORT_LABELS: Record<SortOption, string> = {
  'first-az': 'First Name A–Z',
  'first-za': 'First Name Z–A',
  'last-az': 'Last Name A–Z',
  'last-za': 'Last Name Z–A',
  enrollment: 'Enrollment Date',
};

function getInitials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

/* ─── Main Content ─── */

function StudentsContent() {
  const searchParams = useSearchParams();
  const classParam = searchParams.get('class');

  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>(classParam ?? 'all');
  const [sort, setSort] = useState<SortOption>('first-az');
  const [nameFormat, setNameFormat] = useState<NameFormat>('first-last');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [flagTarget, setFlagTarget] = useState<StudentRow | null>(null);
  const [flagSaving, setFlagSaving] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/login'; return; setLoading(false); return; }

        // Fetch all student data via admin API route (bypasses RLS)
        const res = await fetch(`/api/teacher/students?teacherId=${user.id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load students');
        }
        const data = await res.json();

        const teacherClasses = (data.classes ?? []) as Class[];
        setClasses(teacherClasses);

        const enrollments = (data.enrollments ?? []) as Array<{ student_id: string; class_id: string; enrolled_at: string; status: string }>;
        const studentProfilesList = (data.students ?? []) as Profile[];
        const assessmentsList = (data.assessments ?? []) as Array<{ student_id: string; completed_at: string }>;

        if (teacherClasses.length === 0 || enrollments.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }

        const profileMap = new Map<string, Profile>();
        studentProfilesList.forEach((p) => profileMap.set(p.id, p));

        const classNameMap = new Map<string, string>();
        teacherClasses.forEach((c) => classNameMap.set(c.id, c.name));

        const assessmentMap = new Map<string, string>();
        const preferredNameMap = new Map<string, string>();
        assessmentsList.forEach((a: { student_id: string; completed_at: string; preferred_name?: string }) => {
          assessmentMap.set(a.student_id, a.completed_at);
          if (a.preferred_name) preferredNameMap.set(a.student_id, a.preferred_name);
        });

        // Group enrollments by student (dedup across classes)
        const studentMap = new Map<string, StudentRow>();
        enrollments.forEach((e, i) => {
          const existing = studentMap.get(e.student_id);
          const className = classNameMap.get(e.class_id) ?? 'Unknown';
          if (existing) {
            if (!existing.classIds.includes(e.class_id)) {
              existing.classIds.push(e.class_id);
              existing.classNames.push(className);
            }
          } else {
            const p = profileMap.get(e.student_id) as any;
            const displayName = p?.display_name ?? 'Unknown Student';
            const first = p?.first_name || displayName.split(' ')[0] || '';
            const last = p?.last_name || displayName.split(' ').slice(1).join(' ') || '';
            studentMap.set(e.student_id, {
              id: e.student_id,
              displayName,
              first,
              last,
              email: p?.email || '',
              classNames: [className],
              classIds: [e.class_id],
              enrolledAt: p?.enrolled_at || e.enrolled_at,
              baselineDate: p?.baseline_assessment_at || assessmentMap.get(e.student_id) || null,
              preferredName: p?.preferred_name || preferredNameMap.get(e.student_id) || null,
              nameFlagged: !!p?.name_flagged,
              superheroName: p?.superpower_title || null,
              superpowerAvatar: p?.superpower_avatar || null,
              learningStyle: p?.primary_intelligence || null,
              baselineLevel: p?.baseline_level || null,
              color: AVATAR_COLORS[i % AVATAR_COLORS.length],
              studentNumber: null,
            });
          }
        });

        setStudents(Array.from(studentMap.values()));
      } catch (err) {
        console.error('Students fetch error:', err);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Set classFilter from URL param once classes load
  useEffect(() => {
    if (classParam && classes.length > 0) {
      const found = classes.find((c) => c.id === classParam);
      if (found) setClassFilter(found.id);
    }
  }, [classParam, classes]);

  // Filtered + sorted students
  const filtered = useMemo(() => {
    let list = students.filter((s) => {
      if (classFilter !== 'all' && !s.classIds.includes(classFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = `${s.first} ${s.last}`.toLowerCase();
        if (!name.includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    list = [...list];
    switch (sort) {
      case 'first-az':
        list.sort((a, b) => a.first.localeCompare(b.first) || a.last.localeCompare(b.last));
        break;
      case 'first-za':
        list.sort((a, b) => b.first.localeCompare(a.first) || b.last.localeCompare(a.last));
        break;
      case 'last-az':
        list.sort((a, b) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first));
        break;
      case 'last-za':
        list.sort((a, b) => b.last.localeCompare(a.last) || b.first.localeCompare(a.first));
        break;
      case 'enrollment':
        list.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
        break;
    }
    return list;
  }, [students, classFilter, search, sort]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  }, [filtered, selectedIds.size]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary text-sm">Loading students...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  const filterClassName = classFilter !== 'all' ? (classes.find((c) => c.id === classFilter)?.name ?? null) : null;
  const title = filterClassName ? `Manage Students — ${filterClassName}` : 'Manage Students';

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-[26px] font-bold text-text-primary">{title}</h1>
          <p className="text-text-secondary text-[15px] mt-1">
            {filtered.length} of {students.length} students
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Export coming soon')}
            className="flex items-center gap-2 px-4 py-2.5 border-[1.5px] border-border rounded-lg text-sm font-medium text-text-secondary hover:border-navy hover:text-navy transition-all cursor-pointer"
          >
            <Export size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card-bg border border-border rounded-[14px] p-7 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-navy" />

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-[38px] pr-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm bg-card-bg text-text-primary outline-none focus:border-navy"
            />
          </div>

          {/* Name format toggle */}
          <button
            onClick={() => setNameFormat(nameFormat === 'first-last' ? 'last-first' : 'first-last')}
            className="flex items-center gap-2 px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-secondary hover:border-navy cursor-pointer"
            title={nameFormat === 'first-last' ? 'Switch to Last, First' : 'Switch to First Last'}
          >
            {nameFormat === 'first-last' ? 'First Last' : 'Last, First'}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-secondary hover:border-navy cursor-pointer"
            >
              <ArrowsDownUp size={16} />
              {SORT_LABELS[sort]}
              <CaretDown size={12} />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full mt-1 right-0 bg-card-bg border border-border rounded-lg shadow-lg z-20 min-w-[160px]">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setSort(key); setShowSortDropdown(false); }}
                    className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-navy/5 cursor-pointer ${sort === key ? 'text-navy font-semibold' : 'text-text-primary'}`}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Class filter pills */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setClassFilter('all')}
            className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium cursor-pointer transition-all
              ${classFilter === 'all' ? 'bg-navy border-navy text-white' : 'border-border text-text-secondary hover:border-navy hover:text-navy'}`}
          >
            All Classes
          </button>
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setClassFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium cursor-pointer transition-all
                ${classFilter === c.id ? 'bg-navy border-navy text-white' : 'border-border text-text-secondary hover:border-navy hover:text-navy'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Table */}
        {students.length === 0 ? (
          <div className="text-center py-16 px-5">
            <div className="text-[40px] mb-3">👋</div>
            <h3 className="font-heading font-bold text-[15px] text-text-primary">No students enrolled yet</h3>
            <p className="text-text-secondary text-sm mt-1">Share your class code with students to get started.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 px-5">
            <div className="text-[32px] mb-2">🔍</div>
            <h3 className="font-heading font-bold text-[15px] text-text-primary">No students match your filters</h3>
            <p className="text-text-secondary text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border accent-teal cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">First Name</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Last Name</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Email</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Preferred Name</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Superhero Name</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Learning Style</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Enrolled</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Last Baseline</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Level</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-teal/[0.03]">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(s.id)}
                        onChange={() => toggleSelect(s.id)}
                        className="w-4 h-4 rounded border-border accent-teal cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <a href={`/teacher/student-detail?student=${s.id}`} className="flex items-center gap-2 no-underline cursor-pointer hover:opacity-80">
                        {s.superpowerAvatar ? (
                          <img src={s.superpowerAvatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: s.color }}>
                            {getInitials(s.first, s.last)}
                          </div>
                        )}
                        <span className="font-semibold text-sm text-text-primary">{s.first}</span>
                      </a>
                    </td>
                    <td className="px-3 py-3 text-sm text-text-primary">{s.last || <span className="text-text-muted">—</span>}</td>
                    <td className="px-3 py-3 text-[12px] text-text-secondary">{s.email || <span className="text-text-muted">—</span>}</td>
                    <td className="px-3 py-3 text-sm">
                      {s.preferredName
                        ? (
                          <span
                            className={s.nameFlagged ? 'text-amber-700 font-semibold bg-amber-100 px-1.5 py-0.5 rounded' : 'text-text-secondary'}
                            title={s.nameFlagged ? 'AI flagged this preferred name as borderline — review in the row menu.' : ''}
                          >
                            {s.preferredName}
                          </span>
                        )
                        : <span className="text-text-muted">—</span>
                      }
                    </td>
                    <td className="px-3 py-3 text-sm text-text-secondary">{s.superheroName || <span className="text-text-muted">—</span>}</td>
                    <td className="px-3 py-3 text-sm text-text-secondary">{s.learningStyle || <span className="text-text-muted">—</span>}</td>
                    <td className="px-3 py-3 text-sm text-text-secondary">
                      {new Date(s.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3 text-sm text-text-secondary">
                      {s.baselineDate
                        ? new Date(s.baselineDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : <span className="text-text-muted">—</span>
                      }
                    </td>
                    <td className="px-3 py-3">
                      {s.baselineLevel ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                          s.baselineLevel === 'Exemplary'  ? 'bg-purple-100 text-purple-800' :
                          s.baselineLevel === 'Advanced'   ? 'bg-emerald-100 text-emerald-800' :
                          s.baselineLevel === 'Proficient' ? 'bg-blue-100 text-blue-800' :
                          s.baselineLevel === 'Developing' ? 'bg-amber-100 text-amber-800' :
                          s.baselineLevel === 'Emerging'   ? 'bg-slate-100 text-slate-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>{s.baselineLevel}</span>
                      ) : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-3 py-3 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenActionMenu(openActionMenu === s.id ? null : s.id); }}
                        className="p-1 rounded hover:bg-navy/5 cursor-pointer"
                      >
                        <DotsThree size={20} weight="bold" className="text-text-secondary" />
                      </button>
                      {openActionMenu === s.id && (
                        <div className="absolute right-0 top-full mt-1 border border-border rounded-lg shadow-xl z-40 min-w-[240px] overflow-hidden bg-white dark:bg-[#0e1a35]">
                          <button
                            onClick={() => { window.location.href = `/teacher/student-detail?student=${s.id}`; setOpenActionMenu(null); }}
                            className="block w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-navy/5 cursor-pointer"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => { setFlagTarget(s); setFlagError(null); setOpenActionMenu(null); }}
                            className="block w-full text-left px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 cursor-pointer"
                          >
                            Request preferred name change
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy border-t border-border px-6 py-3.5 flex items-center justify-between">
          <span className="text-white text-sm font-medium">{selectedIds.size} student{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-lg cursor-pointer transition-all"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Close dropdowns on outside click */}
      {(openActionMenu || showSortDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setOpenActionMenu(null); setShowSortDropdown(false); }}
        />
      )}

      {/* Flag Name Modal */}
      {flagTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setFlagTarget(null)}>
          <div className="bg-card-bg border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-heading font-bold text-base text-text-primary">Request Preferred Name Change</h3>
              <button onClick={() => setFlagTarget(null)} className="text-text-muted hover:text-text-primary cursor-pointer"><X size={18} /></button>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              This will reset <span className="font-semibold text-text-primary">{flagTarget.first} {flagTarget.last}</span>&apos;s preferred name to <span className="font-semibold text-text-primary">{flagTarget.first}</span> and ask them to choose a new one at their next login.
            </p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">The student will see:</p>
              <p className="text-xs text-amber-900 italic">&ldquo;Your teacher asked you to choose a different preferred name. Please pick one that works well in class.&rdquo;</p>
            </div>
            {flagError && <p className="text-xs text-red-600 mb-3">{flagError}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setFlagTarget(null)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-border/10 cursor-pointer">Cancel</button>
              <button
                disabled={flagSaving}
                onClick={async () => {
                  if (!flagTarget) return;
                  setFlagSaving(true);
                  setFlagError(null);
                  try {
                    const supabase = createClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) { setFlagError('Not signed in'); setFlagSaving(false); return; }
                    const res = await fetch('/api/teacher/student-detail', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ studentId: flagTarget.id, teacherId: user.id, preferred_name: flagTarget.first, flagged: true }),
                    });
                    if (res.ok) {
                      setStudents((prev) => prev.map((x) => x.id === flagTarget.id ? { ...x, preferredName: flagTarget.first, nameFlagged: true } : x));
                      setFlagTarget(null);
                    } else {
                      const d = await res.json().catch(() => ({}));
                      setFlagError(d.error || 'Failed to flag name');
                    }
                  } catch {
                    setFlagError('Failed to flag name');
                  } finally {
                    setFlagSaving(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors border-0 cursor-pointer disabled:opacity-50"
              >{flagSaving ? 'Requesting...' : 'Request Change'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page Export ─── */

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-secondary">Loading...</div>}>
      <StudentsContent />
    </Suspense>
  );
}
