'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ChatMessage, MessageType } from '@/lib/supabase/types';
import { useAuth } from './useAuth';

export function useChatMessages(classId?: string) {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !classId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchMessages() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('class_id', classId!)
        .order('created_at', { ascending: true });

      if (err) {
        setError(err.message);
      } else {
        setMessages((data ?? []) as ChatMessage[]);
      }
      setLoading(false);
    }

    fetchMessages();

    // Subscribe to new messages in real-time
    const channel = supabase
      .channel(`chat:${classId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, classId, authLoading]);

  const sendMessage = useCallback(
    async (content: string, messageType: MessageType = 'student') => {
      if (!user || !classId) return;

      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (supabase
        .from('chat_messages') as any)
        .insert({
          sender_id: user.id,
          class_id: classId,
          content,
          message_type: messageType,
        });

      if (err) {
        setError(err.message);
      }
    },
    [user, classId]
  );

  return { messages, loading, error, sendMessage };
}
