const fs = require('fs');
const path = require('path');
const { dbAdapter, initSchema } = require('../src/db/database');

// Ensure subjects exist for Class 3 to 10
const ALL_SUBJECTS = [];
for (let g = 3; g <= 10; g++) {
  ALL_SUBJECTS.push({
    id: `math-class${g}`,
    slug: g === 3 ? 'mathematics' : `mathematics-class${g}`,
    name: g === 3 ? 'Mathematics' : `Class ${g} Mathematics`,
    icon: '📐',
    color: '#2563EB',
    description: `CBSE & Olympiad Mathematics curriculum for Class ${g}.`,
    grade: g
  });
  ALL_SUBJECTS.push({
    id: `science-class${g}`,
    slug: `science-class${g}`,
    name: g === 3 ? 'Science' : `Class ${g} Science`,
    icon: '🔬',
    color: '#10B981',
    description: `CBSE & Olympiad Science curriculum for Class ${g}.`,
    grade: g
  });
  ALL_SUBJECTS.push({
    id: `english-class${g}`,
    slug: g === 3 ? 'english' : `english-class${g}`,
    name: g === 3 ? 'English' : `Class ${g} English`,
    icon: '📖',
    color: '#8B5CF6',
    description: `CBSE & Olympiad English curriculum for Class ${g}.`,
    grade: g
  });
}
ALL_SUBJECTS.push({
  id: 'aptitude-class3',
  slug: 'aptitude-class3',
  name: 'Aptitude & Reasoning',
  icon: '🧩',
  color: '#D97706',
  description: 'Aptitude, mental ability, and logical reasoning for Class 3.',
  grade: 3
});

async function importMasterQuestions(options = {}) {
  const jsonPath = path.join(__dirname, '..', 'data', 'master_questions.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Master questions JSON file not found at ${jsonPath}`);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const questions = JSON.parse(rawData);
  console.log(`🚀 Starting database import of ${questions.length} Master questions...`);

  // 1. Seed or Update all Subjects
  for (const sub of ALL_SUBJECTS) {
    const existing = await dbAdapter.queryOne('SELECT id FROM subjects WHERE id = ?', [sub.id]);
    if (!existing) {
      await dbAdapter.execute(
        `INSERT INTO subjects (id, slug, name, icon, color, description, grade)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sub.id, sub.slug, sub.name, sub.icon, sub.color, sub.description, sub.grade]
      );
    } else {
      await dbAdapter.execute(
        `UPDATE subjects SET name = ?, slug = ?, icon = ?, color = ?, description = ? WHERE id = ?`,
        [sub.name, sub.slug, sub.icon, sub.color, sub.description, sub.id]
      );
    }
  }

  // 2. Insert or Update all 1,421 Questions
  let inserted = 0;
  let updated = 0;

  // Use transaction if supported by dbAdapter
  const hasTransaction = typeof dbAdapter.runInTransaction === 'function';

  const processBatch = async () => {
    for (const q of questions) {
      const typeCode = q.subject_slug === 'aptitude' ? 'aptitude' : (q.subject_slug === 'math' ? 'imo' : (q.subject_slug === 'english' ? 'ieo' : 'nso'));
      const optionsJson = JSON.stringify(q.options);

      const exists = await dbAdapter.queryOne('SELECT id FROM questions WHERE id = ?', [q.id]);
      if (exists) {
        await dbAdapter.execute(
          `UPDATE questions 
           SET subject_id = ?, section = ?, difficulty = ?, question_text = ?, options_json = ?, correct_answer = ?, explanation = ?, hint = ?, points = ?, is_olympiad = ?, olympiad_type = ?, olympiad_grade = ?
           WHERE id = ?`,
          [
            q.subject_id,
            q.topic || 'General',
            q.grade >= 7 ? 'hard' : 'medium',
            q.question_text,
            optionsJson,
            q.correct_answer,
            q.explanation,
            q.explanation,
            1,
            1,
            typeCode,
            q.grade,
            q.id
          ]
        );
        updated++;
      } else {
        await dbAdapter.execute(
          `INSERT INTO questions (id, topic_id, subject_id, section, difficulty, question_text, options_json, correct_answer, explanation, hint, points, is_olympiad, olympiad_type, olympiad_grade)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            q.id,
            null,
            q.subject_id,
            q.topic || 'General',
            q.grade >= 7 ? 'hard' : 'medium',
            q.question_text,
            optionsJson,
            q.correct_answer,
            q.explanation,
            q.explanation,
            1,
            1,
            typeCode,
            q.grade
          ]
        );
        inserted++;
      }
    }
  };

  if (hasTransaction) {
    await dbAdapter.runInTransaction(processBatch);
  } else {
    await processBatch();
  }

  console.log(`✅ Questions imported: ${inserted} newly inserted, ${updated} updated (Total: ${questions.length})`);

  // 3. Register Olympiad Exams in olympiad_exams table for every grade and subject
  // Group questions by grade and subject
  const gradeSubjCounts = {};
  for (const q of questions) {
    const key = `${q.grade}__${q.subject_id}__${q.subject_name}`;
    gradeSubjCounts[key] = (gradeSubjCounts[key] || 0) + 1;
  }

  for (const [key, count] of Object.entries(gradeSubjCounts)) {
    const [gradeStr, subjectId, subjectName] = key.split('__');
    const grade = parseInt(gradeStr, 10);
    const subClean = subjectId.replace(`-class${grade}`, '');
    const examId = `olympiad-c${grade}-${subClean}`;
    const aliasExamId = `olympiad-${subClean}-class${grade}`;

    // Official SOF / CBSE National Olympiad Pattern:
    // Class 3 & 4: 35 Questions | 60 Minutes | 40 Marks
    // Class 5 to 10: 50 Questions | 60 Minutes | 60 Marks (or full pool if pool < 50)
    let standardQCount = grade <= 4 ? 35 : 50;
    let durationMinutes = 60;
    let totalMarks = grade <= 4 ? 40 : 60;
    let sectionsJson = '';

    if (grade <= 4) {
      standardQCount = Math.min(35, count);
      durationMinutes = 60;
      totalMarks = 40;
      sectionsJson = JSON.stringify([
        { name: 'Logical Reasoning', count: 10, marksPerQuestion: 1 },
        { name: `${subjectName} Core`, count: 20, marksPerQuestion: 1 },
        { name: 'Achievers Section (HOTS)', count: 5, marksPerQuestion: 2 }
      ]);
    } else {
      if (count >= 50) {
        standardQCount = 50;
        durationMinutes = 60;
        totalMarks = 60;
        sectionsJson = JSON.stringify([
          { name: 'Logical Reasoning', count: 15, marksPerQuestion: 1 },
          { name: `${subjectName} Core`, count: 30, marksPerQuestion: 1 },
          { name: 'Achievers Section (HOTS)', count: 5, marksPerQuestion: 3 }
        ]);
      } else {
        standardQCount = count;
        durationMinutes = count >= 40 ? 50 : 40;
        totalMarks = (count - 5) * 1 + 5 * 3;
        sectionsJson = JSON.stringify([
          { name: `${subjectName} Core`, count: count - 5, marksPerQuestion: 1 },
          { name: 'Achievers Section (HOTS)', count: 5, marksPerQuestion: 3 }
        ]);
      }
    }

    const typeAcronym = subClean === 'math' ? 'IMO' : (subClean === 'science' ? 'NSO' : (subClean === 'english' ? 'IEO' : 'APT'));
    const code = `${typeAcronym}-C${grade}-2026`;
    const title = `Class ${grade} ${subjectName} Olympiad (${typeAcronym} Mock)`;
    const desc = `Official standardized ${typeAcronym} Olympiad Mock for Class ${grade} ${subjectName}. Disciplined ${durationMinutes}-minute exam structured with Core Subject & Achievers Section (HOTS).`;

    // Upsert primary exam record
    for (const targetId of [examId, aliasExamId]) {
      const existingExam = await dbAdapter.queryOne('SELECT id FROM olympiad_exams WHERE id = ?', [targetId]);
      if (!existingExam) {
        await dbAdapter.execute(
          `INSERT INTO olympiad_exams (id, code, title, subject_id, grade, total_questions, duration_minutes, total_marks, description, sections_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            targetId,
            code,
            title,
            subjectId,
            grade,
            standardQCount,
            durationMinutes,
            totalMarks,
            desc,
            sectionsJson
          ]
        );
      } else {
        await dbAdapter.execute(
          `UPDATE olympiad_exams
           SET title = ?, total_questions = ?, duration_minutes = ?, total_marks = ?, description = ?, sections_json = ?, grade = ?, subject_id = ?
           WHERE id = ?`,
          [
            title,
            standardQCount,
            durationMinutes,
            totalMarks,
            desc,
            sectionsJson,
            grade,
            subjectId,
            targetId
          ]
        );
      }
    }
  }

  console.log(`✅ Olympiad exams generated for all Class 3 to 10 subject combinations!`);
  return { questionsCount: questions.length, inserted, updated };
}

// Allow direct execution: node scripts/importExcelToDb.js
if (require.main === module) {
  (async () => {
    try {
      await initSchema();
      await importMasterQuestions();
      console.log('🎉 Master questions database import completed successfully!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Import failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = { importMasterQuestions };
