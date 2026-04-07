'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ChatsCircle, PaperPlaneRight, ArrowLeft, Plus, Clock, Sparkle,
  Paperclip, Image as ImageIcon, FileText, VideoCamera, X,
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

interface PendingAttachment {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'document';
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

function getFileType(file: File): 'image' | 'video' | 'document' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'document';
}

function getFileIcon(type: string) {
  if (type === 'image') return ImageIcon;
  if (type === 'video') return VideoCamera;
  return FileText;
}

/** Parse attachment from message content if present */
function parseAttachment(content: string): { text: string; attachmentUrl?: string; attachmentType?: string; attachmentName?: string } {
  if (content.startsWith('[[ATTACHMENT:')) {
    const endIdx = content.indexOf(']]');
    if (endIdx > 0) {
      try {
        const meta = JSON.parse(content.substring(13, endIdx));
        return {
          text: content.substring(endIdx + 2).trim(),
          attachmentUrl: meta.url,
          attachmentType: meta.type,
          attachmentName: meta.name,
        };
      } catch { /* ignore */ }
    }
  }
  return { text: content };
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
      sessions.push({
        id: currentSession[0].id,
        firstMessage: currentSession.find(m => m.message_type === 'student')?.content || currentSession[0].content,
        lastActivity: currentSession[currentSession.length - 1].created_at,
        messageCount: currentSession.length,
        messages: currentSession,
      });
      currentSession = [sorted[i]];
    } else {
      currentSession.push(sorted[i]);
    }
  }

  sessions.push({
    id: currentSession[0].id,
    firstMessage: currentSession.find(m => m.message_type === 'student')?.content || currentSession[0].content,
    lastActivity: currentSession[currentSession.length - 1].created_at,
    messageCount: currentSession.length,
    messages: currentSession,
  });

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
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // Get student preferred name
        let name = 'there';
        try {
          const { data: assessmentData } = await supabase
            .from('student_assessments')
            .select('preferred_name')
            .eq('student_id', user.id)
            .single();
          if (assessmentData && (assessmentData as { preferred_name?: string }).preferred_name) {
            name = (assessmentData as { preferred_name: string }).preferred_name;
          }
        } catch { /* ignore */ }
        if (name === 'there') {
          const { data: profileRaw } = await supabase
            .from('profiles')
            .select('preferred_name, display_name')
            .eq('id', user.id)
            .single();
          const profile = profileRaw as { preferred_name: string | null; display_name: string | null } | null;
          if (profile) {
            name = profile.preferred_name || profile.display_name?.split(' ')[0] || 'there';
          }
        }
        setStudentName(name);

        // Get class info
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

        // Get chat messages via admin API (bypasses RLS)
        const chatRes = await fetch(`/api/student/chat?classId=${classId}&userId=${user.id}`);
        const chatJson = chatRes.ok ? await chatRes.json() : { messages: [] };
        const chatMessages = (chatJson.messages ?? []) as ChatMessage[];
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
  }, [activeSession?.messages, isTyping]);

  useEffect(() => {
    if (newChatMode || activeSession) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [newChatMode, activeSession]);

  // Close attach menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    }
    if (showAttachMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showAttachMenu]);

  const handleFileSelect = useCallback((accept: string) => {
    setShowAttachMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = getFileType(file);
    let preview = '';
    if (type === 'image') {
      preview = URL.createObjectURL(file);
    }

    setPendingAttachment({ file, preview, type });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const uploadFile = useCallback(async (file: File, uid: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', uid);
      formData.append('classId', classId);

      const res = await fetch('/api/student/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Upload error:', error);
        return null;
      }

      const { url } = await res.json();
      return url;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  }, [classId]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !pendingAttachment) || !userId || sending) return;
    const text = input.trim();
    setSending(true);
    setInput('');

    let messageContent = text;
    let attachmentMeta = '';

    // Upload attachment if any
    if (pendingAttachment) {
      const url = await uploadFile(pendingAttachment.file, userId);
      if (url) {
        attachmentMeta = `[[ATTACHMENT:${JSON.stringify({ url, type: pendingAttachment.type, name: pendingAttachment.file.name })}]]`;
        messageContent = attachmentMeta + (text ? ' ' + text : '');
      }
      if (pendingAttachment.preview) URL.revokeObjectURL(pendingAttachment.preview);
      setPendingAttachment(null);
    }

    if (!messageContent) {
      setSending(false);
      return;
    }

    // Optimistic add of student message
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      sender_id: userId,
      class_id: classId,
      content: messageContent,
      message_type: 'student',
      created_at: new Date().toISOString(),
    };

    if (activeSession) {
      setActiveSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, tempMsg],
        messageCount: prev.messageCount + 1,
      } : null);
    } else if (newChatMode) {
      const newSession: ChatSession = {
        id: tempId,
        firstMessage: text || pendingAttachment?.file.name || 'Attachment',
        lastActivity: tempMsg.created_at,
        messageCount: 1,
        messages: [tempMsg],
      };
      setActiveSession(newSession);
      setNewChatMode(false);
    }

    setIsTyping(true);

    try {
      const res = await fetch('/api/student/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ class_id: classId, content: messageContent, user_id: userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsTyping(false);

        if (data.aiMessage) {
          const aiMsg: ChatMessage = {
            id: data.aiMessage.id || `ai-${Date.now()}`,
            sender_id: userId,
            class_id: classId,
            content: data.aiMessage.content,
            message_type: 'ai',
            created_at: data.aiMessage.created_at || new Date().toISOString(),
          };

          setActiveSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, aiMsg],
            messageCount: prev.messageCount + 1,
            lastActivity: aiMsg.created_at,
          } : null);
        }
      } else {
        setIsTyping(false);
        setActiveSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, {
            id: `err-${Date.now()}`, sender_id: 'system', class_id: classId,
            content: "Sorry, I couldn't send that. Please try again!",
            message_type: 'ai', created_at: new Date().toISOString(),
          }],
        } : null);
      }
    } catch {
      setIsTyping(false);
      setActiveSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, {
          id: `err-${Date.now()}`, sender_id: 'system', class_id: classId,
          content: "Something went wrong. Please try again!",
          message_type: 'ai', created_at: new Date().toISOString(),
        }],
      } : null);
    } finally {
      setSending(false);
    }
  }, [input, userId, classId, sending, activeSession, newChatMode, pendingAttachment, uploadFile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  // Active chat view
  if (activeSession || newChatMode) {
    const messages = activeSession?.messages ?? [];
    return (
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border mb-4 flex-shrink-0">
          <button
            onClick={() => { setActiveSession(null); setNewChatMode(false); setPendingAttachment(null); }}
            className="w-8 h-8 rounded-lg bg-card-bg border border-border flex items-center justify-center hover:bg-border transition-colors"
          >
            <ArrowLeft size={16} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="font-heading font-bold text-text-primary">
              {newChatMode ? 'New Chat' : 'Chat'}
            </h1>
            <p className="text-xs text-text-secondary">{className}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {/* Greeting for new chat */}
          {(newChatMode || messages.length === 0) && messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-navy/30 flex items-center justify-center">
                    <Sparkle size={14} weight="fill" className="text-teal" />
                  </div>
                  <span className="text-xs font-semibold text-teal">AI Tutor</span>
                </div>
                <div className="bg-navy/20 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-white">
                  Hi {studentName}! 👋 What would you like to chat about in {className}?
                </div>
              </div>
            </div>
          )}

          {messages.map(msg => {
            const isStudent = msg.message_type === 'student';
            const parsed = parseAttachment(msg.content);
            return (
              <div
                key={msg.id}
                className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[80%]">
                  {!isStudent && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-navy/30 flex items-center justify-center">
                        <Sparkle size={14} weight="fill" className="text-teal" />
                      </div>
                      <span className="text-xs font-semibold text-teal">AI Tutor</span>
                    </div>
                  )}

                  {/* Attachment preview */}
                  {parsed.attachmentUrl && (
                    <div className={`mb-1 ${isStudent ? 'ml-auto' : ''}`}>
                      {parsed.attachmentType === 'image' ? (
                        <img
                          src={parsed.attachmentUrl}
                          alt={parsed.attachmentName || 'Image'}
                          className="max-w-full rounded-xl max-h-64 object-cover bg-white"
                        />
                      ) : parsed.attachmentType === 'video' ? (
                        <video
                          src={parsed.attachmentUrl}
                          controls
                          className="max-w-full rounded-xl max-h-64"
                        />
                      ) : (
                        <a
                          href={parsed.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            isStudent ? 'bg-white/20 text-navy' : 'bg-navy/10 text-text-primary'
                          }`}
                        >
                          <FileText size={16} />
                          {parsed.attachmentName || 'Document'}
                        </a>
                      )}
                    </div>
                  )}

                  {parsed.text && (
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        isStudent
                          ? 'bg-white text-navy rounded-br-md ml-auto'
                          : 'bg-navy/20 text-white rounded-bl-md'
                      }`}
                    >
                      {parsed.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-navy/30 flex items-center justify-center">
                    <Sparkle size={14} weight="fill" className="text-teal" />
                  </div>
                  <span className="text-xs font-semibold text-teal">AI Tutor</span>
                </div>
                <div className="bg-navy/20 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Pending attachment preview */}
        {pendingAttachment && (
          <div className="border-t border-border pt-2 pb-1 flex-shrink-0">
            <div className="flex items-center gap-2 px-2">
              <div className="relative">
                {pendingAttachment.type === 'image' && pendingAttachment.preview ? (
                  <img src={pendingAttachment.preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover bg-white" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-card-bg border border-border flex flex-col items-center justify-center">
                    {(() => { const Icon = getFileIcon(pendingAttachment.type); return <Icon size={20} className="text-text-secondary" />; })()}
                    <span className="text-[10px] text-text-muted mt-1 truncate max-w-[56px]">{pendingAttachment.file.name.split('.').pop()}</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (pendingAttachment.preview) URL.revokeObjectURL(pendingAttachment.preview);
                    setPendingAttachment(null);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X size={10} weight="bold" />
                </button>
              </div>
              <span className="text-xs text-text-secondary truncate">{pendingAttachment.file.name}</span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border pt-4 pb-2 flex-shrink-0">
          <div className="flex gap-2 items-end">
            {/* Attach button */}
            <div className="relative" ref={attachMenuRef}>
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="w-11 h-11 rounded-xl bg-card-bg border border-border flex items-center justify-center hover:bg-border transition-colors"
              >
                <Paperclip size={18} className="text-text-secondary" />
              </button>

              {showAttachMenu && (
                <div className="absolute bottom-14 left-0 bg-card-bg border border-border rounded-xl shadow-lg py-1 w-44 z-10">
                  <button
                    onClick={() => handleFileSelect('image/*')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-border/50 transition-colors"
                  >
                    <ImageIcon size={16} className="text-teal" />
                    Photo or Drawing
                  </button>
                  <button
                    onClick={() => handleFileSelect('video/*')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-border/50 transition-colors"
                  >
                    <VideoCamera size={16} className="text-purple-400" />
                    Video
                  </button>
                  <button
                    onClick={() => handleFileSelect('.pdf,.doc,.docx,.txt')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-border/50 transition-colors"
                  >
                    <FileText size={16} className="text-orange-400" />
                    Document
                  </button>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask a question..."
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-xl bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !pendingAttachment) || sending}
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
                    {(() => {
                      const p = parseAttachment(session.firstMessage);
                      const label = p.text || p.attachmentName || 'Chat session';
                      return label.length > 80 ? label.slice(0, 80) + '...' : label;
                    })()}
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
