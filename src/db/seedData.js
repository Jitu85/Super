const { dbAdapter } = require('./database');

const subjects = [
  {
    id: 'math-class3',
    slug: 'mathematics',
    name: 'Mathematics',
    icon: '📐',
    color: '#10B981',
    description: 'CBSE Class III Mathematics: Numbers, Shapes, Fractions, Time, Money, and Problem Solving',
    grade: 3
  },
  {
    id: 'english-class3',
    slug: 'english',
    name: 'English',
    icon: '📚',
    color: '#8B5CF6',
    description: 'CBSE Class III English: Grammar, Vocabulary, Reading Comprehension, and Expressive Writing',
    grade: 3
  }
];

const topics = [
  // Mathematics Topics
  {
    id: 'math-numbers',
    subject_id: 'math-class3',
    slug: 'numbers-and-place-value',
    title: 'Numbers & Place Value (Up to 4 Digits)',
    order_num: 1,
    icon: '🔢',
    summary: 'Master 4-digit numbers (1000-9999), Place Value, Face Value, Expanded Form, and Comparing Numbers.',
    key_rules: JSON.stringify([
      'The places in a 4-digit number from right to left are: Ones (O), Tens (T), Hundreds (H), and Thousands (Th).',
      'Place Value = Face Value × Value of the position (e.g., in 4,529, the place value of 5 is 5 × 100 = 500).',
      'Face Value is the digit itself (in 4,529, the face value of 5 is simply 5).',
      'Predecessor means 1 less (number - 1), Successor means 1 more (number + 1).'
    ])
  },
  {
    id: 'math-addition-subtraction',
    subject_id: 'math-class3',
    slug: 'addition-and-subtraction',
    title: 'Addition & Subtraction',
    order_num: 2,
    icon: '➕',
    summary: 'Adding and subtracting 3-digit and 4-digit numbers with regrouping (carry over and borrow), plus word problems.',
    key_rules: JSON.stringify([
      'Always start adding or subtracting from the Ones place, then move to Tens, Hundreds, and Thousands.',
      'When the sum in any column is 10 or greater, carry over the ten to the next column.',
      'When the top digit is smaller than the bottom digit in subtraction, borrow 1 from the next left column.'
    ])
  },
  {
    id: 'math-multiplication',
    subject_id: 'math-class3',
    slug: 'multiplication',
    title: 'Multiplication & Tables',
    order_num: 3,
    icon: '✖️',
    summary: 'Multiplication as repeated addition, times tables (2 to 12), and multiplying 2-digit numbers by 1-digit.',
    key_rules: JSON.stringify([
      'Multiplication is fast repeated addition: 4 × 3 means 3 + 3 + 3 + 3 = 12.',
      'Any number multiplied by 0 is always 0 (e.g., 8 × 0 = 0).',
      'Any number multiplied by 1 is the number itself (e.g., 9 × 1 = 9).',
      'The order does not change the product: 6 × 7 = 7 × 6 = 42.'
    ])
  },
  {
    id: 'math-division',
    subject_id: 'math-class3',
    slug: 'division',
    title: 'Division & Equal Sharing',
    order_num: 4,
    icon: '➗',
    summary: 'Dividing into equal groups, understanding Dividend, Divisor, Quotient, and Remainder.',
    key_rules: JSON.stringify([
      'Division is sharing equally or repeated subtraction: 15 ÷ 3 = 5 (give 15 apples equally to 3 kids, each gets 5).',
      'Dividend ÷ Divisor = Quotient (with Remainder if any).',
      'We cannot divide any number by zero (0).',
      'Any number divided by 1 gives the same number (e.g., 14 ÷ 1 = 14).'
    ])
  },
  {
    id: 'math-fractions',
    subject_id: 'math-class3',
    slug: 'fractions',
    title: 'Fractions (Parts of a Whole)',
    order_num: 5,
    icon: '🍕',
    summary: 'Understand halves (1/2), thirds (1/3), quarters (1/4), numerator and denominator with visual shapes.',
    key_rules: JSON.stringify([
      'A fraction represents an equal part of a whole object or group.',
      'Top number is the Numerator (how many parts we have or shaded).',
      'Bottom number is the Denominator (total number of equal parts).',
      '1/2 is half, 1/4 is one-quarter, 3/4 is three-quarters.'
    ])
  },
  {
    id: 'math-shapes',
    subject_id: 'math-class3',
    slug: 'shapes-and-geometry',
    title: 'Shapes, Lines & Patterns',
    order_num: 6,
    icon: '🔷',
    summary: '2D flat shapes (sides & corners), 3D solid shapes (cube, cuboid, sphere, cylinder, cone), and symmetry.',
    key_rules: JSON.stringify([
      'A Square has 4 equal sides and 4 corners.',
      'A Rectangle has opposite sides equal and 4 corners.',
      'A Triangle has 3 sides and 3 corners. A Circle has 0 sides and 0 corners.',
      'A Cube has 6 square faces, 12 edges, and 8 vertices (corners).'
    ])
  },
  {
    id: 'math-time',
    subject_id: 'math-class3',
    slug: 'time-and-calendar',
    title: 'Time & Calendar',
    order_num: 7,
    icon: '⏰',
    summary: 'Reading clocks (hours, half past, quarter past/to), AM/PM, days of the week, and months of the year.',
    key_rules: JSON.stringify([
      'Short hand is the Hour hand, Long hand is the Minute hand.',
      '60 seconds = 1 minute, 60 minutes = 1 hour, 24 hours = 1 day.',
      'When the minute hand points to 6, it is "Half Past". When it points to 3, it is "Quarter Past".',
      'A normal year has 365 days; a Leap Year has 366 days (February has 29 days).'
    ])
  },
  {
    id: 'math-money',
    subject_id: 'math-class3',
    slug: 'money',
    title: 'Money & Shopping Bills',
    order_num: 8,
    icon: '💰',
    summary: 'Indian Rupees (₹) and paise (p), converting ₹ to p, adding amounts, and simple change calculations.',
    key_rules: JSON.stringify([
      '₹1 = 100 paise. To convert Rupees into paise, multiply by 100 (e.g., ₹5 = 500 paise).',
      'We write money as ₹15.50 (Rupees 15 and 50 paise).',
      'Change returned = Amount paid - Cost of the items.'
    ])
  },

  // English Topics
  {
    id: 'eng-nouns',
    subject_id: 'english-class3',
    slug: 'nouns',
    title: 'Nouns (Naming Words)',
    order_num: 1,
    icon: '🏷️',
    summary: 'Common nouns, Proper nouns (capital letters!), Collective nouns, and Singular/Plural forms.',
    key_rules: JSON.stringify([
      'A Noun is the name of a person, place, animal, or thing.',
      'Proper Nouns are special names (like "Rohan", "Delhi", "Ganga") and ALWAYS begin with a capital letter.',
      'Collective nouns name a group: an army of ants, a flock of birds, a pride of lions.',
      'Plurals: Add -s (cat -> cats), -es for words ending in ch, sh, s, x (box -> boxes), or change y to -ies (puppy -> puppies).'
    ])
  },
  {
    id: 'eng-pronouns',
    subject_id: 'english-class3',
    slug: 'pronouns',
    title: 'Pronouns (Word Replacers)',
    order_num: 2,
    icon: '👥',
    summary: 'Words that take the place of nouns: He, She, It, They, We, I, You, Me, and Possessives (His, Her, Their).',
    key_rules: JSON.stringify([
      'Use "He" for boys/men, "She" for girls/women, and "It" for animals or non-living objects.',
      'Use "They" for more than one person or thing.',
      'Use "We" when talking about yourself and others together (e.g., "Riya and I = We").',
      'Pronouns avoid repeating the same noun over and over.'
    ])
  },
  {
    id: 'eng-verbs',
    subject_id: 'english-class3',
    slug: 'verbs-and-helping-verbs',
    title: 'Verbs & Action Words',
    order_num: 3,
    icon: '🏃',
    summary: 'Action words (run, jump, read) and helping verbs (is, am, are, was, were, has, have).',
    key_rules: JSON.stringify([
      'A Verb tells what someone or something is doing (action) or being.',
      'Use "am" only with "I" (I am reading).',
      'Use "is" with singular subjects (He is, She is, The dog is).',
      'Use "are" with plural subjects and "You" (We are, They are, You are).',
      'Use "was" for one in the past, and "were" for many in the past.'
    ])
  },
  {
    id: 'eng-adjectives',
    subject_id: 'english-class3',
    slug: 'adjectives',
    title: 'Adjectives (Describing Words)',
    order_num: 4,
    icon: '🎨',
    summary: 'Words describing size, color, shape, number, and quality, plus degrees of comparison (-er and -est).',
    key_rules: JSON.stringify([
      'Adjectives tell us more about a noun: "The red apple", "Three kittens", "A tall tree".',
      'Comparative adds -er to compare two things (e.g., faster, taller).',
      'Superlative adds -est to compare three or more things (e.g., fastest, tallest).'
    ])
  },
  {
    id: 'eng-prepositions',
    subject_id: 'english-class3',
    slug: 'prepositions',
    title: 'Prepositions (Position Words)',
    order_num: 5,
    icon: '📍',
    summary: 'Position words showing where something is: in, on, under, behind, in front of, between, over, near.',
    key_rules: JSON.stringify([
      '"In" means inside a space (e.g., The pencil is in the box).',
      '"On" means touching the surface of something (e.g., The cup is on the table).',
      '"Under" means below something (e.g., The cat is sleeping under the bed).',
      '"Between" is used when something is in the middle of two things.'
    ])
  },
  {
    id: 'eng-tenses',
    subject_id: 'english-class3',
    slug: 'tenses',
    title: 'Tenses (Present & Past)',
    order_num: 6,
    icon: '⏳',
    summary: 'Simple Present (daily habits & facts) and Simple Past (actions finished yesterday or before).',
    key_rules: JSON.stringify([
      'Simple Present: Add -s or -es with singular subjects (He plays, She sings, The bird flies).',
      'Simple Past: Regular verbs add -ed (play -> played, walk -> walked).',
      'Irregular past verbs change form completely: go -> went, eat -> ate, see -> saw, buy -> bought.'
    ])
  },
  {
    id: 'eng-articles',
    subject_id: 'english-class3',
    slug: 'articles-and-conjunctions',
    title: 'Articles (A, An, The) & Conjunctions',
    order_num: 7,
    icon: '🔗',
    summary: 'Using A, An, and The correctly, plus joining sentences with And, But, Because, and Or.',
    key_rules: JSON.stringify([
      'Use "An" before words starting with a vowel SOUND (a, e, i, o, u) like "an apple", "an umbrella", "an honest boy".',
      'Use "A" before consonant sounds (a book, a tiger, a university).',
      'Use "The" for specific things or unique objects (the Moon, the Sun, the Himalayas).',
      'Conjunctions: "And" joins similar ideas, "But" shows contrast, "Because" gives reasons.'
    ])
  },
  {
    id: 'eng-comprehension',
    subject_id: 'english-class3',
    slug: 'reading-comprehension',
    title: 'Reading Comprehension',
    order_num: 8,
    icon: '📖',
    summary: 'Read delightful short stories, understand character motivations, and answer factual and inferential questions.',
    key_rules: JSON.stringify([
      'Read the passage carefully twice before answering.',
      'Underline key character names and important events in your mind.',
      'Check if the question asks for "What", "Why", "Where", or "Who".'
    ])
  }
];

const lessons = [
  // Math Lesson: Numbers & Place Value
  {
    id: 'lesson-math-numbers',
    topic_id: 'math-numbers',
    title: 'Understanding 4-Digit Numbers & Place Value',
    overview: 'Welcome young mathematician! Today we unlock the secret power of 4-digit numbers up to 9999!',
    concept_html: `
      <div class="lesson-card">
        <h3>🏠 The House of Four Digits</h3>
        <p>Imagine a big house with 4 colorful rooms. From right to left:</p>
        <div class="place-value-table">
          <div class="pv-box pv-th"><span class="pv-label">Th</span><strong>Thousands</strong><span>(1000s)</span></div>
          <div class="pv-box pv-h"><span class="pv-label">H</span><strong>Hundreds</strong><span>(100s)</span></div>
          <div class="pv-box pv-t"><span class="pv-label">T</span><strong>Tens</strong><span>(10s)</span></div>
          <div class="pv-box pv-o"><span class="pv-label">O</span><strong>Ones</strong><span>(1s)</span></div>
        </div>
        <p>Let's look at the number <strong>3, 5 2 8</strong>:</p>
        <ul>
          <li><strong>3</strong> is in Thousands place &rarr; Place Value = <strong>3000</strong></li>
          <li><strong>5</strong> is in Hundreds place &rarr; Place Value = <strong>500</strong></li>
          <li><strong>2</strong> is in Tens place &rarr; Place Value = <strong>20</strong></li>
          <li><strong>8</strong> is in Ones place &rarr; Place Value = <strong>8</strong></li>
        </ul>
        <div class="tip-box">
          💡 <strong>Expanded Form:</strong> 3528 = 3000 + 500 + 20 + 8<br>
          🗣️ <strong>Number Name:</strong> Three thousand five hundred twenty-eight
        </div>
      </div>
    `,
    fun_fact: 'The smallest 4-digit number is 1,000 and the largest 4-digit number is 9,999!',
    examples_json: JSON.stringify([
      { question: 'What is the place value of 7 in 6,742?', answer: '700 (since 7 is in the hundreds column, 7 × 100 = 700)' },
      { question: 'What is the successor of 4,099?', answer: '4,100 (Successor means add 1: 4099 + 1 = 4100)' }
    ])
  },

  // Math Lesson: Multiplication
  {
    id: 'lesson-math-multiplication',
    topic_id: 'math-multiplication',
    title: 'Multiplication: Super-Fast Addition!',
    overview: 'Instead of adding 4 + 4 + 4 + 4 + 4 slowly, multiplication lets you calculate in a flash!',
    concept_html: `
      <div class="lesson-card">
        <h3>⚡ What is Multiplication?</h3>
        <p>Multiplication is simply <strong>repeated addition of equal groups</strong>.</p>
        <div class="math-visual-row">
          <span class="badge-item">🍎🍎🍎</span> +
          <span class="badge-item">🍎🍎🍎</span> +
          <span class="badge-item">🍎🍎🍎</span> +
          <span class="badge-item">🍎🍎🍎</span>
        </div>
        <p>That is <strong>4 groups of 3 apples = 4 × 3 = 12 apples</strong>!</p>
        <div class="tip-box">
          ⭐ <strong>Golden Rules of Multiplication:</strong>
          <ul>
            <li><strong>The Zero Rule:</strong> Any number × 0 = 0 (e.g. 500 × 0 = 0)</li>
            <li><strong>The Identity Rule:</strong> Any number × 1 = itself (e.g. 78 × 1 = 78)</li>
            <li><strong>The Flip Rule:</strong> 5 × 6 is the exact same as 6 × 5 = 30!</li>
          </ul>
        </div>
      </div>
    `,
    fun_fact: 'Ancient Egyptians used doubling and halving to multiply large numbers thousands of years ago!',
    examples_json: JSON.stringify([
      { question: 'A spider has 8 legs. How many legs do 6 spiders have?', answer: '6 × 8 = 48 legs!' },
      { question: 'What is 12 × 4?', answer: '48 (10 × 4 = 40, plus 2 × 4 = 8, 40 + 8 = 48)' }
    ])
  },

  // Math Lesson: Fractions
  {
    id: 'lesson-math-fractions',
    topic_id: 'math-fractions',
    title: 'Fractions: Sharing Delicious Pizzas!',
    overview: 'Learn how equal parts make a whole, and write fractions like a pro.',
    concept_html: `
      <div class="lesson-card">
        <h3>🍕 What is a Fraction?</h3>
        <p>When you cut a whole pizza into <strong>equal pieces</strong>, each piece is a fraction!</p>
        <div class="fraction-display">
          <span class="frac-num">Numerator (Top: parts you eat/shaded)</span>
          <hr class="frac-line">
          <span class="frac-den">Denominator (Bottom: total equal parts)</span>
        </div>
        <div class="grid-slices">
          <div class="slice-card"><strong>1 / 2</strong><br>Half (1 of 2 equal parts)</div>
          <div class="slice-card"><strong>1 / 3</strong><br>One-Third (1 of 3 equal parts)</div>
          <div class="slice-card"><strong>1 / 4</strong><br>One-Quarter (1 of 4 equal parts)</div>
          <div class="slice-card"><strong>3 / 4</strong><br>Three-Quarters (3 of 4 equal parts)</div>
        </div>
      </div>
    `,
    fun_fact: 'The word "fraction" comes from the Latin word "fractio" which means "to break"!',
    examples_json: JSON.stringify([
      { question: 'A chocolate bar has 6 equal pieces. Aryan ate 2 pieces. What fraction did he eat?', answer: '2/6 (or 1/3)' }
    ])
  },

  // English Lesson: Nouns
  {
    id: 'lesson-eng-nouns',
    topic_id: 'eng-nouns',
    title: 'The Wonderful World of Nouns',
    overview: 'Everything you can see, touch, or name in this universe is a Noun!',
    concept_html: `
      <div class="lesson-card">
        <h3>🏷️ What is a Noun?</h3>
        <p>A <strong>Noun</strong> is a naming word for:</p>
        <div class="noun-categories">
          <div class="noun-cat-pill">👤 <strong>Person:</strong> Teacher, Doctor, Kabir</div>
          <div class="noun-cat-pill">🏰 <strong>Place:</strong> School, Park, Mumbai</div>
          <div class="noun-cat-pill">🦁 <strong>Animal:</strong> Dolphin, Peacock, Tiger</div>
          <div class="noun-cat-pill">🎁 <strong>Thing:</strong> Pencil, Football, Kite</div>
        </div>
        <h4>Common vs. Proper Nouns:</h4>
        <table class="simple-table">
          <tr><th>Common Noun (General)</th><th>Proper Noun (Special Name - Capitalized!)</th></tr>
          <tr><td>boy</td><td>Aarav</td></tr>
          <tr><td>city</td><td>New Delhi</td></tr>
          <tr><td>river</td><td>Ganges</td></tr>
          <tr><td>day / month</td><td>Sunday / October</td></tr>
        </table>
        <h4>🦁 Collective Nouns (Special Group Names):</h4>
        <ul>
          <li>A <strong>pride</strong> of lions</li>
          <li>A <strong>flock</strong> of sheep / birds</li>
          <li>A <strong>fleet</strong> of ships</li>
          <li>A <strong>swarm</strong> of bees</li>
        </ul>
      </div>
    `,
    fun_fact: 'A group of owls is called a "parliament" because in Greek mythology, owls represent great wisdom!',
    examples_json: JSON.stringify([
      { question: 'Find the proper noun in: "My dog Bruno loves playing in the park."', answer: '"Bruno" is the proper noun (capitalized name of a specific dog).' },
      { question: 'What is the plural of "leaf"?', answer: 'Leaves (words ending in -f or -fe change to -ves).' }
    ])
  },

  // English Lesson: Adjectives
  {
    id: 'lesson-eng-adjectives',
    topic_id: 'eng-adjectives',
    title: 'Adjectives: Adding Magic & Color to Words',
    overview: 'Without adjectives, stories would be boring! Adjectives describe size, color, feelings, and sounds.',
    concept_html: `
      <div class="lesson-card">
        <h3>🎨 Describing Words</h3>
        <p>Adjectives describe or give more information about a noun.</p>
        <p>Instead of "The dog barked", say: "The <strong>playful, golden</strong> dog barked at the <strong>giant</strong> butterfly!"</p>
        <div class="adjective-examples">
          <span class="adj-badge">🌈 Color: Blue, Shiny</span>
          <span class="adj-badge">📏 Size: Huge, Tiny, Narrow</span>
          <span class="adj-badge">😋 Taste: Sweet, Sour, Crunchy</span>
          <span class="adj-badge">😊 Feeling: Cheerful, Brave</span>
        </div>
        <h4>Degrees of Comparison:</h4>
        <p>• Tall &rarr; <strong>Taller</strong> (comparing 2) &rarr; <strong>Tallest</strong> (comparing all!)</p>
        <p>• Fast &rarr; <strong>Faster</strong> &rarr; <strong>Fastest</strong></p>
      </div>
    `,
    fun_fact: 'Shakespeare invented hundreds of describing words in English, including "majestic", "gloomy", and "radiant"!',
    examples_json: JSON.stringify([
      { question: 'Identify the adjective: "The thirsty crow found a small pitcher."', answer: '"thirsty" and "small"' }
    ])
  }
];

const questions = [
  // ================= MATHEMATICS QUESTIONS =================
  // Numbers & Place Value
  {
    id: 'q-m-num-1',
    topic_id: 'math-numbers',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'What is the place value of digit 6 in the number 4,682?',
    options_json: JSON.stringify(['6', '60', '600', '6000']),
    correct_answer: '600',
    explanation: 'In 4,682, digit 2 is in Ones, 8 is in Tens, 6 is in Hundreds, and 4 is in Thousands. So the place value of 6 is 6 × 100 = 600.',
    hint: 'Look at which column the number 6 is sitting in: Th H T O.',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-m-num-2',
    topic_id: 'math-numbers',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'What is the expanded form of 7,045?',
    options_json: JSON.stringify([
      '7000 + 400 + 5',
      '7000 + 40 + 5',
      '700 + 40 + 5',
      '7000 + 400 + 50'
    ]),
    correct_answer: '7000 + 40 + 5',
    explanation: '7,045 has 7 Thousands (7000), 0 Hundreds (0), 4 Tens (40), and 5 Ones (5). So 7000 + 40 + 5.',
    hint: 'Notice that there is a zero in the hundreds place!',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-m-num-3',
    topic_id: 'math-numbers',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'Which is the greatest 4-digit number that can be formed using the digits 3, 8, 1, 9 only once?',
    options_json: JSON.stringify(['9813', '9831', '8931', '9381']),
    correct_answer: '9831',
    explanation: 'To form the greatest number, arrange digits in descending order from largest to smallest: 9, 8, 3, 1 = 9,831.',
    hint: 'Put the biggest digit in the thousands place and keep ordering down.',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-m-num-4',
    topic_id: 'math-numbers',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'hard',
    question_text: 'The predecessor of the smallest 4-digit number is:',
    options_json: JSON.stringify(['1001', '999', '1000', '990']),
    correct_answer: '999',
    explanation: 'The smallest 4-digit number is 1,000. Its predecessor is 1000 - 1 = 999 (which is the greatest 3-digit number).',
    hint: 'Predecessor means subtract 1.',
    points: 2,
    is_olympiad: 0
  },

  // Addition & Subtraction
  {
    id: 'q-m-add-1',
    topic_id: 'math-addition-subtraction',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'Add: 345 + 234 = ?',
    options_json: JSON.stringify(['569', '579', '589', '679']),
    correct_answer: '579',
    explanation: 'Ones: 5 + 4 = 9. Tens: 4 + 3 = 7. Hundreds: 3 + 2 = 5. Result: 579.',
    hint: 'Add column by column starting from the ones digit on the right.',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-m-add-2',
    topic_id: 'math-addition-subtraction',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'A fruit seller had 850 mangoes. He sold 375 mangoes. How many mangoes are left?',
    options_json: JSON.stringify(['475', '485', '525', '465']),
    correct_answer: '475',
    explanation: '850 - 375: Borrow 1 ten into ones: 10 - 5 = 5. Tens: 14 - 7 = 7. Hundreds: 7 - 3 = 4. Remaining = 475.',
    hint: 'Subtract 375 from 850 with borrowing.',
    points: 1,
    is_olympiad: 0
  },

  // Multiplication
  {
    id: 'q-m-mul-1',
    topic_id: 'math-multiplication',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'What is 8 × 7?',
    options_json: JSON.stringify(['54', '56', '58', '64']),
    correct_answer: '56',
    explanation: '8 × 7 = 56. (8 multiplied 7 times gives 56).',
    hint: 'Think of 8 × 5 = 40, plus 8 × 2 = 16.',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-m-mul-2',
    topic_id: 'math-multiplication',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'There are 12 eggs in one tray. How many eggs are there in 6 such trays?',
    options_json: JSON.stringify(['62', '70', '72', '84']),
    correct_answer: '72',
    explanation: '12 × 6 = 72 eggs.',
    hint: 'Multiply 12 by 6.',
    points: 1,
    is_olympiad: 0
  },

  // Division
  {
    id: 'q-m-div-1',
    topic_id: 'math-division',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'If 36 candies are distributed equally among 4 children, how many candies will each child receive?',
    options_json: JSON.stringify(['7', '8', '9', '10']),
    correct_answer: '9',
    explanation: '36 ÷ 4 = 9. Because 4 × 9 = 36.',
    hint: 'Recall your 4 times table: 4 × ? = 36.',
    points: 1,
    is_olympiad: 0
  },

  // Fractions
  {
    id: 'q-m-frac-1',
    topic_id: 'math-fractions',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'In the fraction 3/8, what is the denominator?',
    options_json: JSON.stringify(['3', '8', '11', '5']),
    correct_answer: '8',
    explanation: 'In any fraction, the top number is the Numerator and the bottom number is the Denominator. Here, 8 is at the bottom.',
    hint: 'Denominator is Down (bottom number).',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-m-frac-2',
    topic_id: 'math-fractions',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'Which fraction represents one-quarter of a shape?',
    options_json: JSON.stringify(['1/2', '1/3', '1/4', '3/4']),
    correct_answer: '1/4',
    explanation: 'One-quarter means 1 part out of 4 equal parts, which is written as 1/4.',
    hint: 'Quarter refers to 4.',
    points: 1,
    is_olympiad: 0
  },

  // Shapes & Geometry
  {
    id: 'q-m-shp-1',
    topic_id: 'math-shapes',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'How many faces does a standard cube have?',
    options_json: JSON.stringify(['4', '6', '8', '12']),
    correct_answer: '6',
    explanation: 'A cube has 6 flat square faces, like a playing die (dice).',
    hint: 'Think of a dice used in Ludo/Snakes & Ladders.',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-m-shp-2',
    topic_id: 'math-shapes',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'Which shape has NO straight sides and NO corners?',
    options_json: JSON.stringify(['Triangle', 'Rectangle', 'Circle', 'Square']),
    correct_answer: 'Circle',
    explanation: 'A circle is bounded by a single continuous curved line and has 0 vertices (corners) and 0 straight sides.',
    hint: 'Think of a coin or a round plate.',
    points: 1,
    is_olympiad: 0
  },

  // Time & Calendar
  {
    id: 'q-m-tim-1',
    topic_id: 'math-time',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'How many minutes are there in 2 hours?',
    options_json: JSON.stringify(['60', '100', '120', '180']),
    correct_answer: '120',
    explanation: '1 hour = 60 minutes. Therefore, 2 hours = 2 × 60 = 120 minutes.',
    hint: 'Multiply 60 by 2.',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-m-tim-2',
    topic_id: 'math-time',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'How many days are there in a Leap Year?',
    options_json: JSON.stringify(['364', '365', '366', '360']),
    correct_answer: '366',
    explanation: 'A normal year has 365 days, but a Leap Year has 366 days because February has 29 days instead of 28.',
    hint: 'It has one extra day in February.',
    points: 1,
    is_olympiad: 0
  },

  // Money
  {
    id: 'q-m-mon-1',
    topic_id: 'math-money',
    subject_id: 'math-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'How many 50-paise coins make ₹5?',
    options_json: JSON.stringify(['5', '10', '15', '20']),
    correct_answer: '10',
    explanation: '₹1 = two 50-paise coins. So for ₹5, we need 5 × 2 = 10 coins.',
    hint: 'Each Rupee requires two 50-paise coins.',
    points: 1,
    is_olympiad: 0
  },

  // ================= ENGLISH QUESTIONS =================
  // Nouns
  {
    id: 'q-e-noun-1',
    topic_id: 'eng-nouns',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'Which of the following is a Proper Noun?',
    options_json: JSON.stringify(['mountain', 'Himalayas', 'river', 'city']),
    correct_answer: 'Himalayas',
    explanation: '"Himalayas" is the specific name of a mountain range and begins with a capital letter, making it a Proper Noun.',
    hint: 'Look for the word that names a specific entity and starts with a capital letter.',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-e-noun-2',
    topic_id: 'eng-nouns',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'Fill in the collective noun: "A ______ of birds flew across the sunset sky."',
    options_json: JSON.stringify(['pack', 'flock', 'herd', 'swarm']),
    correct_answer: 'flock',
    explanation: 'A group of birds or sheep is called a "flock". A pack is for wolves/dogs, a herd for cows/elephants, and a swarm for bees/insects.',
    hint: 'What group name is commonly used for flying birds and woolly sheep?',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-e-noun-3',
    topic_id: 'eng-nouns',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'What is the plural of "child"?',
    options_json: JSON.stringify(['childs', 'childes', 'children', 'childrens']),
    correct_answer: 'children',
    explanation: '"Child" is an irregular noun. Its plural is "children". Adding "-s" to child is incorrect.',
    hint: 'This word changes its ending completely.',
    points: 1,
    is_olympiad: 0
  },

  // Pronouns
  {
    id: 'q-e-pro-1',
    topic_id: 'eng-pronouns',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'Replace the underlined word with the correct pronoun: "<u>Ananya</u> loves painting."',
    options_json: JSON.stringify(['He', 'She', 'It', 'They']),
    correct_answer: 'She',
    explanation: 'Ananya is a girl\'s name, so the singular feminine pronoun "She" is used.',
    hint: 'Which pronoun represents a girl or woman?',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-e-pro-2',
    topic_id: 'eng-pronouns',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: '"Rohan and I are going to the library. ______ will borrow science books."',
    options_json: JSON.stringify(['They', 'We', 'Us', 'You']),
    correct_answer: 'We',
    explanation: '"Rohan and I" refers to the speaker plus another person, which is replaced by the subject pronoun "We".',
    hint: 'When "I" is included with someone else, it becomes...',
    points: 1,
    is_olympiad: 0
  },

  // Verbs
  {
    id: 'q-e-vrb-1',
    topic_id: 'eng-verbs',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'Choose the correct verb: "The stars ______ brightly in the night sky."',
    options_json: JSON.stringify(['shines', 'shine', 'shining', 'shined']),
    correct_answer: 'shine',
    explanation: '"Stars" is a plural noun, so it takes the plural base verb "shine" without adding -s.',
    hint: 'Plural subject takes the base verb form without "-s".',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-e-vrb-2',
    topic_id: 'eng-verbs',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'Choose the correct helping verb: "I ______ reading an exciting mystery book."',
    options_json: JSON.stringify(['is', 'are', 'am', 'were']),
    correct_answer: 'am',
    explanation: 'The pronoun "I" in present continuous tense always pairs with the helping verb "am".',
    hint: '"I" always pairs with which helping verb in the present tense?',
    points: 1,
    is_olympiad: 0
  },

  // Adjectives
  {
    id: 'q-e-adj-1',
    topic_id: 'eng-adjectives',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'Which word in this sentence is an adjective? "The brave astronaut stepped onto the moon."',
    options_json: JSON.stringify(['astronaut', 'stepped', 'brave', 'moon']),
    correct_answer: 'brave',
    explanation: '"Brave" describes the noun astronaut, telling us what kind of person he was.',
    hint: 'Look for the word that tells you what quality the astronaut had.',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-e-adj-2',
    topic_id: 'eng-adjectives',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'Complete the comparison: "Cheetah is the ______ animal on land."',
    options_json: JSON.stringify(['fast', 'faster', 'fastest', 'more fast']),
    correct_answer: 'fastest',
    explanation: 'When comparing among all animals (superlative degree), we add "-est" after the adjective preceded by "the": the fastest.',
    hint: 'Notice the word "the" before the blank, which indicates superlative degree.',
    points: 1,
    is_olympiad: 0
  },

  // Prepositions
  {
    id: 'q-e-prep-1',
    topic_id: 'eng-prepositions',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'Choose the correct preposition: "The puppy is sleeping ______ the table."',
    options_json: JSON.stringify(['under', 'between', 'into', 'with']),
    correct_answer: 'under',
    explanation: 'A puppy sleeps underneath the surface of a table, so "under" is the correct position preposition.',
    hint: 'Think of where things lie below furniture.',
    points: 1,
    is_olympiad: 0
  },

  // Articles & Conjunctions
  {
    id: 'q-e-art-1',
    topic_id: 'eng-articles',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'easy',
    question_text: 'Fill in the correct article: "He bought ______ honest merchant a cup of tea."',
    options_json: JSON.stringify(['a', 'an', 'the', 'no article needed']),
    correct_answer: 'an',
    explanation: 'Although "honest" begins with the letter "h", the "h" is silent and it starts with a vowel sound "o" (/ɒnɪst/). Therefore, "an" is used.',
    hint: 'Say the word "honest" aloud. Does it start with a vowel sound or consonant sound?',
    points: 1,
    is_olympiad: 0
  },
  {
    id: 'q-e-art-2',
    topic_id: 'eng-articles',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'Combine using a conjunction: "Aryan wanted to play cricket ______ it started raining heavily."',
    options_json: JSON.stringify(['and', 'but', 'so', 'or']),
    correct_answer: 'but',
    explanation: '"But" is used to show contrast or unexpected opposition (wanted to play, BUT rain stopped him).',
    hint: 'Which word connects opposite or contrasting thoughts?',
    points: 1,
    is_olympiad: 0
  },

  // Reading Comprehension
  {
    id: 'q-e-rc-1',
    topic_id: 'eng-comprehension',
    subject_id: 'english-class3',
    section: 'Practice',
    difficulty: 'medium',
    question_text: 'Read: "Miku the squirrel collected twenty acorns before winter. She hid half of them beneath a large oak tree and the other half inside a hollow trunk." How many acorns did Miku hide inside the hollow trunk?',
    options_json: JSON.stringify(['5', '10', '15', '20']),
    correct_answer: '10',
    explanation: 'Total acorns = 20. Half of 20 = 20 ÷ 2 = 10 acorns.',
    hint: 'Divide the total number of acorns by 2.',
    points: 1,
    is_olympiad: 0
  },

  // ================= OLYMPIAD QUESTIONS (IMO & IEO) =================
  // IMO Olympiad Questions
  {
    id: 'q-imo-1',
    topic_id: 'math-numbers',
    subject_id: 'math-class3',
    section: 'Logical Reasoning',
    difficulty: 'medium',
    question_text: 'Find the missing number in the pattern: 120, 140, 160, ______, 200.',
    options_json: JSON.stringify(['170', '175', '180', '190']),
    correct_answer: '180',
    explanation: 'The pattern increases by adding 20 each time: 120 + 20 = 140, 140 + 20 = 160, 160 + 20 = 180.',
    hint: 'Check the difference between consecutive numbers.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-2',
    topic_id: 'math-shapes',
    subject_id: 'math-class3',
    section: 'Logical Reasoning',
    difficulty: 'medium',
    question_text: 'How many triangles are there in a standard star shape with 5 outer points?',
    options_json: JSON.stringify(['5', '8', '10', '12']),
    correct_answer: '10',
    explanation: 'A 5-pointed star contains 5 small outer corner triangles plus 5 larger composite triangles formed with the inner pentagon, making 10 triangles in total.',
    hint: 'Count the 5 small tips first, then look for the bigger overlapping triangles.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-3',
    topic_id: 'math-time',
    subject_id: 'math-class3',
    section: 'Logical Reasoning',
    difficulty: 'hard',
    question_text: 'If yesterday was Tuesday, what day will it be 3 days after tomorrow?',
    options_json: JSON.stringify(['Saturday', 'Sunday', 'Monday', 'Friday']),
    correct_answer: 'Sunday',
    explanation: 'If yesterday was Tuesday, then today is Wednesday. Tomorrow will be Thursday. 3 days after Thursday is: Friday (1), Saturday (2), Sunday (3).',
    hint: 'First find what day today is, then step forward day by day.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-4',
    topic_id: 'math-numbers',
    subject_id: 'math-class3',
    section: 'Mathematical Reasoning',
    difficulty: 'medium',
    question_text: 'Which Roman numeral represents the number 14?',
    options_json: JSON.stringify(['XIIII', 'XIV', 'XVI', 'VIX']),
    correct_answer: 'XIV',
    explanation: 'In Roman numerals, 10 is X and 4 is IV (5 - 1). Combining them gives XIV.',
    hint: 'X is 10 and IV is 4.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-5',
    topic_id: 'math-addition-subtraction',
    subject_id: 'math-class3',
    section: 'Mathematical Reasoning',
    difficulty: 'medium',
    question_text: 'Subtract 1,489 from 3,000. What is the difference?',
    options_json: JSON.stringify(['1,511', '1,611', '1,521', '1,411']),
    correct_answer: '1,511',
    explanation: '3000 - 1489: 3000 - 1000 = 2000; 2000 - 400 = 1600; 1600 - 80 = 1520; 1520 - 9 = 1,511.',
    hint: 'Carefully borrow across all the zeros in 3,000.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-6',
    topic_id: 'math-multiplication',
    subject_id: 'math-class3',
    section: 'Mathematical Reasoning',
    difficulty: 'hard',
    question_text: 'Find the product: 45 × 8 = ?',
    options_json: JSON.stringify(['320', '340', '360', '380']),
    correct_answer: '360',
    explanation: '40 × 8 = 320, and 5 × 8 = 40. 320 + 40 = 360.',
    hint: 'Break 45 into 40 + 5 and multiply both by 8.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-7',
    topic_id: 'math-fractions',
    subject_id: 'math-class3',
    section: 'Mathematical Reasoning',
    difficulty: 'medium',
    question_text: 'Which of the following is equivalent to half (1/2)?',
    options_json: JSON.stringify(['2/3', '2/4', '3/5', '1/4']),
    correct_answer: '2/4',
    explanation: '2/4 simplifies to 1/2 because both numerator and denominator can be divided by 2.',
    hint: 'Which fraction has the numerator as exactly half of its denominator?',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-8',
    topic_id: 'math-shapes',
    subject_id: 'math-class3',
    section: 'Mathematical Reasoning',
    difficulty: 'medium',
    question_text: 'How many edges does a rectangular brick (cuboid) have?',
    options_json: JSON.stringify(['6', '8', '12', '16']),
    correct_answer: '12',
    explanation: 'A cuboid has 6 faces, 8 vertices (corners), and 12 straight edges.',
    hint: 'Count the 4 edges on top, 4 on bottom, and 4 vertical standing edges.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-9',
    topic_id: 'math-money',
    subject_id: 'math-class3',
    section: 'Everyday Mathematics',
    difficulty: 'medium',
    question_text: 'Priya gave a ₹500 note to the shopkeeper. She bought a school bag for ₹345. How much change did she get back?',
    options_json: JSON.stringify(['₹145', '₹155', '₹165', '₹255']),
    correct_answer: '₹155',
    explanation: 'Change = ₹500 - ₹345 = ₹155.',
    hint: 'Subtract 345 from 500.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-10',
    topic_id: 'math-time',
    subject_id: 'math-class3',
    section: 'Everyday Mathematics',
    difficulty: 'medium',
    question_text: 'Rohan started his homework at 5:15 PM and finished it at 6:00 PM. How long did he study?',
    options_json: JSON.stringify(['35 minutes', '40 minutes', '45 minutes', '50 minutes']),
    correct_answer: '45 minutes',
    explanation: 'From 5:15 PM to 6:00 PM is 45 minutes (60 - 15 = 45).',
    hint: 'Count how many minutes from 15 to the full hour 60.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-11',
    topic_id: 'math-division',
    subject_id: 'math-class3',
    section: 'Everyday Mathematics',
    difficulty: 'medium',
    question_text: 'A farmer packed 72 oranges equally into 8 boxes. How many oranges are in each box?',
    options_json: JSON.stringify(['7', '8', '9', '10']),
    correct_answer: '9',
    explanation: '72 ÷ 8 = 9 oranges per box.',
    hint: '8 × ? = 72.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-12',
    topic_id: 'math-numbers',
    subject_id: 'math-class3',
    section: 'Everyday Mathematics',
    difficulty: 'medium',
    question_text: 'In a school library, there are 2,340 Hindi books and 3,210 English books. What is the total number of books?',
    options_json: JSON.stringify(['5,450', '5,550', '5,540', '5,650']),
    correct_answer: '5,550',
    explanation: '2340 + 3210 = 5,550 books.',
    hint: 'Add the two numbers together starting from the ones place.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-13',
    topic_id: 'math-numbers',
    subject_id: 'math-class3',
    section: "Achievers Section",
    difficulty: 'hard',
    question_text: 'I am a 4-digit number. The digit in thousands place is the greatest single-digit number. The hundreds place is half of 8. The tens place is 0, and the ones place is 5. Who am I?',
    options_json: JSON.stringify(['9805', '9405', '8405', '9450']),
    correct_answer: '9405',
    explanation: 'Thousands = 9 (greatest 1-digit number). Hundreds = 4 (half of 8). Tens = 0. Ones = 5. The number is 9,405.',
    hint: 'Check each place digit carefully: Th = 9, H = 4, T = 0, O = 5.',
    points: 2,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-14',
    topic_id: 'math-shapes',
    subject_id: 'math-class3',
    section: "Achievers Section",
    difficulty: 'hard',
    question_text: 'A square field has each side of length 15 metres. An athlete runs completely around the boundary of the field twice. What total distance did he cover?',
    options_json: JSON.stringify(['60 metres', '90 metres', '120 metres', '150 metres']),
    correct_answer: '120 metres',
    explanation: 'Perimeter of square = 4 × 15 = 60 metres for one round. Running twice around = 60 × 2 = 120 metres.',
    hint: 'Find the perimeter (all 4 sides of the square) first, then multiply by 2 rounds.',
    points: 2,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },
  {
    id: 'q-imo-15',
    topic_id: 'math-multiplication',
    subject_id: 'math-class3',
    section: "Achievers Section",
    difficulty: 'hard',
    question_text: 'If 3 apples weigh the same as 6 bananas, and 1 banana weighs 100 grams, what is the weight of 5 apples?',
    options_json: JSON.stringify(['800 grams', '1000 grams', '1200 grams', '600 grams']),
    correct_answer: '1000 grams',
    explanation: '6 bananas = 6 × 100 g = 600 g. Since 3 apples = 600 g, 1 apple = 600 ÷ 3 = 200 g. Therefore, 5 apples = 5 × 200 g = 1,000 grams (1 kg).',
    hint: 'Find the weight of one apple first by dividing 600 g by 3.',
    points: 2,
    is_olympiad: 1,
    olympiad_type: 'imo'
  },

  // IEO Olympiad Questions
  {
    id: 'q-ieo-1',
    topic_id: 'eng-nouns',
    subject_id: 'english-class3',
    section: 'Word & Structure Knowledge',
    difficulty: 'easy',
    question_text: 'Choose the correct spelling of the musical instrument:',
    options_json: JSON.stringify(['Fluit', 'Flute', 'Floot', 'Fluite']),
    correct_answer: 'Flute',
    explanation: 'The correct spelling is F-L-U-T-E.',
    hint: 'It rhymes with mute and cute.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-2',
    topic_id: 'eng-nouns',
    subject_id: 'english-class3',
    section: 'Word & Structure Knowledge',
    difficulty: 'medium',
    question_text: 'What is the feminine gender of "Tiger"?',
    options_json: JSON.stringify(['Tigress', 'Tigeress', 'Tigerness', 'She-tiger']),
    correct_answer: 'Tigress',
    explanation: 'The feminine noun for tiger is Tigress (spelled T-I-G-R-E-S-S).',
    hint: 'The spelling drops the "e" before the "r".',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-3',
    topic_id: 'eng-adjectives',
    subject_id: 'english-class3',
    section: 'Word & Structure Knowledge',
    difficulty: 'medium',
    question_text: 'Which word is the ANTONYM (opposite) of "Generous"?',
    options_json: JSON.stringify(['Kind', 'Selfish', 'Polite', 'Helpful']),
    correct_answer: 'Selfish',
    explanation: '"Generous" means giving and caring for others freely. Its opposite is "Selfish" (or stingy/greedy).',
    hint: 'Think of someone who only thinks about themselves.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-4',
    topic_id: 'eng-verbs',
    subject_id: 'english-class3',
    section: 'Word & Structure Knowledge',
    difficulty: 'medium',
    question_text: 'Choose the correct past tense form: "Yesterday, Tanvi ______ a beautiful greeting card for her grandmother."',
    options_json: JSON.stringify(['make', 'maked', 'made', 'making']),
    correct_answer: 'made',
    explanation: '"Make" is an irregular verb. Its past tense is "made" (not "maked").',
    hint: 'Think of the phrase "handmade" or "ready-made".',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-5',
    topic_id: 'eng-nouns',
    subject_id: 'english-class3',
    section: 'Word & Structure Knowledge',
    difficulty: 'medium',
    question_text: 'Choose the correct homophone: "The rabbit ran across the field into its ______."',
    options_json: JSON.stringify(['whole', 'hole', 'hoel', 'hold']),
    correct_answer: 'hole',
    explanation: '"Hole" is a hollow opening in the ground or burrow. "Whole" means entire or complete.',
    hint: 'A rabbit digs a burrow, which is an opening in the earth.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-6',
    topic_id: 'eng-comprehension',
    subject_id: 'english-class3',
    section: 'Reading Comprehension',
    difficulty: 'medium',
    question_text: 'Read: "A tiny hummingbird flaps its wings up to eighty times per second. It is the only bird on Earth that can fly backwards and even upside down!" Why is the hummingbird unique among birds?',
    options_json: JSON.stringify([
      'It lays the biggest eggs',
      'It can fly backwards and upside down',
      'It cannot fly in winter',
      'It sings during midnight'
    ]),
    correct_answer: 'It can fly backwards and upside down',
    explanation: 'The passage explicitly states that it is the only bird on Earth that can fly backwards and upside down.',
    hint: 'Look for what the passage says is "the only bird on Earth that can...".',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-7',
    topic_id: 'eng-comprehension',
    subject_id: 'english-class3',
    section: 'Reading Comprehension',
    difficulty: 'medium',
    question_text: 'According to the passage above, how many times can a hummingbird flap its wings per second?',
    options_json: JSON.stringify(['18 times', '80 times', '8 times', '800 times']),
    correct_answer: '80 times',
    explanation: 'The sentence states: "flaps its wings up to eighty (80) times per second."',
    hint: 'Eighty is written as 80.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-8',
    topic_id: 'eng-comprehension',
    subject_id: 'english-class3',
    section: 'Reading Comprehension',
    difficulty: 'medium',
    question_text: 'What is the synonym of the word "tiny" used in the first sentence?',
    options_json: JSON.stringify(['Enormous', 'Miniature / Very small', 'Heavy', 'Fierce']),
    correct_answer: 'Miniature / Very small',
    explanation: '"Tiny" means exceptionally small or miniature.',
    hint: 'Opposite of huge.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-9',
    topic_id: 'eng-verbs',
    subject_id: 'english-class3',
    section: 'Spoken & Written Expression',
    difficulty: 'easy',
    question_text: 'Choose the most polite response to: "Could you please pass me the salt?"',
    options_json: JSON.stringify([
      'No, take it yourself.',
      'Certainly, here you go!',
      'Why should I?',
      'Later.'
    ]),
    correct_answer: 'Certainly, here you go!',
    explanation: '"Certainly, here you go!" is a polite and courteous reply in spoken English.',
    hint: 'Look for the kindest and most respectful answer.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-10',
    topic_id: 'eng-articles',
    subject_id: 'english-class3',
    section: 'Spoken & Written Expression',
    difficulty: 'medium',
    question_text: 'Choose the correct punctuation mark for the sentence: "What a marvelous rainbow that is______"',
    options_json: JSON.stringify(['.', '?', '!', ',']),
    correct_answer: '!',
    explanation: 'Sentences expressing strong wonder, joy, or exclamation (like "What a marvelous rainbow...!") end with an exclamation mark (!).',
    hint: 'This expresses excitement and wonder.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-11',
    topic_id: 'eng-nouns',
    subject_id: 'english-class3',
    section: 'Spoken & Written Expression',
    difficulty: 'medium',
    question_text: 'Which prefix can be added to the word "happy" to mean "not happy"?',
    options_json: JSON.stringify(['dis-', 'un-', 'im-', 'in-']),
    correct_answer: 'un-',
    explanation: 'Adding "un-" to happy creates "unhappy", which means not happy or sad.',
    hint: 'The word is: un + happy = unhappy.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-12',
    topic_id: 'eng-tenses',
    subject_id: 'english-class3',
    section: 'Spoken & Written Expression',
    difficulty: 'medium',
    question_text: 'Select the correct sentence:',
    options_json: JSON.stringify([
      'The children is playing in the garden.',
      'The children are playing in the garden.',
      'The children was playing in the garden.',
      'The children has playing in the garden.'
    ]),
    correct_answer: 'The children are playing in the garden.',
    explanation: '"Children" is a plural noun, so it requires the plural helping verb "are".',
    hint: '"Children" means more than one child.',
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-13',
    topic_id: 'eng-nouns',
    subject_id: 'english-class3',
    section: "Achievers Section",
    difficulty: 'hard',
    question_text: 'Which of the following contains an error in the use of collective noun?',
    options_json: JSON.stringify([
      'A herd of cattle was grazing.',
      'A bouquet of flowers was presented to the guest.',
      'A pack of cows stood near the pond.',
      'A pride of lions rested under the acacia tree.'
    ]),
    correct_answer: 'A pack of cows stood near the pond.',
    explanation: 'Cows form a "herd", not a "pack". "Pack" is used for wolves or playing cards.',
    hint: 'Which animal group name matches wolves, but NOT cows?',
    points: 2,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-14',
    topic_id: 'eng-nouns',
    subject_id: 'english-class3',
    section: "Achievers Section",
    difficulty: 'hard',
    question_text: 'Identify the compound word formed by combining two smaller meaningful words:',
    options_json: JSON.stringify(['Rainbow', 'Holiday', 'Wonderful', 'Yesterday']),
    correct_answer: 'Rainbow',
    explanation: '"Rainbow" is a compound word formed from "Rain" + "Bow". Both are separate standalone words.',
    hint: 'Look for two complete everyday words joined together.',
    points: 2,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  },
  {
    id: 'q-ieo-15',
    topic_id: 'eng-verbs',
    subject_id: 'english-class3',
    section: "Achievers Section",
    difficulty: 'hard',
    question_text: 'Complete the proverb: "A stitch in time saves ______."',
    options_json: JSON.stringify(['ten', 'five', 'nine', 'all']),
    correct_answer: 'nine',
    explanation: 'The classic proverb is "A stitch in time saves nine", meaning fixing a small problem right away prevents bigger trouble later.',
    hint: 'It is a number between eight and ten.',
    points: 2,
    is_olympiad: 1,
    olympiad_type: 'ieo'
  }
];

const olympiadExams = [
  {
    id: 'olympiad-imo-class3',
    code: 'IMO-C3-2026',
    title: 'International Mathematics Olympiad (IMO) - Class III Mock',
    subject_id: 'math-class3',
    grade: 3,
    total_questions: 15,
    duration_minutes: 15,
    total_marks: 18, // 12 questions * 1 point + 3 achiever * 2 points = 18 points
    description: 'Official SOF-style Class III Mathematics Olympiad covering Logical Reasoning, Mathematical Reasoning, Everyday Math, and Achievers Section.',
    sections_json: JSON.stringify([
      { name: 'Logical Reasoning', count: 3, marksPerQuestion: 1 },
      { name: 'Mathematical Reasoning', count: 5, marksPerQuestion: 1 },
      { name: 'Everyday Mathematics', count: 4, marksPerQuestion: 1 },
      { name: 'Achievers Section', count: 3, marksPerQuestion: 2 }
    ])
  },
  {
    id: 'olympiad-ieo-class3',
    code: 'IEO-C3-2026',
    title: 'International English Olympiad (IEO) - Class III Mock',
    subject_id: 'english-class3',
    grade: 3,
    total_questions: 15,
    duration_minutes: 15,
    total_marks: 18,
    description: 'Official SOF-style Class III English Olympiad covering Word & Structure Knowledge, Reading Comprehension, Spoken Expression, and Achievers Section.',
    sections_json: JSON.stringify([
      { name: 'Word & Structure Knowledge', count: 5, marksPerQuestion: 1 },
      { name: 'Reading Comprehension', count: 4, marksPerQuestion: 1 },
      { name: 'Spoken & Written Expression', count: 3, marksPerQuestion: 1 },
      { name: 'Achievers Section', count: 3, marksPerQuestion: 2 }
    ])
  }
];

function seedDatabase() {
  const existingSubject = dbAdapter.queryOne('SELECT COUNT(*) as count FROM subjects');
  if (existingSubject && existingSubject.count > 0) {
    console.log('🌱 Database already seeded. Total subjects:', existingSubject.count);
    return;
  }

  console.log('🌱 Seeding TalentHunt CBSE Class III database...');

  // Seed Subjects
  for (const sub of subjects) {
    dbAdapter.execute(
      `INSERT INTO subjects (id, slug, name, icon, color, description, grade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sub.id, sub.slug, sub.name, sub.icon, sub.color, sub.description, sub.grade]
    );
  }

  // Seed Topics
  for (const topic of topics) {
    dbAdapter.execute(
      `INSERT INTO topics (id, subject_id, slug, title, order_num, icon, summary, key_rules)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [topic.id, topic.subject_id, topic.slug, topic.title, topic.order_num, topic.icon, topic.summary, topic.key_rules]
    );
  }

  // Seed Lessons
  for (const lesson of lessons) {
    dbAdapter.execute(
      `INSERT INTO lessons (id, topic_id, title, overview, concept_html, fun_fact, examples_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [lesson.id, lesson.topic_id, lesson.title, lesson.overview, lesson.concept_html, lesson.fun_fact, lesson.examples_json]
    );
  }

  // Seed Questions
  for (const q of questions) {
    dbAdapter.execute(
      `INSERT INTO questions (id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, explanation, hint, points, is_olympiad, olympiad_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [q.id, q.topic_id, q.subject_id, q.section, q.difficulty, q.question_text, q.options_json, q.correct_answer, q.explanation, q.hint, q.points, q.is_olympiad, q.olympiad_type || null]
    );
  }

  // Seed Olympiad Exams
  for (const exam of olympiadExams) {
    dbAdapter.execute(
      `INSERT INTO olympiad_exams (id, code, title, subject_id, grade, total_questions, duration_minutes, total_marks, description, sections_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [exam.id, exam.code, exam.title, exam.subject_id, exam.grade, exam.total_questions, exam.duration_minutes, exam.total_marks, exam.description, exam.sections_json]
    );
  }

  console.log('✅ Seeding completed successfully!');
}

module.exports = {
  subjects,
  topics,
  lessons,
  questions,
  olympiadExams,
  seedDatabase
};
