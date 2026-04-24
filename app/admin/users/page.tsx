'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api-fetch';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  enrollmentCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
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

  const students = users.filter((u) => u.role === 'student');
  const instructors = users.filter((u) => u.role === 'instructor');
  const admins = users.filter((u) => u.role === 'admin');

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">
        Users
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-md:grid-cols-1">
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <p className="text-3xl font-heading font-bold text-teal">{students.length}</p>
          <p className="text-sm text-text-muted mt-1">Students</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <p className="text-3xl font-heading font-bold text-navy dark:text-blue-300">{instructors.length}</p>
          <p className="text-sm text-text-muted mt-1">Instructors</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <p className="text-3xl font-heading font-bold text-coral">{admins.length}</p>
          <p className="text-sm text-text-muted mt-1">Admins</p>
        </div>
      </div>

      {/* Full Users Table */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
          All Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-muted font-medium">ID</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Name</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Email</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Role</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Enrollments</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4 text-text-muted font-mono text-xs">{user.id}</td>
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
    </div>
  );
}
