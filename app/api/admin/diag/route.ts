import { NextRequest, NextResponse } from 'next/server';

/**
 * TEMPORARY diagnostic — reports metadata about the configured Supabase key
 * WITHOUT exposing the secret. Password-gated. Remove after debugging.
 */
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get('password');
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  function jwtRole(token: string): string {
    try {
      const payload = token.split('.')[1];
      const json = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      return json.role || '(no role)';
    } catch {
      return '(not a JWT)';
    }
  }

  // Live read test using the service key
  let liveRows: string | number = 'n/a';
  let liveStatus = 0;
  try {
    const key = svc || anon;
    const r = await fetch(`${url}/rest/v1/waitlist?select=email`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
    });
    liveStatus = r.status;
    liveRows = r.headers.get('content-range') || 'no-range';
  } catch (e) {
    liveRows = `err: ${String(e)}`;
  }

  return NextResponse.json({
    url_host: url.replace('https://', '').split('.')[0],
    service_key: {
      present: svc.length > 0,
      length: svc.length,
      starts: svc.slice(0, 4),
      role_claim: jwtRole(svc),
    },
    anon_key: { length: anon.length, role_claim: jwtRole(anon) },
    live_read: { status: liveStatus, content_range: liveRows },
  });
}
