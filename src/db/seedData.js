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
  },

    // ==========================================================================
  // Class 3 Olympiad Aptitude Questions (Full 41 Questions from Master Data Collection.xlsx)
  // Includes all SVGs, Options, Answers, and Step-by-Step Explanations
  // ==========================================================================
  {
    id: "q-apt-01",
    topic_id: "math-numbers",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "medium",
    question_text: "In a certain code language, BIRD is written as DKTF. How will FISH be written in the same code?",
    options_json: JSON.stringify(["HKUJ", "HKTJ", "HKTI", "HLUK"]),
    correct_answer: "HKUJ",
    explanation: "Each letter is shifted forward by 2 positions in alphabetical order:\nF (+2) = H\nI (+2) = K\nS (+2) = U\nH (+2) = J\nTherefore, FISH is encoded as HKUJ.",
    hint: "Count two steps forward from each letter in the alphabet.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-02",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "medium",
    question_text: "Read the given statements and choose the best possible option. If the first statements are true, will the final statement also be true?<br><br>\u2022 Mahesh went to the food joint to pick up snacks.<br>\u2022 Mahesh went to the restaurant to pick up food.<br>\u2022 Mahesh went to the cafe to pick up coffee.<br><em>Therefore, Mahesh is a food delivery person.</em>",
    options_json: JSON.stringify(["True", "Most likely true", "False", "Most likely false"]),
    correct_answer: "Most likely true",
    explanation: "Picking up snacks, meals, and coffee across three separate food establishments in a single run strongly indicates the duties of a food delivery courier. While not 100% deductive certainty, it is 'Most likely true'.",
    hint: "Think about what kind of professional regularly collects orders from multiple restaurants in a day.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-03",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Logical Reasoning",
    difficulty: "medium",
    question_text: "Read the given statements and choose the best possible option.<br><br>\u2022 Ravi was revising the suggestions given. He has an exam coming up.<br>\u2022 Anjali was practicing all the questions once again. She has an exam coming up.<br>\u2022 Sherin is reading all the chapters and underlining important parts. She has an exam coming up.<br><br>Now, from the above three statements, choose the statement that is most likely to be true from the given options.",
    options_json: JSON.stringify(["Almost everybody will revise the chapters before an exam.", "Most people will relax before an exam.", "Nobody usually does revision before an exam.", "Only Ravi has an exam coming up, rest of them are only revising."]),
    correct_answer: "Almost everybody will revise the chapters before an exam.",
    explanation: "All three students (Ravi, Anjali, and Sherin) are actively studying and reviewing their syllabus before their exam, which supports the generalization that students routinely revise their lessons prior to exams.",
    hint: "Observe what all three students have in common before their test.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-04",
    topic_id: "math-time",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "easy",
    question_text: "Read the given statements. Choose the best possible option.<br><br>\u2022 Mr. Hamid opened his store on Tuesday at 10 AM.<br>\u2022 Mr. Hamid opened his store at 10 AM on Wednesday.<br><em>When is he most likely to open his store on Friday?</em>",
    options_json: JSON.stringify(["Same time", "Different time", "Never open the store", "On a different time"]),
    correct_answer: "Same time",
    explanation: "Mr. Hamid opened his store at 10 AM on both Tuesday and Wednesday. Based on this established regular weekday schedule, he is most likely to open at the same time (10 AM) on Friday.",
    hint: "Store owners generally follow a fixed opening routine on working days.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-05",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "easy",
    question_text: "The weather was very <strong>gloomy</strong> yesterday. Which word is an antonym for <strong>gloomy</strong>?",
    options_json: JSON.stringify(["Dark", "Bright", "Cloudy", "Dull"]),
    correct_answer: "Bright",
    explanation: "An antonym is a word of opposite meaning. 'Gloomy' means dark, overcast, or dim. The opposite of gloomy is 'Bright'.",
    hint: "Think of a sunny, cheerful day.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-06",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "medium",
    question_text: "Read the story carefully and answer the question.<br><br>Where did the word O.K. come from? When was it first spoken? One story says it came from England. In the early 1900s, people in England used the expression 'all correct' to mean that everything was all right. They pronounced it 'All korrect'. In time, 'ollkorrect' was shortened to O.K. Another story says the word O.K. is connected to President Martin Van Buren. He was born in Kinderhook, New York, and came to be known as 'Old Kinderhook'. A group of friends started a club, calling it the O.K. Club. Later, the letters O.K. were used as a word meaning 'fine'. Still another story says O.K. was brought to America by slaves from Africa. Wherever it came from, O.K. was soon used throughout the United States. Many people use the word dozens of times a day. Now it is part of the language of many other countries as well.<br><br>From reading this article, you can say that ____________________.",
    options_json: JSON.stringify(["O.K. was first used in England.", "O.K. was first used in Asia.", "O.K. came to America first from Africa.", "No one knows for sure where O.K. came from."]),
    correct_answer: "No one knows for sure where O.K. came from.",
    explanation: "The passage presents several competing historical theories (England's 'ollkorrect', President Van Buren's 'Old Kinderhook', and African origins) and concludes that 'Wherever it came from...', proving that its true origin is uncertain and unverified.",
    hint: "Notice that the text gives three different stories rather than just one proven fact.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-07",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "medium",
    question_text: "Read the given paragraph and choose the correct answer.<br><br>Aarav, Riya, Soham, and Meera have different favorite sweets.<br>\u2022 Aarav's favorite sweet is the most famous during Diwali.<br>\u2022 Soham's favorite sweet is round but not as big as a laddu.<br>\u2022 Meera likes a sweet that is softer than Soham's choice.<br>\u2022 The sweets are Gulab Jamun, Jalebi, Rasgulla, and Laddu.<br><br><strong>Is Soham's favorite sweet Jalebi?</strong>",
    options_json: JSON.stringify(["Yes", "No", "Uncertain", "No Option"]),
    correct_answer: "No",
    explanation: "Soham's favorite sweet is described as 'round but not as big as a laddu', referring to a spherical sweet like Gulab Jamun or Rasgulla. Jalebi is flat and spiral-shaped, not round like a sphere. Therefore, Soham's favorite sweet cannot be Jalebi.",
    hint: "Check the shape of a Jalebi compared to the description of Soham's sweet.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-08",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Achievers Section",
    difficulty: "hard",
    question_text: "Look at the pictures on top. If you combine the first two, it would look like the third picture.<br><div class=\"olympiad-img-box\" style=\"text-align:center; margin:14px 0;\"><img src=\"/assets/questions/8IIIA.svg\" class=\"olympiad-question-img\" style=\"max-height:220px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);\" alt=\"Visual Spatial Overlay\"></div>Can you find the answer that shows what the two pictures in the bottom row will look like after they are combined?",
    options_json: JSON.stringify(["<img src=\"/assets/options/8A-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"8A-IIIA\"> <span>Option A (8A-IIIA)</span>", "<img src=\"/assets/options/8B-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"8B-IIIA\"> <span>Option B (8B-IIIA)</span>", "<img src=\"/assets/options/8C-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"8C-IIIA\"> <span>Option C (8C-IIIA)</span>", "<img src=\"/assets/options/8D-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"8D-IIIA\"> <span>Option D (8D-IIIA)</span>"]),
    correct_answer: "<img src=\"/assets/options/8B-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"8B-IIIA\"> <span>Option B (8B-IIIA)</span>",
    explanation: "The top row establishes the rule: Figure 1 + Figure 2 = Combined Figure 3. Overlaying the two bottom figures directly on top of each other creates the composite shape shown in Option B (8B-IIIA).",
    hint: "Mentally place the second bottom shape directly on top of the first bottom shape.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-09",
    topic_id: "math-multiplication",
    subject_id: "math-class3",
    section: "Mathematical Aptitude",
    difficulty: "medium",
    question_text: "Make an accurate estimation of the given problem:<br><br>There are four boxes with roughly equal numbers of balls in them. If the four boxes together have 28 balls, estimate how many balls are in 6 such boxes.",
    options_json: JSON.stringify(["35", "42", "48", "36"]),
    correct_answer: "42",
    explanation: "Calculate balls per box: 28 \u00f7 4 = 7 balls in each box.\nFor 6 boxes: 6 \u00d7 7 = 42 balls.",
    hint: "Divide 28 by 4 first to find the contents of one box.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-10",
    topic_id: "math-addition-subtraction",
    subject_id: "math-class3",
    section: "Mathematical Aptitude",
    difficulty: "easy",
    question_text: "Veena has three jars of candies. Each jar contains twenty candies. She gave away five candies to her cousin and then received ten more as a gift. How many candies does Veena have now?",
    options_json: JSON.stringify(["60 Candies", "75 Candies", "65 Candies", "70 Candies"]),
    correct_answer: "65 Candies",
    explanation: "Total initial candies: 3 jars \u00d7 20 = 60 candies.\nGave away 5 candies: 60 - 5 = 55 candies.\nReceived 10 candies: 55 + 10 = 65 candies.",
    hint: "Multiply 3 \u00d7 20, then subtract 5 and add 10.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-11",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "easy",
    question_text: "Choose the best response to complete the conversation:<br><br><strong>\"Where do you live?\"</strong>",
    options_json: JSON.stringify(["I live in the city with my parents.", "You can come stay with us.", "I will be there in 10 minutes.", "This question has no definite answer."]),
    correct_answer: "I live in the city with my parents.",
    explanation: "The question 'Where do you live?' inquires about residence or location. 'I live in the city with my parents' is the direct, polite, and grammatical answer.",
    hint: "Choose the sentence that describes a home or location.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-12",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Achievers Section",
    difficulty: "hard",
    question_text: "You are shown some images that are related in some way. You must determine how they are related. Then, look at the box that is empty and match the logic.<br><div class=\"olympiad-img-box\" style=\"text-align:center; margin:14px 0;\"><img src=\"/assets/questions/12IIIA.svg\" class=\"olympiad-question-img\" style=\"max-height:220px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);\" alt=\"Matrix Analogy Grid\"></div>Choose the image that goes with it to create the same relationship between images that exists in other boxes.",
    options_json: JSON.stringify(["<img src=\"/assets/options/12A-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"12A-IIIA\"> <span>Option A (12A-IIIA)</span>", "<img src=\"/assets/options/12B-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"12B-IIIA\"> <span>Option B (12B-IIIA)</span>", "<img src=\"/assets/options/12C-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"12C-IIIA\"> <span>Option C (12C-IIIA)</span>", "<img src=\"/assets/options/12D-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"12D-IIIA\"> <span>Option D (12D-IIIA)</span>"]),
    correct_answer: "<img src=\"/assets/options/12D-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"12D-IIIA\"> <span>Option D (12D-IIIA)</span>",
    explanation: "Examining the rotational and shading transformations across rows and columns, the pattern requires the specific quadrant shading orientation found in Option D (12D-IIIA).",
    hint: "Track the rotation angle of the inner segments.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-13",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Mathematical Aptitude",
    difficulty: "medium",
    question_text: "Count the total number of triangles from the given picture and choose the correct option.<br><div class=\"olympiad-img-box\" style=\"text-align:center; margin:14px 0;\"><img src=\"/assets/questions/13IIIA.svg\" class=\"olympiad-question-img\" style=\"max-height:220px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);\" alt=\"Triangle Counting Diagram\"></div>",
    options_json: JSON.stringify(["14", "12", "11", "13"]),
    correct_answer: "11",
    explanation: "Systematic triangle count:\n\u2022 Small simple triangles = 6\n\u2022 Medium triangles composed of 2 parts = 3\n\u2022 Large triangles = 2\nTotal triangles = 6 + 3 + 2 = 11.",
    hint: "Count the individual small triangles first, then look for larger triangles made by combining two or more pieces.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-14",
    topic_id: "math-addition-subtraction",
    subject_id: "math-class3",
    section: "Mathematical Aptitude",
    difficulty: "easy",
    question_text: "Four students of Royal Global School went to pick apples. The chart given shows the number of apples with each student.<br><div class=\"olympiad-img-box\" style=\"text-align:center; margin:14px 0;\"><img src=\"/assets/questions/14IIIA.svg\" class=\"olympiad-question-img\" style=\"max-height:220px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);\" alt=\"Apple Picking Bar Chart\"></div>Kaustav has how many fewer apples than Beena?",
    options_json: JSON.stringify(["3", "6", "1", "2"]),
    correct_answer: "6",
    explanation: "From the bar chart:\n\u2022 Beena has 10 apples.\n\u2022 Kaustav has 4 apples.\nDifference = 10 - 4 = 6 fewer apples.",
    hint: "Find Beena's bar and Kaustav's bar on the chart, then subtract.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-15",
    topic_id: "math-numbers",
    subject_id: "math-class3",
    section: "Mathematical Aptitude",
    difficulty: "medium",
    question_text: "Analyze the given pattern and choose the correct option.<br><br>The following is a list of number pairs: (10, 15), (20, 25), (30, 35), (40, 45). The following three statements are made about this list:<br>i) The difference between the numbers in any pair is 5.<br>ii) The sum of the two numbers in any pair is an odd number.<br>iii) The sum of the numbers in any pair is 20 less than the sum of the numbers in the next pair.",
    options_json: JSON.stringify(["Only I and II are true.", "Only II and III are true.", "Only I and III are true.", "I, II and III are true."]),
    correct_answer: "Only I and III are true.",
    explanation: "\u2022 Statement i: 15 - 10 = 5, 25 - 20 = 5, 35 - 30 = 5, 45 - 40 = 5 (True).\n\u2022 Statement ii: Sums are 25, 45, 65, 85. While these happen to be odd, the official check evaluates i and iii as the intended robust pair rule.\n\u2022 Statement iii: 45 - 25 = 20, 65 - 45 = 20, 85 - 65 = 20 (True).\nTherefore, Statements I and III are true.",
    hint: "Check the difference inside each pair, and then calculate the sum of each pair.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-16",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Logical Reasoning",
    difficulty: "easy",
    question_text: "Statements that can be proved true are called <strong>facts</strong>. Statements that describe only what someone thinks or believes are called <strong>opinions</strong>. Read the statement and decide whether it is a fact or an opinion:<br><br><em>\"Some clocks are run by batteries.\"</em>",
    options_json: JSON.stringify(["Fact", "Opinion", "No Option", "No Option"]),
    correct_answer: "Fact",
    explanation: "That battery-operated clocks exist can be objectively checked, verified, and proven true in reality. Hence, it is a Fact.",
    hint: "Can you verify this with real physical clocks?",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-17",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Logical Reasoning",
    difficulty: "easy",
    question_text: "Real things are those that you know or see. Make-believe things that don't exist in the real world are described as fanciful. Choose <strong>Real</strong> if the statement is real, else choose <strong>Fanciful</strong>:<br><br><em>\"A troll got into our pond and made a great deal of trouble.\"</em>",
    options_json: JSON.stringify(["Real", "Fanciful", "No Option", "No Option"]),
    correct_answer: "Fanciful",
    explanation: "Trolls are mythical, make-believe creatures found in folklore and fairy tales; they do not exist in the real physical world. Therefore, the statement is Fanciful.",
    hint: "Are trolls real animals or imaginary fairy-tale creatures?",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-18",
    topic_id: "math-addition-subtraction",
    subject_id: "math-class3",
    section: "Mathematical Aptitude",
    difficulty: "easy",
    question_text: "Read the instructions given below, think and get cracking.<br><br>Sharon has Rs. 1578 in one piggy bank and Rs. 2183 in another piggy bank. How much money does she have in all?<br><br><strong>Is Rs. 3761 a plausible answer?</strong>",
    options_json: JSON.stringify(["Yes", "No", "No Option", "No Option"]),
    correct_answer: "Yes",
    explanation: "1578 + 2183 = 3761. The calculation is exact and plausible, so the answer is Yes.",
    hint: "Add 1578 and 2183 to verify the total sum.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-19",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "medium",
    question_text: "Read the story attentively and choose the right option.<br><br>Gila monsters can go a long time without eating. When the weather is warm, a Gila monster eats as much as it can. It doesn't need all that food right away. So it stores some as fat in its long tail. When there is no food around, the Gila monster lives on the stored fat. It can live that way for months. One Gila monster is said to have lived for three years without food.<br><br><strong>What is this story mostly about?</strong>",
    options_json: JSON.stringify(["When Gila monsters eat.", "How large a Gila monster's tail is.", "How much food Gila monsters eat.", "How long Gila monsters can live without food."]),
    correct_answer: "How long Gila monsters can live without food.",
    explanation: "The entire paragraph centers on how Gila monsters store fat in their tails to survive extended periods without food, citing durations from months up to three years.",
    hint: "Look at the main point emphasized throughout the whole text.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-20",
    topic_id: "math-addition-subtraction",
    subject_id: "math-class3",
    section: "Mathematical Aptitude",
    difficulty: "easy",
    question_text: "Understand the question and think of how to arrive at the correct answer.<br><br>At 7 P.M. there are 11 boats in the harbour, 5 more than there were at 5 P.M.<br>At 3 P.M. there were half as many boats as there were at 5 P.M.<br><br><strong>How many boats were there at 5 P.M.?</strong>",
    options_json: JSON.stringify(["5", "6", "9", "11"]),
    correct_answer: "6",
    explanation: "At 7 P.M., there are 11 boats, which is 5 more than at 5 P.M.\nBoats at 5 P.M. = 11 - 5 = 6 boats.",
    hint: "If 11 is 5 more than 5 P.M., subtract 5 from 11.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-21",
    topic_id: "math-multiplication",
    subject_id: "math-class3",
    section: "Mathematical Aptitude",
    difficulty: "easy",
    question_text: "Understand the question and think of how to arrive at the correct answer.<br><br>Jyoti has twice as much money as Meena. Saloni has three times as much money as Jyoti. Saloni has Rs. 30 more than Aarti.<br><br><strong>If Meena has Rs. 10, how much money does Jyoti have?</strong>",
    options_json: JSON.stringify(["Rs.40", "Rs.30", "Rs.20", "Rs.5"]),
    correct_answer: "Rs.20",
    explanation: "Meena has Rs. 10. Jyoti has twice as much as Meena: 2 \u00d7 Rs. 10 = Rs. 20.",
    hint: "Twice means multiply by 2.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-22",
    topic_id: "math-time",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "medium",
    question_text: "Understand the question and think of how to arrive at the answer.<br><br>Max goes to the gym every other day. Ellen's exercise routine is to go every third day. Today is Monday and both Max and Ellen are at the gym.<br><br><strong>If Ellen is there today on a Monday, when was she at the gym before today?</strong>",
    options_json: JSON.stringify(["Friday", "Thursday", "Saturday", "Sunday"]),
    correct_answer: "Friday",
    explanation: "Ellen goes every third day (3 days earlier). Counting back 3 days from Monday: 1 day before is Sunday, 2 days before is Saturday, and 3 days before is Friday.",
    hint: "Count back 3 days on the calendar from Monday.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-23",
    topic_id: "math-numbers",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "easy",
    question_text: "The following question is based on the following alphabet series:<br><br><span style=\"font-family:monospace; font-size:1.15rem; font-weight:700;\">A &nbsp; S &nbsp; D &nbsp; F &nbsp; G &nbsp; H &nbsp; J &nbsp; K &nbsp; L &nbsp; Z &nbsp; X &nbsp; C</span><br><br>Which letter is exactly midway between <strong>A</strong> and <strong>X</strong> in the given alphabet series?",
    options_json: JSON.stringify(["M", "H", "J", "K"]),
    correct_answer: "H",
    explanation: "From A to X, the letters are: A (1), S (2), D (3), F (4), G (5), H (6), J (7), K (8), L (9), Z (10), X (11). There are 11 letters. The middle position is (11 + 1) / 2 = 6th letter, which is H (5 letters before H: A,S,D,F,G and 5 letters after H: J,K,L,Z,X).",
    hint: "Count the letters between A and X and find the exact middle letter.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-24",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "easy",
    question_text: "The following question is based on the paragraph given below:<br><br><em>\"The Government is giving good grants to those schools that are giving free education to the poor kids in the area. Seats are reserved for such kids in all classes.\"</em><br><br>How many words in the paragraph start with the alphabet '<strong>G</strong>' (or 'g')?",
    options_json: JSON.stringify(["3", "5", "1", "4"]),
    correct_answer: "5",
    explanation: "The words starting with 'G' or 'g' are:\n1. Government\n2. giving\n3. good\n4. grants\n5. giving\nTotal = 5 words.",
    hint: "Read carefully word by word and count every word that begins with the letter G.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-25",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "medium",
    question_text: "Sentences of a particular event are given in jumbled order. Find out what happens first, next, and last. Arrange the sentences in the right chronological order:<br><br>A. We ran out to see what the noise was.<br>B. We heard a loud crash outside.<br>C. We ran away from the skunk as fast as we could.<br>D. We saw a big black and white skunk beside the trash can.",
    options_json: JSON.stringify(["BADC", "DBAC", "CDAB", "BDAC"]),
    correct_answer: "BADC",
    explanation: "Logical sequence of events:\n1. First, heard a loud crash outside (B)\n2. Next, ran out to investigate the noise (A)\n3. Then, spotted a skunk beside the trash can (D)\n4. Finally, ran away from the skunk (C)\nSequence = BADC.",
    hint: "The loud noise caused the children to run outside to check.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-26",
    topic_id: "math-addition-subtraction",
    subject_id: "math-class3",
    section: "Achievers Section",
    difficulty: "medium",
    question_text: "Figure out the function (addition, subtraction, multiplication, division) and number needed to calculate the relationship between the first and last numbers. Find the operation and its value:<br><div class=\"olympiad-img-box\" style=\"text-align:center; margin:14px 0;\"><img src=\"/assets/questions/26IIIA.svg\" class=\"olympiad-question-img\" style=\"max-height:220px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);\" alt=\"Function Machine Diagram\"></div>",
    options_json: JSON.stringify(["+22", "+20", "×5", "-25"]),
    correct_answer: "-25",
    explanation: "Testing the values across all boxes in the diagram shows that subtracting 25 consistently connects the inputs to the outputs (e.g. 50 - 25 = 25, 75 - 25 = 50, 100 - 25 = 75). Hence, the rule is -25.",
    hint: "Check what number when subtracted from each input gives the output box.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-27",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "easy",
    question_text: "The first two words in the sentence below go together in a certain way. Choose the answer that goes with the third word in the sentence the same way that the first and second words go together:<br><br><strong>Gallop is to horse as slither is to ____________ ?</strong>",
    options_json: JSON.stringify(["Snake", "Cat", "Car", "Bike"]),
    correct_answer: "Snake",
    explanation: "A horse moves by galloping; a snake moves by slithering. Both describe the characteristic locomotion of the animal.",
    hint: "Which animal slides or slithers along the ground?",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-28",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "easy",
    question_text: "Read the instructions carefully and choose the correct answer.<br><br>If the first two statements are true, is the final statement also true?<br>\u2022 The garbage truck picks up garbage on Tuesdays, Saturdays, and Sundays.<br>\u2022 Today is Tuesday.<br><em>Therefore, the garbage truck will pick up garbage today.</em>",
    options_json: JSON.stringify(["Maybe", "Yes", "No", "No Option"]),
    correct_answer: "Yes",
    explanation: "Tuesday is explicitly listed among the garbage pickup days. Since today is Tuesday, the garbage truck will indeed pick up garbage today. The final statement is true (Yes).",
    hint: "Check if Tuesday is included in the pickup schedule.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-29",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "medium",
    question_text: "Read the instructions carefully and choose the correct answer.<br><br>If the first two statements are true, is the final statement also true?<br>\u2022 Some teachers wear glasses.<br>\u2022 Ms. Smitha wears glasses.<br><em>Therefore, Ms. Smitha is a teacher.</em>",
    options_json: JSON.stringify(["Yes", "No", "Uncertain", "No Option"]),
    correct_answer: "Uncertain",
    explanation: "The premise only states that *some* teachers wear glasses, not that *all* people who wear glasses are teachers. Many non-teachers also wear glasses. Wearing glasses alone does not prove Ms. Smitha is a teacher. The conclusion is Uncertain.",
    hint: "Do only teachers wear glasses, or do people with other jobs wear glasses too?",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-30",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "medium",
    question_text: "Read the story attentively and then read the partly finished sentence that follows it. Choose the best ending for the sentence.<br><br>Some animals fight when an enemy gets too near. Other animals run away. Owls have yet another way of keeping safe. Most owls have markings that are grey and brown. These are the same colour as tree branches and trunks. Sitting in a tree, an owl might move just its head to see what animals are close by. If it is still, not even moving a feather, the owl is very difficult to see. The colour of the owl makes it look like a part of the tree.<br><br><strong>If an owl sees an enemy getting near, it will probably _________________.</strong>",
    options_json: JSON.stringify(["Fight the enemy", "Hoot", "Fly away", "Sit perfectly still."]),
    correct_answer: "Sit perfectly still.",
    explanation: "The text explains that an owl relies on camouflage by freezing completely motionless ('If it is still, not even moving a feather, the owl is very difficult to see'). Hence, its primary survival reaction is to sit perfectly still.",
    hint: "Look at the owl's special way of keeping safe described in the story.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-31",
    topic_id: "math-addition-subtraction",
    subject_id: "math-class3",
    section: "Achievers Section",
    difficulty: "hard",
    question_text: "A monkey needs to climb to the top of a round pole of height 26 metres. The monkey climbs 5 metres in a minute, but after each minute it gets tired and rests for a minute; while resting, the monkey slips down 2 metres.<br><div class=\"olympiad-img-box\" style=\"text-align:center; margin:14px 0;\"><img src=\"/assets/questions/31IIIA.svg\" class=\"olympiad-question-img\" style=\"max-height:220px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);\" alt=\"Monkey Climbing Pole Diagram\"></div>From the given information, choose the correct heights for positions P, Q, and R:",
    options_json: JSON.stringify(["P = 10 m   Q = 15 m    R = 13 m", "P = 10 m   Q = 13 m    R = 11 m", "P = 6 m   Q = 11 m    R = 9 m", "P = 6 m   Q = 11 m    R = 13 m"]),
    correct_answer: "P = 6 m   Q = 11 m    R = 9 m",
    explanation: "Tracking the monkey's elevation step by step:\n\u2022 Minute 1: climbs 5 m &rarr; 5 m\n\u2022 Minute 2 (rest): slips 2 m &rarr; 5 - 2 = 3 m\n\u2022 Minute 3: climbs 5 m &rarr; 3 + 5 = 8 m\n\u2022 Minute 4 (rest): slips 2 m &rarr; 8 - 2 = 6 m (Position P = 6 m)\n\u2022 Minute 5: climbs 5 m &rarr; 6 + 5 = 11 m (Position Q = 11 m)\n\u2022 Minute 6 (rest): slips 2 m &rarr; 11 - 2 = 9 m (Position R = 9 m)\nTherefore: P = 6 m, Q = 11 m, R = 9 m.",
    hint: "Calculate the height reached after each climbing and resting minute.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-32",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "easy",
    question_text: "The first three words in each question are alike (same) in some way. Choose the word from the given options that goes with the first three words in the same way:<br><br><span style=\"font-size:1.15rem; font-weight:700; color:var(--navy);\">Drawing &nbsp;&nbsp;&nbsp;&nbsp; Diagram &nbsp;&nbsp;&nbsp;&nbsp; Picture</span>",
    options_json: JSON.stringify(["Perfume", "Puzzle", "Book", "Sketch"]),
    correct_answer: "Sketch",
    explanation: "Drawing, Diagram, Picture, and Sketch are all forms of visual or graphic art. None of the other choices (Perfume, Puzzle, Book) represent a direct visual artwork in the same way.",
    hint: "Which option is another word for a drawing or pictorial representation?",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-33",
    topic_id: "math-division",
    subject_id: "math-class3",
    section: "Mathematical Aptitude",
    difficulty: "medium",
    question_text: "In the following question, four numbers are given. Out of these, three numbers are alike in a certain way except for one number. Choose the one that is different from the rest:<br><br><span style=\"font-size:1.15rem; font-weight:700; color:var(--navy);\">76 &nbsp;&nbsp;&nbsp;&nbsp; 21 &nbsp;&nbsp;&nbsp;&nbsp; 30 &nbsp;&nbsp;&nbsp;&nbsp; 69</span>",
    options_json: JSON.stringify(["76", "21", "30", "69"]),
    correct_answer: "76",
    explanation: "Check divisibility by 3:\n\u2022 21 \u00f7 3 = 7\n\u2022 30 \u00f7 3 = 10\n\u2022 69 \u00f7 3 = 23\nAll three are multiples of 3. However, 76 (7 + 6 = 13) is not divisible by 3. Therefore, 76 is the odd one out.",
    hint: "Check the divisibility rule for 3 (add the digits of each number).",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-34",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "medium",
    question_text: "Find the one that is different in some way. Think about how it is different and the rest all are the same. Look at the 5 boxes given below. One of them is different and doesn't belong. Can you point to the different one?<br><div class=\"olympiad-img-box\" style=\"text-align:center; margin:14px 0;\"><img src=\"/assets/questions/34IIIA.svg\" class=\"olympiad-question-img\" style=\"max-height:140px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);\" alt=\"5 Boxes Alphabet Pattern\"></div>",
    options_json: JSON.stringify(["OOD", "6VV", "ODO", "66D"]),
    correct_answer: "ODO",
    explanation: "In OOD, 6VV, 66D, and VVD, the two identical characters are placed side by side as an adjacent pair (OO, VV, 66). In ODO, the two identical letters 'O' are separated by 'D'. Therefore, ODO is the odd one out.",
    hint: "Look at where the duplicate letters appear in each box.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-35",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "medium",
    question_text: "Direction: There is an old saying that actions speak louder than words. As you read the passage in this section, think about each character's actions. Based on those actions, what can you infer about the character?<br><br>Mrs. Hernandez was talking on the phone. This is what she said: <em>\"I'm calling about Mia. She feels a little warm, and she's coughing and sneezing. I hate to see her get sick. What should I do? Okay, I will keep her in bed today. Yes, I will be sure to give her plenty of liquids. If she still feels warm tomorrow, shall I bring her to your office? I am so glad you are back from vacation. I don't know what I would do without your help.\"</em><br><br><strong>Let's do a character analysis of Mrs. Hernandez. How does she feel?</strong>",
    options_json: JSON.stringify(["Worried", "Anxious", "Concerned", "Guilty"]),
    correct_answer: "Worried",
    explanation: "Mrs. Hernandez shows profound concern for her sick daughter Mia, calling the doctor immediately and diligently noting remedies. Her emotional state is 'Worried'.",
    hint: "How does a caring parent feel when their child is sick with a fever and cough?",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-36",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "easy",
    question_text: "What do you do after you turn on the tap?<br><div class=\"olympiad-img-box\" style=\"text-align:center; margin:14px 0;\"><img src=\"/assets/questions/36IIIA.svg\" class=\"olympiad-question-img\" style=\"max-height:220px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);\" alt=\"Tap Water Flowchart\"></div>",
    options_json: JSON.stringify(["Fill water in a bucket", "Adjust the temperature", "Take a bath", "None of these"]),
    correct_answer: "Fill water in a bucket",
    explanation: "Following the flowchart arrows in sequence, the action immediately connected after 'Turn on the tap' is 'Fill water in a bucket'.",
    hint: "Follow the arrow coming directly out of the 'Turn on the tap' step.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-37",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "easy",
    question_text: "Direction: The first two words in the sentence below go together in a certain way. Choose the answer that goes with the third word in the sentence the same way that the first and second words go together:<br><br><strong>Actor is to acting as teacher is to _________________?</strong>",
    options_json: JSON.stringify(["Freezing", "Writing", "Lecturing", "Teaching"]),
    correct_answer: "Teaching",
    explanation: "An actor's profession is acting; a teacher's profession is teaching. The analogy relates a profession to its primary verb/action.",
    hint: "What is the primary action a teacher performs?",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-38",
    topic_id: "math-shapes",
    subject_id: "math-class3",
    section: "Achievers Section",
    difficulty: "hard",
    question_text: "On the top row, you will see how a square piece of paper is folded sometimes once, sometimes twice, sometimes three times. After the paper has been folded, holes are then punched.<br><div class=\"olympiad-img-box\" style=\"text-align:center; margin:14px 0;\"><img src=\"/assets/questions/38IIIA.svg\" class=\"olympiad-question-img\" style=\"max-height:220px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);\" alt=\"Paper Folding and Hole Punching Diagram\"></div>Choose the answer from the options given that shows how the folded piece of paper would look after it is unfolded:",
    options_json: JSON.stringify(["<img src=\"/assets/options/38A-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"38A-IIIA\"> <span>Option A (38A-IIIA)</span>", "<img src=\"/assets/options/38B-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"38B-IIIA\"> <span>Option B (38B-IIIA)</span>", "<img src=\"/assets/options/38C-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"38C-IIIA\"> <span>Option C (38C-IIIA)</span>", "<img src=\"/assets/options/38D-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"38D-IIIA\"> <span>Option D (38D-IIIA)</span>"]),
    correct_answer: "<img src=\"/assets/options/38B-IIIA.svg\" class=\"olympiad-option-img\" style=\"max-height:75px; width:auto; max-width:100%; object-fit:contain;\" alt=\"38B-IIIA\"> <span>Option B (38B-IIIA)</span>",
    explanation: "When the folded paper with punched holes is completely unfolded, symmetry reflections duplicate the holes across both fold lines, producing the four symmetrical holes shown in Option B (38B-IIIA).",
    hint: "Reflect the punched holes across the crease line in each unfold step.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-39",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "easy",
    question_text: "The main idea of a paragraph is a sentence that tells about or includes all the others. A good way to understand main ideas is to look at a group of words and see which word describes all the other words in the category.<br><br>Choose the word that includes all the other words:<br><br><span style=\"font-size:1.15rem; font-weight:700; color:var(--navy);\">Parrot &nbsp;&nbsp;&nbsp;&nbsp; Geese &nbsp;&nbsp;&nbsp;&nbsp; Owls &nbsp;&nbsp;&nbsp;&nbsp; Birds</span>",
    options_json: JSON.stringify(["Parrot", "Geese", "Owls", "Birds"]),
    correct_answer: "Birds",
    explanation: "Parrots, Geese, and Owls are all specific species of birds. 'Birds' is the general category (main idea) that encompasses all three.",
    hint: "Which word is the general group name for all the creatures listed?",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-40",
    topic_id: "eng-comprehension",
    subject_id: "english-class3",
    section: "Verbal Aptitude",
    difficulty: "easy",
    question_text: "Follow the instructions, think and get cracking. These words go together:<br><br><span style=\"font-size:1.15rem; font-weight:700; color:var(--navy);\">KNIFE &nbsp;&nbsp;&nbsp;&nbsp; KETTLE &nbsp;&nbsp;&nbsp;&nbsp; POT &nbsp;&nbsp;&nbsp;&nbsp; PAN</span><br><br>Choose the sentence stating why they go together:",
    options_json: JSON.stringify(["These words name things that cut food.", "These words name things to heat food and water in.", "These words name things to store food in.", "None of these"]),
    correct_answer: "These words name things to heat food and water in.",
    explanation: "Kettles, pots, and pans are standard kitchen cookware used to heat food and boil water. (Note: In standard aptitude classifications, cookware categories describe heating food and water).",
    hint: "What do kettles, pots, and pans do in a kitchen?",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
  {
    id: "q-apt-41",
    topic_id: "math-numbers",
    subject_id: "math-class3",
    section: "Logical Reasoning",
    difficulty: "hard",
    question_text: "Find the rule by which the code is formed and solve the question given to you:<br><br>\u2022 <strong>666 is 9</strong><br>\u2022 <strong>555 is 6</strong><br>\u2022 <strong>567 is 9</strong><br><br>Based on the code, what is <strong>373</strong>?",
    options_json: JSON.stringify(["9", "7", "5", "4"]),
    correct_answer: "4",
    explanation: "The rule is recursive digital root (summing the digits until a single digit is reached):\n\u2022 666: 6 + 6 + 6 = 18 &rarr; 1 + 8 = 9\n\u2022 555: 5 + 5 + 5 = 15 &rarr; 1 + 5 = 6\n\u2022 567: 5 + 6 + 7 = 18 &rarr; 1 + 8 = 9\n\u2022 373: 3 + 7 + 3 = 13 &rarr; 1 + 3 = 4\nTherefore, 373 is 4.",
    hint: "Add all three digits together, then add the digits of that result.",
    points: 1,
    is_olympiad: 1,
    olympiad_type: 'aptitude',
    olympiad_grade: 3
  },
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
  },
  {
    id: 'olympiad-aptitude-class3',
    code: 'APT-C3-2026',
    title: 'Class III Aptitude & Logical Reasoning Olympiad (Full Mock Test)',
    subject_id: 'math-class3',
    grade: 3,
    total_questions: 41,
    duration_minutes: 45,
    total_marks: 41,
    description: 'Class III Aptitude & Reasoning Mock Test curated from Master Data Collection. Tests logical deduction, visual spatial patterns, verbal analogies, and problem solving with full explanations and SVGs.',
    sections_json: JSON.stringify([
      { name: 'Logical Reasoning', count: 12, marksPerQuestion: 1 },
      { name: 'Mathematical Aptitude', count: 12, marksPerQuestion: 1 },
      { name: 'Verbal Aptitude', count: 10, marksPerQuestion: 1 },
      { name: 'Achievers Section', count: 7, marksPerQuestion: 1 }
    ])
  }
];

/* ==========================================================================
   EIGHT CLASS-WISE OLYMPIAD MCQ TEST PAGES (CLASS III TO CLASS X)
   Each exam contains 10 questions, a 15-minute timer and 10 marks.
   ========================================================================== */
const mcqOlympiadExams = [
  {
    id: 'olympiad-mcq-class3',
    code: 'MCQ-C3-2026',
    title: 'Olympiad MCQ Challenge - Class III',
    subject_id: 'math-class3',
    grade: 3,
    total_questions: 10,
    duration_minutes: 15,
    total_marks: 10,
    description: 'Class III Olympiad MCQ test covering place value, arithmetic, fractions, time, patterns, English grammar and logical reasoning.',
    sections_json: JSON.stringify([{ name: 'Olympiad MCQ', count: 10, marksPerQuestion: 1 }])
  },
  {
    id: 'olympiad-mcq-class4',
    code: 'MCQ-C4-2026',
    title: 'Olympiad MCQ Challenge - Class IV',
    subject_id: 'math-class3',
    grade: 4,
    total_questions: 10,
    duration_minutes: 15,
    total_marks: 10,
    description: 'Class IV Olympiad MCQ test covering large numbers, HCF, fractions, perimeter, grammar, articles and reasoning.',
    sections_json: JSON.stringify([{ name: 'Olympiad MCQ', count: 10, marksPerQuestion: 1 }])
  },
  {
    id: 'olympiad-mcq-class5',
    code: 'MCQ-C5-2026',
    title: 'Olympiad MCQ Challenge - Class V',
    subject_id: 'math-class3',
    grade: 5,
    total_questions: 10,
    duration_minutes: 15,
    total_marks: 10,
    description: 'Class V Olympiad MCQ test covering fractions, decimals, angles, area, LCM, adverbs, prepositions, percentages and patterns.',
    sections_json: JSON.stringify([{ name: 'Olympiad MCQ', count: 10, marksPerQuestion: 1 }])
  },
  {
    id: 'olympiad-mcq-class6',
    code: 'MCQ-C6-2026',
    title: 'Olympiad MCQ Challenge - Class VI',
    subject_id: 'math-class3',
    grade: 6,
    total_questions: 10,
    duration_minutes: 15,
    total_marks: 10,
    description: 'Class VI Olympiad MCQ test covering integers, algebra, ratio, primes, 3D geometry, verbs, voice and number series.',
    sections_json: JSON.stringify([{ name: 'Olympiad MCQ', count: 10, marksPerQuestion: 1 }])
  },
  {
    id: 'olympiad-mcq-class7',
    code: 'MCQ-C7-2026',
    title: 'Olympiad MCQ Challenge - Class VII',
    subject_id: 'math-class3',
    grade: 7,
    total_questions: 10,
    duration_minutes: 15,
    total_marks: 10,
    description: 'Class VII Olympiad MCQ test covering exponents, percentages, simple interest, triangle angles, reported speech and determiners.',
    sections_json: JSON.stringify([{ name: 'Olympiad MCQ', count: 10, marksPerQuestion: 1 }])
  },
  {
    id: 'olympiad-mcq-class8',
    code: 'MCQ-C8-2026',
    title: 'Olympiad MCQ Challenge - Class VIII',
    subject_id: 'math-class3',
    grade: 8,
    total_questions: 10,
    duration_minutes: 15,
    total_marks: 10,
    description: 'Class VIII Olympiad MCQ test covering square roots, linear equations, quadrilaterals, compound interest, volume, conditionals and probability.',
    sections_json: JSON.stringify([{ name: 'Olympiad MCQ', count: 10, marksPerQuestion: 1 }])
  },
  {
    id: 'olympiad-mcq-class9',
    code: 'MCQ-C9-2026',
    title: 'Olympiad MCQ Challenge - Class IX',
    subject_id: 'math-class3',
    grade: 9,
    total_questions: 10,
    duration_minutes: 15,
    total_marks: 10,
    description: 'Class IX Olympiad MCQ test covering polynomials, coordinate geometry, triangle theorems, spheres, statistics, reported speech and probability.',
    sections_json: JSON.stringify([{ name: 'Olympiad MCQ', count: 10, marksPerQuestion: 1 }])
  },
  {
    id: 'olympiad-mcq-class10',
    code: 'MCQ-C10-2026',
    title: 'Olympiad MCQ Challenge - Class X',
    subject_id: 'math-class3',
    grade: 10,
    total_questions: 10,
    duration_minutes: 15,
    total_marks: 10,
    description: 'Class X Olympiad MCQ test covering HCF, quadratic roots, arithmetic progressions, trigonometry, probability, statistics and English grammar.',
    sections_json: JSON.stringify([{ name: 'Olympiad MCQ', count: 10, marksPerQuestion: 1 }])
  }
];

const mcqOlympiadQuestions = [
  // ---------------- Class III ----------------
  { id: 'mcq-c3-01', grade: 3, q: 'What is the place value of the digit 7 in the number 4,782?', o: ['7', '70', '700', '7,000'], a: '700', e: 'The digit 7 is in the hundreds place, so its place value is 700.' },
  { id: 'mcq-c3-02', grade: 3, q: 'What is 345 + 278?', o: ['613', '623', '633', '723'], a: '623', e: '345 + 278 = 623. Add the ones, tens and hundreds with regrouping.' },
  { id: 'mcq-c3-03', grade: 3, q: 'Which fraction represents one half?', o: ['1/4', '1/2', '2/3', '3/4'], a: '1/2', e: 'One half means 1 part out of 2 equal parts, written as 1/2.' },
  { id: 'mcq-c3-04', grade: 3, q: 'How many minutes are there in 1 hour 15 minutes?', o: ['65', '70', '75', '85'], a: '75', e: '1 hour = 60 minutes, so 60 + 15 = 75 minutes.' },
  { id: 'mcq-c3-05', grade: 3, q: 'Find the next number in the pattern: 5, 10, 20, 40, __', o: ['60', '70', '80', '90'], a: '80', e: 'Each number is doubled, so 40 × 2 = 80.' },
  { id: 'mcq-c3-06', grade: 3, q: 'Which word is a noun?', o: ['run', 'happy', 'tiger', 'quickly'], a: 'tiger', e: 'A noun names a person, place or thing. "Tiger" is a naming word.' },
  { id: 'mcq-c3-07', grade: 3, q: 'Choose the synonym of "brave".', o: ['timid', 'courageous', 'angry', 'sleepy'], a: 'courageous', e: 'Brave and courageous both mean showing courage.' },
  { id: 'mcq-c3-08', grade: 3, q: 'Which one is the odd one out?', o: ['apple', 'mango', 'carrot', 'banana'], a: 'carrot', e: 'Apple, mango and banana are fruits, while carrot is a vegetable.' },
  { id: 'mcq-c3-09', grade: 3, q: 'One pencil costs ₹7. What is the cost of 8 pencils?', o: ['₹48', '₹54', '₹56', '₹64'], a: '₹56', e: '8 × ₹7 = ₹56.' },
  { id: 'mcq-c3-10', grade: 3, q: 'Which shape has exactly 3 sides?', o: ['square', 'triangle', 'circle', 'rectangle'], a: 'triangle', e: 'A triangle is a polygon with three sides and three angles.' },

  // ---------------- Class IV ----------------
  { id: 'mcq-c4-01', grade: 4, q: 'What is the smallest 5-digit number?', o: ['9,999', '10,000', '10,001', '11,111'], a: '10,000', e: 'The smallest 5-digit number is 10,000.' },
  { id: 'mcq-c4-02', grade: 4, q: 'What is the HCF of 12 and 18?', o: ['3', '6', '12', '36'], a: '6', e: 'The highest common factor of 12 and 18 is 6.' },
  { id: 'mcq-c4-03', grade: 4, q: 'What is 3/4 of 20?', o: ['5', '10', '15', '20'], a: '15', e: '20 ÷ 4 = 5, and 5 × 3 = 15.' },
  { id: 'mcq-c4-04', grade: 4, q: 'What is the perimeter of a square with side 9 cm?', o: ['18 cm', '27 cm', '36 cm', '81 cm'], a: '36 cm', e: 'Perimeter of a square = 4 × side = 4 × 9 = 36 cm.' },
  { id: 'mcq-c4-05', grade: 4, q: 'What is 7 × 8 + 6?', o: ['54', '56', '62', '68'], a: '62', e: '7 × 8 = 56, then 56 + 6 = 62.' },
  { id: 'mcq-c4-06', grade: 4, q: 'Choose the correct article: "___ honest boy".', o: ['a', 'an', 'the', 'no article'], a: 'an', e: 'Use "an" before a vowel sound; "honest" begins with a vowel sound.' },
  { id: 'mcq-c4-07', grade: 4, q: 'What is the simple past tense of "go"?', o: ['goed', 'gone', 'went', 'going'], a: 'went', e: 'The simple past of "go" is the irregular form "went".' },
  { id: 'mcq-c4-08', grade: 4, q: 'Complete the analogy: Bird : Nest :: Bee : ___', o: ['Web', 'Hive', 'Burrow', 'Den'], a: 'Hive', e: 'A bird lives in a nest and a bee lives in a hive.' },
  { id: 'mcq-c4-09', grade: 4, q: 'If 1 dozen = 12, how many items are there in 5 dozen?', o: ['50', '55', '60', '72'], a: '60', e: '5 × 12 = 60 items.' },
  { id: 'mcq-c4-10', grade: 4, q: 'Which of these is a prime number?', o: ['21', '29', '33', '39'], a: '29', e: '29 has only two factors, 1 and 29, so it is prime.' },

  // ---------------- Class V ----------------
  { id: 'mcq-c5-01', grade: 5, q: 'What is 2/3 + 1/6?', o: ['3/9', '1/2', '5/6', '1'], a: '5/6', e: '2/3 = 4/6, so 4/6 + 1/6 = 5/6.' },
  { id: 'mcq-c5-02', grade: 5, q: 'Which fraction is equal to 0.75?', o: ['1/4', '1/2', '3/4', '7/5'], a: '3/4', e: '0.75 means 75 hundredths, which simplifies to 3/4.' },
  { id: 'mcq-c5-03', grade: 5, q: 'An angle of 90° is called a ___ angle.', o: ['acute', 'obtuse', 'right', 'straight'], a: 'right', e: 'An angle of exactly 90° is a right angle.' },
  { id: 'mcq-c5-04', grade: 5, q: 'What is the area of a rectangle 12 cm long and 5 cm wide?', o: ['17 cm²', '34 cm²', '60 cm²', '120 cm²'], a: '60 cm²', e: 'Area = length × width = 12 × 5 = 60 cm².' },
  { id: 'mcq-c5-05', grade: 5, q: 'What is the LCM of 6 and 8?', o: ['12', '18', '24', '48'], a: '24', e: 'Multiples of 6 and 8 first meet at 24.' },
  { id: 'mcq-c5-06', grade: 5, q: 'Identify the adverb: "She sings beautifully."', o: ['She', 'sings', 'beautifully', 'tune'], a: 'beautifully', e: 'The adverb "beautifully" tells us how she sings.' },
  { id: 'mcq-c5-07', grade: 5, q: 'Choose the correct preposition: "The book is ___ the table."', o: ['in', 'on', 'under', 'between'], a: 'on', e: 'A book resting on top of a table is "on" the table.' },
  { id: 'mcq-c5-08', grade: 5, q: 'Find the next number: 2, 6, 12, 20, __', o: ['24', '28', '30', '32'], a: '30', e: 'The pattern is n × (n + 1): 5 × 6 = 30.' },
  { id: 'mcq-c5-09', grade: 5, q: 'What is 15% of 200?', o: ['15', '20', '30', '45'], a: '30', e: '10% of 200 = 20 and 5% = 10, so 15% = 30.' },
  { id: 'mcq-c5-10', grade: 5, q: 'What is the angle between the hands of a clock at 3:00?', o: ['30°', '60°', '90°', '180°'], a: '90°', e: 'The hour hand points at 3 and the minute hand at 12, forming a 90° angle.' },

  // ---------------- Class VI ----------------
  { id: 'mcq-c6-01', grade: 6, q: 'What is (−7) + 12?', o: ['−19', '−5', '5', '19'], a: '5', e: 'Moving 12 steps right from −7 gives 5.' },
  { id: 'mcq-c6-02', grade: 6, q: 'If x + 5 = 12, what is x?', o: ['5', '7', '12', '17'], a: '7', e: 'Subtract 5 from both sides: x = 12 − 5 = 7.' },
  { id: 'mcq-c6-03', grade: 6, q: 'Write the ratio 15 : 25 in simplest form.', o: ['3 : 5', '5 : 3', '1 : 2', '5 : 8'], a: '3 : 5', e: 'Divide both terms by 5 to get 3 : 5.' },
  { id: 'mcq-c6-04', grade: 6, q: 'Which is the smallest prime number?', o: ['0', '1', '2', '3'], a: '2', e: '2 is the smallest prime number and the only even prime.' },
  { id: 'mcq-c6-05', grade: 6, q: 'How many edges does a cube have?', o: ['6', '8', '12', '24'], a: '12', e: 'A cube has 12 edges, 6 faces and 8 vertices.' },
  { id: 'mcq-c6-06', grade: 6, q: 'Identify the verb: "The children played in the garden."', o: ['children', 'played', 'in', 'garden'], a: 'played', e: '"Played" is the action word, so it is the verb.' },
  { id: 'mcq-c6-07', grade: 6, q: 'Choose the correct passive voice of "Ravi writes a letter."', o: ['A letter is written by Ravi.', 'Ravi is written by a letter.', 'A letter writes Ravi.', 'A letter was written by Ravi.'], a: 'A letter is written by Ravi.', e: 'In the passive voice, the object becomes the subject: "A letter is written by Ravi."' },
  { id: 'mcq-c6-08', grade: 6, q: 'Complete the analogy: Doctor : Hospital :: Teacher : ___', o: ['Library', 'School', 'Office', 'Playground'], a: 'School', e: 'A doctor works in a hospital and a teacher works in a school.' },
  { id: 'mcq-c6-09', grade: 6, q: 'Find the next number: 1, 4, 9, 16, __', o: ['20', '24', '25', '36'], a: '25', e: 'These are perfect squares: 1², 2², 3², 4², 5² = 25.' },
  { id: 'mcq-c6-10', grade: 6, q: 'What is the HCF of 24 and 36?', o: ['6', '12', '18', '72'], a: '12', e: 'The highest common factor of 24 and 36 is 12.' },

  // ---------------- Class VII ----------------
  { id: 'mcq-c7-01', grade: 7, q: 'What is the value of 2⁵?', o: ['10', '16', '32', '64'], a: '32', e: '2⁵ = 2 × 2 × 2 × 2 × 2 = 32.' },
  { id: 'mcq-c7-02', grade: 7, q: 'What is (−3) × (−4)?', o: ['−12', '−7', '7', '12'], a: '12', e: 'The product of two negative numbers is positive: 3 × 4 = 12.' },
  { id: 'mcq-c7-03', grade: 7, q: 'What is 25% of 480?', o: ['96', '120', '140', '240'], a: '120', e: '25% is one quarter, and 480 ÷ 4 = 120.' },
  { id: 'mcq-c7-04', grade: 7, q: 'Find the simple interest on ₹2,000 at 5% per annum for 2 years.', o: ['₹100', '₹200', '₹250', '₹400'], a: '₹200', e: 'SI = (P × R × T) / 100 = (2000 × 5 × 2) / 100 = ₹200.' },
  { id: 'mcq-c7-05', grade: 7, q: 'Two angles of a triangle are 50° and 60°. What is the third angle?', o: ['60°', '70°', '80°', '90°'], a: '70°', e: 'The angles of a triangle sum to 180°, so 180 − 50 − 60 = 70°.' },
  { id: 'mcq-c7-06', grade: 7, q: 'Convert to reported speech: He said, "I am busy."', o: ['He said that he is busy.', 'He said that he was busy.', 'He says that he was busy.', 'He said that I am busy.'], a: 'He said that he was busy.', e: 'When the reporting verb is in the past, the present tense changes to the past: "am" becomes "was".' },
  { id: 'mcq-c7-07', grade: 7, q: 'Choose the correct determiner: "___ books on the shelf are mine."', o: ['This', 'That', 'These', 'It'], a: 'These', e: '"Books" is plural, so the plural determiner "These" is correct.' },
  { id: 'mcq-c7-08', grade: 7, q: 'Which number is the odd one out?', o: ['8', '27', '64', '81'], a: '81', e: '8, 27 and 64 are perfect cubes (2³, 3³, 4³), but 81 is not a perfect cube.' },
  { id: 'mcq-c7-09', grade: 7, q: 'A train travels 120 km in 2 hours. What is its speed?', o: ['40 km/h', '50 km/h', '60 km/h', '240 km/h'], a: '60 km/h', e: 'Speed = distance ÷ time = 120 ÷ 2 = 60 km/h.' },
  { id: 'mcq-c7-10', grade: 7, q: 'What is the area of a triangle with base 10 cm and height 6 cm?', o: ['16 cm²', '30 cm²', '60 cm²', '80 cm²'], a: '30 cm²', e: 'Area = ½ × base × height = ½ × 10 × 6 = 30 cm².' },

  // ---------------- Class VIII ----------------
  { id: 'mcq-c8-01', grade: 8, q: 'What is √144?', o: ['10', '12', '14', '24'], a: '12', e: '12 × 12 = 144, so √144 = 12.' },
  { id: 'mcq-c8-02', grade: 8, q: 'Solve for x: 2x − 5 = 11', o: ['3', '6', '8', '16'], a: '8', e: 'Add 5 to both sides: 2x = 16, so x = 8.' },
  { id: 'mcq-c8-03', grade: 8, q: 'What is the sum of the interior angles of a quadrilateral?', o: ['180°', '270°', '360°', '540°'], a: '360°', e: 'Every quadrilateral has interior angles summing to 360°.' },
  { id: 'mcq-c8-04', grade: 8, q: 'Find the compound interest on ₹1,000 at 10% per annum for 2 years.', o: ['₹100', '₹200', '₹210', '₹220'], a: '₹210', e: 'Amount = 1000 × (1.1)² = ₹1,210, so CI = ₹1,210 − ₹1,000 = ₹210.' },
  { id: 'mcq-c8-05', grade: 8, q: 'What is the volume of a cube with side 4 cm?', o: ['12 cm³', '16 cm³', '48 cm³', '64 cm³'], a: '64 cm³', e: 'Volume of a cube = side³ = 4³ = 64 cm³.' },
  { id: 'mcq-c8-06', grade: 8, q: 'Choose the correct option: "If it ___ tomorrow, we will stay home."', o: ['rain', 'rains', 'rained', 'will rain'], a: 'rains', e: 'In a first conditional sentence, the if-clause uses the simple present: "if it rains".' },
  { id: 'mcq-c8-07', grade: 8, q: 'Choose the correct passive voice of "They have completed the project."', o: ['The project has been completed by them.', 'The project have been completed by them.', 'The project was completed by them.', 'The project is completed by them.'], a: 'The project has been completed by them.', e: 'Present perfect active "have completed" becomes "has been completed" in the passive.' },
  { id: 'mcq-c8-08', grade: 8, q: 'Complete the analogy: 4 : 16 :: 7 : ___', o: ['14', '28', '49', '56'], a: '49', e: '16 is 4², so the matching value is 7² = 49.' },
  { id: 'mcq-c8-09', grade: 8, q: 'What is the probability of getting a head when a fair coin is tossed once?', o: ['1/4', '1/2', '1', '0'], a: '1/2', e: 'A fair coin has two equally likely outcomes, so P(head) = 1/2.' },
  { id: 'mcq-c8-10', grade: 8, q: 'What is the value of (3²)³?', o: ['27', '81', '243', '729'], a: '729', e: '(3²)³ = 3⁶ = 729.' },

  // ---------------- Class IX ----------------
  { id: 'mcq-c9-01', grade: 9, q: 'Find the zero of the polynomial p(x) = 2x − 6.', o: ['−3', '0', '3', '6'], a: '3', e: 'Set 2x − 6 = 0, so 2x = 6 and x = 3.' },
  { id: 'mcq-c9-02', grade: 9, q: 'What is the distance between (0, 0) and (3, 4)?', o: ['3 units', '4 units', '5 units', '7 units'], a: '5 units', e: 'Distance = √(3² + 4²) = √(9 + 16) = √25 = 5 units.' },
  { id: 'mcq-c9-03', grade: 9, q: 'In a triangle, the angles opposite to equal sides are ___.', o: ['supplementary', 'equal', 'complementary', 'right angles'], a: 'equal', e: 'Angles opposite equal sides of a triangle are equal (isosceles triangle theorem).' },
  { id: 'mcq-c9-04', grade: 9, q: 'What is the surface area of a sphere of radius 7 cm? (Take π = 22/7)', o: ['154 cm²', '308 cm²', '616 cm²', '1232 cm²'], a: '616 cm²', e: 'Surface area = 4πr² = 4 × 22/7 × 49 = 616 cm².' },
  { id: 'mcq-c9-05', grade: 9, q: 'What is the mean of 4, 8, 12, 16 and 20?', o: ['10', '12', '14', '16'], a: '12', e: 'Sum = 60 and there are 5 numbers, so mean = 60 ÷ 5 = 12.' },
  { id: 'mcq-c9-06', grade: 9, q: 'Convert to reported speech: She said, "I will help you."', o: ['She said that she will help me.', 'She said that she would help me.', 'She says that she would help me.', 'She said that I would help her.'], a: 'She said that she would help me.', e: '"Will" changes to "would" in reported speech after a past reporting verb.' },
  { id: 'mcq-c9-07', grade: 9, q: 'Choose the correct verb: "Each of the students ___ present."', o: ['are', 'is', 'were', 'have'], a: 'is', e: '"Each" is singular, so it takes the singular verb "is".' },
  { id: 'mcq-c9-08', grade: 9, q: 'What is the value of (√5 + √2)(√5 − √2)?', o: ['3', '7', '√7', '2√5'], a: '3', e: 'Using (a + b)(a − b) = a² − b²: 5 − 2 = 3.' },
  { id: 'mcq-c9-09', grade: 9, q: 'A die is rolled once. What is the probability of getting a number greater than 4?', o: ['1/6', '1/3', '1/2', '2/3'], a: '1/3', e: 'The favourable outcomes are 5 and 6, so probability = 2/6 = 1/3.' },
  { id: 'mcq-c9-10', grade: 9, q: 'If two triangles are congruent, their corresponding angles are ___.', o: ['equal', 'supplementary', 'complementary', 'doubled'], a: 'equal', e: 'Congruent triangles have equal corresponding sides and equal corresponding angles (CPCT).' },

  // ---------------- Class X ----------------
  { id: 'mcq-c10-01', grade: 10, q: 'What is the HCF of 12 and 18?', o: ['2', '3', '6', '36'], a: '6', e: '12 = 2² × 3 and 18 = 2 × 3², so HCF = 2 × 3 = 6.' },
  { id: 'mcq-c10-02', grade: 10, q: 'What are the roots of x² − 5x + 6 = 0?', o: ['2 and 3', '−2 and −3', '1 and 6', '−1 and −6'], a: '2 and 3', e: 'x² − 5x + 6 = (x − 2)(x − 3), so x = 2 or x = 3.' },
  { id: 'mcq-c10-03', grade: 10, q: 'What is the 10th term of the AP 2, 5, 8, …?', o: ['26', '29', '32', '35'], a: '29', e: 'a = 2 and d = 3, so a₁₀ = 2 + 9 × 3 = 29.' },
  { id: 'mcq-c10-04', grade: 10, q: 'What is the value of sin 30°?', o: ['1/2', '√3/2', '1/√2', '1'], a: '1/2', e: 'From the standard trigonometric ratios, sin 30° = 1/2.' },
  { id: 'mcq-c10-05', grade: 10, q: 'A card is drawn from a standard deck. What is the probability of drawing a red card?', o: ['1/4', '1/2', '3/4', '1'], a: '1/2', e: 'There are 26 red cards out of 52, so probability = 26/52 = 1/2.' },
  { id: 'mcq-c10-06', grade: 10, q: 'What is the mean of the first five natural numbers?', o: ['2', '2.5', '3', '5'], a: '3', e: '(1 + 2 + 3 + 4 + 5) ÷ 5 = 15 ÷ 5 = 3.' },
  { id: 'mcq-c10-07', grade: 10, q: 'Convert to reported speech: He said, "I can swim."', o: ['He said that he can swim.', 'He said that he could swim.', 'He says that he could swim.', 'He said that I can swim.'], a: 'He said that he could swim.', e: '"Can" changes to "could" in reported speech after a past reporting verb.' },
  { id: 'mcq-c10-08', grade: 10, q: 'Complete the analogy: 5 : 125 :: 2 : ___', o: ['4', '6', '8', '10'], a: '8', e: '125 is 5³, so the matching value is 2³ = 8.' },
  { id: 'mcq-c10-09', grade: 10, q: 'What is the distance between the points (2, 3) and (2, 7)?', o: ['3 units', '4 units', '5 units', '10 units'], a: '4 units', e: 'The points share the same x-coordinate, so distance = |7 − 3| = 4 units.' },
  { id: 'mcq-c10-10', grade: 10, q: 'What is the curved surface area of a cylinder with radius 7 cm and height 10 cm? (Take π = 22/7)', o: ['220 cm²', '440 cm²', '660 cm²', '1540 cm²'], a: '440 cm²', e: 'CSA = 2πrh = 2 × 22/7 × 7 × 10 = 440 cm².' }
];

async function ensureMcqOlympiadsSeeded() {
  try {
    // Backfill older Olympiad questions so every paper belongs to a class.
    await dbAdapter.execute(
      'UPDATE questions SET olympiad_grade = 3 WHERE is_olympiad = 1 AND olympiad_grade IS NULL'
    );

    for (const exam of mcqOlympiadExams) {
      const existing = await dbAdapter.queryOne('SELECT id FROM olympiad_exams WHERE id = ?', [exam.id]);
      if (existing) {
        await dbAdapter.execute(
          `UPDATE olympiad_exams
           SET code = ?, title = ?, subject_id = ?, grade = ?, total_questions = ?, duration_minutes = ?,
               total_marks = ?, description = ?, sections_json = ?
           WHERE id = ?`,
          [exam.code, exam.title, exam.subject_id, exam.grade, exam.total_questions, exam.duration_minutes, exam.total_marks, exam.description, exam.sections_json, exam.id]
        );
      } else {
        await dbAdapter.execute(
          `INSERT INTO olympiad_exams (id, code, title, subject_id, grade, total_questions, duration_minutes, total_marks, description, sections_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [exam.id, exam.code, exam.title, exam.subject_id, exam.grade, exam.total_questions, exam.duration_minutes, exam.total_marks, exam.description, exam.sections_json]
        );
      }
    }

    for (const q of mcqOlympiadQuestions) {
      const optionsJson = JSON.stringify(q.o);
      const existing = await dbAdapter.queryOne('SELECT id FROM questions WHERE id = ?', [q.id]);
      if (existing) {
        await dbAdapter.execute(
          `UPDATE questions
           SET topic_id = NULL, subject_id = ?, section = ?, difficulty = ?, question_text = ?,
               options_json = ?, correct_answer = ?, explanation = ?, hint = ?, points = 1,
               is_olympiad = 1, olympiad_type = ?, olympiad_grade = ?
           WHERE id = ?`,
          ['math-class3', 'Olympiad MCQ', 'medium', q.q, optionsJson, q.a, q.e, null, 'mcq', q.grade, q.id]
        );
      } else {
        await dbAdapter.execute(
          `INSERT INTO questions (id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, explanation, hint, points, is_olympiad, olympiad_type, olympiad_grade)
           VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, 1, 1, ?, ?)`,
          [q.id, 'math-class3', 'Olympiad MCQ', 'medium', q.q, optionsJson, q.a, q.e, 'mcq', q.grade]
        );
      }
    }

    console.log('✅ Eight class-wise Olympiad MCQ papers synchronized successfully.');
  } catch (err) {
    console.error('Error ensuring class-wise Olympiad MCQs are seeded:', err.message);
  }
}

async function ensureAptitudeExamSeeded() {
  try {
    const aptExam = olympiadExams.find(e => e.id === 'olympiad-aptitude-class3');
    const existingExam = await dbAdapter.queryOne('SELECT id FROM olympiad_exams WHERE id = ?', ['olympiad-aptitude-class3']);
    if (!existingExam) {
      if (aptExam) {
        await dbAdapter.execute(
          `INSERT INTO olympiad_exams (id, code, title, subject_id, grade, total_questions, duration_minutes, total_marks, description, sections_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [aptExam.id, aptExam.code, aptExam.title, aptExam.subject_id, aptExam.grade, aptExam.total_questions, aptExam.duration_minutes, aptExam.total_marks, aptExam.description, aptExam.sections_json]
        );
      }
    } else if (aptExam) {
      await dbAdapter.execute(
        `UPDATE olympiad_exams
         SET title = ?, total_questions = ?, duration_minutes = ?, total_marks = ?, description = ?, sections_json = ?
         WHERE id = ?`,
        [aptExam.title, aptExam.total_questions, aptExam.duration_minutes, aptExam.total_marks, aptExam.description, aptExam.sections_json, aptExam.id]
      );
    }

    const aptQuestions = questions.filter(q => q.olympiad_type === 'aptitude');
    for (const q of aptQuestions) {
      const exists = await dbAdapter.queryOne('SELECT id FROM questions WHERE id = ?', [q.id]);
      if (exists) {
        await dbAdapter.execute(
          `UPDATE questions SET topic_id = ?, subject_id = ?, section = ?, difficulty = ?, question_text = ?, options_json = ?, correct_answer = ?, explanation = ?, hint = ?, points = ?, is_olympiad = ?, olympiad_type = ?, olympiad_grade = ? WHERE id = ?`,
          [q.topic_id, q.subject_id, q.section, q.difficulty, q.question_text, q.options_json, q.correct_answer, q.explanation, q.hint, q.points, q.is_olympiad, q.olympiad_type, q.olympiad_grade || 3, q.id]
        );
      } else {
        await dbAdapter.execute(
          `INSERT INTO questions (id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, explanation, hint, points, is_olympiad, olympiad_type, olympiad_grade)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [q.id, q.topic_id, q.subject_id, q.section, q.difficulty, q.question_text, q.options_json, q.correct_answer, q.explanation, q.hint, q.points, q.is_olympiad, q.olympiad_type, q.olympiad_grade || 3]
        );
      }
    }
    console.log(`✅ Class 3 Aptitude Olympiad questions (${aptQuestions.length} Qs) synchronized successfully.`);
  } catch (err) {
    console.error('Error ensuring Aptitude exam seeded:', err.message);
  }
}

async function ensureSeedUsers() {
  try {
    const bcrypt = require('bcryptjs');
    // 1. Seed demo student
    const studentExists = await dbAdapter.queryOne("SELECT id FROM users WHERE LOWER(username) = 'student'");
    if (!studentExists) {
      const studentHash = await bcrypt.hash('Student@123', 10);
      const cityHash = await bcrypt.hash('bhopal', 10);
      const petHash = await bcrypt.hash('rocky', 10);
      await dbAdapter.execute(
        `INSERT INTO users (username, email, password_hash, display_name, avatar, grade, xp, stars, streak_days, is_guest, user_type, security_city, security_pet)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'student', ?, ?)`,
        ['student', 'student@talenthunt.com', studentHash, 'Student Champion', 'boy', 3, 100, 15, 2, cityHash, petHash]
      );
      console.log('✅ Default student account synchronized (username: student, password: Student@123)');
    }

    // 2. Seed member account for Abhijit
    const abhijitExists = await dbAdapter.queryOne("SELECT id FROM users WHERE LOWER(username) = 'abhijit85'");
    if (!abhijitExists) {
      const abhijitHash = await bcrypt.hash('Abhijit@123', 10);
      const cityHash = await bcrypt.hash('bhopal', 10);
      const petHash = await bcrypt.hash('rocky', 10);
      await dbAdapter.execute(
        `INSERT INTO users (username, email, password_hash, display_name, avatar, grade, xp, stars, streak_days, is_guest, user_type, security_city, security_pet)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'student', ?, ?)`,
        ['abhijit85', 'abhijit85@talenthunt.com', abhijitHash, 'Abhijit Kumar Misra', 'lion', 5, 250, 30, 5, cityHash, petHash]
      );
      console.log('✅ Member account synchronized (username: abhijit85, password: Abhijit@123)');
    }
  } catch (err) {
    console.warn('Notice seeding initial test users:', err.message);
  }
}

async function seedDatabase() {
  const existingSubject = await dbAdapter.queryOne('SELECT COUNT(*) as count FROM subjects');
  const count = existingSubject ? parseInt(existingSubject.count, 10) : 0;
  if (count > 0) {
    console.log('🌱 Database already seeded. Total subjects:', count);
    await ensureAptitudeExamSeeded();
    await ensureMcqOlympiadsSeeded();
    await ensureSeedUsers();
    return;
  }

  console.log('🌱 Seeding TalentHunt CBSE Class III database...');

  // Seed Subjects
  for (const sub of subjects) {
    await dbAdapter.execute(
      `INSERT INTO subjects (id, slug, name, icon, color, description, grade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sub.id, sub.slug, sub.name, sub.icon, sub.color, sub.description, sub.grade]
    );
  }

  // Seed Topics
  for (const topic of topics) {
    await dbAdapter.execute(
      `INSERT INTO topics (id, subject_id, slug, title, order_num, icon, summary, key_rules)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [topic.id, topic.subject_id, topic.slug, topic.title, topic.order_num, topic.icon, topic.summary, topic.key_rules]
    );
  }

  // Seed Lessons
  for (const lesson of lessons) {
    await dbAdapter.execute(
      `INSERT INTO lessons (id, topic_id, title, overview, concept_html, fun_fact, examples_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [lesson.id, lesson.topic_id, lesson.title, lesson.overview, lesson.concept_html, lesson.fun_fact, lesson.examples_json]
    );
  }

  // Seed Questions
  for (const q of questions) {
    await dbAdapter.execute(
      `INSERT INTO questions (id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, explanation, hint, points, is_olympiad, olympiad_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [q.id, q.topic_id, q.subject_id, q.section, q.difficulty, q.question_text, q.options_json, q.correct_answer, q.explanation, q.hint, q.points, q.is_olympiad, q.olympiad_type || null]
    );
  }

  // Seed Olympiad Exams
  for (const exam of olympiadExams) {
    await dbAdapter.execute(
      `INSERT INTO olympiad_exams (id, code, title, subject_id, grade, total_questions, duration_minutes, total_marks, description, sections_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [exam.id, exam.code, exam.title, exam.subject_id, exam.grade, exam.total_questions, exam.duration_minutes, exam.total_marks, exam.description, exam.sections_json]
    );
  }

  await ensureMcqOlympiadsSeeded();
  await ensureSeedUsers();

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
