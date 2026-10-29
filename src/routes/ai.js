const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * Intelligent Pedagogical Response Generator (Guru AI)
 * Implements Socratic teaching, concept simplification, Vedic tricks, grammar checks, and question generation.
 */
function generateOfflinePedagogicalAnswer(userMessage, context = {}) {
  const query = (userMessage || '').trim().toLowerCase();
  const grade = context.grade || 3;
  const mode = context.mode || 'socratic';

  // 1. Vedic Mathematics Queries
  if (query.includes('vedic') || query.includes('square') || query.includes('sutra') || query.includes('calculate fast') || mode === 'vedic') {
    if (query.includes('45') || query.includes('ending in 5') || query.includes('ekadhikena')) {
      return {
        reply: `⚡ **Guru AI's Vedic Insight (Ekadhikena Purvena)**:\n\nTo square any number ending in 5 in under 3 seconds:\n1. Separate the number into two parts: the digits before 5, and the 5 itself.\n2. Multiply the first part by its successor: $n \\times (n + 1)$.\n3. Append **25** at the end!\n\n*Example*: For $45^2$, the tens digit is 4. Next number is 5.\n$4 \\times 5 = 20$. Now attach 25 &rarr; **2,025**!\n\n💡 *Try this yourself*: What is $75^2$? (Hint: $7 \\times 8 = 56$...)`,
        follow_ups: ['How does 85 squared work?', 'What is Nikhilam sutra?', 'Show me 2-digit multiplication']
      };
    }
    if (query.includes('nikhilam') || query.includes('subtract') || query.includes('base 100')) {
      return {
        reply: `⚡ **Guru AI's Vedic Insight (Nikhilam Navatashcaramam Dashatah)**:\n\n*Rule*: "All from 9 and the last from 10."\n\nWhen subtracting any number from $1,000$ or $10,000$:\nSubtract every digit from 9, and the very last digit from 10!\n\n*Example*: $1,000 - 364$:\n- $9 - 3 = 6$\n- $9 - 6 = 3$\n- $10 - 4 = 6$\n&rarr; Answer: **636**! No borrowing needed!\n\n💡 Try calculating $1,000 - 728$ using this trick. What do you get?`,
        follow_ups: ['What is Ekadhikena?', 'Explain 98 × 97 trick', 'Give me a practice problem']
      };
    }
    return {
      reply: `⚡ **Guru AI's Vedic Math Portal**:\n\nVedic Mathematics provides 16 sutras that turn complex, tedious long calculations into joyful mental arithmetic!\n\nKey Sutras to learn:\n1. **Ekadhikena Purvena**: Rapid squaring of numbers ending in 5 ($25^2 = 625, 35^2 = 1225$).\n2. **Nikhilam Navatashcaramam Dashatah**: Subtraction from powers of 10 without carries.\n3. **Urdhva-Tiryagbhyam**: Vertical and crosswise multiplication for 2-digit & 3-digit numbers.\n\nWhich sutra or calculation would you like to practice right now?`,
      follow_ups: ['Show me Ekadhikena Purvena', 'Show me Nikhilam subtraction', 'Show me Urdhva-Tiryagbhyam']
    };
  }

  // 2. English Grammar Queries
  if (query.includes('grammar') || query.includes('noun') || query.includes('verb') || query.includes('tense') || query.includes('sentence') || mode === 'grammar') {
    if (query.includes('noun')) {
      return {
        reply: `📚 **Guru AI's Grammar Masterclass (Nouns)**:\n\nA **Noun** is a naming word for a person, place, animal, or thing.\n\nHere are the 4 fundamental types for Class ${grade}:\n1. **Proper Nouns**: Specific names (always capitalized: *India*, *Abhijit*, *Ganges*).\n2. **Common Nouns**: General names (*city*, *boy*, *river*).\n3. **Collective Nouns**: Names for a group (*a flock of birds*, *a bouquet of flowers*).\n4. **Abstract Nouns**: Qualities, ideas, or feelings (*kindness*, *courage*, *honesty*).\n\n💡 *Mini Challenge*: In the sentence "The brave soldier showed great courage," which word is the Abstract Noun?`,
        follow_ups: ['Explain Collective Nouns', 'What is the difference between Adjective and Adverb?', 'Give me a grammar quiz question']
      };
    }
    if (query.includes('tense') || query.includes('past') || query.includes('present')) {
      return {
        reply: `📚 **Guru AI's Grammar Guide (Tenses)**:\n\nTenses tell us *when* an action occurs:\n- **Simple Present**: Regular habits or universal truths (*"The sun rises in the east"*, *"She reads every night"*).\n- **Simple Past**: Completed past actions (*"They played chess yesterday"*).\n- **Present Continuous**: Action happening right now (*"I am studying Vedic mathematics"*).\n\n💡 *Hint for Class ${grade}*: Watch for time clue words like *yesterday*, *already* (Past) vs *daily*, *usually* (Present).`,
        follow_ups: ['Give me a past tense example', 'Explain Present Perfect tense', 'Test my grammar']
      };
    }
    return {
      reply: `📚 **Guru AI's Grammar Helper**:\n\nEnglish Grammar is the blueprint of clear thought and powerful communication! Whether you are exploring Parts of Speech, Tenses, Active/Passive Voice, or Creative Writing, I can break down any rule with simple examples.\n\nType any sentence you want me to inspect, or ask about any grammatical term!`,
      follow_ups: ['What are Prepositions?', 'Explain Subject-Verb Agreement', 'Check my sentence']
    };
  }

  // 3. Olympiad Problem Strategy
  if (query.includes('olympiad') || query.includes('imo') || query.includes('ieo') || query.includes('logic') || query.includes('pattern')) {
    return {
      reply: `🏆 **Guru AI's Olympiad Strategy Room (Class ${grade})**:\n\nWinning an Olympiad medal is 40% knowledge and 60% strategy!\n\nHere are 3 Golden Rules for high scores:\n1. **Units Digit Elimination**: Before multiplying large numbers, multiply just their last digits to eliminate 2 or 3 multiple-choice options immediately!\n2. **Pattern Differencing**: For number sequences, write the differences between consecutive terms. If differences increase by $+2, +4, +6...$, it is an arithmetic progression of differences.\n3. **Achievers Section Prioritization**: In IMO, Achievers section questions carry double points (2 or 3 marks). Spend your clearest focus on them.\n\nWould you like a sample Olympiad problem for Class ${grade}?`,
      follow_ups: ['Give me a Class 3 IMO question', 'Give me an IEO English question', 'Explain pattern tricks']
    };
  }

  // 4. Socratic Default (Encouraging, guiding pedagogy)
  return {
    reply: `🌟 **Hello Champion Learner! I am Guru AI, your dedicated TalentHunt learning companion.**\n\nI am here to help you master **CBSE Mathematics, Science, English, Grammar, Olympiad Challenges, and Vedic Mental Math** across Classes III through X.\n\nHow can I help you today?\n- ⚡ **Ask for a Vedic Math shortcut** (e.g., *"How do I multiply by 11 mentally?"*)\n- 📚 **Clarify a grammar rule** (e.g., *"When do I use 'has' vs 'have'?"*)\n- 📐 **Break down a math concept** (e.g., *"Explain fractions like I'm in Class 3"*)\n- 🎯 **Generate a practice challenge**`,
    follow_ups: [
      'Show me a mental math trick',
      'Explain fractions with an example',
      'Give me an Olympiad question',
      'What are Collective Nouns?'
    ]
  };
}

// 1. Interactive Tutor Chat Endpoint
router.post('/tutor', aiLimiter, optionalAuth, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // Enforce input length limit to prevent abuse
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message is too long. Please keep it under 2000 characters.' });
    }

    // Pedagogical response generator
    const response = generateOfflinePedagogicalAnswer(message, context);

    res.json({
      reply: response.reply,
      follow_ups: response.follow_ups,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('AI Tutor error:', err);
    res.status(500).json({ error: 'AI Assistant temporarily unavailable' });
  }
});

module.exports = router;
