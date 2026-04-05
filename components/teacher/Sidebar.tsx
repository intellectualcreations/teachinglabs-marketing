'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SquaresFour, BookOpenText, UsersThree, Books, ChatsCircle, GearSix, List, X, SignOut,
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
  const [initials, setInitials] = useState('T');

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
        }
      } catch { /* ignore */ }
    }
    loadUser();
  }, []);

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
