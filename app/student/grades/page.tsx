'use client';

import { useEffect, useState } from 'react';
import {
  Trophy,
  Exam,
  ChatText,
  CalendarBlank,
  ArrowLeft,
  Robot,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react';
import Link from 'next/link';
import AIFeedbackView from '@/components/grading/AIFeedbackView';

interface CriteriaScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback: string;
}

interface AIGradeData {
  aiScore: number | null;
  aiCriteriaScores: CriteriaScore[];
  aiFeedback: string;
  improvementSuggestions: string[];
  finalScore: number | null;
  status: string;
}

interface Grade {
  submissionId: string;
  studentId: string;
  quizId: string;
  score: number;
  feedback: string;
  gradedAt: string;
  gradedBy: string;
  quizTitle: string;
  courseId: string;
  courseTitle: string;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/30';
  if (score >= 50) return 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/30';
  return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/30';
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Review Required';
}

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAI, setExpandedAI] = useState<string | null>(null);
  const [aiGrades, setAiGrades] = useState<Record<string, AIGradeData>>({});

  useEffect(() => {
    fetch('/api/student/grades')
      .then((res) => res.json())
      .then((data) => setGrades(data.grades || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function toggleAIFeedback(submissionId: string) {
    if (expandedAI === submissionId) {
      setExpandedAI(null);
      return;
    }

    setExpandedAI(submissionId);

    if (!aiGrades[submissionId]) {
      try {
        const res = await fetch(`/api/submissions/${submissionId}/grade`);
        if (res.ok) {
          const data = await res.json();
          setAiGrades((prev) => ({ ...prev, [submissionId]: data.gradeSubmission }));
        }
      } catch (err) {
        console.error('Failed to fetch AI grade:', err);
      }
    }
  }

  const avgScore = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/student/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-teal transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
          <Trophy size={28} weight="duotone" className="text-teal" />
          My Grades
        </h1>
        <p className="text-text-secondary mt-1">
          Your quiz scores and instructor feedback
        </p>
      </div>

      {/* Summary stat */}
      {grades.length > 0 && (
        <div className="rounded-xl border border-teal/30 bg-teal/5 p-5 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium">Average Score</p>
              <p className={`text-3xl font-heading font-bold mt-1 ${scoreColor(avgScore)}`}>
                {avgScore}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted font-medium">Quizzes Graded</p>
              <p className="text-3xl font-heading font-bold mt-1 text-teal">
                {grades.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grades list */}
      {grades.length === 0 ? (
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center">
          <Exam size={48} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted font-medium mb-1">No grades yet</p>
          <p className="text-sm text-text-muted">
            Your graded quiz results will appear here once your instructor reviews them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grades.map((g) => (
            <div
              key={g.submissionId}
              className="bg-card-bg border border-border rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-heading font-semibold text-text-primary">
                    {g.quizTitle}
                  </h3>
                  <p className="text-sm text-text-muted mt-0.5">
                    {g.courseTitle}
                  </p>
                </div>

                <div className={`shrink-0 px-3 py-1.5 rounded-lg border font-bold text-lg ${scoreBg(g.score)} ${scoreColor(g.score)}`}>
                  {g.score}%
                </div>
              </div>

              {/* Score label */}
              <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                <span className={`font-semibold ${scoreColor(g.score)}`}>
                  {scoreLabel(g.score)}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarBlank size={12} />
                  {new Date(g.gradedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Feedback */}
              {g.feedback && (
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-start gap-2">
                    <ChatText size={16} className="text-teal mt-0.5 shrink-0" />
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {g.feedback}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Feedback Toggle */}
              <button
                onClick={() => toggleAIFeedback(g.submissionId)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal/80 transition-colors"
              >
                <Robot size={14} />
                AI Feedback
                {expandedAI === g.submissionId ? <CaretUp size={12} /> : <CaretDown size={12} />}
              </button>

              {expandedAI === g.submissionId && aiGrades[g.submissionId] && (
                <div className="mt-3">
                  <AIFeedbackView
                    score={aiGrades[g.submissionId].finalScore}
                    criteriaScores={aiGrades[g.submissionId].aiCriteriaScores}
                    feedback={aiGrades[g.submissionId].aiFeedback}
                    improvementSuggestions={aiGrades[g.submissionId].improvementSuggestions}
                    status={aiGrades[g.submissionId].status}
                  />
                </div>
              )}

              {expandedAI === g.submissionId && !aiGrades[g.submissionId] && (
                <div className="mt-3 text-center py-4">
                  <p className="text-xs text-text-muted">No AI feedback available for this submission.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
