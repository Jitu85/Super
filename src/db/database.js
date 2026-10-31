const path = require('path');
const fs = require('fs');

let pgPool = null;
let sqliteDb = null;
let isPg = false;

// Determine database engine based on DATABASE_URL
if (process.env.DATABASE_URL) {
  try {
    const { Pool } = require('pg');
    // Ensure SSL is configured properly for cloud PostgreSQL (Render, Neon, Supabase)
    const isLocalhost = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocalhost ? false : { rejectUnauthorized: false }
    });
    isPg = true;
    console.log('✅ PostgreSQL Database connection pool initialized (DATABASE_URL provided)');
  } catch (err) {
    console.error('⚠️ Failed to initialize PostgreSQL pool, falling back to local SQLite:', err.message);
    isPg = false;
  }
}

// Fallback to local SQLite if PostgreSQL is not active
if (!isPg) {
  const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'talenthunt.db');

  try {
    const { DatabaseSync } = require('node:sqlite');
    sqliteDb = new DatabaseSync(DB_PATH);
    console.log('✅ SQLite Database connected successfully (node:sqlite):', DB_PATH);
  } catch (err) {
    console.warn('⚠️ Native node:sqlite failed or not available:', err.message);
  }
}

// Helper to convert SQLite '?' parameter placeholders to PostgreSQL '$1, $2, ...'
function formatSql(sql) {
  if (!isPg) return sql;
  let paramIdx = 1;
  return sql.replace(/\?/g, () => `$${paramIdx++}`);
}

// Universal Async Database Adapter supporting both SQLite and PostgreSQL
const dbAdapter = {
  isPg() {
    return isPg;
  },

  async queryAll(sql, params = []) {
    if (isPg) {
      try {
        const res = await pgPool.query(formatSql(sql), params);
        return res.rows;
      } catch (err) {
        console.error('PostgreSQL Error in queryAll:', sql, err);
        throw err;
      }
    } else {
      if (!sqliteDb) return [];
      try {
        const stmt = sqliteDb.prepare(sql);
        return stmt.all(...params);
      } catch (err) {
        console.error('SQLite Error in queryAll:', sql, err);
        throw err;
      }
    }
  },

  async queryOne(sql, params = []) {
    if (isPg) {
      try {
        const res = await pgPool.query(formatSql(sql), params);
        return res.rows[0] || null;
      } catch (err) {
        console.error('PostgreSQL Error in queryOne:', sql, err);
        throw err;
      }
    } else {
      if (!sqliteDb) return null;
      try {
        const stmt = sqliteDb.prepare(sql);
        return stmt.get(...params) || null;
      } catch (err) {
        console.error('SQLite Error in queryOne:', sql, err);
        throw err;
      }
    }
  },

  async execute(sql, params = []) {
    if (isPg) {
      try {
        let pgSql = formatSql(sql);
        const trimmed = pgSql.trim().toUpperCase();
        // If an INSERT statement does not have RETURNING, automatically append RETURNING id
        const isInsert = trimmed.startsWith('INSERT INTO');
        if (isInsert && !trimmed.includes('RETURNING')) {
          pgSql += ' RETURNING id';
        }

        const res = await pgPool.query(pgSql, params);
        const insertedId = res.rows && res.rows[0] ? res.rows[0].id : 0;
        return {
          changes: res.rowCount || 0,
          lastInsertRowid: insertedId
        };
      } catch (err) {
        console.error('PostgreSQL Error in execute:', sql, err);
        throw err;
      }
    } else {
      if (!sqliteDb) return { changes: 0, lastInsertRowid: 0 };
      try {
        const stmt = sqliteDb.prepare(sql);
        const res = stmt.run(...params);
        return {
          changes: res.changes || 0,
          lastInsertRowid: res.lastInsertRowid || 0
        };
      } catch (err) {
        console.error('SQLite Error in execute:', sql, err);
        throw err;
      }
    }
  }
};

async function initSchema() {
  if (isPg) {
    // PostgreSQL DDL Schema
    console.log('🔄 Initializing PostgreSQL Schema...');
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        user_type TEXT DEFAULT 'student',
        first_name TEXT,
        middle_name TEXT,
        last_name TEXT,
        school_name TEXT,
        class_division TEXT,
        parent_relation TEXT,
        parent_name TEXT,
        parent_phone TEXT,
        country TEXT,
        state TEXT,
        pin TEXT,
        address_details TEXT,
        qualification TEXT,
        security_city TEXT,
        security_pet TEXT,
        is_admin INTEGER DEFAULT 0
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
        subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        order_num INTEGER DEFAULT 1,
        icon TEXT NOT NULL,
        summary TEXT NOT NULL,
        key_rules TEXT
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        overview TEXT NOT NULL,
        concept_html TEXT NOT NULL,
        fun_fact TEXT,
        examples_json TEXT
      );

      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
        subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
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
        olympiad_grade INTEGER DEFAULT 3
      );

      CREATE TABLE IF NOT EXISTS olympiad_exams (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        grade INTEGER DEFAULT 3,
        total_questions INTEGER DEFAULT 15,
        duration_minutes INTEGER DEFAULT 15,
        total_marks INTEGER DEFAULT 20,
        description TEXT NOT NULL,
        sections_json TEXT NOT NULL
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

      CREATE TABLE IF NOT EXISTS user_badges (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        badge_id TEXT NOT NULL,
        badge_title TEXT NOT NULL,
        badge_icon TEXT NOT NULL,
        badge_desc TEXT,
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS community_doubts (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        author_name TEXT NOT NULL,
        author_avatar TEXT DEFAULT 'lion',
        grade INTEGER DEFAULT 3,
        subject TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        is_resolved INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS community_replies (
        id TEXT PRIMARY KEY,
        doubt_id TEXT NOT NULL REFERENCES community_doubts(id) ON DELETE CASCADE,
        user_id TEXT,
        author_name TEXT NOT NULL,
        author_avatar TEXT DEFAULT 'lion',
        body TEXT NOT NULL,
        is_expert INTEGER DEFAULT 0,
        upvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Safe column additions for PostgreSQL
      ALTER TABLE users ADD COLUMN IF NOT EXISTS target_olympiad TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_subjects TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_goal_minutes INTEGER DEFAULT 30;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS school_board TEXT DEFAULT 'CBSE';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_strengths TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_weaknesses TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_last_date TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_notification_enabled INTEGER DEFAULT 1;

      ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS integrity_score INTEGER DEFAULT 100;
      ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS tab_switches INTEGER DEFAULT 0;
      ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS telemetry_json TEXT;

      ALTER TABLE questions ADD COLUMN IF NOT EXISTS olympiad_grade INTEGER DEFAULT 3;
    `);
  } else if (sqliteDb) {
    // SQLite DDL Schema
    sqliteDb.exec(`
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
        olympiad_grade INTEGER DEFAULT 3,
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

      CREATE TABLE IF NOT EXISTS user_badges (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        badge_id TEXT NOT NULL,
        badge_title TEXT NOT NULL,
        badge_icon TEXT NOT NULL,
        badge_desc TEXT,
        earned_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS community_doubts (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        author_name TEXT NOT NULL,
        author_avatar TEXT DEFAULT 'lion',
        grade INTEGER DEFAULT 3,
        subject TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        is_resolved INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS community_replies (
        id TEXT PRIMARY KEY,
        doubt_id TEXT NOT NULL,
        user_id TEXT,
        author_name TEXT NOT NULL,
        author_avatar TEXT DEFAULT 'lion',
        body TEXT NOT NULL,
        is_expert INTEGER DEFAULT 0,
        upvotes INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (doubt_id) REFERENCES community_doubts(id)
      );
    `);

    // Column migrations for SQLite
    const extraCols = [
      "user_type TEXT DEFAULT 'student'",
      "first_name TEXT",
      "middle_name TEXT",
      "last_name TEXT",
      "school_name TEXT",
      "class_division TEXT",
      "parent_relation TEXT",
      "parent_name TEXT",
      "parent_phone TEXT",
      "country TEXT",
      "state TEXT",
      "pin TEXT",
      "address_details TEXT",
      "qualification TEXT",
      "security_city TEXT",
      "security_pet TEXT",
      "is_admin INTEGER DEFAULT 0",
      "target_olympiad TEXT",
      "preferred_subjects TEXT",
      "daily_goal_minutes INTEGER DEFAULT 30",
      "school_board TEXT DEFAULT 'CBSE'",
      "academic_strengths TEXT",
      "academic_weaknesses TEXT",
      "streak_last_date TEXT",
      "parent_notification_enabled INTEGER DEFAULT 1"
    ];

    for (const col of extraCols) {
      try {
        sqliteDb.exec(`ALTER TABLE users ADD COLUMN ${col};`);
      } catch (err) {
        // Silently ignore "duplicate column" errors; log any other unexpected errors
        if (!err.message || !err.message.includes('duplicate column name')) {
          console.warn(`[SQLite Migration] Unexpected error adding column "${col}":`, err.message);
        }
      }
    }

    const quizAttemptCols = [
      "integrity_score INTEGER DEFAULT 100",
      "tab_switches INTEGER DEFAULT 0",
      "telemetry_json TEXT"
    ];

    for (const col of quizAttemptCols) {
      try {
        sqliteDb.exec(`ALTER TABLE quiz_attempts ADD COLUMN ${col};`);
      } catch (err) {
        if (!err.message || !err.message.includes('duplicate column name')) {
          console.warn(`[SQLite Migration] Unexpected error adding column "${col}":`, err.message);
        }
      }
    }

    const questionCols = [
      "olympiad_grade INTEGER DEFAULT 3"
    ];

    for (const col of questionCols) {
      try {
        sqliteDb.exec(`ALTER TABLE questions ADD COLUMN ${col};`);
      } catch (err) {
        if (!err.message || !err.message.includes('duplicate column name')) {
          console.warn(`[SQLite Migration] Unexpected error adding column "${col}":`, err.message);
        }
      }
    }
  }

  // Seed initial admin account if absent (works for both PostgreSQL and SQLite)
  try {
    const adminExists = await dbAdapter.queryOne(
      'SELECT id FROM users WHERE username = ? OR is_admin = 1',
      ['admin']
    );

    if (!adminExists) {
      const isProduction = process.env.NODE_ENV === 'production';
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminEmail = process.env.ADMIN_EMAIL || 'abhijit.jitu4u@gmail.com';

      if (!adminPassword || typeof adminPassword !== 'string' || adminPassword.trim().length === 0) {
        if (isProduction) {
          throw new Error(
            'CRITICAL SECURITY CONFIGURATION ERROR: No administrator account exists in the database and ' +
            'ADMIN_PASSWORD environment variable is not configured. ' +
            'Refusing to initialize administrator with a predictable fallback in production. ' +
            'Please set a strong ADMIN_PASSWORD in environment settings before first deployment.'
          );
        } else {
          console.warn(
            '⚠️ [DEVELOPMENT ONLY] No administrator account found in database and ADMIN_PASSWORD is unset. ' +
            'Skipping automatic admin provisioning. Set ADMIN_PASSWORD in your local .env to initialize an administrator.'
          );
        }
      } else {
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash(adminPassword.trim(), 10);
        await dbAdapter.execute(
          `INSERT INTO users (username, email, password_hash, display_name, avatar, is_admin, user_type)
           VALUES (?, ?, ?, ?, ?, 1, 'admin')`,
          ['admin', adminEmail.trim(), hash, 'Abhijit Kumar Misra (Admin)', 'lion']
        );
        console.log('✅ Initial administrator account provisioned successfully.');
      }
    }
  } catch (adminErr) {
    if (process.env.NODE_ENV === 'production' && !adminErr.message.includes('unique')) {
      throw adminErr;
    }
    console.warn('Admin initialization notice:', adminErr.message);
  }
}

module.exports = {
  dbAdapter,
  initSchema
};
