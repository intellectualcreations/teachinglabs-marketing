import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { buildUnsubscribeUrl, renderEmailFooterHtml, renderEmailFooterText } from '@/lib/email-footer';
import { verifyTurnstile } from '@/lib/turnstile';

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

const LOGO_URL = 'https://www.teachinglabs.com/email/teaching-labs-logo.png';

async function sendContactAdminNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  subject: string;
  message: string;
  submittedAt: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'hello@teachinglabs.com';
  const from = process.env.CONTACT_FROM_EMAIL || 'Teaching Labs Website <no-reply@teachinglabs.com>';

  if (!apiKey) {
    console.warn('Skipping contact admin notification: RESEND_API_KEY is not configured.');
    return;
  }

  const safe = {
    firstName: escapeHtml(data.firstName),
    lastName: escapeHtml(data.lastName),
    email: escapeHtml(data.email),
    role: escapeHtml(data.role),
    subject: escapeHtml(data.subject),
    message: escapeHtml(data.message).replace(/\n/g, '<br />'),
    submittedAt: escapeHtml(data.submittedAt),
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: adminEmail,
      reply_to: data.email,
      subject: `Teaching Labs contact: ${data.subject}`,
      text: `New Teaching Labs contact form submission\n\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nRole: ${data.role}\nSubject: ${data.subject}\nSubmitted: ${data.submittedAt}\n\nMessage:\n${data.message}`,
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
    throw new Error(`Contact admin notification failed: ${errorText}`);
  }
}

async function sendContactConfirmation(
  email: string,
  firstName: string,
  subject: string,
  unsubscribeToken: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL || 'Teaching Labs <hello@teachinglabs.com>';

  if (!apiKey) {
    console.warn('Skipping contact confirmation email: RESEND_API_KEY is not configured.');
    return;
  }

  const safeFirstName = escapeHtml(firstName);
  const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'We received your message — Teaching Labs',
      text: `Hi ${firstName},\n\nThanks for reaching out to Teaching Labs.\n\nWe received your message about "${subject}" and will get back to you as soon as we can.\n\nIn the meantime, feel free to explore teachinglabs.com for resources and updates.\n\n— The Teaching Labs Team\n\n${renderEmailFooterText(unsubscribeUrl)}`,
      html: `
        <div style="margin:0; padding:0; background:#f4f7fb; font-family: Arial, Helvetica, sans-serif; color:#0a1128;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#f4f7fb;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:640px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #dbe3ef;">
                  <tr>
                    <td style="padding:32px 32px 20px 32px; border-top:6px solid #4056F4;">
                      <img src="${LOGO_URL}" alt="Teaching Labs" width="220" style="display:block; width:220px; max-width:100%; height:auto; margin:0 0 28px 0;" />
                      <h1 style="margin:0 0 18px 0; font-size:28px; line-height:1.2; color:#0a1128; font-weight:800;">We received your message</h1>
                      <p style="margin:0 0 18px 0; font-size:16px; line-height:1.65; color:#24324a;">Hi ${safeFirstName},</p>
                      <p style="margin:0 0 18px 0; font-size:16px; line-height:1.65; color:#24324a;">Thanks for reaching out to Teaching Labs.</p>
                      <p style="margin:0 0 18px 0; font-size:16px; line-height:1.65; color:#24324a;">We received your message about <strong>"${escapeHtml(subject)}"</strong> and will get back to you as soon as we can.</p>
                      <p style="margin:0 0 28px 0; font-size:16px; line-height:1.65; color:#24324a;">In the meantime, feel free to explore <a href="https://www.teachinglabs.com" style="color:#4056F4; text-decoration:none; font-weight:700;">teachinglabs.com</a> for resources and updates.</p>
                      <p style="margin:0; font-size:16px; line-height:1.65; color:#0a1128; font-weight:700;">— The Teaching Labs Team</p>
                    </td>
                  </tr>
                  <tr>
                    ${renderEmailFooterHtml(unsubscribeUrl)}
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
    throw new Error(`Contact confirmation email failed: ${errorText}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot — a real user never fills the hidden "website" field.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ success: true }); // silently drop bots
    }

    // Bot verification (Cloudflare Turnstile) — activates once keys are set.
    const clientIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      null;
    const turnstile = await verifyTurnstile(body.turnstileToken, clientIp);
    if (!turnstile.ok) {
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 });
    }

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

    const submittedAt = new Date().toISOString();
    const normalizedEmail = email.toLowerCase();
    const unsubscribeToken = createUnsubscribeToken();
    const { url, anonKey } = getSupabaseConfig();

    // Persist submission first — email failures must not corrupt saved data
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

    // Send admin notification — failure logged but does not affect response
    try {
      await sendContactAdminNotification({
        firstName,
        lastName,
        email: normalizedEmail,
        role,
        subject,
        message,
        submittedAt,
      });
    } catch (adminEmailError) {
      console.error('Contact admin notification error:', adminEmailError);
    }

    // Send confirmation to submitter — failure logged but does not affect response
    try {
      await sendContactConfirmation(normalizedEmail, firstName, subject, unsubscribeToken);
    } catch (confirmEmailError) {
      console.error('Contact confirmation email error:', confirmEmailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
