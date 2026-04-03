'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ChatsCircle, MagnifyingGlass, X, Eye,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { ChatMessage, Profile, Class } from '@/lib/supabase/types';

interface ChatGroup {
  studentId: string;
  studentName: string;
  initials: string;
  className: string;
  messages: ChatMessage[];
  lastMessageAt: string;
  lastMessagePreview: string;
}

export default function StudentChatsPage() {
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [classTab, setClassTab] = useState('All Classes');
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/login'; return; setLoading(false); return; }

        // Fetch student chat data via admin API route (bypasses RLS)
        const res = await fetch(`/api/teacher/student-data?teacherId=${user.id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load chats');
        }
        const data = await res.json();

        const teacherClasses = (data.classes ?? []) as Class[];
        setClasses(teacherClasses);

        const messages = (data.chatMessages ?? []) as ChatMessage[];
        const studentProfilesList = (data.studentProfiles ?? []) as Profile[];

        if (teacherClasses.length === 0 || messages.length === 0) {
          setChatGroups([]);
          setLoading(false);
          return;
        }

        const profileMap = new Map<string, Profile>();
        studentProfilesList.forEach((p) => profileMap.set(p.id, p));

        const classNameMap = new Map<string, string>();
        teacherClasses.forEach((c) => classNameMap.set(c.id, c.name));

        // Group messages by student + class
        const groupMap = new Map<string, ChatGroup>();
        messages.forEach((m) => {
          if (m.sender_id === user.id) return;
          const key = `${m.sender_id}:${m.class_id}`;
          const existing = groupMap.get(key);
          if (existing) {
            existing.messages.push(m);
          } else {
            const profile = profileMap.get(m.sender_id);
            const name = profile?.display_name ?? 'Unknown Student';
            const parts = name.split(' ');
            const initials = parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
            groupMap.set(key, {
              studentId: m.sender_id,
              studentName: name,
              initials,
              className: classNameMap.get(m.class_id) ?? 'Unknown',
              messages: [m],
              lastMessageAt: m.created_at,
              lastMessagePreview: m.content.slice(0, 80),
            });
          }
        });

        const groups = Array.from(groupMap.values()).sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );

        setChatGroups(groups);
      } catch (err) {
        console.error('Student chats fetch error:', err);
        setError('Failed to load chats');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Unique student names for search
  const uniqueStudents = useMemo(() => {
    const seen = new Set<string>();
    return chatGroups
      .filter((g) => {
        if (seen.has(g.studentId)) return false;
        seen.add(g.studentId);
        return true;
      })
      .map((g) => ({ name: g.studentName, initials: g.initials, id: g.studentId }));
  }, [chatGroups]);

  const visibleClasses = useMemo(() => {
    const classNames = new Set<string>();
    chatGroups.forEach((g) => {
      if (!studentFilter || g.studentId === studentFilter) {
        classNames.add(g.className);
      }
    });
    return ['All Classes', ...Array.from(classNames)];
  }, [chatGroups, studentFilter]);

  const filtered = useMemo(() => {
    return chatGroups.filter((g) => {
      if (studentFilter && g.studentId !== studentFilter) return false;
      if (classTab !== 'All Classes' && g.className !== classTab) return false;
      return true;
    });
  }, [chatGroups, studentFilter, classTab]);

  const classCounts = useMemo(() => {
    const base = studentFilter
      ? chatGroups.filter((g) => g.studentId === studentFilter)
      : chatGroups;
    const counts: Record<string, number> = { 'All Classes': base.length };
    base.forEach((g) => {
      counts[g.className] = (counts[g.className] ?? 0) + 1;
    });
    return counts;
  }, [chatGroups, studentFilter]);

  const filteredSearchStudents = searchQuery
    ? uniqueStudents.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : uniqueStudents;

  function clearStudent() {
    setStudentFilter(null);
    setClassTab('All Classes');
    setSelectedGroup(null);
  }

  function selectStudent(id: string) {
    setStudentFilter(id);
    setClassTab('All Classes');
    setSelectedGroup(null);
    setSearchOpen(false);
    setSearchQuery('');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary text-sm">Loading chats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-extrabold text-text-primary flex items-center gap-2.5">
          <ChatsCircle size={24} weight="fill" className="text-teal" /> Student Chats
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitor conversations, track engagement, and get insights from your Teaching Twin
        </p>
      </div>

      {/* Empty state */}
      {chatGroups.length === 0 ? (
        <div className="text-center py-16 px-5 bg-card-bg border-2 border-dashed border-border rounded-[20px]">
          <ChatsCircle size={48} className="mx-auto text-text-secondary opacity-40 mb-3" />
          <h3 className="font-heading font-bold text-base text-text-primary mb-1.5">
            No student conversations yet
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Once students start chatting with their AI tutor, their conversations will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Student Filter Bar */}
          <div className="flex items-center gap-2.5 p-3 bg-card-bg border border-border rounded-lg mb-4">
            <span className="font-semibold text-sm text-text-primary flex items-center gap-1.5 whitespace-nowrap">
              <Eye size={16} weight="fill" className="text-teal" /> Filter by Student
            </span>
            <div className="w-px h-5 bg-border" />
            {studentFilter ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal/8 border-[1.5px] border-teal rounded-full
                text-sm font-semibold text-teal">
                {uniqueStudents.find((s) => s.id === studentFilter)?.name ?? 'Unknown'}
                <button onClick={clearStudent} className="text-teal hover:text-teal/70 cursor-pointer">
                  <X size={14} weight="bold" />
                </button>
              </div>
            ) : (
              <div className="relative flex-1">
                <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  className="w-full pl-8 pr-3 py-1.5 border-[1.5px] border-border rounded-lg text-sm
                    bg-surface text-text-primary outline-none focus:border-teal"
                />
                {searchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card-bg border border-border
                    rounded-lg max-h-56 overflow-y-auto z-20 shadow-lg">
                    {filteredSearchStudents.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => selectStudent(s.id)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer hover:bg-teal/5
                          border-b border-border last:border-b-0 text-sm text-text-primary"
                      >
                        <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center
                          text-[10px] font-bold shrink-0">
                          {s.initials}
                        </div>
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Class Tabs */}
          <div className="flex gap-1 border-b-2 border-border mb-0">
            {visibleClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => { setClassTab(cls); setSelectedGroup(null); }}
                className={`px-4 py-2.5 font-heading font-semibold text-sm border-b-2 -mb-[2px]
                  transition-all cursor-pointer flex items-center gap-1.5 bg-transparent border-t-0 border-l-0 border-r-0
                  ${classTab === cls
                    ? 'text-navy border-navy'
                    : 'text-text-secondary border-transparent hover:text-text-primary'
                  }`}
              >
                {cls}
                {classCounts[cls] != null && (
                  <span className="text-[10px] font-bold bg-teal/10 text-teal px-1.5 py-0.5 rounded-full">
                    {classCounts[cls]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Main Content: Chat List | Conversation Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 mt-5 border border-border rounded-[14px] overflow-hidden">
            {/* Chat List */}
            <div className="border-r border-border">
              <div className="max-h-[460px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="text-center py-10 text-text-secondary text-sm">No conversations match your filters.</div>
                ) : (
                  filtered.map((g) => (
                    <div
                      key={`${g.studentId}:${g.className}`}
                      onClick={() => setSelectedGroup(g)}
                      className={`flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-b-0
                        cursor-pointer transition-colors
                        ${selectedGroup?.studentId === g.studentId && selectedGroup?.className === g.className ? 'bg-teal/5' : 'hover:bg-card-bg'}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center
                        text-xs font-bold shrink-0 mt-0.5">
                        {g.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-heading font-bold text-sm text-text-primary truncate">{g.studentName}</span>
                        </div>
                        <div className="text-xs text-text-secondary truncate mb-1.5">{g.lastMessagePreview}</div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal/10 text-teal">
                          {g.className}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-text-secondary whitespace-nowrap">
                          {new Date(g.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-text-secondary mt-1">
                          {g.messages.length} message{g.messages.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Conversation Detail / Empty State */}
            <div className="flex flex-col bg-card-bg min-h-[200px]">
              {selectedGroup ? (
                <div className="p-6 flex-1 overflow-y-auto max-h-[460px]">
                  <h3 className="font-heading font-bold text-sm text-text-primary mb-1">
                    {selectedGroup.studentName}
                  </h3>
                  <p className="text-xs text-text-secondary mb-4">{selectedGroup.className}</p>
                  <div className="space-y-3">
                    {[...selectedGroup.messages].reverse().map((m) => (
                      <div
                        key={m.id}
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                          m.message_type === 'student'
                            ? 'bg-navy/10 text-text-primary'
                            : m.message_type === 'ai'
                            ? 'bg-teal/10 text-text-primary ml-auto'
                            : 'bg-warning/10 text-text-primary ml-auto'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-text-secondary mb-1 uppercase">
                          {m.message_type === 'student' ? 'Student' : m.message_type === 'ai' ? 'AI Tutor' : 'Teacher'}
                        </div>
                        {m.content}
                        <div className="text-[10px] text-text-secondary mt-1">
                          {new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1 text-center py-10 px-6">
                  <div>
                    <div className="w-14 h-14 rounded-full bg-border/50 flex items-center justify-center mx-auto mb-3">
                      <ChatsCircle size={28} className="text-text-muted" />
                    </div>
                    <p className="font-heading font-semibold text-sm text-text-primary mb-1">Select a conversation</p>
                    <p className="text-xs text-text-secondary">Click on a chat to see the conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
