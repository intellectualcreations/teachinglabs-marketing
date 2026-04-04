'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ChatsCircle, PaperPlaneRight, ArrowLeft, Plus, Clock, Sparkle,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

interface ChatMessage {
  id: string;
  sender_id: string;
  class_id: string;
  content: string;
  message_type: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  firstMessage: string;
  lastActivity: string;
  messageCount: number;
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
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Group messages into sessions by 30-min gaps */
function groupIntoSessions(messages: ChatMessage[]): ChatSession[] {
  if (messages.length === 0) return [];

  const sorted = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const sessions: ChatSession[] = [];
  let currentSession: ChatMessage[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const gap = new Date(sorted[i].created_at).getTime() - new Date(sorted[i - 1].created_at).getTime();
    if (gap > 30 * 60 * 1000) {
      // 30 min gap = new session
      sessions.push({
        id: currentSession[0].id,
        firstMessage: currentSession[0].content,
        lastActivity: currentSession[currentSession.length - 1].created_at,
        messageCount: currentSession.length,
        messages: currentSession,
      });
      currentSession = [sorted[i]];
    } else {
      currentSession.push(sorted[i]);
    }
  }

  // Push last session
  sessions.push({
    id: currentSession[0].id,
    firstMessage: currentSession[0].content,
    lastActivity: currentSession[currentSession.length - 1].created_at,
    messageCount: currentSession.length,
    messages: currentSession,
  });

  // Most recent first
  return sessions.reverse();
}

export default function ClassChatPage() {
  const params = useParams();
  const classId = params.id as string;
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [newChatMode, setNewChatMode] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // Get class name
        let authHeaders: Record<string, string> = {};
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          if (sess?.access_token) authHeaders = { 'Authorization': `Bearer ${sess.access_token}` };
        } catch { /* ignore */ }

        const classRes = await fetch(`/api/student/my-classes?userId=${user.id}`, { headers: authHeaders });
        if (classRes.ok) {
          const classJson = await classRes.json();
          const cls = (classJson.classes ?? []).find((c: { id: string; name: string }) => c.id === classId);
          if (cls) setClassName(cls.name);
        }

        // Get chat messages for this class from this student + AI
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('class_id', classId)
          .or(`sender_id.eq.${user.id},message_type.eq.ai`)
          .order('created_at', { ascending: true });

        const chatMessages = (messages ?? []) as ChatMessage[];
        const grouped = groupIntoSessions(chatMessages);
        setSessions(grouped);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !userId || sending) return;
    setSending(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: userId,
          class_id: classId,
          content: input.trim(),
          message_type: 'student',
        } as never)
        .select()
        .single();

      if (!error && data) {
        const newMsg = data as ChatMessage;
        if (activeSession) {
          setActiveSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, newMsg],
            messageCount: prev.messageCount + 1,
            lastActivity: newMsg.created_at,
          } : null);
        } else if (newChatMode) {
          const newSession: ChatSession = {
            id: newMsg.id,
            firstMessage: newMsg.content,
            lastActivity: newMsg.created_at,
            messageCount: 1,
            messages: [newMsg],
          };
          setActiveSession(newSession);
          setSessions(prev => [newSession, ...prev]);
          setNewChatMode(false);
        }
        setInput('');
      }
    } finally {
      setSending(false);
    }
  }, [input, userId, classId, sending, activeSession, newChatMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  // Active chat view (viewing a session or new chat)
  if (activeSession || newChatMode) {
    const messages = activeSession?.messages ?? [];
    return (
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
          <button
            onClick={() => { setActiveSession(null); setNewChatMode(false); }}
            className="w-8 h-8 rounded-lg bg-card-bg border border-border flex items-center justify-center hover:bg-border transition-colors"
          >
            <ArrowLeft size={16} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="font-heading font-bold text-text-primary">
              {newChatMode ? 'New Chat' : `Chat Session`}
            </h1>
            <p className="text-xs text-text-secondary">{className}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {messages.length === 0 && newChatMode && (
            <div className="text-center py-12">
              <Sparkle size={40} weight="fill" className="text-teal/30 mx-auto mb-3" />
              <p className="text-text-secondary text-sm">Start a conversation about {className}!</p>
              <p className="text-text-muted text-xs mt-1">Ask questions, get help with activities, or explore topics.</p>
            </div>
          )}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender_id === userId
                    ? 'bg-teal text-navy rounded-br-md'
                    : 'bg-card-bg border border-border text-text-primary rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border pt-4 pb-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-11 h-11 rounded-xl bg-teal text-navy flex items-center justify-center hover:bg-teal/90 transition-colors disabled:opacity-50"
            >
              <PaperPlaneRight size={18} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sessions list view
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Chat</h1>
          <p className="text-sm text-text-secondary">{className}</p>
        </div>
        <button
          onClick={() => setNewChatMode(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal/90 transition-colors"
        >
          <Plus size={16} weight="bold" />
          New Chat
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-card-bg rounded-2xl border border-border p-12 text-center">
          <ChatsCircle size={40} weight="fill" className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary font-medium mb-1">No chats yet</p>
          <p className="text-text-muted text-sm mb-4">Start your first conversation about {className}!</p>
          <button
            onClick={() => setNewChatMode(true)}
            className="px-5 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal/90 transition-colors"
          >
            Start Chatting
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session)}
              className="w-full bg-card-bg rounded-xl border border-border p-4 hover:border-teal/40 transition-colors text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <ChatsCircle size={20} weight="fill" className="text-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-teal transition-colors">
                    {session.firstMessage.length > 80 ? session.firstMessage.slice(0, 80) + '...' : session.firstMessage}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(session.lastActivity)}
                    </span>
                    <span className="text-xs text-text-muted">
                      {session.messageCount} message{session.messageCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
