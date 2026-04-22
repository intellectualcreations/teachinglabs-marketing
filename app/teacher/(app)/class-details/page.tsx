'use client';

import { useState, Suspense, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users, Lightning, ChatText, ChartBar, Plus, PencilSimple,
  Play, Stop, EnvelopeSimple, Robot, BookOpen, CheckCircle,
  Clock, Student, ArrowRight, CaretDown, CaretUp, X,
  PaperPlaneRight, UsersThree,
} from '@phosphor-icons/react';
import ClassIcon from '@/components/shared/ClassIcon';
import { createClient } from '@/lib/supabase/client';
import AddActivityModal from '@/components/teacher/AddActivityModal';

/* ─── Demo Data (kept for features we don't track yet) ─── */

const DEMO_GROUPS: Record<string, { name: string; students: string[]; color: string }[]> = {};

const AVATAR_COLORS = [
  '#1F3A5F', '#4FA3A5', '#E8836B', '#F59E0B', '#8B5CF6',
  '#059669', '#3B82F6', '#DC2626', '#6366F1', '#0891B2',
];

interface FeedEvent {
  icon: 'start' | 'complete' | 'ai' | 'question';
  text: string;
  time: string;
}

const RECENT_FEED: FeedEvent[] = [
  { icon: 'start', text: 'Student started an activity', time: 'Recently' },
  { icon: 'complete', text: 'Student completed an activity', time: 'Recently' },
  { icon: 'ai', text: 'AI insights coming soon', time: '' },
];

/* ─── Types for API response ─── */

interface ClassDetailsResponse {
  class: {
    id: string;
    name: string;
    subject: string | null;
    grade_level: string | null;
    join_code: string;
    teacher_id: string;
    description: string | null;
    icon: string | null;
    created_at: string;
  };
  students: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    enrolled_at: string;
  }[];
  assignments: {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    created_at: string;
  }[];
  studentCount: number;
  assignmentCount: number;
}

/* ─── Sub-components ─── */

function StatusDot({ status }: { status: 'active' | 'week' | 'inactive' }) {
  const colors = { active: 'bg-green-500', week: 'bg-yellow-400', inactive: 'bg-gray-400' };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
}

function FeedIcon({ type }: { type: FeedEvent['icon'] }) {
  const base = 'w-7 h-7 rounded-full flex items-center justify-center shrink-0';
  switch (type) {
    case 'start':
      return <span className={`${base} bg-navy/10`}><Play size={14} weight="fill" className="text-navy" /></span>;
    case 'complete':
      return <span className={`${base} bg-green-500/10`}><CheckCircle size={14} weight="fill" className="text-green-600" /></span>;
    case 'ai':
      return <span className={`${base} bg-teal/10`}><Robot size={14} weight="fill" className="text-teal" /></span>;
    case 'question':
      return <span className={`${base} bg-navy/10`}><ChatText size={14} weight="fill" className="text-navy" /></span>;
  }
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
        checked ? 'bg-green-500' : 'bg-gray-400'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* ─── Message All Students Modal ─── */

function MessageModal({
  isOpen,
  onClose,
  className: clsName,
  studentCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  studentCount: number;
}) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isOpen) { setMessage(''); setSent(false); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] mx-4 border border-border rounded-2xl shadow-xl
          animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: 'var(--color-navy-light, #1a2744)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success overlay */}
        {sent && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--color-navy-light, #1a2744)' }}
          >
            <div className="w-14 h-14 rounded-full bg-teal/20 flex items-center justify-center mb-3 animate-in zoom-in-50 duration-300">
              <CheckCircle size={36} weight="fill" className="text-teal" />
            </div>
            <p className="font-heading font-bold text-lg text-text-primary">Message Sent!</p>
            <p className="text-sm text-text-secondary mt-1">Delivered to {studentCount} students</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-text-secondary hover:text-text-primary
            hover:bg-border/40 transition-colors z-20"
        >
          <X size={20} weight="bold" />
        </button>

        <div className="p-7">
          <h2 className="font-heading font-bold text-xl text-text-primary">Message All Students</h2>
          <p className="text-sm text-text-secondary mt-1 mb-5">
            {clsName} ({studentCount} students)
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., Don't forget we're wrapping up Fraction Basics tomorrow!"
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card-bg text-sm text-text-primary
              placeholder:text-text-secondary/60 focus:outline-none focus:border-navy transition-colors resize-none"
          />
          <div className="text-right text-[11px] text-text-secondary mt-1 mb-5">
            {message.length}/500
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal text-navy rounded-lg text-sm
                font-semibold hover:bg-teal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PaperPlaneRight size={15} weight="fill" /> Send Message
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-text-secondary
                hover:text-text-primary hover:bg-border/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Group Breakdown Component ─── */

function GroupBreakdown({
  classId,
  activity,
  defaultExpanded,
}: {
  classId: string;
  activity: { name: string; progress: number; total: number; chats: number };
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const groups = DEMO_GROUPS[classId] ?? [];
  if (groups.length === 0) return null;

  const totalGroupStudents = groups.reduce((s, g) => s + g.students.length, 0);
  const ungroupedCount = Math.max(0, activity.total - totalGroupStudents);

  // Distribute progress proportionally
  const groupRows = groups.map((g) => {
    const fraction = g.students.length / activity.total;
    const started = Math.round(activity.progress * fraction);
    const chats = Math.round(activity.chats * fraction);
    const highChatLowCompletion = chats > 3 && started / g.students.length < 0.5;
    return { ...g, started, chats, highChatLowCompletion };
  });

  // Ungrouped remainder
  const ungroupedStarted = activity.progress - groupRows.reduce((s, g) => s + g.started, 0);
  const ungroupedChats = activity.chats - groupRows.reduce((s, g) => s + g.chats, 0);

  return (
    <div className="mt-2 ml-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary transition-colors"
      >
        {expanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
        <UsersThree size={13} className="text-navy" />
        <span>Groups ({groups.length})</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 pl-1">
          {groupRows.map((g) => {
            const pct = g.students.length > 0 ? Math.round((g.started / g.students.length) * 100) : 0;
            return (
              <div key={g.name} className="p-2.5 rounded-lg border border-border/50 bg-border/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="text-[12px] font-semibold text-text-primary">
                    👥 {g.name} ({g.students.length} students)
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden max-w-[140px]">
                    <div
                      className="h-full rounded-full bg-teal transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-text-secondary">
                    {g.started}/{g.students.length} started, {g.chats} chats
                  </span>
                </div>
                {g.highChatLowCompletion && (
                  <p className="text-[11px] text-teal mt-1">
                    High discussion, low completion — may need guidance
                  </p>
                )}
              </div>
            );
          })}

          {ungroupedCount > 0 && (
            <div className="p-2.5 rounded-lg border border-border/50 bg-border/5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-gray-400" />
                <span className="text-[12px] font-semibold text-text-primary">
                  👥 Ungrouped ({ungroupedCount} students)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden max-w-[140px]">
                  <div
                    className="h-full rounded-full bg-gray-400 transition-all"
                    style={{ width: `${ungroupedCount > 0 ? Math.round((Math.max(0, ungroupedStarted) / ungroupedCount) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-[11px] text-text-secondary">
                  {Math.max(0, ungroupedStarted)}/{ungroupedCount} started, {Math.max(0, ungroupedChats)} chats
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Inner Page Content ─── */

function ClassDetailsContent() {
  const searchParams = useSearchParams();
  // Sidebar sends ?classId=... while older links send ?class=... — accept both.
  const classId = searchParams.get('class') || searchParams.get('classId');

  // Real data state
  const [classData, setClassData] = useState<ClassDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from Supabase via API route
  useEffect(() => {
    if (!classId) {
      setLoading(false);
      return;
    }

    async function fetchClassDetails() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login'; return;
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/teacher/class-details?classId=${classId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || 'Failed to load class');
          setLoading(false);
          return;
        }

        const data: ClassDetailsResponse = await res.json();
        setClassData(data);
      } catch (err) {
        console.error('Failed to fetch class details:', err);
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    }

    fetchClassDetails();
  }, [classId]);

  // Map assignments to activity format
  const rawActivities = useMemo(() => {
    if (!classData) return [];
    return classData.assignments.map((a: any) => ({
      id: a.id,
      name: a.title,
      defaultOpen: a.is_open ?? true,
      due_date: a.due_date ?? null,
      progress: 0,
      total: classData.studentCount,
      progressLabel: 'started',
      chats: 0,
    }));
  }, [classData]);

  const [activityStates, setActivityStates] = useState<Record<string, boolean>>({});

  // Initialize activity states when rawActivities change
  useEffect(() => {
    if (rawActivities.length > 0) {
      setActivityStates((prev) => {
        const initial: Record<string, boolean> = { ...prev };
        rawActivities.forEach((a) => {
          if (!(a.name in initial)) {
            initial[a.name] = a.defaultOpen;
          }
        });
        return initial;
      });
    }
  }, [rawActivities]);

  // Feature 1: Activity filter
  const [activityFilter, setActivityFilter] = useState<'all' | 'open' | 'closed'>('all');

  // Feature 3: Peer chat states
  const [peerChatStates, setPeerChatStates] = useState<Record<string, boolean>>({});

  // Feature 2: Message modal
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Feature 5: Add activity modal
  const [showAddModal, setShowAddModal] = useState(false);

  const activities = useMemo(() =>
    rawActivities.map((a) => ({
      ...a,
      isOpen: activityStates[a.name] ?? a.defaultOpen,
      due_date: (a as any).due_date ?? null,
    })),
    [rawActivities, activityStates]
  );

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return activities;
    if (activityFilter === 'open') return activities.filter((a) => a.isOpen);
    return activities.filter((a) => !a.isOpen);
  }, [activities, activityFilter]);

  const toggleActivity = async (name: string) => {
    const activity = rawActivities.find(a => a.name === name);
    const currentState = activityStates[name] ?? activity?.defaultOpen ?? true;
    const newState = !currentState;
    setActivityStates((prev) => ({ ...prev, [name]: newState }));
    // Persist to database
    if (activity && classData) {
      try {
        await fetch('/api/teacher/class-activities', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: classData.class.id,
            activityId: (activity as any).id,
            is_open: newState,
          }),
        });
      } catch (err) {
        console.error('Failed to persist activity state:', err);
      }
    }
  };

  const togglePeerChat = (name: string) => {
    setPeerChatStates((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const closeMessageModal = useCallback(() => setShowMessageModal(false), []);
  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-text-secondary">Loading class details...</div>
      </div>
    );
  }

  // Not found / error state
  if (!classData || error) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3 opacity-40">📚</div>
        <h2 className="font-heading font-bold text-lg text-text-primary mb-1">Class not found</h2>
        <p className="text-sm text-text-secondary mb-5">
          {error || "The class you're looking for doesn't exist or the URL is incorrect."}
        </p>
        <Link
          href="/teacher/my-classes"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-navy text-white font-heading font-semibold text-sm"
        >
          Back to My Classes
        </Link>
      </div>
    );
  }

  const cls = classData.class;
  const activeCount = activities.filter((a) => a.isOpen).length;
  const totalChats = activities.reduce((sum, a) => sum + a.chats, 0);

  // Map real students to display format, separating pending from active
  const pendingStudents = classData.students.filter((s: any) => s.enrollment_status === 'pending');
  const activeStudents = classData.students.filter((s: any) => s.enrollment_status !== 'pending');
  const studentsToShow = activeStudents.slice(0, 10).map((s, i) => ({
    name: s.display_name || 'Unknown Student',
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    lastActive: s.enrolled_at ? `Joined ${new Date(s.enrolled_at).toLocaleDateString()}` : 'Active',
    status: 'active' as const,
  }));

  const FILTER_OPTIONS: { label: string; value: 'all' | 'open' | 'closed' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' },
  ];

  return (
    <div>
      {/* ─── 1. Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <ClassIcon name={cls.name} icon={cls.icon} size={48} iconSize={24} />
          <div>
            <h1 className="font-heading text-[26px] font-bold text-text-primary">{cls.name}</h1>
            <p className="text-[14px] text-text-secondary mt-0.5">
              {cls.grade_level ? `Grade ${cls.grade_level} · ` : ''}{cls.subject || 'General'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal/8 border border-teal/20 rounded-lg font-heading font-bold text-base tracking-[2px] text-teal ml-2">
            {cls.join_code}
          </div>
        </div>
        <Link
          href={`/teacher/edit-class?class=${classId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 border-[1.5px] border-border rounded-lg text-sm font-medium text-text-secondary hover:border-navy hover:text-navy transition-colors self-start"
        >
          <PencilSimple size={15} /> Edit Class
        </Link>
      </div>

      {/* ─── 2. Stats Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Students', value: classData.studentCount, icon: Users },
          { label: 'Active Activities', value: classData.assignmentCount, icon: Lightning },
          { label: 'Total Chats', value: totalChats, icon: ChatText },
          { label: 'Avg Engagement', value: '—', icon: ChartBar },
        ].map((stat) => (
          <div key={stat.label} className="bg-card-bg border border-border rounded-[16px] p-5 text-center">
            <div className="flex justify-center mb-2">
              <stat.icon size={20} weight="fill" className="text-teal" />
            </div>
            <div className="font-heading font-bold text-[24px] text-teal">{stat.value}</div>
            <div className="text-[12px] text-text-secondary uppercase tracking-[0.5px] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── 3. Activities Section ─── */}
      <div className="bg-card-bg border border-border rounded-[20px] p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
            <BookOpen size={20} weight="fill" className="text-navy" />
            Activities
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal text-navy rounded-lg text-xs font-semibold hover:bg-teal/90 transition-colors"
          >
            <Plus size={13} weight="bold" /> Add Activity
          </button>
        </div>

        {/* Feature 1: Filter Pills */}
        <div className="flex items-center gap-2 mb-4">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActivityFilter(opt.value)}
              className={`px-4 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${
                activityFilter === opt.value
                  ? 'bg-navy text-white border-navy'
                  : 'border-border text-text-secondary hover:border-navy hover:text-navy'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            {activities.length === 0 ? 'No activities yet. Add one to get started!' : 'No activities match this filter.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity, idx) => {
              const pct = activity.total > 0 ? Math.round((activity.progress / activity.total) * 100) : 0;
              const peerChatOn = peerChatStates[activity.name] ?? false;
              return (
                <div key={activity.name}>
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border border-border hover:bg-border/10 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="font-heading font-semibold text-[15px] text-text-primary truncate">
                          {activity.name}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${
                            activity.isOpen
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-gray-400/10 text-gray-500'
                          }`}
                        >
                          {activity.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden max-w-[200px]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              activity.isOpen ? 'bg-teal' : 'bg-gray-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[12px] text-text-secondary whitespace-nowrap">
                          {activity.progress}/{activity.total} {activity.progressLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[12px] text-text-secondary flex items-center gap-1">
                        <ChatText size={13} className="text-navy" /> {activity.chats} chats
                      </span>

                      {/* Due Date Picker */}
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-text-secondary whitespace-nowrap">Due:</label>
                        <input
                          type="date"
                          defaultValue={(activity as any).due_date ? (activity as any).due_date.slice(0, 10) : ''}
                          onChange={async (e) => {
                            const due_date = e.target.value || null;
                            if (classData) {
                              await fetch('/api/teacher/class-activities', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  classId: classData.class.id,
                                  activityId: (activity as any).id,
                                  due_date,
                                }),
                              });
                            }
                          }}
                          className="text-[11px] bg-transparent border border-border rounded-md px-2 py-1
                            text-text-secondary focus:outline-none focus:border-teal cursor-pointer
                            [color-scheme:dark]"
                        />
                      </div>

                      {/* Feature 3: Peer Chat Toggle */}
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${peerChatOn ? 'bg-teal/10' : ''}`}>
                        <span className="text-[11px] text-text-secondary whitespace-nowrap">💬 Peer Chat</span>
                        <ToggleSwitch
                          checked={peerChatOn}
                          onChange={() => togglePeerChat(activity.name)}
                        />
                      </div>

                      <ToggleSwitch
                        checked={activity.isOpen}
                        onChange={() => toggleActivity(activity.name)}
                      />
                    </div>
                  </div>

                  {/* Feature 4: Group Breakdown */}
                  {classId && (
                    <div className="px-4 pb-1">
                      <GroupBreakdown
                        classId={classId}
                        activity={activity}
                        defaultExpanded={idx === 0}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 4. Student Roster + 5. Recent Activity (side by side on desktop) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Student Roster */}
        <div className="bg-card-bg border border-border rounded-[20px] p-6">
          {/* Pending Approvals */}
          {pendingStudents.length > 0 && (
            <div className="mb-5 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <h3 className="font-heading font-bold text-sm text-amber-400 flex items-center gap-2 mb-3">
                ⏳ Pending Approval ({pendingStudents.length})
              </h3>
              <div className="space-y-2">
                {pendingStudents.map((s: any, i: number) => (
                  <div key={s.id || i} className="flex items-center gap-3 p-2.5 rounded-lg bg-card-bg/50">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-heading font-bold text-xs shrink-0 bg-amber-500/60"
                    >
                      {(s.display_name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-text-primary truncate">{s.display_name || 'Unknown'}</div>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch('/api/teacher/enrollment', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ enrollmentId: s.enrollment_id, action: 'approve' }),
                        });
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-teal text-navy rounded-lg hover:bg-teal/80 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        await fetch('/api/teacher/enrollment', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ enrollmentId: s.enrollment_id, action: 'deny' }),
                        });
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Deny
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-5">
            <Student size={20} weight="fill" className="text-navy" />
            Students
            <span className="text-sm font-normal text-text-secondary ml-1">({classData.studentCount})</span>
          </h2>

          {studentsToShow.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">
              No students enrolled yet. Share the join code to get started!
            </div>
          ) : (
            <div className="space-y-2.5">
              {studentsToShow.map((student) => (
                <div
                  key={student.name}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-border/10 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-heading font-bold text-[13px] shrink-0"
                    style={{ backgroundColor: student.color }}
                  >
                    {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-[14px] text-text-primary truncate">
                      {student.name}
                    </div>
                    <div className="text-[12px] text-text-secondary flex items-center gap-1.5">
                      <Clock size={11} /> {student.lastActive}
                    </div>
                  </div>
                  <StatusDot status={student.status} />
                </div>
              ))}
            </div>
          )}

          {classData.studentCount > 10 && (
            <Link
              href={`/teacher/students?class=${classId}`}
              className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-border text-sm font-medium text-teal hover:text-teal/80 transition-colors"
            >
              View All Students <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-card-bg border border-border rounded-[20px] p-6">
          <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-5">
            <Lightning size={20} weight="fill" className="text-navy" />
            Recent Activity
          </h2>

          <div className="space-y-1">
            {RECENT_FEED.map((event, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-border/10 transition-colors"
              >
                <FeedIcon type={event.icon} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] leading-snug ${
                    event.icon === 'ai' ? 'text-teal font-medium' : 'text-text-primary'
                  }`}>
                    {event.text}
                  </p>
                  {event.time && <span className="text-[11px] text-text-secondary">{event.time}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 6. Quick Actions ─── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowMessageModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 border-[1.5px] border-border rounded-xl font-heading font-bold text-sm text-text-secondary hover:border-navy hover:text-navy transition-colors"
        >
          <EnvelopeSimple size={16} /> Message All Students
        </button>
      </div>

      {/* ─── Modals ─── */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={closeMessageModal}
        className={cls.name}
        studentCount={classData.studentCount}
      />
      <AddActivityModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        className={cls.name}
        classId={cls.id}
        classIndex={0}
        onActivityAdded={() => {
          // Refresh class data
          window.location.reload();
        }}
      />
    </div>
  );
}

/* ─── Page (with Suspense boundary for useSearchParams) ─── */

export default function ClassDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-text-secondary">Loading class details...</div>
        </div>
      }
    >
      <ClassDetailsContent />
    </Suspense>
  );
}
