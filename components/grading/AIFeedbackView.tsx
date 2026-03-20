'use client';

import {
  Trophy,
  ChartBar,
  Lightbulb,
  ChatText,
  Robot,
} from '@phosphor-icons/react';

interface CriteriaScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback: string;
}

interface AIFeedbackViewProps {
  score: number | null;
  criteriaScores: CriteriaScore[];
  feedback: string;
  improvementSuggestions: string[];
  status: string;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Review Required';
}

export default function AIFeedbackView({
  score,
  criteriaScores,
  feedback,
  improvementSuggestions,
  status,
}: AIFeedbackViewProps) {
  if (status === 'PENDING' || score === null) {
    return (
      <div className="bg-card-bg border border-border rounded-xl p-6 text-center">
        <Robot size={40} className="mx-auto text-text-muted mb-3" />
        <p className="text-text-muted font-medium">AI grading in progress...</p>
        <p className="text-sm text-text-muted mt-1">
          Your submission is being evaluated. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Score Card */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={24} weight="duotone" className="text-teal" />
          <h3 className="text-lg font-heading font-bold text-text-primary">
            AI Assessment
          </h3>
          {status === 'OVERRIDDEN' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Instructor Adjusted
            </span>
          )}
          {status === 'REVIEWED' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Instructor Approved
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={`text-4xl font-heading font-bold ${scoreColor(score)}`}>
              {score}%
            </p>
            <p className={`text-sm font-semibold mt-1 ${scoreColor(score)}`}>
              {scoreLabel(score)}
            </p>
          </div>

          {/* Score bar */}
          <div className="flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${scoreBg(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Per-Criteria Breakdown */}
      {criteriaScores.length > 0 && (
        <div className="bg-card-bg border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBar size={20} weight="duotone" className="text-teal" />
            <h4 className="text-sm font-heading font-bold text-text-primary">
              Score Breakdown
            </h4>
          </div>

          <div className="space-y-4">
            {criteriaScores.map((cs, idx) => {
              const pct = cs.maxScore > 0 ? Math.round((cs.score / cs.maxScore) * 100) : 0;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-text-primary">
                      {cs.name}
                    </span>
                    <span className={`text-sm font-bold ${scoreColor(pct)}`}>
                      {cs.score}/{cs.maxScore}
                      <span className="text-text-muted font-normal ml-1">
                        ({cs.weight}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${scoreBg(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {cs.feedback && (
                    <p className="text-xs text-text-muted leading-relaxed">
                      {cs.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {feedback && (
        <div className="bg-card-bg border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <ChatText size={20} weight="duotone" className="text-teal" />
            <h4 className="text-sm font-heading font-bold text-text-primary">
              Feedback
            </h4>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{feedback}</p>
        </div>
      )}

      {/* Improvement Suggestions */}
      {improvementSuggestions.length > 0 && (
        <div className="bg-card-bg border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={20} weight="duotone" className="text-gold" />
            <h4 className="text-sm font-heading font-bold text-text-primary">
              How to Improve
            </h4>
          </div>
          <ul className="space-y-2">
            {improvementSuggestions.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="w-5 h-5 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
