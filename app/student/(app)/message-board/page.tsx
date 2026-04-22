'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChatsCircle, PaperPlaneRight, ArrowLeft, Plus, Lock, UsersThree, ChatCircleText,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

interface ClassRow { id: string; name: string; subject: string | null; icon: string | null; allow_student_topics?: boolean; }
interface Topic {
  id: string;
  class_id: string;
  title: string;
  created_by: string;
  created_by_name: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  reply_count: number;
  last_reply_at: string;
  last_reply_preview: string | null;
}
interface Reply {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StudentMessageBoardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [activeClass, setActiveClass] = useState<ClassRow | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topicReplies, setTopicReplies] = useState<Reply[]>([]);
  const [topicParticipants, setTopicParticipants] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // Init: auth + classes
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const res = await fetch(`/api/student/classes?studentId=${user.id}`);
      const data = res.ok ? await res.json() : { classes: [] };
      const rows: ClassRow[] = data.classes ?? [];

      // Fetch allow_student_topics flag per class (single query batched)
      if (rows.length > 0) {
        const { data: flags } = await (supabase as any)
          .from('classes')
          .select('id, allow_student_topics')
          .in('id', rows.map(r => r.id));
        const flagMap = new Map((flags ?? []).map((f: any) => [f.id, f.allow_student_topics]));
        rows.forEach(r => { r.allow_student_topics = flagMap.has(r.id) ? flagMap.get(r.id) as boolean : true; });
      }

      setClasses(rows);
      if (rows.length > 0) setActiveClass(rows[0]);
      setLoading(false);
    }
    init();
  }, [router]);

  // Load topics for active class
  const loadTopics = useCallback(async () => {
    if (!activeClass || !userId) return;
    setLoadingTopics(true);
    const res = await fetch(`/api/message-board/topics?classId=${activeClass.id}&userId=${userId}&role=student`);
    const data = res.ok ? await res.json() : { topics: [] };
    setTopics(data.topics ?? []);
    setLoadingTopics(false);
  }, [activeClass, userId]);

  useEffect(() => { loadTopics(); }, [loadTopics]);

  // Load a topic's replies
  async function openTopic(topic: Topic) {
    setSelectedTopic(topic);
    setLoadingTopic(true);
    setShowParticipantsList(false);
    const res = await fetch(`/api/message-board/topics/${topic.id}?userId=${userId}&role=student`);
    const data = res.ok ? await res.json() : { replies: [], participants: [] };
    setTopicReplies(data.replies ?? []);
    setTopicParticipants(data.participants ?? []);
    setLoadingTopic(false);
  }

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [topicReplies]);

  async function sendReply() {
    if (!selectedTopic || !replyText.trim() || !userId) return;
    setSending(true);
    const res = await fetch(`/api/message-board/topics/${selectedTopic.id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: 'student', content: replyText.trim() }),
    });
    if (res.ok) {
      const { reply } = await res.json();
      const enriched: Reply = {
        ...reply,
        sender_name: 'You',
        sender_role: 'student',
      };
      setTopicReplies(prev => [...prev, enriched]);
      setReplyText('');
    }
    setSending(false);
  }

  async function createTopic() {
    if (!activeClass || !userId || !newTitle.trim()) return;
    setCreating(true);
    const res = await fetch('/api/message-board/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: activeClass.id,
        userId,
        role: 'student',
        title: newTitle.trim(),
      }),
    });
    if (res.ok) {
      setNewTitle('');
      setShowNewTopic(false);
      await loadTopics();
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Failed to create topic' }));
      alert(error || 'Failed to create topic');
    }
    setCreating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center mb-4">
          <ChatsCircle size={32} weight="fill" className="text-teal" />
        </div>
        <h2 className="font-heading text-xl font-bold text-text-primary mb-2">No Classes Yet</h2>
        <p className="text-text-secondary text-sm max-w-sm">Join a class to see your message board.</p>
      </div>
    );
  }

  const canCreate = activeClass?.allow_student_topics !== false;

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 -mx-4 -mt-4 overflow-hidden">
      {/* Class list */}
      <div className="w-60 shrink-0 border-r border-border bg-card-bg flex flex-col">
        <div className="px-4 py-4 border-b border-border">
          <h1 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
            <ChatsCircle size={20} weight="fill" className="text-teal" />
            Message Board
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => { setActiveClass(cls); setSelectedTopic(null); }}
              className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors ${
                activeClass?.id === cls.id ? 'bg-teal/5 border-l-2 border-l-teal' : 'hover:bg-border/20'
              }`}
            >
              <p className="font-heading font-semibold text-[13px] text-text-primary truncate">{cls.name}</p>
              <p className="text-[11px] text-text-muted truncate mt-0.5">{cls.subject || 'Class'}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-0">
        {!selectedTopic ? (
          // Topic list
          <>
            <div className="px-5 py-4 border-b border-border bg-card-bg flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-[15px] text-text-primary">{activeClass?.name}</p>
                <p className="text-[11px] text-text-muted">{topics.length} {topics.length === 1 ? 'topic' : 'topics'}</p>
              </div>
              {canCreate ? (
                <button
                  onClick={() => setShowNewTopic(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal text-navy text-sm font-semibold hover:bg-teal/90"
                >
                  <Plus size={16} weight="bold" />
                  New Topic
                </button>
              ) : (
                <span className="text-[11px] text-text-muted">Topic creation is off for this class</span>
              )}
            </div>

            {showNewTopic && (
              <div className="px-5 py-3 border-b border-border bg-teal/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') createTopic(); }}
                    placeholder="Topic title..."
                    autoFocus
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                  <button
                    onClick={createTopic}
                    disabled={!newTitle.trim() || creating}
                    className="px-3 py-2 rounded-lg bg-teal text-navy text-sm font-semibold disabled:opacity-40"
                  >Create</button>
                  <button
                    onClick={() => { setShowNewTopic(false); setNewTitle(''); }}
                    className="px-3 py-2 rounded-lg border border-border text-text-secondary text-sm"
                  >Cancel</button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {loadingTopics ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal" />
                </div>
              ) : topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ChatCircleText size={40} weight="thin" className="text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">No topics yet.</p>
                  {canCreate && <p className="text-text-muted text-xs mt-1">Be the first to start a conversation.</p>}
                </div>
              ) : topics.map(t => (
                <button
                  key={t.id}
                  onClick={() => openTopic(t)}
                  className="w-full text-left px-5 py-4 border-b border-border/50 hover:bg-border/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {t.is_private && <Lock size={12} weight="fill" className="text-teal" />}
                        <p className="font-heading font-semibold text-[14px] text-text-primary truncate">{t.title}</p>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">Started by {t.created_by_name}</p>
                      {t.last_reply_preview && (
                        <p className="text-[12px] text-text-secondary mt-1.5 truncate">{t.last_reply_preview}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-text-muted">{timeAgo(t.last_reply_at)}</span>
                      <p className="text-[10px] text-text-muted mt-0.5">{t.reply_count} {t.reply_count === 1 ? 'reply' : 'replies'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          // Thread view
          <>
            <div className="px-5 py-3.5 border-b border-border bg-card-bg flex items-center gap-3">
              <button
                onClick={() => { setSelectedTopic(null); setTopicReplies([]); loadTopics(); }}
                className="w-8 h-8 rounded-lg hover:bg-border/20 flex items-center justify-center text-text-secondary"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {selectedTopic.is_private && <Lock size={12} weight="fill" className="text-teal" />}
                  <p className="font-heading font-bold text-[14px] text-text-primary truncate">{selectedTopic.title}</p>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-[11px] text-text-muted">Started by {selectedTopic.created_by_name}</p>
                  {topicParticipants.length > 0 && (
                    <button
                      onClick={() => setShowParticipantsList((v) => !v)}
                      className="text-[11px] text-teal hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {selectedTopic.is_private ? (
                        <>· <Lock size={10} weight="fill" /> {topicParticipants.length} in this group</>
                      ) : (
                        <>· Whole class ({topicParticipants.length})</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showParticipantsList && topicParticipants.length > 0 && (
              <div className="px-5 py-3 border-b border-border bg-teal/5">
                <p className="text-[10px] uppercase tracking-[0.5px] font-bold text-text-secondary mb-2">
                  {selectedTopic.is_private ? 'In this group' : 'Everyone in the class'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {topicParticipants.map((p) => (
                    <span key={p.id} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${p.role === 'teacher' ? 'bg-teal/20 text-teal' : 'bg-surface border border-border text-text-primary'}`}>
                      {p.name}{p.role === 'teacher' ? ' · Teacher' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingTopic ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal" />
                </div>
              ) : topicReplies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ChatCircleText size={32} weight="thin" className="text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">No messages yet. Say something!</p>
                </div>
              ) : topicReplies.map(r => {
                const isMe = r.sender_id === userId;
                const isTeacher = r.sender_role === 'teacher' || r.sender_role === 'instructor';
                return (
                  <div key={r.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                      {!isMe && (
                        <p className="text-[10px] text-text-muted mb-1 ml-1 flex items-center gap-1">
                          {r.sender_name}
                          {isTeacher && <span className="text-[9px] font-bold text-teal uppercase">Teacher</span>}
                        </p>
                      )}
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-teal text-navy font-medium rounded-br-sm'
                          : isTeacher
                            ? 'bg-teal/10 border border-teal/30 text-text-primary rounded-bl-sm'
                            : 'bg-card-bg border border-border text-text-primary rounded-bl-sm'
                      }`}>
                        {r.content}
                      </div>
                      <p className={`text-[10px] text-text-muted mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>{timeAgo(r.created_at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-5 py-3 border-t border-border bg-card-bg">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Post a reply..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface text-text-primary text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim() || sending}
                  className="p-2.5 rounded-xl bg-teal text-navy disabled:opacity-40 hover:bg-teal/90"
                >
                  <PaperPlaneRight size={18} weight="fill" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
