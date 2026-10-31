const express = require('express');
const { dbAdapter } = require('../db/database');
const { optionalAuth, requireRegisteredUser } = require('../middleware/auth');

const router = express.Router();

// Helper to shuffle array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Module-level badge award helper.
 * Checks if a user already holds a badge and inserts it if not.
 * Returns the awarded badge object, or null if it already existed.
 */
async function checkAndAwardBadge(userId, badgeId, badgeTitle, badgeIcon, badgeDesc) {
  const exists = await dbAdapter.queryOne(
    'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
    [userId.toString(), badgeId]
  );
  if (!exists) {
    const bId = 'b_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    await dbAdapter.execute(
      'INSERT INTO user_badges (id, user_id, badge_id, badge_title, badge_icon, badge_desc) VALUES (?, ?, ?, ?, ?, ?)',
      [bId, userId.toString(), badgeId, badgeTitle, badgeIcon, badgeDesc]
    );
    return { badge_id: badgeId, badge_title: badgeTitle, badge_icon: badgeIcon, badge_desc: badgeDesc };
  }
  return null;
}

// 1. Get Practice Questions for a specific Topic (Registration Required)
router.get('/practice/:topicId', requireRegisteredUser, async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await dbAdapter.queryOne('SELECT * FROM topics WHERE id = ?', [topicId]);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const rawQuestions = await dbAdapter.queryAll(
      'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, hint, points FROM questions WHERE topic_id = ? AND is_olympiad = 0',
      [topicId]
    );

    if (rawQuestions.length === 0) {
      return res.status(404).json({ error: 'No questions available yet for this topic.' });
    }

    const formattedQuestions = shuffleArray(rawQuestions).map((q, idx) => ({
      id: q.id,
      index: idx + 1,
      section: q.section,
      difficulty: q.difficulty,
      question_text: q.question_text,
      options: JSON.parse(q.options_json),
      hint: q.hint,
      points: q.points || 1
    }));

    res.json({
      type: 'practice',
      topic: {
        id: topic.id,
        title: topic.title,
        icon: topic.icon
      },
      total_questions: formattedQuestions.length,
      questions: formattedQuestions
    });
  } catch (err) {
    console.error('Fetch practice questions error:', err);
    res.status(500).json({ error: 'Failed to load practice questions' });
  }
});

// 2. Get Olympiad Exam with Countdown Timer & Sections (Registration Required)
router.get('/olympiad/:olympiadId', requireRegisteredUser, async (req, res) => {
  try {
    const { olympiadId } = req.params;
    const exam = await dbAdapter.queryOne('SELECT * FROM olympiad_exams WHERE id = ?', [olympiadId]);
    if (!exam) {
      return res.status(404).json({ error: 'Olympiad exam not found' });
    }

    let typeCode = 'imo';
    if (exam.id.toLowerCase().includes('mcq') || exam.code.toLowerCase().includes('mcq')) {
      typeCode = 'mcq';
    } else if (exam.code.toLowerCase().includes('ieo')) {
      typeCode = 'ieo';
    } else if (exam.code.toLowerCase().includes('apt') || exam.id.toLowerCase().includes('apt')) {
      typeCode = 'aptitude';
    }
    const rawQuestions = await dbAdapter.queryAll(
      `SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, points
       FROM questions
       WHERE is_olympiad = 1 AND olympiad_type = ? AND olympiad_grade = ?
       ORDER BY id ASC`,
      [typeCode, exam.grade]
    );

    if (rawQuestions.length === 0) {
      return res.status(404).json({ error: `No questions are available yet for ${exam.title}.` });
    }

    const questionsWithParsedOptions = rawQuestions.map((q, index) => ({
      id: q.id,
      index: index + 1,
      section: q.section,
      difficulty: q.difficulty,
      question_text: q.question_text,
      prompt: q.question_text,
      options: JSON.parse(q.options_json),
      points: q.points || (q.section && q.section.includes('Achievers') ? 2 : 1)
    }));

    res.json({
      type: 'olympiad',
      exam: {
        id: exam.id,
        code: exam.code,
        title: exam.title,
        grade: exam.grade,
        total_questions: exam.total_questions,
        duration_minutes: exam.duration_minutes,
        duration_seconds: exam.duration_minutes * 60,
        total_marks: exam.total_marks,
        description: exam.description,
        sections: JSON.parse(exam.sections_json)
      },
      questions: questionsWithParsedOptions
    });
  } catch (err) {
    console.error('Fetch Olympiad exam error:', err);
    res.status(500).json({ error: 'Failed to load Olympiad exam' });
  }
});

// 3. Submit Quiz / Olympiad & Evaluate (Registration Required)
router.post('/submit', requireRegisteredUser, async (req, res) => {
  try {
    const {
      quiz_type,
      quiz_id,
      quiz_title,
      answers, // Object mapping question_id -> chosen option string
      time_taken_seconds,
      guest_name,
      avatar
    } = req.body;

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }

    const questionIds = Object.keys(answers);
    if (questionIds.length === 0) {
      return res.status(400).json({ error: 'No answers submitted' });
    }

    // Fetch all true answers from database
    const placeholders = questionIds.map(() => '?').join(',');
    const dbQuestions = await dbAdapter.queryAll(
      `SELECT id, section, question_text, options_json, correct_answer, explanation, points FROM questions WHERE id IN (${placeholders})`,
      questionIds
    );

    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    const detailedReview = [];

    for (const q of dbQuestions) {
      const qPoints = q.points || (q.section && q.section.includes('Achievers') ? 2 : 1);
      totalMarks += qPoints;

      const studentChoice = answers[q.id];
      let studentChoiceText = null;
      if (studentChoice !== undefined && studentChoice !== null) {
        const parsedOptions = JSON.parse(q.options_json);
        if (typeof studentChoice === 'number' && parsedOptions[studentChoice] !== undefined) {
          studentChoiceText = String(parsedOptions[studentChoice]);
        } else if (!isNaN(studentChoice) && parsedOptions[Number(studentChoice)] !== undefined && typeof studentChoice !== 'boolean') {
          studentChoiceText = String(parsedOptions[Number(studentChoice)]);
        } else {
          studentChoiceText = String(studentChoice);
        }
      }

      const isCorrect = studentChoiceText !== null && studentChoiceText.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
      const isSkipped = studentChoiceText === null || studentChoiceText.trim() === '';

      if (isCorrect) {
        score += qPoints;
        correctCount++;
      }

      detailedReview.push({
        id: q.id,
        section: q.section,
        question_text: q.question_text,
        options: JSON.parse(q.options_json),
        student_choice: studentChoiceText || null,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        is_skipped: isSkipped,
        points_earned: isCorrect ? qPoints : 0,
        max_points: qPoints,
        explanation: q.explanation
      });
    }

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const timeSpent = parseInt(time_taken_seconds, 10) || 0;

    // Student identification
    let userId = req.user ? req.user.id.toString() : 'guest';
    let studentName = 'Champion Learner';
    let studentAvatar = avatar || 'lion';
    let currentStreak = 1;

    // Anti-Cheating Telemetry Computation
    const rawSwitches = parseInt(req.body.tab_switches, 10) || 0;
    const timeTelemetry = req.body.telemetry || {};
    const timePerQ = req.body.time_per_question || {};
    
    // Analyze question speed anomalies (< 1.2 seconds per question)
    let anomalyCount = 0;
    if (typeof timePerQ === 'object') {
      for (const qid in timePerQ) {
        if (typeof timePerQ[qid] === 'number' && timePerQ[qid] < 1.2 && timePerQ[qid] > 0) {
          anomalyCount++;
        }
      }
    }

    // Proctoring Integrity Score: 100 base, -15 per tab switch, -10 per rapid speed anomaly
    const integrityScore = Math.max(0, Math.min(100, 100 - (rawSwitches * 15) - (anomalyCount * 10)));
    let integrityTier = 'Flawless (100%)';
    if (integrityScore < 70) integrityTier = 'Suspicious Activity Detected';
    else if (integrityScore < 90) integrityTier = 'Moderate Proctoring Flags';

    // Award XP and Stars (with integrity multiplier)
    const integrityMultiplier = integrityScore >= 90 ? 1.2 : integrityScore >= 70 ? 1.0 : 0.7;
    const baseXP = correctCount * 15 + (percentage >= 80 ? 50 : 20);
    const xpGained = Math.round(baseXP * integrityMultiplier);
    const starsGained = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

    // Streak & Profile Updates for Registered Student
    const newlyEarnedBadges = [];
    if (req.user) {
      const dbUser = await dbAdapter.queryOne(
        'SELECT display_name, avatar, xp, stars, streak_days, streak_last_date FROM users WHERE id = ?',
        [req.user.id]
      );
      if (dbUser) {
        studentName = dbUser.display_name;
        studentAvatar = dbUser.avatar;

        // Daily Streak Calculation
        const todayStr = new Date().toISOString().slice(0, 10);
        let nextStreak = dbUser.streak_days || 1;
        if (dbUser.streak_last_date) {
          const lastDate = new Date(dbUser.streak_last_date);
          const todayDate = new Date(todayStr);
          const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            nextStreak += 1;
          } else if (diffDays > 1) {
            nextStreak = 1;
          }
        }
        currentStreak = nextStreak;

        await dbAdapter.execute(
          'UPDATE users SET xp = xp + ?, stars = stars + ?, streak_days = ?, streak_last_date = ? WHERE id = ?',
          [xpGained, starsGained, nextStreak, todayStr, req.user.id]
        );

        // 1. First Step Badge
        const b1 = await checkAndAwardBadge(req.user.id, 'first_step', 'First Step', '🌱', 'Completed your first practice assessment on TalentHunt.');
        if (b1) newlyEarnedBadges.push(b1);

        // 2. Sharpshooter Badge (100% score)
        if (percentage === 100) {
          const b2 = await checkAndAwardBadge(req.user.id, 'sharpshooter', 'Sharpshooter', '🎯', 'Scored a perfect 100% on a comprehensive quiz.');
          if (b2) newlyEarnedBadges.push(b2);
        }

        // 3. Honorable Scholar Badge (100% Integrity on assessment)
        if (integrityScore === 100 && dbQuestions.length >= 5) {
          const b3 = await checkAndAwardBadge(req.user.id, 'honorable_scholar', 'Honorable Scholar', '🛡️', 'Maintained 100% proctoring integrity with zero tab switches.');
          if (b3) newlyEarnedBadges.push(b3);
        }

        // 4. Vedic Prodigy Badge
        if (quiz_title && quiz_title.toLowerCase().includes('vedic') && percentage >= 80) {
          const b4 = await checkAndAwardBadge(req.user.id, 'vedic_prodigy', 'Vedic Prodigy', '⚡', 'Mastered lightning-fast Vedic mental calculation principles.');
          if (b4) newlyEarnedBadges.push(b4);
        }

        // 5. Streak Hero Badge
        if (nextStreak >= 3) {
          const b5 = await checkAndAwardBadge(req.user.id, 'streak_hero', 'Consistency Hero', '🔥', 'Maintained a 3-day active learning streak.');
          if (b5) newlyEarnedBadges.push(b5);
        }      }
    } else if (guest_name) {
      studentName = guest_name.trim();
    }

    // Record attempt with anti-cheating telemetry
    const attemptId = 'att_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const telemetryPayload = JSON.stringify({
      tab_switches: rawSwitches,
      speed_anomalies: anomalyCount,
      integrity_score: integrityScore,
      details: timeTelemetry
    });

    await dbAdapter.execute(
      `INSERT INTO quiz_attempts (id, user_id, user_name, avatar, quiz_type, quiz_title, score, total_marks, percentage, time_taken_seconds, total_questions, correct_count, answers_json, integrity_score, tab_switches, telemetry_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attemptId,
        userId,
        studentName,
        studentAvatar,
        quiz_type || 'practice',
        quiz_title || 'Class III Quiz',
        score,
        totalMarks,
        percentage,
        timeSpent,
        dbQuestions.length,
        correctCount,
        JSON.stringify(detailedReview),
        integrityScore,
        rawSwitches,
        telemetryPayload
      ]
    );

    // Determine Certificate Award (for Olympiads or score >= 60%)
    let certificate = null;
    let rankTier = 'Distinction';
    if (percentage >= 90) rankTier = 'Gold Medalist - Outstanding';
    else if (percentage >= 80) rankTier = 'Silver Medalist - Excellence';
    else if (percentage >= 70) rankTier = 'Bronze Medalist - Merit';
    else if (percentage >= 60) rankTier = 'Honorable Mention';

    if (percentage >= 60) {
      const certNumber = 'TH-2026-' + Math.floor(100000 + Math.random() * 900000);
      const certId = 'cert_' + Date.now();
      const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      await dbAdapter.execute(
        `INSERT INTO certificates (id, attempt_id, student_name, exam_title, score, total_marks, percentage, rank_tier, issued_date, certificate_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [certId, attemptId, studentName, quiz_title, score, totalMarks, percentage, rankTier, issueDate, certNumber]
      );

      certificate = {
        id: certId,
        certificate_number: certNumber,
        student_name: studentName,
        exam_title: quiz_title,
        score,
        total_marks: totalMarks,
        percentage,
        rank_tier: rankTier,
        issued_date: issueDate
      };
    }

    res.json({
      attempt_id: attemptId,
      student_name: studentName,
      quiz_title,
      score,
      total_marks: totalMarks,
      percentage,
      total_questions: dbQuestions.length,
      correct_count: correctCount,
      wrong_count: dbQuestions.length - correctCount,
      time_taken_seconds: timeSpent,
      xp_gained: xpGained,
      stars_gained: starsGained,
      streak_days: currentStreak,
      anti_cheating: {
        integrity_score: integrityScore,
        tab_switches: rawSwitches,
        anomalies: anomalyCount,
        status: integrityTier
      },
      new_badges: newlyEarnedBadges,
      certificate,
      review: detailedReview
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: 'Failed to process quiz submission' });
  }
});

module.exports = router;
