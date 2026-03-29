'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Runs once after auth callback redirect.
 * Picks up pending_school_id and pending_class_id from localStorage
 * and updates the user's profile / creates enrollment in Supabase.
 *
 * Uses an untyped client to avoid supabase-js v2.100 strict generic issues
 * with manually-written Database types.
 */
export default function PostAuthHandler() {
  useEffect(() => {
    async function handlePendingActions() {
      // Create an untyped browser client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Handle pending school assignment (teacher signup)
      const pendingSchoolId = localStorage.getItem('pending_school_id');
      if (pendingSchoolId) {
        await supabase
          .from('profiles')
          .update({ school_id: pendingSchoolId })
          .eq('id', user.id);
        localStorage.removeItem('pending_school_id');
      }

      // Handle pending role update (if not set by trigger)
      const pendingRole = localStorage.getItem('pending_role');
      if (pendingRole === 'teacher' || pendingRole === 'student') {
        await supabase
          .from('profiles')
          .update({ role: pendingRole })
          .eq('id', user.id);
        localStorage.removeItem('pending_role');
      }

      // Handle pending class enrollment (student signup)
      const pendingClassId = localStorage.getItem('pending_class_id');
      if (pendingClassId) {
        // Check if already enrolled
        const { data: existing } = await supabase
          .from('enrollments')
          .select('id')
          .eq('student_id', user.id)
          .eq('class_id', pendingClassId)
          .single();

        if (!existing) {
          await supabase
            .from('enrollments')
            .insert({
              student_id: user.id,
              class_id: pendingClassId,
            });
        }
        localStorage.removeItem('pending_class_id');
      }
    }

    handlePendingActions();
  }, []);

  return null;
}
