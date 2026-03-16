'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash,
  CheckCircle,
  ArrowLeft,
  Exam,
} from '@phosphor-icons/react';

interface LessonOption {
  id: string;
  title: string;
  moduleTitle: string;
}

interface QuestionInput {
  key: string; // client-side key for React
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options: string[];
  correctIndex: number;
  correctAnswer: string;
}

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyQuestion(): QuestionInput {
  return {
    key: generateKey(),
    text: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctIndex: 0,
    correctAnswer: '',
  };
}

export default function InstructorQuizCreatePage() {
  const params = useParams();
  const courseId = params.id as string;

  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState('');

  // Form state
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionInput[]>([createEmptyQuestion()]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch lessons for the course
  useEffect(() => {
    if (!courseId) return;

    Promise.all([
      fetch('/api/instructor/courses').then((r) => r.json()),
      fetch(`/api/courses/${courseId}/lessons`).then((r) => {
        if (!r.ok) throw new Error('Failed to load lessons');
        return r.json();
      }),
    ])
      .then(([coursesData, lessonsData]) => {
        const course = (coursesData.courses || []).find(
          (c: { id: string; title: string }) => c.id === courseId,
        );
        setCourseName(course?.title || courseId);

        // lessonsData could be { lessons: [...] } or an array
        const lessonList = Array.isArray(lessonsData) ? lessonsData : lessonsData.lessons || [];
        setLessons(
          lessonList.map((l: { id: string; title: string; moduleTitle: string }) => ({
            id: l.id,
            title: l.title,
            moduleTitle: l.moduleTitle,
          })),
        );
      })
      .catch(() => setErrorMsg('Failed to load course data'))
      .finally(() => setLoading(false));
  }, [courseId]);

  function handleQuestionTypeChange(index: number, type: QuestionInput['type']) {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        type,
        options:
          type === 'true-false'
            ? ['True', 'False']
            : type === 'multiple-choice'
            ? ['', '', '', '']
            : [],
        correctIndex: 0,
        correctAnswer: '',
      };
      return updated;
    });
  }

  function handleOptionChange(qIdx: number, optIdx: number, value: string) {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIdx].options];
      opts[optIdx] = value;
      updated[qIdx] = { ...updated[qIdx], options: opts };
      return updated;
    });
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg(null);
    setSubmitting(true);

    const payload = {
      lessonId: selectedLessonId,
      title,
      passingScore,
      questions: questions.map((q) => ({
        text: q.text,
        type: q.type,
        options: q.options,
        correctIndex: q.correctIndex,
        correctAnswer: q.type === 'short-answer' ? q.correctAnswer : undefined,
      })),
    };

    try {
      const res = await fetch('/api/instructor/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to create quiz');
        return;
      }

      setSuccess(true);
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={36} weight="fill" className="text-teal" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">
          Quiz Created!
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Your quiz &ldquo;{title}&rdquo; has been attached to the lesson.
        </p>
        <Link
          href={`/instructor/courses/${courseId}`}
          className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        >
          <ArrowLeft size={16} weight="bold" />
          Back to Course
        </Link>
      </div>
    );
  }

  // Group lessons by module
  const moduleGroups: { moduleTitle: string; lessons: LessonOption[] }[] = [];
  for (const lesson of lessons) {
    const group = moduleGroups.find((g) => g.moduleTitle === lesson.moduleTitle);
    if (group) {
      group.lessons.push(lesson);
    } else {
      moduleGroups.push({ moduleTitle: lesson.moduleTitle, lessons: [lesson] });
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/instructor/courses/${courseId}`}
          className="text-sm text-text-muted hover:text-teal transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Back to {courseName}
        </Link>
      </div>

      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
            <Exam size={22} weight="fill" className="text-teal" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-text-primary">
              Create Quiz
            </h1>
            <p className="text-xs text-text-muted">{courseName}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-sm text-coral">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lesson selector */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Attach to Lesson
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            >
              <option value="">Select a lesson...</option>
              {moduleGroups.map((group) => (
                <optgroup key={group.moduleTitle} label={group.moduleTitle}>
                  {group.lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Quiz title */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Quiz Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Chapter 1 Review"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
          </div>

          {/* Passing score */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Passing Score (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-32 px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
          </div>

          {/* Questions */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              Questions ({questions.length})
            </h3>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div
                  key={q.key}
                  className="bg-card-bg border border-border rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-teal">
                      Question {qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        className="text-coral/60 hover:text-coral transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>

                  {/* Question type */}
                  <div className="mb-3">
                    <select
                      value={q.type}
                      onChange={(e) =>
                        handleQuestionTypeChange(qIdx, e.target.value as QuestionInput['type'])
                      }
                      className="px-3 py-1.5 text-xs border border-border rounded-lg bg-warm-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True / False</option>
                      <option value="short-answer">Short Answer</option>
                    </select>
                  </div>

                  {/* Question text */}
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) =>
                      setQuestions((prev) => {
                        const updated = [...prev];
                        updated[qIdx] = { ...updated[qIdx], text: e.target.value };
                        return updated;
                      })
                    }
                    required
                    placeholder="Enter your question..."
                    className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors mb-3"
                  />

                  {/* Options (MC) */}
                  {q.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.key}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() =>
                              setQuestions((prev) => {
                                const updated = [...prev];
                                updated[qIdx] = { ...updated[qIdx], correctIndex: optIdx };
                                return updated;
                              })
                            }
                            className="w-4 h-4 accent-teal"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            required
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                          />
                        </div>
                      ))}
                      <p className="text-[10px] text-text-muted">
                        Select the radio button next to the correct answer
                      </p>
                    </div>
                  )}

                  {/* Options (TF) */}
                  {q.type === 'true-false' && (
                    <div className="space-y-2">
                      {['True', 'False'].map((opt, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.key}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() =>
                              setQuestions((prev) => {
                                const updated = [...prev];
                                updated[qIdx] = { ...updated[qIdx], correctIndex: optIdx };
                                return updated;
                              })
                            }
                            className="w-4 h-4 accent-teal"
                          />
                          <span className="text-sm text-text-secondary">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Short answer */}
                  {q.type === 'short-answer' && (
                    <div>
                      <label className="block text-xs text-text-muted mb-1">
                        Expected answer (keyword match)
                      </label>
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={(e) =>
                          setQuestions((prev) => {
                            const updated = [...prev];
                            updated[qIdx] = { ...updated[qIdx], correctAnswer: e.target.value };
                            return updated;
                          })
                        }
                        required
                        placeholder="e.g., photosynthesis"
                        className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-teal hover:text-navy font-medium transition-colors"
            >
              <Plus size={16} weight="bold" />
              Add Question
            </button>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border">
            <button
              type="submit"
              disabled={submitting || !selectedLessonId || !title || questions.length === 0}
              className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
