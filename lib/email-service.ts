/**
 * Email service — console transport for development.
 * Logs emails to stdout in a readable format.
 */

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

function sendEmail({ to, subject, body }: EmailPayload): void {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  📧  EMAIL NOTIFICATION                             ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  To:      ${to}`);
  console.log(`║  Subject: ${subject}`);
  console.log('╠──────────────────────────────────────────────────────╣');
  console.log(`║  ${body.replace(/\n/g, '\n║  ')}`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
}

// ── Enrollment confirmation ────────────────────────────

export function sendEnrollmentConfirmation(
  studentEmail: string,
  studentName: string,
  courseTitle: string,
): void {
  sendEmail({
    to: studentEmail,
    subject: `You're enrolled in ${courseTitle}!`,
    body: [
      `Hi ${studentName},`,
      '',
      `Welcome to "${courseTitle}" on TeachingLabs!`,
      '',
      'You can start your first lesson right away from your dashboard.',
      'If you have any questions, reach out to your instructor through the course discussion forum.',
      '',
      'Happy learning!',
      '— The TeachingLabs Team',
    ].join('\n'),
  });
}

// ── Forum reply notification ───────────────────────────

export function sendForumReplyNotification(
  authorEmail: string,
  authorName: string,
  replierName: string,
  postTitle: string,
  courseTitle: string,
  replyPreview: string,
): void {
  sendEmail({
    to: authorEmail,
    subject: `${replierName} replied to your post in ${courseTitle}`,
    body: [
      `Hi ${authorName},`,
      '',
      `${replierName} replied to your post "${postTitle}" in ${courseTitle}:`,
      '',
      `"${replyPreview.length > 200 ? replyPreview.slice(0, 200) + '...' : replyPreview}"`,
      '',
      'Head to the course forum to continue the conversation.',
      '',
      '— The TeachingLabs Team',
    ].join('\n'),
  });
}

// ── Live session reminder ──────────────────────────────

export function sendLiveSessionReminder(
  studentEmail: string,
  studentName: string,
  sessionTitle: string,
  courseTitle: string,
  scheduledAt: string,
  joinUrl: string,
): void {
  const date = new Date(scheduledAt);
  const formatted = date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  sendEmail({
    to: studentEmail,
    subject: `Reminder: "${sessionTitle}" starts tomorrow`,
    body: [
      `Hi ${studentName},`,
      '',
      `Your live session "${sessionTitle}" for ${courseTitle} is coming up!`,
      '',
      `When: ${formatted}`,
      `Join link: ${joinUrl}`,
      '',
      'Make sure to join a few minutes early to test your audio and video.',
      '',
      '— The TeachingLabs Team',
    ].join('\n'),
  });
}
