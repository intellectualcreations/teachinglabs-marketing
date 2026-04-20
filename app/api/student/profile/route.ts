import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Basic profanity blocklist for K-12 environment
const BLOCKED_WORDS = [
  'ass', 'asshole', 'bastard', 'bitch', 'bullshit', 'crap', 'cunt',
  'damn', 'dick', 'dumbass', 'fag', 'fuck', 'goddamn', 'hell',
  'jackass', 'nigger', 'nigga', 'piss', 'pussy', 'retard', 'shit',
  'slut', 'whore', 'cock', 'penis', 'vagina', 'boob', 'tits',
  'stfu', 'wtf', 'lmfao', 'milf',
];

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z]/g, ' ');
  return BLOCKED_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`);
    return regex.test(lower);
  });
}

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await admin
    .from('profiles')
    .select('id, display_name, preferred_name, role, name_flagged')
    .eq('id', user.id)
    .single();

  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const allowedFields = ['preferred_name'];
  const updates: Record<string, string> = {};
  for (const key of allowedFields) {
    if (key in body) {
      const value = String(body[key]).trim().slice(0, 50);
      if (key === 'preferred_name' && containsProfanity(value)) {
        return NextResponse.json(
          { error: 'That name contains inappropriate language. Please choose a different name.' },
          { status: 400 }
        );
      }
      updates[key] = value;
      // Clear the flagged status when student picks a new name
      if (key === 'preferred_name') {
        (updates as Record<string, unknown>)['name_flagged'] = false;
      }
    }
  }

  const { error } = await admin
    .from('profiles')
    .update(updates as never)
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
