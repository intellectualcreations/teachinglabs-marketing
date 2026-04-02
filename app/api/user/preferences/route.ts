import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { getPreferences, updatePreferences } from '@/lib/user-preferences-store';

/**
 * GET  /api/user/preferences — returns current user preferences.
 * PATCH /api/user/preferences — updates current user preferences.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || undefined;
  const user = getCurrentUser(role);
  const prefs = getPreferences(user.id);

  return NextResponse.json({ preferences: prefs });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || undefined;
  const user = getCurrentUser(role);

  let body: { emailDigest?: boolean; digestFrequency?: 'weekly' | 'daily' | 'never' };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const updated = updatePreferences(user.id, {
    emailDigest: body.emailDigest,
    digestFrequency: body.digestFrequency,
  });

  return NextResponse.json({ preferences: updated });
}
