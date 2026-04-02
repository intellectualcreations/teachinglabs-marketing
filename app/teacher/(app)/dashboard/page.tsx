'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ChartBar, Funnel, MagnifyingGlass, WarningCircle,
  ClipboardText, Fire, ChatText,
} from '@phosphor-icons/react';
import BarChart from '@/components/shared/BarChart';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Class } from '@/lib/supabase/types';

/* ── Types for enrolled student data ── */
interface EnrolledStudent {
  id: string;
  first: string;
  last: string;
  classNames: string[];
  enrolledAt: string;
  color: string;
}

const AVATAR_COLORS = [
  '#1F3A5F', '#4FA3A5', '#E8836B', '#F59E0B', '#8B5CF6',
  '#059669', '#3B82F6', '#DC2626', '#6366F1', '#0891B2',
];

const ACTIVITY_HOURS = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm'];

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [classFilter, setClassFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCount, setShowCount] = useState(12);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Redirect to login if not authenticated
          window.location.href = '/login';
          return;
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData as Profile | null);

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

        // Fetch enrollments with student profiles for all teacher classes
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

        // Get unique student IDs and fetch their profiles
        const studentIds = [...new Set(enrollments.map((e) => e.student_id))];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: studentProfiles } = await (supabase
          .from('profiles')
          .select('*') as any)
          .in('id', studentIds);

        const profileMap = new Map<string, Profile>();
        ((studentProfiles ?? []) as Profile[]).forEach((p) => profileMap.set(p.id, p));

        // Build class name lookup
        const classNameMap = new Map<string, string>();
        teacherClasses.forEach((c) => classNameMap.set(c.id, c.name));

        // Group enrollments by student
        const studentMap = new Map<string, EnrolledStudent>();
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
              first: parts[0] ?? '',
              last: parts.slice(1).join(' ') || '',
              classNames: [className],
              enrolledAt: e.enrolled_at,
              color: AVATAR_COLORS[i % AVATAR_COLORS.length],
            });
          }
        });

        setStudents(Array.from(studentMap.values()));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (classFilter !== 'all' && !s.classNames.includes(classFilter)) return false;
      if (search) {
        const name = `${s.first} ${s.last}`.toLowerCase();
        if (!name.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [students, classFilter, search]);

  const showing = filtered.slice(0, showCount);

  // Derive teacher display name
  const teacherFirstName = profile?.display_name?.split(' ')[0] || profile?.first_name || 'Teacher';
  const initials = profile?.display_name
    ? profile.display_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'T';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary text-sm">Loading dashboard...</div>
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-text-primary">
            Hi {teacherFirstName} 👋
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Here&apos;s how your students are doing today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-heading font-bold text-sm">
            {initials}
          </div>
        </div>
      </div>

      {/* Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5 mb-6">
        {/* Class Overview card */}
        <div className="bg-card-bg border border-border rounded-[20px] p-6">
          <h2 className="font-heading text-[13px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-4 flex items-center gap-2">
            <ChartBar size={16} weight="fill" className="text-teal" />
            Class Overview
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatBox value={students.length} label="Students Enrolled" />
            <StatBox value={students.length} label="Active This Week">
              <span className="text-xs font-semibold text-success">
                {students.length > 0 ? '100%' : '0%'}
              </span>
            </StatBox>
            <StatBox value={0} label="Needs Attention" />
            <StatBox value={classes.length} label="Active Classes" />
          </div>
        </div>

        {/* Activity card */}
        <div className="bg-card-bg border border-border rounded-[20px] p-6">
          <h2 className="font-heading text-[13px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-4 flex items-center gap-2">
            <Fire size={16} weight="fill" className="text-coral" />
            Activity
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-[18px]">
            <StatBox value={0} label="Total Interactions" />
            <StatBox value={0} label="Chat Sessions" />
          </div>
          <div className="py-1">
            <div className="text-xs text-text-secondary mb-[10px]">Activity by hour (today)</div>
            <BarChart labels={ACTIVITY_HOURS} values={[0, 0, 0, 0, 0, 0, 0, 0]} />
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3.5 py-2 border-[1.5px] border-border rounded-lg text-[13px] font-heading font-medium
            bg-surface text-text-primary cursor-pointer focus:border-navy outline-none"
        >
          <option value="all">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <input
          type="date"
          className="px-3 py-2 border-[1.5px] border-border rounded-lg text-[13px] font-heading
            bg-surface text-text-primary outline-none focus:border-navy"
        />
        <span className="text-text-secondary text-[13px]">to</span>
        <input
          type="date"
          className="px-3 py-2 border-[1.5px] border-border rounded-lg text-[13px] font-heading
            bg-surface text-text-primary outline-none focus:border-navy"
        />

        <button
          onClick={() => setShowCount(12)}
          className="px-4 py-2 bg-navy text-white rounded-lg text-[13px] font-heading font-semibold
            flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer"
        >
          <Funnel size={14} weight="fill" /> Apply Filters
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="relative ml-auto">
          <MagnifyingGlass size={16} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowCount(12); }}
            className="pl-9 pr-3.5 py-2 border-[1.5px] border-border rounded-lg text-[13px]
              bg-surface text-text-primary outline-none w-[220px] focus:border-navy"
          />
        </div>
      </div>

      {/* Student Grid */}
      {students.length === 0 ? (
        <div className="text-center py-16 px-5 bg-card-bg border-2 border-dashed border-border rounded-[20px] mt-4">
          <div className="text-[40px] mb-3">👋</div>
          <h3 className="font-heading font-bold text-base text-text-primary mb-1.5">
            No students have joined yet
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Share your class code to get started! Students can join by entering the code on their device.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-text-secondary">
          No students match your filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {showing.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </div>
          {filtered.length > showCount && (
            <button
              onClick={() => setShowCount((c) => c + 12)}
              className="block max-w-xs mx-auto mt-7 px-6 py-3 rounded-[10px] bg-navy text-white
                font-heading font-bold text-sm hover:bg-[#162D48] transition-colors cursor-pointer"
            >
              ▶ Load More Students ({filtered.length} total)
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ── StatBox ── */
function StatBox({
  value,
  label,
  children,
}: {
  value: number | string;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-[10px] py-3.5 px-4">
      <div className="font-heading text-[26px] font-extrabold text-text-primary leading-tight">{value}</div>
      <div className="text-xs text-text-secondary mt-0.5">{label}</div>
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}

/* ── StudentCard ── */
function StudentCard({ student: s }: { student: EnrolledStudent }) {
  const initials = (s.first[0] ?? '') + (s.last[0] ?? '');
  const classLabel = s.classNames[0] || 'Unassigned';

  return (
    <div
      className="bg-card-bg border border-border rounded-[20px] p-5 cursor-pointer
        transition-all hover:shadow-md hover:-translate-y-0.5 relative"
      onClick={() => window.location.href = `/teacher/student-detail?student=${s.id}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm text-white shrink-0"
          style={{ backgroundColor: s.color }}
        >
          {initials}
        </div>
        <div>
          <div className="font-heading font-bold text-sm text-text-primary">
            {s.last}{s.last ? ', ' : ''}{s.first}
          </div>
          <div className="text-xs text-text-secondary mt-px">
            {classLabel}
            {s.classNames.length > 1 && ` +${s.classNames.length - 1} more`}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <ClipboardText size={12} weight="fill" /> Classes
          </div>
          <div className="text-[13px] font-semibold text-text-primary">{s.classNames.length}</div>
        </div>
        <div>
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <ChatText size={12} weight="fill" /> Enrolled
          </div>
          <div className="text-[13px] font-semibold text-text-primary">
            {new Date(s.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}
