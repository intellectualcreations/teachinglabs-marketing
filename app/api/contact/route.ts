import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return { url, anonKey };
}

function createUnsubscribeToken(): string {
  return randomBytes(24).toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const role = String(body.role || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!firstName || !lastName || !email || !role || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL || 'Teaching Labs Website <no-reply@teachinglabs.com>';

    if (!apiKey) {
      console.error('Contact email failed: RESEND_API_KEY is not configured.');
      return NextResponse.json({ error: 'Email is not configured yet.' }, { status: 500 });
    }

    const submittedAt = new Date().toISOString();
    const normalizedEmail = email.toLowerCase();
    const unsubscribeToken = createUnsubscribeToken();
    const { url, anonKey } = getSupabaseConfig();

    const saveResponse = await fetch(`${url}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        role,
        subject,
        message,
        marketing_consent: true,
        email_opt_out: false,
        unsubscribe_token: unsubscribeToken,
        source: 'contact_page',
        user_agent: req.headers.get('user-agent') || null,
      }),
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      console.error('Contact submission save failed:', errorText);
      return NextResponse.json({ error: 'Message could not be saved. Please try again or email hello@teachinglabs.com directly.' }, { status: 500 });
    }

    const safe = {
      firstName: escapeHtml(firstName),
      lastName: escapeHtml(lastName),
      email: escapeHtml(email),
      role: escapeHtml(role),
      subject: escapeHtml(subject),
      message: escapeHtml(message).replace(/\n/g, '<br />'),
      submittedAt: escapeHtml(submittedAt),
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: 'hello@teachinglabs.com',
        reply_to: email,
        subject: `Teaching Labs contact: ${subject}`,
        text: `New Teaching Labs contact form submission\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nRole: ${role}\nSubject: ${subject}\nSubmitted: ${submittedAt}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; color:#0a1128; line-height:1.6;">
            <h1 style="margin:0 0 16px; font-size:24px;">New Teaching Labs contact form submission</h1>
            <p><strong>Name:</strong> ${safe.firstName} ${safe.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${safe.email}">${safe.email}</a></p>
            <p><strong>Role:</strong> ${safe.role}</p>
            <p><strong>Subject:</strong> ${safe.subject}</p>
            <p><strong>Submitted:</strong> ${safe.submittedAt}</p>
            <hr style="border:none; border-top:1px solid #dbe3ef; margin:24px 0;" />
            <p><strong>Message:</strong></p>
            <div style="padding:16px; border-left:4px solid #4056F4; background:#f4f7fb; border-radius:12px;">${safe.message}</div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Contact email failed:', errorText);
      return NextResponse.json({ error: 'Message could not be sent. Please email hello@teachinglabs.com directly.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
