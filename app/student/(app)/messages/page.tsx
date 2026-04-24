'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChatText, PaperPlaneRight, ChatsCircle, ArrowLeft,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { authFetch } from '@/lib/api-fetch';

interface ChatMessage {
  id: string;
  sender_id: string;
  class_id: string;
  content: string;
  message_type: string;
  created_at: string;
  senderName: string;
}

interface ClassThread {
  classId: string;
  className: string;
  subject: string;
  icon: string | null;
  lastMessage?: ChatMessage;
  unread: number;
  messages: ChatMessage[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ClassThread[]>([]);
  const [selected, setSelected] = useState<ClassThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      // Fetch enrolled classes via admin API (bypasses RLS)
      const res = await authFetch(`/api/student/classes?studentId=${user.id}`);
      const classData = res.ok ? await res.json() : { classes: [] };
      const classes: any[] = classData.classes ?? [];

      if (classes.length === 0) { setLoading(false); return; }

      const classIds = classes.map((c: any) => c.id);

      // Fetch chat messages for all enrolled classes
      const { data: msgs } = await (supabase as any)
        .from('chat_messages')
        .select('*')
        .in('class_id', classIds)
        .order('created_at', { ascending: true });

      const messages = (msgs ?? []) as ChatMessage[];

      // Get unique sender IDs for name lookup
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      let profileMap = new Map<string, string>();
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', senderIds);
        (profiles ?? []).forEach((p: any) => profileMap.set(p.id, p.display_name || 'Teacher'));
      }

      // Build threads per class
      const threadList: ClassThread[] = classes.map((cls: any) => {
        const classMessages = messages
          .filter(m => m.class_id === cls.id)
          .map(m => ({ ...m, senderName: profileMap.get(m.sender_id) || 'Teacher' }));
        const lastMessage = classMessages[classMessages.length - 1];
        return {
          classId: cls.id,
          className: cls.name,
          subject: cls.subject || '',
          icon: cls.icon,
          lastMessage,
          unread: classMessages.filter(m => m.sender_id !== user.id).length,
          messages: classMessages,
        };
      }).sort((a, b) => {
        const aTime = a.lastMessage?.created_at ?? '';
        const bTime = b.lastMessage?.created_at ?? '';
        return bTime.localeCompare(aTime);
      });

      setThreads(threadList);
      if (threadList.length > 0) setSelected(threadList[0]);
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selected?.messages]);

  async function sendMessage() {
    if (!message.trim() || !selected || !userId) return;
    setSending(true);
    const supabase = createClient();
    const { data: sent } = await (supabase as any)
      .from('chat_messages')
      .insert({
        sender_id: userId,
        class_id: selected.classId,
        content: message.trim(),
        message_type: 'text',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sent) {
      const newMsg: ChatMessage = { ...(sent as ChatMessage), senderName: 'You' };
      const updated = threads.map(t =>
        t.classId === selected.classId
          ? { ...t, messages: [...t.messages, newMsg], lastMessage: newMsg }
          : t
      );
      setThreads(updated);
      setSelected(updated.find(t => t.classId === selected.classId) || null);
      setMessage('');
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center mb-4">
          <ChatText size={32} weight="fill" className="text-teal" />
        </div>
        <h2 className="font-heading text-xl font-bold text-text-primary mb-2">No Classes Yet</h2>
        <p className="text-text-secondary text-sm max-w-sm">Join a class to start messaging your teacher.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 -mx-4 -mt-4 overflow-hidden">
      {/* Thread list */}
      <div className="w-72 shrink-0 border-r border-border bg-card-bg flex flex-col">
        <div className="px-4 py-4 border-b border-border">
          <h1 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
            <ChatsCircle size={20} weight="fill" className="text-teal" />
            Messages
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map(thread => (
            <button
              key={thread.classId}
              onClick={() => setSelected(thread)}
              className={`w-full text-left px-4 py-3.5 border-b border-border/50 transition-colors ${
                selected?.classId === thread.classId ? 'bg-teal/5 border-l-2 border-l-teal' : 'hover:bg-border/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center shrink-0">
                  <ChatsCircle size={18} weight="fill" className="text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-heading font-semibold text-[13px] text-text-primary truncate">{thread.className}</p>
                    {thread.lastMessage && (
                      <span className="text-[10px] text-text-muted shrink-0 ml-1">{timeAgo(thread.lastMessage.created_at)}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary truncate mt-0.5">
                    {thread.lastMessage ? thread.lastMessage.content : 'No messages yet'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-border bg-card-bg flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-navy flex items-center justify-center">
              <ChatsCircle size={16} weight="fill" className="text-white/70" />
            </div>
            <div>
              <p className="font-heading font-bold text-[14px] text-text-primary">{selected.className}</p>
              <p className="text-[11px] text-text-muted">Class messages</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {selected.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ChatText size={32} weight="thin" className="text-text-muted mb-3" />
                <p className="text-text-muted text-sm">No messages yet.</p>
                <p className="text-text-muted text-xs mt-1">Say hello to your teacher!</p>
              </div>
            ) : (
              selected.messages.map(msg => {
                const isMe = msg.sender_id === userId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMe ? '' : ''}`}>
                      {!isMe && (
                        <p className="text-[10px] text-text-muted mb-1 ml-1">{msg.senderName}</p>
                      )}
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-teal text-navy font-medium rounded-br-sm'
                          : 'bg-card-bg border border-border text-text-primary rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[10px] text-text-muted mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                        {timeAgo(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-3 border-t border-border bg-card-bg">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Message your teacher..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface text-text-primary text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="p-2.5 rounded-xl bg-teal text-navy disabled:opacity-40 transition-colors hover:bg-teal/90"
              >
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-text-muted">
          Select a class to view messages
        </div>
      )}
    </div>
  );
}
