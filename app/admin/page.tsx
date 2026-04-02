'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  publishedCourses: number;
  totalStudents: number;
  totalInstructors: number;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  enrollmentCount: number;
}

interface CourseRow {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  published: boolean;
  price: number;
  enrollmentCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/courses').then((r) => r.json()),
    ])
      .then(([statsData, usersData, coursesData]) => {
        setStats(statsData);
        setUsers(usersData.users || []);
        setCourses(coursesData.courses || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8 max-md:grid-cols-1">
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <p className="text-3xl font-heading font-bold text-teal">{stats.totalUsers}</p>
            <p className="text-sm text-text-muted mt-1">Total Users</p>
            <p className="text-xs text-text-muted mt-0.5">
              {stats.totalStudents} students, {stats.totalInstructors} instructors
            </p>
          </div>
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <p className="text-3xl font-heading font-bold text-navy dark:text-blue-300">{stats.totalCourses}</p>
            <p className="text-sm text-text-muted mt-1">Total Courses</p>
            <p className="text-xs text-text-muted mt-0.5">
              {stats.publishedCourses} published
            </p>
          </div>
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <p className="text-3xl font-heading font-bold text-coral">{stats.totalEnrollments}</p>
            <p className="text-sm text-text-muted mt-1">Total Enrollments</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card-bg border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Name</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Email</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Role</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Enrollments</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-text-primary">{user.name}</td>
                  <td className="py-3 px-4 text-text-secondary">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-coral/10 text-coral'
                          : user.role === 'instructor'
                            ? 'bg-navy/10 text-navy dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-teal/10 text-teal'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{user.enrollmentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Courses
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Course</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Instructor</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Enrollments</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Price</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
