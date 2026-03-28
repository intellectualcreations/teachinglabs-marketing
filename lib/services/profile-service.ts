import { createClient as createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('getProfile error:', error.message);
    return null;
  }
  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<Profile | null> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('profiles') as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('updateProfile error:', error.message);
    return null;
  }
  return data as Profile | null;
}

/**
 * Admin-level profile creation (bypasses RLS).
 * Used by seed scripts and admin endpoints.
 */
export function createProfileAdmin(profile: {
  id: string;
  display_name: string;
  role: Profile['role'];
  school_id?: string;
}) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase.from('profiles') as any).upsert(profile).select().single();
}
