'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SquaresFour, BookOpenText, UsersThree, Books, ChatsCircle, GearSix, List, X, SignOut,
  CaretRight, CaretDown, ClipboardText, MegaphoneSimple,
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { TEACHER_NAV } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

const iconMap: Record<string, React.ComponentType<{ size?: number; weight?: 'fill' | 'regular'; className?: string }>> = {
  SquaresFour, BookOpenText, UsersThree, Books, ChatsCircle,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState('Teacher');
  const [preferredName, setPreferredName] = useState('');
  const [initials, setInitials] = useState('T');
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Teacher';
          setUserName(name);
          const parts = name.split(' ');
          setInitials(parts.length >= 2 ? `${parts[0][0]}${parts[parts.length-1][0]}`.toUpperCase() : name[0]?.toUpperCase() || 'T');

          // Fetch preferred_name from profiles
          const { data: profile } = await (supabase.from as any)('profiles')
            .select('preferred_name')
            .eq('id', user.id)
            .single();
          if (profile?.preferred_name) {
            setPreferredName(profile.preferred_name);
          }

          // Fetch teacher's classes
          const res = await fetch(`/api/classes/by-teacher?teacherId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.classes ?? []);
            setClasses(list.map((c: any) => ({ id: c.id, name: c.name })));
          }
        }
      } catch { /* ignore */ }
    }
    loadUser();
  }, []);

  // Auto-expand class from URL
  useEffect(() => {
    const match = pathname.match(/classId=([^&]+)/);
    if (match) setExpandedClassId(match[1]);
  }, [pathname]);

  // Map sub-pages to their parent nav item
  const subPageMap: Record<string, string> = {
    '/teacher/create-course': '/teacher/library',
    '/teacher/create-activity': '/teacher/library',
    '/teacher/edit-class': '/teacher/my-classes',
    '/teacher/edit-course': '/teacher/library',
    '/teacher/class-details': '/teacher/my-classes',
    '/teacher/class-detail': '/teacher/my-classes',
  };
  const effectivePath = Object.entries(subPageMap).find(([prefix]) => pathname.startsWith(prefix))?.[1] || pathname;
  const activePage = TEACHER_NAV.find(n => effectivePath.startsWith(n.href))?.page || 'dashboard';

  return (
    <>
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
      <aside
        className={[
          'fixed lg:sticky top-0 left-0 h-screen w-60 bg-navy flex flex-col z-50 shrink-0 transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Close button (mobile) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-horizontal-light.png"
              alt="TeachingLabs"
              width={320}
              height={80}
              className="h-16 w-auto"
            />
          </div>
          {preferredName && (
            <p className="text-xs text-white/50 mt-1 pl-1">{preferredName}</p>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {TEACHER_NAV.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = activePage === item.page;
            return (
              <Link
                key={item.page}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  'flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-white/[0.12] text-white' : 'text-white/70 hover:text-white hover:bg-white/[0.08]',
                ].join(' ')}
              >
                {Icon && <Icon size={20} weight="fill" />}
                {item.label}
              </Link>
            );
          })}

          {/* Classes with sub-items */}
          {classes.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="px-5 pb-1 text-[10px] font-bold uppercase tracking-wide text-white/40">Classes</div>
              {classes.map((cls) => {
                const isExpanded = expandedClassId === cls.id;
                return (
                  <div key={cls.id}>
                    <button
                      onClick={() => setExpandedClassId(isExpanded ? null : cls.id)}
                      className="flex items-center gap-3 px-5 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors w-full text-left"
                    >
                      {isExpanded ? <CaretDown size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
                      <BookOpenText size={16} weight="fill" />
                      <span className="truncate">{cls.name}</span>
                    </button>
                    {isExpanded && (
                      <div className="ml-10 border-l border-white/10 pl-2 py-1 space-y-0.5">
                        <a
                          href={`/teacher/student-chats?classId=${cls.id}`}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
                        >
                          <ChatsCircle size={14} weight="fill" />
                          Student Chats
                        </a>
                        <a
                          href={`/teacher/class-details?classId=${cls.id}`}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
                        >
                          <ClipboardText size={14} weight="fill" />
                          Activities
                        </a>
                        <a
                          href={`/teacher/class-messages?classId=${cls.id}`}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
                        >
                          <MegaphoneSimple size={14} weight="fill" />
                          Message Board
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Bottom: Settings + Avatar */}
        <div className="mt-auto border-t border-white/10 p-3">
          <Link
            href="/teacher/settings"
            className="flex items-center gap-3 px-2 py-2 text-sm text-white/60 hover:text-white
              transition-colors rounded-lg hover:bg-white/5"
          >
            <GearSix size={20} weight="fill" />
            Settings
          </Link>

          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-2 py-2 text-sm text-white/60 hover:text-white
              transition-colors rounded-lg hover:bg-white/5 w-full"
          >
            <SignOut size={20} weight="fill" />
            Log out
          </button>

          <div className="flex items-center gap-3 px-2 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-[#1F3A5F] text-white flex items-center justify-center
              font-heading font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{userName}</div>
            </div>
            <ThemeToggle className="border-white/20 text-white/60 hover:text-white hover:border-white/40" />
          </div>
        </div>
      </aside>
    </>
  );
}
