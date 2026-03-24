"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const MOCK_QUIZ = {
  id: "quiz-intro-web-dev",
  title: "Introduction to Web Development — Module 1 Check",
  courseTitle: "Introduction to Web Development",
  timeLimit: "10 minutes",
  questions: [
    {
      id: "q1",
      text: "What does HTML stand for?",
      options: [
        { id: "a", text: "HyperText Markup Language" },
        { id: "b", text: "HighText Machine Language" },
        { id: "c", text: "HyperText and links Markup Language" },
        { id: "d", text: "HyperTransfer Markup Language" },
      ],
      correct: "a",
    },
    {
      id: "q2",
      text: "Which CSS property controls the text size?",
      options: [
        { id: "a", text: "font-style" },
        { id: "b", text: "text-size" },
        { id: "c", text: "font-size" },
        { id: "d", text: "text-weight" },
      ],
      correct: "c",
    },
    {
      id: "q3",
      text: "Which JavaScript method selects an element by its ID?",
      options: [
        { id: "a", text: "querySelector()" },
        { id: "b", text: "getElementById()" },
        { id: "c", text: "getElementByClass()" },
        { id: "d", text: "findById()" },
      ],
      correct: "b",
    },
    {
      id: "q4",
      text: "What is the correct way to create a function in JavaScript?",
      options: [
        { id: "a", text: "function:myFunc()" },
        { id: "b", text: "def myFunc():" },
        { id: "c", text: "create myFunc()" },
        { id: "d", text: "function myFunc() {}" },
      ],
      correct: "d",
    },
    {
      id: "q5",
      text: "Which tag is used for a hyperlink in HTML?",
      options: [
        { id: "a", text: "<link>" },
        { id: "b", text: "<href>" },
        { id: "c", text: "<a>" },
        { id: "d", text: "<navigate>" },
      ],
      correct: "c",
    },
  ],
  passingScore: 60,
};

type Answers = Record<string, string>;

export default function QuizPage() {
  const params = useParams();
  const quizId = params?.quizId as string;
  const quiz = { ...MOCK_QUIZ, id: quizId };

  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    const total = quiz.questions.length;
    const correct = quiz.questions.filter((q) => answers[q.id] === q.correct).length;
    const pct = Math.round((correct / total) * 100);
    setScore(pct);
    setSubmitted(true);
  };

  const allAnswered = quiz.questions.every((q) => answers[q.id]);
  const passed = score !== null && score >= quiz.passingScore;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500 mb-1">{quiz.courseTitle}</p>
        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{quiz.questions.length} questions · {quiz.timeLimit}</p>
      </div>

      {/* Result Banner */}
      {submitted && score !== null && (
        <div
          className={`p-4 rounded-lg text-center font-semibold text-lg ${
            passed
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {passed ? "🎉 You Passed!" : "❌ Try Again"} — Score: {score}%
          {passed && (
            <p className="text-sm font-normal mt-1">
              You&apos;re ready to continue to the next module.
            </p>
          )}
          {!passed && (
            <p className="text-sm font-normal mt-1">
              You need {quiz.passingScore}% to pass. Review the material and retake.
            </p>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="font-medium text-gray-900 mb-3">
              {idx + 1}. {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.id;
                const isCorrect = submitted && opt.id === q.correct;
                const isWrong = submitted && isSelected && opt.id !== q.correct;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(q.id, opt.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg border text-sm transition-colors ${
                      isCorrect
                        ? "bg-green-100 border-green-400 text-green-800"
                        : isWrong
                        ? "bg-red-100 border-red-400 text-red-700"
                        : isSelected
                        ? "bg-blue-100 border-blue-400 text-blue-800"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-semibold mr-2">{opt.id.toUpperCase()}.</span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`w-full py-3 rounded-xl font-semibold text-white transition ${
            allAnswered
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <button
          onClick={() => { setAnswers({}); setSubmitted(false); setScore(null); }}
          className="w-full py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Retake Quiz
        </button>
      )}
    </div>
  );
}
