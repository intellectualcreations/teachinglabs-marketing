// Server-side Cloudflare Turnstile verification.
//
// Gracefully SKIPS when TURNSTILE_SECRET_KEY is not configured, so the site
// keeps working before the Cloudflare keys are added. Bot protection then
// activates automatically the moment the secret is present in the environment.

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileResult {
  ok: boolean; // true = request may proceed
  skipped: boolean; // true = not configured, verification bypassed
}

export async function verifyTurnstile(
  token: unknown,
  ip?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Not configured yet — don't block real users. (Honeypot still applies.)
  if (!secret) {
    console.warn('Turnstile secret not configured — skipping bot verification.');
    return { ok: true, skipped: true };
  }

  if (typeof token !== 'string' || token.trim() === '') {
    return { ok: false, skipped: false };
  }

  try {
    const body = new URLSearchParams();
    body.append('secret', secret);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json().catch(() => ({ success: false }))) as {
      success?: boolean;
    };
    return { ok: data.success === true, skipped: false };
  } catch (err) {
    console.error('Turnstile verification error:', err);
    // Fail closed: if we can't verify, don't let it through.
    return { ok: false, skipped: false };
  }
}
