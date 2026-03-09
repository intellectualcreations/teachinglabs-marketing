'use client';

import { useState, useMemo } from 'react';
import {
  ChartBar, Funnel, MagnifyingGlass, WarningCircle,
  ClipboardText, Fire, ChatText, CaretRight,
} from '@phosphor-icons/react';
import ClassIcon from '@/components/shared/ClassIcon';
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5 mb-6">
        {/* Class Overview */}
        <div className="bg-card-bg border border-border rounded-[14px] p-6">
          <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-text-secondary mb-4 flex items-center gap-2">
            <ChartBar size={16} weight="fill" className="text-teal" />
            Class Overview
          </h2>
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

        {/* Activity */}
        <div className="bg-card-bg border border-border rounded-[14px] p-6">
          <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-text-secondary mb-4 flex items-center gap-2">
            <Fire size={16} weight="fill" className="text-coral" />
            Activity
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatBox value={totalInteractions} label="Total Interactions">
              <span className="text-xs font-semibold text-success">↑ 23%</span>
            </StatBox>
            <StatBox value={chatSessions} label="Chat Sessions">
              <span className="text-xs font-semibold text-success">↑ 18%</span>
            </StatBox>
          </div>
          <div className="text-xs text-text-secondary mb-2">Activity by hour (today)</div>
          <BarChart labels={ACTIVITY_HOURS} values={ACTIVITY_VALUES} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3.5 py-2 border-[1.5px] border-border rounded-lg text-sm font-heading font-medium
            bg-surface text-text-primary cursor-pointer focus:border-navy outline-none"
        >
          <option value="all">All Classes</option>
          {DEMO_CLASSES.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <input
          type="date"
          className="px-3 py-2 border-[1.5px] border-border rounded-lg text-sm font-heading
            bg-surface text-text-primary outline-none focus:border-navy"
        />
        <span className="text-text-secondary text-sm">to</span>
        <input
          type="date"
          className="px-3 py-2 border-[1.5px] border-border rounded-lg text-sm font-heading
            bg-surface text-text-primary outline-none focus:border-navy"
        />

        <button
          onClick={() => setShowCount(12)}
          className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-heading font-semibold
            flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer"
        >
          <Funnel size={14} weight="fill" /> Apply Filters
        </button>
      </div>

      {/* Status Pills + Search */}
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
                className={`px-4 py-1.5 rounded-full border-[1.5px] text-sm font-semibold font-heading
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

        <div className="relative ml-auto">
          <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowCount(12); }}
            className="pl-8 pr-3 py-2 border-[1.5px] border-border rounded-lg text-sm
              bg-surface text-text-primary outline-none w-52 focus:border-navy"
          />
        </div>
      </div>

      {/* Student Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-text-secondary">
          No students match your filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {showing.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </div>
          {filtered.length > showCount && (
            <button
              onClick={() => setShowCount((c) => c + 12)}
              className="block max-w-xs mx-auto mt-7 px-6 py-3 rounded-lg bg-navy text-white
                font-heading font-bold text-sm hover:bg-navy/90 transition-colors cursor-pointer"
            >
              <CaretRight size={14} weight="fill" className="inline mr-1" />
              Load More Students ({filtered.length} total)
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Sub-components

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
    <div className="bg-surface rounded-lg p-3.5">
      <div className="font-heading text-2xl font-extrabold text-text-primary">{value}</div>
      <div className="text-xs text-text-secondary mt-0.5">{label}</div>
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}

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
      className="bg-card-bg border border-border rounded-[14px] p-5 cursor-pointer
        transition-all hover:shadow-md hover:-translate-y-0.5 relative"
      onClick={() => window.location.href = '/teacher/students/student-detail'}
    >
      {/* Status pill */}
      <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusStyles[s.status]}`}>
        {statusIcons[s.status]}{STATUS_LABELS[s.status]}
      </span>

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
            {s.last}, {s.first}
          </div>
          <div className="text-xs text-text-secondary mt-px">
            {classLabel} · Grade {s.grade}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <ClipboardText size={12} weight="fill" /> Activities
          </div>
          <div className="text-sm font-semibold text-text-primary">{s.activitiesComplete} complete</div>
        </div>
        <div>
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <Fire size={12} weight="fill" /> Streak
          </div>
          <div className="text-sm font-semibold text-text-primary">{s.streak} days</div>
        </div>
        <div className="col-span-2">
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <ChatText size={12} weight="fill" /> Last Session
          </div>
          <div className={`text-sm font-semibold ${isRecent ? 'text-warning font-bold' : 'text-text-primary'}`}>
            {s.lastSession}{isStale ? ' ⚠' : ''}
          </div>
        </div>
      </div>

      {/* Concern */}
      {s.concern && (
        <div className="mt-3 p-2.5 bg-warning/5 border border-warning/15 rounded-lg">
          <div className="text-[11px] font-bold text-warning uppercase flex items-center gap-1 mb-0.5">
            <WarningCircle size={12} weight="fill" /> Concern
          </div>
          <div className="text-xs text-[#92400E] dark:text-warning/80 leading-relaxed">{s.concern}</div>
        </div>
      )}
    </div>
  );
}
