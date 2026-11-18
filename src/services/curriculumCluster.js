/**
 * TalentHunt CBSE Curriculum Unit Clustering Service
 * Maps granular questions, sections, and micro-topics into official CBSE Academic Units
 * for Classes 3 through 10.
 */

const CBSE_UNIT_TEMPLATES = {
  mathematics: [
    {
      unit_key: 'number_systems',
      unit_num: 1,
      title: 'Unit 1: Number Systems & Arithmetic',
      icon: '🔢',
      description: 'Number sense, place value, integers, fractions, decimals, rational numbers, and core arithmetic.',
      matchKeywords: [
        'number', 'arithmetic', 'integer', 'fraction', 'decimal', 'rational', 'real number',
        'place value', 'factors', 'multiples', 'hcf', 'lcm', 'percentages & ratios', 'ratio',
        'proportion', 'everyday mathematics'
      ]
    },
    {
      unit_key: 'algebra',
      unit_num: 2,
      title: 'Unit 2: Algebra & Coordinate Geometry',
      icon: '📐',
      description: 'Algebraic expressions, linear & quadratic equations, identities, arithmetic progressions, and coordinate planes.',
      matchKeywords: [
        'algebra', 'equation', 'expression', 'identity', 'polynomial', 'linear', 'quadratic',
        'progression', 'coordinate geometry', 'coordinate'
      ]
    },
    {
      unit_key: 'geometry_mensuration',
      unit_num: 3,
      title: 'Unit 3: Geometry & Mensuration',
      icon: '📏',
      description: 'Lines, angles, triangles, quadrilaterals, circles, area, perimeter, surface areas, and volume.',
      matchKeywords: [
        'geometry', 'shapes', 'mensuration', 'area', 'perimeter', 'volume', 'triangle', 'circle',
        'quadrilateral', 'polygon', 'cube', 'cuboid', 'cylinder', 'cone', 'sphere', 'heron',
        'grid geometry', 'lines & angles'
      ]
    },
    {
      unit_key: 'statistics_probability',
      unit_num: 4,
      title: 'Unit 4: Statistics & Probability',
      icon: '📊',
      description: 'Data handling, frequency distributions, mean, median, mode, bar graphs, and theoretical probability.',
      matchKeywords: [
        'data', 'statistics', 'probability', 'graph', 'chart', 'bar graphs', 'mean', 'median', 'mode'
      ]
    },
    {
      unit_key: 'olympiad_reasoning',
      unit_num: 5,
      title: 'Unit 5: Mathematical Reasoning & Olympiad HOTS',
      icon: '🏆',
      description: 'Higher Order Thinking Skills (HOTS), pattern logic, spatial reasoning, and Olympiad problem solving.',
      matchKeywords: [
        'achiever', 'reasoning', 'pattern', 'logical', 'aptitude', 'hots', 'puzzle', 'analogy'
      ]
    }
  ],

  science: [
    {
      unit_key: 'chemistry_matter',
      unit_num: 1,
      title: 'Unit 1: Chemical Substances — Nature & Behaviour',
      icon: '🧪',
      description: 'Matter in our surroundings, chemical reactions, acids, bases, salts, metals, non-metals, and atomic structure.',
      matchKeywords: [
        'chemistry', 'matter', 'material', 'atom', 'molecule', 'acid', 'base', 'salt', 'chemical',
        'metal', 'non-metal', 'carbon', 'reaction', 'combustion', 'coal', 'petroleum', 'synthetic'
      ]
    },
    {
      unit_key: 'biology_life',
      unit_num: 2,
      title: 'Unit 2: World of Living & Life Processes',
      icon: '🌱',
      description: 'Cell biology, tissues, nutrition, respiration, circulation, nervous system, reproduction, and heredity.',
      matchKeywords: [
        'living', 'biology', 'human body', 'health', 'cell', 'tissue', 'life processes',
        'control', 'coordination', 'reproduction', 'heredity', 'evolution', 'nutrition',
        'respiration', 'circulatory', 'microorganism', 'crop', 'food resources', 'diversity'
      ]
    },
    {
      unit_key: 'physics_light_sound',
      unit_num: 3,
      title: 'Unit 3: Natural Phenomena (Light & Sound)',
      icon: '⚡',
      description: 'Reflection, refraction, optical lenses, human eye & colorful world, acoustics, and wave motion.',
      matchKeywords: [
        'light', 'sound', 'reflection', 'refraction', 'eye', 'lens', 'mirror', 'wave', 'optics'
      ]
    },
    {
      unit_key: 'physics_current_motion',
      unit_num: 4,
      title: 'Unit 4: Electricity, Magnetism & Forces',
      icon: '🔋',
      description: 'Electric circuits, Ohm\'s law, magnetic effects of current, force, motion, work, and gravitation.',
      matchKeywords: [
        'energy', 'electricity', 'current', 'magnetic', 'circuit', 'force', 'motion', 'gravitation',
        'work', 'power', 'physical science'
      ]
    },
    {
      unit_key: 'environment_space',
      unit_num: 5,
      title: 'Unit 5: Natural Resources & Environment',
      icon: '🌍',
      description: 'Ecosystems, environmental conservation, waste management, natural resources, and earth science.',
      matchKeywords: [
        'environment', 'ecosystem', 'earth', 'space', 'astronomy', 'conservation', 'biodiversity',
        'pollution', 'waste', 'natural resources'
      ]
    }
  ],

  english: [
    {
      unit_key: 'grammar_parts_of_speech',
      unit_num: 1,
      title: 'Unit 1: Applied Grammar & Parts of Speech',
      icon: '📖',
      description: 'Nouns, pronouns, verbs, adjectives, adverbs, prepositions, conjunctions, articles, and determiners.',
      matchKeywords: [
        'grammar', 'parts of speech', 'noun', 'pronoun', 'verb', 'adjective', 'adverb',
        'preposition', 'conjunction', 'article', 'determiner', 'degrees of comparison'
      ]
    },
    {
      unit_key: 'syntax_mechanics',
      unit_num: 2,
      title: 'Unit 2: Sentence Mechanics & Syntax',
      icon: '✍️',
      description: 'Tenses, modals, active-passive voice, direct-indirect speech, subject-verb concord, and punctuation.',
      matchKeywords: [
        'sentence', 'tense', 'voice', 'speech', 'reported', 'modal', 'concord', 'subject-verb',
        'punctuation', 'spelling', 'error detection', 'cloze'
      ]
    },
    {
      unit_key: 'vocabulary_word_power',
      unit_num: 3,
      title: 'Unit 3: Vocabulary & Word Power',
      icon: '💡',
      description: 'Synonyms, antonyms, idioms, phrasal verbs, prefixes, suffixes, collocations, and one-word substitutions.',
      matchKeywords: [
        'vocabulary', 'word meaning', 'synonym', 'antonym', 'idiom', 'phrasal', 'prefix',
        'suffix', 'homophone', 'active vocabulary', 'word power'
      ]
    },
    {
      unit_key: 'reading_comprehension',
      unit_num: 4,
      title: 'Unit 4: Reading Comprehension & Analytical Skills',
      icon: '📑',
      description: 'Unseen passages, contextual inference, central themes, paragraph logic, and literary analysis.',
      matchKeywords: [
        'comprehension', 'reading', 'passage', 'inference', 'critical reading', 'critical thinking',
        'figures of speech', 'literary'
      ]
    },
    {
      unit_key: 'verbal_reasoning_hots',
      unit_num: 5,
      title: 'Unit 5: Verbal Reasoning & Olympiad HOTS',
      icon: '🏅',
      description: 'Word analogies, verbal classification, jumbled sentences, and Olympiad Achievers questions.',
      matchKeywords: [
        'analogy', 'reasoning', 'achiever', 'hots', 'puzzle', 'logical language', 'jumbled'
      ]
    }
  ],

  aptitude: [
    {
      unit_key: 'verbal_reasoning',
      unit_num: 1,
      title: 'Unit 1: Verbal Reasoning & Logic',
      icon: '🧩',
      description: 'Analogies, classification, coding-decoding, blood relations, and direction sense.',
      matchKeywords: [
        'verbal', 'analogy', 'classification', 'coding', 'decoding', 'relation', 'direction',
        'series', 'odd one out'
      ]
    },
    {
      unit_key: 'non_verbal_spatial',
      unit_num: 2,
      title: 'Unit 2: Non-Verbal & Spatial Reasoning',
      icon: '👁️',
      description: 'Pattern completion, mirror & water images, figure matrix, paper folding, and embedded figures.',
      matchKeywords: [
        'non-verbal', 'spatial', 'pattern', 'mirror', 'water', 'matrix', 'folding', 'figure',
        'embedded', 'shape', 'visual'
      ]
    },
    {
      unit_key: 'analytical_reasoning',
      unit_num: 3,
      title: 'Unit 3: Analytical Reasoning & Quantitative Puzzles',
      icon: '🧠',
      description: 'Number & letter series, Venn diagrams, mathematical operations, ranking, and puzzle logic.',
      matchKeywords: [
        'logical reasoning', 'analytical', 'venn', 'ranking', 'puzzle', 'operation', 'general'
      ]
    }
  ]
};

/**
 * Normalizes subject string / slug to a subject family ('mathematics', 'science', 'english', 'aptitude')
 */
function getSubjectFamily(subjectSlugOrName) {
  const s = (subjectSlugOrName || '').toLowerCase();
  if (s.includes('math')) return 'mathematics';
  if (s.includes('sci')) return 'science';
  if (s.includes('eng')) return 'english';
  if (s.includes('apt') || s.includes('reason')) return 'aptitude';
  return 'mathematics'; // default
}

/**
 * Clusters an array of raw sections or topics into structured CBSE Units
 * @param {Object} subject - The subject database row
 * @param {Array} rawSections - Array of { section, count, first_id } or topics
 * @returns {Array} Array of structured CBSE Unit objects
 */
function clusterSubjectIntoUnits(subject, rawSections) {
  const family = getSubjectFamily(subject.slug || subject.id || subject.name);
  const templates = CBSE_UNIT_TEMPLATES[family] || CBSE_UNIT_TEMPLATES.mathematics;

  // Initialize unit buckets
  const units = templates.map(t => ({
    id: `unit-${t.unit_key}`,
    unit_num: t.unit_num,
    title: t.title,
    icon: t.icon,
    description: t.description,
    subject_id: subject.id,
    question_count: 0,
    sections: []
  }));

  const fallbackUnit = units[units.length - 1]; // Put unmatched sections in the last unit or general

  // Distribute each section into the best-matching Unit
  rawSections.forEach(sec => {
    const secTitle = (sec.section || sec.title || '').trim();
    if (!secTitle) return;
    const count = parseInt(sec.count || sec.question_count || 1, 10);
    const secLower = secTitle.toLowerCase();

    // Find best matching template
    let matchedUnit = null;
    for (let i = 0; i < templates.length; i++) {
      const tmpl = templates[i];
      const hasMatch = tmpl.matchKeywords.some(kw => secLower.includes(kw));
      if (hasMatch) {
        matchedUnit = units[i];
        break;
      }
    }

    if (!matchedUnit) {
      matchedUnit = fallbackUnit;
    }

    matchedUnit.question_count += count;
    matchedUnit.sections.push({
      id: `sec-${encodeURIComponent(secTitle)}`,
      title: secTitle,
      count: count,
      first_id: sec.first_id || null
    });
  });

  // Filter out completely empty units if any, but keep at least non-empty ones
  const activeUnits = units.filter(u => u.question_count > 0);
  return activeUnits.length > 0 ? activeUnits : units;
}

module.exports = {
  CBSE_UNIT_TEMPLATES,
  getSubjectFamily,
  clusterSubjectIntoUnits
};
