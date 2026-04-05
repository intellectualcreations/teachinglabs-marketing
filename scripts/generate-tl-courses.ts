#!/usr/bin/env npx tsx
/**
 * generate-tl-courses.ts
 * Generate Teaching Labs template courses using Claude Haiku.
 * Creates courses with modules and activities for the Core 4 subjects K-12.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-tl-courses.ts
 *   # or with env file:
 *   source ~/.openclaw/workspace/.env && npx tsx scripts/generate-tl-courses.ts
 *
 * Options:
 *   --dry-run     Print JSON without writing to DB
 *   --subject=X   Only generate for one subject (math, ela, science, social_studies)
 *   --grade=X     Only generate for one grade (K, 1-12)
 */

const API_BASE = process.env.TL_API_BASE || 'http://localhost:3101';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const TEACHER_ID = process.env.TL_TEMPLATE_TEACHER_ID || 'system'; // placeholder for template owner

if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY is required');
  process.exit(1);
}

const CORE_SUBJECTS = [
  { key: 'math', label: 'Math', standards: 'Common Core State Standards for Mathematics' },
  { key: 'english_language_arts', label: 'English Language Arts', standards: 'Common Core State Standards for ELA' },
  { key: 'science', label: 'Science', standards: 'Next Generation Science Standards (NGSS)' },
  { key: 'social_studies', label: 'Social Studies', standards: 'C3 Framework for Social Studies' },
];

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const subjectArg = args.find(a => a.startsWith('--subject='))?.split('=')[1];
const gradeArg = args.find(a => a.startsWith('--grade='))?.split('=')[1];

interface Activity {
  title: string;
  description: string;
  objective: string;
  materials: string;
  directions: string;
  assessment: string;
}

interface Module {
  title: string;
  description: string;
  activities: Activity[];
}

interface Course {
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  modules: Module[];
}

async function generateCourse(subject: typeof CORE_SUBJECTS[0], grade: string): Promise<Course> {
  const gradeLabel = grade === 'K' ? 'Kindergarten' : `Grade ${grade}`;

  const prompt = `Generate a complete K-12 course curriculum for ${gradeLabel} ${subject.label}.

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "title": "${gradeLabel} ${subject.label}",
  "description": "A comprehensive ${gradeLabel.toLowerCase()} ${subject.label.toLowerCase()} course covering key concepts and skills.",
  "modules": [
    {
      "title": "Module Title",
      "description": "What students learn in this module.",
      "activities": [
        {
          "title": "Activity Title",
          "description": "Brief description of what students do.",
          "objective": "What students will learn or accomplish by completing this activity.",
          "materials": "List of materials, resources, or tools needed.",
          "directions": "Step-by-step instructions for completing the activity.",
          "assessment": "How student understanding will be measured or evaluated."
        }
      ]
    }
  ]
}

Requirements:
- 8-10 modules covering a full school year
- 3-5 activities per module
- Age-appropriate for ${gradeLabel}
- Aligned with ${subject.standards}
- Activities should be interactive and engaging (not just worksheets)
- Activity types: hands-on exploration, discussion, practice, creative project, assessment
- Module titles should be clear and descriptive
- Descriptions should be 1-2 sentences max
- Each activity MUST include objective, materials, directions, and assessment
- Objectives: clear, measurable learning goals (1-2 sentences)
- Materials: specific items needed (textbook pages, manipulatives, worksheets, technology)
- Directions: 3-5 clear steps students follow
- Assessment: how to check understanding (exit ticket, discussion, rubric, quiz, observation)`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20250414',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.content[0].text.trim();

  // Parse JSON (handle potential markdown fences)
  const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
  const course = JSON.parse(jsonStr) as Course;
  course.subject = subject.key;
  course.grade_level = grade;

  return course;
}

async function writeToDB(course: Course): Promise<void> {
  // Create course
  const courseRes = await fetch(`${API_BASE}/api/teacher/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: course.title,
      description: course.description,
      subject: course.subject,
      grade_level: course.grade_level,
      teacher_id: TEACHER_ID,
    }),
  });

  if (!courseRes.ok) {
    const err = await courseRes.json();
    throw new Error(`Failed to create course: ${JSON.stringify(err)}`);
  }

  const { course: created } = await courseRes.json();
  console.log(`  Created course: ${created.id}`);

  // Publish it + mark as template
  await fetch(`${API_BASE}/api/teacher/courses/${created.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_published: true }),
  });

  // Create modules and activities
  for (const mod of course.modules) {
    const modRes = await fetch(`${API_BASE}/api/teacher/courses/${created.id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: mod.title,
        description: mod.description,
      }),
    });

    if (!modRes.ok) {
      console.error(`  Failed to create module: ${mod.title}`);
      continue;
    }

    const { module: createdMod } = await modRes.json();

    // Create activities for this module
    for (const act of mod.activities) {
      await fetch(`${API_BASE}/api/teacher/courses/${created.id}/modules/${createdMod.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: act.title,
          description: act.description,
          objective: act.objective || null,
          materials: act.materials || null,
          directions: act.directions || null,
          assessment: act.assessment || null,
          teacher_id: TEACHER_ID,
        }),
      });
    }

    console.log(`    Module: ${mod.title} (${mod.activities.length} activities)`);
  }
}

async function main() {
  const subjects = subjectArg
    ? CORE_SUBJECTS.filter(s => s.key === subjectArg || s.label.toLowerCase() === subjectArg.toLowerCase())
    : CORE_SUBJECTS;

  const grades = gradeArg ? [gradeArg] : GRADES;

  const total = subjects.length * grades.length;
  console.log(`\nGenerating ${total} courses (${subjects.map(s => s.label).join(', ')} × ${grades.length} grades)`);
  console.log(dryRun ? '*** DRY RUN — not writing to database ***\n' : '\n');

  let completed = 0;
  let errors = 0;

  for (const subject of subjects) {
    for (const grade of grades) {
      const gradeLabel = grade === 'K' ? 'Kindergarten' : `Grade ${grade}`;
      console.log(`[${completed + 1}/${total}] ${gradeLabel} ${subject.label}...`);

      try {
        const course = await generateCourse(subject, grade);

        if (dryRun) {
          console.log(`  ${course.modules.length} modules, ${course.modules.reduce((s, m) => s + m.activities.length, 0)} activities`);
          console.log(`  Modules: ${course.modules.map(m => m.title).join(', ')}`);
        } else {
          await writeToDB(course);
        }

        completed++;

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`  ERROR: ${err}`);
        errors++;
      }
    }
  }

  console.log(`\nDone! ${completed} courses generated, ${errors} errors.`);
}

main().catch(console.error);
