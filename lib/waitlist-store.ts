import { getCourseById } from './courses';
import { getEnrollmentsByCourse, enrollStudent } from './enrollment-store';

export interface CourseWaitlist {
  id: string;
  courseId: string;
  courseTitle: string;
  capacity: number;
  currentEnrollment: number;
}

export interface WaitlistEntry {
  id: string;
  courseId: string;
  studentId: string;
  joinedAt: string;
  position: number;
}

// In-memory stores — reset on server restart (fine for demo)
const waitlistEntries = new Map<string, WaitlistEntry>();
const courseCapacities = new Map<string, number>();

let nextId = 1;

function generateId(): string {
  return `wl_${nextId++}`;
}

/** Get all waitlist entries for a course, sorted by position */
function getEntriesForCourse(courseId: string): WaitlistEntry[] {
  const entries: WaitlistEntry[] = [];
  for (const entry of waitlistEntries.values()) {
    if (entry.courseId === courseId) {
      entries.push(entry);
    }
  }
  return entries.sort((a, b) => a.position - b.position);
}

/** Recalculate positions after a removal */
function reindexPositions(courseId: string): void {
  const entries = getEntriesForCourse(courseId);
  entries.forEach((entry, index) => {
    entry.position = index + 1;
  });
}

/** Set or update course capacity */
export function updateCapacity(courseId: string, capacity: number): CourseWaitlist {
  const course = getCourseById(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  if (capacity < 0) {
    throw new Error('Capacity must be non-negative');
  }

  courseCapacities.set(courseId, capacity);

  const currentEnrollment = getEnrollmentsByCourse(courseId).filter(
    (e) => e.status === 'active',
  ).length;

  return {
    id: `cwl_${courseId}`,
    courseId,
    courseTitle: course.title,
    capacity,
    currentEnrollment,
  };
}

/** Get the capacity for a course (defaults to 30 if not set) */
export function getCapacity(courseId: string): number {
  return courseCapacities.get(courseId) ?? 30;
}

/** Get waitlist info for a course */
export function getWaitlist(courseId: string): {
  waitlist: CourseWaitlist;
  entries: WaitlistEntry[];
} {
  const course = getCourseById(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }

  const capacity = getCapacity(courseId);
  const currentEnrollment = getEnrollmentsByCourse(courseId).filter(
    (e) => e.status === 'active',
  ).length;

  const waitlist: CourseWaitlist = {
    id: `cwl_${courseId}`,
    courseId,
    courseTitle: course.title,
    capacity,
    currentEnrollment,
  };

  const entries = getEntriesForCourse(courseId);

  return { waitlist, entries };
}

/** Add a student to the waitlist */
export function addToWaitlist(courseId: string, studentId: string): WaitlistEntry {
  const course = getCourseById(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }

  // Check if student is already on the waitlist
  for (const entry of waitlistEntries.values()) {
    if (entry.courseId === courseId && entry.studentId === studentId) {
      throw new Error('Student is already on the waitlist for this course');
    }
  }

  // Check if student is already enrolled
  const enrollments = getEnrollmentsByCourse(courseId);
  const alreadyEnrolled = enrollments.some(
    (e) => e.studentId === studentId && e.status === 'active',
  );
  if (alreadyEnrolled) {
    throw new Error('Student is already enrolled in this course');
  }

  // Check if course is actually full
  const capacity = getCapacity(courseId);
  const activeEnrollments = enrollments.filter((e) => e.status === 'active').length;
  if (activeEnrollments < capacity) {
    throw new Error('Course is not full. Enroll directly instead of joining the waitlist.');
  }

  const entries = getEntriesForCourse(courseId);
  const position = entries.length + 1;

  const id = generateId();
  const entry: WaitlistEntry = {
    id,
    courseId,
    studentId,
    joinedAt: new Date().toISOString(),
    position,
  };

  waitlistEntries.set(id, entry);
  return entry;
}

/** Remove a student from the waitlist */
export function removeFromWaitlist(entryId: string): WaitlistEntry {
  const entry = waitlistEntries.get(entryId);
  if (!entry) {
    throw new Error(`Waitlist entry not found: ${entryId}`);
  }

  const courseId = entry.courseId;
  waitlistEntries.delete(entryId);

  // Reindex remaining entries
  reindexPositions(courseId);

  return entry;
}

/** Auto-enroll the next student from the waitlist */
export function enrollFromWaitlist(courseId: string): {
  enrolled: boolean;
  entry?: WaitlistEntry;
  message: string;
} {
  const course = getCourseById(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }

  const capacity = getCapacity(courseId);
  const activeEnrollments = getEnrollmentsByCourse(courseId).filter(
    (e) => e.status === 'active',
  ).length;

  if (activeEnrollments >= capacity) {
    return {
      enrolled: false,
      message: `Course is full (${activeEnrollments}/${capacity}). No spots available.`,
    };
  }

  const entries = getEntriesForCourse(courseId);
  if (entries.length === 0) {
    return {
      enrolled: false,
      message: 'No students on the waitlist.',
    };
  }

  // Take the first in queue
  const nextEntry = entries[0];

  // Enroll the student
  enrollStudent(nextEntry.studentId, courseId, true);

  // Remove from waitlist
  waitlistEntries.delete(nextEntry.id);
  reindexPositions(courseId);

  return {
    enrolled: true,
    entry: nextEntry,
    message: `Student ${nextEntry.studentId} enrolled from waitlist position #${nextEntry.position}.`,
  };
}
