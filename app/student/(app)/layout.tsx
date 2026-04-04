'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SquaresFour, BookOpenText, MathOperations, Flask, GlobeHemisphereWest,
  ChartBar, ChatText, List, X, Gear, SignOut,
  PencilLine, Palette, MusicNotes, Desktop, Calculator, Article, TestTube, Planet,
  Dna, Bank, MapTrifold, Translate, Basketball, PersonSimpleRun, Books, MaskHappy,
  Heartbeat, Leaf, Robot, Ruler, Target, Lightbulb, Star, HouseSimple,
} from '@phosphor-icons/react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { createClient } from '@/lib/supabase/client';

/* ─── Icon map for class sidebar icons ─── */
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
  french: { icon: ChatText, bg: '#2563EB' },
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

interface SidebarClass {
  id: string;
  name: string;
  iconVal: string | null;
  avatarColor: string;
  Icon: typeof MathOperations;
}

const NAV_ITEMS = [
  { href: '/student/dashboard', label: 'Dashboard', Icon: SquaresFour },
  { href: '/student/analytics', label: 'Analytics', Icon: ChartBar },
  { href: '/student/messages', label: 'Messages', Icon: ChatText },
];

export default function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentInitials, setStudentInitials] = useState('');
  const [classes, setClasses] = useState<SidebarClass[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/student/signup');
          return;
        }

        // Check onboarding
        const onboarded = localStorage.getItem('teachinglabs_onboarded');
        if (!onboarded) {
          const { data: assessment } = await supabase
            .from('student_assessments')
            .select('completed_at')
            .eq('student_id', user.id)
            .single() as { data: { completed_at: string | null } | null };
          if (assessment?.completed_at) {
            localStorage.setItem('teachinglabs_onboarded', 'true');
          } else {
            router.replace('/student/onboarding');
            return;
          }
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

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

        const displayName = preferredName || (profileData as { display_name?: string } | null)?.display_name || 'Student';
        setStudentName(displayName.split(' ')[0]);
        setStudentInitials(getInitials(displayName));

        // Fetch classes
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
        const classJson = classRes.ok ? await classRes.json() : { classes: [] };
        const classRows = (classJson.classes ?? []) as { id: string; name: string; icon: string | null; subject: string | null }[];

        setClasses(classRows.map(cls => {
          const iconInfo = getIconForClass(cls.icon);
          return {
            id: cls.id,
            name: cls.name,
            iconVal: cls.icon,
            avatarColor: iconInfo.bg,
            Icon: iconInfo.icon,
          };
        }));

        setReady(true);
      } catch (err) {
        console.error('Layout init error:', err);
        setReady(true);
      }
    }

    init();
  }, [router]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('sb-auth-token');
    router.push('/student/signup');
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-teal border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-warm-white">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg bg-navy text-white flex items-center justify-center shadow-lg"
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
          <img src="/images/logo-icon.svg" alt="TeachingLabs" className="w-8 h-8 flex-shrink-0" />
          <div className="flex flex-col justify-center">
            <div className="font-heading font-bold text-sm text-white leading-tight">TeachingLabs</div>
            <div className="text-xs text-white/50 leading-tight">{studentName ? `${studentName}'s Learning Portal` : 'Learning Portal'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-2 py-2 border-b border-white/10 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-teal text-navy font-semibold'
                    : 'text-white/60 hover:bg-white/10 hover:text-white font-semibold'
                }`}
              >
                <item.Icon size={18} weight="fill" />
                {item.label}
              </Link>
            );
          })}
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
            classes.map(cls => {
              const classPath = `/student/class/${cls.id}`;
              const isActive = pathname === classPath;
              return (
                <Link
                  key={cls.id}
                  href={classPath}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${
                    isActive
                      ? 'bg-white/[0.15] text-white'
                      : 'text-white/70 hover:bg-white/[0.12] hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cls.avatarColor }}>
                    <cls.Icon size={16} weight="fill" className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs truncate text-white">{cls.name}</div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Settings & Logout */}
        <div className="px-2 py-2 border-t border-white/10 space-y-1">
          <Link
            href="/student/settings"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === '/student/settings'
                ? 'bg-teal text-navy font-semibold'
                : 'text-white/60 hover:bg-white/10 hover:text-white font-semibold'
            }`}
          >
            <Gear size={18} weight="fill" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/60 font-semibold text-sm hover:bg-white/10 hover:text-white transition-colors w-full text-left"
          >
            <SignOut size={18} weight="fill" />
            Log Out
          </button>
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
        {children}
      </main>
    </div>
  );
}
