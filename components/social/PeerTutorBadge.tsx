'use client';

import { GraduationCap } from '@phosphor-icons/react';

interface PeerTutorBadgeProps {
  className?: string;
}

export default function PeerTutorBadge({ className = '' }: PeerTutorBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold text-teal bg-teal/10 px-2 py-0.5 rounded-full ${className}`}
      title="Peer Tutor"
    >
      <GraduationCap size={10} weight="fill" />
      Tutor
    </span>
  );
}
