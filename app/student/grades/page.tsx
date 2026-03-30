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
import { createClient } from '@/lib/supabase/client';

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

interface GradeItem {
  submissionId: string;
  assignmentTitle: string;
  className: string;
  classId: string;
  score: number;
  pointsPossible: number;
  percentage: number;
  feedback: string | null;
  gradedAt: string | null;
  submittedAt: string;
}

interface ClassGroup {
  classId: string;
  className: string;
  grades: GradeItem[];
  average: number;
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
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAI, setExpandedAI] = useState<string | null>(null);
  const [aiGrades, setAiGrades] = useState<Record<string, AIGradeData>>({});

  useEffect(() => {
    async function fetchGrades() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Get student's active enrollments
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('class_id')
          .eq('student_id', user.id)
          .eq('status', 'active');

        const enrollments = (enrollmentData ?? []) as { class_id: string }[];
        if (enrollments.length === 0) {
          setLoading(false);
          return;
        }

        const classIds = enrollments.map(e => e.class_id);

        // Fetch classes
        const { data: classData } = await supabase
          .from('classes')
          .select('id, name')
          .in('id', classIds);

        const classes = (classData ?? []) as { id: string; name: string }[];
        const classMap = new Map(classes.map(c => [c.id, c.name]));

        // Fetch assignments for these classes
        const { data: assignmentData } = await supabase
          .from('assignments')
          .select('id, title, class_id, points_possible')
          .in('class_id', classIds);

        const assignments = (assignmentData ?? []) as { id: string; title: string; class_id: string; points_possible: number }[];
        const assignmentMap = new Map(
          assignments.map(a => [a.id, { title: a.title, classId: a.class_id, pointsPossible: a.points_possible }])
        );
        const assignmentIds = assignments.map(a => a.id);

        if (assignmentIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch graded submissions for this student
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('id, assignment_id, grade, graded_at, submitted_at, feedback')
          .eq('student_id', user.id)
          .in('assignment_id', assignmentIds)
          .not('grade', 'is', null)
          .order('graded_at', { ascending: false, nullsFirst: false });

        const submissions = (submissionData ?? []) as { id: string; assignment_id: string; grade: number; graded_at: string; submitted_at: string; feedback: string | null }[];

        // Build grade items grouped by class
        const groupMap = new Map<string, GradeItem[]>();

        for (const sub of submissions) {
          const assignment = assignmentMap.get(sub.assignment_id);
          if (!assignment) continue;

          const className = classMap.get(assignment.classId) ?? 'Unknown Class';
          const pointsPossible = assignment.pointsPossible || 100;
          const percentage = pointsPossible > 0
            ? Math.round((sub.grade / pointsPossible) * 100)
            : 0;

          const item: GradeItem = {
            submissionId: sub.id,
            assignmentTitle: assignment.title,
            className,
            classId: assignment.classId,
            score: sub.grade,
            pointsPossible,
            percentage,
            feedback: sub.feedback,
            gradedAt: sub.graded_at,
            submittedAt: sub.submitted_at,
          };

          const existing = groupMap.get(assignment.classId) ?? [];
          existing.push(item);
          groupMap.set(assignment.classId, existing);
        }

        // Build class groups with averages
        const groups: ClassGroup[] = [];
        for (const [classId, grades] of groupMap) {
          const avg = grades.length > 0
            ? Math.round(grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length)
            : 0;
          groups.push({
            classId,
            className: classMap.get(classId) ?? 'Unknown Class',
            grades,
            average: avg,
          });
        }

        // Sort groups alphabetically by class name
        groups.sort((a, b) => a.className.localeCompare(b.className));

        setClassGroups(groups);
      } catch (err) {
        console.error('Error fetching grades:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
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

  // Flatten all grades for overall stats
  const allGrades = classGroups.flatMap(g => g.grades);
  const avgScore = allGrades.length > 0
    ? Math.round(allGrades.reduce((sum, g) => sum + g.percentage, 0) / allGrades.length)
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
      {allGrades.length > 0 && (
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
                {allGrades.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grades list */}
      {allGrades.length === 0 ? (
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center">
          <Exam size={48} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted font-medium mb-1">No grades yet</p>
          <p className="text-sm text-text-muted">
            Your graded quiz results will appear here once your instructor reviews them.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {classGroups.map((group) => (
            <div key={group.classId}>
              {/* Class header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  {group.className}
                </h2>
                <span className={`text-sm font-semibold ${scoreColor(group.average)}`}>
                  Avg: {group.average}%
                </span>
              </div>

              <div className="space-y-4">
                {group.grades.map((g) => (
                  <div
                    key={g.submissionId}
                    className="bg-card-bg border border-border rounded-xl p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-heading font-semibold text-text-primary">
                          {g.assignmentTitle}
                        </h3>
                        <p className="text-sm text-text-muted mt-0.5">
                          {g.score}/{g.pointsPossible} points
                        </p>
                      </div>

                      <div className={`shrink-0 px-3 py-1.5 rounded-lg border font-bold text-lg ${scoreBg(g.percentage)} ${scoreColor(g.percentage)}`}>
                        {g.percentage}%
                      </div>
                    </div>

                    {/* Score label */}
                    <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                      <span className={`font-semibold ${scoreColor(g.percentage)}`}>
                        {scoreLabel(g.percentage)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarBlank size={12} />
                        {g.gradedAt
                          ? new Date(g.gradedAt).toLocaleDateString()
                          : new Date(g.submittedAt).toLocaleDateString()}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
