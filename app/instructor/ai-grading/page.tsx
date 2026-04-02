'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Robot,
  ArrowLeft,
} from '@phosphor-icons/react';
import Link from 'next/link';
import InstructorGradeReview from '@/components/grading/InstructorGradeReview';
import GradeDistribution from '@/components/grading/GradeDistribution';

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

interface GradeQueueItem {
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

export default function AIGradingPage() {
  const [pendingReview, setPendingReview] = useState<GradeQueueItem[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<GradeQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/instructor/grading-queue');
      const data = await res.json();
      setPendingReview(data.pendingReview || []);
      setAllSubmissions(data.all || []);
    } catch (err) {
      console.error('Failed to fetch grading queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Compute distribution from all submissions
  const distribution: Record<string, number> = {
    '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0,
    '51-60': 0, '61-70': 0, '71-80': 0, '81-90': 0, '91-100': 0,
  };
  let totalScore = 0;
  let gradedCount = 0;

  for (const sub of allSubmissions) {
    const score = sub.finalScore;
    if (score === null) continue;
    gradedCount++;
    totalScore += score;
    if (score <= 10) distribution['0-10']++;
    else if (score <= 20) distribution['11-20']++;
    else if (score <= 30) distribution['21-30']++;
    else if (score <= 40) distribution['31-40']++;
    else if (score <= 50) distribution['41-50']++;
    else if (score <= 60) distribution['51-60']++;
    else if (score <= 70) distribution['61-70']++;
    else if (score <= 80) distribution['71-80']++;
    else if (score <= 90) distribution['81-90']++;
    else distribution['91-100']++;
  }

  const avgScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/instructor/grades"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-teal transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Grading Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
          <Robot size={28} weight="duotone" className="text-teal" />
          AI Grading Review
        </h1>
        <p className="text-text-secondary mt-1">
          Review AI-generated grades and approve or override them
        </p>
      </div>

      {/* Grade Distribution */}
      <div className="mb-8">
        <GradeDistribution
          distribution={distribution}
          avgScore={avgScore}
          totalSubmissions={allSubmissions.length}
          gradedCount={gradedCount}
        />
      </div>

      {/* Pending Review */}
      {pendingReview.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-heading font-bold text-text-primary mb-4">
            Pending Review ({pendingReview.length})
          </h2>
          <div className="space-y-4">
            {pendingReview.map((sub) => (
              <InstructorGradeReview
                key={sub.id}
                submission={sub}
                onUpdated={fetchQueue}
              />
            ))}
          </div>
        </div>
      )}

      {/* All AI Graded Submissions */}
      <div>
        <h2 className="text-lg font-heading font-bold text-text-primary mb-4">
          All AI Graded ({allSubmissions.length})
        </h2>
        {allSubmissions.length === 0 ? (
          <div className="bg-card-bg border border-border rounded-xl p-8 text-center">
            <Robot size={48} className="mx-auto text-text-muted mb-3" />
            <p className="text-text-muted">
              No AI-graded submissions yet. Submissions with rubrics will be automatically graded.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {allSubmissions.map((sub) => (
              <InstructorGradeReview
                key={sub.id}
                submission={sub}
                onUpdated={fetchQueue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
