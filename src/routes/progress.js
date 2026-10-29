const express = require('express');
const { dbAdapter } = require('../db/database');
const { optionalAuth, requireRegisteredUser } = require('../middleware/auth');

const router = express.Router();

// 1. Leaderboard of Star Learners (Supports Grade Filtering)
router.get('/leaderboard', async (req, res) => {
  try {
    const requestedGrade = req.query.grade ? parseInt(req.query.grade, 10) : null;
    let sql = `SELECT id, username, display_name, avatar, grade, xp, stars, streak_days
               FROM users
               WHERE is_guest = 0 OR xp > 100`;
    const params = [];

    if (requestedGrade) {
      sql += ` AND grade = ?`;
      params.push(requestedGrade);
    }

    sql += ` ORDER BY stars DESC, xp DESC LIMIT 15`;

    let rankList = await dbAdapter.queryAll(sql, params);

    // If fewer than 5 users in this grade, add honorary peer avatars (clearly flagged)
    if (rankList.length < 5) {
      const g = requestedGrade || 3;
      const honoraryStarters = [
        { id: 'hon-1', display_name: 'Aarav Sharma', avatar: 'astronaut', grade: g, xp: 820, stars: 24, streak_days: 5, is_honorary: true },
        { id: 'hon-2', display_name: 'Ananya Verma', avatar: 'unicorn', grade: g, xp: 740, stars: 21, streak_days: 4, is_honorary: true },
        { id: 'hon-3', display_name: 'Vihaan Patel', avatar: 'robot', grade: g, xp: 690, stars: 19, streak_days: 3, is_honorary: true },
        { id: 'hon-4', display_name: 'Riya Gupta', avatar: 'explorer', grade: g, xp: 580, stars: 16, streak_days: 2, is_honorary: true }
      ];
      rankList = [...rankList.map(u => ({ ...u, is_honorary: false })), ...honoraryStarters].slice(0, 10);
    }

    res.json({ leaderboard: rankList, grade: requestedGrade });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// 2. Student's Quiz History
router.get('/history', optionalAuth, async (req, res) => {
  try {
    let attempts = [];
    if (req.user) {
      attempts = await dbAdapter.queryAll(
        `SELECT id, quiz_type, quiz_title, score, total_marks, percentage, time_taken_seconds, correct_count, total_questions, integrity_score, tab_switches, created_at
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

// 3. Advanced Performance Analytics Engine (Registration Required)
router.get('/analytics', requireRegisteredUser, async (req, res) => {
  try {
    const userId = req.user.id.toString();

    // Query all attempts by this student
    const attempts = await dbAdapter.queryAll(
      `SELECT id, quiz_type, quiz_title, score, total_marks, percentage, time_taken_seconds, correct_count, total_questions, integrity_score, created_at
       FROM quiz_attempts
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const totalAttempts = attempts.length;
    let totalScore = 0;
    let totalMaxMarks = 0;
    let totalTime = 0;
    let totalQ = 0;
    let totalCorrect = 0;
    let totalIntegrity = 0;

    const subjectMetrics = {
      Mathematics: { correct: 0, total: 0, attempts: 0 },
      English: { correct: 0, total: 0, attempts: 0 },
      VedicMath: { correct: 0, total: 0, attempts: 0 },
      Olympiad: { correct: 0, total: 0, attempts: 0 }
    };

    const topicStats = {};

    for (const a of attempts) {
      totalScore += a.score;
      totalMaxMarks += a.total_marks;
      totalTime += a.time_taken_seconds;
      totalQ += a.total_questions;
      totalCorrect += a.correct_count;
      totalIntegrity += (a.integrity_score !== null && a.integrity_score !== undefined) ? a.integrity_score : 100;

      const titleLower = (a.quiz_title || '').toLowerCase();
      let bucket = 'Mathematics';
      if (titleLower.includes('english') || titleLower.includes('grammar') || titleLower.includes('ieo')) {
        bucket = 'English';
      } else if (titleLower.includes('vedic')) {
        bucket = 'VedicMath';
      } else if (titleLower.includes('olympiad') || titleLower.includes('imo') || titleLower.includes('nso')) {
        bucket = 'Olympiad';
      }

      subjectMetrics[bucket].correct += a.correct_count;
      subjectMetrics[bucket].total += a.total_questions;
      subjectMetrics[bucket].attempts += 1;

      // Group topic mastery
      const topicKey = a.quiz_title;
      if (!topicStats[topicKey]) {
        topicStats[topicKey] = { attempts: 0, totalPct: 0, lastPct: a.percentage };
      }
      topicStats[topicKey].attempts++;
      topicStats[topicKey].totalPct += a.percentage;
    }

    const overallAccuracy = totalMaxMarks > 0 ? Math.round((totalScore / totalMaxMarks) * 100) : 0;
    const avgIntegrity = totalAttempts > 0 ? Math.round(totalIntegrity / totalAttempts) : 100;
    const avgSpeedPerQ = totalQ > 0 ? (totalTime / totalQ).toFixed(1) : 0;

    // Categorize Topic Mastery: Mastered (>=80%), Developing (60-79%), Practice Needed (<60%)
    const masteredTopics = [];
    const developingTopics = [];
    const practiceNeededTopics = [];

    for (const title in topicStats) {
      const avg = Math.round(topicStats[title].totalPct / topicStats[title].attempts);
      const item = { title, accuracy: avg, attempts: topicStats[title].attempts };
      if (avg >= 80) masteredTopics.push(item);
      else if (avg >= 60) developingTopics.push(item);
      else practiceNeededTopics.push(item);
    }

    // Format subject accuracy cards
    const subjectBreakdown = [
      {
        subject: 'Mathematics',
        accuracy: subjectMetrics.Mathematics.total > 0 ? Math.round((subjectMetrics.Mathematics.correct / subjectMetrics.Mathematics.total) * 100) : 0,
        questions: subjectMetrics.Mathematics.total,
        icon: '📐',
        color: '#10B981'
      },
      {
        subject: 'English & Grammar',
        accuracy: subjectMetrics.English.total > 0 ? Math.round((subjectMetrics.English.correct / subjectMetrics.English.total) * 100) : 0,
        questions: subjectMetrics.English.total,
        icon: '📚',
        color: '#8B5CF6'
      },
      {
        subject: 'Vedic Mathematics',
        accuracy: subjectMetrics.VedicMath.total > 0 ? Math.round((subjectMetrics.VedicMath.correct / subjectMetrics.VedicMath.total) * 100) : 0,
        questions: subjectMetrics.VedicMath.total,
        icon: '⚡',
        color: '#F59E0B'
      },
      {
        subject: 'Olympiad Challenges',
        accuracy: subjectMetrics.Olympiad.total > 0 ? Math.round((subjectMetrics.Olympiad.correct / subjectMetrics.Olympiad.total) * 100) : 0,
        questions: subjectMetrics.Olympiad.total,
        icon: '🏆',
        color: '#EC4899'
      }
    ];

    // Recent 5 Attempts Trend
    const recentTrend = attempts.slice(0, 5).map(a => ({
      title: a.quiz_title,
      score: a.score,
      total_marks: a.total_marks,
      percentage: a.percentage,
      date: a.created_at ? a.created_at.slice(0, 10) : 'Recent'
    }));

    res.json({
      analytics: {
        total_attempts: totalAttempts,
        total_questions: totalQ,
        total_time_seconds: totalTime,
        overall_accuracy: overallAccuracy,
        average_speed_seconds_per_q: parseFloat(avgSpeedPerQ),
        proctoring_integrity_avg: avgIntegrity,
        subject_breakdown: subjectBreakdown,
        mastered_topics: masteredTopics,
        developing_topics: developingTopics,
        practice_needed_topics: practiceNeededTopics,
        recent_trend: recentTrend
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to generate performance analytics' });
  }
});

// 4. Gamification Profile & Badges Engine (Registration Required)
router.get('/gamification', requireRegisteredUser, async (req, res) => {
  try {
    const user = await dbAdapter.queryOne(
      'SELECT id, username, display_name, avatar, grade, xp, stars, streak_days FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const xp = user.xp || 0;
    let levelName = 'Novice Seeker';
    let levelNumber = 1;
    let nextLevelXP = 200;
    let currentLevelFloor = 0;

    if (xp >= 2000) {
      levelName = 'Grandmaster Prodigy';
      levelNumber = 5;
      nextLevelXP = 5000;
      currentLevelFloor = 2000;
    } else if (xp >= 1000) {
      levelName = 'Olympiad Champion';
      levelNumber = 4;
      nextLevelXP = 2000;
      currentLevelFloor = 1000;
    } else if (xp >= 500) {
      levelName = 'Knowledge Master';
      levelNumber = 3;
      nextLevelXP = 1000;
      currentLevelFloor = 500;
    } else if (xp >= 200) {
      levelName = 'Apprentice Scholar';
      levelNumber = 2;
      nextLevelXP = 500;
      currentLevelFloor = 200;
    }

    const levelProgress = Math.min(
      100,
      Math.round(((xp - currentLevelFloor) / (nextLevelXP - currentLevelFloor)) * 100)
    );

    // Query earned badges
    const earnedBadges = await dbAdapter.queryAll(
      'SELECT badge_id, badge_title, badge_icon, badge_desc, earned_at FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC',
      [user.id.toString()]
    );

    // List of All Platform Badges with Unlock Criteria
    const allBadgesCatalog = [
      { id: 'first_step', title: 'First Step', icon: '🌱', description: 'Complete your first practice quiz or assessment.' },
      { id: 'sharpshooter', title: 'Sharpshooter', icon: '🎯', description: 'Score a perfect 100% on any practice or Olympiad test.' },
      { id: 'honorable_scholar', title: 'Honorable Scholar', icon: '🛡️', description: 'Achieve 100% test integrity with zero tab switches.' },
      { id: 'vedic_prodigy', title: 'Vedic Prodigy', icon: '⚡', description: 'Score 80%+ on any Vedic mental math challenge.' },
      { id: 'streak_hero', title: 'Consistency Hero', icon: '🔥', description: 'Maintain a 3-day or greater active daily learning streak.' },
      { id: 'grammar_guru', title: 'Grammar Guru', icon: '📚', description: 'Master 3 English grammar modules with distinction.' },
      { id: 'community_helper', title: 'Peer Mentor', icon: '🤝', description: 'Answer a peer academic doubt in the Community Hub.' }
    ];

    const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));
    const badgesWithStatus = allBadgesCatalog.map(b => ({
      ...b,
      is_unlocked: earnedBadgeIds.has(b.id),
      earned_at: earnedBadges.find(eb => eb.badge_id === b.id)?.earned_at || null
    }));

    res.json({
      gamification: {
        xp,
        stars: user.stars || 0,
        level_number: levelNumber,
        level_name: levelName,
        xp_next_level: nextLevelXP,
        level_progress_percent: levelProgress,
        streak_days: user.streak_days || 1,
        badges: badgesWithStatus
      }
    });
  } catch (err) {
    console.error('Gamification error:', err);
    res.status(500).json({ error: 'Failed to load gamification status' });
  }
});

// 5. Get Certificate by ID or Attempt ID
router.get('/certificate/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const cert = await dbAdapter.queryOne(
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
