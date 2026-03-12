'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SquaresFour } from '@phosphor-icons/react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === '/student/dashboard';
  const isMain = pathname === '/student/main';
  const isOnboarding = pathname === '/student/onboarding';

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Persistent Dashboard button on pages without their own sidebar */}
      {!isDashboard && !isMain && !isOnboarding && (
        <div className="sticky top-0 z-40 bg-warm-white border-b border-border px-4 py-2.5">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors"
          >
            <SquaresFour size={18} weight="fill" />
            Dashboard
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
