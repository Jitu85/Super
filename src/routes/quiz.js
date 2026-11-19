const express = require('express');
const { dbAdapter } = require('../db/database');
const { optionalAuth, requireRegisteredUser, requireAdmin } = require('../middleware/auth');
const { CBSE_UNIT_TEMPLATES } = require('../services/curriculumCluster');

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

// Helper to resolve course ID for entitlement checks
async function resolveCourseForPracticeTopic(topicId, subjectId) {
  if (subjectId) {
    const s = await dbAdapter.queryOne('SELECT id, grade FROM subjects WHERE id = ?', [subjectId]);
    if (s) {
      if (s.id === 'vedic-maths' || s.id === 'english-grammar') return s.id;
      if (s.grade) return `class-${s.grade}`;
    }
  }
  if (topicId.startsWith('sec-')) {
    const sectionName = decodeURIComponent(topicId.substring(4));
    const sample = await dbAdapter.queryOne('SELECT subject_id FROM questions WHERE section = ? LIMIT 1', [sectionName]);
    if (sample && sample.subject_id) {
      const s = await dbAdapter.queryOne('SELECT id, grade FROM subjects WHERE id = ?', [sample.subject_id]);
      if (s) {
        if (s.id === 'vedic-maths' || s.id === 'english-grammar') return s.id;
        if (s.grade) return `class-${s.grade}`;
      }
    }
  }
  const top = await dbAdapter.queryOne('SELECT subject_id FROM topics WHERE id = ?', [topicId]);
  if (top && top.subject_id) {
    const s = await dbAdapter.queryOne('SELECT id, grade FROM subjects WHERE id = ?', [top.subject_id]);
    if (s) {
      if (s.id === 'vedic-maths' || s.id === 'english-grammar') return s.id;
      if (s.grade) return `class-${s.grade}`;
    }
  }
  return null;
}

// 1. Get Practice Questions for a specific Topic or Unit (Registration Required)
router.get('/practice/:topicId', requireRegisteredUser, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { subjectId, difficulty } = req.query;

    // Commercial Enrolment Guard
    const courseId = await resolveCourseForPracticeTopic(topicId, subjectId);
    if (courseId && req.user && req.user.is_admin !== 1 && req.user.is_admin !== true) {
      const enr = await dbAdapter.queryOne(
        "SELECT id FROM user_enrolments WHERE user_id = ? AND course_id = ? AND status = 'active'",
        [req.user.id, courseId]
      );
      if (!enr) {
        return res.status(403).json({
          error: 'enrolment_required',
          course_id: courseId,
          message: `Enrolment required to access practice questions for ${courseId.replace('class-', 'Class ')}.`
        });
      }
    }

    let topic = await dbAdapter.queryOne('SELECT * FROM topics WHERE id = ?', [topicId]);
    let rawQuestions = [];

    if (topicId.startsWith('unit-')) {
      const unitKey = topicId.substring(5);

      let matchedTmpl = null;
      for (const fam of Object.values(CBSE_UNIT_TEMPLATES)) {
        const found = fam.find(t => t.unit_key === unitKey);
        if (found) { matchedTmpl = found; break; }
      }

      const diffLabel = difficulty ? ` • ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` : '';
      topic = {
        id: topicId,
        title: (matchedTmpl ? matchedTmpl.title : 'CBSE Curriculum Unit Drill') + diffLabel,
        icon: matchedTmpl ? matchedTmpl.icon : '📚'
      };

      let query = 'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points FROM questions';
      let params = [];
      if (subjectId) {
        query += ' WHERE subject_id = ?';
        params.push(subjectId);
      }
      const allSubjectQs = await dbAdapter.queryAll(query, params);

      if (matchedTmpl) {
        rawQuestions = allSubjectQs.filter(q => {
          const secLower = (q.section || '').toLowerCase();
          return matchedTmpl.matchKeywords.some(kw => secLower.includes(kw));
        });
      }
      if (rawQuestions.length === 0) {
        rawQuestions = allSubjectQs;
      }

      // Filter by requested difficulty tier if provided
      if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
        const diffFiltered = rawQuestions.filter(q => (q.difficulty || '').toLowerCase() === difficulty.toLowerCase());
        if (diffFiltered.length >= 3) {
          rawQuestions = diffFiltered;
        }
      }

      if (rawQuestions.length > 15) {
        rawQuestions = shuffleArray(rawQuestions).slice(0, 15);
      }
    } else if (topicId.startsWith('sec-')) {
      const sectionName = decodeURIComponent(topicId.substring(4));
      const diffLabel = difficulty ? ` • ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` : '';
      topic = {
        id: topicId,
        title: sectionName + diffLabel,
        icon: '📘'
      };
      let query = 'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points FROM questions WHERE section = ?';
      let params = [sectionName];
      if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
        query += ' AND difficulty = ?';
        params.push(difficulty.toLowerCase());
      }
      rawQuestions = await dbAdapter.queryAll(query, params);
      if (rawQuestions.length === 0 && difficulty) {
        rawQuestions = await dbAdapter.queryAll(
          'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points FROM questions WHERE section = ?',
          [sectionName]
        );
      }
    } else {
      if (!topic) {
        // Fallback search by section or title
        const possibleSec = await dbAdapter.queryOne(
          'SELECT DISTINCT section FROM questions WHERE section LIKE ?',
          [`%${topicId}%`]
        );
        if (possibleSec) {
          const diffLabel = difficulty ? ` • ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` : '';
          topic = { id: topicId, title: possibleSec.section + diffLabel, icon: '📘' };
          let query = 'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points FROM questions WHERE section = ?';
          let params = [possibleSec.section];
          if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
            query += ' AND difficulty = ?';
            params.push(difficulty.toLowerCase());
          }
          rawQuestions = await dbAdapter.queryAll(query, params);
          if (rawQuestions.length === 0 && difficulty) {
            rawQuestions = await dbAdapter.queryAll(
              'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points FROM questions WHERE section = ?',
              [possibleSec.section]
            );
          }
        } else {
          return res.status(404).json({ error: 'Topic not found' });
        }
      } else {
        let query = 'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points FROM questions WHERE topic_id = ? AND is_olympiad = 0';
        let params = [topicId];
        if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
          query += ' AND difficulty = ?';
          params.push(difficulty.toLowerCase());
        }
        rawQuestions = await dbAdapter.queryAll(query, params);
        if (rawQuestions.length === 0) {
          query = 'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points FROM questions WHERE topic_id = ?';
          params = [topicId];
          if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
            query += ' AND difficulty = ?';
            params.push(difficulty.toLowerCase());
          }
          rawQuestions = await dbAdapter.queryAll(query, params);
          if (rawQuestions.length === 0 && difficulty) {
            rawQuestions = await dbAdapter.queryAll(
              'SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points FROM questions WHERE topic_id = ?',
              [topicId]
            );
          }
        }
      }
    }

    if (rawQuestions.length === 0) {
      return res.status(404).json({ error: 'No questions available yet for this topic.' });
    }

    const formattedQuestions = shuffleArray(rawQuestions).map((q, idx) => {
      const parsedOptions = JSON.parse(q.options_json);
      const ansTrimmed = (q.correct_answer || '').trim().toLowerCase();
      let correctOptionIdx = parsedOptions.findIndex(
        opt => String(opt).trim().toLowerCase() === ansTrimmed
      );
      if (correctOptionIdx === -1) {
        // Fallback for image tags or partial matches
        correctOptionIdx = parsedOptions.findIndex(
          opt => ansTrimmed && (String(opt).toLowerCase().includes(ansTrimmed) || ansTrimmed.includes(String(opt).toLowerCase()))
        );
      }
      if (correctOptionIdx === -1) {
        const letters = ['a', 'b', 'c', 'd', 'e'];
        const lIdx = letters.indexOf(ansTrimmed);
        if (lIdx !== -1 && lIdx < parsedOptions.length) {
          correctOptionIdx = lIdx;
        } else {
          correctOptionIdx = 0;
        }
      }

      return {
        id: q.id,
        index: idx + 1,
        section: q.section,
        difficulty: q.difficulty,
        question_text: q.question_text,
        prompt: q.question_text,
        options: parsedOptions,
        correct_answer: q.correct_answer,
        correct_option: correctOptionIdx,
        hint: q.hint || 'Carefully recall the rules and examples discussed in the lesson.',
        explanation: q.explanation || `The correct answer is "${q.correct_answer}".`,
        points: q.points || 1
      };
    });

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
    let exam = await dbAdapter.queryOne('SELECT * FROM olympiad_exams WHERE id = ?', [olympiadId]);
    if (!exam) {
      // Try alias pattern, e.g. olympiad-math-class3 -> olympiad-c3-math, or vice-versa
      const m1 = olympiadId.match(/^olympiad-([a-z]+)-class(\d+)$/);
      const m2 = olympiadId.match(/^olympiad-c(\d+)-([a-z]+)$/);
      if (m1) {
        exam = await dbAdapter.queryOne('SELECT * FROM olympiad_exams WHERE id = ?', [`olympiad-c${m1[2]}-${m1[1]}`]);
      } else if (m2) {
        exam = await dbAdapter.queryOne('SELECT * FROM olympiad_exams WHERE id = ?', [`olympiad-${m2[2]}-class${m2[1]}`]);
      }
    }

    if (!exam) {
      return res.status(404).json({ error: 'Olympiad exam not found' });
    }

    // Commercial Enrolment Guard
    const courseId = `class-${exam.grade}`;
    if (req.user && req.user.is_admin !== 1 && req.user.is_admin !== true) {
      const enr = await dbAdapter.queryOne(
        "SELECT id FROM user_enrolments WHERE user_id = ? AND course_id = ? AND status = 'active'",
        [req.user.id, courseId]
      );
      if (!enr) {
        return res.status(403).json({
          error: 'enrolment_required',
          course_id: courseId,
          message: `Enrolment required to enter the Class ${exam.grade} Olympiad exam hall.`
        });
      }
    }

    let typeCode = 'imo';
    if (exam.id.toLowerCase().includes('mcq') || exam.code.toLowerCase().includes('mcq')) {
      typeCode = 'mcq';
    } else if (exam.code.toLowerCase().includes('ieo')) {
      typeCode = 'ieo';
    } else if (exam.code.toLowerCase().includes('apt') || exam.id.toLowerCase().includes('apt')) {
      typeCode = 'aptitude';
    }
    let rawQuestions = await dbAdapter.queryAll(
      `SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points
       FROM questions
       WHERE is_olympiad = 1 AND subject_id = ? AND olympiad_grade = ?
       ORDER BY id ASC`,
      [exam.subject_id, exam.grade]
    );

    if (rawQuestions.length === 0) {
      rawQuestions = await dbAdapter.queryAll(
        `SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, hint, explanation, points
         FROM questions
         WHERE is_olympiad = 1 AND olympiad_type = ? AND olympiad_grade = ?
         ORDER BY id ASC`,
        [typeCode, exam.grade]
      );
    }

    if (rawQuestions.length === 0) {
      return res.status(404).json({ error: `No questions are available yet for ${exam.title}.` });
    }

    // Target question count and official duration
    const targetCount = exam.total_questions || (exam.grade <= 4 ? 35 : 50);
    const durationMinutes = exam.duration_minutes || 60;
    const durationSeconds = durationMinutes * 60;

    // Intelligent Section Sampling:
    // Partition questions into Achievers (HOTS / hard) and Core (medium / easy)
    const achievers = rawQuestions.filter(q =>
      (q.section && q.section.toLowerCase().includes('achiever')) ||
      (q.difficulty && q.difficulty.toLowerCase() === 'hard')
    );
    const core = rawQuestions.filter(q => !achievers.includes(q));

    // National standard: 5 Achiever questions per Olympiad paper
    const targetAchieverCount = Math.min(5, achievers.length);
    const targetCoreCount = Math.min(targetCount - targetAchieverCount, core.length);

    const selectedAchievers = shuffleArray(achievers).slice(0, targetAchieverCount);
    const selectedCore = shuffleArray(core).slice(0, targetCoreCount);

    let assembled = [...selectedCore, ...selectedAchievers];
    // If pool is still short of targetCount, backfill from remaining
    if (assembled.length < targetCount && rawQuestions.length > assembled.length) {
      const remaining = rawQuestions.filter(q => !assembled.includes(q));
      assembled = assembled.concat(shuffleArray(remaining).slice(0, targetCount - assembled.length));
    }

    const achieverMarks = exam.grade <= 4 ? 2 : 3;
    let computedTotalMarks = 0;

    const questionsWithParsedOptions = assembled.map((q, index) => {
      const isAchiever = (q.section && q.section.toLowerCase().includes('achiever')) ||
                         (q.difficulty && q.difficulty.toLowerCase() === 'hard') ||
                         index >= (assembled.length - targetAchieverCount);
      const qPoints = isAchiever ? achieverMarks : 1;
      computedTotalMarks += qPoints;

      return {
        id: q.id,
        index: index + 1,
        section: isAchiever ? 'Achievers Section (HOTS)' : (q.section || 'Core Subject'),
        difficulty: q.difficulty || (isAchiever ? 'hard' : 'medium'),
        question_text: q.question_text,
        prompt: q.question_text,
        options: JSON.parse(q.options_json),
        correct_answer: q.correct_answer,
        explanation: q.explanation || '',
        hint: q.hint || q.explanation || '',
        points: qPoints
      };
    });

    res.json({
      type: 'olympiad',
      exam: {
        id: exam.id,
        code: exam.code,
        title: exam.title,
        grade: exam.grade,
        total_questions: questionsWithParsedOptions.length,
        duration_minutes: durationMinutes,
        duration_seconds: durationSeconds,
        total_marks: exam.total_marks || computedTotalMarks,
        description: exam.description,
        sections: JSON.parse(exam.sections_json || '[]')
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

      const isCorrect = studentChoiceText !== null && (
        studentChoiceText.trim().toLowerCase() === q.correct_answer.trim().toLowerCase() ||
        (q.correct_answer.length > 3 && studentChoiceText.toLowerCase().includes(q.correct_answer.toLowerCase())) ||
        (studentChoiceText.length > 3 && q.correct_answer.toLowerCase().includes(studentChoiceText.toLowerCase()))
      );
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

    const sectionBreakdown = {};
    for (const q of dbQuestions) {
      const sec = q.section || 'General';
      if (!sectionBreakdown[sec]) {
        sectionBreakdown[sec] = { total: 0, correct: 0, points_earned: 0, max_points: 0 };
      }
      const item = detailedReview.find(r => r.id === q.id);
      sectionBreakdown[sec].total += 1;
      const qPts = q.points || (q.section && q.section.includes('Achievers') ? 2 : 1);
      sectionBreakdown[sec].max_points += qPts;
      if (item && item.is_correct) {
        sectionBreakdown[sec].correct += 1;
        sectionBreakdown[sec].points_earned += qPts;
      }
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
      section_breakdown: sectionBreakdown,
      review: detailedReview
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: 'Failed to process quiz submission' });
  }
});

// 4. Get User's Recent Missed Questions for Targeted Review (Registration Required)
router.get('/mistakes/recent', requireRegisteredUser, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const attempts = await dbAdapter.queryAll(
      'SELECT id, quiz_title, created_at, answers_json FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    const mistakesMap = new Map();
    const chronologicalAttempts = [...attempts].reverse();
    for (const att of chronologicalAttempts) {
      try {
        const answers = JSON.parse(att.answers_json || '[]');
        for (const ans of answers) {
          if (!ans.id) continue;
          if (ans.is_correct) {
            mistakesMap.delete(ans.id); // Marked as resolved!
          } else if (!ans.is_skipped) {
            mistakesMap.set(ans.id, {
              ...ans,
              from_quiz: att.quiz_title,
              missed_at: att.created_at
            });
          }
        }
      } catch (e) {}
    }

    const mistakes = Array.from(mistakesMap.values());
    res.json({
      total_mistakes: mistakes.length,
      mistakes
    });
  } catch (err) {
    console.error('Fetch mistakes error:', err);
    res.status(500).json({ error: 'Failed to retrieve missed questions' });
  }
});

// 5. Generate an Instant Mistake Recovery Drill (Registration Required)
router.get('/mistakes/drill', requireRegisteredUser, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const attempts = await dbAdapter.queryAll(
      'SELECT id, quiz_title, created_at, answers_json FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    const mistakesMap = new Map();
    const chronologicalAttempts = [...attempts].reverse();
    for (const att of chronologicalAttempts) {
      try {
        const answers = JSON.parse(att.answers_json || '[]');
        for (const ans of answers) {
          if (!ans.id) continue;
          if (ans.is_correct) {
            mistakesMap.delete(ans.id);
          } else if (!ans.is_skipped) {
            mistakesMap.set(ans.id, ans);
          }
        }
      } catch (e) {}
    }

    const missedItems = Array.from(mistakesMap.values());
    if (missedItems.length === 0) {
      return res.status(404).json({ error: 'No unresolved mistakes found! You have 100% mastery on recent questions.' });
    }

    // Format into standard practice quiz
    const drillQuestions = missedItems.slice(0, 15).map((q, idx) => {
      const parsedOptions = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
      let correctOption = 0;
      if (q.correct_answer) {
        const ansStr = String(q.correct_answer).trim().toLowerCase();
        const fIdx = parsedOptions.findIndex(o => String(o).trim().toLowerCase() === ansStr);
        if (fIdx !== -1) correctOption = fIdx;
      }

      return {
        id: q.id,
        index: idx + 1,
        section: q.section || 'Mistake Recovery',
        difficulty: 'medium',
        question_text: q.question_text,
        prompt: q.question_text,
        options: parsedOptions,
        correct_answer: q.correct_answer,
        correct_option: correctOption,
        hint: q.hint || 'Review this concept carefully — this question was previously answered incorrectly.',
        explanation: q.explanation || `The correct answer is "${q.correct_answer}".`,
        points: 1
      };
    });

    res.json({
      type: 'practice',
      topic: {
        id: 'drill-mistakes',
        title: '🎯 Targeted Mistake Recovery Drill',
        icon: '🔁'
      },
      total_questions: drillQuestions.length,
      questions: drillQuestions
    });
  } catch (err) {
    console.error('Generate mistake drill error:', err);
    res.status(500).json({ error: 'Failed to generate mistake recovery drill' });
  }
});

// 4. Admin Question Bank Explorer (Admin Only)
router.get('/admin/questions', requireAdmin, async (req, res) => {
  try {
    const { grade, subject_id, search, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (grade && grade !== 'all') {
      conditions.push('olympiad_grade = ?');
      params.push(parseInt(grade, 10));
    }

    if (subject_id && subject_id !== 'all') {
      conditions.push('subject_id = ?');
      params.push(subject_id);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(question_text LIKE ? OR explanation LIKE ? OR id LIKE ?)');
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await dbAdapter.queryOne(
      `SELECT COUNT(id) as total FROM questions ${whereClause}`,
      params
    );
    const total = countRow ? countRow.total : 0;

    const questions = await dbAdapter.queryAll(
      `SELECT id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, explanation, points, is_olympiad, olympiad_grade
       FROM questions
       ${whereClause}
       ORDER BY olympiad_grade ASC, subject_id ASC, id ASC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const parsedQuestions = questions.map(q => {
      let options = [];
      try {
        options = JSON.parse(q.options_json);
      } catch (e) {
        options = [];
      }
      return {
        id: q.id,
        topic_id: q.topic_id,
        subject_id: q.subject_id,
        grade: q.olympiad_grade,
        section: q.section,
        difficulty: q.difficulty,
        question_text: q.question_text,
        options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        points: q.points
      };
    });

    // Summary stats
    const totalDb = await dbAdapter.queryOne('SELECT COUNT(id) as c FROM questions');
    const totalMaster = await dbAdapter.queryOne("SELECT COUNT(id) as c FROM questions WHERE id LIKE 'q-master-%'");
    const gradesSummary = await dbAdapter.queryAll(
      'SELECT olympiad_grade as grade, COUNT(id) as count FROM questions GROUP BY olympiad_grade ORDER BY olympiad_grade'
    );
    const subjectsSummary = await dbAdapter.queryAll(
      'SELECT subject_id, COUNT(id) as count FROM questions GROUP BY subject_id ORDER BY subject_id'
    );

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats: {
        total_in_db: totalDb ? totalDb.c : 0,
        total_master_excel: totalMaster ? totalMaster.c : 0,
        grades: gradesSummary,
        subjects: subjectsSummary
      },
      questions: parsedQuestions
    });
  } catch (err) {
    console.error('Admin questions fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve questions from question bank' });
  }
});

module.exports = router;
