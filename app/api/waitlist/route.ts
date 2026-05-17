import { NextRequest, NextResponse } from 'next/server';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, role, email } = body;

    // Validate required fields
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

    // For now, just log and return success. In production, connect to
    // a database or email service (e.g., Supabase, Airtable, SendGrid).
    console.log('Waitlist submission:', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role.trim(),
      email: email.trim().toLowerCase(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
