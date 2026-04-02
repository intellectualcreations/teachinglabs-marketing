'use client';

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MagnifyingGlass, Plus, DotsThree, Users, FunnelSimple,
  ArrowsDownUp, Export, Robot, UserPlus, X, CheckCircle, CaretDown,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Class } from '@/lib/supabase/types';

/* ─── Types ─── */
type SortOption = 'name-az' | 'name-za' | 'enrollment';

interface StudentRow {
  id: string;
  displayName: string;
  first: string;
  last: string;
  classNames: string[];
  enrolledAt: string;
  color: string;
  studentNumber: string | null;
}

const AVATAR_COLORS = [
  '#1F3A5F', '#4FA3A5', '#E8836B', '#F59E0B', '#8B5CF6',
  '#059669', '#3B82F6', '#DC2626', '#6366F1', '#0891B2',
];

const SORT_LABELS: Record<SortOption, string> = {
  'name-az': 'Name A-Z',
  'name-za': 'Name Z-A',
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
  const [sort, setSort] = useState<SortOption>('name-az');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('Not authenticated'); setLoading(false); return; }

        // Fetch teacher's classes
        const { data: classData } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });
        const teacherClasses = (classData ?? []) as Class[];
        setClasses(teacherClasses);

        if (teacherClasses.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }

        const classIds = teacherClasses.map((c) => c.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: enrollmentData } = await (supabase
          .from('enrollments')
          .select('student_id, class_id, enrolled_at, status') as any)
          .in('class_id', classIds)
          .eq('status', 'active');

        const enrollments = (enrollmentData ?? []) as Array<{ student_id: string; class_id: string; enrolled_at: string; status: string }>;
        if (enrollments.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }

        const studentIds = [...new Set(enrollments.map((e) => e.student_id))];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: studentProfiles } = await (supabase
          .from('profiles')
          .select('*') as any)
          .in('id', studentIds);

        const profileMap = new Map<string, Profile>();
        ((studentProfiles ?? []) as Profile[]).forEach((p) => profileMap.set(p.id, p));

        const classNameMap = new Map<string, string>();
        teacherClasses.forEach((c) => classNameMap.set(c.id, c.name));

        // Group enrollments by student (dedup across classes)
        const studentMap = new Map<string, StudentRow>();
        enrollments.forEach((e, i) => {
          const existing = studentMap.get(e.student_id);
          const className = classNameMap.get(e.class_id) ?? 'Unknown';
          if (existing) {
            if (!existing.classNames.includes(className)) {
              existing.classNames.push(className);
            }
          } else {
            const p = profileMap.get(e.student_id);
            const displayName = p?.display_name ?? 'Unknown Student';
            const parts = displayName.split(' ');
            studentMap.set(e.student_id, {
              id: e.student_id,
              displayName,
              first: parts[0] ?? '',
              last: parts.slice(1).join(' ') || '',
              classNames: [className],
              enrolledAt: e.enrolled_at,
              color: AVATAR_COLORS[i % AVATAR_COLORS.length],
              studentNumber: null, // No student_number column yet
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

  const filterClassName = useMemo(() => {
    if (classFilter === 'all') return null;
    return classes.find((c) => c.id === classFilter)?.name ?? null;
  }, [classFilter, classes]);

  // Filtered + sorted students
  const filtered = useMemo(() => {
    let list = students.filter((s) => {
      if (filterClassName && !s.classNames.includes(filterClassName)) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = `${s.first} ${s.last}`.toLowerCase();
        if (!name.includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    list = [...list];
    switch (sort) {
      case 'name-az':
        list.sort((a, b) => `${a.last} ${a.first}`.localeCompare(`${b.last} ${b.first}`));
        break;
      case 'name-za':
        list.sort((a, b) => `${b.last} ${b.first}`.localeCompare(`${a.last} ${a.first}`));
        break;
      case 'enrollment':
        list.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
        break;
    }
    return list;
  }, [students, filterClassName, search, sort]);

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
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Student</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Classes</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Enrolled</th>
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
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: s.color }}
                        >
                          {getInitials(s.first, s.last)}
                        </div>
                        <span className="font-semibold text-sm text-text-primary">{s.first} {s.last}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.classNames.map((cn) => (
                          <span key={cn} className="px-2 py-0.5 rounded-full bg-teal/10 text-[11px] font-medium text-teal whitespace-nowrap">
                            {cn}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-text-secondary">
                      {new Date(s.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenActionMenu(openActionMenu === s.id ? null : s.id); }}
                        className="p-1 rounded hover:bg-navy/5 cursor-pointer"
                      >
                        <DotsThree size={20} weight="bold" className="text-text-secondary" />
                      </button>
                      {openActionMenu === s.id && (
                        <div className="absolute right-0 top-full mt-1 bg-card-bg border border-border rounded-lg shadow-lg z-30 min-w-[170px]">
                          <button
                            onClick={() => { window.location.href = `/teacher/student-detail?student=${s.id}`; setOpenActionMenu(null); }}
                            className="block w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-navy/5 cursor-pointer"
                          >
                            View Profile
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
