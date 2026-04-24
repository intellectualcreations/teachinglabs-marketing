'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest,
  ChatsCircle, ClipboardText, ChatText, Trophy, ChartBar,
  ClockCounterClockwise,
  PencilLine, Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, Bank, MapTrifold, Translate, Basketball, PersonSimpleRun, Books, MaskHappy,
  Heartbeat, Leaf, Robot, Ruler, Target, Lightbulb, Star, HouseSimple,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Class, Assignment, Submission, ChatMessage } from '@/lib/supabase/types';
import { authFetch } from '@/lib/api-fetch';

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

const ACTIVITY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ClassPage() {
  const params = useParams();
  const classId = params.id as string;
  const [cls, setCls] = useState<Class | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({ chatSessions: 0, activitiesComplete: 0, messagesSent: 0 });
  const [activityValues, setActivityValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [activityRange, setActivityRange] = useState<'week' | 'custom'>('week');
  const [recentActivity, setRecentActivity] = useState<{ text: string; time: string; color: string }[]>([]);

  // Bar animation
  const barsRef = useRef<HTMLDivElement>(null);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const ref = barsRef.current;
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setBarsVisible(true);
    }, { threshold: 0.3 });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get auth headers
        let authHeaders: Record<string, string> = {};
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          if (sess?.access_token) authHeaders = { 'Authorization': `Bearer ${sess.access_token}` };
        } catch { /* ignore */ }

        // Fetch classes + assignments + submissions
        const classRes = await authFetch(`/api/student/my-classes?userId=${user.id}`, { headers: authHeaders });
        if (!classRes.ok) return;
        const classJson = await classRes.json();

        const classRows = (classJson.classes ?? []) as Class[];
        const teachers = (classJson.teachers ?? []) as { id: string; preferred_name?: string; display_name?: string }[];
        const assignments = (classJson.assignments ?? []) as Assignment[];
        const submissions = (classJson.submissions ?? []) as Submission[];

        // Find this class
        const classData = classRows.find(c => c.id === classId);
        if (!classData) return;
        setCls(classData);

        // Teacher name
        const teacher = teachers.find(t => t.id === classData.teacher_id);
        if (teacher) {
          setTeacherName(teacher.preferred_name || teacher.display_name || 'Teacher');
        }

        // Get chat messages for THIS class only
        const { data: chatData } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('class_id', classId)
          .or(`sender_id.eq.${user.id},message_type.eq.ai`)
          .order('created_at', { ascending: false })
          .limit(200);

        const chatMessages = (chatData ?? []) as unknown as ChatMessage[];
        const studentMessages = chatMessages.filter(m => m.sender_id === user.id && m.message_type === 'student');

        // Stats for THIS class only
        const classAssignments = assignments.filter(a => a.class_id === classId);
        const submittedIds = new Set(submissions.map(s => s.assignment_id));
        const completedActivities = classAssignments.filter(a => submittedIds.has(a.id)).length;

        // Chat sessions: count unique days with chat activity
        const uniqueChatDays = new Set(studentMessages.map(m => new Date(m.created_at).toDateString()));

        setStats({
          chatSessions: uniqueChatDays.size,
          activitiesComplete: completedActivities,
          messagesSent: studentMessages.length,
        });

        // Activity chart (this week, this class only)
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

        // Recent activity for this class
        const recentItems: { text: string; time: string; color: string; date: Date }[] = [];
        const recentChats = chatMessages.filter(m => m.sender_id === user.id).slice(0, 5);
        for (const msg of recentChats) {
          recentItems.push({
            text: `Chatted in ${classData.name}`,
            time: timeAgo(msg.created_at),
            color: '#4FA3A5',
            date: new Date(msg.created_at),
          });
        }
        for (const sub of submissions.filter(s => classAssignments.some(a => a.id === s.assignment_id)).slice(0, 5)) {
          const assignment = classAssignments.find(a => a.id === sub.assignment_id);
          recentItems.push({
            text: `Completed ${assignment?.title || 'activity'}`,
            time: timeAgo(sub.submitted_at),
            color: '#10B981',
            date: new Date(sub.submitted_at),
          });
        }
        recentItems.sort((a, b) => b.date.getTime() - a.date.getTime());
        setRecentActivity(recentItems.slice(0, 5).map(({ text, time, color }) => ({ text, time, color })));

      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

  const chartMax = Math.max(...activityValues, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-text-secondary">Class not found.</p>
      </div>
    );
  }

  const iconInfo = getIconForClass(cls.icon);
  const ClassIconComponent = iconInfo.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Class Header */}
      <div className="bg-card-bg rounded-2xl border border-border p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${iconInfo.bg}, #4FA3A5)` }} />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: iconInfo.bg }}>
            <ClassIconComponent size={28} weight="fill" className="text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">{cls.name}</h1>
            <p className="text-sm text-text-secondary">{teacherName}</p>
          </div>
        </div>
        {cls.description && (
          <p className="text-sm text-text-secondary mt-3">{cls.description}</p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
        {[
          { label: 'Chat Sessions', value: stats.chatSessions, Icon: ChatsCircle, color: '#4FA3A5' },
          { label: 'Activities Complete', value: stats.activitiesComplete, Icon: ClipboardText, color: '#1F3A5F' },
          { label: 'Messages Sent', value: stats.messagesSent, Icon: ChatText, color: '#8B5CF6' },
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

      {/* Two column: chart + badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Activity chart */}
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-heading font-bold text-sm text-text-primary">
              <ChartBar size={16} weight="fill" className="text-teal" />
              Activity
            </div>
            <select
              value={activityRange}
              onChange={(e) => setActivityRange(e.target.value as 'week' | 'custom')}
              className="text-xs bg-surface border border-border rounded-lg px-2 py-1 text-text-secondary focus:outline-none"
            >
              <option value="week">This Week</option>
            </select>
          </div>
          {chartMax > 0 && activityValues.some(v => v > 0) ? (
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
            <div className="flex items-end gap-2 h-[120px]" ref={barsRef}>
              {ACTIVITY_DAYS.map((day) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-t min-h-1" style={{ height: '4px', background: '#E5E7EB' }} />
                  <span className="text-[10px] text-text-muted font-medium">{day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
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
    </div>
  );
}
