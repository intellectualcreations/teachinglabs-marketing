/**
 * Seed Cognee knowledge graph with course catalog data.
 *
 * Usage: npx tsx scripts/seed-cognee.ts
 *
 * Gracefully handles Cognee being unavailable (logs and exits cleanly).
 */

import { courses } from '../lib/courses';
import { cogneeAdd, cogneeCognify, cogneeHealth } from '../lib/cognee';

const DATASET_NAME = 'teaching-labs-courses';

function formatCourseAsDocument(course: (typeof courses)[number]): string {
  const moduleList = course.modules
    .map((m) => `  - ${m.title} (${m.lessonCount} lessons)`)
    .join('\n');

  return [
    `Course: ${course.title}`,
    `Subject: ${course.subject}`,
    `Grade Level: ${course.gradeLevel}`,
    `Instructor: ${course.instructor}`,
    `Tags: ${course.tags.join(', ')}`,
    '',
    course.description,
    '',
    'Modules:',
    moduleList,
  ].join('\n');
}

async function main() {
  console.log('🌱 Cognee Course Catalog Seeder');
  console.log('================================\n');

  // Check health first
  try {
    const health = await cogneeHealth();
    console.log(`✅ Cognee is reachable: ${health.status} (v${health.version})\n`);
  } catch (err) {
    console.error('❌ Cognee is not reachable. Skipping seed.');
    console.error(`   Error: ${err instanceof Error ? err.message : String(err)}`);
    console.error('   Make sure the Cognee server is running on localhost:18000.');
    process.exit(0); // exit cleanly, not an error
  }

  // Add each course as a document
  let added = 0;
  let failed = 0;

  for (const course of courses) {
    const doc = formatCourseAsDocument(course);
    try {
      await cogneeAdd({ content: doc, datasetName: DATASET_NAME });
      console.log(`  ✅ Added: ${course.title}`);
      added++;
    } catch (err) {
      console.error(`  ❌ Failed: ${course.title} — ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log(`\n📊 Added ${added}/${courses.length} courses (${failed} failed)\n`);

  // Trigger cognify
  if (added > 0) {
    try {
      console.log('🧠 Triggering cognify...');
      await cogneeCognify([DATASET_NAME]);
      console.log('✅ Cognify triggered successfully.\n');
    } catch (err) {
      console.error(`❌ Cognify failed: ${err instanceof Error ? err.message : String(err)}`);
      console.error('   You can retry manually later.\n');
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
