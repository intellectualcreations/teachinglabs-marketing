'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CaretLeft, Users } from '@phosphor-icons/react';
import StudyGroupList from '@/components/social/StudyGroupList';
import StudyGroupDetail from '@/components/social/StudyGroupDetail';
import GroupNoteEditor from '@/components/social/GroupNoteEditor';

const DEMO_USER = { id: 'demo-student', name: 'Alex Demo' };

const USER_NAMES: Record<string, string> = {
  'demo-student': 'Alex Demo',
  'student-emma': 'Emma Wilson',
  'student-liam': 'Liam Brooks',
  'student-mia': 'Mia Rodriguez',
  'student-noah': 'Noah Kim',
};

interface GroupInfo {
  id: string;
  name: string;
}

type View = 'list' | 'detail' | 'notes';

export default function StudyGroupsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [view, setView] = useState<View>('list');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  const fetchGroupInfo = useCallback(async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setGroupInfo({ id: data.group.id, name: data.group.name });
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupInfo(selectedGroupId);
    }
  }, [selectedGroupId, fetchGroupInfo]);

  function handleSelectGroup(groupId: string) {
    setSelectedGroupId(groupId);
    setView('detail');
  }

  function handleViewNotes(groupId: string) {
    setSelectedGroupId(groupId);
    setView('notes');
  }

  function handleBack() {
    if (view === 'notes') {
      setView('detail');
    } else {
      setView('list');
      setSelectedGroupId(null);
      setGroupInfo(null);
    }
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Top nav */}
        <div className="mb-6">
          <Link
            href={`/student/courses/${courseId}`}
            className="flex items-center gap-1 text-sm text-teal hover:text-teal/80 font-medium transition-colors mb-3"
          >
            <CaretLeft size={14} weight="bold" />
            Back to course
          </Link>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary flex items-center gap-2">
            <Users size={24} weight="fill" className="text-teal" />
            Study Groups
          </h1>
        </div>

        {view === 'list' && (
          <StudyGroupList
            courseId={courseId}
            currentUserId={DEMO_USER.id}
            currentUserName={DEMO_USER.name}
            onSelectGroup={handleSelectGroup}
          />
        )}

        {view === 'detail' && selectedGroupId && (
          <StudyGroupDetail
            groupId={selectedGroupId}
            currentUserId={DEMO_USER.id}
            currentUserName={DEMO_USER.name}
            userNames={USER_NAMES}
            onBack={handleBack}
            onViewNotes={handleViewNotes}
          />
        )}

        {view === 'notes' && selectedGroupId && groupInfo && (
          <GroupNoteEditor
            groupId={selectedGroupId}
            groupName={groupInfo.name}
            currentUserId={DEMO_USER.id}
            currentUserName={DEMO_USER.name}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
