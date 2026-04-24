'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CaretLeft,
  Users,
  NotePencil,
  Crown,
  User,
  Trash,
} from '@phosphor-icons/react';
import { authFetch } from '@/lib/api-fetch';

interface StudyGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
}

interface GroupNote {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseId: string;
  createdById: string;
  maxMembers: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  members: StudyGroupMember[];
  notes: GroupNote[];
}

interface StudyGroupDetailProps {
  groupId: string;
  currentUserId: string;
  currentUserName: string;
  userNames: Record<string, string>;
  onBack: () => void;
  onViewNotes: (groupId: string) => void;
}

export default function StudyGroupDetail({
  groupId,
  currentUserId,
  currentUserName,
  userNames,
  onBack,
  onViewNotes,
}: StudyGroupDetailProps) {
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await authFetch(`/api/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setGroup(data.group);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  async function handleDelete() {
    if (!group) return;
    const res = await authFetch(`/api/groups/${groupId}`, { method: 'DELETE' });
    if (res.ok) onBack();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-text-secondary">Group not found.</p>
        <button onClick={onBack} className="text-sm text-teal hover:text-teal/80 mt-2 font-medium">
          ← Back to groups
        </button>
      </div>
    );
  }

  const isOwner = group.createdById === currentUserId;
  const isMember = group.members.some((m) => m.userId === currentUserId);

  function getUserName(userId: string): string {
    if (userId === currentUserId) return currentUserName;
    return userNames[userId] || userId;
  }

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-teal hover:text-teal/80 font-medium mb-4 transition-colors"
      >
        <CaretLeft size={14} weight="bold" />
        Back to groups
      </button>

      {/* Group info */}
      <div className="bg-card-bg border border-border rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-lg text-text-primary">{group.name}</h2>
            <p className="text-sm text-text-secondary mt-1">{group.description}</p>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-coral/60 hover:text-coral transition-colors"
              title="Delete group"
            >
              <Trash size={18} weight="bold" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <Users size={12} weight="fill" />
            {group.members.length}/{group.maxMembers} members
          </span>
          <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Members */}
      <div className="bg-card-bg border border-border rounded-xl p-5 mb-4">
        <h3 className="font-heading font-bold text-sm text-text-primary mb-3 flex items-center gap-2">
          <Users size={16} weight="fill" className="text-teal" />
          Members ({group.members.length})
        </h3>
        <div className="space-y-2">
          {group.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2.5 py-1.5"
            >
              <div className="w-7 h-7 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                <User size={14} weight="fill" className="text-teal" />
              </div>
              <span className="text-sm text-text-primary font-medium flex-1">
                {getUserName(member.userId)}
              </span>
              {member.role === 'OWNER' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                  <Crown size={10} weight="fill" />
                  Owner
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes preview */}
      <div className="bg-card-bg border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-sm text-text-primary flex items-center gap-2">
            <NotePencil size={16} weight="fill" className="text-teal" />
            Shared Notes ({group.notes.length})
          </h3>
          {isMember && (
            <button
              onClick={() => onViewNotes(groupId)}
              className="text-xs font-semibold text-teal hover:text-teal/80 transition-colors"
            >
              View All →
            </button>
          )}
        </div>

        {group.notes.length === 0 ? (
          <p className="text-xs text-text-muted">No shared notes yet.</p>
        ) : (
          <div className="space-y-2">
            {group.notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                className="py-2 border-b border-border last:border-0 cursor-pointer hover:bg-teal/[0.02] -mx-1 px-1 rounded"
                onClick={() => onViewNotes(groupId)}
              >
                <p className="text-sm font-medium text-text-primary truncate">{note.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  by {note.authorName} · {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
