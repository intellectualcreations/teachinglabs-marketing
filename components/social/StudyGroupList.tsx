'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  MagnifyingGlass,
  Plus,
  X,
  UserPlus,
  SignOut,
  Lock,
} from '@phosphor-icons/react';

interface StudyGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
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
}

interface StudyGroupListProps {
  courseId: string;
  currentUserId: string;
  currentUserName: string;
  onSelectGroup: (groupId: string) => void;
}

export default function StudyGroupList({
  courseId,
  currentUserId,
  currentUserName,
  onSelectGroup,
}: StudyGroupListProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMax, setNewMax] = useState(10);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleCreate() {
    if (!newName.trim() || !newDesc.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim(),
          courseId,
          createdById: currentUserId,
          maxMembers: newMax,
          isPublic: true,
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewName('');
        setNewDesc('');
        setNewMax(10);
        fetchGroups();
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin(groupId: string) {
    setJoiningId(groupId);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (res.ok) fetchGroups();
    } finally {
      setJoiningId(null);
    }
  }

  async function handleLeave(groupId: string) {
    setJoiningId(groupId);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (res.ok) fetchGroups();
    } finally {
      setJoiningId(null);
    }
  }

  function isMember(group: StudyGroup): boolean {
    return group.members.some((m) => m.userId === currentUserId);
  }

  function isOwner(group: StudyGroup): boolean {
    return group.createdById === currentUserId;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search study groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 font-heading text-sm font-bold bg-teal text-white px-4 py-2 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        >
          <Plus size={16} weight="bold" />
          New Group
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="bg-card-bg border border-border rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-base text-text-primary">
              Create Study Group
            </h3>
            <button onClick={() => setShowCreate(false)} className="text-text-muted hover:text-text-secondary">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Group name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
            <textarea
              placeholder="Describe what your group is about..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary font-medium">Max members:</label>
              <input
                type="number"
                min={2}
                max={50}
                value={newMax}
                onChange={(e) => setNewMax(Number(e.target.value))}
                className="w-20 px-3 py-1.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || !newDesc.trim() || creating}
              className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-5 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      )}

      {/* Groups list */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <Users size={40} weight="light" className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-secondary">
            {search ? 'No groups match your search.' : 'No study groups yet. Create the first one!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((group) => {
            const member = isMember(group);
            const owner = isOwner(group);
            const full = group.members.length >= group.maxMembers;

            return (
              <div
                key={group.id}
                className="bg-card-bg border border-border rounded-xl p-4 hover:border-teal/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelectGroup(group.id)}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-sm text-text-primary truncate">
                        {group.name}
                      </h4>
                      {!group.isPublic && (
                        <Lock size={12} className="text-text-muted flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                      {group.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                        <Users size={12} weight="fill" />
                        {group.members.length}/{group.maxMembers}
                      </span>
                      {member && (
                        <span className="text-xs font-semibold text-teal">
                          {owner ? 'Owner' : 'Member'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {member && !owner ? (
                      <button
                        onClick={() => handleLeave(group.id)}
                        disabled={joiningId === group.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-coral hover:text-coral/80 transition-colors px-3 py-1.5 rounded-full border border-coral/20 hover:bg-coral/5"
                      >
                        <SignOut size={12} weight="bold" />
                        Leave
                      </button>
                    ) : !member ? (
                      <button
                        onClick={() => handleJoin(group.id)}
                        disabled={full || joiningId === group.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:text-teal/80 transition-colors px-3 py-1.5 rounded-full border border-teal/20 hover:bg-teal/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserPlus size={12} weight="bold" />
                        {full ? 'Full' : 'Join'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
