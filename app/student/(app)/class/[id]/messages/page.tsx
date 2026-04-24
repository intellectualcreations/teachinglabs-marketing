'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  PaperPlaneRight, MegaphoneSimple, UserCircle, UsersThree, Clock,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { authFetch } from '@/lib/api-fetch';

interface ClassMessage {
  id: string;
  class_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'teacher' | 'student';
  content: string;
  target_type: 'class' | 'group' | 'individual';
  created_at: string;
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

export default function ClassMessageBoardPage() {
  const params = useParams();
  const classId = params.id as string;
  const [messages, setMessages] = useState<ClassMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [className, setClassName] = useState('');
  const [userId, setUserId] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // Fetch class name
        const classRes = await authFetch(`/api/teacher/class-details?classId=${classId}`);
        if (classRes.ok) {
          const classData = await classRes.json();
          setClassName(classData.class?.name || 'Class');
        }

        // Fetch messages
        const res = await authFetch(`/api/student/class-messages?classId=${classId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await authFetch('/api/student/class-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          content: newMessage.trim(),
          targetType: 'class',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-teal border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 border-b border-border">
        <MegaphoneSimple size={24} weight="fill" className="text-navy" />
        <div>
          <h1 className="font-heading font-bold text-lg text-text-primary">{className} Message Board</h1>
          <p className="text-xs text-text-muted">Share with your class, ask questions, and stay connected</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MegaphoneSimple size={48} weight="fill" className="text-text-muted/20 mb-4" />
            <p className="text-sm text-text-muted font-medium">No messages yet</p>
            <p className="text-xs text-text-muted/70 mt-1">Be the first to post something!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === userId;
            const isTeacher = msg.sender_role === 'teacher';
            return (
              <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isTeacher ? 'bg-navy' : 'bg-teal'
                }`}>
                  {isTeacher ? (
                    <UsersThree size={14} weight="fill" className="text-white" />
                  ) : (
                    <UserCircle size={14} weight="fill" className="text-white" />
                  )}
                </div>
                <div className={`max-w-[75%] ${isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${isTeacher ? 'text-navy' : 'text-text-primary'}`}>
                      {msg.sender_name}
                      {isTeacher && <span className="ml-1 text-[10px] bg-navy/10 text-navy px-1.5 py-0.5 rounded-full">Teacher</span>}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                      <Clock size={10} />
                      {timeAgo(msg.created_at)}
                    </span>
                  </div>
                  <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    isOwn
                      ? 'bg-teal text-white rounded-tr-sm'
                      : isTeacher
                        ? 'bg-navy/5 border border-navy/10 text-text-primary rounded-tl-sm'
                        : 'bg-card-bg border border-border text-text-primary rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Write a message to the class..."
            className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm bg-surface
              text-text-primary placeholder:text-text-muted outline-none focus:border-teal transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-xl bg-teal text-white flex items-center justify-center
              hover:bg-teal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <PaperPlaneRight size={18} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
