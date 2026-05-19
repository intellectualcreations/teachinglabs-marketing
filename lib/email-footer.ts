export const TEACHING_LABS_HOME_URL = 'https://www.teachinglabs.com';
export const TEACHING_LABS_UNSUBSCRIBE_URL = `${TEACHING_LABS_HOME_URL}/unsubscribe`;
export const TEACHING_LABS_CONTACT_EMAIL = 'hello@teachinglabs.com';

const DEFAULT_REASON = 'You’re receiving this email because you signed up for early access to Teaching Labs.';

export function buildUnsubscribeUrl(unsubscribeToken?: string): string {
  if (!unsubscribeToken) {
    return TEACHING_LABS_UNSUBSCRIBE_URL;
  }

  return `${TEACHING_LABS_UNSUBSCRIBE_URL}?token=${encodeURIComponent(unsubscribeToken)}`;
}

export function renderEmailFooterText(unsubscribeUrl = TEACHING_LABS_UNSUBSCRIBE_URL, reason = DEFAULT_REASON): string {
  return `${reason}\nTeaching Labs · ${TEACHING_LABS_HOME_URL} · ${TEACHING_LABS_CONTACT_EMAIL}\nUnsubscribe anytime: ${unsubscribeUrl}`;
}

export function renderEmailFooterHtml(unsubscribeUrl = TEACHING_LABS_UNSUBSCRIBE_URL, reason = DEFAULT_REASON): string {
  return `
    <td style="padding:20px 32px 28px 32px; background:#0a1128; color:#d7deea; font-size:13px; line-height:1.6;">
      ${reason}<br />
      Teaching Labs · <a href="${TEACHING_LABS_HOME_URL}" style="color:#00F6ED; text-decoration:none;">www.teachinglabs.com</a> · <a href="mailto:${TEACHING_LABS_CONTACT_EMAIL}" style="color:#00F6ED; text-decoration:none;">${TEACHING_LABS_CONTACT_EMAIL}</a><br />
      <a href="${unsubscribeUrl}" style="color:#d7deea; text-decoration:underline;">Unsubscribe anytime</a>
    </td>
  `;
}
