'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChatsCircle, PaperPlaneRight, ArrowLeft, Plus, Lock, UsersThree, ChatCircleText,
  Flag, Warning, Question, Lightning, X, Gear, Check,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

interface ClassRow { id: string; name: string; subject: string | null; icon: string | null; allow_student_topics: boolean; }
interface StudentRow { id: string; display_name: string; }
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
  open_flag_count: number;
}
interface Reply {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
  flagged_reason?: 'content' | 'question' | 'urgent' | null;
  flagged_explanation?: string | null;
  flagged_highlight?: string | null;
  flagged_dismissed_at?: string | null;
}
interface FlaggedItem extends Reply {
  topic_id: string;
  topic_title: string;
  class_id: string;
  class_name: string;
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

function FlagBadge({ reason }: { reason: 'content' | 'question' | 'urgent' }) {
  const cfg = {
    content: { label: 'Content', Icon: Warning, cls: 'bg-red-50 text-red-700 border-red-200' },
    question: { label: 'Question', Icon: Question, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    urgent: { label: 'Urgent', Icon: Lightning, cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  }[reason];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.cls}`}>
      <cfg.Icon size={11} weight="fill" />
      {cfg.label}
    </span>
  );
}

// Wrap highlight substring inside a message with a <mark> element
function renderWithHighlight(content: string, highlight: string | null | undefined) {
  if (!highlight || !highlight.trim()) return content;
  const idx = content.indexOf(highlight);
  if (idx === -1) return content;
  return (
    <>
      {content.slice(0, idx)}
      <mark className="bg-yellow-100 text-navy px-0.5 rounded">{content.slice(idx, idx + highlight.length)}</mark>
      {content.slice(idx + highlight.length)}
    </>
  );
}

export default function TeacherMessageBoardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [activeClass, setActiveClass] = useState<ClassRow | null>(null);
  const [roster, setRoster] = useState<StudentRow[]>([]);
  const [tab, setTab] = useState<'topics' | 'flagged'>('topics');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loading, setLoading] = useState(true);

  const [flagged, setFlagged] = useState<FlaggedItem[]>([]);
  const [loadingFlagged, setLoadingFlagged] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topicReplies, setTopicReplies] = useState<Reply[]>([]);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [highlightReplyId, setHighlightReplyId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [newParticipants, setNewParticipants] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [settingAllow, setSettingAllow] = useState(true);
  const [savingSetting, setSavingSetting] = useState(false);

  // Init
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const res = await fetch(`/api/classes/by-teacher?teacherId=${user.id}`);
      const data = res.ok ? await res.json() : [];
      const rows: ClassRow[] = Array.isArray(data) ? data : (data.classes ?? []);
      setClasses(rows);
      if (rows.length > 0) setActiveClass(rows[0]);
      setLoading(false);
    }
    init();
  }, [router]);

  // Load topics when activeClass changes
  const loadTopics = useCallback(async () => {
    if (!activeClass || !userId) return;
    setLoadingTopics(true);
    const res = await fetch(`/api/message-board/topics?classId=${activeClass.id}&userId=${userId}&role=teacher`);
    const data = res.ok ? await res.json() : { topics: [] };
    setTopics(data.topics ?? []);
    setSettingAllow(activeClass.allow_student_topics !== false);
    setLoadingTopics(false);
  }, [activeClass, userId]);

  // Load roster when activeClass changes (for private topic picker)
  const loadRoster = useCallback(async () => {
    if (!activeClass) return;
    const res = await fetch(`/api/teacher/students?teacherId=${userId}`);
    if (!res.ok) return;
    const data = await res.json();
    const enrollments: Array<{ student_id: string; class_id: string }> = data.enrollments ?? [];
    const students: Array<{ id: string; display_name: string; preferred_name?: string }> = data.students ?? [];
    const inClass = new Set(enrollments.filter(e => e.class_id === activeClass.id).map(e => e.student_id));
    const roster = students.filter(s => inClass.has(s.id)).map(s => ({ id: s.id, display_name: s.preferred_name || s.display_name || 'Student' }));
    setRoster(roster);
  }, [activeClass, userId]);

  useEffect(() => { loadTopics(); }, [loadTopics]);
  useEffect(() => { loadRoster(); }, [loadRoster]);

  // Load flagged
  const loadFlagged = useCallback(async () => {
    if (!userId) return;
    setLoadingFlagged(true);
    const res = await fetch(`/api/message-board/flagged?teacherId=${userId}`);
    const data = res.ok ? await res.json() : { flagged: [] };
    setFlagged(data.flagged ?? []);
    setLoadingFlagged(false);
  }, [userId]);

  useEffect(() => { if (tab === 'flagged') loadFlagged(); }, [tab, loadFlagged]);

  async function openTopic(topic: Topic, scrollToReplyId?: string) {
    setSelectedTopic(topic);
    setLoadingTopic(true);
    setHighlightReplyId(scrollToReplyId ?? null);
    const res = await fetch(`/api/message-board/topics/${topic.id}?userId=${userId}&role=teacher`);
    const data = res.ok ? await res.json() : { replies: [] };
    setTopicReplies(data.replies ?? []);
    setLoadingTopic(false);
  }

  useEffect(() => {
    if (highlightReplyId) {
      const el = document.getElementById(`reply-${highlightReplyId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [topicReplies, highlightReplyId]);

  async function sendReply() {
    if (!selectedTopic || !replyText.trim() || !userId) return;
    setSending(true);
    const res = await fetch(`/api/message-board/topics/${selectedTopic.id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: 'teacher', content: replyText.trim() }),
    });
    if (res.ok) {
      const { reply } = await res.json();
      setTopicReplies(prev => [...prev, { ...reply, sender_name: 'You', sender_role: 'teacher' }]);
      setReplyText('');
    }
    setSending(false);
  }

  async function createTopic() {
    if (!activeClass || !userId || !newTitle.trim()) return;
    setCreating(true);
    const body: any = {
      classId: activeClass.id,
      userId,
      role: 'teacher',
      title: newTitle.trim(),
      is_private: newIsPrivate,
    };
    if (newIsPrivate) body.participant_ids = [...newParticipants];
    const res = await fetch('/api/message-board/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setNewTitle(''); setNewIsPrivate(false); setNewParticipants(new Set());
      setShowNewTopic(false);
      await loadTopics();
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Failed' }));
      alert(error || 'Failed to create topic');
    }
    setCreating(false);
  }

  async function dismissFlag(replyId: string) {
    await fetch(`/api/message-board/replies/${replyId}/dismiss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setFlagged(prev => prev.filter(f => f.id !== replyId));
    // If currently viewing the topic, update in-view reply too
    setTopicReplies(prev => prev.map(r => r.id === replyId ? { ...r, flagged_dismissed_at: new Date().toISOString() } : r));
  }

  async function saveSetting() {
    if (!activeClass || !userId) return;
    setSavingSetting(true);
    const res = await fetch(`/api/classes/${activeClass.id}/allow-student-topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: userId, allow: settingAllow }),
    });
    if (res.ok) {
      setActiveClass({ ...activeClass, allow_student_topics: settingAllow });
      setClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, allow_student_topics: settingAllow } : c));
      setShowSettings(false);
    }
    setSavingSetting(false);
  }

  function toggleParticipant(id: string) {
    setNewParticipants(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
        <p className="text-text-secondary text-sm max-w-sm">Create a class to use the message board.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 -mx-4 -mt-4 overflow-hidden">
      {/* Sidebar: classes + tabs */}
      <div className="w-60 shrink-0 border-r border-border bg-card-bg flex flex-col">
        <div className="px-4 py-4 border-b border-border">
          <h1 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
            <ChatsCircle size={20} weight="fill" className="text-teal" />
            Message Board
          </h1>
        </div>
        <div className="px-2 py-2 border-b border-border flex gap-1">
          <button
            onClick={() => setTab('topics')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${tab === 'topics' ? 'bg-teal text-navy' : 'text-text-secondary hover:bg-border/20'}`}
          >Topics</button>
          <button
            onClick={() => setTab('flagged')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${tab === 'flagged' ? 'bg-red-500 text-white' : 'text-text-secondary hover:bg-border/20'}`}
          >
            <Flag size={12} weight="fill" />
            Flagged
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tab === 'topics' && classes.map(cls => (
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
        {tab === 'flagged' ? (
          <FlaggedView flagged={flagged} loading={loadingFlagged} onOpen={async (f) => {
            // Find topic in loaded topics, or synthesize minimal one
            const t: Topic = topics.find(x => x.id === f.topic_id) ?? {
              id: f.topic_id,
              class_id: f.class_id,
              title: f.topic_title,
              created_by: '',
              created_by_name: '',
              is_private: false,
              created_at: f.created_at,
              updated_at: f.created_at,
              reply_count: 0,
              last_reply_at: f.created_at,
              last_reply_preview: null,
              open_flag_count: 0,
            };
            const cls = classes.find(c => c.id === f.class_id);
            if (cls) setActiveClass(cls);
            setTab('topics');
            openTopic(t, f.id);
          }} onDismiss={dismissFlag} />
        ) : !selectedTopic ? (
          <>
            <div className="px-5 py-4 border-b border-border bg-card-bg flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-[15px] text-text-primary">{activeClass?.name}</p>
                <p className="text-[11px] text-text-muted">
                  {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
                  {activeClass && activeClass.allow_student_topics === false && ' · students cannot create topics'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-8 h-8 rounded-lg border border-border text-text-secondary hover:bg-border/20 flex items-center justify-center"
                  title="Class settings"
                >
                  <Gear size={16} />
                </button>
                <button
                  onClick={() => setShowNewTopic(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal text-navy text-sm font-semibold hover:bg-teal/90"
                >
                  <Plus size={16} weight="bold" />
                  New Topic
                </button>
              </div>
            </div>

            {showSettings && activeClass && (
              <div className="px-5 py-3 border-b border-border bg-teal/5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingAllow}
                    onChange={e => setSettingAllow(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-text-primary">Allow students to create topics in this class</span>
                </label>
                <div className="flex gap-2 mt-3">
                  <button onClick={saveSetting} disabled={savingSetting} className="px-3 py-1.5 rounded-lg bg-teal text-navy text-sm font-semibold disabled:opacity-40">Save</button>
                  <button onClick={() => setShowSettings(false)} className="px-3 py-1.5 rounded-lg border border-border text-text-secondary text-sm">Cancel</button>
                </div>
              </div>
            )}

            {showNewTopic && (
              <div className="px-5 py-3 border-b border-border bg-teal/5 space-y-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Topic title..."
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newIsPrivate} onChange={e => setNewIsPrivate(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-text-primary flex items-center gap-1.5">
                    <Lock size={13} weight="fill" className="text-teal" />
                    Private — only selected students can see this topic
                  </span>
                </label>
                {newIsPrivate && (
                  <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-2 bg-surface">
                    {roster.length === 0 ? (
                      <p className="text-text-muted text-xs p-2">No students enrolled in this class yet.</p>
                    ) : roster.map(s => (
                      <label key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-border/20">
                        <input
                          type="checkbox"
                          checked={newParticipants.has(s.id)}
                          onChange={() => toggleParticipant(s.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-text-primary">{s.display_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={createTopic} disabled={!newTitle.trim() || creating || (newIsPrivate && newParticipants.size === 0)} className="px-3 py-1.5 rounded-lg bg-teal text-navy text-sm font-semibold disabled:opacity-40">Create</button>
                  <button onClick={() => { setShowNewTopic(false); setNewTitle(''); setNewIsPrivate(false); setNewParticipants(new Set()); }} className="px-3 py-1.5 rounded-lg border border-border text-text-secondary text-sm">Cancel</button>
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
                        {t.open_flag_count > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            <Flag size={10} weight="fill" />
                            {t.open_flag_count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">Started by {t.created_by_name}</p>
                      {t.last_reply_preview && <p className="text-[12px] text-text-secondary mt-1.5 truncate">{t.last_reply_preview}</p>}
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
          <>
            <div className="px-5 py-3.5 border-b border-border bg-card-bg flex items-center gap-3">
              <button
                onClick={() => { setSelectedTopic(null); setTopicReplies([]); setHighlightReplyId(null); loadTopics(); }}
                className="w-8 h-8 rounded-lg hover:bg-border/20 flex items-center justify-center text-text-secondary"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {selectedTopic.is_private && <Lock size={12} weight="fill" className="text-teal" />}
                  <p className="font-heading font-bold text-[14px] text-text-primary truncate">{selectedTopic.title}</p>
                </div>
                <p className="text-[11px] text-text-muted">Started by {selectedTopic.created_by_name}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingTopic ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal" />
                </div>
              ) : topicReplies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ChatCircleText size={32} weight="thin" className="text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">No messages yet.</p>
                </div>
              ) : topicReplies.map(r => {
                const isMe = r.sender_id === userId;
                const isTeacher = r.sender_role === 'teacher' || r.sender_role === 'instructor';
                const isFlagged = !!r.flagged_reason && !r.flagged_dismissed_at;
                const isHighlighted = highlightReplyId === r.id;
                return (
                  <div key={r.id} id={`reply-${r.id}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isHighlighted ? 'ring-2 ring-yellow-300 rounded-xl p-1 -m-1' : ''}`}>
                    <div className="max-w-[75%]">
                      {!isMe && (
                        <p className="text-[10px] text-text-muted mb-1 ml-1 flex items-center gap-1.5">
                          {r.sender_name}
                          {isTeacher && <span className="text-[9px] font-bold text-teal uppercase">Teacher</span>}
                          {isFlagged && r.flagged_reason && <FlagBadge reason={r.flagged_reason} />}
                        </p>
                      )}
                      {isFlagged && r.flagged_explanation && (
                        <div className="px-2.5 py-1.5 rounded-t-xl bg-yellow-50 border border-yellow-200 border-b-0 text-[11px] text-yellow-900">
                          <span className="font-semibold">AI flagged:</span> {r.flagged_explanation}
                        </div>
                      )}
                      <div className={`px-3.5 py-2.5 text-sm ${
                        isFlagged ? 'rounded-b-2xl border border-yellow-200 bg-yellow-50/40 text-text-primary' :
                        isMe ? 'rounded-2xl bg-teal text-navy font-medium rounded-br-sm' :
                        isTeacher ? 'rounded-2xl bg-teal/10 border border-teal/30 text-text-primary rounded-bl-sm' :
                        'rounded-2xl bg-card-bg border border-border text-text-primary rounded-bl-sm'
                      }`}>
                        {renderWithHighlight(r.content, r.flagged_highlight)}
                      </div>
                      <div className={`flex items-center gap-2 mt-1 ${isMe ? 'justify-end mr-1' : 'ml-1'}`}>
                        <p className="text-[10px] text-text-muted">{timeAgo(r.created_at)}</p>
                        {isFlagged && (
                          <button
                            onClick={() => dismissFlag(r.id)}
                            className="inline-flex items-center gap-0.5 text-[10px] text-text-secondary hover:text-teal"
                          >
                            <Check size={10} />
                            Dismiss flag
                          </button>
                        )}
                      </div>
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
                  placeholder="Reply as teacher..."
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

function FlaggedView({
  flagged, loading, onOpen, onDismiss,
}: {
  flagged: FlaggedItem[];
  loading: boolean;
  onOpen: (f: FlaggedItem) => void;
  onDismiss: (replyId: string) => void;
}) {
  return (
    <>
      <div className="px-5 py-4 border-b border-border bg-card-bg">
        <p className="font-heading font-bold text-[15px] text-text-primary flex items-center gap-2">
          <Flag size={18} weight="fill" className="text-red-500" />
          Flagged Messages
        </p>
        <p className="text-[11px] text-text-muted">AI-flagged messages across all your classes</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal" />
          </div>
        ) : flagged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Check size={40} weight="thin" className="text-text-muted mb-3" />
            <p className="text-text-muted text-sm">All clear. No flagged messages.</p>
          </div>
        ) : flagged.map(f => (
          <div key={f.id} className="px-5 py-4 border-b border-border/50 hover:bg-border/10 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {f.flagged_reason && <FlagBadge reason={f.flagged_reason} />}
                  <span className="text-[11px] text-text-muted">{f.class_name} · {f.topic_title}</span>
                </div>
                {f.flagged_explanation && (
                  <p className="text-[12px] text-yellow-900 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mt-2 inline-block">
                    <span className="font-semibold">AI flagged:</span> {f.flagged_explanation}
                  </p>
                )}
                <p className="text-[13px] text-text-primary mt-2">
                  <span className="font-semibold">{f.sender_name}:</span>{' '}
                  {renderWithHighlight(f.content, f.flagged_highlight)}
                </p>
                <p className="text-[10px] text-text-muted mt-1">{timeAgo(f.created_at)}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => onOpen(f)}
                  className="px-2.5 py-1 rounded-lg bg-teal text-navy text-xs font-semibold hover:bg-teal/90"
                >Open</button>
                <button
                  onClick={() => onDismiss(f.id)}
                  className="px-2.5 py-1 rounded-lg border border-border text-text-secondary text-xs hover:bg-border/20"
                >Dismiss</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
