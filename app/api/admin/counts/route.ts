import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, isValidSession } from '../login/route';

/**
 * GET /api/admin/counts
 * Returns { waitlist: number, contact: number } for the admin dashboard.
 * Requires a valid admin session cookie. Reads with the service-role key
 * so Row-Level Security does not hide rows.
 */

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return { url, key };
}

async function countTable(url: string, key: string, table: string): Promise<number> {
  const res = await fetch(`${url}/rest/v1/${table}?select=email`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
  });
  if (!res.ok) throw new Error(`count ${table} failed: ${res.status}`);
  const range = res.headers.get('content-range'); // e.g. "0-19/20" or "*/20"
  if (range && range.includes('/')) {
    const total = range.split('/')[1];
    const n = parseInt(total, 10);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

export async function GET(req: NextRequest) {
  const session = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!isValidSession(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url, key } = getConfig();
    const [waitlist, contact] = await Promise.all([
      countTable(url, key, 'waitlist'),
      countTable(url, key, 'contact_submissions'),
    ]);
    return NextResponse.json({ waitlist, contact });
  } catch {
    return NextResponse.json({ error: 'Failed to load counts.' }, { status: 500 });
  }
}
