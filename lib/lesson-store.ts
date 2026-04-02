import { courses, getCourseById } from './courses';
import { getEnrollments } from './enrollment-store';

// ── Types ──────────────────────────────────────────────

export interface Lesson {
  id: string;
  courseId: string;
  moduleTitle: string;
  title: string;
  content: string;
  order: number;
  videoUrl?: string;
  starterCode?: string;
}

export interface LessonCompletion {
  studentId: string;
  lessonId: string;
  completedAt: string;
  watched?: boolean;
}

export interface LessonProgress {
  completed: number;
  total: number;
  percentage: number;
}

// ── In-memory stores ───────────────────────────────────

const lessons: Lesson[] = [];
const completions: LessonCompletion[] = [];

// ── Content generator ──────────────────────────────────

function generateLessonContent(courseTitle: string, moduleTitle: string, lessonTitle: string): string {
  return [
    `Welcome to "${lessonTitle}", part of the ${moduleTitle} module in ${courseTitle}. In this lesson, we will explore the key concepts and build a strong understanding of the material through examples and guided practice.`,
    `The ideas covered here connect directly to what you have been learning in previous lessons. Pay close attention to how each concept builds on the last. Take notes, try the practice problems, and don't be afraid to revisit earlier sections if something feels unclear.`,
    `By the end of this lesson, you should be able to explain the core ideas in your own words, apply them to new situations, and feel confident moving on to the next topic. Remember: understanding takes time, and every question you ask is a step forward.`,
  ].join('\n\n');
}

/** Map of module title → array of lesson title templates */
const LESSON_TEMPLATES: Record<string, string[]> = {
  // Math – Algebra I
  'Expressions & Variables': ['What Are Variables?', 'Writing & Evaluating Expressions', 'Simplifying Expressions'],
  'Linear Equations': ['Solving One-Step Equations', 'Multi-Step Equations', 'Word Problems with Equations'],
  'Inequalities & Absolute Value': ['Graphing Inequalities', 'Solving Compound Inequalities', 'Absolute Value Equations'],
  'Functions & Graphing': ['Introduction to Functions', 'Slope and Rate of Change', 'Graphing Linear Functions'],

  // Math – Geometry
  'Points, Lines & Angles': ['Basic Definitions', 'Angle Relationships', 'Parallel Lines & Transversals'],
  'Triangles & Congruence': ['Classifying Triangles', 'Triangle Congruence Theorems', 'Proofs with Triangles'],
  'Circles & Arc Length': ['Parts of a Circle', 'Central Angles & Arcs', 'Arc Length & Sector Area'],
  'Area, Volume & Surface Area': ['Area of Polygons', 'Volume of Prisms & Cylinders', 'Surface Area Calculations'],

  // Math – Pre-Calculus
  'Polynomial & Rational Functions': ['Polynomial Operations', 'Graphing Polynomials', 'Rational Expressions'],
  'Trigonometric Functions': ['Unit Circle Basics', 'Graphing Sine & Cosine', 'Trigonometric Identities'],
  'Sequences & Series': ['Arithmetic Sequences', 'Geometric Sequences', 'Series & Summation Notation'],
  'Introduction to Limits': ['What Is a Limit?', 'Evaluating Limits', 'Limits at Infinity'],

  // Science – Biology
  'Cell Structure & Function': ['The Cell Theory', 'Organelles & Their Roles', 'Cell Transport Mechanisms'],
  'Genetics & Heredity': ['DNA Structure & Replication', 'Mendelian Genetics', 'Punnett Squares & Probability'],
  'Evolution & Natural Selection': ['Evidence for Evolution', 'Natural Selection in Action', 'Speciation & Adaptation'],
  'Ecosystems & Biodiversity': ['Energy Flow in Ecosystems', 'Food Webs & Trophic Levels', 'Biodiversity & Conservation'],

  // Science – Chemistry
  'Atomic Structure & Periodic Table': ['Atomic Models', 'Electron Configuration', 'Reading the Periodic Table'],
  'Chemical Bonding': ['Ionic Bonds', 'Covalent Bonds', 'Metallic Bonds & Properties'],
  'Reactions & Stoichiometry': ['Balancing Chemical Equations', 'Types of Reactions', 'Stoichiometry Calculations'],
  'States of Matter & Thermodynamics': ['Kinetic Molecular Theory', 'Phase Changes', 'Enthalpy & Heat Transfer'],

  // Science – Physics
  'Motion & Forces': ["Newton's First Law", "Newton's Second Law", 'Friction & Free-Body Diagrams'],
  'Energy & Work': ['Work & Power', 'Kinetic & Potential Energy', 'Conservation of Energy'],
  'Waves & Sound': ['Wave Properties', 'Sound Waves & Resonance', 'The Doppler Effect'],
  'Electricity & Magnetism': ['Electric Charge & Fields', "Ohm's Law & Circuits", 'Magnetism & Electromagnets'],

  // English – Creative Writing
  'Finding Your Voice': ['Freewriting & Discovery', 'Point of View & Tone'],
  'Short Fiction Workshop': ['Character Development', 'Plot Structure & Conflict', 'Writing Dialogue'],
  'Poetry & Spoken Word': ['Imagery & Figurative Language', 'Rhythm & Meter', 'Performing Your Work'],
  'Revision & Portfolio': ['Self-Editing Techniques', 'Peer Review Workshop'],

  // English – World Literature
  "The Hero's Journey": ['The Monomyth Framework', 'Heroes Across Cultures', 'Writing Your Own Journey'],
  'Social Justice in Literature': ['Literature as Protest', 'Voices of the Marginalized', 'Connecting Text to Today'],
  'Global Voices & Perspectives': ['African & Caribbean Literature', 'Asian Literary Traditions', 'Latin American Storytelling'],
  'Literary Analysis & Essay Writing': ['Close Reading Strategies', 'Building an Argument', 'Crafting the Literary Essay'],

  // English – Grammar & Composition
  'Sentence Structure & Mechanics': ['Parts of a Sentence', 'Punctuation Rules', 'Common Sentence Errors'],
  'Paragraph Development': ['Topic Sentences', 'Supporting Details & Evidence', 'Transitions & Flow'],
  'Essay Organization': ['Thesis Statements', 'Outlining Your Essay', 'Introductions & Conclusions'],
  'Style & Revision': ['Word Choice & Clarity', 'Revision Strategies'],

  // Social Studies – US History
  'Founding & Constitution': ['Colonial Foundations', 'The Declaration of Independence', 'Framing the Constitution'],
  'Civil War & Reconstruction': ['Causes of the Civil War', 'Key Battles & Turning Points', 'Reconstruction Era'],
  'Industrialization & Reform': ['The Industrial Revolution', 'Labor Movements', 'Progressive Era Reforms'],
  'Modern America': ['The World Wars', 'Civil Rights Movement', 'America in the 21st Century'],

  // Social Studies – World Geography
  'Physical Geography & Climate': ['Landforms & Plate Tectonics', 'Climate Zones', 'Weather Patterns'],
  'Population & Culture': ['Demographics & Migration', 'Cultural Diffusion', 'Urbanization Trends'],
  'Economic Geography & Trade': ['Resources & Industries', 'Global Trade Networks', 'Economic Development'],
  'Regions of the World': ['The Americas', 'Europe & Asia', 'Africa & Oceania'],

  // Social Studies – Civics & Government
  'Foundations of Democracy': ['Origins of Democratic Thought', 'The Social Contract'],
  'Branches of Government': ['The Legislative Branch', 'The Executive Branch', 'The Judicial Branch'],
  'Rights & Responsibilities': ['The Bill of Rights', 'Civil Liberties Today', 'Civic Duties'],
  'Civic Participation': ['Voting & Elections', 'Community Action & Advocacy'],

  // Electives – Art Foundations
  'Elements of Art': ['Line, Shape & Form', 'Texture & Space'],
  'Drawing & Sketching': ['Observational Drawing', 'Perspective & Proportion', 'Shading Techniques'],
  'Color Theory & Painting': ['The Color Wheel', 'Mixing & Applying Color', 'Painting Techniques'],
  'Portfolio Project': ['Planning Your Portfolio', 'Artist Statement & Reflection'],

  // Electives – Computer Science
  'Computational Thinking': ['Decomposition & Pattern Recognition', 'Algorithms & Pseudocode'],
  'Python Fundamentals': ['Variables & Data Types', 'Control Flow & Loops', 'Functions & Modules'],
  'Data Structures & Algorithms': ['Lists & Dictionaries', 'Sorting & Searching', 'Big-O Notation'],
  'Web Development Basics': ['HTML & CSS Foundations', 'JavaScript Essentials', 'Building a Web Page'],

  // Electives – Music Theory
  'Rhythm & Meter': ['Note Values & Time Signatures', 'Syncopation & Groove'],
  'Melody & Harmony': ['Scales & Intervals', 'Chord Progressions', 'Harmonizing a Melody'],
  'Musical Forms & Genres': ['Binary & Ternary Form', 'Classical to Contemporary'],
  'Composition Project': ['Writing Your Own Piece', 'Performance & Reflection'],
};

// ── Seed lessons ───────────────────────────────────────

function seedLessons() {
  let globalOrder = 0;

  for (const course of courses) {
    for (const mod of course.modules) {
      const templates = LESSON_TEMPLATES[mod.title];
      const lessonTitles = templates
        ? templates.slice(0, 3)
        : Array.from({ length: Math.min(mod.lessonCount, 3) }, (_, i) => `Lesson ${i + 1}: ${mod.title}`);

      for (let i = 0; i < lessonTitles.length; i++) {
        globalOrder++;
        lessons.push({
          id: `${course.id}--${mod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}--${i + 1}`,
          courseId: course.id,
          moduleTitle: mod.title,
          title: lessonTitles[i],
          content: generateLessonContent(course.title, mod.title, lessonTitles[i]),
          order: i + 1,
        });
      }
    }
  }
}

seedLessons();

// ── Seed video URLs on select lessons ──────────────────

const VIDEO_SEEDS: Record<string, string> = {
  'algebra-1--expressions---variables--1': 'https://www.youtube.com/embed/WJqw-IgnVXQ',   // Variables intro
  'algebra-1--linear-equations--1': 'https://www.youtube.com/embed/LDIiYKYvvdA',           // One-step equations
  'biology--cell-structure---function--1': 'https://www.youtube.com/embed/URUJD5NEXC8',    // Cell theory
  'creative-writing--finding-your-voice--1': 'https://www.youtube.com/embed/4SnFnvFjYQo',  // Freewriting
};

for (const lesson of lessons) {
  if (VIDEO_SEEDS[lesson.id]) {
    lesson.videoUrl = VIDEO_SEEDS[lesson.id];
  }
}

// ── Seed demo completions ──────────────────────────────
// Algebra I: 50% → complete first half of lessons
// Biology: 25% → complete first module's lessons
// Creative Writing: 100% → all lessons complete

function seedCompletions() {
  const studentId = 'demo-student';

  // Algebra I — 50%: complete lessons from first 2 modules
  const algebraLessons = lessons.filter((l) => l.courseId === 'algebra-1');
  const algebraModules = ['Expressions & Variables', 'Linear Equations'];
  for (const lesson of algebraLessons) {
    if (algebraModules.includes(lesson.moduleTitle)) {
      completions.push({
        studentId,
        lessonId: lesson.id,
        completedAt: '2026-03-01T10:00:00Z',
      });
    }
  }

  // Biology — 25%: complete first module
  const bioLessons = lessons.filter((l) => l.courseId === 'biology');
  for (const lesson of bioLessons) {
    if (lesson.moduleTitle === 'Cell Structure & Function') {
      completions.push({
        studentId,
        lessonId: lesson.id,
        completedAt: '2026-03-05T14:00:00Z',
      });
    }
  }

  // Creative Writing — 100%: all lessons
  const cwLessons = lessons.filter((l) => l.courseId === 'creative-writing');
  for (const lesson of cwLessons) {
    completions.push({
      studentId,
      lessonId: lesson.id,
      completedAt: '2026-02-28T09:00:00Z',
    });
  }
}

seedCompletions();

// ── Query functions ────────────────────────────────────

export function getLessonsByCourse(courseId: string): Lesson[] {
  return lessons.filter((l) => l.courseId === courseId);
}

export function getLessonsByModule(courseId: string, moduleTitle: string): Lesson[] {
  return lessons
    .filter((l) => l.courseId === courseId && l.moduleTitle === moduleTitle)
    .sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function markLessonComplete(studentId: string, lessonId: string): LessonCompletion {
  // Don't double-add
  const existing = completions.find(
    (c) => c.studentId === studentId && c.lessonId === lessonId,
  );
  if (existing) return existing;

  const completion: LessonCompletion = {
    studentId,
    lessonId,
    completedAt: new Date().toISOString(),
  };
  completions.push(completion);
  return completion;
}

export function getCompletedLessons(studentId: string, courseId: string): LessonCompletion[] {
  const courseLessonIds = new Set(
    lessons.filter((l) => l.courseId === courseId).map((l) => l.id),
  );
  return completions.filter(
    (c) => c.studentId === studentId && courseLessonIds.has(c.lessonId),
  );
}

export function isLessonCompleted(studentId: string, lessonId: string): boolean {
  return completions.some(
    (c) => c.studentId === studentId && c.lessonId === lessonId,
  );
}

/**
 * Get all lessons for a course in order (module by module, then by lesson order).
 */
export function getOrderedLessons(courseId: string): Lesson[] {
  const course = getCourseById(courseId);
  if (!course) return [];
  const result: Lesson[] = [];
  for (const mod of course.modules) {
    const modLessons = getLessonsByModule(courseId, mod.title);
    result.push(...modLessons);
  }
  return result;
}

/**
 * Get the next lesson after the current one in course order.
 */
export function getNextLesson(courseId: string, currentLessonId: string): Lesson | null {
  const ordered = getOrderedLessons(courseId);
  const idx = ordered.findIndex((l) => l.id === currentLessonId);
  if (idx === -1 || idx >= ordered.length - 1) return null;
  return ordered[idx + 1];
}

/**
 * Get the previous lesson before the current one in course order.
 */
export function getPrevLesson(courseId: string, currentLessonId: string): Lesson | null {
  const ordered = getOrderedLessons(courseId);
  const idx = ordered.findIndex((l) => l.id === currentLessonId);
  if (idx <= 0) return null;
  return ordered[idx - 1];
}

/**
 * Get the first uncompleted lesson for a student in a course.
 */
export function getNextUncompletedLesson(studentId: string, courseId: string): Lesson | null {
  const ordered = getOrderedLessons(courseId);
  const completedIds = new Set(
    completions
      .filter((c) => c.studentId === studentId)
      .map((c) => c.lessonId),
  );
  return ordered.find((l) => !completedIds.has(l.id)) ?? null;
}

export function markVideoWatched(studentId: string, lessonId: string): void {
  const existing = completions.find(
    (c) => c.studentId === studentId && c.lessonId === lessonId,
  );
  if (existing) {
    existing.watched = true;
  } else {
    completions.push({
      studentId,
      lessonId,
      completedAt: new Date().toISOString(),
      watched: true,
    });
  }
}

export function isVideoWatched(studentId: string, lessonId: string): boolean {
  return completions.some(
    (c) => c.studentId === studentId && c.lessonId === lessonId && c.watched === true,
  );
}

export function updateLesson(lessonId: string, updates: Partial<Pick<Lesson, 'videoUrl' | 'title' | 'content' | 'starterCode'>>): Lesson | undefined {
  const lesson = lessons.find((l) => l.id === lessonId);
  if (lesson) {
    Object.assign(lesson, updates);
  }
  return lesson;
}

export function getLessonProgress(studentId: string, courseId: string): LessonProgress {
  const courseLessons = lessons.filter((l) => l.courseId === courseId);
  const total = courseLessons.length;
  if (total === 0) return { completed: 0, total: 0, percentage: 0 };

  const completedIds = new Set(
    completions
      .filter((c) => c.studentId === studentId)
      .map((c) => c.lessonId),
  );
  const completed = courseLessons.filter((l) => completedIds.has(l.id)).length;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
}
