'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CaretLeft, CheckCircle, UsersThree, BookOpenText, MathOperations,
  Flask, GlobeHemisphereWest, SquaresFour, ChatsCircle, ClipboardText,
  ChatText, Trophy, ChartBar, ArrowsClockwise, Funnel, Export,
  EnvelopeSimple, RocketLaunch, Fire, Star, Lightning, Brain, Medal,
  Target, ClockCounterClockwise,
} from '@phosphor-icons/react';
import { getDemoStudents } from '@/lib/demo-data';

// ── Demo data ────────────────────────────────────────────────────────────────

const ALL_CLASSES = [
  { name: '5th Period Math', teacher: 'Ms. Harper', mine: true, color: '#1F3A5F', Icon: MathOperations },
  { name: '3rd Period Math', teacher: 'Ms. Harper', mine: true, color: '#1F3A5F', Icon: MathOperations },
  { name: 'English Language Arts', teacher: 'Mr. Davis', mine: false, color: '#4FA3A5', Icon: BookOpenText },
  { name: 'Science', teacher: 'Ms. Chen', mine: false, color: '#7C3AED', Icon: Flask },
  { name: 'Social Studies', teacher: 'Mrs. Thompson', mine: false, color: '#0891B2', Icon: GlobeHemisphereWest },
];

type FilterKey = 'all' | 0 | 1 | 2 | 3 | 4;

const STATS_DATA: Record<string, { sessions: number; activities: number; personalChats: number; badges: number }> = {
  all:  { sessions: 47, activities: 5, personalChats: 7, badges: 3 },
  '0':  { sessions: 18, activities: 2, personalChats: 3, badges: 1 },
  '1':  { sessions: 8,  activities: 1, personalChats: 1, badges: 0 },
  '2':  { sessions: 12, activities: 1, personalChats: 2, badges: 1 },
  '3':  { sessions: 6,  activities: 1, personalChats: 1, badges: 1 },
  '4':  { sessions: 3,  activities: 0, personalChats: 0, badges: 0 },
};

const CHART_DATA: Record<string, number[]> = {
  all: [4, 7, 3, 8, 6, 2, 5],
  '0': [2, 3, 1, 4, 3, 0, 2],
  '1': [1, 1, 0, 2, 1, 0, 1],
  '2': [1, 2, 1, 1, 1, 1, 1],
  '3': [0, 1, 1, 1, 1, 1, 0],
  '4': [0, 0, 0, 0, 0, 0, 1],
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Badge {
  IconComp: React.ElementType;
  color: string;
  name: string;
  date: string;
  locked: boolean;
}

const BADGES: Record<string, Badge[]> = {
  all: [
    { IconComp: RocketLaunch, color: 'var(--teal)',    name: 'First Chat',    date: 'Mar 3', locked: false },
    { IconComp: Fire,         color: '#E8836B',         name: '3-Day Streak',  date: 'Mar 5', locked: false },
    { IconComp: Star,         color: '#F59E0B',         name: 'Math Whiz',     date: 'Mar 7', locked: false },
    { IconComp: Lightning,    color: 'var(--text-secondary)', name: 'Speed Reader', date: 'Locked', locked: true },
    { IconComp: Brain,        color: 'var(--text-secondary)', name: 'Science Pro',  date: 'Locked', locked: true },
    { IconComp: Medal,        color: 'var(--text-secondary)', name: '10 Activities',date: 'Locked', locked: true },
  ],
  '0': [
    { IconComp: Star,   color: '#F59E0B',              name: 'Math Whiz',       date: 'Mar 7', locked: false },
    { IconComp: Target, color: 'var(--text-secondary)', name: 'Fraction Master', date: 'Locked', locked: true },
    { IconComp: Trophy, color: 'var(--text-secondary)', name: 'Perfect Score',   date: 'Locked', locked: true },
  ],
  '2': [
    { IconComp: BookOpenText, color: '#4FA3A5',          name: 'Bookworm',     date: 'Mar 6', locked: false },
    { IconComp: Lightning,    color: 'var(--text-secondary)', name: 'Speed Reader', date: 'Locked', locked: true },
  ],
  '3': [
    { IconComp: Flask,  color: '#7C3AED',              name: 'Lab Curious',  date: 'Mar 4', locked: false },
    { IconComp: Brain,  color: 'var(--text-secondary)', name: 'Science Pro',  date: 'Locked', locked: true },
  ],
};

interface Activity {
  dotColor: string;
  text: React.ReactNode;
  time: string;
  cls: string;
}

const ACTIVITIES: Record<string, Activity[]> = {
  all: [
    { dotColor: '#10B981', text: <>Completed <strong>Equivalent Fractions</strong> activity</>, time: '2 hours ago', cls: '5th Period Math' },
    { dotColor: 'var(--teal)', text: <>Started a chat about <strong>photosynthesis</strong></>, time: 'Yesterday', cls: 'Science' },
    { dotColor: 'var(--navy)', text: <>Turned in <strong>Book Report: Charlotte&apos;s Web</strong></>, time: 'Yesterday', cls: 'ELA' },
    { dotColor: '#8B5CF6', text: <>Earned the <strong>Math Whiz</strong> badge</>, time: '2 days ago', cls: '5th Period Math' },
    { dotColor: '#F59E0B', text: <>Chatted about <strong>the Civil War</strong></>, time: '3 days ago', cls: 'Social Studies' },
    { dotColor: '#10B981', text: <>Completed <strong>Adding Fractions Practice</strong></>, time: '4 days ago', cls: '5th Period Math' },
    { dotColor: 'var(--teal)', text: <>Started a chat about <strong>character traits</strong></>, time: '4 days ago', cls: 'ELA' },
    { dotColor: 'var(--navy)', text: <>Worked on <strong>Multiplication Tables</strong></>, time: '5 days ago', cls: '3rd Period Math' },
  ],
  '0': [
    { dotColor: '#10B981', text: <>Completed <strong>Equivalent Fractions</strong> activity</>, time: '2 hours ago', cls: '5th Period Math' },
    { dotColor: '#8B5CF6', text: <>Earned the <strong>Math Whiz</strong> badge</>, time: '2 days ago', cls: '5th Period Math' },
    { dotColor: '#10B981', text: <>Completed <strong>Adding Fractions Practice</strong></>, time: '4 days ago', cls: '5th Period Math' },
    { dotColor: 'var(--teal)', text: <>Started a chat about <strong>decimal conversions</strong></>, time: '5 days ago', cls: '5th Period Math' },
  ],
  '1': [
    { dotColor: 'var(--navy)', text: <>Worked on <strong>Multiplication Tables</strong></>, time: '5 days ago', cls: '3rd Period Math' },
    { dotColor: 'var(--teal)', text: <>Chatted about <strong>word problems</strong></>, time: '6 days ago', cls: '3rd Period Math' },
  ],
  '2': [
    { dotColor: 'var(--navy)', text: <>Turned in <strong>Book Report: Charlotte&apos;s Web</strong></>, time: 'Yesterday', cls: 'ELA' },
    { dotColor: 'var(--teal)', text: <>Started a chat about <strong>character traits</strong></>, time: '4 days ago', cls: 'ELA' },
    { dotColor: '#10B981', text: <>Completed <strong>Theme Analysis</strong> activity</>, time: '6 days ago', cls: 'ELA' },
  ],
  '3': [
    { dotColor: 'var(--teal)', text: <>Started a chat about <strong>photosynthesis</strong></>, time: 'Yesterday', cls: 'Science' },
    { dotColor: 'var(--navy)', text: <>Worked on <strong>States of Matter</strong></>, time: '4 days ago', cls: 'Science' },
  ],
  '4': [
    { dotColor: '#F59E0B', text: <>Chatted about <strong>the Civil War</strong></>, time: '3 days ago', cls: 'Social Studies' },
  ],
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentDetailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-secondary">Loading student...</div>}>
      <StudentDetailContent />
    </Suspense>
  );
}

function StudentDetailContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student');

  // Look up student from demo data
  const allStudents = getDemoStudents();
  const student = allStudents.find((s) => s.id === studentId) ?? allStudents[0];

  const initials = student.first[0] + student.last[0];
  const statusLabel = student.status === 'on-track' ? 'On Track' : student.status === 'excelling' ? 'Excelling' : 'Needs Attention';
  const statusStyle = student.status === 'on-track'
    ? 'bg-teal/10 text-teal'
    : student.status === 'excelling'
      ? 'bg-success/10 text-success'
      : 'bg-warning/10 text-warning';

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [teacherNotes, setTeacherNotes] = useState('');

  const filterKey = activeFilter;
  const stats = STATS_DATA[filterKey] ?? STATS_DATA.all;
  const chartVals = CHART_DATA[filterKey] ?? CHART_DATA.all;
  const badges = BADGES[filterKey] ?? BADGES.all;
  const activities = ACTIVITIES[filterKey] ?? ACTIVITIES.all;
  const activeClass = filterKey !== 'all' ? ALL_CLASSES[Number(filterKey)] : null;

  const maxBar = Math.max(...chartVals, 1);
  const chartTitle = activeClass
    ? `${activeClass.name} — This Week`
    : "This Week's Activity";
  const activityTitle = activeClass
    ? `${activeClass.name} — Recent Activity`
    : 'Recent Activity';

  return (
    <div>
      {/* Back button */}
      <a
        href="/teacher/students"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-border
          bg-transparent text-text-secondary text-[13px] font-medium cursor-pointer transition-all
          hover:border-navy hover:text-text-primary mb-5 no-underline"
      >
        <CaretLeft size={16} weight="fill" /> Back to Students
      </a>

      {/* Student Header */}
      <div className="relative bg-card-bg border border-border rounded-[14px] p-6 mb-5 flex items-center gap-5 overflow-hidden">
        {/* top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy to-teal" />

        <div
          className="w-16 h-16 rounded-full text-white flex items-center justify-center
            font-heading font-extrabold text-[22px] shrink-0"
          style={{ backgroundColor: student.color }}
        >
          {initials}
        </div>

        <div>
          <div className="font-heading text-[22px] font-bold text-text-primary">{student.first} {student.last}</div>
          <div className="text-[13px] text-text-secondary mt-0.5">Grade {student.grade} · {student.id} · {student.classNames[0] || 'Unassigned'}</div>
          <div className="flex gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-3 py-[3px] rounded-full text-xs font-semibold ${statusStyle}`}>
              <CheckCircle size={12} weight="fill" /> {statusLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-[3px] rounded-full text-xs font-semibold bg-teal/10 text-teal">
              <UsersThree size={12} weight="fill" /> Parent Connected
            </span>
          </div>
        </div>

        <div className="ml-auto hidden sm:flex gap-6 text-center">
          <div>
            <div className="font-heading font-extrabold text-[22px] text-navy">{student.streak}</div>
            <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px]">Day Streak</div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-[22px] text-navy">{student.activitiesComplete}</div>
            <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px]">Activities</div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-[22px] text-navy">{student.lastSession}</div>
            <div className="text-[11px] text-text-secondary uppercase tracking-[0.5px]">Last Session</div>
          </div>
        </div>
      </div>

      {/* Communication Profile */}
      <div className="relative bg-card-bg border border-border rounded-[14px] p-6 mb-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#7C3AED]" />

        <div className="font-heading font-bold text-[15px] text-text-primary flex items-center gap-2 mb-1">
          <Brain size={20} weight="fill" className="text-[#7C3AED]" />
          Baseline Assessment: Communication Profile
        </div>
        <div className="text-xs text-text-secondary mb-[18px]">
          Generated from initial diagnostic conversation · Last updated Mar 3, 2026
        </div>

        {/* Meters */}
        <div className="flex flex-col gap-[14px] mb-[18px]">
          {[
            { name: 'Reading Comprehension',    pct: 68, label: 'Grade Level' },
            { name: 'Vocabulary Level',          pct: 65, label: 'Grade Level' },
            { name: 'Expression & Detail',       pct: 60, label: 'Developing'  },
            { name: 'Math Readiness (5th grade)', pct: 62, label: 'Grade Level' },
          ].map(({ name, pct, label }) => (
            <div key={name}>
              <div className="flex justify-between mb-1">
                <span className="text-[13px] font-semibold text-text-primary">{name}</span>
                <span className="text-xs font-semibold text-[#F59E0B]">{label}</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#F59E0B] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-[18px]">
          {['Learns by example', 'Needs warm-up time', 'Responds to encouragement', 'Visual learner', 'Social motivation'].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7C3AED]/8 text-[#7C3AED]">
              {tag}
            </span>
          ))}
        </div>

        {/* Note */}
        <div className="bg-surface border-l-4 border-[#7C3AED] rounded-lg px-4 py-3.5 text-[13px] leading-relaxed text-text-primary">
          <strong className="text-navy">How Ms. Harper&apos;s assistant communicates with {student.first}:</strong>
          <br />
          Uses clear, straightforward language at grade level. Shows examples before asking {student.first} to try, breaks problems
          into steps, and gives positive reinforcement. Longer explanations are chunked into smaller pieces.
        </div>

        <div className="flex justify-end mt-3">
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-border
              bg-transparent text-text-secondary text-[13px] font-semibold font-heading cursor-pointer
              hover:border-navy hover:text-text-primary transition-all"
          >
            <ArrowsClockwise size={14} weight="fill" /> Recalibrate
          </button>
        </div>
      </div>

      {/* Class Tabs */}
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.5px] text-text-secondary mb-2.5 flex items-center gap-1.5">
          <BookOpenText size={14} weight="fill" /> {student.first}&apos;s Classes
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {/* All tab */}
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] border-[1.5px] cursor-pointer
              font-semibold text-[13px] transition-all
              ${activeFilter === 'all'
                ? 'border-teal bg-teal/[0.06] text-teal'
                : 'border-border bg-card-bg text-text-primary hover:border-teal'
              }`}
          >
            <span className="w-7 h-7 rounded-md bg-teal flex items-center justify-center shrink-0">
              <SquaresFour size={14} weight="fill" className="text-white" />
            </span>
            <span className="leading-tight text-left">
              All Classes
              <span className="block text-[10px] font-normal text-text-secondary">5 classes</span>
            </span>
          </button>

          {ALL_CLASSES.map((cls, i) => (
            <div key={i} className="relative">
              {cls.mine && (
                <span className="absolute -top-1.5 -right-1 text-[9px] font-bold bg-teal text-white px-1.5 py-px rounded-full z-10">
                  You
                </span>
              )}
              <button
                onClick={() => setActiveFilter(String(i))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] border-[1.5px] cursor-pointer
                  font-semibold text-[13px] transition-all
                  ${activeFilter === String(i)
                    ? 'border-teal bg-teal/[0.06]'
                    : 'border-border bg-card-bg text-text-primary hover:border-teal'
                  }`}
              >
                <span
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cls.color }}
                >
                  <cls.Icon size={14} weight="fill" className="text-white" />
                </span>
                <span className="leading-tight text-left">
                  <span className={activeFilter === String(i) ? 'text-teal' : ''}>{cls.name}</span>
                  <span className="block text-[10px] font-normal text-text-secondary">{cls.teacher}</span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter indicator */}
      {activeFilter !== 'all' && activeClass && (
        <div className="text-xs font-semibold text-teal mb-[14px] flex items-center gap-1.5">
          <Funnel size={14} weight="fill" />
          Showing {activeClass.name} ({activeClass.teacher})
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <a
          href="/teacher/conversation-detail"
          className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg bg-navy text-white
            font-heading font-semibold text-[13px] cursor-pointer hover:opacity-85 transition-opacity no-underline"
        >
          <ChatsCircle size={14} weight="fill" /> View Conversations
        </a>
        <button className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg border-[1.5px] border-border
          bg-transparent text-text-secondary font-heading font-semibold text-[13px] cursor-pointer
          hover:border-navy hover:text-text-primary transition-all">
          <Export size={14} weight="fill" /> Export Report
        </button>
        <button className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg border-[1.5px] border-border
          bg-transparent text-text-secondary font-heading font-semibold text-[13px] cursor-pointer
          hover:border-navy hover:text-text-primary transition-all">
          <EnvelopeSimple size={14} weight="fill" /> Send to Parents
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        {[
          { Icon: ChatsCircle,   color: 'bg-teal',     value: stats.sessions,      label: 'Chat Sessions' },
          { Icon: ClipboardText, color: 'bg-navy',     value: stats.activities,    label: 'Activities Complete' },
          { Icon: ChatText,      color: 'bg-[#8B5CF6]', value: stats.personalChats, label: 'Personal Chats' },
          { Icon: Trophy,        color: 'bg-[#F59E0B]', value: stats.badges,        label: 'Badges Earned' },
        ].map(({ Icon, color, value, label }) => (
          <div key={label} className="bg-card-bg border border-border rounded-[12px] p-4 text-center">
            <div className={`w-9 h-9 rounded-[10px] ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} weight="fill" className="text-white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">{value}</div>
            <div className="text-[11px] text-text-secondary font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Bar Chart */}
        <div className="bg-card-bg border border-border rounded-[12px] p-5">
          <div className="font-heading font-bold text-sm text-text-primary flex items-center gap-2 mb-4">
            <ChartBar size={16} weight="fill" className="text-teal" /> {chartTitle}
          </div>
          <div className="flex items-end gap-2 h-[120px]">
            {chartVals.map((val, i) => {
              const h = Math.round((val / maxBar) * 100);
              const bg = val > 5 ? '#4FA3A5' : val > 3 ? '#8FC4C5' : '#BFE0E1';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-[4px] min-h-[4px] transition-all duration-300"
                    style={{ height: `${h}px`, backgroundColor: bg }}
                  />
                  <span className="text-[10px] text-text-secondary font-medium">{DAYS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-card-bg border border-border rounded-[12px] p-5">
          <div className="font-heading font-bold text-sm text-text-primary flex items-center gap-2 mb-4">
            <Trophy size={16} weight="fill" className="text-[#F59E0B]" /> Badges
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`text-center p-3 bg-surface border border-border rounded-[10px] ${badge.locked ? 'opacity-35' : ''}`}
              >
                <badge.IconComp size={28} weight="fill" style={{ color: badge.color }} className="mx-auto" />
                <div className="text-[11px] font-semibold text-text-primary mt-1">{badge.name}</div>
                <div className="text-[10px] text-text-secondary">{badge.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-card-bg rounded-[20px] border border-border p-6 mb-5">
        <div className="font-heading font-bold text-sm text-text-primary flex items-center gap-2 mb-4">
          <Brain size={16} weight="fill" className="text-[#7C3AED]" /> AI Insights
        </div>
        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-border rounded-lg px-4 py-3.5 border-l-4 border-l-[#10B981]">
            <p className="text-[13px] leading-relaxed text-text-primary m-0">
              Shows strong pattern recognition with visual math problems. Excels when concepts are presented graphically.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-lg px-4 py-3.5 border-l-4 border-l-[#F59E0B]">
            <p className="text-[13px] leading-relaxed text-text-primary m-0">
              Tends to rush through word problems. May benefit from guided reading strategies before solving.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-lg px-4 py-3.5 border-l-4 border-l-teal">
            <p className="text-[13px] leading-relaxed text-text-primary m-0">
              Engagement peaks during morning sessions. Consider scheduling challenging activities before noon.
            </p>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-card-bg border border-border rounded-[12px] p-5 mb-5">
        <div className="font-heading font-bold text-sm text-text-primary flex items-center gap-2 mb-3.5">
          <ClockCounterClockwise size={16} weight="fill" className="text-navy" /> {activityTitle}
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-5 text-[13px] text-text-secondary">No activity in this class yet.</div>
        ) : (
          <div>
            {activities.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-2.5 ${i < activities.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.dotColor }}
                />
                <div className="flex-1 text-[13px] text-text-primary">{item.text}</div>
                {activeFilter === 'all' && (
                  <span className="text-[10px] font-semibold bg-teal/[0.08] text-teal px-2 py-[2px] rounded shrink-0">
                    {item.cls}
                  </span>
                )}
                <div className="text-[11px] text-text-secondary shrink-0">{item.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Notes */}
      <div className="bg-card-bg rounded-[20px] border border-border p-6">
        <h2 className="font-heading font-bold text-sm text-text-primary mb-4">Teacher Notes</h2>
        <textarea
          value={teacherNotes}
          onChange={(e) => setTeacherNotes(e.target.value)}
          placeholder="Add private notes about this student..."
          className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-surface text-[13px]
            text-text-primary placeholder:text-text-secondary resize-y outline-none focus:border-navy"
        />
        <div className="flex justify-end mt-3">
          <button
            className="px-5 py-2 rounded-lg bg-navy text-white font-heading font-semibold text-[13px]
              cursor-pointer hover:opacity-85 transition-opacity"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
