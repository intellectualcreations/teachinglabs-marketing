'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { SignOut } from '@phosphor-icons/react';

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-border animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 rounded-xl bg-navy text-white font-heading text-sm font-semibold hover:bg-navy/90 transition-colors"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-text-secondary hidden sm:inline">
        {session.user.name || session.user.email}
      </span>
      {session.user.image ? (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="w-8 h-8 rounded-full border border-border"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center text-white text-xs font-bold">
          {(session.user.name || session.user.email || '?')[0].toUpperCase()}
        </div>
      )}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
        title="Sign out"
      >
        <SignOut size={18} />
      </button>
    </div>
  );
}
