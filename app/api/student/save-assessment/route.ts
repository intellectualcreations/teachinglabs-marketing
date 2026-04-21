import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { userId, profile, preferredName, primaryIntelligence, superpowerTitle } = await req.json();

    if (!userId || !profile) {
      return NextResponse.json({ error: 'Missing userId or profile' }, { status: 400 });
    }

    // Save assessment
    const { error: assessErr } = await (admin.from as any)('student_assessments').upsert(
      { student_id: userId, ...profile },
      { onConflict: 'student_id' }
    );

    if (assessErr) {
      console.error('Assessment save error:', assessErr);
      return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }

    // Update profile with preferred_name and superpower
    if (preferredName) {
      const profileUpdate: Record<string, unknown> = { preferred_name: preferredName };
      if (primaryIntelligence) profileUpdate.primary_intelligence = primaryIntelligence;
      if (superpowerTitle) profileUpdate.superpower_title = superpowerTitle;

      const { error: profileErr } = await admin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);

      if (profileErr) {
        console.error('Profile update error:', profileErr);
        // Don't fail the whole request for this
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
