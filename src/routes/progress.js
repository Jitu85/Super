const express = require('express');
const { dbAdapter } = require('../db/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 1. Leaderboard of Star Learners
router.get('/leaderboard', (req, res) => {
  try {
    const topUsers = dbAdapter.queryAll(
      `SELECT id, username, display_name, avatar, grade, xp, stars, streak_days
       FROM users
       WHERE is_guest = 0 OR xp > 100
       ORDER BY stars DESC, xp DESC
       LIMIT 10`
    );

    // If fewer than 5 users, include fun honorary AI mentor/peer avatars so the board is lively
    let rankList = topUsers;
    if (rankList.length < 5) {
      const honoraryStarters = [
        { id: 901, display_name: 'Aarav Sharma', avatar: 'astronaut', grade: 3, xp: 820, stars: 24, streak_days: 5 },
        { id: 902, display_name: 'Ananya Verma', avatar: 'unicorn', grade: 3, xp: 740, stars: 21, streak_days: 4 },
        { id: 903, display_name: 'Vihaan Patel', avatar: 'robot', grade: 3, xp: 690, stars: 19, streak_days: 3 },
        { id: 904, display_name: 'Riya Gupta', avatar: 'explorer', grade: 3, xp: 580, stars: 16, streak_days: 2 }
      ];
      rankList = [...topUsers, ...honoraryStarters].slice(0, 10);
    }

    res.json({ leaderboard: rankList });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// 2. Student's Quiz History
router.get('/history', optionalAuth, (req, res) => {
  try {
    let attempts = [];
    if (req.user) {
      attempts = dbAdapter.queryAll(
        `SELECT id, quiz_type, quiz_title, score, total_marks, percentage, time_taken_seconds, correct_count, total_questions, created_at
         FROM quiz_attempts
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 20`,
        [req.user.id.toString()]
      );
    }

    res.json({ attempts });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

// 3. Get Certificate by ID or Attempt ID
router.get('/certificate/:attemptId', (req, res) => {
  try {
    const { attemptId } = req.params;
    const cert = dbAdapter.queryOne(
      'SELECT * FROM certificates WHERE attempt_id = ? OR id = ?',
      [attemptId, attemptId]
    );

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ certificate: cert });
  } catch (err) {
    console.error('Certificate fetch error:', err);
    res.status(500).json({ error: 'Failed to load certificate' });
  }
});

module.exports = router;
