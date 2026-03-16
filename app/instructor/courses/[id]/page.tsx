'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface StudentRow {
  studentId: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  status: 'active' | 'completed';
  completedModules: string[];
}

interface CourseInfo {
  id: string;
  title: string;
  description: string;
  subject: string;
  modules: { title: string; lessonCount: number }[];
  instructor: string;
  gradeLevel: string;
  thumbnail?: string;
  published: boolean;
  price: number;
}

const SUBJECT_COLORS: Record<string, string> = {
  Math: 'bg-teal text-white',
  Science: 'bg-[#059669] text-white',
  English: 'bg-coral text-white',
  'Social Studies': 'bg-navy text-white',
  Electives: 'bg-gold text-deep-navy',
};

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    Promise.all([
      fetch(`/api/courses/${courseId}/students`).then((r) => r.json()),
      fetch('/api/instructor/courses').then((r) => r.json()),
    ])
      .then(([studentsData, coursesData]) => {
        setStudents(studentsData.students || []);
        const fullCourse = (coursesData.courses || []).find(
          (c: CourseInfo) => c.id === courseId,
        );
        setCourse(fullCourse || null);
        if (!fullCourse && !studentsData.students) {
          setError('Course not found');
        }
      })
      .catch(() => setError('Failed to load course data'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleTogglePublish = useCallback(async () => {
    if (!course) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/publish`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setCourse((prev) =>
          prev ? { ...prev, published: data.course.published } : prev,
        );
      }
    } catch {
      // silent fail for demo
    } finally {
      setToggling(false);
    }
  }, [course, courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">{error || 'Course not found'}</p>
        <Link href="/instructor/dashboard" className="text-teal hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const subjectClass = SUBJECT_COLORS[course.subject] || 'bg-gray-200 text-gray-800';

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/instructor/dashboard"
          className="text-sm text-text-muted hover:text-teal transition-colors inline-flex items-center gap-1"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Course Header */}
      <div className="bg-card-bg border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${subjectClass}`}>
                {course.subject}
              </span>
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                  course.published
                    ? 'bg-teal/10 text-teal'
                    : 'bg-gold/10 text-gold'
                }`}
              >
                {course.published ? 'Published' : 'Draft'}
              </span>
              {course.price > 0 && (
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-coral/10 text-coral">
                  ${(course.price / 100).toFixed(2)}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              {course.title}
            </h1>
            <p className="text-text-secondary mt-2 max-w-2xl">{course.description}</p>
            <p className="text-sm text-text-muted mt-2">{course.gradeLevel}</p>
          </div>
          <div className="flex flex-col gap-3 items-end">
            <div className="flex gap-3 text-sm text-text-muted">
              <div className="text-center px-4 py-2 bg-surface rounded-lg border border-border">
                <p className="text-xl font-bold text-teal">{students.length}</p>
                <p>Students</p>
              </div>
              <div className="text-center px-4 py-2 bg-surface rounded-lg border border-border">
                <p className="text-xl font-bold text-navy dark:text-blue-300">{course.modules.length}</p>
                <p>Modules</p>
              </div>
            </div>
            <button
              onClick={handleTogglePublish}
              disabled={toggling}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer border-0 ${
                course.published
                  ? 'bg-gold/10 text-gold hover:bg-gold/20'
                  : 'bg-teal text-white hover:bg-teal/90'
              } disabled:opacity-50`}
            >
              {toggling
                ? 'Updating...'
                : course.published
                  ? 'Unpublish'
                  : 'Publish Course'}
            </button>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="bg-card-bg border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-text-primary">
            Course Modules
          </h2>
          <Link
            href={`/instructor/courses/${courseId}/quiz`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:text-navy transition-colors"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Quiz
          </Link>
        </div>
        <div className="space-y-2">
          {course.modules.map((mod, idx) => (
            <div
              key={mod.title}
              className="flex items-center justify-between py-2.5 px-4 bg-surface rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-teal/10 text-teal text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-text-primary">{mod.title}</span>
              </div>
              <span className="text-xs text-text-muted">{mod.lessonCount} lessons</span>
            </div>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Enrolled Students
        </h2>
        {students.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">No students enrolled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-text-muted font-medium">Student Name</th>
                  <th className="text-left py-3 px-4 text-text-muted font-medium">Enrolled Date</th>
                  <th className="text-left py-3 px-4 text-text-muted font-medium">Progress</th>
                  <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.studentId} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-text-primary">{student.name}</p>
                        <p className="text-xs text-text-muted">{student.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {new Date(student.enrolledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              student.progress === 100
                                ? 'bg-success'
                                : student.progress >= 50
                                  ? 'bg-teal'
                                  : 'bg-gold'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-text-primary font-medium w-10 text-right">
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                          student.status === 'completed'
                            ? 'bg-success/10 text-success'
                            : 'bg-teal/10 text-teal'
                        }`}
                      >
                        {student.status === 'completed' ? 'Completed' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
