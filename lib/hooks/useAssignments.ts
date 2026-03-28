'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Assignment } from '@/lib/supabase/types';
import { useAuth } from './useAuth';

export function useAssignments(classId?: string) {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !classId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchAssignments() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId!)
        .order('created_at', { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setAssignments((data ?? []) as Assignment[]);
      }
      setLoading(false);
    }

    fetchAssignments();
  }, [user, classId, authLoading]);

  return { assignments, loading, error };
}
