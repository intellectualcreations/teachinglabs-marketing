import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET — fetch a single activity by id (bypasses RLS)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await (admin.from('assignments') as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Fetch activity error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ activity: data });
  } catch (err) {
    console.error('Activity fetch API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — update an activity by id (bypasses RLS)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const body = await request.json();
    const admin = createAdminClient();

    const { data, error } = await (admin.from('assignments') as any)
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update activity error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activity: data });
  } catch (err) {
    console.error('Activity update API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
