// ── Types ──────────────────────────────────────────────

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  body: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

// ── In-memory store ────────────────────────────────────

const announcements = new Map<string, Announcement>();

let nextAnnouncementId = 1;

// ── Mutations ──────────────────────────────────────────

export function createAnnouncement(
  courseId: string,
  title: string,
  body: string,
  instructorId: string,
): Announcement {
  const now = new Date().toISOString();
  const announcement: Announcement = {
    id: `announcement_${nextAnnouncementId++}`,
    courseId,
    title,
    body,
    instructorId,
    createdAt: now,
    updatedAt: now,
  };
  announcements.set(announcement.id, announcement);
  return announcement;
}

export function updateAnnouncement(
  announcementId: string,
  updates: Partial<Pick<Announcement, 'title' | 'body'>>,
): Announcement | undefined {
  const announcement = announcements.get(announcementId);
  if (!announcement) return undefined;

  if (updates.title !== undefined) announcement.title = updates.title;
  if (updates.body !== undefined) announcement.body = updates.body;
  announcement.updatedAt = new Date().toISOString();
  return announcement;
}

export function deleteAnnouncement(announcementId: string): boolean {
  return announcements.delete(announcementId);
}

// ── Queries ────────────────────────────────────────────

export function getAnnouncementsForCourse(courseId: string): Announcement[] {
  return Array.from(announcements.values())
    .filter((a) => a.courseId === courseId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAnnouncement(announcementId: string): Announcement | undefined {
  return announcements.get(announcementId);
}
