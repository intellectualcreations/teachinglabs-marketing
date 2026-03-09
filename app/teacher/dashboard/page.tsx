'use client';

import { useState, useMemo } from 'react';
import {
  ChartBar, Funnel, MagnifyingGlass, WarningCircle,
  ClipboardText, Fire, ChatText,
} from '@phosphor-icons/react';
import BarChart from '@/components/shared/BarChart';
import {
  getDemoStudents, DEMO_CLASSES, ACTIVITY_HOURS, ACTIVITY_VALUES,
  STATUS_LABELS, type DemoStudent,
} from '@/lib/demo-data';

type StatusFilter = 'all' | 'attention' | 'on-track' | 'excelling';

export default function DashboardPage() {
  const students = useMemo(() => getDemoStudents(), []);
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [showCount, setShowCount] = useState(12);

  // Computed
  const totalInteractions = ACTIVITY_VALUES.reduce((a, b) => a + b, 0);
  const chatSessions = Math.round(totalInteractions * 0.36);
  const activeThisWeek = Math.round(students.length * 0.93);
  const activePercent = Math.round((activeThisWeek / students.length) * 100);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (classFilter !== 'all' && !s.classNames.includes(classFilter)) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (search) {
        const name = `${s.first} ${s.last}`.toLowerCase();
        if (!name.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [students, classFilter, statusFilter, search]);

  const counts = useMemo(() => {
    const base = classFilter === 'all'
      ? students
      : students.filter((s) => s.classNames.includes(classFilter));
    return {
      all: base.length,
      attention: base.filter((s) => s.status === 'attention').length,
      'on-track': base.filter((s) => s.status === 'on-track').length,
      excelling: base.filter((s) => s.status === 'excelling').length,
    };
  }, [students, classFilter]);

  const attentionCount = counts.attention;
  const showing = filtered.slice(0, showCount);

  return (
    <div>
      {/* Header — mb matches HTML .dash-topbar margin-bottom: 32px */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-text-primary">
            Hi Ms. Harper 👋
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Here&apos;s how your students are doing today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-heading font-bold text-sm">
            MH
          </div>
        </div>
      </div>

      {/* Overview Row — gap:20px, mb:24px, grid 1fr 1.4fr */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5 mb-6">
        {/* Class Overview card — border-radius: 20px (HTML --radius-lg from shared.css) */}
        <div className="bg-card-bg border border-border rounded-[20px] p-6">
          {/* Overview title: 13px, 700, uppercase, letter-spacing 0.5px */}
          <h2 className="font-heading text-[13px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-4 flex items-center gap-2">
            <ChartBar size={16} weight="fill" className="text-teal" />
            Class Overview
          </h2>
          {/* stat-grid: 2-col, gap 12px */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox value={students.length} label="Students Enrolled" />
            <StatBox value={activeThisWeek} label="Active This Week">
              <span className="text-xs font-semibold text-success">{activePercent}%</span>
            </StatBox>
            <StatBox value={attentionCount} label="Needs Attention">
              {attentionCount > 0 && (
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-warning/10 text-warning">
                  ⚠ Review
                </span>
              )}
            </StatBox>
            <StatBox value={DEMO_CLASSES.length} label="Active Activities" />
          </div>
        </div>

        {/* Activity card — border-radius: 20px */}
        <div className="bg-card-bg border border-border rounded-[20px] p-6">
          <h2 className="font-heading text-[13px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-4 flex items-center gap-2">
            <Fire size={16} weight="fill" className="text-coral" />
            Activity
          </h2>
          {/* activity-stats: 2-col, gap 12px, mb 18px */}
          <div className="grid grid-cols-2 gap-3 mb-[18px]">
            <StatBox value={totalInteractions} label="Total Interactions">
              <span className="text-xs font-semibold text-success">↑ 23%</span>
            </StatBox>
            <StatBox value={chatSessions} label="Chat Sessions">
              <span className="text-xs font-semibold text-success">↑ 18%</span>
            </StatBox>
          </div>
          {/* chart-area: padding 4px 0 */}
          <div className="py-1">
            {/* chart-label: 12px, color gray, mb 10px */}
            <div className="text-xs text-text-secondary mb-[10px]">Activity by hour (today)</div>
            <BarChart labels={ACTIVITY_HOURS} values={ACTIVITY_VALUES} />
          </div>
        </div>
      </div>

      {/* Filters row — gap 12px, mb 20px */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3.5 py-2 border-[1.5px] border-border rounded-lg text-[13px] font-heading font-medium
            bg-surface text-text-primary cursor-pointer focus:border-navy outline-none"
        >
          <option value="all">All Classes</option>
          {DEMO_CLASSES.map((c) => (
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

      {/* Status Pills + Search — mb 16px */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'attention', 'on-track', 'excelling'] as StatusFilter[]).map((f) => {
            const isActive = statusFilter === f;
            const labels: Record<string, string> = {
              all: 'All',
              attention: '⚠ Needs Attention',
              'on-track': '📘 On Track',
              excelling: '⭐ Excelling',
            };
            const activeColors: Record<string, string> = {
              all: 'bg-navy border-navy',
              attention: 'bg-warning border-warning',
              'on-track': 'bg-teal border-teal',
              excelling: 'bg-success border-success',
            };

            return (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setShowCount(12); }}
                className={`px-4 py-[7px] rounded-full border-[1.5px] text-[13px] font-semibold font-heading
                  transition-all cursor-pointer ${
                    isActive
                      ? `${activeColors[f]} text-white`
                      : 'border-border text-text-secondary hover:border-navy hover:text-navy'
                  }`}
              >
                {labels[f]} <span className="font-normal opacity-70">({counts[f]})</span>
              </button>
            );
          })}
        </div>

        {/* Search — width 220px, pl 36px to accommodate icon */}
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

      {/* Student Grid — 3 cols, gap 16px */}
      {filtered.length === 0 ? (
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

// ── StatBox ──
// HTML: bg-white (var(--white)), border-radius:10px, padding:14px 16px
// stat-value: 26px 800, stat-label: 12px color gray mt:2px, stat-change: mt:4px
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

// ── StudentCard ──
// HTML: bg:card-bg, border, border-radius:20px (--radius-lg), padding:20px
function StudentCard({ student: s }: { student: DemoStudent }) {
  const initials = s.first[0] + s.last[0];
  const statusStyles: Record<string, string> = {
    'on-track': 'bg-teal/10 text-teal',
    attention: 'bg-warning/10 text-warning',
    excelling: 'bg-success/10 text-success',
  };
  const statusIcons: Record<string, string> = {
    attention: '⚠ ',
    excelling: '⭐ ',
    'on-track': '',
  };
  const classLabel = s.classNames[0] || 'Unassigned';
  const isRecent = s.lastSession.includes('Just') || s.lastSession.includes('25m');
  const isStale = s.lastSession === '2 days ago';

  return (
    <div
      className="bg-card-bg border border-border rounded-[20px] p-5 cursor-pointer
        transition-all hover:shadow-md hover:-translate-y-0.5 relative"
      onClick={() => window.location.href = '/teacher/students/student-detail'}
    >
      {/* Status pill — absolute top:16px right:16px */}
      <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusStyles[s.status]}`}>
        {statusIcons[s.status]}{STATUS_LABELS[s.status]}
      </span>

      {/* Header — gap:12px, mb:14px */}
      <div className="flex items-center gap-3 mb-3.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm text-white shrink-0"
          style={{ backgroundColor: s.color }}
        >
          {initials}
        </div>
        <div>
          {/* sc-name: 14px 700 */}
          <div className="font-heading font-bold text-sm text-text-primary">
            {s.last}, {s.first}
          </div>
          {/* sc-meta: 12px gray mt:1px */}
          <div className="text-xs text-text-secondary mt-px">
            {classLabel} · Grade {s.grade}
          </div>
        </div>
      </div>

      {/* Stats — sc-stats: grid 2-col gap:10px */}
      {/* HTML has 3 items in 2-col grid — Last Session falls naturally in col 1 of row 2 */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          {/* sc-stat-label: 11px gray */}
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <ClipboardText size={12} weight="fill" /> Activities
          </div>
          {/* sc-stat-value: 13px 600 */}
          <div className="text-[13px] font-semibold text-text-primary">{s.activitiesComplete} complete</div>
        </div>
        <div>
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <Fire size={12} weight="fill" /> Streak
          </div>
          <div className="text-[13px] font-semibold text-text-primary">{s.streak} days</div>
        </div>
        {/* Last Session — 3rd item, occupies col 1 of row 2 (not col-span-2) */}
        <div>
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <ChatText size={12} weight="fill" /> Last Session
          </div>
          <div className={`text-[13px] font-semibold ${isRecent ? 'text-warning font-bold' : 'text-text-primary'}`}>
            {s.lastSession}{isStale ? ' ⚠' : ''}
          </div>
        </div>
      </div>

      {/* Concern — HTML: mt:12px, padding:10px 12px, bg rgba(245,158,11,0.06), border rgba(245,158,11,0.15), radius:8px */}
      {s.concern && (
        <div className="mt-3 py-[10px] px-3 bg-warning/[0.06] border border-warning/[0.15] rounded-lg">
          {/* concern-title: 11px 700 uppercase text-warning mb:3px */}
          <div className="text-[11px] font-bold text-warning uppercase flex items-center gap-1 mb-[3px]">
            <WarningCircle size={12} weight="fill" /> Concern
          </div>
          {/* concern-text: 12px color:#92400E leading:1.5 */}
          <div className="text-xs text-[#92400E] dark:text-warning/80 leading-relaxed">{s.concern}</div>
        </div>
      )}
    </div>
  );
}
