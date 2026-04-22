'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ChatsCircle, MagnifyingGlass, X, Eye, Sparkle, CaretRight,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { ChatMessage, Profile, Class } from '@/lib/supabase/types';

interface ChatTopic {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  className: string;
  topicLabel: string;           // Activity name or "General Chat"
  topicType: 'activity' | 'general';
  messages: any[];
  lastMessageAt: string;
  messageCount: number;
}

function StudentChatsContent() {
  const searchParams = useSearchParams();
  const urlClassId = searchParams.get('classId');
  const [topics, setTopics] = useState<ChatTopic[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [classTab, setClassTab] = useState('All Classes');

  // When arriving with ?classId=<id>, scope the view to that class.
  useEffect(() => {
    if (urlClassId && classes.length > 0) {
      const cls = classes.find((c: any) => c.id === urlClassId);
      if (cls) setClassTab(cls.name);
    }
  }, [urlClassId, classes]);
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [slideOutOpen, setSlideOutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/login'; return; }

        const res = await fetch(`/api/teacher/student-data?teacherId=${user.id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load chats');
        }
        const data = await res.json();

        const teacherClasses = (data.classes ?? []) as Class[];
        setClasses(teacherClasses);

        const messages = (data.chatMessages ?? []) as any[];
        const studentProfilesList = (data.studentProfiles ?? []) as Profile[];

        if (teacherClasses.length === 0 || messages.length === 0) {
          setTopics([]);
          setLoading(false);
          return;
        }

        const profileMap = new Map<string, Profile>();
        studentProfilesList.forEach((p) => profileMap.set(p.id, p));

        const classNameMap = new Map<string, string>();
        teacherClasses.forEach((c) => classNameMap.set(c.id, c.name));

        // Group by student + topic (activity or general chat)
        const topicMap = new Map<string, ChatTopic>();
        messages.forEach((m: any) => {
          const studentId = m.student_id || m.sender_id;
          if (!studentId || studentId === user.id || studentId === 'spark-ai') return;

          const isActivity = m.message_type === 'activity_chat';
          const topicKey = isActivity
            ? `${studentId}:activity:${m.activity_id}`
            : `${studentId}:general:${m.class_id}`;

          const existing = topicMap.get(topicKey);
          if (existing) {
            existing.messages.push(m);
            existing.messageCount++;
            if (m.created_at > existing.lastMessageAt) {
              existing.lastMessageAt = m.created_at;
            }
          } else {
            const profile = profileMap.get(studentId);
            const name = profile?.display_name ?? 'Unknown Student';
            const parts = name.split(' ');
            const initials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
            topicMap.set(topicKey, {
              id: topicKey,
              studentId,
              studentName: name,
              initials,
              className: classNameMap.get(m.class_id) || 'Unknown',
              topicLabel: isActivity ? (m.activity_name || 'Activity Chat') : 'General Chat',
              topicType: isActivity ? 'activity' : 'general',
              messages: [m],
              lastMessageAt: m.created_at,
              messageCount: 1,
            });
          }
        });

        const sorted = Array.from(topicMap.values()).sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );

        setTopics(sorted);
      } catch (err) {
        console.error('Student chats fetch error:', err);
        setError('Failed to load chats');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Generate AI summary when topic is selected
  const loadSummary = useCallback(async (topic: ChatTopic) => {
    setSummaryLoading(true);
    setSummary(null);
    try {
      const res = await fetch('/api/teacher/chat-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: topic.messages.map((m: any) => ({
            role: m.role || (m.message_type === 'student' || m.message_type === 'activity_chat' && m.role === 'user' ? 'user' : 'assistant'),
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch {
      setSummary('Unable to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Unique students for filter
  const uniqueStudents = useMemo(() => {
    const seen = new Set<string>();
    return topics
      .filter((t) => { if (seen.has(t.studentId)) return false; seen.add(t.studentId); return true; })
      .map((t) => ({ name: t.studentName, initials: t.initials, id: t.studentId }));
  }, [topics]);

  const visibleClasses = useMemo(() => {
    const classNames = new Set<string>();
    topics.forEach((t) => {
      if (!studentFilter || t.studentId === studentFilter) classNames.add(t.className);
    });
    return ['All Classes', ...Array.from(classNames)];
  }, [topics, studentFilter]);

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      if (studentFilter && t.studentId !== studentFilter) return false;
      if (classTab !== 'All Classes' && t.className !== classTab) return false;
      return true;
    });
  }, [topics, studentFilter, classTab]);

  const classCounts = useMemo(() => {
    const base = studentFilter ? topics.filter((t) => t.studentId === studentFilter) : topics;
    const counts: Record<string, number> = { 'All Classes': base.length };
    base.forEach((t) => { counts[t.className] = (counts[t.className] ?? 0) + 1; });
    return counts;
  }, [topics, studentFilter]);

  const filteredSearchStudents = searchQuery
    ? uniqueStudents.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : uniqueStudents;

  function clearStudent() { setStudentFilter(null); setClassTab('All Classes'); setSelectedTopic(null); setSummary(null); }
  function selectStudent(id: string) { setStudentFilter(id); setClassTab('All Classes'); setSelectedTopic(null); setSummary(null); setSearchOpen(false); setSearchQuery(''); }

  function handleTopicClick(topic: ChatTopic) {
    setSelectedTopic(topic);
    setSlideOutOpen(false);
    loadSummary(topic);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-text-secondary text-sm">Loading chats...</div></div>;
  if (error) return <div className="flex items-center justify-center py-20"><div className="text-red-400 text-sm">{error}</div></div>;

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-extrabold text-text-primary flex items-center gap-2.5">
          <ChatsCircle size={24} weight="fill" className="text-teal" /> Student Chats
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitor conversations, track engagement, and get AI-powered insights
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-16 px-5 bg-card-bg border-2 border-dashed border-border rounded-[20px]">
          <ChatsCircle size={48} className="mx-auto text-text-secondary opacity-40 mb-3" />
          <h3 className="font-heading font-bold text-base text-text-primary mb-1.5">No student conversations yet</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Once students start chatting with Spark, their conversations will appear here.
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal/8 border-[1.5px] border-teal rounded-full text-sm font-semibold text-teal">
                {uniqueStudents.find((s) => s.id === studentFilter)?.name ?? 'Unknown'}
                <button onClick={clearStudent} className="text-teal hover:text-teal/70 cursor-pointer"><X size={14} weight="bold" /></button>
              </div>
            ) : (
              <div className="relative flex-1">
                <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text" placeholder="Search students..." value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  className="w-full pl-8 pr-3 py-1.5 border-[1.5px] border-border rounded-lg text-sm bg-surface text-text-primary outline-none focus:border-teal"
                />
                {searchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card-bg border border-border rounded-lg max-h-56 overflow-y-auto z-20 shadow-lg">
                    {filteredSearchStudents.map((s) => (
                      <div key={s.id} onClick={() => selectStudent(s.id)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer hover:bg-teal/5 border-b border-border last:border-b-0 text-sm text-text-primary">
                        <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold shrink-0">{s.initials}</div>
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Class Tabs — hidden when URL is scoped to a single class; header shows name instead */}
          {!urlClassId ? (
            <div className="flex gap-1 border-b-2 border-border mb-4">
              {visibleClasses.map((cls) => (
                <button key={cls} onClick={() => { setClassTab(cls); setSelectedTopic(null); setSummary(null); }}
                  className={`px-4 py-2.5 font-heading font-semibold text-sm border-b-2 -mb-[2px] transition-all cursor-pointer flex items-center gap-1.5 bg-transparent border-t-0 border-l-0 border-r-0
                    ${classTab === cls ? 'text-navy border-navy' : 'text-text-secondary border-transparent hover:text-text-primary'}`}>
                  {cls}
                  {classCounts[cls] != null && (
                    <span className="text-[10px] font-bold bg-teal/10 text-teal px-1.5 py-0.5 rounded-full">{classCounts[cls]}</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-4 px-4 py-2 rounded-lg bg-navy/5 border border-navy/10 flex items-center justify-between">
              <p className="text-[13px] text-text-primary">
                <span className="text-[10px] uppercase tracking-[0.5px] font-bold text-text-secondary mr-2">Scoped to</span>
                <span className="font-heading font-bold">{classTab}</span>
                {classCounts[classTab] != null && (
                  <span className="ml-2 text-[11px] font-bold bg-teal/10 text-teal px-2 py-0.5 rounded-full">{classCounts[classTab]} chats</span>
                )}
              </p>
              <a href="/teacher/student-chats" className="text-[11px] font-semibold text-teal hover:underline">← View all classes</a>
            </div>
          )}

          {/* 3-Column Layout: Topic List | AI Summary | (Slide-out Full Chat) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-0 border border-border rounded-[14px] overflow-hidden" style={{ minHeight: 460 }}>

            {/* Column 1: Chat Topics */}
            <div className="border-r border-border">
              <div className="px-4 py-3 border-b border-border bg-card-bg/50">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Chat Topics</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="text-center py-10 text-text-secondary text-sm">No conversations match your filters.</div>
                ) : (
                  filtered.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleTopicClick(t)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer transition-colors
                        ${selectedTopic?.id === t.id ? 'bg-teal/5 border-l-2 border-l-teal' : 'hover:bg-card-bg'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {t.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-bold text-sm text-text-primary truncate">{t.studentName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {t.topicType === 'activity' ? (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 truncate max-w-[180px]">
                              ✨ {t.topicLabel}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal/10 text-teal">
                              💬 General Chat
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-text-muted mt-1">
                          {t.messageCount} message{t.messageCount !== 1 ? 's' : ''} · {new Date(t.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <CaretRight size={14} className="text-text-muted mt-2 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: AI Summary */}
            <div className="flex flex-col bg-card-bg">
              <div className="px-4 py-3 border-b border-border bg-card-bg/50 flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkle size={12} weight="fill" className="text-teal" /> AI Summary
                </span>
                {selectedTopic && (
                  <button
                    onClick={() => setSlideOutOpen(true)}
                    className="text-xs font-semibold text-teal hover:text-teal/80 cursor-pointer transition-colors"
                  >
                    View Full Chat →
                  </button>
                )}
              </div>
              <div className="flex-1 p-5 overflow-y-auto max-h-[420px]">
                {selectedTopic ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold">
                        {selectedTopic.initials}
                      </div>
                      <div>
                        <div className="font-heading font-bold text-sm text-text-primary">{selectedTopic.studentName}</div>
                        <div className="text-[10px] text-text-secondary">{selectedTopic.className} · {selectedTopic.topicLabel}</div>
                      </div>
                    </div>

                    {/* Summary card */}
                    <div className="bg-[var(--color-bg)] border border-border rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkle size={14} weight="fill" className="text-teal" />
                        <span className="text-xs font-bold text-teal uppercase">Conversation Summary</span>
                      </div>
                      {summaryLoading ? (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal" />
                          Analyzing conversation...
                        </div>
                      ) : (
                        <p className="text-sm text-text-primary leading-relaxed">{summary}</p>
                      )}
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[var(--color-bg)] border border-border rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-text-primary">{selectedTopic.messageCount}</div>
                        <div className="text-[10px] text-text-secondary">Messages</div>
                      </div>
                      <div className="bg-[var(--color-bg)] border border-border rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-text-primary">
                          {selectedTopic.messages.filter((m: any) => m.role === 'user' || m.message_type === 'student').length}
                        </div>
                        <div className="text-[10px] text-text-secondary">Student Msgs</div>
                      </div>
                      <div className="bg-[var(--color-bg)] border border-border rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-teal">
                          {new Date(selectedTopic.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-text-secondary">Last Active</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="w-14 h-14 rounded-full bg-border/50 flex items-center justify-center mx-auto mb-3">
                        <Sparkle size={28} className="text-text-muted" />
                      </div>
                      <p className="font-heading font-semibold text-sm text-text-primary mb-1">Select a conversation</p>
                      <p className="text-xs text-text-secondary">Click on a chat topic to see the AI summary</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Slide-out Panel: Full Chat (Column 3) */}
      {slideOutOpen && selectedTopic && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSlideOutOpen(false)} />

          {/* Panel */}
          <div className="fixed top-0 right-0 w-full max-w-lg h-full border-l border-border z-50 flex flex-col shadow-2xl" style={{ backgroundColor: 'var(--color-bg, #0F172A)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-heading font-bold text-base text-text-primary">{selectedTopic.studentName}</h3>
                <p className="text-xs text-text-secondary">{selectedTopic.className} · {selectedTopic.topicLabel}</p>
              </div>
              <button onClick={() => setSlideOutOpen(false)}
                className="p-2 rounded-lg hover:bg-border/30 text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {[...selectedTopic.messages]
                .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((m: any) => {
                  const isStudent = m.role === 'user' || m.message_type === 'student';
                  const isAi = m.role === 'assistant' || m.message_type === 'ai';
                  return (
                    <div key={m.id} className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                      isStudent ? 'bg-navy/10 text-text-primary' : isAi ? 'bg-teal/10 text-text-primary ml-auto' : 'bg-warning/10 text-text-primary ml-auto'
                    }`}>
                      <div className="text-[10px] font-bold text-text-secondary mb-1 uppercase">
                        {isStudent ? 'Student' : isAi ? '✨ Spark' : 'Teacher'}
                      </div>
                      {m.content.split('\n\n').map((para: string, i: number) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>
                          {para.split('\n').map((line: string, j: number) => (
                            <span key={j}>{j > 0 && <br />}{line}</span>
                          ))}
                        </p>
                      ))}
                      <div className="text-[10px] text-text-secondary mt-1">
                        {new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function StudentChatsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-secondary">Loading chats...</div>}>
      <StudentChatsContent />
    </Suspense>
  );
}
