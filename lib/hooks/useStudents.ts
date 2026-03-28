'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Enrollment } from '@/lib/supabase/types';
import { useAuth } from './useAuth';

export interface StudentWithEnrollment extends Profile {
  enrollment: Pick<Enrollment, 'class_id' | 'enrolled_at' | 'status'>;
}

export function useStudents(classId?: string) {
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentWithEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !classId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchStudents() {
      setLoading(true);
      setError(null);

      const { data: enrollments, error: enrollErr } = await supabase
        .from('enrollments')
        .select('student_id, class_id, enrolled_at, status')
        .eq('class_id', classId!)
        .eq('status', 'active');

      if (enrollErr) {
        setError(enrollErr.message);
        setLoading(false);
        return;
      }

      const typedEnrollments = (enrollments ?? []) as Array<
        Pick<Enrollment, 'student_id' | 'class_id' | 'enrolled_at' | 'status'>
      >;

      if (typedEnrollments.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const studentIds = typedEnrollments.map((e) => e.student_id);

      const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);

      if (profileErr) {
        setError(profileErr.message);
        setLoading(false);
        return;
      }

      const typedProfiles = (profiles ?? []) as Profile[];
      const result: StudentWithEnrollment[] = typedProfiles.map((p) => {
        const enrollment = typedEnrollments.find((e) => e.student_id === p.id)!;
        return {
          ...p,
          enrollment: {
            class_id: enrollment.class_id,
            enrolled_at: enrollment.enrolled_at,
            status: enrollment.status,
          },
        };
      });

      setStudents(result);
      setLoading(false);
    }

    fetchStudents();
  }, [user, classId, authLoading]);

  return { students, loading, error };
}
