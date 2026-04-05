/**
 * Backfill all activities with AI-generated lesson details.
 * Skips activities that already have an objective (already enriched).
 *
 * Usage: npx tsx scripts/backfill-activities.ts
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local too
const envLocal = resolve(__dirname, '..', '.env.local');
try {
  const lines = readFileSync(envLocal, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY || !ANTHROPIC_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  objective?: string;
}

async function fetchActivities(): Promise<Activity[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/assignments?select=id,title,description,subject,objective&order=created_at.asc`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  return res.json();
}

async function generateLesson(title: string, description: string, subject: string): Promise<Record<string, string>> {
  const idea = description || title;
  const prompt = `You are an expert K-12 lesson planner. Generate a complete lesson plan for this activity:

**Title:** ${title}
**Description:** ${idea}
**Subject:** ${subject || 'Math'}

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "title": "A short, catchy activity title (3-7 words, teacher-friendly)",
  "description": "A 1-2 sentence summary of the activity for the library card view",
  "objective": "What students will accomplish (measurable, specific, 1-2 sentences)",
  "learning_goal": "The big idea students will understand (1-2 sentences)",
  "essential_question": "A driving question that frames the lesson (1 question)",
  "materials": "List of materials and resources needed (bullet points or comma-separated)",
  "vocabulary": "3-7 key terms separated by commas",
  "hook": "An engaging introduction to grab attention and set up the lesson (2-3 sentences)",
  "directions": "Step-by-step instructions for the activity (3-5 numbered steps)",
  "assessment": "How student understanding will be measured (formative and/or summative)",
  "differentiation": "Support strategies for struggling learners AND extension strategies for advanced learners"
}

Make the lesson engaging, practical, and grade-appropriate. All fields should be thorough but concise.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content[0].text.trim();
  const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(jsonStr);
}

async function updateActivity(id: string, fields: Record<string, string>) {
  const payload: Record<string, string> = {
    title: fields.title,
    description: fields.description,
    objective: fields.objective,
    learning_goal: fields.learning_goal,
    essential_question: fields.essential_question,
    materials: fields.materials,
    vocabulary: fields.vocabulary,
    hook: fields.hook,
    directions: fields.directions,
    assessment: fields.assessment,
    differentiation: fields.differentiation,
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/assignments?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase PATCH ${res.status}: ${err}`);
  }
}

async function main() {
  const activities = await fetchActivities();
  const toEnrich = activities.filter(a => !a.objective);
  console.log(`Total activities: ${activities.length}`);
  console.log(`Already enriched: ${activities.length - toEnrich.length}`);
  console.log(`To enrich: ${toEnrich.length}`);
  console.log('');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toEnrich.length; i++) {
    const a = toEnrich[i];
    const progress = `[${i + 1}/${toEnrich.length}]`;
    try {
      process.stdout.write(`${progress} ${a.title.substring(0, 50)}...`);
      const lesson = await generateLesson(a.title, a.description || '', a.subject || 'Math');
      await updateActivity(a.id, lesson);
      console.log(' ✓');
      success++;
      // Small delay to avoid rate limits
      if (i < toEnrich.length - 1) await new Promise(r => setTimeout(r, 500));
    } catch (err: any) {
      console.log(` ✗ ${err.message?.substring(0, 60)}`);
      failed++;
      // Longer delay on error (rate limit)
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\nDone! ✓ ${success} enriched, ✗ ${failed} failed`);
}

main();
