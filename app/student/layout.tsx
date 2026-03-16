'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SquaresFour } from '@phosphor-icons/react';
import NotificationBell from '@/components/shared/NotificationBell';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === '/student/dashboard';
  const isMain = pathname === '/student/main';
  const isOnboarding = pathname === '/student/onboarding';
  const isCourseViewer = pathname.startsWith('/student/courses/');
  const isCertificate = pathname.startsWith('/student/certificates/');

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Dashboard button ONLY on student dashboard and mainchat (course viewer has its own nav) */}
      {(isDashboard || isMain) && !isCourseViewer && !isCertificate && (
        <div className="sticky top-0 z-40 bg-warm-white border-b border-border px-4 py-2.5 flex items-center justify-between">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors"
          >
            <SquaresFour size={18} weight="fill" />
            Dashboard
          </Link>
          <div className="bg-navy rounded-lg">
            <NotificationBell role="student" />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
