/**
 * AI Activity Generator — Standards-aligned, hands-on, brain-based learning activities
 * 
 * Creates activities for core K-12 subjects across grade bands:
 *   K-2, 3-5, 6-8, 9-12
 * 
 * Subjects: ELA, Math, Science, Social Studies
 * Focus: Brain-based, whole-body, hands-on learning with Spark AI chat support
 * 
 * Usage: node scripts/generate-activities.mjs [--dry-run] [--subject math] [--grade 3-5]
 */

import Anthropic from '@anthropic-ai/sdk';
import pg from 'pg';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Load env
for (const f of ['.env.local', '/home/sacwoo/.openclaw/workspace/.env']) {
  try {
    for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = l.match(/^([^#=]+)=(.*)/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {}
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Dottie's teacher ID — activities go to her library
const TEACHER_ID = 'c419128e-2868-47b7-8eaf-82c43a52c8bf';

const DRY_RUN = process.argv.includes('--dry-run');
const FILTER_SUBJECT = process.argv.find((a, i) => process.argv[i-1] === '--subject');
const FILTER_GRADE = process.argv.find((a, i) => process.argv[i-1] === '--grade');

// Subject → enum value mapping
const SUBJECTS = {
  'ELA': 'english_language_arts',
  'Math': 'math',
  'Science': 'science',
  'Social Studies': 'social_studies',
};

const GRADE_BANDS = ['K-2', '3-5', '6-8', '9-12'];

// 5 activities per subject per grade band = 80 total
const ACTIVITIES_PER_COMBO = 5;

// Standards references by subject + grade
const STANDARDS_CONTEXT = {
  'ELA': {
    'K-2': 'Common Core ELA K-2: Foundational skills (phonics, fluency), literature comprehension, writing (narratives, opinion), speaking/listening',
    '3-5': 'Common Core ELA 3-5: Reading comprehension (literature + informational), writing (opinion, informative, narrative), research skills, vocabulary',
    '6-8': 'Common Core ELA 6-8: Close reading, textual evidence, argumentative writing, research projects, literary analysis',
    '9-12': 'Common Core ELA 9-12: Complex text analysis, rhetoric, synthesis across sources, college-ready writing, seminar discussions',
  },
  'Math': {
    'K-2': 'Common Core Math K-2: Counting, addition/subtraction, place value, measurement, basic geometry (shapes)',
    '3-5': 'Common Core Math 3-5: Multiplication/division, fractions, decimals, area/perimeter, data analysis, early algebra',
    '6-8': 'Common Core Math 6-8: Ratios/proportions, expressions/equations, geometry (angles, volume), statistics, linear functions',
    '9-12': 'Common Core Math 9-12: Algebra, functions, geometry proofs, trigonometry, statistics/probability, modeling',
  },
  'Science': {
    'K-2': 'NGSS K-2: Weather patterns, plant/animal needs, pushes/pulls (forces), properties of materials, Earth materials',
    '3-5': 'NGSS 3-5: Life cycles, ecosystems, weather/climate, forces/motion, energy, Earth systems, engineering design',
    '6-8': 'NGSS 6-8: Cells, body systems, genetics, chemical reactions, energy transfer, Earth history, space systems',
    '9-12': 'NGSS 9-12: Evolution, molecular biology, chemical bonding, waves, electromagnetism, plate tectonics, climate science',
  },
  'Social Studies': {
    'K-2': 'C3 Framework K-2: Community helpers, maps/globes, family history, rules/laws, basic economics (needs vs wants)',
    '3-5': 'C3 Framework 3-5: State/US history, geography (regions), government branches, economics (goods/services), Native American cultures',
    '6-8': 'C3 Framework 6-8: World civilizations, US Constitution, geography (human-environment), economic systems, civic participation',
    '9-12': 'C3 Framework 9-12: US/World history (primary sources), AP-level analysis, global economics, political philosophy, civic action',
  },
};

const SYSTEM_PROMPT = `You are a curriculum designer creating hands-on, brain-based learning activities for K-12 students. 

Teaching Labs philosophy:
- BRAIN-BASED LEARNING: Activities engage multiple senses and learning modalities
- WHOLE-BODY: Students move, build, create, act out, and physically engage
- HANDS-ON: Manipulatives, art materials, building, crafting, experiments, real objects
- AI CHAT SUPPORT: Each activity has an AI tutor "Spark" who guides students through it via chat
- STUDENT AGENCY: Students make choices, explore, and discover rather than just follow instructions
- NOT worksheet-based: Avoid fill-in-the-blank, multiple choice, or passive reading activities

Every activity should get kids OUT of their seats and DOING something physical/creative.

Return ONLY valid JSON, no markdown fences, no extra text.`;

function buildPrompt(subject, gradeBand, standards, batchNum) {
  return `Create ${ACTIVITIES_PER_COMBO} unique, engaging, hands-on activities for ${subject} at the ${gradeBand} grade level.

Standards context: ${standards}

Requirements for EACH activity:
1. Must involve physical movement, building, creating, or hands-on manipulation
2. Must be age-appropriate for ${gradeBand}
3. Must align to the standards listed above
4. Must work with Spark AI chat (student chats with AI tutor while doing the activity)
5. Estimated time: 20-45 minutes
6. Materials should be common classroom/household items

Return a JSON array of ${ACTIVITIES_PER_COMBO} activities. Each activity object:
{
  "title": "Creative, kid-friendly title",
  "description": "2-3 sentence overview that excites students about the activity",
  "objective": "Clear learning objective aligned to standards",
  "directions": "Numbered step-by-step directions (5-8 steps). Include physical/hands-on actions in every step.",
  "materials": "Comma-separated list of materials needed",
  "hook": "1-2 sentence engaging opener to grab student attention",
  "essential_question": "Thought-provoking question that drives the activity",
  "vocabulary": "Comma-separated key vocabulary terms (3-6 words)",
  "differentiation": "Brief note on how to support struggling learners and extend for advanced learners",
  "assessment": "How the teacher knows the student learned (observable evidence, not a test)",
  "learning_goal": "What students will know/be able to do after this activity",
  "activity_type": "one of: hands_on, experiment, creative_project, movement, building, role_play, exploration",
  "estimated_minutes": number between 20 and 45,
  "standards_tags": ["array of 1-3 relevant standard codes or descriptions"]
}

Make each activity DIFFERENT in type — mix building, movement, role play, experiments, creative projects. Batch ${batchNum}.`;
}

async function generateBatch(subject, gradeBand) {
  const standards = STANDARDS_CONTEXT[subject][gradeBand];
  const prompt = buildPrompt(subject, gradeBand, standards, 1);
  
  console.log(`\n🎯 Generating: ${subject} / ${gradeBand}`);
  
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });
  
  const text = response.content[0].text.trim();
  
  try {
    // Try to parse JSON (handle markdown fences, trailing commas, etc)
    let clean = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    // Fix trailing commas before ] or }
    clean = clean.replace(/,\s*([\]\}])/g, '$1');
    // Fix unescaped newlines inside strings
    clean = clean.replace(/([^\\])\n/g, '$1\\n');
    
    const activities = JSON.parse(clean);
    
    if (!Array.isArray(activities)) {
      console.error('  ❌ Response is not an array');
      return [];
    }
    
    console.log(`  ✅ Generated ${activities.length} activities`);
    return activities;
  } catch (err) {
    // Try to salvage partial JSON — find array of objects
    try {
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/); 
      if (match) {
        let salvaged = match[0].replace(/,\s*([\]\}])/g, '$1');
        const activities = JSON.parse(salvaged);
        console.log(`  ⚠️ Salvaged ${activities.length} activities from partial JSON`);
        return activities;
      }
    } catch {}
    console.error(`  ❌ JSON parse error: ${err.message}`);
    console.error('  Raw:', text.slice(0, 200));
    return [];
  }
}

async function saveActivities(client, activities, subject, gradeBand, subjectEnum) {
  let saved = 0;
  
  for (const act of activities) {
    try {
      await client.query(`
        INSERT INTO assignments (
          id, title, description, teacher_id, subject, activity_type, 
          estimated_minutes, objective, materials, directions, assessment,
          learning_goal, essential_question, vocabulary, hook, differentiation,
          standards, grade_level, is_template, is_published, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5::subject_area, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
        )
      `, [
        randomUUID(),
        act.title,
        act.description,
        TEACHER_ID,
        subjectEnum,
        act.activity_type || 'assignment',
        act.estimated_minutes || 30,
        act.objective,
        act.materials,
        act.directions,
        act.assessment,
        act.learning_goal,
        act.essential_question,
        act.vocabulary,
        act.hook,
        act.differentiation,
        JSON.stringify(act.standards_tags || []),
        gradeBand,
        true,
        true,
      ]);
      saved++;
    } catch (err) {
      console.error(`  ⚠️ Failed to save "${act.title}": ${err.message}`);
    }
  }
  
  return saved;
}

async function main() {
  console.log('🚀 Teaching Labs Activity Generator');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  if (FILTER_SUBJECT) console.log(`   Subject filter: ${FILTER_SUBJECT}`);
  if (FILTER_GRADE) console.log(`   Grade filter: ${FILTER_GRADE}`);
  
  // Connect to DB
  const ref = process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
  const client = new pg.Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
  
  if (!DRY_RUN) {
    await client.connect();
    console.log('   Connected to database');
  }
  
  let totalGenerated = 0;
  let totalSaved = 0;
  
  const subjects = FILTER_SUBJECT
    ? Object.entries(SUBJECTS).filter(([k]) => k.toLowerCase() === FILTER_SUBJECT.toLowerCase())
    : Object.entries(SUBJECTS);
  
  const grades = FILTER_GRADE
    ? GRADE_BANDS.filter(g => g === FILTER_GRADE)
    : GRADE_BANDS;
  
  for (const [subjectName, subjectEnum] of subjects) {
    for (const gradeBand of grades) {
      try {
        const activities = await generateBatch(subjectName, gradeBand);
        totalGenerated += activities.length;
        
        if (activities.length > 0) {
          if (DRY_RUN) {
            console.log(`  📝 Would save ${activities.length} activities`);
            // Show first one as sample
            const sample = activities[0];
            console.log(`     Sample: "${sample.title}" (${sample.activity_type}, ${sample.estimated_minutes}min)`);
            console.log(`     Hook: ${sample.hook?.slice(0, 80)}...`);
          } else {
            const saved = await saveActivities(client, activities, subjectName, gradeBand, subjectEnum);
            totalSaved += saved;
            console.log(`  💾 Saved ${saved}/${activities.length}`);
          }
        }
        
        // Rate limit: small delay between API calls
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.error(`  ❌ Error for ${subjectName}/${gradeBand}: ${err.message}`);
      }
    }
  }
  
  console.log(`\n✨ Done!`);
  console.log(`   Generated: ${totalGenerated} activities`);
  if (!DRY_RUN) {
    console.log(`   Saved: ${totalSaved} activities`);
    await client.end();
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
