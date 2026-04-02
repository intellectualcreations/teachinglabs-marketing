export interface DeadlineEntry {
  assignmentId: string;
  title: string;
  courseId: string;
  dueDate: string;
}

const deadlines = new Map<string, DeadlineEntry>();

export function setDeadline(assignmentId: string, title: string, courseId: string, dueDate: string): DeadlineEntry {
  const entry: DeadlineEntry = { assignmentId, title, courseId, dueDate };
  deadlines.set(assignmentId, entry);
  return entry;
}

export function getUpcomingReminders(withinHours = 48) {
  const now = Date.now();
  const cutoff = now + withinHours * 3600 * 1000;
  const results = [];
  for (const d of deadlines.values()) {
    const due = new Date(d.dueDate).getTime();
    if (due > now && due <= cutoff) {
      const hoursUntilDue = Math.round((due - now) / 3600000 * 10) / 10;
      results.push({ ...d, hoursUntilDue });
    }
  }
  return results.sort((a: any, b: any) => a.hoursUntilDue - b.hoursUntilDue);
}
