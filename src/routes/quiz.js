const express = require('express');
const { dbAdapter } = require('../db/database');
const { optionalAuth } = require('../middleware/auth');

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

// 1. Get Practice Questions for a specific Topic
router.get('/practice/:topicId', async (req, res) => {
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

// 2. Get Olympiad Exam with Countdown Timer & Sections
router.get('/olympiad/:olympiadId', async (req, res) => {
  try {
    const { olympiadId } = req.params;
    const exam = await dbAdapter.queryOne('SELECT * FROM olympiad_exams WHERE id = ?', [olympiadId]);
    if (!exam) {
      return res.status(404).json({ error: 'Olympiad exam not found' });
    }

    const typeCode = exam.code.toLowerCase().includes('imo') ? 'imo' : 'ieo';
    const rawQuestions = await dbAdapter.queryAll(
      'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, points FROM questions WHERE is_olympiad = 1 AND olympiad_type = ?',
      [typeCode]
    );

    const questionsWithParsedOptions = rawQuestions.map((q, index) => ({
      id: q.id,
      index: index + 1,
      section: q.section,
      difficulty: q.difficulty,
      question_text: q.question_text,
      options: JSON.parse(q.options_json),
      points: q.points || (q.section.includes('Achievers') ? 2 : 1)
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

// 3. Submit Quiz / Olympiad & Evaluate
router.post('/submit', optionalAuth, async (req, res) => {
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

    if (!answers || typeof answers !== 'object') {
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
      const isCorrect = studentChoice && studentChoice.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
      const isSkipped = !studentChoice || studentChoice.trim() === '';

      if (isCorrect) {
        score += qPoints;
        correctCount++;
      }

      detailedReview.push({
        id: q.id,
        section: q.section,
        question_text: q.question_text,
        options: JSON.parse(q.options_json),
        student_choice: studentChoice || null,
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

    if (req.user) {
      const dbUser = await dbAdapter.queryOne('SELECT display_name, avatar, xp, stars FROM users WHERE id = ?', [req.user.id]);
      if (dbUser) {
        studentName = dbUser.display_name;
        studentAvatar = dbUser.avatar;
      }
    } else if (guest_name) {
      studentName = guest_name.trim();
    }

    // Award XP and Stars
    const xpGained = correctCount * 15 + (percentage >= 80 ? 50 : 20);
    const starsGained = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

    if (req.user) {
      await dbAdapter.execute(
        'UPDATE users SET xp = xp + ?, stars = stars + ? WHERE id = ?',
        [xpGained, starsGained, req.user.id]
      );
    }

    // Record attempt
    const attemptId = 'att_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    await dbAdapter.execute(
      `INSERT INTO quiz_attempts (id, user_id, user_name, avatar, quiz_type, quiz_title, score, total_marks, percentage, time_taken_seconds, total_questions, correct_count, answers_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        JSON.stringify(detailedReview)
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
      certificate,
      review: detailedReview
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: 'Failed to process quiz submission' });
  }
});

module.exports = router;
