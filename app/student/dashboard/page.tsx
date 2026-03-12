'use client';

import { useState, useEffect, useRef } from 'react';
import {
  SquaresFour, BookOpenText, MathOperations, Flask, GlobeHemisphereWest,
  ChatsCircle, ClipboardText, ChatText, Trophy, ChartBar,
  RocketLaunch, Fire, Star, Lightning, Brain, Medal,
  ClockCounterClockwise, HandWaving, HouseSimple, List, X,
} from '@phosphor-icons/react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';

const CLASSES = [
  { id: 'math', name: '5th Period Math', teacher: 'Mrs. Martinez', Icon: MathOperations, color: '#1F3A5F', badge: 2 },
  { id: 'ela', name: 'English Language Arts', teacher: 'Mr. Davis', Icon: BookOpenText, color: '#4FA3A5', badge: 0 },
  { id: 'science', name: 'Science', teacher: 'Ms. Chen', Icon: Flask, color: '#7C3AED', badge: 1 },
  { id: 'social', name: 'Social Studies', teacher: 'Mrs. Thompson', Icon: GlobeHemisphereWest, color: '#0891B2', badge: 0 },
];

const STATS = [
  { label: 'Chat Sessions', value: 12, Icon: ChatsCircle, color: '#4FA3A5' },
  { label: 'Activities Complete', value: 5, Icon: ClipboardText, color: '#1F3A5F' },
  { label: 'Personal Chats', value: 7, Icon: ChatText, color: '#8B5CF6' },
  { label: 'Badges Earned', value: 3, Icon: Trophy, color: '#F59E0B' },
];

const BADGES = [
  { name: 'First Chat', date: 'Mar 3', Icon: RocketLaunch, color: '#4FA3A5', locked: false },
  { name: '3-Day Streak', date: 'Mar 5', Icon: Fire, color: '#E8836B', locked: false },
  { name: 'Math Whiz', date: 'Mar 7', Icon: Star, color: '#F59E0B', locked: false },
  { name: 'Speed Reader', date: 'Locked', Icon: Lightning, color: '#94A3B8', locked: true },
  { name: 'Science Pro', date: 'Locked', Icon: Brain, color: '#94A3B8', locked: true },
  { name: '10 Lessons', date: 'Locked', Icon: Medal, color: '#94A3B8', locked: true },
];

const ACTIVITY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ACTIVITY_VALUES = [4, 7, 3, 8, 6, 2, 5];

const RECENT_ACTIVITY = [
  { text: 'Completed Equivalent Fractions lesson in Math', time: '2 hours ago', color: '#10B981' },
  { text: 'Started a chat about photosynthesis in Science', time: 'Yesterday', color: '#4FA3A5' },
  { text: "Turned in Book Report: Charlotte's Web in ELA", time: 'Yesterday', color: '#1F3A5F' },
  { text: 'Earned the Math Whiz badge', time: '2 days ago', color: '#8B5CF6' },
  { text: 'Chatted about the Civil War in Social Studies', time: '3 days ago', color: '#F59E0B' },
];

export default function StudentDashboardPage() {
  const chartMax = Math.max(...ACTIVITY_VALUES);
  const barsRef = useRef<HTMLDivElement>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-warm-white">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg bg-navy text-white
          flex items-center justify-center shadow-lg"
        aria-label="Open menu"
      >
        <List size={22} weight="fill" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-navy flex-shrink-0 flex flex-col z-50
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button (mobile) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-heading font-bold text-xs flex-shrink-0">TL</div>
          <div>
            <div className="font-heading font-bold text-sm text-white">TeachingLabs</div>
            <div className="text-xs text-white/50">Lincoln Elementary</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-2 py-2 border-b border-white/10">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors"
          >
            <SquaresFour size={18} weight="fill" />
            Dashboard
          </Link>
        </nav>

        {/* Classes */}
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-4 pb-2 flex items-center gap-1.5">
            <BookOpenText size={12} weight="fill" className="text-white/40" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-white/50">My Classes</span>
          </div>
          {CLASSES.map(cls => (
            <Link
              key={cls.id}
              href={`/student/main?class=${cls.id}&view=class-dashboard`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.12] transition-colors text-white/70 hover:text-white"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cls.color }}>
                <cls.Icon size={16} weight="fill" className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs truncate text-white">{cls.name}</div>
                <div className="text-[11px] text-white/50">{cls.teacher}</div>
              </div>
              {cls.badge > 0 && (
                <div className="w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {cls.badge}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Student footer */}
        <div className="border-t border-white/10 p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-heading font-bold text-xs flex-shrink-0">AR</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs text-white">Alex Rivera</div>
            <div className="text-[11px] text-white/50">5th Grade</div>
          </div>
          <ThemeToggle className="border-white/20 text-white/60 hover:text-white hover:border-white/40" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">

        {/* Welcome banner */}
        <div className="bg-card-bg border border-border rounded-[14px] px-7 py-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy to-teal" />
          <div className="flex items-center gap-2 mb-1">
            <HandWaving size={24} weight="fill" className="text-teal" />
            <h1 className="font-heading font-bold text-xl text-text-primary">Hi Alex!</h1>
          </div>
          <p className="text-sm text-text-secondary">
            You&apos;re enrolled in <strong className="text-text-primary">4 classes</strong>. Click on a class to get started.
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-teal">
            <HouseSimple size={14} weight="fill" />
            Pick a class to start chatting, view lessons, or explore on your own
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {STATS.map(stat => (
            <div key={stat.label} className="bg-card-bg border border-border rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mx-auto mb-2.5" style={{ background: stat.color }}>
                <stat.Icon size={18} weight="fill" className="text-white" />
              </div>
              <div className="font-heading font-bold text-[26px] text-text-primary leading-none">{stat.value}</div>
              <div className="text-[11px] text-text-secondary font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two column: chart + badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Activity chart */}
          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 font-heading font-bold text-sm text-text-primary mb-4">
              <ChartBar size={16} weight="fill" className="text-teal" />
              This Week&apos;s Activity
            </div>
            <div className="flex items-end gap-2 h-[120px]" ref={barsRef}>
              {ACTIVITY_DAYS.map((day, i) => {
                const val = ACTIVITY_VALUES[i];
                const h = Math.round((val / chartMax) * 100);
                const color = val > 5 ? '#4FA3A5' : val > 3 ? '#8FC4C5' : '#BFE0E1';
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-t min-h-1 transition-all duration-700"
                      style={{
                        height: barsVisible ? `${h}%` : '4px',
                        background: color,
                      }}
                    />
                    <span className="text-[10px] text-text-muted font-medium">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 font-heading font-bold text-sm text-text-primary mb-4">
              <Trophy size={16} weight="fill" className="text-warning" />
              Badges
            </div>
            <div className="grid grid-cols-3 gap-3">
              {BADGES.map(badge => (
                <div
                  key={badge.name}
                  className={`text-center p-3 rounded-[10px] border border-border bg-warm-white ${badge.locked ? 'opacity-40' : ''}`}
                >
                  <div className="mb-1.5">
                    <badge.Icon size={28} weight="fill" style={{ color: badge.color }} className="mx-auto" />
                  </div>
                  <div className="text-[11px] font-semibold text-text-primary">{badge.name}</div>
                  <div className="text-[10px] text-text-muted">{badge.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 font-heading font-bold text-sm text-text-primary mb-4">
            <ClockCounterClockwise size={16} weight="fill" className="text-navy" />
            Recent Activity
          </div>
          <div className="divide-y divide-border">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-teal/[0.04] transition-colors">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <div
                  className="flex-1 text-sm text-text-primary"
                  dangerouslySetInnerHTML={{ __html: item.text.replace(/([^.]+)/g, (m) => m) }}
                />
                <div className="text-[11px] text-text-muted flex-shrink-0">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
