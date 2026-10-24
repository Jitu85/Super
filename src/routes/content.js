const express = require('express');
const { dbAdapter } = require('../db/database');

const router = express.Router();

// Get All Subjects for Class III
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await dbAdapter.queryAll('SELECT * FROM subjects WHERE grade = 3 ORDER BY name ASC');
    
    // Enrich with topic and question counts concurrently
    const enriched = await Promise.all(subjects.map(async sub => {
      const topicCount = await dbAdapter.queryOne(
        'SELECT COUNT(*) as count FROM topics WHERE subject_id = ?',
        [sub.id]
      );
      const questionCount = await dbAdapter.queryOne(
        'SELECT COUNT(*) as count FROM questions WHERE subject_id = ? AND is_olympiad = 0',
        [sub.id]
      );
      return {
        ...sub,
        topic_count: topicCount ? parseInt(topicCount.count, 10) : 0,
        question_count: questionCount ? parseInt(questionCount.count, 10) : 0
      };
    }));

    res.json({ subjects: enriched });
  } catch (err) {
    console.error('Fetch subjects error:', err);
    res.status(500).json({ error: 'Failed to load subjects' });
  }
});

// Get Topics for a Subject
router.get('/topics/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await dbAdapter.queryOne('SELECT * FROM subjects WHERE id = ?', [subjectId]);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const topics = await dbAdapter.queryAll(
      'SELECT * FROM topics WHERE subject_id = ? ORDER BY order_num ASC',
      [subjectId]
    );

    const enrichedTopics = await Promise.all(topics.map(async topic => {
      const qCount = await dbAdapter.queryOne(
        'SELECT COUNT(*) as count FROM questions WHERE topic_id = ? AND is_olympiad = 0',
        [topic.id]
      );
      const lesson = await dbAdapter.queryOne(
        'SELECT id, title FROM lessons WHERE topic_id = ?',
        [topic.id]
      );

      return {
        ...topic,
        key_rules: topic.key_rules ? JSON.parse(topic.key_rules) : [],
        question_count: qCount ? parseInt(qCount.count, 10) : 0,
        has_lesson: !!lesson,
        lesson_id: lesson ? lesson.id : null
      };
    }));

    res.json({
      subject,
      topics: enrichedTopics
    });
  } catch (err) {
    console.error('Fetch topics error:', err);
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

// Get Lesson Details for a Topic
router.get('/lesson/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await dbAdapter.queryOne('SELECT * FROM topics WHERE id = ?', [topicId]);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const lesson = await dbAdapter.queryOne('SELECT * FROM lessons WHERE topic_id = ?', [topicId]);
    const subject = await dbAdapter.queryOne('SELECT id, name, icon, color FROM subjects WHERE id = ?', [topic.subject_id]);

    res.json({
      topic: {
        ...topic,
        key_rules: topic.key_rules ? JSON.parse(topic.key_rules) : []
      },
      subject,
      lesson: lesson ? {
        ...lesson,
        examples: lesson.examples_json ? JSON.parse(lesson.examples_json) : []
      } : null
    });
  } catch (err) {
    console.error('Fetch lesson error:', err);
    res.status(500).json({ error: 'Failed to load lesson' });
  }
});

// Get Olympiad Exam list
router.get('/olympiads', async (req, res) => {
  try {
    const exams = await dbAdapter.queryAll('SELECT * FROM olympiad_exams WHERE grade = 3');
    const enriched = await Promise.all(exams.map(async exam => {
      const subject = await dbAdapter.queryOne('SELECT name, icon, color FROM subjects WHERE id = ?', [exam.subject_id]);
      return {
        ...exam,
        subject,
        sections: exam.sections_json ? JSON.parse(exam.sections_json) : []
      };
    }));

    res.json({ olympiads: enriched });
  } catch (err) {
    console.error('Fetch olympiads error:', err);
    res.status(500).json({ error: 'Failed to load Olympiad exams' });
  }
});

module.exports = router;
