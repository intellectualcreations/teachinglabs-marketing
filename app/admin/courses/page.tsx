'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '@/lib/api-fetch';

interface CourseRow {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  published: boolean;
  price: number;
  enrollmentCount: number;
}

interface UserRow {
  id: string;
  name: string;
  role: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [students, setStudents] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollModal, setEnrollModal] = useState<{ courseId: string; courseTitle: string } | null>(null);
  const [enrollAction, setEnrollAction] = useState<'enroll' | 'unenroll'>('enroll');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = useCallback(() => {
    Promise.all([
      authFetch('/api/admin/courses').then((r) => r.json()),
      authFetch('/api/admin/users').then((r) => r.json()),
    ])
      .then(([coursesData, usersData]) => {
        setCourses(coursesData.courses || []);
        setStudents((usersData.users || []).filter((u: UserRow) => u.role === 'student'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleEnrollAction() {
    if (!enrollModal || !selectedStudent) return;
    try {
      const res = await authFetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          courseId: enrollModal.courseId,
          action: enrollAction,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(
          enrollAction === 'enroll'
            ? `Student enrolled in ${enrollModal.courseTitle}`
            : `Student unenrolled from ${enrollModal.courseTitle}`,
        );
        loadData();
      } else {
        setActionMessage(data.error || 'Action failed');
      }
    } catch {
      setActionMessage('Action failed');
    }
    setEnrollModal(null);
    setSelectedStudent('');
    setTimeout(() => setActionMessage(null), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">
        Courses
      </h1>

      {actionMessage && (
        <div className="bg-teal/10 border border-teal/20 rounded-lg px-4 py-3 mb-4 text-sm text-teal font-medium">
          {actionMessage}
        </div>
      )}

      <div className="bg-card-bg border border-border rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Course</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Instructor</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Enrollments</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Price</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-text-primary">{course.title}</p>
                    <p className="text-xs text-text-muted">{course.subject}</p>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{course.instructor}</td>
                  <td className="py-3 px-4 text-text-secondary">{course.enrollmentCount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                        course.published
                          ? 'bg-teal/10 text-teal'
                          : 'bg-gold/10 text-gold'
                      }`}
                    >
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary font-medium">
                    {course.price > 0 ? `$${(course.price / 100).toFixed(2)}` : 'Free'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEnrollModal({ courseId: course.id, courseTitle: course.title });
                          setEnrollAction('enroll');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal/10 text-teal hover:bg-teal/20 transition-colors cursor-pointer border-0"
                      >
                        Enroll
                      </button>
                      <button
                        onClick={() => {
                          setEnrollModal({ courseId: course.id, courseTitle: course.title });
                          setEnrollAction('unenroll');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-coral/10 text-coral hover:bg-coral/20 transition-colors cursor-pointer border-0"
                      >
                        Unenroll
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Modal */}
      {enrollModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEnrollModal(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-card-bg border border-border rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-heading text-lg font-bold text-text-primary mb-4">
                {enrollAction === 'enroll' ? 'Enroll Student' : 'Unenroll Student'}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {enrollAction === 'enroll' ? 'Enroll a student in' : 'Remove a student from'}{' '}
                <strong>{enrollModal.courseTitle}</strong>
              </p>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary text-sm mb-4 outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setEnrollModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-semibold hover:bg-surface transition-colors cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollAction}
                  disabled={!selectedStudent}
                  className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                    enrollAction === 'enroll'
                      ? 'bg-teal hover:bg-teal/90'
                      : 'bg-coral hover:bg-coral/90'
                  }`}
                >
                  {enrollAction === 'enroll' ? 'Enroll' : 'Unenroll'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
