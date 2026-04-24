'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api-fetch';

interface ProgressStats {
  courseCompletion: number;
  totalAssignments: number;
  completedAssignments: number;
  avgScore: number;
}

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const studentId = 'demo-student-1';

  useEffect(() => {
    authFetch(`/api/students/${studentId}/progress`)
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) return <div className="p-8">Loading progress...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Progress</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-500">Course Completion</p>
          <p className="text-3xl font-bold text-blue-600">{stats.courseCompletion}%</p>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-500">Avg Score</p>
          <p className="text-3xl font-bold text-green-600">{stats.avgScore}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold">{stats.completedAssignments}/{stats.totalAssignments}</p>
        </div>
      </div>
    </div>
  );
}
