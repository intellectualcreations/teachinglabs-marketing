import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

/**
 * POST /api/student/join-class
 * Body: { joinCode: string }
 * Enrolls the authenticated student in a class by join code.
 * Auth: tries cookie-based session first, falls back to Authorization header token.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const joinCode = (body.joinCode ?? '').trim().toUpperCase();

  if (!joinCode) {
    return NextResponse.json({ error: 'joinCode required' }, { status: 400 });
  }

  // Get the authenticated user — try cookie session first, then Authorization header
  let userId: string | null = null;

  // Method 1: Cookie-based session
  try {
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (user) userId = user.id;
  } catch {
    // Cookie auth failed — try header
  }

  // Method 2: Authorization header with JWT token
  if (!userId) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        // Create a client with the user's token to verify and get their user info
        const tokenClient = createBrowserClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
          {
            auth: {
              persistSession: false,
            },
          }
        );

        // Set the session with the token to use it for auth
        const { data, error } = await tokenClient.auth.getSession();
        if (error) throw error;

        // Actually, better approach: call the Supabase REST API directly
        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.id;
        }
      } catch (err) {
        console.error('Token verification error:', err);
        // Token verification failed
      }
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Look up class by join code (bypasses RLS)
  const { data: cls, error: clsErr } = await admin
    .from('classes')
    .select('id, name')
    .eq('join_code', joinCode)
    .single();

  if (clsErr || !cls) {
    return NextResponse.json({ error: 'Invalid class code. Check with your teacher and try again.' }, { status: 404 });
  }

  const classId = (cls as { id: string; name: string }).id;
  const className = (cls as { id: string; name: string }).name;

  // Check if already enrolled
  const { data: existing } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', userId)
    .eq('class_id', classId)
    .single();

  if (existing) {
    return NextResponse.json({ error: `Already enrolled in ${className}` }, { status: 409 });
  }

  // Enroll via admin (bypasses RLS)
  const { error: enrollErr } = await admin
    .from('enrollments')
    .insert({ student_id: userId, class_id: classId, status: 'active' } as never);

  if (enrollErr) {
    console.error('Enrollment error:', enrollErr.message);
    return NextResponse.json({ error: 'Could not enroll' }, { status: 500 });
  }

  return NextResponse.json({ success: true, className });
}
