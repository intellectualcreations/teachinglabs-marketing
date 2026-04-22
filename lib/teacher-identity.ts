/**
 * Teacher identity helpers.
 *
 * Teachers have three identity layers:
 *   - display_name:   legal/admin name (e.g. "Dottie Stewart")
 *   - classroom_name: what students see (e.g. "Mrs. Stewart")
 *   - twin_name:      the AI co-teacher's name (e.g. "Coach Sparkle")
 *
 * Student-facing surfaces MUST use classroom_name. Legal name is for admin only.
 */

export interface TeacherIdentityRow {
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  preferred_name?: string | null;
  // Legacy single-string fields (kept for backward compat)
  classroom_name?: string | null;
  twin_name?: string | null;
  twin_tagline?: string | null;
  // Structured parts (preferred)
  classroom_title?: string | null;     // 'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | 'Coach' | 'Dr.' | custom
  classroom_surname?: string | null;   // usually last_name
  twin_clarifier?: string | null;      // 'Coach' | 'Spark' | 'Mentor' | 'Assistant' | 'Helper' | custom
  twin_unique_name?: string | null;    // optional (e.g. 'Sparkle', 'Genius', 'Bot')
}

export const CLASSROOM_TITLE_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Coach'] as const;
export const TWIN_CLARIFIER_OPTIONS = ['Coach', 'Spark', 'Mentor', 'Assistant', 'Helper', 'Bot'] as const;

/**
 * Return the name students should see for this teacher.
 * Prefers structured parts (title + surname), falls back to legacy classroom_name,
 * then to last_name with 'Mrs.' as a safe default prefix.
 */
export function teacherClassroomName(row: TeacherIdentityRow | null | undefined): string {
  if (!row) return 'Your Teacher';
  if (row.classroom_title && row.classroom_surname) {
    return `${row.classroom_title.trim()} ${row.classroom_surname.trim()}`.replace(/\s+/g, ' ').trim();
  }
  if (row.classroom_name && row.classroom_name.trim()) return row.classroom_name.trim();
  if (row.last_name && row.last_name.trim()) return `Mrs. ${row.last_name.trim()}`;
  if (row.preferred_name && row.preferred_name.trim()) return row.preferred_name.trim();
  if (row.first_name && row.first_name.trim()) return row.first_name.trim();
  return 'Your Teacher';
}

/**
 * Return the name students should see for this teacher's AI Twin.
 * Always starts with 'AI' — this is a non-negotiable safety/clarity rule.
 * Format: 'AI <clarifier>[ <unique_name>]' (e.g. 'AI Coach Sparkle' / 'AI Mentor').
 */
export function teacherTwinName(row: TeacherIdentityRow | null | undefined): string {
  const clarifier = (row?.twin_clarifier && row.twin_clarifier.trim()) || 'Coach';
  const unique = row?.twin_unique_name && row.twin_unique_name.trim();
  const base = unique ? `AI ${clarifier} ${unique}` : `AI ${clarifier}`;
  return base.replace(/\s+/g, ' ').trim();
}

/**
 * Short tagline for the Twin, e.g. "Mrs. Stewart's AI co-teacher".
 * Shown as a subtitle under the Twin's name.
 */
export function teacherTwinTagline(row: TeacherIdentityRow | null | undefined): string {
  if (row?.twin_tagline && row.twin_tagline.trim()) return row.twin_tagline.trim();
  const classroom = teacherClassroomName(row);
  return `${classroom}'s AI co-teacher`;
}

/**
 * Safe validator for teacher-chosen custom classroom title / twin clarifier /
 * twin unique name. Strips anything that would strip the 'AI ' prefix or
 * allow impersonation of the human teacher or another human.
 */
export function sanitizeIdentityPart(part: string | null | undefined, maxLen = 30): string {
  if (!part) return '';
  const cleaned = String(part).trim().replace(/\s+/g, ' ').slice(0, maxLen);
  // Reject attempts to inject 'AI ' to bypass prefix rule or masquerade as human.
  return cleaned.replace(/^AI\s+/i, '').replace(/[\n\r\t]/g, '');
}

/**
 * For AI system prompts \u2014 what the Twin should call the human teacher
 * when talking to students. Never use legal name.
 */
export function teacherPromptName(row: TeacherIdentityRow | null | undefined): string {
  return teacherClassroomName(row);
}
