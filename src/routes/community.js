const express = require('express');
const { dbAdapter } = require('../db/database');
const { requireRegisteredUser, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Initial seed discussions so community is warm and active
const initialDoubts = [
  {
    id: 'dbt-1',
    author_name: 'Aarav Sharma',
    author_avatar: 'astronaut',
    grade: 3,
    subject: 'Mathematics',
    title: 'How does the Vedic shortcut for squaring 45 actually work?',
    body: 'I tried (4 × 5) followed by 25 = 2025. Is the formula always (First Digit × Next Digit) + 25? Why does that happen algebraically?',
    upvotes: 14,
    reply_count: 2,
    is_resolved: 1,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'dbt-2',
    author_name: 'Riya Gupta',
    author_avatar: 'explorer',
    grade: 3,
    subject: 'English Grammar',
    title: 'What is the easiest way to identify Collective Nouns vs Plural Nouns?',
    body: 'In sentences like "A swarm of bees flew over the trees", why is swarm singular while bees is plural? Any easy mental trick?',
    upvotes: 9,
    reply_count: 1,
    is_resolved: 1,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'dbt-3',
    author_name: 'Vihaan Patel',
    author_avatar: 'robot',
    grade: 4,
    subject: 'Olympiad Logic',
    title: 'Tips for solving pattern sequences in IMO Achievers Section?',
    body: 'Sometimes numbers skip alternating squares and cubes. What sequence should we check first during timed rounds?',
    upvotes: 7,
    reply_count: 1,
    is_resolved: 0,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

const initialReplies = [
  {
    id: 'rep-1',
    doubt_id: 'dbt-1',
    author_name: 'Abhijit Kumar Misra (Mentor)',
    author_avatar: 'lion',
    body: 'Great question Aarav! Any number ending in 5 can be written as (10a + 5). Its square is (10a + 5)² = 100a² + 100a + 25 = 100a(a + 1) + 25. Thus, the left part is always a × (a + 1), and the right part is 25! For 45, 4 × (4 + 1) = 20, appending 25 gives 2025.',
    is_expert: 1,
    upvotes: 18,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: 'rep-2',
    doubt_id: 'dbt-1',
    author_name: 'Ananya Verma',
    author_avatar: 'unicorn',
    body: 'I tested this for 85 and 95 too! 8 × 9 = 72 -> 7225. 9 × 10 = 90 -> 9025. Super fast in exams!',
    is_expert: 0,
    upvotes: 8,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'rep-3',
    doubt_id: 'dbt-2',
    author_name: 'Abhijit Kumar Misra (Mentor)',
    author_avatar: 'lion',
    body: 'Remember this rule: A collective noun names ONE entire team or group acting as a single unit (swarm, herd, bouquet, flock). Even though the unit has many members inside it, the unit itself is singular ("A swarm was seen", "The team is ready").',
    is_expert: 1,
    upvotes: 12,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'rep-4',
    doubt_id: 'dbt-3',
    author_name: 'Aarav Sharma',
    author_avatar: 'astronaut',
    body: 'In IMO, first check consecutive differences (+2, +4, +8...). If that fails, test squares (n² or n² + 1) and alternating indices (odd positions vs even positions).',
    is_expert: 0,
    upvotes: 6,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Helper to ensure initial community data exists in DB
let communitySeeded = false;
async function ensureCommunitySeeded() {
  if (communitySeeded) return;
  try {
    const count = await dbAdapter.queryOne('SELECT COUNT(*) as count FROM community_doubts');
    if (!count || parseInt(count.count, 10) === 0) {
      for (const d of initialDoubts) {
        await dbAdapter.execute(
          `INSERT INTO community_doubts (id, user_id, author_name, author_avatar, grade, subject, title, body, upvotes, reply_count, is_resolved, created_at)
           VALUES (?, '1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [d.id, d.author_name, d.author_avatar, d.grade, d.subject, d.title, d.body, d.upvotes, d.reply_count, d.is_resolved, d.created_at]
        );
      }
      for (const r of initialReplies) {
        await dbAdapter.execute(
          `INSERT INTO community_replies (id, doubt_id, user_id, author_name, author_avatar, body, is_expert, upvotes, created_at)
           VALUES (?, ?, '1', ?, ?, ?, ?, ?, ?)`,
          [r.id, r.doubt_id, r.author_name, r.author_avatar, r.body, r.is_expert, r.upvotes, r.created_at]
        );
      }
    }
    communitySeeded = true;
  } catch (err) {
    console.warn('Community seeding notice:', err.message);
  }
}

// 1. Get All Doubts with Filtering
router.get('/doubts', async (req, res) => {
  try {
    await ensureCommunitySeeded();

    const { grade, subject } = req.query;
    let sql = 'SELECT * FROM community_doubts WHERE 1=1';
    const params = [];

    if (grade) {
      sql += ' AND grade = ?';
      params.push(parseInt(grade, 10));
    }
    if (subject && subject !== 'All') {
      sql += ' AND subject LIKE ?';
      params.push(`%${subject}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT 30';

    const doubts = await dbAdapter.queryAll(sql, params);
    res.json({ doubts });
  } catch (err) {
    console.error('Fetch doubts error:', err);
    res.status(500).json({ error: 'Failed to load community questions' });
  }
});

// 2. Post a New Academic Doubt (Registration Required)
router.post('/doubts', requireRegisteredUser, async (req, res) => {
  try {
    const { title, body, subject, grade } = req.body;

    if (!title || !title.trim() || !body || !body.trim()) {
      return res.status(400).json({ error: 'Please provide both a title and detailed question.' });
    }

    const user = await dbAdapter.queryOne('SELECT display_name, avatar, grade, xp FROM users WHERE id = ?', [req.user.id]);
    const authorName = user ? user.display_name : 'Student';
    const authorAvatar = user ? user.avatar : 'lion';
    const studentGrade = grade ? parseInt(grade, 10) : (user && user.grade ? user.grade : 3);
    const doubtSubject = (subject && subject.trim()) || 'Mathematics';

    const doubtId = 'dbt_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const nowIso = new Date().toISOString();

    await dbAdapter.execute(
      `INSERT INTO community_doubts (id, user_id, author_name, author_avatar, grade, subject, title, body, upvotes, reply_count, is_resolved, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?)`,
      [doubtId, req.user.id.toString(), authorName, authorAvatar, studentGrade, doubtSubject, title.trim(), body.trim(), nowIso]
    );

    // Award 15 XP for asking an academic question
    await dbAdapter.execute('UPDATE users SET xp = xp + 15 WHERE id = ?', [req.user.id]);

    res.json({
      message: 'Question posted to Community Hub! Earned +15 XP.',
      doubt: {
        id: doubtId,
        author_name: authorName,
        author_avatar: authorAvatar,
        grade: studentGrade,
        subject: doubtSubject,
        title: title.trim(),
        body: body.trim(),
        upvotes: 0,
        reply_count: 0,
        is_resolved: 0,
        created_at: nowIso
      }
    });
  } catch (err) {
    console.error('Post doubt error:', err);
    res.status(500).json({ error: 'Failed to submit doubt' });
  }
});

// 3. Get Specific Doubt and its Replies
router.get('/doubts/:id', async (req, res) => {
  try {
    await ensureCommunitySeeded();
    const { id } = req.params;

    const doubt = await dbAdapter.queryOne('SELECT * FROM community_doubts WHERE id = ?', [id]);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    const replies = await dbAdapter.queryAll(
      'SELECT * FROM community_replies WHERE doubt_id = ? ORDER BY is_expert DESC, upvotes DESC, created_at ASC',
      [id]
    );

    res.json({
      doubt,
      replies
    });
  } catch (err) {
    console.error('Fetch doubt detail error:', err);
    res.status(500).json({ error: 'Failed to load question details' });
  }
});

// 4. Post Reply / Explanation to a Doubt (Registration Required)
router.post('/doubts/:id/replies', requireRegisteredUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Reply text cannot be empty.' });
    }

    const doubt = await dbAdapter.queryOne('SELECT id FROM community_doubts WHERE id = ?', [id]);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    const user = await dbAdapter.queryOne('SELECT display_name, avatar, is_admin FROM users WHERE id = ?', [req.user.id]);
    const authorName = user ? user.display_name : 'Peer Learner';
    const authorAvatar = user ? user.avatar : 'lion';
    const isExpert = (user && user.is_admin === 1) ? 1 : 0;

    const replyId = 'rep_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const nowIso = new Date().toISOString();

    await dbAdapter.execute(
      `INSERT INTO community_replies (id, doubt_id, user_id, author_name, author_avatar, body, is_expert, upvotes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [replyId, id, req.user.id.toString(), authorName, authorAvatar, body.trim(), isExpert, nowIso]
    );

    // Increment reply count and mark resolved if answered
    await dbAdapter.execute(
      'UPDATE community_doubts SET reply_count = reply_count + 1, is_resolved = 1 WHERE id = ?',
      [id]
    );

    // Award 25 XP for contributing an answer
    await dbAdapter.execute('UPDATE users SET xp = xp + 25 WHERE id = ?', [req.user.id]);

    // Check and award Peer Mentor badge
    const badgeExists = await dbAdapter.queryOne(
      'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [req.user.id.toString(), 'community_helper']
    );
    if (!badgeExists) {
      const bId = 'b_' + Date.now();
      await dbAdapter.execute(
        'INSERT INTO user_badges (id, user_id, badge_id, badge_title, badge_icon, badge_desc) VALUES (?, ?, ?, ?, ?, ?)',
        [bId, req.user.id.toString(), 'community_helper', 'Peer Mentor', '🤝', 'Answered a peer academic question in the Community Hub.']
      );
    }

    res.json({
      message: 'Explanation posted successfully! Earned +25 XP.',
      reply: {
        id: replyId,
        doubt_id: id,
        author_name: authorName,
        author_avatar: authorAvatar,
        body: body.trim(),
        is_expert: isExpert,
        upvotes: 0,
        created_at: nowIso
      }
    });
  } catch (err) {
    console.error('Post reply error:', err);
    res.status(500).json({ error: 'Failed to post explanation' });
  }
});

// 5. Upvote a Doubt (Registration Required)
router.post('/doubts/:id/upvote', requireRegisteredUser, async (req, res) => {
  try {
    const { id } = req.params;
    await dbAdapter.execute('UPDATE community_doubts SET upvotes = upvotes + 1 WHERE id = ?', [id]);
    const updated = await dbAdapter.queryOne('SELECT upvotes FROM community_doubts WHERE id = ?', [id]);
    res.json({ success: true, upvotes: updated ? updated.upvotes : 1 });
  } catch (err) {
    console.error('Upvote error:', err);
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// 6. Collaborative Daily Challenge ("Question of the Day")
const dailyChallengeData = {
  challenge_id: 'ch-2026-10',
  title: 'Daily Speed Challenge: The 95² Mental Lightning Drill',
  subject: 'Vedic Mathematics & Logical Reasoning',
  grade_target: 'Class III to X',
  question_text: 'Using the Vedic Sutra "Ekadhikena Purvena" (By one more than the one before), calculate 95² mentally in 3 seconds. What is the value?',
  options: ['9025', '8525', '9125', '9225'],
  correct_answer: '9025',
  hint: 'Multiply the tens digit 9 by (9 + 1 = 10). Then place 25 at the end: (9 × 10 = 90) + 25 = 9025!',
  explanation: 'Formula: For any number 10a + 5, (10a + 5)² = 100 × a(a + 1) + 25. Here a = 9, so 9 × 10 = 90, followed by 25 = 9025.',
  total_solves_today: 48,
  reward_xp: 35
};

router.get('/daily-challenge', async (req, res) => {
  res.json({
    challenge: {
      id: dailyChallengeData.challenge_id,
      title: dailyChallengeData.title,
      subject: dailyChallengeData.subject,
      grade_target: dailyChallengeData.grade_target,
      question_text: dailyChallengeData.question_text,
      options: dailyChallengeData.options,
      hint: dailyChallengeData.hint,
      total_solves_today: dailyChallengeData.total_solves_today,
      reward_xp: dailyChallengeData.reward_xp
    }
  });
});

// 7. Solve Daily Challenge (Registration Required)
router.post('/daily-challenge/solve', requireRegisteredUser, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ error: 'Please choose an answer.' });
    }

    const isCorrect = answer.trim() === dailyChallengeData.correct_answer;
    if (!isCorrect) {
      return res.json({
        correct: false,
        message: 'Incorrect, but do not give up! Check the hint and try again.',
        hint: dailyChallengeData.hint
      });
    }

    // Award daily challenge bonus XP
    await dbAdapter.execute('UPDATE users SET xp = xp + 35, stars = stars + 1 WHERE id = ?', [req.user.id]);
    dailyChallengeData.total_solves_today++;

    res.json({
      correct: true,
      message: 'Outstanding! You correctly solved the Daily Community Challenge!',
      xp_gained: 35,
      stars_gained: 1,
      explanation: dailyChallengeData.explanation
    });
  } catch (err) {
    console.error('Solve daily challenge error:', err);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

module.exports = router;
