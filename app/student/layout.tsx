'use client';

import PostAuthHandler from '@/components/shared/PostAuthHandler';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm-white">
      <PostAuthHandler />
      {children}
    </div>
  );
}
