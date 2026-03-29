'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Class, Enrollment } from '@/lib/supabase/types';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export function useClasses() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user || !profile) {
      setClasses([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchClasses() {
      setLoading(true);
      setError(null);

      if (profile!.role === 'teacher' || profile!.role === 'admin') {
        const { data, error: err } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user!.id)
          .order('created_at', { ascending: false });

        if (err) {
          setError(err.message);
        } else {
          setClasses((data ?? []) as Class[]);
        }
      } else {
        const { data: enrollments, error: enrollErr } = await supabase
          .from('enrollments')
          .select('class_id')
          .eq('student_id', user!.id)
          .eq('status', 'active');

        if (enrollErr) {
          setError(enrollErr.message);
          setLoading(false);
          return;
        }

        const classIds = ((enrollments ?? []) as Array<Pick<Enrollment, 'class_id'>>).map(
          (e) => e.class_id
        );
        if (classIds.length === 0) {
          setClasses([]);
          setLoading(false);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: err } = await (supabase
          .from('classes')
          .select('*') as any)
          .in('id', classIds)
          .order('created_at', { ascending: false });

        if (err) {
          setError(err.message);
        } else {
          setClasses((data ?? []) as Class[]);
        }
      }

      setLoading(false);
    }

    fetchClasses();
  }, [user, profile, authLoading, profileLoading]);

  return { classes, loading, error };
}
