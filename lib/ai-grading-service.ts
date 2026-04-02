import type { RubricCriterion } from './rubric-store';
import type { CriteriaScore } from './grade-submission-store';

// ── Types ──────────────────────────────────────────────

export interface AIGradeResult {
  score: number; // 0-100
  criteriaScores: CriteriaScore[];
  feedback: string;
  improvementSuggestions: string[];
  isMock: boolean; // true if AI was not configured
}

interface AICompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AICompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// ── Configuration ──────────────────────────────────────

const AI_API_URL = process.env.AI_GRADING_API_URL || 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.AI_GRADING_API_KEY || '';
const AI_MODEL = process.env.AI_GRADING_MODEL || 'gpt-4o-mini';

// ── Mock grading (when AI not configured) ──────────────

function generateMockGrade(
  criteria: RubricCriterion[],
  studentAnswer: string,
  questionText: string,
): AIGradeResult {
  // Generate deterministic-ish scores based on answer length and content
  const answerLength = studentAnswer.length;
  const baseScore = Math.min(85, 40 + Math.floor(answerLength / 5));

  const criteriaScores: CriteriaScore[] = criteria.map((c, idx) => {
    const variance = ((idx * 7 + answerLength) % 20) - 10;
    const score = Math.max(0, Math.min(c.maxScore, baseScore + variance));
    return {
      name: c.name,
      score,
      maxScore: c.maxScore,
      weight: c.weight,
      feedback: `[Mock] Score assigned based on response completeness for "${c.name}".`,
    };
  });

  const weightedScore = criteriaScores.reduce(
    (sum, cs) => sum + (cs.score / cs.maxScore) * cs.weight,
    0,
  );
  const overallScore = Math.round(weightedScore);

  return {
    score: overallScore,
    criteriaScores,
    feedback: `[AI grading not configured] Mock grade generated for question: "${questionText.slice(0, 80)}...". Configure AI_GRADING_API_KEY to enable real AI grading.`,
    improvementSuggestions: [
      'Configure AI_GRADING_API_KEY and AI_GRADING_API_URL to enable AI-powered grading.',
      'Once configured, students will receive detailed, criterion-specific feedback.',
    ],
    isMock: true,
  };
}

// ── AI grading ─────────────────────────────────────────

function buildGradingPrompt(
  criteria: RubricCriterion[],
  studentAnswer: string,
  questionText: string,
): AICompletionMessage[] {
  const criteriaDescription = criteria
    .map(
      (c, i) =>
        `${i + 1}. ${c.name} (weight: ${c.weight}%, max: ${c.maxScore}): ${c.description}`,
    )
    .join('\n');

  return [
    {
      role: 'system',
      content: `You are an expert K-12 educational assessor. Grade student submissions against a rubric with specific criteria. Be encouraging but honest. Provide actionable feedback.

Return your response as valid JSON with this exact structure:
{
  "score": <number 0-100>,
  "criteriaScores": [
    {
      "name": "<criterion name>",
      "score": <number 0 to maxScore>,
      "maxScore": <number>,
      "weight": <number>,
      "feedback": "<specific feedback for this criterion>"
    }
  ],
  "feedback": "<overall assessment paragraph>",
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}

Only return valid JSON. No markdown, no explanation outside the JSON.`,
    },
    {
      role: 'user',
      content: `Grade the following student submission.

Question/Assignment:
${questionText}

Rubric Criteria:
${criteriaDescription}

Student Answer:
${studentAnswer}

Grade this submission against each criterion. The overall score should be the weighted average of criteria scores.`,
    },
  ];
}

function parseAIResponse(
  responseText: string,
  criteria: RubricCriterion[],
): AIGradeResult {
  // Try to extract JSON from the response
  let parsed: {
    score: number;
    criteriaScores: CriteriaScore[];
    feedback: string;
    improvementSuggestions: string[];
  };

  try {
    // Handle potential markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    // If parsing fails, create a basic result
    return {
      score: 0,
      criteriaScores: criteria.map((c) => ({
        name: c.name,
        score: 0,
        maxScore: c.maxScore,
        weight: c.weight,
        feedback: 'AI response could not be parsed for this criterion.',
      })),
      feedback: 'AI grading response could not be parsed. Please review manually.',
      improvementSuggestions: ['Request manual review from your instructor.'],
      isMock: false,
    };
  }

  // Validate and clamp score
  const score = Math.max(0, Math.min(100, Math.round(parsed.score || 0)));

  const criteriaScores: CriteriaScore[] = (parsed.criteriaScores || []).map((cs) => ({
    name: String(cs.name || ''),
    score: Math.max(0, Math.min(cs.maxScore || 100, Math.round(cs.score || 0))),
    maxScore: cs.maxScore || 100,
    weight: cs.weight || 0,
    feedback: String(cs.feedback || ''),
  }));

  return {
    score,
    criteriaScores,
    feedback: String(parsed.feedback || ''),
    improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
      ? parsed.improvementSuggestions.map(String)
      : [],
    isMock: false,
  };
}

export async function gradeWithAI(
  criteria: RubricCriterion[],
  studentAnswer: string,
  questionText: string,
): Promise<AIGradeResult> {
  // If no API key, return mock grade
  if (!AI_API_KEY) {
    return generateMockGrade(criteria, studentAnswer, questionText);
  }

  const messages = buildGradingPrompt(criteria, studentAnswer, questionText);

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI grading API error (${response.status}):`, errorText);
      return generateMockGrade(criteria, studentAnswer, questionText);
    }

    const data = (await response.json()) as AICompletionResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('AI grading returned empty content');
      return generateMockGrade(criteria, studentAnswer, questionText);
    }

    return parseAIResponse(content, criteria);
  } catch (err) {
    console.error('AI grading failed:', err);
    return generateMockGrade(criteria, studentAnswer, questionText);
  }
}
