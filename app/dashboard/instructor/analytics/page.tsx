'use client';

const MOCK_ANALYTICS = {
  totalEnrolled: 1247,
  avgCompletionRate: 68.4,
  activeLast30Days: 384,
  courses: [
    { name: 'Intro to Python', enrolled: 342, completionRate: 74, avgScore: 82 },
    { name: 'Web Dev Fundamentals', enrolled: 289, completionRate: 65, avgScore: 78 },
    { name: 'Data Science 101', enrolled: 198, completionRate: 71, avgScore: 85 },
    { name: 'Advanced React', enrolled: 156, completionRate: 58, avgScore: 76 },
    { name: 'Machine Learning Basics', enrolled: 262, completionRate: 63, avgScore: 80 },
  ],
  quizScoreDistribution: [
    { range: '90-100', count: 218, pct: 17 },
    { range: '80-89', count: 374, pct: 30 },
    { range: '70-79', count: 312, pct: 25 },
    { range: '60-69', count: 199, pct: 16 },
    { range: 'Below 60', count: 144, pct: 12 },
  ],
};

export default function InstructorAnalyticsPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of student engagement and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Enrolled</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{MOCK_ANALYTICS.totalEnrolled.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Completion Rate</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">{MOCK_ANALYTICS.avgCompletionRate}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active (30 days)</p>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">{MOCK_ANALYTICS.activeLast30Days}</p>
        </div>
      </div>

      {/* Completion Rate per Course — CSS bar chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Completion Rate by Course</h2>
        <div className="space-y-3">
          {MOCK_ANALYTICS.courses.map((course) => (
            <div key={course.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-xs">{course.name}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">{course.completionRate}% ({course.enrolled} enrolled)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all"
                  style={{ width: `${course.completionRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Score Distribution — CSS bar chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Quiz Score Distribution</h2>
        <div className="flex items-end gap-4 h-40">
          {MOCK_ANALYTICS.quizScoreDistribution.map((bucket) => (
            <div key={bucket.range} className="flex flex-col items-center flex-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{bucket.pct}%</span>
              <div
                className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t"
                style={{ height: `${(bucket.pct / 30) * 100}%`, minHeight: '8px' }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center leading-tight">{bucket.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold p-6 pb-3 text-gray-800 dark:text-white">Course Performance</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Course', 'Enrolled', 'Completion', 'Avg Quiz Score'].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {MOCK_ANALYTICS.courses.map((c) => (
              <tr key={c.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-3 text-gray-800 dark:text-white font-medium">{c.name}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{c.enrolled}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.completionRate >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                    {c.completionRate}%
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{c.avgScore}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
