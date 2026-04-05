import { NextRequest, NextResponse } from 'next/server';
import { getByToken } from '@/lib/portfolio-store';

/** GET /api/v1/portfolio/:token — public portfolio view (no auth) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const items = getByToken(token);
  if (!items) {
    return NextResponse.json({ error: 'invalid or expired token' }, { status: 404 });
  }
  return NextResponse.json(items);
}
