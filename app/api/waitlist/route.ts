import { NextRequest, NextResponse } from 'next/server';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
    const body = await req.json();
    const { firstName, lastName, role, email } = body;

    if (!firstName || !lastName || !role || !email) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: role.trim(),
        email: email.trim().toLowerCase(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 409 || errorText.includes('23505')) {
        return NextResponse.json(
          { error: 'This email is already on the waitlist!' },
          { status: 409 }
        );
      }

      console.error('Waitlist insert error:', errorText);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
