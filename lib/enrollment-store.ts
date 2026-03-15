import { getCourseById } from './courses';

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed';
  progress: number; // 0-100
  completedModules: string[]; // module titles
}

// In-memory store — resets on server restart (fine for demo)
const enrollments = new Map<string, Enrollment>();

let nextId = 1;

function generateId(): string {
  return `enr_${nextId++}`;
}

// Pre-seed demo enrollments
function seed() {
  const demoEnrollments: Omit<Enrollment, 'id'>[] = [
    {
      studentId: 'demo-student',
      courseId: 'algebra-1',
      enrolledAt: '2026-02-15T10:00:00Z',
      status: 'active',
      progress: 50,
      completedModules: ['Expressions & Variables', 'Linear Equations'],
    },
    {
      studentId: 'demo-student',
      courseId: 'biology',
      enrolledAt: '2026-02-20T14:30:00Z',
      status: 'active',
      progress: 25,
      completedModules: ['Cell Structure & Function'],
    },
    {
      studentId: 'demo-student',
      courseId: 'creative-writing',
      enrolledAt: '2026-01-10T09:00:00Z',
      status: 'completed',
      progress: 100,
      completedModules: [
        'Finding Your Voice',
        'Short Fiction Workshop',
        'Poetry & Spoken Word',
        'Revision & Portfolio',
      ],
    },
  ];

  for (const e of demoEnrollments) {
    const id = generateId();
    enrollments.set(id, { id, ...e });
  }
}

seed();

export function enrollStudent(
  studentId: string,
  courseId: string,
): { enrollment: Enrollment; created: boolean } {
  // Check for existing enrollment
  for (const e of enrollments.values()) {
    if (e.studentId === studentId && e.courseId === courseId) {
      return { enrollment: e, created: false };
    }
  }

  // Verify course exists
  const course = getCourseById(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }

  const id = generateId();
  const enrollment: Enrollment = {
    id,
    studentId,
    courseId,
    enrolledAt: new Date().toISOString(),
    status: 'active',
    progress: 0,
    completedModules: [],
  };

  enrollments.set(id, enrollment);
  return { enrollment, created: true };
}

export function getEnrollments(studentId: string): Enrollment[] {
  const results: Enrollment[] = [];
  for (const e of enrollments.values()) {
    if (e.studentId === studentId) {
      results.push(e);
    }
  }
  return results;
}

export function getEnrollment(enrollmentId: string): Enrollment | undefined {
  return enrollments.get(enrollmentId);
}

export function updateModuleProgress(
  enrollmentId: string,
  moduleTitle: string,
): Enrollment | undefined {
  const enrollment = enrollments.get(enrollmentId);
  if (!enrollment) return undefined;

  // Don't double-add
  if (enrollment.completedModules.includes(moduleTitle)) {
    return enrollment;
  }

  const course = getCourseById(enrollment.courseId);
  if (!course) return undefined;

  // Verify module exists in course
  const moduleExists = course.modules.some((m) => m.title === moduleTitle);
  if (!moduleExists) return undefined;

  enrollment.completedModules.push(moduleTitle);
  enrollment.progress = Math.round(
    (enrollment.completedModules.length / course.modules.length) * 100,
  );

  if (enrollment.completedModules.length >= course.modules.length) {
    enrollment.status = 'completed';
    enrollment.progress = 100;
  }

  return enrollment;
}
