import { NextRequest, NextResponse } from 'next/server';

const LOGO_URL = 'https://www.teachinglabs.com/email/teaching-labs-logo.png';

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

async function sendWaitlistConfirmation(email: string, firstName: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WAITLIST_FROM_EMAIL || 'Teaching Labs <hello@teachinglabs.com>';

  if (!apiKey) {
    console.warn('Skipping waitlist confirmation email: RESEND_API_KEY is not configured.');
    return;
  }

  const safeFirstName = escapeHtml(firstName);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'You’re on the Teaching Labs Waitlist',
      text: `Hi ${firstName},\n\nThanks for joining the Teaching Labs waitlist.\n\nWe’re building something designed to help teachers create more engaging, student-centered learning experiences — without adding more overwhelm to your day.\n\nRight now, we’re working closely with early educators to shape the platform, test ideas, and build tools that are actually useful in real classrooms.\n\nAs an early member, you’ll get:\n\n• Early access opportunities\n• Sneak peeks at new features\n• Classroom-ready ideas and experiments\n• A chance to help shape what Teaching Labs becomes\n\nOur goal is simple:\nHelp teachers create learning experiences students genuinely connect with.\n\nWe’re glad you’re here.\n\n— The Teaching Labs Team`,
      html: `
        <div style="margin:0; padding:0; background:#f4f7fb; font-family: Arial, Helvetica, sans-serif; color:#0a1128;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#f4f7fb;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:640px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #dbe3ef;">
                  <tr>
                    <td style="padding:32px 32px 20px 32px; border-top:6px solid #4056F4;">
                      <img src="${LOGO_URL}" alt="Teaching Labs" width="220" style="display:block; width:220px; max-width:100%; height:auto; margin:0 0 28px 0;" />
                      <h1 style="margin:0 0 18px 0; font-size:28px; line-height:1.2; color:#0a1128; font-weight:800;">You’re on the Teaching Labs Waitlist</h1>
                      <p style="margin:0 0 18px 0; font-size:16px; line-height:1.65; color:#24324a;">Hi ${safeFirstName},</p>
                      <p style="margin:0 0 18px 0; font-size:16px; line-height:1.65; color:#24324a;">Thanks for joining the Teaching Labs waitlist.</p>
                      <p style="margin:0 0 18px 0; font-size:16px; line-height:1.65; color:#24324a;">We’re building something designed to help teachers create more engaging, student-centered learning experiences — without adding more overwhelm to your day.</p>
                      <p style="margin:0 0 18px 0; font-size:16px; line-height:1.65; color:#24324a;">Right now, we’re working closely with early educators to shape the platform, test ideas, and build tools that are actually useful in real classrooms.</p>
                      <p style="margin:24px 0 12px 0; font-size:16px; line-height:1.65; color:#0a1128; font-weight:700;">As an early member, you’ll get:</p>
                      <ul style="margin:0 0 24px 22px; padding:0; color:#24324a; font-size:16px; line-height:1.75;">
                        <li>Early access opportunities</li>
                        <li>Sneak peeks at new features</li>
                        <li>Classroom-ready ideas and experiments</li>
                        <li>A chance to help shape what Teaching Labs becomes</li>
                      </ul>
                      <div style="margin:28px 0; padding:22px 24px; background:#eef2ff; border-left:5px solid #4056F4; border-radius:16px;">
                        <p style="margin:0 0 8px 0; color:#4056F4; font-size:13px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase;">Our goal is simple</p>
                        <p style="margin:0; color:#0a1128; font-size:18px; line-height:1.5; font-weight:700;">Help teachers create learning experiences students genuinely connect with.</p>
                      </div>
                      <p style="margin:0 0 28px 0; font-size:16px; line-height:1.65; color:#24324a;">We’re glad you’re here.</p>
                      <p style="margin:0; font-size:16px; line-height:1.65; color:#0a1128; font-weight:700;">— The Teaching Labs Team</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px 28px 32px; background:#0a1128; color:#d7deea; font-size:13px; line-height:1.5;">
                      Teaching Labs · AI-powered support for teachers and students<br />
                      <a href="https://www.teachinglabs.com" style="color:#00F6ED; text-decoration:none;">www.teachinglabs.com</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend email failed: ${errorText}`);
  }
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

    const trimmedFirstName = firstName.trim();
    const normalizedEmail = email.trim().toLowerCase();
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
        first_name: trimmedFirstName,
        last_name: lastName.trim(),
        role: role.trim(),
        email: normalizedEmail,
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

    try {
      await sendWaitlistConfirmation(normalizedEmail, trimmedFirstName);
    } catch (emailError) {
      console.error('Waitlist confirmation email error:', emailError);
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
