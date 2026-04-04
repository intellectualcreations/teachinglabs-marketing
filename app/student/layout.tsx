'use client';

import { usePathname } from 'next/navigation';
import PostAuthHandler from '@/components/shared/PostAuthHandler';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-warm-white">
      <PostAuthHandler />

      {children}
    </div>
  );
}
