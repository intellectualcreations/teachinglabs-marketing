'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SquaresFour, BookOpenText, UsersThree, Books, ChatsCircle, GearSix, List, X,
} from '@phosphor-icons/react';
import { useState } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { TEACHER_NAV } from '@/lib/constants';

const iconMap: Record<string, React.ComponentType<{ size?: number; weight?: 'fill' | 'regular'; className?: string }>> = {
  SquaresFour, BookOpenText, UsersThree, Books, ChatsCircle,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activePage = TEACHER_NAV.find(n => pathname.startsWith(n.href))?.page || 'dashboard';

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
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-60 bg-navy flex flex-col z-50 shrink-0
          transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
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
            <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center text-white font-bold text-sm">
              TL
            </div>
            <div>
              <div className="text-white font-heading font-bold text-sm">TeachingLabs</div>
              <div className="text-white/50 text-xs">Lincoln Elementary</div>
            </div>
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
                className={`
                  flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-teal bg-white/8'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
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

          <div className="flex items-center gap-3 px-2 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center
              font-heading font-bold text-xs shrink-0">
              MH
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">Ms. Harper</div>
              <div className="text-white/40 text-[10px]">5th Grade</div>
            </div>
            <ThemeToggle className="border-white/20 text-white/60 hover:text-white hover:border-white/40" />
          </div>
        </div>
      </aside>
    </>
  );
}
