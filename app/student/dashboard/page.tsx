'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  SquaresFour, BookOpenText, MathOperations, Flask, GlobeHemisphereWest,
  ChatsCircle, ClipboardText, ChatText, Trophy, ChartBar,
  ClockCounterClockwise, HandWaving, HouseSimple, List, X,
  Backpack, VideoCamera, ArrowSquareOut, Calendar, CurrencyDollar,
  PencilLine, Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, Bank, MapTrifold, Translate, Basketball, PersonSimpleRun, Books, MaskHappy,
  Heartbeat, Leaf, Robot, Ruler, Target, Lightbulb, Star,
} from '@phosphor-icons/react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';
import NotificationOptIn from '@/components/shared/NotificationOptIn';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Class, Enrollment, Assignment, Submission, ChatMessage } from '@/lib/supabase/types';

// Map subjects to icons/colors for visual consistency
const SUBJECT_STYLES: Record<string, { Icon: typeof MathOperations; color: string }> = {
  math: { Icon: MathOperations, color: '#1F3A5F' },
  mathematics: { Icon: MathOperations, color: '#1F3A5F' },
  algebra: { Icon: MathOperations, color: '#1F3A5F' },
  science: { Icon: Flask, color: '#7C3AED' },
  biology: { Icon: Flask, color: '#7C3AED' },
  chemistry: { Icon: Flask, color: '#7C3AED' },
  physics: { Icon: Flask, color: '#7C3AED' },
  english: { Icon: BookOpenText, color: '#4FA3A5' },
  ela: { Icon: BookOpenText, color: '#4FA3A5' },
  reading: { Icon: BookOpenText, color: '#4FA3A5' },
  writing: { Icon: BookOpenText, color: '#4FA3A5' },
  social: { Icon: GlobeHemisphereWest, color: '#0891B2' },
  history: { Icon: GlobeHemisphereWest, color: '#0891B2' },
  geography: { Icon: GlobeHemisphereWest, color: '#0891B2' },
};

function getSubjectStyle(subject: string | null) {
  if (!subject) return { Icon: BookOpenText, color: '#4FA3A5' };
  const key = subject.toLowerCase();
  for (const [k, v] of Object.entries(SUBJECT_STYLES)) {
    if (key.includes(k)) return v;
  }
  return { Icon: BookOpenText, color: '#4FA3A5' };
}

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

function getIconForClass(iconVal: string | null, subject: string | null) {
  if (iconVal && ICON_MAP[iconVal]) return ICON_MAP[iconVal];
  // Fallback to subject-based
  const style = getSubjectStyle(subject);
  return { icon: style.Icon, bg: style.color };
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

/* ─── Join Class Inline ──────────────────────────────────────────────────── */
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
      // Get access token from client-side session to pass to API
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

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
        <p className="text-sm font-semibold text-green-600">You're in! Loading your class...</p>
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [activityRange, setActivityRange] = useState<'week' | 'custom'>('week');
  const [activityStartDate, setActivityStartDate] = useState('');
  const [activityEndDate, setActivityEndDate] = useState('');

  // Real data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentInitials, setStudentInitials] = useState('');
  const [classes, setClasses] = useState<EnrichedClass[]>([]);
  const [stats, setStats] = useState({ chatSessions: 0, activitiesComplete: 0, personalChats: 0 });
  const [activityValues, setActivityValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [recentActivity, setRecentActivity] = useState<{ text: string; time: string; color: string }[]>([]);

  // Onboarding redirect check: localStorage first, then DB fallback
  useEffect(() => {
    const onboarded = localStorage.getItem('teachinglabs_onboarded');
    if (onboarded) {
      setOnboardingChecked(true);
      return;
    }
    // Check database for completed assessment
    async function checkAssessment() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/login'); return; }
        const { data: assessment } = await supabase
          .from('student_assessments')
          .select('completed_at')
          .eq('student_id', user.id)
          .single() as { data: { completed_at: string | null } | null };
        if (assessment?.completed_at) {
          // Assessment exists in DB — set localStorage and continue
          localStorage.setItem('teachinglabs_onboarded', 'true');
          setOnboardingChecked(true);
        } else {
          router.replace('/student/onboarding');
        }
      } catch {
        // Table missing or error — send to onboarding
        router.replace('/student/onboarding');
      }
    }
    checkAssessment();
  }, [router]);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Fetch real data from Supabase
  useEffect(() => {
    if (!onboardingChecked) return;

    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const profile = profileData as unknown as Profile | null;

        // Try to get preferred name from student_assessments
        let preferredName = '';
        try {
          const { data: assessmentData } = await supabase
            .from('student_assessments')
            .select('preferred_name')
            .eq('student_id', user.id)
            .single();
          if (assessmentData && (assessmentData as { preferred_name?: string }).preferred_name) {
            preferredName = (assessmentData as { preferred_name: string }).preferred_name;
          }
        } catch { /* table may not exist */ }

        const displayName = preferredName || profile?.display_name || 'Student';
        setStudentName(displayName.split(' ')[0]);
        setStudentInitials(getInitials(displayName));

        // Fetch classes via admin API (bypasses RLS)
        // getUser works (it makes a server call), but getSession may be empty
        // Try to get the session token; if unavailable, pass userId for admin verification
        let authHeaders: Record<string, string> = {};
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          if (sess?.access_token) {
            authHeaders = { 'Authorization': `Bearer ${sess.access_token}` };
          }
        } catch { /* session may not be available */ }
        const classRes = await fetch(`/api/student/my-classes?userId=${user.id}`, {
          headers: authHeaders,
        });
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

        // Fetch chat messages for this student across all classes
        const { data: chatData } = await supabase
          .from('chat_messages')
          .select('*')
          .in('class_id', classIds)
          .or(`sender_id.eq.${user.id},message_type.eq.ai`)
          .order('created_at', { ascending: false })
          .limit(100);

        const chatMessages = (chatData ?? []) as unknown as ChatMessage[];

        // Build enriched classes
        const enrichedClasses: EnrichedClass[] = classRows.map(cls => {
          const iconInfo = getIconForClass(cls.icon, cls.subject);
          const teacher = teacherMap.get(cls.teacher_id);
          const teacher2 = teacher as (Profile & { email?: string }) | undefined;
          const teacherName = (teacher2 as { preferred_name?: string })?.preferred_name || teacher2?.display_name || teacher2?.email?.split('@')[0] || 'Teacher';
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

        // Compute stats
        const studentMessages = chatMessages.filter(m => m.sender_id === user.id && m.message_type === 'student');
        const uniqueChatDays = new Set(studentMessages.map(m => new Date(m.created_at).toDateString()));
        setStats({
          chatSessions: uniqueChatDays.size,
          activitiesComplete: submissions.length,
          personalChats: studentMessages.length,
        });

        // Activity chart: count student messages per day for last 7 days
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

        // Recent activity: combine recent chat messages and submissions
        const recentItems: { text: string; time: string; color: string; date: Date }[] = [];

        // Recent chat messages
        const recentChats = chatMessages.filter(m => m.sender_id === user.id).slice(0, 5);
        for (const msg of recentChats) {
          const cls = classRows.find(c => c.id === msg.class_id);
          recentItems.push({
            text: `Chatted in ${cls?.name || 'class'}`,
            time: timeAgo(msg.created_at),
            color: '#4FA3A5',
            date: new Date(msg.created_at),
          });
        }

        // Recent submissions
        for (const sub of submissions.slice(0, 5)) {
          const assignment = assignments.find(a => a.id === sub.assignment_id);
          recentItems.push({
            text: `Turned in ${assignment?.title || 'assignment'}`,
            time: timeAgo(sub.submitted_at),
            color: '#10B981',
            date: new Date(sub.submitted_at),
          });
        }

        // Sort by date and take top 5
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
  }, [onboardingChecked, router]);

  if (!onboardingChecked) {
    return null;
  }

  const chartMax = Math.max(...activityValues, 1);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-teal border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-warm-white">
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
            <div className="text-xs text-white/50">{studentName ? `${studentName}'s Learning Portal` : 'Learning Portal'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-2 py-2 border-b border-white/10 space-y-1">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-teal text-navy font-semibold text-sm hover:bg-teal/90 transition-colors"
          >
            <SquaresFour size={18} weight="fill" />
            Dashboard
          </Link>
          <Link
            href="/student/analytics"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/60 font-semibold text-sm hover:bg-white/10 hover:text-white transition-colors"
          >
            <ChartBar size={18} weight="fill" />
            Analytics
          </Link>
          <Link
            href="/student/messages"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/60 font-semibold text-sm hover:bg-white/10 hover:text-white transition-colors"
          >
            <ChatText size={18} weight="fill" />
            Messages
          </Link>
          <Link
            href="/student/subscription"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/60 font-semibold text-sm hover:bg-white/10 hover:text-white transition-colors"
          >
            <CurrencyDollar size={18} weight="fill" />
            Subscription
          </Link>
        </nav>

        {/* Classes */}
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-4 pb-2 flex items-center gap-1.5">
            <BookOpenText size={12} weight="fill" className="text-white/40" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-white/50">My Classes</span>
          </div>
          {classes.length === 0 ? (
            <div className="px-4 py-3 text-xs text-white/40">No classes yet</div>
          ) : (
            classes.map(cls => (
              <Link
                key={cls.id}
                href={`/student/main?class=${cls.id}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-white/[0.12] transition-colors text-white/70 hover:text-white"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: cls.avatarColor }}>
                  <cls.Icon size={16} weight="fill" className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate text-white">{cls.name}</div>

                </div>
              </Link>
            ))
          )}
        </div>

        {/* Student footer */}
        <div className="border-t border-white/10 p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-heading font-bold text-xs flex-shrink-0">{studentInitials}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs text-white">{studentName}</div>
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
            <h1 className="font-heading font-bold text-xl text-text-primary">Hi {studentName}!</h1>
          </div>
          {classes.length > 0 ? (
            <>
              <p className="text-sm text-text-secondary">
                You&apos;re enrolled in <strong className="text-text-primary">{classes.length} class{classes.length !== 1 ? 'es' : ''}</strong>. Click on a class to get started.
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-teal">
                <HouseSimple size={14} weight="fill" />
                Pick a class to start chatting, view lessons, or explore on your own
              </div>
            </>
          ) : (
            <JoinClassInline onJoined={() => window.location.reload()} />
          )}
        </div>

        {/* Push notification opt-in */}
        <div className="mb-6">
          <NotificationOptIn />
        </div>

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
                  <div className="mt-3 text-xs font-heading font-bold text-teal group-hover:text-navy transition-colors">
                    Continue →
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
                      <input
                        type="date"
                        value={activityStartDate}
                        onChange={(e) => setActivityStartDate(e.target.value)}
                        className="text-xs bg-surface border border-border rounded-lg px-2 py-1 text-text-secondary focus:outline-none"
                      />
                      <span className="text-xs text-text-muted">to</span>
                      <input
                        type="date"
                        value={activityEndDate}
                        onChange={(e) => setActivityEndDate(e.target.value)}
                        className="text-xs bg-surface border border-border rounded-lg px-2 py-1 text-text-secondary focus:outline-none"
                      />
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
                          style={{
                            height: barsVisible ? `${Math.max(h, 4)}%` : '4px',
                            background: val > 0 ? color : '#E5E7EB',
                          }}
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
      </main>
    </div>
  );
}
