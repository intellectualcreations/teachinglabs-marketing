'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest,
  PencilLine, Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, Bank, MapTrifold, Translate, Basketball, PersonSimpleRun, Books, MaskHappy,
  Heartbeat, Leaf, Robot, Ruler, Target, Lightbulb, Star, HouseSimple,
  ChatsCircle, ClipboardText, ArrowSquareOut, ChartBar,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Class, Assignment, Submission } from '@/lib/supabase/types';

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

export default function ClassPage() {
  const params = useParams();
  const classId = params.id as string;
  const [cls, setCls] = useState<Class | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let authHeaders: Record<string, string> = {};
        try {
          const stored = localStorage.getItem('sb-auth-token');
          if (stored) {
            const sess = JSON.parse(stored);
            if (sess?.access_token) {
              authHeaders = { 'Authorization': `Bearer ${sess.access_token}` };
            }
          }
        } catch { /* ignore */ }

        const res = await fetch(`/api/student/my-classes?userId=${user.id}`, { headers: authHeaders });
        if (!res.ok) return;
        const data = await res.json();

        const classData = (data.classes ?? []).find((c: Class) => c.id === classId);
        if (!classData) return;
        setCls(classData);

        // Teacher name
        const teachers = data.teachers ?? [];
        const teacher = teachers.find((t: { id: string; preferred_name?: string; display_name?: string; email?: string }) => t.id === classData.teacher_id);
        if (teacher) {
          setTeacherName(teacher.preferred_name || teacher.display_name || teacher.email?.split('@')[0] || 'Teacher');
        }

        // Assignments for this class
        const classAssignments = (data.assignments ?? []).filter((a: Assignment) => a.class_id === classId);
        setAssignments(classAssignments);

        const classSubs = (data.submissions ?? []).filter((s: Submission) =>
          classAssignments.some((a: Assignment) => a.id === s.assignment_id)
        );
        setSubmissions(classSubs);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

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
        <Link href="/student/dashboard" className="text-teal text-sm mt-2 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const iconInfo = getIconForClass(cls.icon);
  const ClassIconComponent = iconInfo.icon;
  const completedCount = submissions.length;
  const totalCount = assignments.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Class Header */}
      <div className="bg-card-bg rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: iconInfo.bg }}>
            <ClassIconComponent size={28} weight="fill" className="text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">{cls.name}</h1>
            <p className="text-sm text-text-secondary">{teacherName}</p>
          </div>
        </div>
        {cls.description && (
          <p className="text-sm text-text-secondary mb-4">{cls.description}</p>
        )}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ClipboardText size={16} className="text-text-muted" />
            <span className="text-sm text-text-secondary">{totalCount} assignment{totalCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <ChartBar size={16} className="text-text-muted" />
            <span className="text-sm text-text-secondary">{progress}% complete</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link
          href={`/student/main?class=${classId}`}
          className="bg-card-bg rounded-xl border border-border p-5 hover:border-teal/50 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
              <ChatsCircle size={20} weight="fill" className="text-teal" />
            </div>
            <div>
              <div className="font-semibold text-text-primary group-hover:text-teal transition-colors">Chat with AI Tutor</div>
              <div className="text-xs text-text-secondary">Get help with your work</div>
            </div>
          </div>
        </Link>
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo/10 flex items-center justify-center">
              <ClipboardText size={20} weight="fill" className="text-indigo" />
            </div>
            <div>
              <div className="font-semibold text-text-primary">Assignments</div>
              <div className="text-xs text-text-secondary">{completedCount} of {totalCount} complete</div>
            </div>
          </div>
          {totalCount > 0 && (
            <div className="mt-3">
              <div className="w-full bg-border rounded-full h-2">
                <div className="bg-teal h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignments List */}
      {assignments.length > 0 ? (
        <div className="bg-card-bg rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-heading font-bold text-text-primary">Assignments</h2>
          </div>
          <div className="divide-y divide-border">
            {assignments.map(a => {
              const submitted = submissions.some(s => s.assignment_id === a.id);
              return (
                <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${submitted ? 'bg-green-500/10' : 'bg-border'}`}>
                      <ClipboardText size={16} weight="fill" className={submitted ? 'text-green-500' : 'text-text-muted'} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{a.title}</div>
                      {a.description && <div className="text-xs text-text-secondary line-clamp-1">{a.description}</div>}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${submitted ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    {submitted ? 'Done' : 'To Do'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-card-bg rounded-2xl border border-border p-8 text-center">
          <ClipboardText size={32} weight="fill" className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm">No assignments yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
