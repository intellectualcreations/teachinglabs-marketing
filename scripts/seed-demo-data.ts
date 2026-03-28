/**
 * Seed demo data into Supabase for Teaching Labs.
 * Run with: npx tsx --env-file=.env.local scripts/seed-demo-data.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Deterministic UUIDs for reproducibility
const IDS = {
  school: '00000000-0000-4000-a000-000000000001',
  teacher: '00000000-0000-4000-a000-000000000010',
  classes: [
    '00000000-0000-4000-a000-000000000101',
    '00000000-0000-4000-a000-000000000102',
    '00000000-0000-4000-a000-000000000103',
  ],
  students: Array.from({ length: 10 }, (_, i) =>
    `00000000-0000-4000-a000-0000000002${String(i).padStart(2, '0')}`
  ),
};

const STUDENT_NAMES = [
  'Zara Mitchell', 'Leo Fernandez', 'Ivy Nguyen', 'Marcus Taylor',
  'Ruby Chen', 'Finn O\'Brien', 'Nadia Patel', 'Cole Harrison',
  'Elise Kim', 'Dante Morales',
];

async function seed() {
  console.log('Seeding demo data...\n');

  // 1. School
  console.log('Creating school...');
  const { error: schoolErr } = await supabase.from('schools').upsert({
    id: IDS.school,
    name: 'Lincoln Elementary',
    district: 'Westside Unified',
    address: '456 Oak Avenue',
  });
  if (schoolErr) console.error('  School error:', schoolErr.message);
  else console.log('  Lincoln Elementary created');

  // 2. Teacher profile
  console.log('Creating teacher profile...');
  const { error: teacherErr } = await supabase.from('profiles').upsert({
    id: IDS.teacher,
    display_name: 'Ms. Dottie Stewart',
    role: 'teacher',
    school_id: IDS.school,
  });
  if (teacherErr) console.error('  Teacher error:', teacherErr.message);
  else console.log('  Ms. Dottie Stewart created');

  // 3. Classes
  const classData = [
    { name: 'Math 101', subject: 'Mathematics', grade_level: '5', join_code: 'MATH101' },
    { name: 'Science 201', subject: 'Science', grade_level: '5', join_code: 'SCI201' },
    { name: 'English 301', subject: 'English Language Arts', grade_level: '5', join_code: 'ENG301' },
  ];

  console.log('Creating classes...');
  for (let i = 0; i < classData.length; i++) {
    const { error: classErr } = await supabase.from('classes').upsert({
      id: IDS.classes[i],
      ...classData[i],
      teacher_id: IDS.teacher,
      school_id: IDS.school,
    });
    if (classErr) console.error(`  Class error (${classData[i].name}):`, classErr.message);
    else console.log(`  ${classData[i].name} created`);
  }

  // 4. Student profiles
  console.log('Creating student profiles...');
  for (let i = 0; i < 10; i++) {
    const { error: studentErr } = await supabase.from('profiles').upsert({
      id: IDS.students[i],
      display_name: STUDENT_NAMES[i],
      role: 'student',
      school_id: IDS.school,
    });
    if (studentErr) console.error(`  Student error (${STUDENT_NAMES[i]}):`, studentErr.message);
    else console.log(`  ${STUDENT_NAMES[i]} created`);
  }

  // 5. Enrollments — spread students across classes
  console.log('Creating enrollments...');
  const enrollments: Array<{ student_id: string; class_id: string; status: string }> = [];
  for (let i = 0; i < 10; i++) {
    // Each student in at least 1 class, some in 2
    enrollments.push({ student_id: IDS.students[i], class_id: IDS.classes[i % 3], status: 'active' });
    if (i < 6) {
      enrollments.push({ student_id: IDS.students[i], class_id: IDS.classes[(i + 1) % 3], status: 'active' });
    }
  }
  const { error: enrollErr } = await supabase.from('enrollments').upsert(enrollments, {
    onConflict: 'student_id,class_id',
    ignoreDuplicates: true,
  });
  if (enrollErr) console.error('  Enrollment error:', enrollErr.message);
  else console.log(`  ${enrollments.length} enrollments created`);

  // 6. Assignments
  console.log('Creating assignments...');
  const assignmentData = [
    { title: 'Fraction Fundamentals', description: 'Complete exercises on adding and subtracting fractions.', class_id: IDS.classes[0], teacher_id: IDS.teacher, due_date: '2026-04-05' },
    { title: 'Multiplication Word Problems', description: 'Solve 10 real-world multiplication problems.', class_id: IDS.classes[0], teacher_id: IDS.teacher, due_date: '2026-04-10' },
    { title: 'Plant Cell Diagram', description: 'Label all parts of a plant cell and describe their functions.', class_id: IDS.classes[1], teacher_id: IDS.teacher, due_date: '2026-04-07' },
    { title: 'Solar System Report', description: 'Write a one-page report on your assigned planet.', class_id: IDS.classes[1], teacher_id: IDS.teacher, due_date: '2026-04-12' },
    { title: 'Persuasive Essay Draft', description: 'Write a first draft of your persuasive essay on a topic of your choice.', class_id: IDS.classes[2], teacher_id: IDS.teacher, due_date: '2026-04-08' },
    { title: 'Vocabulary Quiz Prep', description: 'Study and practice the 20 vocabulary words from Chapter 7.', class_id: IDS.classes[2], teacher_id: IDS.teacher, due_date: '2026-04-06' },
  ];

  const assignmentIds: string[] = [];
  for (const a of assignmentData) {
    const { data, error: aErr } = await supabase.from('assignments').insert(a).select('id').single();
    if (aErr) {
      console.error(`  Assignment error (${a.title}):`, aErr.message);
    } else {
      assignmentIds.push(data.id);
      console.log(`  ${a.title} created`);
    }
  }

  // 7. Submissions — a few students submit to the first 2 assignments
  if (assignmentIds.length >= 2) {
    console.log('Creating submissions...');
    const submissions = [
      { assignment_id: assignmentIds[0], student_id: IDS.students[0], content: '1/2 + 1/3 = 5/6. I used common denominators.', grade: 92, feedback: 'Great work showing your steps!' },
      { assignment_id: assignmentIds[0], student_id: IDS.students[1], content: '1/2 + 1/3 = 2/5. Added tops and bottoms.', grade: 65, feedback: 'Remember to find a common denominator first.' },
      { assignment_id: assignmentIds[0], student_id: IDS.students[2], content: '1/2 + 1/3 = 5/6. LCD is 6.', grade: 95, feedback: 'Excellent!' },
      { assignment_id: assignmentIds[1], student_id: IDS.students[0], content: 'If 12 boxes hold 8 pencils each, that is 12 x 8 = 96 pencils.', grade: 88, feedback: null },
      { assignment_id: assignmentIds[1], student_id: IDS.students[3], content: '5 shelves with 14 books = 70 books total.', grade: 90, feedback: 'Perfect setup and answer.' },
    ];
    const { error: subErr } = await supabase.from('submissions').insert(submissions);
    if (subErr) console.error('  Submission error:', subErr.message);
    else console.log(`  ${submissions.length} submissions created`);
  }

  // 8. Chat messages
  console.log('Creating chat messages...');
  const chatMessages = [
    { sender_id: IDS.teacher, class_id: IDS.classes[0], content: 'Welcome to Math 101! Feel free to ask questions here.', message_type: 'teacher' },
    { sender_id: IDS.students[0], class_id: IDS.classes[0], content: 'Hi Ms. Stewart! I have a question about fractions.', message_type: 'student' },
    { sender_id: IDS.teacher, class_id: IDS.classes[0], content: 'Of course, Zara! What would you like to know?', message_type: 'teacher' },
    { sender_id: IDS.students[0], class_id: IDS.classes[0], content: 'How do I find the LCD when denominators are big numbers?', message_type: 'student' },
    { sender_id: IDS.teacher, class_id: IDS.classes[1], content: 'Don\'t forget your plant cell diagrams are due Friday!', message_type: 'teacher' },
  ];
  const { error: chatErr } = await supabase.from('chat_messages').insert(chatMessages);
  if (chatErr) console.error('  Chat error:', chatErr.message);
  else console.log(`  ${chatMessages.length} messages created`);

  console.log('\nSeed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
