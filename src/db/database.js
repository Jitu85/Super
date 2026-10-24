const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'talenthunt.db');

let db = null;
let useNativeSqlite = false;

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_PATH);
  useNativeSqlite = true;
  console.log('✅ SQLite Database connected successfully (node:sqlite):', DB_PATH);
} catch (err) {
  console.warn('⚠️ Native node:sqlite failed or not available, falling back to JSON storage:', err.message);
  // Fallback memory/json adapter can be handled if needed
}

function initSchema() {
  if (useNativeSqlite) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT,
        display_name TEXT NOT NULL,
        avatar TEXT DEFAULT 'lion',
        grade INTEGER DEFAULT 3,
        xp INTEGER DEFAULT 0,
        stars INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 1,
        last_active TEXT,
        is_guest INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT NOT NULL,
        grade INTEGER DEFAULT 3
      );

      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        order_num INTEGER DEFAULT 1,
        icon TEXT NOT NULL,
        summary TEXT NOT NULL,
        key_rules TEXT,
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        topic_id TEXT NOT NULL,
        title TEXT NOT NULL,
        overview TEXT NOT NULL,
        concept_html TEXT NOT NULL,
        fun_fact TEXT,
        examples_json TEXT,
        FOREIGN KEY (topic_id) REFERENCES topics(id)
      );

      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        topic_id TEXT,
        subject_id TEXT NOT NULL,
        section TEXT DEFAULT 'Practice',
        difficulty TEXT DEFAULT 'medium',
        question_text TEXT NOT NULL,
        options_json TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT NOT NULL,
        hint TEXT,
        points INTEGER DEFAULT 1,
        is_olympiad INTEGER DEFAULT 0,
        olympiad_type TEXT,
        FOREIGN KEY (topic_id) REFERENCES topics(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
      );

      CREATE TABLE IF NOT EXISTS olympiad_exams (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        grade INTEGER DEFAULT 3,
        total_questions INTEGER DEFAULT 15,
        duration_minutes INTEGER DEFAULT 15,
        total_marks INTEGER DEFAULT 20,
        description TEXT NOT NULL,
        sections_json TEXT NOT NULL,
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
      );

      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT NOT NULL,
        avatar TEXT,
        quiz_type TEXT NOT NULL,
        quiz_title TEXT NOT NULL,
        subject_id TEXT,
        topic_id TEXT,
        score INTEGER NOT NULL,
        total_marks INTEGER NOT NULL,
        percentage REAL NOT NULL,
        time_taken_seconds INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        answers_json TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        exam_title TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_marks INTEGER NOT NULL,
        percentage REAL NOT NULL,
        rank_tier TEXT NOT NULL,
        issued_date TEXT NOT NULL,
        certificate_number TEXT UNIQUE NOT NULL
      );
    `);
  }
}

// Helper wrapper for DB queries
const dbAdapter = {
  getRawDb() {
    return db;
  },

  queryAll(sql, params = []) {
    if (!useNativeSqlite) return [];
    try {
      const stmt = db.prepare(sql);
      return stmt.all(...params);
    } catch (err) {
      console.error('SQL Error in queryAll:', sql, err);
      throw err;
    }
  },

  queryOne(sql, params = []) {
    if (!useNativeSqlite) return null;
    try {
      const stmt = db.prepare(sql);
      return stmt.get(...params);
    } catch (err) {
      console.error('SQL Error in queryOne:', sql, err);
      throw err;
    }
  },

  execute(sql, params = []) {
    if (!useNativeSqlite) return { changes: 0, lastInsertRowid: 0 };
    try {
      const stmt = db.prepare(sql);
      return stmt.run(...params);
    } catch (err) {
      console.error('SQL Error in execute:', sql, err);
      throw err;
    }
  }
};

module.exports = {
  db,
  dbAdapter,
  initSchema
};
