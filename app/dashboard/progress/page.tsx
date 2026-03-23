'use client'

const MOCK_PROGRESS = {
  streak: 7,
  courses: [
    { id: 'python', name: 'Python Fundamentals', completionPct: 67, quizScores: [85, 92, 78] },
    { id: 'marketing', name: 'Digital Marketing', completionPct: 34, quizScores: [91] },
    { id: 'webdev', name: 'Web Development', completionPct: 12, quizScores: [] },
  ],
}

export default function ProgressPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Progress</h1>
      <div className="mb-6 inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold">
        🔥 {MOCK_PROGRESS.streak}-Day Streak
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {MOCK_PROGRESS.courses.map((course) => {
          const avg = course.quizScores.length > 0
            ? Math.round(course.quizScores.reduce((a, b) => a + b, 0) / course.quizScores.length)
            : null
          return (
            <div key={course.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-semibold text-gray-800">{course.name}</h2>
                {avg !== null && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Avg: {avg}%</span>
                )}
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Completion</span>
                  <span>{course.completionPct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div className="bg-blue-500 h-2 rounded" style={{ width: `${course.completionPct}%` }} />
                </div>
              </div>
              {course.quizScores.length > 0 ? (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quiz Scores:</p>
                  <div className="flex gap-2 flex-wrap">
                    {course.quizScores.map((score, i) => (
                      <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Quiz {i + 1}: {score}%
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No quizzes yet</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
