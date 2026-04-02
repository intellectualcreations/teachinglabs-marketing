'use client';

import { useState } from 'react';
import {
  Robot,
  Student,
  CheckCircle,
  PencilSimple,
  ListChecks,
} from '@phosphor-icons/react';

interface CriteriaScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback: string;
}

interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

interface GradeSubmissionData {
  id: string;
  submissionId: string;
  studentId: string;
  studentName: string;
  assignmentId: string;
  quizTitle: string;
  aiScore: number | null;
  aiCriteriaScores: CriteriaScore[];
  aiFeedback: string;
  improvementSuggestions: string[];
  instructorOverrideScore: number | null;
  instructorNotes: string;
  finalScore: number | null;
  status: string;
  rubricCriteria: RubricCriterion[];
  answers: { questionId: string; answer: number | string }[];
  autoScore: number | null;
}

interface InstructorGradeReviewProps {
  submission: GradeSubmissionData;
  onUpdated?: () => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

export default function InstructorGradeReview({
  submission,
  onUpdated,
}: InstructorGradeReviewProps) {
  const [overrideScore, setOverrideScore] = useState('');
  const [notes, setNotes] = useState('');
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  async function handleApprove() {
    setActing(true);
    setError('');
    try {
      const res = await fetch(`/api/submissions/${submission.submissionId}/grade/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Approve failed');
        return;
      }
      onUpdated?.();
    } catch {
      setError('Network error');
    } finally {
      setActing(false);
    }
  }

  async function handleOverride() {
    const score = Number(overrideScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setError('Score must be between 0 and 100');
      return;
    }

    setActing(true);
    setError('');
    try {
      const res = await fetch(`/api/submissions/${submission.submissionId}/grade/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'override', score, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Override failed');
        return;
      }
      onUpdated?.();
    } catch {
      setError('Network error');
    } finally {
      setActing(false);
    }
  }

  const isReviewable = submission.status === 'GRADED';

  return (
    <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy/10 dark:bg-navy/30 flex items-center justify-center">
            <Student size={18} className="text-navy dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{submission.studentName}</p>
            <p className="text-xs text-text-muted">{submission.quizTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {submission.status === 'REVIEWED' && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Approved
            </span>
          )}
          {submission.status === 'OVERRIDDEN' && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Overridden
            </span>
          )}
          {submission.status === 'GRADED' && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal/10 text-teal">
              Needs Review
            </span>
          )}
          {submission.status === 'PENDING' && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Pending
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* AI Grade Summary */}
        {submission.aiScore !== null && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Robot size={18} className="text-teal" />
              <span className="text-sm text-text-muted">AI Score:</span>
              <span className={`text-lg font-bold ${scoreColor(submission.aiScore)}`}>
                {submission.aiScore}%
              </span>
            </div>
            {submission.autoScore !== null && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Auto Score:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {submission.autoScore}%
                </span>
              </div>
            )}
            {submission.finalScore !== null && submission.finalScore !== submission.aiScore && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Final:</span>
                <span className={`text-lg font-bold ${scoreColor(submission.finalScore)}`}>
                  {submission.finalScore}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Per-Criteria Scores */}
        {submission.aiCriteriaScores.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={16} className="text-teal" />
              <h4 className="text-sm font-semibold text-text-primary">Criteria Breakdown</h4>
            </div>
            <div className="space-y-2">
              {submission.aiCriteriaScores.map((cs, idx) => {
                const pct = cs.maxScore > 0 ? Math.round((cs.score / cs.maxScore) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-36 truncate">{cs.name}</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-16 text-right ${scoreColor(pct)}`}>
                      {cs.score}/{cs.maxScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Feedback */}
        {submission.aiFeedback && (
          <div className="bg-surface/50 border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-text-muted mb-1.5">AI Feedback</p>
            <p className="text-sm text-text-secondary leading-relaxed">{submission.aiFeedback}</p>
          </div>
        )}

        {/* Student Answers */}
        {submission.answers.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-muted mb-2">Student Answers</p>
            <div className="space-y-1.5">
              {submission.answers.map((a, idx) => (
                <div key={a.questionId} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-teal/10 text-teal text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-text-secondary">
                    {typeof a.answer === 'number' ? `Option ${a.answer + 1}` : `"${a.answer}"`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructor Notes (if overridden) */}
        {submission.instructorNotes && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
              Instructor Notes
            </p>
            <p className="text-sm text-text-secondary">{submission.instructorNotes}</p>
          </div>
        )}

        {/* Action Buttons (only for GRADED status) */}
        {isReviewable && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={acting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle size={16} weight="fill" />
                {acting ? 'Processing...' : 'Approve AI Grade'}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-muted">Or override:</p>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Override score"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  className="w-28 px-3 py-2 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
                <input
                  type="text"
                  placeholder="Instructor notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
                <button
                  onClick={handleOverride}
                  disabled={acting || !overrideScore}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  <PencilSimple size={16} weight="fill" />
                  Override
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
