'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest,
  PencilLine, Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, Bank, MapTrifold, Translate, Basketball, PersonSimpleRun, Books, MaskHappy,
  Heartbeat, Leaf, Robot, Ruler, Target, Lightbulb, Star, HouseSimple,
  ChartBar,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Class } from '@/lib/supabase/types';

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
  french: { icon: MusicNotes, bg: '#2563EB' },
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let authHeaders: Record<string, string> = {};
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          if (sess?.access_token) authHeaders = { 'Authorization': `Bearer ${sess.access_token}` };
        } catch { /* ignore */ }

        const res = await fetch(`/api/student/my-classes?userId=${user.id}`, { headers: authHeaders });
        if (!res.ok) return;
        const data = await res.json();

        const classData = (data.classes ?? []).find((c: Class) => c.id === classId);
        if (!classData) return;
        setCls(classData);

        const teachers = data.teachers ?? [];
        const teacher = teachers.find((t: { id: string; preferred_name?: string; display_name?: string }) => t.id === classData.teacher_id);
        if (teacher) {
          setTeacherName(teacher.preferred_name || teacher.display_name || 'Teacher');
        }
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
      </div>
    );
  }

  const iconInfo = getIconForClass(cls.icon);
  const ClassIconComponent = iconInfo.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Class Header */}
      <div className="bg-card-bg rounded-2xl border border-border p-6">
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
    </div>
  );
}
