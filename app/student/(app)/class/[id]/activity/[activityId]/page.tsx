'use client';
// v5 — student activity page: Spark chat only (cache-bust 2026-04-05)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, PaperPlaneRight, Calendar, CheckCircle, Circle,
  Sparkle, Clock, Microphone, SpeakerHigh, Paperclip, X, Stop,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Assignment } from '@/lib/supabase/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SparkActivityPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const activityId = params.activityId as string;

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        let authHeaders: Record<string, string> = {};
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          if (sess?.access_token) authHeaders = { 'Authorization': `Bearer ${sess.access_token}` };
        } catch { /* ignore */ }

        // Get the activity
        const res = await fetch(`/api/student/my-classes?userId=${user.id}`, { headers: authHeaders });
        if (!res.ok) return;
        const data = await res.json();
        const act = (data.assignments ?? []).find((a: any) => a.id === activityId && a.class_id === classId);
        if (act) setActivity(act);

        // Load existing chat messages for this activity
        const chatRes = await fetch(`/api/student/activity-chat?activityId=${activityId}&studentId=${user.id}`);
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          const existing = chatData.messages ?? [];
          setMessages(existing);

          // If no messages yet, auto-trigger a greeting
          if (existing.length === 0 && act) {
            setSending(true);
            try {
              const greetRes = await fetch('/api/student/activity-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  activityId,
                  studentId: user.id,
                  message: 'Hi! I just opened this activity.',
                  activityTitle: act.title,
                  activityDescription: act.description,
                  objective: act.objective,
                  directions: act.directions,
                  teacherId: act.teacher_id,
                }),
              });
              if (greetRes.ok) {
                const greetData = await greetRes.json();
                setMessages([
                  { id: 'greet-user', role: 'user', content: 'Hi! I just opened this activity.', created_at: new Date().toISOString() },
                  { id: 'greet-ai', role: 'assistant', content: greetData.reply, created_at: new Date().toISOString() },
                ]);
              }
            } catch { /* ignore */ }
            setSending(false);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId, activityId]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: msg,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/student/activity-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          studentId: userId,
          message: msg,
          activityTitle: activity?.title,
          activityDescription: activity?.description,
          objective: activity?.objective,
          directions: activity?.directions,
          teacherId: activity?.teacher_id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages(prev => [...prev, {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            created_at: new Date().toISOString(),
          }]);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-text-secondary">Activity not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-teal hover:underline text-sm">Go back</button>
      </div>
    );
  }

  return (
    <div data-v="4" className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 72px)' }}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="mt-1 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border/30 transition-colors"
        >
          <ArrowLeft size={18} weight="bold" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-xl font-bold text-text-primary">{activity.title}</h1>
          {activity.due_date && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-text-muted">
              <Calendar size={12} />
              <span>Due {formatDate(activity.due_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity details are passed to Spark who presents them in kid-friendly language */}

      {/* Chat area */}
      <div className="flex-1 bg-card-bg rounded-xl border border-border flex flex-col min-h-0 overflow-hidden">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="text-sm font-heading font-semibold text-text-primary">Spark</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">Online</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !sending && (
            <div className="text-center py-8">
              <span className="text-4xl block mb-3">✨</span>
              <p className="text-sm text-text-secondary font-medium mb-1">Getting Spark ready...</p>
              <p className="text-xs text-text-muted max-w-xs mx-auto">
                Your AI tutor is loading up this activity!
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col gap-1">
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal text-navy rounded-br-md'
                    : 'bg-border/30 text-text-primary rounded-bl-md'
                }`}>
                  {msg.content.split('\n\n').map((para, i) => (
                    <p key={i} className={i > 0 ? 'mt-2.5' : ''}>
                      {para.split('\n').map((line, j) => (
                        <span key={j}>{j > 0 && <br />}{line}</span>
                      ))}
                    </p>
                  ))}
                </div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => {
                      if (isSpeaking && speakingMsgId === msg.id) {
                        window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                        setSpeakingMsgId(null);
                        return;
                      }
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(msg.content);
                      utterance.rate = 0.9;
                      utterance.onend = () => { setIsSpeaking(false); setSpeakingMsgId(null); };
                      utterance.onerror = () => { setIsSpeaking(false); setSpeakingMsgId(null); };
                      setIsSpeaking(true);
                      setSpeakingMsgId(msg.id);
                      window.speechSynthesis.speak(utterance);
                    }}
                    className={`self-start flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-colors ${
                      isSpeaking && speakingMsgId === msg.id
                        ? 'text-teal bg-teal/10'
                        : 'text-text-muted hover:text-text-secondary hover:bg-border/20'
                    }`}
                  >
                    <SpeakerHigh size={12} weight={isSpeaking && speakingMsgId === msg.id ? 'fill' : 'regular'} />
                    {isSpeaking && speakingMsgId === msg.id ? 'Stop' : 'Listen'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-border/30 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setInput(prev => prev ? `${prev} [Attached: ${file.name}]` : `[Attached: ${file.name}]`);
              }
              e.target.value = '';
            }}
          />
          <div className="flex items-center gap-1.5">
            {/* File upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-border/30 transition-colors"
              title="Attach a file"
            >
              <Paperclip size={18} />
            </button>

            {/* Microphone - speech to text */}
            <button
              onClick={() => {
                if (isListening) {
                  recognitionRef.current?.stop();
                  setIsListening(false);
                  return;
                }
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!SpeechRecognition) { alert('Speech recognition is not supported in this browser.'); return; }
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'en-US';
                recognition.onresult = (event: any) => {
                  const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
                  setInput(transcript);
                };
                recognition.onend = () => setIsListening(false);
                recognition.onerror = () => setIsListening(false);
                recognitionRef.current = recognition;
                recognition.start();
                setIsListening(true);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'text-red-500 bg-red-500/10 animate-pulse'
                  : 'text-text-muted hover:text-text-primary hover:bg-border/30'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your message'}
            >
              {isListening ? <Stop size={18} weight="fill" /> : <Microphone size={18} />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={isListening ? 'Listening...' : 'Ask about this activity...'}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-bg)] border border-border text-sm text-text-primary
                placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/40"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="p-2.5 rounded-xl bg-teal text-navy hover:bg-teal/90 transition-colors disabled:opacity-40"
            >
              <PaperPlaneRight size={18} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
