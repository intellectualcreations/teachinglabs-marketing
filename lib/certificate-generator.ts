import { getCurrentUser } from './users';
import { getCourseById } from './courses';
import { getLessonProgress } from './lesson-store';
import { getEnrollments } from './enrollment-store';

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  courseSubject: string;
  instructor: string;
  completionDate: string;
  lessonCount: number;
}

/**
 * Validate that a student has completed 100% of the course
 * and return the certificate data if eligible.
 */
export function generateCertificateData(
  studentId: string,
  courseId: string,
): { eligible: boolean; data?: CertificateData; error?: string; progress?: number } {
  const enrollments = getEnrollments(studentId);
  const enrollment = enrollments.find((e) => e.courseId === courseId);
  if (!enrollment) {
    return { eligible: false, error: 'Not enrolled in this course' };
  }

  const course = getCourseById(courseId);
  if (!course) {
    return { eligible: false, error: 'Course not found' };
  }

  const progress = getLessonProgress(studentId, courseId);
  if (progress.percentage < 100) {
    return {
      eligible: false,
      error: 'Course not yet completed',
      progress: progress.percentage,
    };
  }

  const user = getCurrentUser('student');

  return {
    eligible: true,
    data: {
      studentName: user.name,
      courseTitle: course.title,
      courseSubject: course.subject,
      instructor: course.instructor,
      completionDate: new Date().toISOString().split('T')[0],
      lessonCount: progress.total,
    },
  };
}
