'use client';

import { useEffect, useState } from 'react';
import {
  ClipboardText,
  CheckCircle,
  Clock,
  PaperPlaneTilt,
  CaretDown,
  CaretUp,
  Student,
  Exam,
  Robot,
} from '@phosphor-icons/react';

interface Submission {
  submissionId: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  courseId: string;
  courseTitle: string;
  submittedAt: string;
  autoScore: number;
  answers: { questionId: string; answer: number | string }[];
  graded: boolean;
  grade?: {
    score: number;
    feedback: string;
    gradedAt: string;
  };
}

export default function InstructorGradesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<
    Record<string, { suggestedScore: number; feedback: string; rubricAnalysis: { criterionName: string; score: number; maxScore: number; weight: number; feedback: string }[]; isMock: boolean }>
  >({});

  useEffect(() => {
    fetch('/api/instructor/submissions')
      .then((res) => res.json())
      .then((data) => setSubmissions(data.submissions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter((s) => {
    if (filter === 'pending') return !s.graded;
    if (filter === 'graded') return s.graded;
    return true;
  });

  const pendingCount = submissions.filter((s) => !s.graded).length;
  const gradedCount = submissions.filter((s) => s.graded).length;

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  async function handleGrade(submissionId: string) {
    const score = Number(scoreInputs[submissionId]);
    if (isNaN(score) || score < 0 || score > 100) return;

    setSubmitting(submissionId);
    try {
      const res = await fetch(`/api/instructor/grade/${submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          feedback: feedbackInputs[submissionId] || '',
        }),
      });

      if (res.ok) {
        // Refresh submissions
        const refreshRes = await fetch('/api/instructor/submissions');
        const data = await refreshRes.json();
        setSubmissions(data.submissions || []);
        setExpandedId(null);
      }
    } catch (err) {
      console.error('Grading failed:', err);
    } finally {
      setSubmitting(null);
    }
  }

  async function handleAiSuggest(submissionId: string, quizId: string) {
    setAiLoading(submissionId);
    try {
      const res = await fetch(`/api/assignments/${quizId}/ai-grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions((prev) => ({ ...prev, [submissionId]: data }));
        // Pre-fill score and feedback inputs
        setScoreInputs((prev) => ({ ...prev, [submissionId]: String(data.suggestedScore) }));
        setFeedbackInputs((prev) => ({ ...prev, [submissionId]: data.feedback }));
      }
    } catch (err) {
      console.error('AI suggestion failed:', err);
    } finally {
      setAiLoading(null);
    }
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
          <ClipboardText size={28} weight="duotone" className="text-teal" />
          Grading Dashboard
        </h1>
        <p className="text-text-secondary mt-1">
          Review and grade student quiz submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-teal/30 bg-teal/5 p-5">
          <p className="text-sm text-text-muted font-medium">Total Submissions</p>
          <p className="text-3xl font-heading font-bold mt-1 text-teal">
            {submissions.length}
          </p>
        </div>
        <div className="rounded-xl border border-coral/30 bg-coral/5 p-5">
          <p className="text-sm text-text-muted font-medium">Pending Review</p>
          <p className="text-3xl font-heading font-bold mt-1 text-coral">
            {pendingCount}
          </p>
        </div>
        <div className="rounded-xl border border-navy/30 bg-navy/5 p-5">
          <p className="text-sm text-text-muted font-medium">Graded</p>
          <p className="text-3xl font-heading font-bold mt-1 text-navy dark:text-blue-300">
            {gradedCount}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'graded'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-teal text-white'
                : 'bg-card-bg border border-border text-text-secondary hover:border-teal/40'
            }`}
          >
            {f === 'all' ? 'All' : f === 'pending' ? `Pending (${pendingCount})` : `Graded (${gradedCount})`}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      {filtered.length === 0 ? (
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center">
          <Exam size={48} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">
            {filter === 'pending'
              ? 'No pending submissions to review.'
              : filter === 'graded'
                ? 'No graded submissions yet.'
                : 'No submissions yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const isExpanded = expandedId === s.submissionId;
            return (
              <div
                key={s.submissionId}
                className="bg-card-bg border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
              >
                {/* Row header */}
                <button
                  onClick={() => toggleExpand(s.submissionId)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-navy/10 dark:bg-navy/30 flex items-center justify-center shrink-0">
                      <Student size={18} className="text-navy dark:text-blue-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {s.studentName}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {s.quizTitle} &middot; {s.courseTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-text-muted hidden sm:block">
                      {new Date(s.submittedAt).toLocaleDateString()}
                    </span>

                    {s.graded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle size={14} weight="fill" />
                        {s.grade?.score}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock size={14} weight="fill" />
                        Pending
                      </span>
                    )}

                    {isExpanded ? (
                      <CaretUp size={18} className="text-text-muted" />
                    ) : (
                      <CaretDown size={18} className="text-text-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded grading panel */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-5 bg-surface/50">
                    {/* Student answers */}
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-text-primary mb-3">
                        Student Answers
                      </h4>
                      <div className="space-y-2">
                        {s.answers.map((a, idx) => (
                          <div
                            key={a.questionId}
                            className="flex items-start gap-3 text-sm"
                          >
                            <span className="w-6 h-6 rounded-full bg-teal/10 text-teal text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="text-text-muted">Q: {a.questionId}</span>
                              <span className="mx-2 text-text-muted">&rarr;</span>
                              <span className="font-medium text-text-primary">
                                {typeof a.answer === 'number'
                                  ? `Option ${a.answer + 1}`
                                  : `"${a.answer}"`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-text-muted">
                        Auto-scored: <span className="font-semibold text-text-primary">{s.autoScore}%</span>
                      </p>
                    </div>

                    {/* Grading form or existing grade */}
                    {s.graded && s.grade ? (
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            Graded: {s.grade.score}%
                          </span>
                        </div>
                        {s.grade.feedback && (
                          <p className="text-sm text-text-secondary">
                            {s.grade.feedback}
                          </p>
                        )}
                        <p className="text-xs text-text-muted mt-2">
                          Graded on {new Date(s.grade.gradedAt).toLocaleDateString()}
                        </p>

                        {/* Allow re-grading */}
                        <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800/30">
                          <p className="text-xs text-text-muted mb-3">Update grade:</p>
                          <div className="flex gap-3">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              placeholder="Score"
                              value={scoreInputs[s.submissionId] ?? s.grade.score}
                              onChange={(e) =>
                                setScoreInputs((prev) => ({ ...prev, [s.submissionId]: e.target.value }))
                              }
                              className="w-24 px-3 py-2 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40"
                            />
                            <input
                              type="text"
                              placeholder="Updated feedback..."
                              value={feedbackInputs[s.submissionId] ?? s.grade.feedback}
                              onChange={(e) =>
                                setFeedbackInputs((prev) => ({ ...prev, [s.submissionId]: e.target.value }))
                              }
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40"
                            />
                            <button
                              onClick={() => handleGrade(s.submissionId)}
                              disabled={submitting === s.submissionId}
                              className="px-4 py-2 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50"
                            >
                              {submitting === s.submissionId ? 'Saving...' : 'Update'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* AI Suggestion button + results */}
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            onClick={() => handleAiSuggest(s.submissionId, s.quizId)}
                            disabled={aiLoading === s.submissionId || !!aiSuggestions[s.submissionId]}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            <Robot size={16} weight="fill" />
                            {aiLoading === s.submissionId
                              ? 'Analyzing...'
                              : aiSuggestions[s.submissionId]
                                ? 'AI Suggestion Applied'
                                : 'Get AI Suggestion'}
                          </button>
                          {aiSuggestions[s.submissionId]?.isMock && (
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              Mock grade (AI not configured)
                            </span>
                          )}
                        </div>

                        {/* Show rubric analysis if AI suggestion exists */}
                        {aiSuggestions[s.submissionId] && (
                          <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-lg p-4 mb-3">
                            <h5 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                              <Robot size={16} weight="duotone" />
                              AI Analysis — Suggested Score: {aiSuggestions[s.submissionId].suggestedScore}%
                            </h5>
                            {aiSuggestions[s.submissionId].rubricAnalysis.length > 0 && (
                              <div className="space-y-1.5 mb-3">
                                {aiSuggestions[s.submissionId].rubricAnalysis.map((ra, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="text-text-secondary">{ra.criterionName}</span>
                                    <span className="font-medium text-text-primary">
                                      {ra.score}/{ra.maxScore} ({ra.weight}%)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-text-secondary">
                              {aiSuggestions[s.submissionId].feedback}
                            </p>
                            <p className="text-xs text-text-muted mt-2 italic">
                              Review and adjust the score/feedback below before submitting.
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Score (0-100)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder={String(s.autoScore)}
                            value={scoreInputs[s.submissionId] || ''}
                            onChange={(e) =>
                              setScoreInputs((prev) => ({ ...prev, [s.submissionId]: e.target.value }))
                            }
                            className="w-32 px-3 py-2.5 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Feedback
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Provide feedback for the student..."
                            value={feedbackInputs[s.submissionId] || ''}
                            onChange={(e) =>
                              setFeedbackInputs((prev) => ({ ...prev, [s.submissionId]: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40 resize-none"
                          />
                        </div>
                        <button
                          onClick={() => handleGrade(s.submissionId)}
                          disabled={submitting === s.submissionId || !scoreInputs[s.submissionId]}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50"
                        >
                          <PaperPlaneTilt size={16} weight="fill" />
                          {submitting === s.submissionId ? 'Submitting...' : 'Submit Grade'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
