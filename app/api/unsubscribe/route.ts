import { NextRequest, NextResponse } from 'next/server';

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return { url, anonKey };
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing unsubscribe token.' },
        { status: 400 }
      );
    }

    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/rpc/unsubscribe_waitlist`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unsubscribe RPC error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Unable to unsubscribe right now.' },
        { status: 500 }
      );
    }

    const [result] = await response.json();

    if (!result?.success) {
      return NextResponse.json(
        { success: false, error: 'This unsubscribe link is invalid or expired.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyUnsubscribed: Boolean(result.already_unsubscribed),
    });
  } catch (error) {
    console.error('Unsubscribe API error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
