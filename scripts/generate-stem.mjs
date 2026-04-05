/**
 * STEM Activity Generator — Design Thinking, Coding, Robotics, PBL
 * Generates targeted STEM units for Teaching Labs
 */

import Anthropic from '@anthropic-ai/sdk';
import pg from 'pg';
import fs from 'fs';
import { randomUUID } from 'crypto';

for (const f of ['.env.local', '/home/sacwoo/.openclaw/workspace/.env']) {
  try {
    for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = l.match(/^([^#=]+)=(.*)/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {}
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const TEACHER_ID = 'c419128e-2868-47b7-8eaf-82c43a52c8bf';

const SYSTEM_PROMPT = `You are a curriculum designer specializing in STEM education (K-12). 
Teaching Labs philosophy:
- BRAIN-BASED, WHOLE-BODY, HANDS-ON: Students move, build, create, and physically engage
- PROJECT-BASED: Real problems, real making, real solutions
- STUDENT AGENCY: Students choose, explore, and present their work
- AI CHAT SUPPORT: Spark AI tutor guides students via chat during the activity
Return ONLY valid JSON, no markdown fences, no extra text. Every string value must use escaped characters only — no raw newlines inside JSON strings.`;

function buildPrompt(unitTitle, unitDescription, gradeBand, count, specificInstructions) {
  return `Create ${count} hands-on STEM activities for a unit called "${unitTitle}".

Unit description: ${unitDescription}
Grade band: ${gradeBand}

${specificInstructions}

Return a JSON array of ${count} activity objects. Each object:
{
  "title": "Creative engaging title",
  "description": "2-3 sentence overview that excites students",
  "objective": "Clear learning objective",
  "directions": "Numbered steps (6-10 steps). Every step involves physical making, building, or testing.",
  "materials": "Comma-separated materials list",
  "hook": "1-2 sentence opener to grab attention",
  "essential_question": "Driving question for the activity",
  "vocabulary": "3-6 key terms, comma-separated",
  "differentiation": "Support for struggling + extension for advanced learners",
  "assessment": "Observable evidence of learning (not a test)",
  "learning_goal": "What students will know/do after",
  "activity_type": "one of: experiment, building, creative_project, role_play, exploration, hands_on",
  "estimated_minutes": number between 30 and 60
}`;
}

function parseJSON(text) {
  let clean = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
  clean = clean.replace(/,\s*([\]\}])/g, '$1');
  try {
    return JSON.parse(clean);
  } catch {
    // Try to salvage
    const match = clean.match(/\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0].replace(/,\s*([\]\}])/g, '$1')); } catch {}
    }
    return null;
  }
}

async function generate(unitTitle, description, gradeBand, count, instructions, subjectEnum, gradeLevel) {
  console.log(`\n🎯 ${unitTitle} / ${gradeBand}`);
  
  const prompt = buildPrompt(unitTitle, description, gradeBand, count, instructions);
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });
  
  const activities = parseJSON(response.content[0].text.trim());
  if (!activities || !Array.isArray(activities)) {
    console.error('  ❌ Parse failed');
    return 0;
  }
  console.log(`  ✅ Generated ${activities.length}`);
  return activities;
}

async function save(client, activities, subjectEnum, gradeLevel, unitTag) {
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
          $1,$2,$3,$4,$5::subject_area,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW()
        )
      `, [
        randomUUID(), act.title, act.description, TEACHER_ID,
        subjectEnum, act.activity_type || 'hands_on',
        act.estimated_minutes || 45,
        act.objective, act.materials, act.directions, act.assessment,
        act.learning_goal, act.essential_question, act.vocabulary,
        act.hook, act.differentiation,
        JSON.stringify([unitTag]),
        gradeLevel, true, true,
      ]);
      saved++;
    } catch (err) {
      console.error(`  ⚠️ Save failed "${act.title}": ${err.message}`);
    }
  }
  console.log(`  💾 Saved ${saved}/${activities.length}`);
  return saved;
}

const UNITS = [
  // DESIGN THINKING — full process unit, all grade bands
  {
    title: 'Design Thinking: From Problem to Prototype',
    description: 'A complete design thinking unit where students learn and apply the 5-stage design process (Empathize, Define, Ideate, Prototype, Test) to solve a real-world problem, culminating in a physical prototype they build and test.',
    subject: 'stem',
    tag: 'Design Thinking',
    gradeBands: [
      { band: 'K-2', count: 6, gradeLevel: 'K-2', instructions: `
The 6 activities should follow the FULL design thinking process in order:
1. Empathize — observing and interviewing to understand a problem
2. Define — creating a problem statement as a class
3. Ideate — wild brainstorming (no wrong ideas!)
4. Prototype — building with basic materials (popsicle sticks, clay, cardboard)
5. Test & Get Feedback — sharing prototypes and getting reactions
6. Redesign & Celebrate — improving based on feedback, gallery walk

Theme for K-2: Design a better toy box, school bag organizer, or classroom helper tool.
Make everything SUPER physical and playful for 5-8 year olds.` },
      { band: '3-5', count: 6, gradeLevel: '3-5', instructions: `
6 activities following the full design thinking process:
1. Empathize — user research, shadowing, interviewing
2. Define — crafting a "How Might We" statement
3. Ideate — divergent thinking techniques (mind maps, random stimulus)
4. Prototype — building with cardboard, tape, craft materials
5. Test & Iterate — structured testing with peers, feedback forms
6. Present & Reflect — pitch presentations, self-assessment

Theme for 3-5: Design solutions for a school problem (cafeteria noise, litter, homework organization).` },
      { band: '6-8', count: 6, gradeLevel: '6-8', instructions: `
6 activities following the full design thinking process:
1. Empathize — ethnographic research, empathy maps
2. Define — point of view statements, insight synthesis
3. Ideate — SCAMPER, lotus blossom, rapid sketching
4. Prototype — detailed physical prototypes with multiple iterations
5. Test — structured user testing, data collection
6. Pitch — startup-style presentations with business case

Theme for 6-8: Design for a community problem (local environmental issue, accessibility, mental health).` },
      { band: '9-12', count: 6, gradeLevel: '9-12', instructions: `
6 activities following the full design thinking process at a sophisticated level:
1. Empathize — field research, stakeholder interviews, journey mapping
2. Define — systems thinking, root cause analysis
3. Ideate — cross-disciplinary brainstorming, speculative design
4. Prototype — high-fidelity prototypes (digital + physical)
5. Test — A/B testing, quantitative feedback, iteration cycles
6. Launch — public presentation, pitch deck, impact measurement

Theme for 9-12: Social enterprise challenge — design a solution that could become a real business.` },
    ]
  },
  // CODING — project-based coding activities
  {
    title: 'Coding Projects: Make Something Real',
    description: 'Project-based coding activities where students build real things — games, animations, apps, and interactive stories — using age-appropriate tools while learning computational thinking.',
    subject: 'computer_science_technology',
    tag: 'Coding',
    gradeBands: [
      { band: 'K-2', count: 5, gradeLevel: 'K-2', instructions: `
5 unplugged + Scratch Jr coding activities:
- Sequence, loops, and events through physical movement
- Story animation in Scratch Jr
- Debug the algorithm (physical card sorting game)
- Robot instructions (give step-by-step directions to a partner acting as a robot)
- Design a character and code its dance moves
Keep it VERY hands-on and playful. Minimal reading required.` },
      { band: '3-5', count: 5, gradeLevel: '3-5', instructions: `
5 Scratch + physical coding activities:
- Create a quiz game about a topic they love
- Build an interactive story (branching narrative)
- Code a simulation (weather, animal migration, etc.)
- Design a math helper tool in Scratch
- Make a music-making program
Include physical "unplugged" elements in each activity.` },
      { band: '6-8', count: 5, gradeLevel: '6-8', instructions: `
5 Python/JavaScript + project activities:
- Text-based adventure game (Python)
- Data visualization of a social issue they care about
- Build a simple website about something they love
- Create a chatbot with basic conditional logic
- Animate a science simulation (pendulum, ecosystem, etc.)
Include physical prototyping (wireframing on paper, storyboards).` },
      { band: '9-12', count: 5, gradeLevel: '9-12', instructions: `
5 advanced coding projects:
- Machine learning model to solve a real problem
- Full-stack web app (idea to deployment)
- Mobile app prototype for a social cause
- Algorithm visualization and analysis
- AI ethics project (train a model, then audit it for bias)
Include design sprints, peer code review, and real-world deployment where possible.` },
    ]
  },
  // ROBOTICS
  {
    title: 'Robotics: Build, Program, Compete',
    description: 'Hands-on robotics activities where students design, build, and program robots to complete challenges, culminating in friendly competitions and real-world applications.',
    subject: 'engineering',
    tag: 'Robotics',
    gradeBands: [
      { band: 'K-2', count: 4, gradeLevel: 'K-2', instructions: `
4 intro robotics activities using Bee-Bots, Cubetto, or physical robot simulation:
- Program a robot to follow a map
- Debug why the robot went wrong (error correction)
- Build an obstacle course and navigate it
- Design a robot helper for a classroom job
Make it very playful — kids ARE the robots in some activities.` },
      { band: '3-5', count: 4, gradeLevel: '3-5', instructions: `
4 activities using Scratch + physical robots (Ozobot, Sphero, or similar):
- Program a robot to deliver "mail" across a course
- Robot art — program a Sphero with paint to create art
- Engineering challenge: build a ramp the robot must climb
- Create a robot obstacle competition with custom rules
Emphasize the engineering design cycle.` },
      { band: '6-8', count: 4, gradeLevel: '6-8', instructions: `
4 intermediate robotics activities (LEGO Mindstorms, VEX IQ, or similar):
- Build and program a robot arm to sort objects
- Autonomous navigation challenge
- Sensor integration: robot that responds to light/sound/touch
- Mini robot competition: design, build, program, compete
Include iteration: build, test, redesign.` },
      { band: '9-12', count: 4, gradeLevel: '9-12', instructions: `
4 advanced robotics/engineering activities:
- Design a robot for a real-world application (search and rescue, agriculture, healthcare)
- PID controller programming and tuning
- Computer vision integration (robot that recognizes objects)
- Capstone: full robotics competition prep with strategy, build, and program phases
Include real engineering documentation and team roles.` },
    ]
  },
  // PROJECT-BASED STEM
  {
    title: 'STEM Challenges: Real Problems, Real Solutions',
    description: 'Multi-day project-based STEM challenges where students tackle real-world engineering and science problems, building physical solutions and presenting their findings.',
    subject: 'stem',
    tag: 'STEM Project',
    gradeBands: [
      { band: 'K-2', count: 5, gradeLevel: 'K-2', instructions: `
5 mini engineering challenges:
- Build the tallest tower that holds a marshmallow (spaghetti tower)
- Design a bridge that holds the most pennies
- Engineer an egg drop protection system (with simple materials)
- Build a boat that holds the most weight before sinking
- Design a wind-powered vehicle
Short activities (30-40 min each), maximum fun, minimum instructions.` },
      { band: '3-5', count: 5, gradeLevel: '3-5', instructions: `
5 STEM project challenges:
- Rube Goldberg machine (chain reaction to complete a simple task)
- Solar oven: cook a s'more using only sunlight
- Water filtration: clean "dirty" water using natural materials
- Parachute design and drop competition
- Paper roller coaster (marble run using only paper and tape)
Each has design, build, test, and present phases.` },
      { band: '6-8', count: 5, gradeLevel: '6-8', instructions: `
5 multi-day STEM projects:
- Design and build a wind turbine (measure power output)
- Hydroponic garden system (engineering + biology)
- Bridge engineering challenge with load testing and data analysis
- Create a Rube Goldberg machine that demonstrates a physics principle
- Biomedical engineering: design a prosthetic hand from household materials
Include real data collection, graphing, and scientific analysis.` },
      { band: '9-12', count: 5, gradeLevel: '9-12', instructions: `
5 capstone-level STEM projects:
- Climate engineering: design a carbon capture prototype
- Structural engineering: design a building that survives simulated earthquake
- Biotech: design an experiment testing a hypothesis about plant growth under different conditions
- Human-centered design: create an assistive technology device for someone with a disability
- Sustainable infrastructure: redesign a local problem (transportation, waste, water) with a physical model
Multi-day projects with client briefs, engineering notebooks, and public presentations.` },
    ]
  },
];

async function main() {
  console.log('🚀 STEM Activity Generator');
  
  const ref = process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
  const client = new pg.Client({
    host: `db.${ref}.supabase.co`,
    port: 5432, database: 'postgres', user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to database');
  
  let totalSaved = 0;
  
  for (const unit of UNITS) {
    console.log(`\n\n📦 UNIT: ${unit.title}`);
    for (const { band, count, gradeLevel, instructions } of unit.gradeBands) {
      try {
        const activities = await generate(
          unit.title, unit.description, band, count, instructions,
          unit.subject, gradeLevel
        );
        if (activities && activities.length > 0) {
          const saved = await save(client, activities, unit.subject, gradeLevel, unit.tag);
          totalSaved += saved;
        }
        await new Promise(r => setTimeout(r, 1500)); // rate limit
      } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
      }
    }
  }
  
  console.log(`\n\n✨ STEM generator complete! Total saved: ${totalSaved} activities`);
  await client.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
