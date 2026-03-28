'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';
import { useAuth } from './useAuth';

export function useProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (err) {
        setError(err.message);
        setProfile(null);
      } else {
        setProfile(data as Profile | null);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user, authLoading]);

  return { profile, loading, error };
}
