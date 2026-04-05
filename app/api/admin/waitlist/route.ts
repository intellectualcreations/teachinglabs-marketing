import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const password = req.nextUrl.searchParams.get('password');

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('waitlist')
      .select('first_name, last_name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Waitlist fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist data.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
