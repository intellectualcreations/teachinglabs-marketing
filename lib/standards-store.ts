// ─── Standards Store ─────────────────────────────────────────────────────────
// In-memory store for educational standards (Common Core, NGSS, custom imports)

export interface Standard {
  id: string;
  code: string;
  shortCode: string;
  title: string;
  description: string;
  subject: 'Math' | 'ELA' | 'Science' | 'Social Studies';
  gradeLevel: string;
  framework: string;
  domain?: string;
  cluster?: string;
}

export interface StandardsImport {
  id: string;
  name: string;
  framework: string;
  importedAt: string;
  standardCount: number;
}

let nextId = 1;
function genId(): string {
  return `std-${nextId++}`;
}

function makeStandard(
  s: Omit<Standard, 'id'>,
): Standard {
  return { id: genId(), ...s };
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_STANDARDS: Omit<Standard, 'id'>[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — Kindergarten
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.K.CC.A.1', shortCode: 'K.CC.A.1', title: 'Count to 100', description: 'Count to 100 by ones and by tens.', subject: 'Math', gradeLevel: 'K', framework: 'CCSS', domain: 'Counting & Cardinality', cluster: 'Know number names and the count sequence' },
  { code: 'CCSS.MATH.CONTENT.K.CC.A.2', shortCode: 'K.CC.A.2', title: 'Count forward from a given number', description: 'Count forward beginning from a given number within the known sequence.', subject: 'Math', gradeLevel: 'K', framework: 'CCSS', domain: 'Counting & Cardinality', cluster: 'Know number names and the count sequence' },
  { code: 'CCSS.MATH.CONTENT.K.CC.A.3', shortCode: 'K.CC.A.3', title: 'Write numbers 0-20', description: 'Write numbers from 0 to 20. Represent a number of objects with a written numeral 0-20.', subject: 'Math', gradeLevel: 'K', framework: 'CCSS', domain: 'Counting & Cardinality', cluster: 'Know number names and the count sequence' },
  { code: 'CCSS.MATH.CONTENT.K.CC.B.4', shortCode: 'K.CC.B.4', title: 'Understand counting relationship', description: 'Understand the relationship between numbers and quantities; connect counting to cardinality.', subject: 'Math', gradeLevel: 'K', framework: 'CCSS', domain: 'Counting & Cardinality', cluster: 'Count to tell the number of objects' },
  { code: 'CCSS.MATH.CONTENT.K.CC.B.5', shortCode: 'K.CC.B.5', title: 'Count to answer how many', description: 'Count to answer "how many?" questions about as many as 20 things arranged in various configurations.', subject: 'Math', gradeLevel: 'K', framework: 'CCSS', domain: 'Counting & Cardinality', cluster: 'Count to tell the number of objects' },
  { code: 'CCSS.MATH.CONTENT.K.OA.A.1', shortCode: 'K.OA.A.1', title: 'Represent addition and subtraction', description: 'Represent addition and subtraction with objects, fingers, mental images, drawings, sounds, acting out situations, verbal explanations, expressions, or equations.', subject: 'Math', gradeLevel: 'K', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Understand addition as putting together' },
  { code: 'CCSS.MATH.CONTENT.K.OA.A.2', shortCode: 'K.OA.A.2', title: 'Add and subtract within 10', description: 'Solve addition and subtraction word problems, and add and subtract within 10.', subject: 'Math', gradeLevel: 'K', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Understand addition as putting together' },
  { code: 'CCSS.MATH.CONTENT.K.MD.A.1', shortCode: 'K.MD.A.1', title: 'Describe measurable attributes', description: 'Describe measurable attributes of objects, such as length or weight. Describe several measurable attributes of a single object.', subject: 'Math', gradeLevel: 'K', framework: 'CCSS', domain: 'Measurement & Data', cluster: 'Describe and compare measurable attributes' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — Grade 1
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.1.OA.A.1', shortCode: '1.OA.A.1', title: 'Add and subtract within 20', description: 'Use addition and subtraction within 20 to solve word problems involving situations of adding to, taking from, putting together, taking apart, and comparing.', subject: 'Math', gradeLevel: '1', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Represent and solve problems involving addition and subtraction' },
  { code: 'CCSS.MATH.CONTENT.1.OA.B.3', shortCode: '1.OA.B.3', title: 'Apply commutative and associative properties', description: 'Apply properties of operations as strategies to add and subtract.', subject: 'Math', gradeLevel: '1', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Understand and apply properties of operations' },
  { code: 'CCSS.MATH.CONTENT.1.OA.C.6', shortCode: '1.OA.C.6', title: 'Add and subtract within 20 fluently', description: 'Add and subtract within 20, demonstrating fluency for addition and subtraction within 10.', subject: 'Math', gradeLevel: '1', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Add and subtract within 20' },
  { code: 'CCSS.MATH.CONTENT.1.NBT.A.1', shortCode: '1.NBT.A.1', title: 'Count to 120', description: 'Count to 120, starting at any number less than 120. In this range, read and write numerals and represent a number of objects with a written numeral.', subject: 'Math', gradeLevel: '1', framework: 'CCSS', domain: 'Number & Operations in Base Ten', cluster: 'Extend the counting sequence' },
  { code: 'CCSS.MATH.CONTENT.1.NBT.B.2', shortCode: '1.NBT.B.2', title: 'Understand place value (tens and ones)', description: 'Understand that the two digits of a two-digit number represent amounts of tens and ones.', subject: 'Math', gradeLevel: '1', framework: 'CCSS', domain: 'Number & Operations in Base Ten', cluster: 'Understand place value' },
  { code: 'CCSS.MATH.CONTENT.1.MD.A.1', shortCode: '1.MD.A.1', title: 'Order three objects by length', description: 'Order three objects by length; compare the lengths of two objects indirectly by using a third object.', subject: 'Math', gradeLevel: '1', framework: 'CCSS', domain: 'Measurement & Data', cluster: 'Measure lengths indirectly and by iterating length units' },
  { code: 'CCSS.MATH.CONTENT.1.G.A.1', shortCode: '1.G.A.1', title: 'Distinguish defining attributes of shapes', description: 'Distinguish between defining attributes versus non-defining attributes; build and draw shapes to possess defining attributes.', subject: 'Math', gradeLevel: '1', framework: 'CCSS', domain: 'Geometry', cluster: 'Reason with shapes and their attributes' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — Grade 2
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.2.OA.A.1', shortCode: '2.OA.A.1', title: 'Add and subtract within 100', description: 'Use addition and subtraction within 100 to solve one- and two-step word problems.', subject: 'Math', gradeLevel: '2', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Represent and solve problems involving addition and subtraction' },
  { code: 'CCSS.MATH.CONTENT.2.OA.B.2', shortCode: '2.OA.B.2', title: 'Fluently add and subtract within 20', description: 'Fluently add and subtract within 20 using mental strategies. By end of Grade 2, know from memory all sums of two one-digit numbers.', subject: 'Math', gradeLevel: '2', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Add and subtract within 20' },
  { code: 'CCSS.MATH.CONTENT.2.NBT.A.1', shortCode: '2.NBT.A.1', title: 'Understand hundreds, tens, ones', description: 'Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones.', subject: 'Math', gradeLevel: '2', framework: 'CCSS', domain: 'Number & Operations in Base Ten', cluster: 'Understand place value' },
  { code: 'CCSS.MATH.CONTENT.2.NBT.B.5', shortCode: '2.NBT.B.5', title: 'Fluently add and subtract within 100', description: 'Fluently add and subtract within 100 using strategies based on place value, properties of operations, and/or the relationship between addition and subtraction.', subject: 'Math', gradeLevel: '2', framework: 'CCSS', domain: 'Number & Operations in Base Ten', cluster: 'Use place value understanding and properties of operations to add and subtract' },
  { code: 'CCSS.MATH.CONTENT.2.MD.A.1', shortCode: '2.MD.A.1', title: 'Measure length of an object', description: 'Measure the length of an object by selecting and using appropriate tools such as rulers, yardsticks, meter sticks, and measuring tapes.', subject: 'Math', gradeLevel: '2', framework: 'CCSS', domain: 'Measurement & Data', cluster: 'Measure and estimate lengths in standard units' },
  { code: 'CCSS.MATH.CONTENT.2.G.A.1', shortCode: '2.G.A.1', title: 'Recognize and draw shapes', description: 'Recognize and draw shapes having specified attributes, such as a given number of angles or a given number of equal faces.', subject: 'Math', gradeLevel: '2', framework: 'CCSS', domain: 'Geometry', cluster: 'Reason with shapes and their attributes' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — Grade 3
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.3.OA.A.1', shortCode: '3.OA.A.1', title: 'Interpret products of whole numbers', description: 'Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each.', subject: 'Math', gradeLevel: '3', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Represent and solve problems involving multiplication and division' },
  { code: 'CCSS.MATH.CONTENT.3.OA.A.2', shortCode: '3.OA.A.2', title: 'Interpret whole-number quotients', description: 'Interpret whole-number quotients of whole numbers, e.g., interpret 56 ÷ 8 as the number of objects in each share.', subject: 'Math', gradeLevel: '3', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Represent and solve problems involving multiplication and division' },
  { code: 'CCSS.MATH.CONTENT.3.OA.C.7', shortCode: '3.OA.C.7', title: 'Fluently multiply and divide within 100', description: 'Fluently multiply and divide within 100, using strategies such as the relationship between multiplication and division.', subject: 'Math', gradeLevel: '3', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Multiply and divide within 100' },
  { code: 'CCSS.MATH.CONTENT.3.NF.A.1', shortCode: '3.NF.A.1', title: 'Understand a fraction 1/b', description: 'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts.', subject: 'Math', gradeLevel: '3', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Develop understanding of fractions as numbers' },
  { code: 'CCSS.MATH.CONTENT.3.NF.A.2', shortCode: '3.NF.A.2', title: 'Understand fractions on a number line', description: 'Understand a fraction as a number on the number line; represent fractions on a number line diagram.', subject: 'Math', gradeLevel: '3', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Develop understanding of fractions as numbers' },
  { code: 'CCSS.MATH.CONTENT.3.NF.A.3', shortCode: '3.NF.A.3', title: 'Explain equivalence of fractions', description: 'Explain equivalence of fractions in special cases, and compare fractions by reasoning about their size.', subject: 'Math', gradeLevel: '3', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Develop understanding of fractions as numbers' },
  { code: 'CCSS.MATH.CONTENT.3.MD.A.1', shortCode: '3.MD.A.1', title: 'Tell and write time', description: 'Tell and write time to the nearest minute and measure time intervals in minutes.', subject: 'Math', gradeLevel: '3', framework: 'CCSS', domain: 'Measurement & Data', cluster: 'Solve problems involving measurement and estimation of intervals of time' },
  { code: 'CCSS.MATH.CONTENT.3.MD.C.7', shortCode: '3.MD.C.7', title: 'Relate area to multiplication', description: 'Relate area to the operations of multiplication and addition.', subject: 'Math', gradeLevel: '3', framework: 'CCSS', domain: 'Measurement & Data', cluster: 'Geometric measurement: understand concepts of area' },
  { code: 'CCSS.MATH.CONTENT.3.G.A.1', shortCode: '3.G.A.1', title: 'Understand shapes and attributes', description: 'Understand that shapes in different categories may share attributes, and that the shared attributes can define a larger category.', subject: 'Math', gradeLevel: '3', framework: 'CCSS', domain: 'Geometry', cluster: 'Reason with shapes and their attributes' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — Grade 4
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.4.OA.A.1', shortCode: '4.OA.A.1', title: 'Interpret a multiplication equation', description: 'Interpret a multiplication equation as a comparison. Represent verbal statements of multiplicative comparisons as multiplication equations.', subject: 'Math', gradeLevel: '4', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Use the four operations with whole numbers to solve problems' },
  { code: 'CCSS.MATH.CONTENT.4.OA.A.3', shortCode: '4.OA.A.3', title: 'Solve multistep word problems', description: 'Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted.', subject: 'Math', gradeLevel: '4', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Use the four operations with whole numbers to solve problems' },
  { code: 'CCSS.MATH.CONTENT.4.NF.A.1', shortCode: '4.NF.A.1', title: 'Explain fraction equivalence', description: 'Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b) by using visual fraction models.', subject: 'Math', gradeLevel: '4', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Extend understanding of fraction equivalence and ordering' },
  { code: 'CCSS.MATH.CONTENT.4.NF.A.2', shortCode: '4.NF.A.2', title: 'Compare fractions', description: 'Compare two fractions with different numerators and different denominators. Recognize that comparisons are valid only when the two fractions refer to the same whole.', subject: 'Math', gradeLevel: '4', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Extend understanding of fraction equivalence and ordering' },
  { code: 'CCSS.MATH.CONTENT.4.NF.B.3', shortCode: '4.NF.B.3', title: 'Understand fraction addition', description: 'Understand a fraction a/b with a > 1 as a sum of fractions 1/b.', subject: 'Math', gradeLevel: '4', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Build fractions from unit fractions' },
  { code: 'CCSS.MATH.CONTENT.4.NF.B.4', shortCode: '4.NF.B.4', title: 'Multiply fraction by whole number', description: 'Apply and extend previous understandings of multiplication to multiply a fraction by a whole number.', subject: 'Math', gradeLevel: '4', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Build fractions from unit fractions' },
  { code: 'CCSS.MATH.CONTENT.4.NF.C.5', shortCode: '4.NF.C.5', title: 'Express fractions with denominator 10 as 100', description: 'Express a fraction with denominator 10 as an equivalent fraction with denominator 100, and use this technique to add two fractions with respective denominators 10 and 100.', subject: 'Math', gradeLevel: '4', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Understand decimal notation for fractions' },
  { code: 'CCSS.MATH.CONTENT.4.MD.A.1', shortCode: '4.MD.A.1', title: 'Know relative sizes of measurement units', description: 'Know relative sizes of measurement units within one system of units including km, m, cm; kg, g; lb, oz.; l, ml; hr, min, sec.', subject: 'Math', gradeLevel: '4', framework: 'CCSS', domain: 'Measurement & Data', cluster: 'Solve problems involving measurement and conversion of measurements' },
  { code: 'CCSS.MATH.CONTENT.4.G.A.1', shortCode: '4.G.A.1', title: 'Draw and identify geometric figures', description: 'Draw points, lines, line segments, rays, angles (right, acute, obtuse), and perpendicular and parallel lines. Identify these in two-dimensional figures.', subject: 'Math', gradeLevel: '4', framework: 'CCSS', domain: 'Geometry', cluster: 'Draw and identify lines and angles' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — Grade 5
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.5.OA.A.1', shortCode: '5.OA.A.1', title: 'Use grouping symbols in expressions', description: 'Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Write and interpret numerical expressions' },
  { code: 'CCSS.MATH.CONTENT.5.OA.A.2', shortCode: '5.OA.A.2', title: 'Write and interpret expressions', description: 'Write simple expressions that record calculations with numbers, and interpret numerical expressions without evaluating them.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Operations & Algebraic Thinking', cluster: 'Write and interpret numerical expressions' },
  { code: 'CCSS.MATH.CONTENT.5.NBT.A.1', shortCode: '5.NBT.A.1', title: 'Understand place value system', description: 'Recognize that in a multi-digit number, a digit in one place represents 10 times as much as it represents in the place to its right and 1/10 of what it represents in the place to its left.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations in Base Ten', cluster: 'Understand the place value system' },
  { code: 'CCSS.MATH.CONTENT.5.NBT.B.5', shortCode: '5.NBT.B.5', title: 'Fluently multiply multi-digit numbers', description: 'Fluently multiply multi-digit whole numbers using the standard algorithm.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations in Base Ten', cluster: 'Perform operations with multi-digit whole numbers and with decimals to hundredths' },
  { code: 'CCSS.MATH.CONTENT.5.NBT.B.7', shortCode: '5.NBT.B.7', title: 'Operations with decimals', description: 'Add, subtract, multiply, and divide decimals to hundredths, using concrete models or drawings and strategies based on place value, properties of operations, and/or the relationship between addition and subtraction.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations in Base Ten', cluster: 'Perform operations with multi-digit whole numbers and with decimals to hundredths' },
  { code: 'CCSS.MATH.CONTENT.5.NF.A.1', shortCode: '5.NF.A.1', title: 'Add and subtract fractions', description: 'Add and subtract fractions with unlike denominators (including mixed numbers) by replacing given fractions with equivalent fractions.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Use equivalent fractions as a strategy to add and subtract fractions' },
  { code: 'CCSS.MATH.CONTENT.5.NF.A.2', shortCode: '5.NF.A.2', title: 'Solve word problems with fractions', description: 'Solve word problems involving addition and subtraction of fractions referring to the same whole, including cases of unlike denominators.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Use equivalent fractions as a strategy to add and subtract fractions' },
  { code: 'CCSS.MATH.CONTENT.5.NF.B.3', shortCode: '5.NF.B.3', title: 'Interpret fraction as division', description: 'Interpret a fraction as division of the numerator by the denominator (a/b = a ÷ b).', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Apply and extend previous understandings of multiplication and division' },
  { code: 'CCSS.MATH.CONTENT.5.NF.B.4', shortCode: '5.NF.B.4', title: 'Multiply fractions', description: 'Apply and extend previous understandings of multiplication to multiply a fraction or whole number by a fraction.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Apply and extend previous understandings of multiplication and division' },
  { code: 'CCSS.MATH.CONTENT.5.NF.B.5', shortCode: '5.NF.B.5', title: 'Interpret multiplication as scaling', description: 'Interpret multiplication as scaling (resizing) by comparing the size of a product to the size of one factor.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Apply and extend previous understandings of multiplication and division' },
  { code: 'CCSS.MATH.CONTENT.5.NF.B.6', shortCode: '5.NF.B.6', title: 'Multiply fractions in real world', description: 'Solve real world problems involving multiplication of fractions and mixed numbers.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Apply and extend previous understandings of multiplication and division' },
  { code: 'CCSS.MATH.CONTENT.5.NF.B.7', shortCode: '5.NF.B.7', title: 'Divide unit fractions', description: 'Apply and extend previous understandings of division to divide unit fractions by whole numbers and whole numbers by unit fractions.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Number & Operations—Fractions', cluster: 'Apply and extend previous understandings of multiplication and division' },
  { code: 'CCSS.MATH.CONTENT.5.MD.A.1', shortCode: '5.MD.A.1', title: 'Convert measurement units', description: 'Convert among different-sized standard measurement units within a given measurement system, and use these conversions in solving multi-step, real world problems.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Measurement & Data', cluster: 'Convert like measurement units within a given measurement system' },
  { code: 'CCSS.MATH.CONTENT.5.G.A.1', shortCode: '5.G.A.1', title: 'Graph points on coordinate plane', description: 'Use a pair of perpendicular number lines, called axes, to define a coordinate system. Graph points on the coordinate plane to solve real-world and mathematical problems.', subject: 'Math', gradeLevel: '5', framework: 'CCSS', domain: 'Geometry', cluster: 'Graph points on the coordinate plane to solve real-world and mathematical problems' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — Grade 6
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.6.RP.A.1', shortCode: '6.RP.A.1', title: 'Understand ratio concepts', description: 'Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'Ratios & Proportional Relationships', cluster: 'Understand ratio concepts and use ratio reasoning to solve problems' },
  { code: 'CCSS.MATH.CONTENT.6.RP.A.2', shortCode: '6.RP.A.2', title: 'Understand unit rates', description: 'Understand the concept of a unit rate a/b associated with a ratio a:b with b ≠ 0, and use rate language in the context of a ratio relationship.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'Ratios & Proportional Relationships', cluster: 'Understand ratio concepts and use ratio reasoning to solve problems' },
  { code: 'CCSS.MATH.CONTENT.6.RP.A.3', shortCode: '6.RP.A.3', title: 'Use ratio reasoning', description: 'Use ratio and rate reasoning to solve real-world and mathematical problems, e.g., by reasoning about tables of equivalent ratios, tape diagrams, double number line diagrams, or equations.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'Ratios & Proportional Relationships', cluster: 'Understand ratio concepts and use ratio reasoning to solve problems' },
  { code: 'CCSS.MATH.CONTENT.6.NS.A.1', shortCode: '6.NS.A.1', title: 'Divide fractions by fractions', description: 'Interpret and compute quotients of fractions, and solve word problems involving division of fractions by fractions.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'The Number System', cluster: 'Apply and extend previous understandings of multiplication and division to divide fractions by fractions' },
  { code: 'CCSS.MATH.CONTENT.6.NS.C.6', shortCode: '6.NS.C.6', title: 'Understand rational numbers on number line', description: 'Understand a rational number as a point on the number line. Use number line diagrams and coordinate axes.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'The Number System', cluster: 'Apply and extend previous understandings of numbers to the system of rational numbers' },
  { code: 'CCSS.MATH.CONTENT.6.EE.A.1', shortCode: '6.EE.A.1', title: 'Write and evaluate expressions with exponents', description: 'Write and evaluate numerical expressions involving whole-number exponents.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'Expressions & Equations', cluster: 'Apply and extend previous understandings of arithmetic to algebraic expressions' },
  { code: 'CCSS.MATH.CONTENT.6.EE.A.2', shortCode: '6.EE.A.2', title: 'Write and evaluate algebraic expressions', description: 'Write, read, and evaluate expressions in which letters stand for numbers.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'Expressions & Equations', cluster: 'Apply and extend previous understandings of arithmetic to algebraic expressions' },
  { code: 'CCSS.MATH.CONTENT.6.EE.B.7', shortCode: '6.EE.B.7', title: 'Solve one-variable equations', description: 'Solve real-world and mathematical problems by writing and solving equations of the form x + p = q and px = q for cases in which p, q and x are all nonnegative rational numbers.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'Expressions & Equations', cluster: 'Reason about and solve one-variable equations and inequalities' },
  { code: 'CCSS.MATH.CONTENT.6.G.A.1', shortCode: '6.G.A.1', title: 'Find area of polygons', description: 'Find the area of right triangles, other triangles, special quadrilaterals, and polygons by composing into rectangles or decomposing into triangles and other shapes.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'Geometry', cluster: 'Solve real-world and mathematical problems involving area, surface area, and volume' },
  { code: 'CCSS.MATH.CONTENT.6.SP.A.1', shortCode: '6.SP.A.1', title: 'Recognize statistical questions', description: 'Recognize a statistical question as one that anticipates variability in the data related to the question and accounts for it in the answers.', subject: 'Math', gradeLevel: '6', framework: 'CCSS', domain: 'Statistics & Probability', cluster: 'Develop understanding of statistical variability' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — Grade 7
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.7.RP.A.1', shortCode: '7.RP.A.1', title: 'Compute unit rates with fractions', description: 'Compute unit rates associated with ratios of fractions, including ratios of lengths, areas and other quantities measured in like or different units.', subject: 'Math', gradeLevel: '7', framework: 'CCSS', domain: 'Ratios & Proportional Relationships', cluster: 'Analyze proportional relationships and use them to solve real-world and mathematical problems' },
  { code: 'CCSS.MATH.CONTENT.7.RP.A.2', shortCode: '7.RP.A.2', title: 'Recognize proportional relationships', description: 'Recognize and represent proportional relationships between quantities.', subject: 'Math', gradeLevel: '7', framework: 'CCSS', domain: 'Ratios & Proportional Relationships', cluster: 'Analyze proportional relationships and use them to solve real-world and mathematical problems' },
  { code: 'CCSS.MATH.CONTENT.7.NS.A.1', shortCode: '7.NS.A.1', title: 'Add and subtract rational numbers', description: 'Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers; represent addition and subtraction on a horizontal or vertical number line diagram.', subject: 'Math', gradeLevel: '7', framework: 'CCSS', domain: 'The Number System', cluster: 'Apply and extend previous understandings of operations with fractions' },
  { code: 'CCSS.MATH.CONTENT.7.NS.A.2', shortCode: '7.NS.A.2', title: 'Multiply and divide rational numbers', description: 'Apply and extend previous understandings of multiplication and division and of fractions to multiply and divide rational numbers.', subject: 'Math', gradeLevel: '7', framework: 'CCSS', domain: 'The Number System', cluster: 'Apply and extend previous understandings of operations with fractions' },
  { code: 'CCSS.MATH.CONTENT.7.EE.A.1', shortCode: '7.EE.A.1', title: 'Apply properties of operations', description: 'Apply properties of operations as strategies to add, subtract, factor, and expand linear expressions with rational coefficients.', subject: 'Math', gradeLevel: '7', framework: 'CCSS', domain: 'Expressions & Equations', cluster: 'Use properties of operations to generate equivalent expressions' },
  { code: 'CCSS.MATH.CONTENT.7.EE.B.4', shortCode: '7.EE.B.4', title: 'Solve real-world problems with equations', description: 'Use variables to represent quantities in a real-world or mathematical problem, and construct simple equations and inequalities to solve problems.', subject: 'Math', gradeLevel: '7', framework: 'CCSS', domain: 'Expressions & Equations', cluster: 'Solve real-life and mathematical problems using numerical and algebraic expressions and equations' },
  { code: 'CCSS.MATH.CONTENT.7.G.A.1', shortCode: '7.G.A.1', title: 'Solve problems with scale drawings', description: 'Solve problems involving scale drawings of geometric figures, including computing actual lengths and areas from a scale drawing.', subject: 'Math', gradeLevel: '7', framework: 'CCSS', domain: 'Geometry', cluster: 'Draw, construct, and describe geometrical figures and describe the relationships between them' },
  { code: 'CCSS.MATH.CONTENT.7.G.B.4', shortCode: '7.G.B.4', title: 'Area and circumference of circles', description: 'Know the formulas for the area and circumference of a circle and use them to solve problems.', subject: 'Math', gradeLevel: '7', framework: 'CCSS', domain: 'Geometry', cluster: 'Solve real-life and mathematical problems involving angle measure, area, surface area, and volume' },
  { code: 'CCSS.MATH.CONTENT.7.SP.A.1', shortCode: '7.SP.A.1', title: 'Understand sampling', description: 'Understand that statistics can be used to gain information about a population by examining a sample of the population.', subject: 'Math', gradeLevel: '7', framework: 'CCSS', domain: 'Statistics & Probability', cluster: 'Use random sampling to draw inferences about a population' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — Grade 8
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.8.NS.A.1', shortCode: '8.NS.A.1', title: 'Know irrational numbers', description: 'Know that numbers that are not rational are called irrational. Understand informally that every number has a decimal expansion.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'The Number System', cluster: 'Know that there are numbers that are not rational, and approximate them by rational numbers' },
  { code: 'CCSS.MATH.CONTENT.8.EE.A.1', shortCode: '8.EE.A.1', title: 'Properties of integer exponents', description: 'Know and apply the properties of integer exponents to generate equivalent numerical expressions.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Expressions & Equations', cluster: 'Work with radicals and integer exponents' },
  { code: 'CCSS.MATH.CONTENT.8.EE.B.5', shortCode: '8.EE.B.5', title: 'Graph proportional relationships', description: 'Graph proportional relationships, interpreting the unit rate as the slope of the graph. Compare two different proportional relationships represented in different ways.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Expressions & Equations', cluster: 'Understand the connections between proportional relationships, lines, and linear equations' },
  { code: 'CCSS.MATH.CONTENT.8.EE.C.7', shortCode: '8.EE.C.7', title: 'Solve linear equations', description: 'Solve linear equations in one variable.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Expressions & Equations', cluster: 'Analyze and solve linear equations and pairs of simultaneous linear equations' },
  { code: 'CCSS.MATH.CONTENT.8.EE.C.8', shortCode: '8.EE.C.8', title: 'Solve systems of equations', description: 'Analyze and solve pairs of simultaneous linear equations.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Expressions & Equations', cluster: 'Analyze and solve linear equations and pairs of simultaneous linear equations' },
  { code: 'CCSS.MATH.CONTENT.8.F.A.1', shortCode: '8.F.A.1', title: 'Understand functions', description: 'Understand that a function is a rule that assigns to each input exactly one output. The graph of a function is the set of ordered pairs consisting of an input and the corresponding output.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Functions', cluster: 'Define, evaluate, and compare functions' },
  { code: 'CCSS.MATH.CONTENT.8.F.A.2', shortCode: '8.F.A.2', title: 'Compare functions', description: 'Compare properties of two functions each represented in a different way (algebraically, graphically, numerically in tables, or by verbal descriptions).', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Functions', cluster: 'Define, evaluate, and compare functions' },
  { code: 'CCSS.MATH.CONTENT.8.F.B.4', shortCode: '8.F.B.4', title: 'Construct a linear function', description: 'Construct a function to model a linear relationship between two quantities. Determine the rate of change and initial value of the function.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Functions', cluster: 'Use functions to model relationships between quantities' },
  { code: 'CCSS.MATH.CONTENT.8.G.A.1', shortCode: '8.G.A.1', title: 'Understand congruence with transformations', description: 'Verify experimentally the properties of rotations, reflections, and translations.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Geometry', cluster: 'Understand congruence and similarity using physical models, transparencies, or geometry software' },
  { code: 'CCSS.MATH.CONTENT.8.G.B.7', shortCode: '8.G.B.7', title: 'Apply Pythagorean Theorem', description: 'Apply the Pythagorean Theorem to determine unknown side lengths in right triangles in real-world and mathematical problems in two and three dimensions.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Geometry', cluster: 'Understand and apply the Pythagorean Theorem' },
  { code: 'CCSS.MATH.CONTENT.8.SP.A.1', shortCode: '8.SP.A.1', title: 'Construct scatter plots', description: 'Construct and interpret scatter plots for bivariate measurement data to investigate patterns of association between two quantities.', subject: 'Math', gradeLevel: '8', framework: 'CCSS', domain: 'Statistics & Probability', cluster: 'Investigate patterns of association in bivariate data' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE MATH — High School
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.MATH.CONTENT.HSN.RN.A.1', shortCode: 'HSN.RN.A.1', title: 'Explain rational exponents', description: 'Explain how the definition of the meaning of rational exponents follows from extending the properties of integer exponents to those values.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Number & Quantity', cluster: 'Extend the properties of exponents to rational exponents' },
  { code: 'CCSS.MATH.CONTENT.HSN.Q.A.1', shortCode: 'HSN.Q.A.1', title: 'Use units as a way to understand problems', description: 'Use units as a way to understand problems and to guide the solution of multi-step problems; choose and interpret units consistently in formulas.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Number & Quantity', cluster: 'Reason quantitatively and use units to solve problems' },
  { code: 'CCSS.MATH.CONTENT.HSA.SSE.A.1', shortCode: 'HSA.SSE.A.1', title: 'Interpret expressions', description: 'Interpret expressions that represent a quantity in terms of its context.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Algebra', cluster: 'Interpret the structure of expressions' },
  { code: 'CCSS.MATH.CONTENT.HSA.SSE.B.3', shortCode: 'HSA.SSE.B.3', title: 'Choose equivalent forms of expressions', description: 'Choose and produce an equivalent form of an expression to reveal and explain properties of the quantity represented by the expression.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Algebra', cluster: 'Write expressions in equivalent forms to solve problems' },
  { code: 'CCSS.MATH.CONTENT.HSA.CED.A.1', shortCode: 'HSA.CED.A.1', title: 'Create equations in one variable', description: 'Create equations and inequalities in one variable and use them to solve problems.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Algebra', cluster: 'Create equations that describe numbers or relationships' },
  { code: 'CCSS.MATH.CONTENT.HSA.REI.B.3', shortCode: 'HSA.REI.B.3', title: 'Solve linear equations and inequalities', description: 'Solve linear equations and inequalities in one variable, including equations with coefficients represented by letters.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Algebra', cluster: 'Solve equations and inequalities in one variable' },
  { code: 'CCSS.MATH.CONTENT.HSA.REI.D.10', shortCode: 'HSA.REI.D.10', title: 'Graph equations on coordinate plane', description: 'Understand that the graph of an equation in two variables is the set of all its solutions plotted in the coordinate plane.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Algebra', cluster: 'Represent and solve equations and inequalities graphically' },
  { code: 'CCSS.MATH.CONTENT.HSF.IF.A.1', shortCode: 'HSF.IF.A.1', title: 'Understand function notation', description: 'Understand that a function from one set (called the domain) to another set (called the range) assigns to each element of the domain exactly one element of the range.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Functions', cluster: 'Understand the concept of a function and use function notation' },
  { code: 'CCSS.MATH.CONTENT.HSF.IF.B.4', shortCode: 'HSF.IF.B.4', title: 'Interpret key features of graphs', description: 'For a function that models a relationship between two quantities, interpret key features of graphs and tables in terms of the quantities.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Functions', cluster: 'Interpret functions that arise in applications in terms of the context' },
  { code: 'CCSS.MATH.CONTENT.HSF.BF.A.1', shortCode: 'HSF.BF.A.1', title: 'Write a function', description: 'Write a function that describes a relationship between two quantities.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Functions', cluster: 'Build a function that models a relationship between two quantities' },
  { code: 'CCSS.MATH.CONTENT.HSF.LE.A.1', shortCode: 'HSF.LE.A.1', title: 'Distinguish linear and exponential', description: 'Distinguish between situations that can be modeled with linear functions and with exponential functions.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Functions', cluster: 'Construct and compare linear, quadratic, and exponential models and solve problems' },
  { code: 'CCSS.MATH.CONTENT.HSG.CO.A.1', shortCode: 'HSG.CO.A.1', title: 'Know precise geometric definitions', description: 'Know precise definitions of angle, circle, perpendicular line, parallel line, and line segment, based on the undefined notions of point, line, distance along a line, and distance around a circular arc.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Geometry', cluster: 'Experiment with transformations in the plane' },
  { code: 'CCSS.MATH.CONTENT.HSG.SRT.B.5', shortCode: 'HSG.SRT.B.5', title: 'Use congruence and similarity criteria', description: 'Use congruence and similarity criteria for triangles to solve problems and to prove relationships in geometric figures.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Geometry', cluster: 'Prove theorems involving similarity' },
  { code: 'CCSS.MATH.CONTENT.HSS.ID.A.1', shortCode: 'HSS.ID.A.1', title: 'Represent data with plots', description: 'Represent data with plots on the real number line (dot plots, histograms, and box plots).', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Statistics & Probability', cluster: 'Summarize, represent, and interpret data on a single count or measurement variable' },
  { code: 'CCSS.MATH.CONTENT.HSS.ID.B.6', shortCode: 'HSS.ID.B.6', title: 'Represent data on scatter plots', description: 'Represent data on two quantitative variables on a scatter plot, and describe how the variables are related.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Statistics & Probability', cluster: 'Summarize, represent, and interpret data on two categorical and quantitative variables' },
  { code: 'CCSS.MATH.CONTENT.HSS.IC.A.1', shortCode: 'HSS.IC.A.1', title: 'Understand statistics as inference', description: 'Understand statistics as a process for making inferences about population parameters based on a random sample from that population.', subject: 'Math', gradeLevel: 'HS', framework: 'CCSS', domain: 'Statistics & Probability', cluster: 'Understand and evaluate random processes underlying statistical experiments' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Kindergarten
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.K.1', shortCode: 'RL.K.1', title: 'Ask and answer questions about key details', description: 'With prompting and support, ask and answer questions about key details in a text.', subject: 'ELA', gradeLevel: 'K', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RL.K.2', shortCode: 'RL.K.2', title: 'Retell familiar stories', description: 'With prompting and support, retell familiar stories, including key details.', subject: 'ELA', gradeLevel: 'K', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.K.1', shortCode: 'RI.K.1', title: 'Ask and answer questions about informational text', description: 'With prompting and support, ask and answer questions about key details in a text.', subject: 'ELA', gradeLevel: 'K', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.K.1', shortCode: 'W.K.1', title: 'Use drawing and writing for opinions', description: 'Use a combination of drawing, dictating, and writing to compose opinion pieces in which they tell a reader the topic or the name of the book they are writing about and state an opinion or preference about the topic or book.', subject: 'ELA', gradeLevel: 'K', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.K.1', shortCode: 'SL.K.1', title: 'Participate in collaborative conversations', description: 'Participate in collaborative conversations with diverse partners about kindergarten topics and texts with peers and adults in small and larger groups.', subject: 'ELA', gradeLevel: 'K', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.K.1', shortCode: 'L.K.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: 'K', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grade 1
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.1.1', shortCode: 'RL.1.1', title: 'Ask and answer questions about key details', description: 'Ask and answer questions about key details in a text.', subject: 'ELA', gradeLevel: '1', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RL.1.2', shortCode: 'RL.1.2', title: 'Retell stories with key details', description: 'Retell stories, including key details, and demonstrate understanding of their central message or lesson.', subject: 'ELA', gradeLevel: '1', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.1.1', shortCode: 'RI.1.1', title: 'Ask and answer questions about key details', description: 'Ask and answer questions about key details in a text.', subject: 'ELA', gradeLevel: '1', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.1.1', shortCode: 'W.1.1', title: 'Write opinion pieces', description: 'Write opinion pieces in which they introduce the topic or name the book they are writing about, state an opinion, supply a reason for the opinion, and provide some sense of closure.', subject: 'ELA', gradeLevel: '1', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.1.1', shortCode: 'SL.1.1', title: 'Participate in collaborative conversations', description: 'Participate in collaborative conversations with diverse partners about grade 1 topics and texts with peers and adults in small and larger groups.', subject: 'ELA', gradeLevel: '1', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.1.1', shortCode: 'L.1.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '1', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grade 2
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.2.1', shortCode: 'RL.2.1', title: 'Ask and answer questions (who, what, where)', description: 'Ask and answer such questions as who, what, where, when, why, and how to demonstrate understanding of key details in a text.', subject: 'ELA', gradeLevel: '2', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.2.1', shortCode: 'RI.2.1', title: 'Ask and answer questions about informational text', description: 'Ask and answer such questions as who, what, where, when, why, and how to demonstrate understanding of key details in a text.', subject: 'ELA', gradeLevel: '2', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.2.1', shortCode: 'W.2.1', title: 'Write opinion pieces', description: 'Write opinion pieces in which they introduce the topic or book they are writing about, state an opinion, supply reasons that support the opinion, use linking words to connect opinion and reasons, and provide a concluding statement or section.', subject: 'ELA', gradeLevel: '2', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.2.1', shortCode: 'SL.2.1', title: 'Participate in collaborative conversations', description: 'Participate in collaborative conversations with diverse partners about grade 2 topics and texts with peers and adults in small and larger groups.', subject: 'ELA', gradeLevel: '2', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.2.1', shortCode: 'L.2.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '2', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grade 3
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.3.1', shortCode: 'RL.3.1', title: 'Ask and answer questions referring to text', description: 'Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.', subject: 'ELA', gradeLevel: '3', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RL.3.2', shortCode: 'RL.3.2', title: 'Recount stories and determine message', description: 'Recount stories, including fables, folktales, and myths from diverse cultures; determine the central message, lesson, or moral.', subject: 'ELA', gradeLevel: '3', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.3.1', shortCode: 'RI.3.1', title: 'Ask and answer questions about informational text', description: 'Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.', subject: 'ELA', gradeLevel: '3', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.3.1', shortCode: 'W.3.1', title: 'Write opinion pieces on topics', description: 'Write opinion pieces on topics or texts, supporting a point of view with reasons.', subject: 'ELA', gradeLevel: '3', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.W.3.2', shortCode: 'W.3.2', title: 'Write informative/explanatory texts', description: 'Write informative/explanatory texts to examine a topic and convey ideas and information clearly.', subject: 'ELA', gradeLevel: '3', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.3.1', shortCode: 'SL.3.1', title: 'Engage in collaborative discussions', description: 'Engage effectively in a range of collaborative discussions with diverse partners on grade 3 topics and texts, building on others\' ideas and expressing their own clearly.', subject: 'ELA', gradeLevel: '3', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.3.1', shortCode: 'L.3.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '3', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grade 4
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.4.1', shortCode: 'RL.4.1', title: 'Refer to details and examples in text', description: 'Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text.', subject: 'ELA', gradeLevel: '4', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RL.4.2', shortCode: 'RL.4.2', title: 'Determine theme of a story', description: 'Determine a theme of a story, drama, or poem from details in the text; summarize the text.', subject: 'ELA', gradeLevel: '4', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.4.1', shortCode: 'RI.4.1', title: 'Refer to details in informational text', description: 'Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text.', subject: 'ELA', gradeLevel: '4', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.4.1', shortCode: 'W.4.1', title: 'Write opinion pieces', description: 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information.', subject: 'ELA', gradeLevel: '4', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.W.4.2', shortCode: 'W.4.2', title: 'Write informative/explanatory texts', description: 'Write informative/explanatory texts to examine a topic and convey ideas and information clearly.', subject: 'ELA', gradeLevel: '4', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.W.4.3', shortCode: 'W.4.3', title: 'Write narratives', description: 'Write narratives to develop real or imagined experiences or events using effective technique, descriptive details, and clear event sequences.', subject: 'ELA', gradeLevel: '4', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.4.1', shortCode: 'SL.4.1', title: 'Engage in collaborative discussions', description: 'Engage effectively in a range of collaborative discussions with diverse partners on grade 4 topics and texts, building on others\' ideas and expressing their own clearly.', subject: 'ELA', gradeLevel: '4', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.4.1', shortCode: 'L.4.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '4', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grade 5
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.5.1', shortCode: 'RL.5.1', title: 'Quote accurately from text', description: 'Quote accurately from a text and explain what the text says explicitly and when drawing inferences from the text.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RL.5.2', shortCode: 'RL.5.2', title: 'Determine theme of a story', description: 'Determine a theme of a story, drama, or poem from details in the text, including how characters in a story or drama respond to challenges.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RL.5.3', shortCode: 'RL.5.3', title: 'Compare and contrast characters', description: 'Compare and contrast two or more characters, settings, or events in a story or drama, drawing on specific details in the text.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.5.1', shortCode: 'RI.5.1', title: 'Quote accurately from informational text', description: 'Quote accurately from a text and explain what the text says explicitly and when drawing inferences from the text.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.RI.5.2', shortCode: 'RI.5.2', title: 'Determine main ideas', description: 'Determine two or more main ideas of a text and explain how they are supported by key details; summarize the text.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.5.1', shortCode: 'W.5.1', title: 'Write opinion pieces', description: 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.W.5.2', shortCode: 'W.5.2', title: 'Write informative/explanatory texts', description: 'Write informative/explanatory texts to examine a topic and convey ideas and information clearly.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.W.5.3', shortCode: 'W.5.3', title: 'Write narratives', description: 'Write narratives to develop real or imagined experiences or events using effective technique, descriptive details, and clear event sequences.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.5.1', shortCode: 'SL.5.1', title: 'Engage in collaborative discussions', description: 'Engage effectively in a range of collaborative discussions with diverse partners on grade 5 topics and texts, building on others\' ideas and expressing their own clearly.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.5.1', shortCode: 'L.5.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '5', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grade 6
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.6.1', shortCode: 'RL.6.1', title: 'Cite textual evidence', description: 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', subject: 'ELA', gradeLevel: '6', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RL.6.2', shortCode: 'RL.6.2', title: 'Determine theme or central idea', description: 'Determine a theme or central idea of a text and how it is conveyed through particular details; provide a summary of the text distinct from personal opinions or judgments.', subject: 'ELA', gradeLevel: '6', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.6.1', shortCode: 'RI.6.1', title: 'Cite textual evidence for informational text', description: 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', subject: 'ELA', gradeLevel: '6', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.6.1', shortCode: 'W.6.1', title: 'Write arguments', description: 'Write arguments to support claims with clear reasons and relevant evidence.', subject: 'ELA', gradeLevel: '6', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.W.6.2', shortCode: 'W.6.2', title: 'Write informative/explanatory texts', description: 'Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information through the selection, organization, and analysis of relevant content.', subject: 'ELA', gradeLevel: '6', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.6.1', shortCode: 'SL.6.1', title: 'Engage in collaborative discussions', description: 'Engage effectively in a range of collaborative discussions with diverse partners on grade 6 topics, texts, and issues, building on others\' ideas and expressing their own clearly.', subject: 'ELA', gradeLevel: '6', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.6.1', shortCode: 'L.6.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '6', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grade 7
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.7.1', shortCode: 'RL.7.1', title: 'Cite several pieces of textual evidence', description: 'Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', subject: 'ELA', gradeLevel: '7', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.7.1', shortCode: 'RI.7.1', title: 'Cite textual evidence for informational text', description: 'Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', subject: 'ELA', gradeLevel: '7', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.7.1', shortCode: 'W.7.1', title: 'Write arguments', description: 'Write arguments to support claims with clear reasons and relevant evidence.', subject: 'ELA', gradeLevel: '7', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.7.1', shortCode: 'SL.7.1', title: 'Engage in collaborative discussions', description: 'Engage effectively in a range of collaborative discussions with diverse partners on grade 7 topics, texts, and issues, building on others\' ideas and expressing their own clearly.', subject: 'ELA', gradeLevel: '7', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.7.1', shortCode: 'L.7.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '7', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grade 8
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.8.1', shortCode: 'RL.8.1', title: 'Cite strongest textual evidence', description: 'Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text.', subject: 'ELA', gradeLevel: '8', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.8.1', shortCode: 'RI.8.1', title: 'Cite strongest textual evidence', description: 'Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text.', subject: 'ELA', gradeLevel: '8', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.8.1', shortCode: 'W.8.1', title: 'Write arguments', description: 'Write arguments to support claims with clear reasons and relevant evidence.', subject: 'ELA', gradeLevel: '8', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.W.8.2', shortCode: 'W.8.2', title: 'Write informative/explanatory texts', description: 'Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information through the selection, organization, and analysis of relevant content.', subject: 'ELA', gradeLevel: '8', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.8.1', shortCode: 'SL.8.1', title: 'Engage in collaborative discussions', description: 'Engage effectively in a range of collaborative discussions with diverse partners on grade 8 topics, texts, and issues, building on others\' ideas and expressing their own clearly.', subject: 'ELA', gradeLevel: '8', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.8.1', shortCode: 'L.8.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '8', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grades 9-10
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.9-10.1', shortCode: 'RL.9-10.1', title: 'Cite strong and thorough textual evidence', description: 'Cite strong and thorough textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', subject: 'ELA', gradeLevel: '9-10', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RL.9-10.2', shortCode: 'RL.9-10.2', title: 'Determine theme or central idea', description: 'Determine a theme or central idea of a text and analyze in detail its development over the course of the text, including how it emerges and is shaped and refined by specific details.', subject: 'ELA', gradeLevel: '9-10', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.9-10.1', shortCode: 'RI.9-10.1', title: 'Cite textual evidence', description: 'Cite strong and thorough textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', subject: 'ELA', gradeLevel: '9-10', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.9-10.1', shortCode: 'W.9-10.1', title: 'Write arguments', description: 'Write arguments to support claims in an analysis of substantive topics or texts, using valid reasoning and relevant and sufficient evidence.', subject: 'ELA', gradeLevel: '9-10', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.W.9-10.2', shortCode: 'W.9-10.2', title: 'Write informative/explanatory texts', description: 'Write informative/explanatory texts to examine and convey complex ideas, concepts, and information clearly and accurately through the effective selection, organization, and analysis of content.', subject: 'ELA', gradeLevel: '9-10', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.9-10.1', shortCode: 'SL.9-10.1', title: 'Initiate and participate in discussions', description: 'Initiate and participate effectively in a range of collaborative discussions with diverse partners on grades 9-10 topics, texts, and issues, building on others\' ideas and expressing their own clearly and persuasively.', subject: 'ELA', gradeLevel: '9-10', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.9-10.1', shortCode: 'L.9-10.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '9-10', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON CORE ELA — Grades 11-12
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'CCSS.ELA-LITERACY.RL.11-12.1', shortCode: 'RL.11-12.1', title: 'Cite strong textual evidence', description: 'Cite strong and thorough textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text, including determining where the text leaves matters uncertain.', subject: 'ELA', gradeLevel: '11-12', framework: 'CCSS', domain: 'Reading Literature' },
  { code: 'CCSS.ELA-LITERACY.RI.11-12.1', shortCode: 'RI.11-12.1', title: 'Cite strong textual evidence', description: 'Cite strong and thorough textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text, including determining where the text leaves matters uncertain.', subject: 'ELA', gradeLevel: '11-12', framework: 'CCSS', domain: 'Reading Informational Text' },
  { code: 'CCSS.ELA-LITERACY.W.11-12.1', shortCode: 'W.11-12.1', title: 'Write arguments', description: 'Write arguments to support claims in an analysis of substantive topics or texts, using valid reasoning and relevant and sufficient evidence.', subject: 'ELA', gradeLevel: '11-12', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.W.11-12.2', shortCode: 'W.11-12.2', title: 'Write informative/explanatory texts', description: 'Write informative/explanatory texts to examine and convey complex ideas, concepts, and information clearly and accurately through the effective selection, organization, and analysis of content.', subject: 'ELA', gradeLevel: '11-12', framework: 'CCSS', domain: 'Writing' },
  { code: 'CCSS.ELA-LITERACY.SL.11-12.1', shortCode: 'SL.11-12.1', title: 'Initiate and participate in discussions', description: 'Initiate and participate effectively in a range of collaborative discussions with diverse partners on grades 11-12 topics, texts, and issues, building on others\' ideas and expressing their own clearly and persuasively.', subject: 'ELA', gradeLevel: '11-12', framework: 'CCSS', domain: 'Speaking & Listening' },
  { code: 'CCSS.ELA-LITERACY.L.11-12.1', shortCode: 'L.11-12.1', title: 'Demonstrate command of conventions', description: 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', subject: 'ELA', gradeLevel: '11-12', framework: 'CCSS', domain: 'Language' },

  // ═══════════════════════════════════════════════════════════════════════════
  // NGSS — K-2
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'K-PS2-1', shortCode: 'K-PS2-1', title: 'Plan and conduct an investigation on pushes and pulls', description: 'Plan and conduct an investigation to compare the effects of different strengths or different directions of pushes and pulls on the motion of an object.', subject: 'Science', gradeLevel: 'K', framework: 'NGSS', domain: 'Physical Science' },
  { code: 'K-PS2-2', shortCode: 'K-PS2-2', title: 'Analyze data on pushes and pulls', description: 'Analyze data to determine if a design solution works as intended to change the speed or direction of an object with a push or a pull.', subject: 'Science', gradeLevel: 'K', framework: 'NGSS', domain: 'Physical Science' },
  { code: 'K-LS1-1', shortCode: 'K-LS1-1', title: 'Observe patterns of needs of living things', description: 'Use observations to describe patterns of what plants and animals (including humans) need to survive.', subject: 'Science', gradeLevel: 'K', framework: 'NGSS', domain: 'Life Science' },
  { code: 'K-ESS2-1', shortCode: 'K-ESS2-1', title: 'Use a model for weather patterns', description: 'Use and share observations of local weather conditions to describe patterns over time.', subject: 'Science', gradeLevel: 'K', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: 'K-ESS3-1', shortCode: 'K-ESS3-1', title: 'Use a model of living things and their needs', description: 'Use a model to represent the relationship between the needs of different plants and animals (including humans) and the places they live.', subject: 'Science', gradeLevel: 'K', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: '1-PS4-1', shortCode: '1-PS4-1', title: 'Plan and conduct investigations on sound vibrations', description: 'Plan and conduct investigations to provide evidence that vibrating materials can make sound and that sound can make materials vibrate.', subject: 'Science', gradeLevel: '1', framework: 'NGSS', domain: 'Physical Science' },
  { code: '1-LS1-1', shortCode: '1-LS1-1', title: 'Use materials to design a solution for survival', description: 'Use materials to design a solution to a human problem by mimicking how plants and/or animals use their external parts to help them survive, grow, and meet their needs.', subject: 'Science', gradeLevel: '1', framework: 'NGSS', domain: 'Life Science' },
  { code: '1-LS3-1', shortCode: '1-LS3-1', title: 'Patterns in traits of organisms', description: 'Make observations to construct an evidence-based account that young plants and animals are like, but not exactly like, their parents.', subject: 'Science', gradeLevel: '1', framework: 'NGSS', domain: 'Life Science' },
  { code: '1-ESS1-1', shortCode: '1-ESS1-1', title: 'Use observations of the sun, moon, and stars', description: 'Use observations of the sun, moon, and stars to describe patterns that can be predicted.', subject: 'Science', gradeLevel: '1', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: '2-PS1-1', shortCode: '2-PS1-1', title: 'Plan and conduct an investigation on matter', description: 'Plan and conduct an investigation to describe and classify different kinds of materials by their observable properties.', subject: 'Science', gradeLevel: '2', framework: 'NGSS', domain: 'Physical Science' },
  { code: '2-LS2-1', shortCode: '2-LS2-1', title: 'Plan and conduct investigation on plants need', description: 'Plan and conduct an investigation to determine if plants need sunlight and water to grow.', subject: 'Science', gradeLevel: '2', framework: 'NGSS', domain: 'Life Science' },
  { code: '2-LS4-1', shortCode: '2-LS4-1', title: 'Observe organisms in different habitats', description: 'Make observations of plants and animals to compare the diversity of life in different habitats.', subject: 'Science', gradeLevel: '2', framework: 'NGSS', domain: 'Life Science' },
  { code: '2-ESS1-1', shortCode: '2-ESS1-1', title: 'Use information from observations about Earth changes', description: 'Use information from several sources to provide evidence that Earth events can occur quickly or slowly.', subject: 'Science', gradeLevel: '2', framework: 'NGSS', domain: 'Earth & Space Science' },

  // ═══════════════════════════════════════════════════════════════════════════
  // NGSS — Grades 3-5
  // ═══════════════════════════════════════════════════════════════════════════
  { code: '3-PS2-1', shortCode: '3-PS2-1', title: 'Plan investigation on balanced and unbalanced forces', description: 'Plan and conduct an investigation to provide evidence of the effects of balanced and unbalanced forces on the motion of an object.', subject: 'Science', gradeLevel: '3', framework: 'NGSS', domain: 'Physical Science' },
  { code: '3-LS1-1', shortCode: '3-LS1-1', title: 'Develop models of life cycles', description: 'Develop models to describe that organisms have unique and diverse life cycles but all have in common birth, growth, reproduction, and death.', subject: 'Science', gradeLevel: '3', framework: 'NGSS', domain: 'Life Science' },
  { code: '3-LS4-3', shortCode: '3-LS4-3', title: 'Construct argument about traits and survival', description: 'Construct an argument with evidence that in a particular habitat some organisms can survive well, some survive less well, and some cannot survive at all.', subject: 'Science', gradeLevel: '3', framework: 'NGSS', domain: 'Life Science' },
  { code: '3-ESS2-1', shortCode: '3-ESS2-1', title: 'Represent data about weather conditions', description: 'Represent data in tables and graphical displays to describe typical weather conditions expected during a particular season.', subject: 'Science', gradeLevel: '3', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: '4-PS3-1', shortCode: '4-PS3-1', title: 'Use evidence that energy can be transferred', description: 'Use evidence to construct an explanation relating the speed of an object to the energy of that object.', subject: 'Science', gradeLevel: '4', framework: 'NGSS', domain: 'Physical Science' },
  { code: '4-PS4-1', shortCode: '4-PS4-1', title: 'Develop model of waves', description: 'Develop a model of waves to describe patterns in terms of amplitude and wavelength and that waves can cause objects to move.', subject: 'Science', gradeLevel: '4', framework: 'NGSS', domain: 'Physical Science' },
  { code: '4-LS1-1', shortCode: '4-LS1-1', title: 'Construct argument about internal and external structures', description: 'Construct an argument that plants and animals have internal and external structures that function to support survival, growth, behavior, and reproduction.', subject: 'Science', gradeLevel: '4', framework: 'NGSS', domain: 'Life Science' },
  { code: '4-ESS1-1', shortCode: '4-ESS1-1', title: 'Identify evidence from patterns in rock formations', description: 'Identify evidence from patterns in rock formations and fossils in rock layers to support an explanation for changes in a landscape over time.', subject: 'Science', gradeLevel: '4', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: '5-PS1-1', shortCode: '5-PS1-1', title: 'Develop a model for matter as particles', description: 'Develop a model to describe that matter is made of particles too small to be seen.', subject: 'Science', gradeLevel: '5', framework: 'NGSS', domain: 'Physical Science' },
  { code: '5-PS1-2', shortCode: '5-PS1-2', title: 'Measure and graph quantities of matter', description: 'Measure and graph quantities to provide evidence that regardless of the type of change that occurs when heating, cooling, or mixing substances, the total weight of matter is conserved.', subject: 'Science', gradeLevel: '5', framework: 'NGSS', domain: 'Physical Science' },
  { code: '5-LS1-1', shortCode: '5-LS1-1', title: 'Support argument that plants get materials from water and air', description: 'Support an argument that plants get the materials they need for growth chiefly from air and water.', subject: 'Science', gradeLevel: '5', framework: 'NGSS', domain: 'Life Science' },
  { code: '5-LS2-1', shortCode: '5-LS2-1', title: 'Develop a model of food web movement of matter', description: 'Develop a model to describe the movement of matter among plants, animals, decomposers, and the environment.', subject: 'Science', gradeLevel: '5', framework: 'NGSS', domain: 'Life Science' },
  { code: '5-ESS1-1', shortCode: '5-ESS1-1', title: 'Support argument about star brightness and distance', description: 'Support an argument that differences in the apparent brightness of the sun compared to other stars is due to their relative distances from Earth.', subject: 'Science', gradeLevel: '5', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: '5-ESS2-1', shortCode: '5-ESS2-1', title: 'Develop model of water cycle', description: 'Develop a model using an example to describe ways the geosphere, biosphere, hydrosphere, and/or atmosphere interact.', subject: 'Science', gradeLevel: '5', framework: 'NGSS', domain: 'Earth & Space Science' },

  // ═══════════════════════════════════════════════════════════════════════════
  // NGSS — Middle School
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'MS-PS1-1', shortCode: 'MS-PS1-1', title: 'Develop models of atomic composition', description: 'Develop models to describe the atomic composition of simple molecules and extended structures.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Physical Science' },
  { code: 'MS-PS1-2', shortCode: 'MS-PS1-2', title: 'Analyze and interpret data on substance properties', description: 'Analyze and interpret data on the properties of substances before and after the substances interact to determine if a chemical reaction has occurred.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Physical Science' },
  { code: 'MS-PS2-1', shortCode: 'MS-PS2-1', title: 'Apply Newton\'s Third Law', description: 'Apply Newton\'s Third Law to design a solution to a problem involving the motion of two colliding objects.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Physical Science' },
  { code: 'MS-PS2-2', shortCode: 'MS-PS2-2', title: 'Plan investigation of Newton\'s Second Law', description: 'Plan an investigation to provide evidence that the change in an object\'s motion depends on the sum of the forces acting on the object and the mass of the object.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Physical Science' },
  { code: 'MS-LS1-1', shortCode: 'MS-LS1-1', title: 'Conduct investigation on unicellular vs multicellular', description: 'Conduct an investigation to provide evidence that living things are made of cells; either one cell or many different numbers and types of cells.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Life Science' },
  { code: 'MS-LS1-2', shortCode: 'MS-LS1-2', title: 'Develop and use a model of cell function', description: 'Develop and use a model to describe the function of a cell as a whole and ways the parts of cells contribute to the function.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Life Science' },
  { code: 'MS-LS1-5', shortCode: 'MS-LS1-5', title: 'Construct explanation for environmental effects on organisms', description: 'Construct a scientific explanation based on evidence for how environmental and genetic factors influence the growth of organisms.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Life Science' },
  { code: 'MS-LS3-1', shortCode: 'MS-LS3-1', title: 'Develop model for why mutations may be harmful', description: 'Develop and use a model to describe why structural changes to genes (mutations) located on chromosomes may affect proteins and may result in harmful, beneficial, or neutral effects to the structure and function of the organism.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Life Science' },
  { code: 'MS-ESS1-1', shortCode: 'MS-ESS1-1', title: 'Develop and use a model of Earth-Sun-Moon system', description: 'Develop and use a model of the Earth-sun-moon system to describe the cyclic patterns of lunar phases, eclipses of the sun and moon, and seasons.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: 'MS-ESS2-1', shortCode: 'MS-ESS2-1', title: 'Develop a model for cycling of Earth materials', description: 'Develop a model to describe the cycling of Earth\'s materials and the flow of energy that drives this process.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: 'MS-ESS3-3', shortCode: 'MS-ESS3-3', title: 'Apply scientific principles on monitoring human impact', description: 'Apply scientific principles to design a method for monitoring and minimizing a human impact on the environment.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: 'MS-ETS1-1', shortCode: 'MS-ETS1-1', title: 'Define criteria and constraints of a design problem', description: 'Define the criteria and constraints of a design problem with sufficient precision to ensure a successful solution, taking into account relevant scientific principles and potential impacts on people and the natural environment.', subject: 'Science', gradeLevel: 'MS', framework: 'NGSS', domain: 'Engineering' },

  // ═══════════════════════════════════════════════════════════════════════════
  // NGSS — High School
  // ═══════════════════════════════════════════════════════════════════════════
  { code: 'HS-PS1-1', shortCode: 'HS-PS1-1', title: 'Use the periodic table to predict properties', description: 'Use the periodic table as a model to predict the relative properties of elements based on the patterns of electrons in the outermost energy level of atoms.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Physical Science' },
  { code: 'HS-PS1-2', shortCode: 'HS-PS1-2', title: 'Construct explanation for outcomes of chemical reactions', description: 'Construct and revise an explanation for the outcome of a simple chemical reaction based on the outermost electron states of atoms, trends in the periodic table, and knowledge of the patterns of chemical properties.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Physical Science' },
  { code: 'HS-PS2-1', shortCode: 'HS-PS2-1', title: 'Analyze data to support Newton\'s Second Law', description: 'Analyze data to support the claim that Newton\'s second law of motion describes the mathematical relationship among the net force on a macroscopic object, its mass, and its acceleration.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Physical Science' },
  { code: 'HS-LS1-1', shortCode: 'HS-LS1-1', title: 'Construct explanation of role of DNA', description: 'Construct an explanation based on evidence for how the structure of DNA determines the structure of proteins which carry out the essential functions of life through systems of specialized cells.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Life Science' },
  { code: 'HS-LS1-2', shortCode: 'HS-LS1-2', title: 'Develop model of cell division', description: 'Develop and use a model to illustrate the hierarchical organization of interacting systems that provide specific functions within multicellular organisms.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Life Science' },
  { code: 'HS-LS2-1', shortCode: 'HS-LS2-1', title: 'Use mathematical representations of ecosystem', description: 'Use mathematical and/or computational representations to support explanations of factors that affect carrying capacity of ecosystems at different scales.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Life Science' },
  { code: 'HS-LS4-1', shortCode: 'HS-LS4-1', title: 'Communicate scientific information about common ancestry', description: 'Communicate scientific information that common ancestry and biological evolution are supported by multiple lines of empirical evidence.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Life Science' },
  { code: 'HS-ESS1-1', shortCode: 'HS-ESS1-1', title: 'Develop model of life span of the sun', description: 'Develop a model based on evidence to illustrate the life span of the sun and the role of nuclear fusion in the sun\'s core to release energy that eventually transfers to Earth in the form of radiation.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: 'HS-ESS2-1', shortCode: 'HS-ESS2-1', title: 'Develop model of Earth\'s interior', description: 'Develop a model to illustrate how Earth\'s internal and surface processes operate at different spatial and temporal scales to form continental and ocean-floor features.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: 'HS-ESS3-1', shortCode: 'HS-ESS3-1', title: 'Construct explanation about management of natural resources', description: 'Construct an explanation based on evidence for how the availability of natural resources, occurrence of natural hazards, and changes in climate have influenced human activity.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Earth & Space Science' },
  { code: 'HS-ETS1-1', shortCode: 'HS-ETS1-1', title: 'Analyze major global challenge', description: 'Analyze a major global challenge to specify qualitative and quantitative criteria and constraints for solutions that account for societal needs and wants.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Engineering' },
  { code: 'HS-ETS1-2', shortCode: 'HS-ETS1-2', title: 'Design solution to complex real-world problem', description: 'Design a solution to a complex real-world problem by breaking it down into smaller, more manageable problems that can be solved through engineering.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Engineering' },
  { code: 'HS-ETS1-3', shortCode: 'HS-ETS1-3', title: 'Evaluate solution to complex real-world problem', description: 'Evaluate a solution to a complex real-world problem based on prioritized criteria and trade-offs that account for a range of constraints, including cost, safety, reliability, and aesthetics, as well as possible social, cultural, and environmental impacts.', subject: 'Science', gradeLevel: 'HS', framework: 'NGSS', domain: 'Engineering' },
];

// ─── Store State ─────────────────────────────────────────────────────────────

const standards: Standard[] = SEED_STANDARDS.map((s) => makeStandard(s));
const importHistory: StandardsImport[] = [
  {
    id: 'import-seed',
    name: 'Common Core + NGSS (built-in)',
    framework: 'CCSS, NGSS',
    importedAt: new Date().toISOString(),
    standardCount: standards.length,
  },
];

// ─── Exports ─────────────────────────────────────────────────────────────────

export function getAllStandards(): Standard[] {
  return standards;
}

export function searchStandards(
  query: string,
  filters?: { subject?: string; gradeLevel?: string; framework?: string },
): Standard[] {
  const q = query.toLowerCase().trim();
  return standards.filter((s) => {
    // Apply filters first
    if (filters?.subject && s.subject !== filters.subject) return false;
    if (filters?.gradeLevel && s.gradeLevel !== filters.gradeLevel) return false;
    if (filters?.framework && s.framework !== filters.framework) return false;

    // If no search query, return all that match filters
    if (!q) return true;

    // Search across multiple fields
    return (
      s.code.toLowerCase().includes(q) ||
      s.shortCode.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.domain && s.domain.toLowerCase().includes(q)) ||
      (s.cluster && s.cluster.toLowerCase().includes(q))
    );
  });
}

export function getStandardById(id: string): Standard | undefined {
  return standards.find((s) => s.id === id);
}

export function getStandardsByIds(ids: string[]): Standard[] {
  const idSet = new Set(ids);
  return standards.filter((s) => idSet.has(s.id));
}

export function getSubjects(): string[] {
  return [...new Set(standards.map((s) => s.subject))].sort();
}

export function getGradeLevels(): string[] {
  const gradeOrder: Record<string, number> = {
    'K': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9-10': 9, '11-12': 11, 'MS': 7, 'HS': 13,
  };
  return [...new Set(standards.map((s) => s.gradeLevel))].sort(
    (a, b) => (gradeOrder[a] ?? 99) - (gradeOrder[b] ?? 99),
  );
}

export function getFrameworks(): string[] {
  return [...new Set(standards.map((s) => s.framework))].sort();
}

export function getDomains(subject: string): string[] {
  return [
    ...new Set(
      standards.filter((s) => s.subject === subject && s.domain).map((s) => s.domain!),
    ),
  ].sort();
}

export function importStandards(
  incoming: Omit<Standard, 'id'>[],
): { imported: number; framework: string } {
  const framework = incoming[0]?.framework ?? 'Custom';
  for (const s of incoming) {
    standards.push(makeStandard(s));
  }
  importHistory.push({
    id: `import-${Date.now()}`,
    name: `${framework} import`,
    framework,
    importedAt: new Date().toISOString(),
    standardCount: incoming.length,
  });
  return { imported: incoming.length, framework };
}

export function getImportHistory(): StandardsImport[] {
  return importHistory;
}
