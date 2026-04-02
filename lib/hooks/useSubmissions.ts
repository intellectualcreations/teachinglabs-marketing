'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Submission } from '@/lib/supabase/types';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export function useSubmissions(assignmentId?: string) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user || !profile || !assignmentId) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchSubmissions() {
      setLoading(true);
      setError(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase.from('submissions') as any)
        .select('*')
        .eq('assignment_id', assignmentId!);

      // Students only see their own submissions
      if (profile!.role === 'student') {
        query = query.eq('student_id', user!.id);
      }

      const { data, error: err } = await query.order('submitted_at', { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setSubmissions((data ?? []) as Submission[]);
      }
      setLoading(false);
    }

    fetchSubmissions();
  }, [user, profile, assignmentId, authLoading, profileLoading]);

  return { submissions, loading, error };
}
