'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest,
  ChatsCircle, ClipboardText, ChatText, Trophy, ChartBar,
  ClockCounterClockwise, HandWaving, HouseSimple,
  Backpack, PencilLine, Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, Bank, MapTrifold, Translate, Basketball, PersonSimpleRun, Books, MaskHappy,
  Heartbeat, Leaf, Robot, Ruler, Target, Lightbulb, Star, Sparkle,
} from '@phosphor-icons/react';
import Link from 'next/link';
import NotificationOptIn from '@/components/shared/NotificationOptIn';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Class, Assignment, Submission, ChatMessage } from '@/lib/supabase/types';

/* ─── Subject styles for class cards ─── */
const ICON_MAP: Record<string, { icon: typeof MathOperations; bg: string }> = {
  math: { icon: MathOperations, bg: '#1F3A5F' },
  reading: { icon: BookOpenText, bg: '#4FA3A5' },
  science: { icon: Flask, bg: '#7C3AED' },
  social: { icon: GlobeHemisphereWest, bg: '#0891B2' },
  writing: { icon: PencilLine, bg: '#E8836B' },
  art: { icon: Palette, bg: '#EC4899' },
  music: { icon: MusicNotes, bg: '#8B5CF6' },
  cs: { icon: Desktop, bg: '#334155' },
  algebra: { icon: Calculator, bg: '#1F3A5F' },
  ela: { icon: Article, bg: '#4FA3A5' },
  chem: { icon: TestTube, bg: '#059669' },
  astro: { icon: Planet, bg: '#6366F1' },
  bio: { icon: Dna, bg: '#10B981' },
  stats: { icon: ChartBar, bg: '#F59E0B' },
  history: { icon: Bank, bg: '#92400E' },
  geo: { icon: MapTrifold, bg: '#0D9488' },
  spanish: { icon: Translate, bg: '#DC2626' },
  french: { icon: ChatsCircle, bg: '#2563EB' },
  pe: { icon: Basketball, bg: '#EA580C' },
  fitness: { icon: PersonSimpleRun, bg: '#D97706' },
  library: { icon: Books, bg: '#7C3AED' },
  drama: { icon: MaskHappy, bg: '#BE185D' },
  health: { icon: Heartbeat, bg: '#DC2626' },
  env: { icon: Leaf, bg: '#059669' },
  robotics: { icon: Robot, bg: '#475569' },
  geometry: { icon: Ruler, bg: '#1F3A5F' },
  focus: { icon: Target, bg: '#E8836B' },
  ideas: { icon: Lightbulb, bg: '#F59E0B' },
  star: { icon: Star, bg: '#4FA3A5' },
  homeroom: { icon: HouseSimple, bg: '#64748B' },
};

function getIconForClass(iconVal: string | null) {
  if (iconVal && ICON_MAP[iconVal]) return ICON_MAP[iconVal];
  return { icon: Lightbulb, bg: '#F59E0B' };
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface EnrichedClass {
  id: string;
  name: string;
  subject: string | null;
  iconVal: string | null;
  teacherName: string;
  initials: string;
  avatarColor: string;
  Icon: typeof MathOperations;
  color: string;
  assignmentCount: number;
  completedAssignments: number;
  progress: number;
}

const ACTIVITY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ─── Join Class Inline ─── */
function JoinClassInline({ onJoined }: { onJoined: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleJoin = useCallback(async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      // Refresh session first to ensure we have a valid token
      const { data: { session: refreshed } } = await supabase.auth.refreshSession();
      let accessToken = refreshed?.access_token;
      // Fallback to getSession if refresh didn't return a token
      if (!accessToken) {
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token;
      }

      const res = await fetch('/api/student/join-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ joinCode: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409) setError(`You're already in that class!`);
        else setError(json.error ?? 'Invalid class code. Check with your teacher and try again.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => onJoined(), 1200);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [code, onJoined]);

  if (success) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <Backpack size={32} weight="fill" className="text-green-500" />
        </div>
        <p className="text-sm font-semibold text-green-600">You&apos;re in! Loading your class...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mb-4">
        <Backpack size={32} weight="fill" className="text-teal/60" />
      </div>
      <p className="text-sm text-text-secondary max-w-xs mb-3">
        You&apos;re all set! Enter your class code to join.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="CLASS CODE"
          maxLength={10}
          className="w-32 px-3 py-2 border-2 border-border rounded-lg text-center text-sm font-heading font-bold tracking-widest bg-surface text-text-primary uppercase focus:border-teal outline-none"
        />
        <button
          onClick={handleJoin}
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-heading font-semibold hover:bg-[#162D48] transition-colors disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const barsRef = useRef<HTMLDivElement>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const [activityRange, setActivityRange] = useState<'week' | 'custom'>('week');
  const [activityStartDate, setActivityStartDate] = useState('');
  const [activityEndDate, setActivityEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [superpowerTitle, setSuperpowerTitle] = useState('');
  const [superpowerAvatar, setSuperpowerAvatar] = useState('');
  const [classes, setClasses] = useState<EnrichedClass[]>([]);
  const [stats, setStats] = useState({ chatSessions: 0, activitiesComplete: 0, personalChats: 0 });
  const [activityValues, setActivityValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [recentActivity, setRecentActivity] = useState<{ text: string; time: string; color: string }[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Fetch profile via API (bypasses RLS)
        let profile: { preferred_name?: string; display_name?: string; superpower_title?: string; superpower_avatar?: string; primary_intelligence?: string } | null = null;
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          if (sess?.access_token) {
            const profRes = await fetch('/api/student/profile', {
              headers: { 'Authorization': `Bearer ${sess.access_token}` },
            });
            if (profRes.ok) profile = await profRes.json();
          }
        } catch { /* ignore */ }

        // Fall back to direct read if API failed
        if (!profile) {
          const { data: pd } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          profile = pd as typeof profile;
        }

        const displayName = profile?.preferred_name || profile?.display_name || 'Student';
        setSuperpowerTitle(profile?.superpower_title || '');
        setSuperpowerAvatar(profile?.superpower_avatar || '');
        setStudentName(displayName.split(' ')[0]);

        // Fetch classes
        let authHeaders: Record<string, string> = {};
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          if (sess?.access_token) {
            authHeaders = { 'Authorization': `Bearer ${sess.access_token}` };
          }
        } catch { /* session may not be available */ }

        const classRes = await fetch(`/api/student/my-classes?userId=${user.id}`, { headers: authHeaders });
        const classJson = classRes.ok ? await classRes.json() : { classes: [], teachers: [], assignments: [], submissions: [] };

        const classRows = (classJson.classes ?? []) as Class[];
        const teachers = (classJson.teachers ?? []) as (Profile & { email?: string })[];
        const assignments = (classJson.assignments ?? []) as Assignment[];
        const submissions = (classJson.submissions ?? []) as Submission[];

        if (classRows.length === 0) {
          setClasses([]);
          setLoading(false);
          return;
        }

        const classIds = classRows.map((c: Class) => c.id);
        const teacherMap = new Map(teachers.map(t => [t.id, t]));
        const submittedAssignmentIds = new Set(submissions.map(s => s.assignment_id));

        const { data: chatData } = await supabase
          .from('chat_messages')
          .select('*')
          .in('class_id', classIds)
          .or(`sender_id.eq.${user.id},message_type.eq.ai`)
          .order('created_at', { ascending: false })
          .limit(100);

        const chatMessages = (chatData ?? []) as unknown as ChatMessage[];

        const enrichedClasses: EnrichedClass[] = classRows.map(cls => {
          const iconInfo = getIconForClass(cls.icon);
          const teacher = teacherMap.get(cls.teacher_id);
          const teacher2 = teacher as (Profile & { preferred_name?: string }) | undefined;
          const teacherName = teacher2?.preferred_name || teacher2?.display_name || 'Teacher';
          const classAssignments = assignments.filter(a => a.class_id === cls.id);
          const completedAssignments = classAssignments.filter(a => submittedAssignmentIds.has(a.id)).length;
          const totalAssignments = classAssignments.length;
          const progress = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

          return {
            id: cls.id,
            name: cls.name,
            subject: cls.subject,
            iconVal: cls.icon,
            teacherName,
            initials: getInitials(teacherName),
            avatarColor: iconInfo.bg,
            Icon: iconInfo.icon,
            color: iconInfo.bg,
            assignmentCount: totalAssignments,
            completedAssignments,
            progress,
          };
        });

        setClasses(enrichedClasses);

        const studentMessages = chatMessages.filter(m => m.sender_id === user.id && m.message_type === 'student');
        const uniqueChatDays = new Set(studentMessages.map(m => new Date(m.created_at).toDateString()));
        setStats({
          chatSessions: uniqueChatDays.size,
          activitiesComplete: submissions.length,
          personalChats: studentMessages.length,
        });

        const today = new Date();
        const dayValues: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toDateString();
          const count = studentMessages.filter(m => new Date(m.created_at).toDateString() === dateStr).length;
          dayValues.push(count);
        }
        setActivityValues(dayValues);

        const recentItems: { text: string; time: string; color: string; date: Date }[] = [];
        const recentChats = chatMessages.filter(m => m.sender_id === user.id).slice(0, 5);
        for (const msg of recentChats) {
          const cls = classRows.find(c => c.id === msg.class_id);
          recentItems.push({ text: `Chatted in ${cls?.name || 'class'}`, time: timeAgo(msg.created_at), color: '#4FA3A5', date: new Date(msg.created_at) });
        }
        for (const sub of submissions.slice(0, 5)) {
          const assignment = assignments.find(a => a.id === sub.assignment_id);
          recentItems.push({ text: `Turned in ${assignment?.title || 'assignment'}`, time: timeAgo(sub.submitted_at), color: '#10B981', date: new Date(sub.submitted_at) });
        }
        recentItems.sort((a, b) => b.date.getTime() - a.date.getTime());
        setRecentActivity(recentItems.slice(0, 5).map(({ text, time, color }) => ({ text, time, color })));

        setLoading(false);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Something went wrong loading your dashboard. Please try refreshing.');
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const chartMax = Math.max(...activityValues, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-teal border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm bg-card-bg border border-border rounded-2xl shadow-sm px-8 py-10">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="font-heading font-bold text-lg text-text-primary mb-2">Oops!</h2>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-teal text-navy rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome banner */}
      <div className="bg-card-bg border border-border rounded-[14px] px-7 py-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy to-teal" />
        <div className="flex items-center gap-2 mb-1">
          <HandWaving size={24} weight="fill" className="text-teal" />
          <div className="flex items-center gap-3">
            {superpowerAvatar && (
              <img src={superpowerAvatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30" />
            )}
            <h1 className="font-heading font-bold text-xl text-text-primary">Hi {studentName}{superpowerTitle ? ` ${superpowerTitle}` : ''}!</h1>
          </div>
        </div>
        {classes.length > 0 && (
          <>
            <p className="text-sm text-text-secondary">
              You&apos;re enrolled in <strong className="text-text-primary">{classes.length} class{classes.length !== 1 ? 'es' : ''}</strong>. Click on a class to get started.
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-teal">
              <HouseSimple size={14} weight="fill" />
              Pick a class to start chatting, view lessons, or explore on your own
            </div>
          </>
        )}
        <JoinClassInline onJoined={() => window.location.reload()} />
      </div>

      {/* Push notification opt-in */}
      <div className="mb-6">
        <NotificationOptIn />
      </div>

      {/* Profile setup prompt */}
      {!superpowerAvatar && (
        <Link
          href="/student/settings"
          className="flex items-center gap-3 p-4 mb-6 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/15 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkle size={20} weight="fill" className="text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-text-primary">Set up your profile ⚡</p>
            <p className="text-xs text-text-secondary">Choose your hero title and pick an avatar!</p>
          </div>
        </Link>
      )}

      {/* Class cards with progress */}
      {classes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {classes.map(cls => {
            const ClassIcon = cls.Icon;
            return (
              <Link
                key={cls.id}
                href={`/student/main?class=${cls.id}`}
                className="bg-card-bg border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cls.avatarColor }}>
                    <ClassIcon size={20} weight="fill" className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-sm text-text-primary truncate group-hover:text-teal transition-colors">{cls.name}</div>
                    <div className="text-xs text-text-secondary">{cls.teacherName}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                  <span>{cls.completedAssignments} of {cls.assignmentCount} assignments</span>
                  <span className="font-semibold text-text-primary">{cls.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-teal rounded-full transition-all duration-500" style={{ width: `${cls.progress}%` }} />
                </div>

              </Link>
            );
          })}
        </div>
      )}

      {/* Stats grid */}
      {classes.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
          {[
            { label: 'Chat Sessions', value: stats.chatSessions, Icon: ChatsCircle, color: '#4FA3A5' },
            { label: 'Activities Complete', value: stats.activitiesComplete, Icon: ClipboardText, color: '#1F3A5F' },
            { label: 'Messages Sent', value: stats.personalChats, Icon: ChatText, color: '#8B5CF6' },
          ].map(stat => (
            <div key={stat.label} className="bg-card-bg border border-border rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mx-auto mb-2.5" style={{ background: stat.color }}>
                <stat.Icon size={18} weight="fill" className="text-white" />
              </div>
              <div className="font-heading font-bold text-[26px] text-text-primary leading-none">{stat.value}</div>
              <div className="text-[11px] text-text-secondary font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Two column: chart + badges */}
      {classes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Activity chart */}
          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-heading font-bold text-sm text-text-primary">
                <ChartBar size={16} weight="fill" className="text-teal" />
                Activity
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={activityRange}
                  onChange={(e) => setActivityRange(e.target.value as 'week' | 'custom')}
                  className="text-xs bg-surface border border-border rounded-lg px-2 py-1 text-text-secondary focus:outline-none"
                >
                  <option value="week">This Week</option>
                  <option value="custom">Custom Range</option>
                </select>
                {activityRange === 'custom' && (
                  <>
                    <input type="date" value={activityStartDate} onChange={(e) => setActivityStartDate(e.target.value)} className="text-xs bg-surface border border-border rounded-lg px-2 py-1 text-text-secondary focus:outline-none" />
                    <span className="text-xs text-text-muted">to</span>
                    <input type="date" value={activityEndDate} onChange={(e) => setActivityEndDate(e.target.value)} className="text-xs bg-surface border border-border rounded-lg px-2 py-1 text-text-secondary focus:outline-none" />
                  </>
                )}
              </div>
            </div>
            {chartMax > 0 ? (
              <div className="flex items-end gap-2 h-[120px]" ref={barsRef}>
                {ACTIVITY_DAYS.map((day, i) => {
                  const val = activityValues[i];
                  const h = Math.round((val / chartMax) * 100);
                  const color = val > 5 ? '#4FA3A5' : val > 3 ? '#8FC4C5' : '#BFE0E1';
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full rounded-t min-h-1 transition-all duration-700"
                        style={{ height: barsVisible ? `${Math.max(h, 4)}%` : '4px', background: val > 0 ? color : '#E5E7EB' }}
                      />
                      <span className="text-[10px] text-text-muted font-medium">{day}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[120px] text-sm text-text-muted">
                No activity yet this week. Start chatting!
              </div>
            )}
          </div>

          {/* Badges (placeholder) */}
          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 font-heading font-bold text-sm text-text-primary mb-4">
              <Trophy size={16} weight="fill" className="text-warning" />
              Badges
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Trophy size={40} weight="fill" className="text-text-muted/30 mb-3" />
              <p className="text-sm text-text-muted">No badges earned yet — keep learning!</p>
              <p className="text-xs text-text-muted/70 mt-1">Complete activities and chat with your tutor to earn badges.</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 font-heading font-bold text-sm text-text-primary mb-4">
            <ClockCounterClockwise size={16} weight="fill" className="text-navy" />
            Recent Activity
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-teal/[0.04] transition-colors">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <div className="flex-1 text-sm text-text-primary">{item.text}</div>
                <div className="text-[11px] text-text-muted flex-shrink-0">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
