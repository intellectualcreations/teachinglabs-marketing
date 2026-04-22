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
  classroom_name?: string | null;
  twin_name?: string | null;
  twin_tagline?: string | null;
}

/**
 * Return the name students should see for this teacher.
 * Falls back sensibly if classroom_name isn't set yet (e.g. older accounts).
 */
export function teacherClassroomName(row: TeacherIdentityRow | null | undefined): string {
  if (!row) return 'Your Teacher';
  if (row.classroom_name && row.classroom_name.trim()) return row.classroom_name.trim();
  if (row.last_name && row.last_name.trim()) return `Mrs. ${row.last_name.trim()}`;
  if (row.preferred_name && row.preferred_name.trim()) return row.preferred_name.trim();
  if (row.first_name && row.first_name.trim()) return row.first_name.trim();
  return 'Your Teacher';
}

/**
 * Return the name students should see for this teacher's AI Twin.
 */
export function teacherTwinName(row: TeacherIdentityRow | null | undefined): string {
  if (row?.twin_name && row.twin_name.trim()) return row.twin_name.trim();
  return 'Coach Sparkle';
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
 * For AI system prompts \u2014 what the Twin should call the human teacher
 * when talking to students. Never use legal name.
 */
export function teacherPromptName(row: TeacherIdentityRow | null | undefined): string {
  return teacherClassroomName(row);
}
