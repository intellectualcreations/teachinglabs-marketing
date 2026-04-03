import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/profile?teacherId=<uuid>
 * Returns { profile, school } for the settings page.
 * Uses admin client to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, first_name, last_name, role, school_id')
      .eq('id', teacherId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError.message);
      return NextResponse.json({ profile: null, school: null });
    }

    let school = null;
    const p = profile as { school_id?: string } | null;
    if (p?.school_id) {
      const { data: schoolData } = await supabase
        .from('schools')
        .select('name')
        .eq('id', p.school_id)
        .single();
      school = schoolData;
    }

    return NextResponse.json({ profile, school });
  } catch (err) {
    console.error('Profile API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
