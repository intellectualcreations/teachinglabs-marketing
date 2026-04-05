'use client';

import { UsersThree } from '@phosphor-icons/react';

export default function GroupChatsPage() {
  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-5">
        <UsersThree size={32} weight="fill" className="text-teal" />
      </div>
      <h1 className="font-heading font-extrabold text-2xl text-text-primary mb-2">
        Group Chats
      </h1>
      <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto mb-6">
        Monitor peer-to-peer student conversations from group activities. See who's collaborating, who needs help, and where discussions are headed.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 border border-teal/20">
        <span className="text-teal text-sm font-semibold">Coming Soon</span>
      </div>
    </div>
  );
}
