const express = require('express');
const { dbAdapter } = require('../db/database');
const { requireRegisteredUser } = require('../middleware/auth');

const router = express.Router();

// Get All Subjects (Publicly accessible metadata for dashboard & curriculum guides)
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await dbAdapter.queryAll('SELECT * FROM subjects WHERE grade = 3 ORDER BY name ASC');
    
    // Enrich with topic and question counts concurrently
    const enriched = await Promise.all(subjects.map(async sub => {
      const topicCount = await dbAdapter.queryOne(
        'SELECT COUNT(*) as count FROM topics WHERE subject_id = ?',
        [sub.id]
      );
      const questionCount = await dbAdapter.queryOne(
        'SELECT COUNT(*) as count FROM questions WHERE subject_id = ? AND is_olympiad = 0',
        [sub.id]
      );
      return {
        ...sub,
        topic_count: topicCount ? parseInt(topicCount.count, 10) : 0,
        question_count: questionCount ? parseInt(questionCount.count, 10) : 0
      };
    }));

    res.json({ subjects: enriched });
  } catch (err) {
    console.error('Fetch subjects error:', err);
    res.status(500).json({ error: 'Failed to load subjects' });
  }
});

// Get Topics for a Subject (Registration Required)
router.get('/topics/:subjectId', requireRegisteredUser, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await dbAdapter.queryOne('SELECT * FROM subjects WHERE id = ?', [subjectId]);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const topics = await dbAdapter.queryAll(
      'SELECT * FROM topics WHERE subject_id = ? ORDER BY order_num ASC',
      [subjectId]
    );

    const enrichedTopics = await Promise.all(topics.map(async topic => {
      const qCount = await dbAdapter.queryOne(
        'SELECT COUNT(*) as count FROM questions WHERE topic_id = ? AND is_olympiad = 0',
        [topic.id]
      );
      const lesson = await dbAdapter.queryOne(
        'SELECT id, title FROM lessons WHERE topic_id = ?',
        [topic.id]
      );

      return {
        ...topic,
        key_rules: topic.key_rules ? JSON.parse(topic.key_rules) : [],
        question_count: qCount ? parseInt(qCount.count, 10) : 0,
        has_lesson: !!lesson,
        lesson_id: lesson ? lesson.id : null
      };
    }));

    res.json({
      subject,
      topics: enrichedTopics
    });
  } catch (err) {
    console.error('Fetch topics error:', err);
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

// Get Lesson Details for a Topic (Registration Required)
router.get('/lesson/:topicId', requireRegisteredUser, async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await dbAdapter.queryOne('SELECT * FROM topics WHERE id = ?', [topicId]);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const lesson = await dbAdapter.queryOne('SELECT * FROM lessons WHERE topic_id = ?', [topicId]);
    const subject = await dbAdapter.queryOne('SELECT id, name, icon, color FROM subjects WHERE id = ?', [topic.subject_id]);

    res.json({
      topic: {
        ...topic,
        key_rules: topic.key_rules ? JSON.parse(topic.key_rules) : []
      },
      subject,
      lesson: lesson ? {
        ...lesson,
        examples: lesson.examples_json ? JSON.parse(lesson.examples_json) : []
      } : null
    });
  } catch (err) {
    console.error('Fetch lesson error:', err);
    res.status(500).json({ error: 'Failed to load lesson' });
  }
});

// Get Olympiad Exam list (Registration Required)
router.get('/olympiads', requireRegisteredUser, async (req, res) => {
  try {
    const requestedGrade = req.query.grade ? parseInt(req.query.grade, 10) : null;
    const exams = requestedGrade
      ? await dbAdapter.queryAll('SELECT * FROM olympiad_exams WHERE grade = ? ORDER BY grade ASC, id ASC', [requestedGrade])
      : await dbAdapter.queryAll('SELECT * FROM olympiad_exams ORDER BY grade ASC, id ASC');
    const enriched = await Promise.all(exams.map(async exam => {
      const subject = await dbAdapter.queryOne('SELECT name, icon, color FROM subjects WHERE id = ?', [exam.subject_id]);
      return {
        ...exam,
        subject,
        sections: exam.sections_json ? JSON.parse(exam.sections_json) : []
      };
    }));

    res.json({ olympiads: enriched });
  } catch (err) {
    console.error('Fetch olympiads error:', err);
    res.status(500).json({ error: 'Failed to load Olympiad exams' });
  }
});

// Hierarchical Standards & Curriculum Matrix (Class III through Class X)
const curriculumMatrix = {
  3: {
    grade: 3,
    title: 'Class III (Primary Foundation)',
    tagline: 'Foundational Numeracy, Expressive English & Mental Calculation',
    subjects: [
      {
        id: 'math-class3',
        name: 'Mathematics',
        icon: '📐',
        color: '#10B981',
        chapters: [
          { id: 'math-numbers', title: 'Numbers & Place Value (Up to 4 Digits)', units: 4, hours: 6 },
          { id: 'math-addition-subtraction', title: 'Addition & Subtraction with Regrouping', units: 3, hours: 5 },
          { id: 'math-multiplication', title: 'Multiplication & Tables (2 to 12)', units: 4, hours: 6 },
          { id: 'math-division', title: 'Division & Equal Sharing', units: 3, hours: 5 },
          { id: 'math-fractions', title: 'Fractions: Halves, Thirds, Quarters', units: 3, hours: 4 },
          { id: 'math-shapes-patterns', title: 'Geometry: 2D/3D Shapes & Spatial Symmetry', units: 3, hours: 4 },
          { id: 'math-measurement', title: 'Measurement: Length, Weight, Capacity', units: 3, hours: 4 },
          { id: 'math-time-money', title: 'Time, Calendar & Currency Operations', units: 3, hours: 4 }
        ]
      },
      {
        id: 'science-class3',
        name: 'Science',
        icon: '🔬',
        color: '#258F80',
        chapters: [
          { id: 'sci3-living-nonliving', title: 'Living & Non-Living Things', units: 3, hours: 4 },
          { id: 'sci3-plants', title: 'Parts of Plants & Photosynthesis Basics', units: 3, hours: 4 },
          { id: 'sci3-animals', title: 'Animal Habitats & Feeding Habits', units: 3, hours: 4 },
          { id: 'sci3-body', title: 'Human Organ Systems & Personal Hygiene', units: 3, hours: 4 }
        ]
      },
      {
        id: 'english-class3',
        name: 'English',
        icon: '📖',
        color: '#8B5CF6',
        chapters: [
          { id: 'eng-magic-garden', title: 'The Magic Garden & Nature Legends', units: 3, hours: 4 },
          { id: 'eng-bird-talk', title: 'Bird Talk: Poetry & Prosody', units: 2, hours: 3 },
          { id: 'eng-enormous-turnip', title: 'The Enormous Turnip & Teamwork', units: 3, hours: 4 },
          { id: 'eng-sea-song', title: 'Sea Song & Shell Wonders', units: 2, hours: 3 },
          { id: 'eng-little-fish', title: 'A Little Fish Story & Self-Worth', units: 3, hours: 4 }
        ]
      },
      {
        id: 'grammar-class3',
        name: 'English Grammar',
        icon: '✍️',
        color: '#3B82F6',
        chapters: [
          { id: 'gram-nouns', title: 'Nouns: Common, Proper, Collective & Gender', units: 4, hours: 5 },
          { id: 'gram-pronouns', title: 'Pronouns: Personal, Demonstrative & Relative', units: 3, hours: 4 },
          { id: 'gram-verbs-tenses', title: 'Action Verbs & Simple Present/Past Tense', units: 4, hours: 6 },
          { id: 'gram-adjectives', title: 'Describing Words & Degrees of Comparison', units: 3, hours: 4 },
          { id: 'gram-punctuation', title: 'Punctuation, Capitalization & Direct Speech', units: 3, hours: 3 },
          { id: 'gram-prepositions', title: 'Prepositions of Time, Place & Movement', units: 3, hours: 4 }
        ]
      },
      {
        id: 'vedic-class3',
        name: 'Vedic Mathematics',
        icon: '⚡',
        color: '#F59E0B',
        chapters: [
          { id: 'vedic-ekadhikena', title: 'Ekadhikena Purvena: Squaring Numbers ending in 5', units: 2, hours: 3 },
          { id: 'vedic-nikhilam', title: 'Nikhilam: Subtraction from Base 10, 100, 1000', units: 2, hours: 3 },
          { id: 'vedic-urdhva', title: 'Urdhva-Tiryagbhyam: 2-Digit Lightning Cross-Multiplication', units: 3, hours: 4 }
        ]
      }
    ]
  },
  4: {
    grade: 4,
    title: 'Class IV (Elementary Reasoning)',
    tagline: '5-Digit Operations, Syntax Mastery & Environmental Science',
    subjects: [
      {
        id: 'math-class4',
        name: 'Mathematics',
        icon: '📐',
        color: '#10B981',
        chapters: [
          { id: 'math4-large-num', title: 'Large Numbers (5-Digit Systems & Indian/International Periods)', units: 4, hours: 6 },
          { id: 'math4-factors-multiples', title: 'Factors, Multiples, Prime & Composite Numbers', units: 4, hours: 5 },
          { id: 'math4-fractions-decimals', title: 'Fraction Operations & Introduction to Decimals', units: 4, hours: 6 },
          { id: 'math4-geometry', title: 'Angles: Acute, Right, Obtuse & Circle Geometry', units: 3, hours: 4 }
        ]
      },
      {
        id: 'science-class4',
        name: 'Science',
        icon: '🔬',
        color: '#258F80',
        chapters: [
          { id: 'sci4-adaptations', title: 'Plant & Animal Habitats and Adaptations', units: 3, hours: 4 },
          { id: 'sci4-matter', title: 'States of Matter: Solids, Liquids & Gases', units: 3, hours: 4 },
          { id: 'sci4-energy', title: 'Force, Work & Energy Transformation', units: 3, hours: 4 }
        ]
      },
      {
        id: 'english-class4',
        name: 'English',
        icon: '📖',
        color: '#8B5CF6',
        chapters: [
          { id: 'eng4-wake-up', title: 'Wake Up! & Nature Morning Rhythms', units: 2, hours: 3 },
          { id: 'eng4-nehas-alarm', title: 'Nehas Alarm Clock & Self-Discipline', units: 3, hours: 4 },
          { id: 'eng4-noses', title: 'Noses & Humorous Perspectives', units: 2, hours: 3 }
        ]
      },
      {
        id: 'grammar-class4',
        name: 'English Grammar',
        icon: '✍️',
        color: '#3B82F6',
        chapters: [
          { id: 'gram4-tenses-continuous', title: 'Continuous & Perfect Tense Formations', units: 4, hours: 6 },
          { id: 'gram4-adverbs', title: 'Adverbs of Manner, Time, Frequency & Degree', units: 3, hours: 4 },
          { id: 'gram4-conjunctions', title: 'Conjunctions: Coordinating & Subordinating', units: 3, hours: 4 }
        ]
      },
      {
        id: 'vedic-class4',
        name: 'Vedic Mathematics',
        icon: '⚡',
        color: '#F59E0B',
        chapters: [
          { id: 'vedic4-paravartya', title: 'Paravartya Yojayet: Transpose and Apply Mental Division', units: 3, hours: 4 },
          { id: 'vedic4-base-mult', title: 'Multiplication Near Bases (98 × 97 in 3 Seconds)', units: 3, hours: 4 }
        ]
      }
    ]
  },
  5: {
    grade: 5,
    title: 'Class V (Pre-Middle Excellence)',
    tagline: 'Percentages, Decimals, Advanced Logic & Science Inquiry',
    subjects: [
      {
        id: 'math-class5',
        name: 'Mathematics',
        icon: '📐',
        color: '#10B981',
        chapters: [
          { id: 'math5-fish-tale', title: 'Large Numbers & Speed-Distance-Time Relations', units: 4, hours: 6 },
          { id: 'math5-shapes-angles', title: 'Angles, Rotations, Degrees & Reflections', units: 3, hours: 5 },
          { id: 'math5-parts-wholes', title: 'Fractions, Decimals & Percentage Equivalents', units: 4, hours: 6 },
          { id: 'math5-boxes-sketches', title: 'Perimeter, Area & Volume of Cubes/Cuboids', units: 3, hours: 5 }
        ]
      },
      {
        id: 'science-class5',
        name: 'Science',
        icon: '🔬',
        color: '#258F80',
        chapters: [
          { id: 'sci5-germination', title: 'Growing Plants & Seed Germination', units: 3, hours: 4 },
          { id: 'sci5-systems', title: 'Skeletal & Nervous Organ Systems', units: 4, hours: 5 },
          { id: 'sci5-machines', title: 'Simple Machines & Mechanical Advantage', units: 3, hours: 4 }
        ]
      },
      {
        id: 'english-class5',
        name: 'English',
        icon: '📖',
        color: '#8B5CF6',
        chapters: [
          { id: 'eng5-ice-cream', title: 'Ice-Cream Man & Sensory Descriptive Writing', units: 2, hours: 3 },
          { id: 'eng5-wonderful-waste', title: 'Wonderful Waste & The Avial Culinary Heritage', units: 3, hours: 4 },
          { id: 'eng5-teamwork', title: 'Teamwork & Collaborative Success', units: 2, hours: 3 }
        ]
      },
      {
        id: 'grammar-class5',
        name: 'English Grammar',
        icon: '✍️',
        color: '#3B82F6',
        chapters: [
          { id: 'gram5-voice', title: 'Active and Passive Voice Foundations', units: 4, hours: 5 },
          { id: 'gram5-direct-indirect', title: 'Reported Speech: Statements & Inquiries', units: 4, hours: 6 },
          { id: 'gram5-comprehension', title: 'Analytical Reading Comprehension & Inference', units: 4, hours: 5 }
        ]
      },
      {
        id: 'vedic-class5',
        name: 'Vedic Mathematics',
        icon: '⚡',
        color: '#F59E0B',
        chapters: [
          { id: 'vedic5-vinculum', title: 'Vinculum Numbers: Eliminating Carries and Borrows', units: 3, hours: 4 },
          { id: 'vedic5-squaring-any', title: 'Duplex (Dvandva Yoga) Method for Any 2-Digit Square', units: 3, hours: 4 }
        ]
      }
    ]
  },
  6: {
    grade: 6,
    title: 'Class VI (Middle School Foundation)',
    tagline: 'Integers, Algebra Primer, Syntax & Scientific Method',
    subjects: [
      {
        id: 'math-class6',
        name: 'Mathematics',
        icon: '📐',
        color: '#10B981',
        chapters: [
          { id: 'math6-integers', title: 'Integers & Number Line Operations', units: 4, hours: 6 },
          { id: 'math6-algebra', title: 'Introduction to Algebra & Variables', units: 4, hours: 6 },
          { id: 'math6-ratio', title: 'Ratio, Proportion & Unitary Method', units: 3, hours: 5 },
          { id: 'math6-mensuration', title: 'Mensuration: Perimeter & Area of Polygons', units: 3, hours: 5 }
        ]
      },
      {
        id: 'science-class6',
        name: 'Science',
        icon: '🔬',
        color: '#258F80',
        chapters: [
          { id: 'sci6-food', title: 'Components of Food & Dietary Balance', units: 3, hours: 4 },
          { id: 'sci6-electricity', title: 'Electricity & Electrical Circuits', units: 4, hours: 5 },
          { id: 'sci6-light', title: 'Light, Shadows & Reflections', units: 3, hours: 4 }
        ]
      },
      {
        id: 'english-class6',
        name: 'English',
        icon: '📖',
        color: '#8B5CF6',
        chapters: [
          { id: 'eng6-patricks-hw', title: 'Who Did Patricks Homework?', units: 3, hours: 4 },
          { id: 'eng6-how-dog-found-master', title: 'How the Dog Found Himself a New Master', units: 3, hours: 4 }
        ]
      },
      {
        id: 'grammar-class6',
        name: 'English Grammar',
        icon: '✍️',
        color: '#3B82F6',
        chapters: [
          { id: 'gram6-clauses', title: 'Main & Subordinate Clauses', units: 4, hours: 5 },
          { id: 'gram6-modals', title: 'Modals: Can, Could, May, Might, Must, Ought to', units: 3, hours: 4 }
        ]
      },
      {
        id: 'vedic-class6',
        name: 'Vedic Mathematics',
        icon: '⚡',
        color: '#F59E0B',
        chapters: [
          { id: 'vedic6-3digit-mult', title: '3-Digit × 3-Digit Vertical & Crosswise Multiplication', units: 3, hours: 5 },
          { id: 'vedic6-divisibility', title: 'Osculator (Ekadhika) Fast Divisibility Tests for Primes', units: 3, hours: 4 }
        ]
      }
    ]
  },
  7: {
    grade: 7,
    title: 'Class VII (Middle School Rigor)',
    tagline: 'Rational Numbers, Linear Equations, Scientific Rigor',
    subjects: [
      {
        id: 'math-class7',
        name: 'Mathematics',
        icon: '📐',
        color: '#10B981',
        chapters: [
          { id: 'math7-rational-nums', title: 'Rational Numbers & Arithmetic Laws', units: 4, hours: 6 },
          { id: 'math7-simple-equations', title: 'Simple Equations & Transposition Rules', units: 4, hours: 6 },
          { id: 'math7-triangles', title: 'The Triangle & Its Properties (Pythagoras Theorem)', units: 4, hours: 5 }
        ]
      },
      {
        id: 'science-class7',
        name: 'Science',
        icon: '🔬',
        color: '#258F80',
        chapters: [
          { id: 'sci7-nutrition', title: 'Nutrition in Plants & Animals', units: 4, hours: 5 },
          { id: 'sci7-heat', title: 'Heat & Temperature Transfer Dynamics', units: 3, hours: 4 },
          { id: 'sci7-acids-bases', title: 'Acids, Bases, Salts & Neutralisation', units: 4, hours: 5 }
        ]
      },
      {
        id: 'english-class7',
        name: 'English',
        icon: '📖',
        color: '#8B5CF6',
        chapters: [
          { id: 'eng7-three-questions', title: 'Three Questions by Leo Tolstoy', units: 3, hours: 4 },
          { id: 'eng7-gift-of-chappals', title: 'A Gift of Chappals', units: 3, hours: 4 }
        ]
      },
      {
        id: 'grammar-class7',
        name: 'English Grammar',
        icon: '✍️',
        color: '#3B82F6',
        chapters: [
          { id: 'gram7-subject-verb-agreement', title: 'Subject-Verb Concord Rules & Exceptions', units: 4, hours: 5 },
          { id: 'gram7-conditionals', title: 'Conditional Sentences (Zero, 1st, 2nd, 3rd)', units: 3, hours: 4 }
        ]
      },
      {
        id: 'vedic-class7',
        name: 'Vedic Mathematics',
        icon: '⚡',
        color: '#F59E0B',
        chapters: [
          { id: 'vedic7-straight-division', title: 'Dhwajanka (Flag Method) for Fast Long Division', units: 4, hours: 6 }
        ]
      }
    ]
  },
  8: {
    grade: 8,
    title: 'Class VIII (Pre-High School Gateway)',
    tagline: 'Linear Equations, Geometry Proofs & Olympiad Analytical Skills',
    subjects: [
      {
        id: 'math-class8',
        name: 'Mathematics',
        icon: '📐',
        color: '#10B981',
        chapters: [
          { id: 'math8-linear-equations', title: 'Linear Equations in One Variable & Applied Word Problems', units: 4, hours: 7 },
          { id: 'math8-quadrilaterals', title: 'Understanding Quadrilaterals & Polygon Theorems', units: 4, hours: 6 },
          { id: 'math8-squares-cubes', title: 'Square Roots & Cube Roots by Prime Factorization & Division', units: 4, hours: 6 }
        ]
      },
      {
        id: 'science-class8',
        name: 'Science',
        icon: '🔬',
        color: '#258F80',
        chapters: [
          { id: 'sci8-microorganisms', title: 'Microorganisms: Friend & Foe', units: 4, hours: 5 },
          { id: 'sci8-force-pressure', title: 'Force, Pressure & Friction Dynamics', units: 4, hours: 6 },
          { id: 'sci8-combustion', title: 'Combustion, Flame & Fuels', units: 3, hours: 4 }
        ]
      },
      {
        id: 'english-class8',
        name: 'English',
        icon: '📖',
        color: '#8B5CF6',
        chapters: [
          { id: 'eng8-best-xmas-present', title: 'The Best Christmas Present in the World', units: 3, hours: 5 },
          { id: 'eng8-tsunami', title: 'The Tsunami & Resilience of the Human Spirit', units: 3, hours: 4 }
        ]
      },
      {
        id: 'grammar-class8',
        name: 'English Grammar',
        icon: '✍️',
        color: '#3B82F6',
        chapters: [
          { id: 'gram8-reported-speech-complex', title: 'Complex Indirect Speech & Dialogue Conversion', units: 4, hours: 6 },
          { id: 'gram8-transformation', title: 'Transformation of Sentences (Simple, Compound, Complex)', units: 4, hours: 6 }
        ]
      },
      {
        id: 'vedic-class8',
        name: 'Vedic Mathematics',
        icon: '⚡',
        color: '#F59E0B',
        chapters: [
          { id: 'vedic8-square-roots', title: 'Vilokanam (Inspection Method) for Instant Square & Cube Roots', units: 3, hours: 5 }
        ]
      }
    ]
  },
  9: {
    grade: 9,
    title: 'Class IX (High School Board Foundation)',
    tagline: 'Number Systems, Coordinate Geometry, Mechanics & Advanced Syntax',
    subjects: [
      {
        id: 'math-class9',
        name: 'Mathematics',
        icon: '📐',
        color: '#10B981',
        chapters: [
          { id: 'math9-number-systems', title: 'Real Numbers, Irrationality Proofs & Exponents', units: 5, hours: 8 },
          { id: 'math9-polynomials', title: 'Polynomials, Remainder & Factor Theorems', units: 5, hours: 8 },
          { id: 'math9-coordinate-geo', title: 'Coordinate Geometry & Cartesian Plane', units: 3, hours: 5 },
          { id: 'math9-lines-angles', title: 'Lines, Angles & Parallel Axioms', units: 4, hours: 6 }
        ]
      },
      {
        id: 'science-class9',
        name: 'Science',
        icon: '🔬',
        color: '#258F80',
        chapters: [
          { id: 'sci9-matter', title: 'Matter in Our Surroundings & Atomic Theory', units: 4, hours: 6 },
          { id: 'sci9-cell', title: 'Cell: Fundamental Unit of Life & Tissues', units: 4, hours: 6 },
          { id: 'sci9-motion', title: 'Motion, Force, Gravitation & Laws of Motion', units: 5, hours: 7 }
        ]
      },
      {
        id: 'english-class9',
        name: 'English',
        icon: '📖',
        color: '#8B5CF6',
        chapters: [
          { id: 'eng9-fun-they-had', title: 'The Fun They Had by Isaac Asimov (Futuristic Education)', units: 3, hours: 4 },
          { id: 'eng9-sound-of-music', title: 'The Sound of Music: Evelyn Glennie', units: 3, hours: 4 }
        ]
      },
      {
        id: 'grammar-class9',
        name: 'English Grammar',
        icon: '✍️',
        color: '#3B82F6',
        chapters: [
          { id: 'gram9-integrated-grammar', title: 'Integrated Grammar: Editing, Omission, Gap Filling', units: 5, hours: 7 },
          { id: 'gram9-creative-writing', title: 'Formal Letters, Descriptive Paragraphs & Diary Entries', units: 4, hours: 6 }
        ]
      },
      {
        id: 'vedic-class9',
        name: 'Vedic Mathematics',
        icon: '⚡',
        color: '#F59E0B',
        chapters: [
          { id: 'vedic9-algebraic-mult', title: 'Vedic Sutras for Quadratic Factorization in 5 Seconds', units: 4, hours: 6 }
        ]
      }
    ]
  },
  10: {
    grade: 10,
    title: 'Class X (Board & National Olympiad Apex)',
    tagline: 'Board Mastery: Trigonometry, Science, English & Vedic Mathematics',
    subjects: [
      {
        id: 'math-class10',
        name: 'Mathematics',
        icon: '📐',
        color: '#10B981',
        chapters: [
          { id: 'math10-real-nums', title: 'Real Numbers, Fundamental Theorem of Arithmetic', units: 4, hours: 7 },
          { id: 'math10-polynomials', title: 'Polynomials & Geometric Meaning of Zeroes', units: 4, hours: 7 },
          { id: 'math10-linear-pair', title: 'Pair of Linear Equations in Two Variables', units: 5, hours: 8 },
          { id: 'math10-quadratics', title: 'Quadratic Equations & Discriminant Nature of Roots', units: 5, hours: 8 },
          { id: 'math10-trigonometry', title: 'Introduction to Trigonometry & Standard Identities', units: 5, hours: 9 }
        ]
      },
      {
        id: 'science-class10',
        name: 'Science',
        icon: '🔬',
        color: '#258F80',
        chapters: [
          { id: 'sci10-reactions', title: 'Chemical Reactions, Acids, Bases & Metals', units: 5, hours: 8 },
          { id: 'sci10-life-processes', title: 'Life Processes, Control & Coordination', units: 5, hours: 8 },
          { id: 'sci10-light-electricity', title: 'Light Reflection/Refraction & Electricity Circuits', units: 5, hours: 8 }
        ]
      },
      {
        id: 'english-class10',
        name: 'English',
        icon: '📖',
        color: '#8B5CF6',
        chapters: [
          { id: 'eng10-letter-to-god', title: 'A Letter to God by G.L. Fuentes', units: 3, hours: 5 },
          { id: 'eng10-nelson-mandela', title: 'Nelson Mandela: Long Walk to Freedom', units: 4, hours: 6 }
        ]
      },
      {
        id: 'grammar-class10',
        name: 'English Grammar',
        icon: '✍️',
        color: '#3B82F6',
        chapters: [
          { id: 'gram10-analytical-paragraphs', title: 'Analytical Paragraph Writing & Data Interpretation', units: 4, hours: 6 },
          { id: 'gram10-board-grammar', title: 'CBSE Board Pattern Integrated Grammar Drills', units: 5, hours: 8 }
        ]
      },
      {
        id: 'vedic-class10',
        name: 'Vedic Mathematics',
        icon: '⚡',
        color: '#F59E0B',
        chapters: [
          { id: 'vedic10-calculus-intro', title: 'Vedic Sutra Gunita Samuccaya for Fast Polynomial Division', units: 4, hours: 7 }
        ]
      }
    ]
  }
};

// 1. Get List of Standards (Class III to Class X)
router.get('/classes', async (req, res) => {
  const classesList = Object.keys(curriculumMatrix).map(g => {
    const item = curriculumMatrix[g];
    return {
      grade: parseInt(g, 10),
      title: item.title,
      tagline: item.tagline,
      subject_count: item.subjects.length,
      subjects: item.subjects.map(s => ({ id: s.id, name: s.name, icon: s.icon, color: s.color, chapter_count: s.chapters.length }))
    };
  });

  res.json({ classes: classesList });
});

// 2. Get Complete Curriculum Hierarchy for a Specific Grade (Class III to X)
router.get('/hierarchy/:grade', async (req, res) => {
  const grade = parseInt(req.params.grade, 10);
  const data = curriculumMatrix[grade];

  if (!data) {
    return res.status(404).json({ error: `Curriculum not found for Class ${grade}. Available classes: Class III to Class X.` });
  }

  res.json({
    grade,
    title: data.title,
    tagline: data.tagline,
    subjects: data.subjects
  });
});

// 3. Multimodal Lesson Engine (Registration Required)
// Supplies: Concept summary, Web Speech audio narration script, interactive flashcards, step-by-step worked solutions, and Vedic shortcuts
router.get('/lesson-multimodal/:topicId', requireRegisteredUser, async (req, res) => {
  try {
    const { topicId } = req.params;

    // Check if topic exists in DB
    const topic = await dbAdapter.queryOne('SELECT * FROM topics WHERE id = ?', [topicId]);
    const lesson = await dbAdapter.queryOne('SELECT * FROM lessons WHERE topic_id = ?', [topicId]);

    // Build multimodal payload
    const title = topic ? topic.title : 'Comprehensive Conceptual Masterclass';
    const summary = topic ? topic.summary : 'Master the underlying rules, mental shortcuts, and problem-solving strategies.';
    const keyRules = topic && topic.key_rules ? JSON.parse(topic.key_rules) : [
      'Understand the core principle before applying formulas.',
      'Check work systematically using inverse mathematical operations.',
      'Apply Vedic mental math shortcuts to verify solutions in seconds.'
    ];

    // Multimodal Lesson Components:
    const multimodalData = {
      topic_id: topicId,
      title,
      summary,
      key_rules: keyRules,
      audio_narration: [
        `Welcome to this lesson on ${title}.`,
        summary,
        'Let us examine the fundamental rules and worked examples step by step.',
        keyRules[0] ? `First key rule: ${keyRules[0]}` : '',
        keyRules[1] ? `Second key rule: ${keyRules[1]}` : '',
        'Review the flashcards below to test your instant recall, and practice with the interactive examples.'
      ].filter(Boolean),
      flashcards: [
        {
          id: 'fc-1',
          category: 'Key Definition',
          front: `What is the core definition of ${title}?`,
          back: summary
        },
        {
          id: 'fc-2',
          category: 'Core Rule',
          front: 'What is the golden rule to remember for solving problems in this topic?',
          back: keyRules[0] || 'Break complex multi-step problems down into simple arithmetic units.'
        },
        {
          id: 'fc-3',
          category: 'Olympiad Strategy',
          front: 'How can you eliminate wrong answer choices quickly during competitive exams?',
          back: 'Examine the units digit, estimate the approximate range, and apply mental arithmetic.'
        }
      ],
      worked_examples: [
        {
          id: 'we-1',
          problem: `Solve and analyze a representative problem in ${title}:`,
          difficulty: 'Medium',
          steps: [
            'Step 1: Identify the given quantities and what needs to be solved.',
            'Step 2: Apply the governing mathematical/grammatical rule systematically.',
            'Step 3: Compute the intermediate values and verify consistency.',
            'Step 4: Formulate the final answer and verify with unit labels.'
          ],
          final_answer: 'Confirmed through systematic application of the core rule.'
        }
      ],
      vedic_shortcut: {
        sutra_name: 'Ekadhikena Purvena & Nikhilam',
        principle: 'By One More than the One Before',
        conventional_method: 'Standard multi-step long calculation requiring paper and pencil carries.',
        vedic_method: 'One-line direct mental calculation from left to right.',
        speed_boost: 'Saves 70% of exam time, minimizing calculation fatigue.'
      }
    };

    // If a database lesson exists, merge its concept HTML
    if (lesson) {
      multimodalData.concept_html = lesson.concept_html;
      multimodalData.fun_fact = lesson.fun_fact;
      if (lesson.examples_json) {
        try {
          const dbExamples = JSON.parse(lesson.examples_json);
          if (Array.isArray(dbExamples) && dbExamples.length > 0) {
            multimodalData.worked_examples = dbExamples.map((ex, i) => ({
              id: `we-${i + 1}`,
              problem: ex.problem || ex.q || `Example ${i + 1}`,
              steps: ex.steps || [ex.solution || ex.a || 'Direct solution applied.'],
              final_answer: ex.answer || ex.final || 'Correctly evaluated.'
            }));
          }
        } catch (e) {
          // ignore json parse error
        }
      }
    }

    res.json({ lesson: multimodalData });
  } catch (err) {
    console.error('Fetch multimodal lesson error:', err);
    res.status(500).json({ error: 'Failed to load multimodal lesson engine' });
  }
});

module.exports = router;
