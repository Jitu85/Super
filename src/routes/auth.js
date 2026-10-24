const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbAdapter } = require('../db/database');
const { JWT_SECRET, requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 1. Instant Guest Initialization
router.post('/guest', (req, res) => {
  try {
    const { display_name, avatar } = req.body;
    const name = (display_name && display_name.trim()) || 'Champion Learner';
    const chosenAvatar = avatar || 'lion';
    const guestUsername = 'guest_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const result = dbAdapter.execute(
      `INSERT INTO users (username, display_name, avatar, grade, xp, stars, streak_days, is_guest)
       VALUES (?, ?, ?, 3, 50, 5, 1, 1)`,
      [guestUsername, name, chosenAvatar]
    );

    const userId = result.lastInsertRowid;
    const user = dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [userId]);

    const token = jwt.sign(
      { id: user.id, username: user.username, is_guest: 1 },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Guest session initialized',
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        grade: user.grade,
        xp: user.xp,
        stars: user.stars,
        streak_days: user.streak_days,
        is_guest: true
      }
    });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ error: 'Failed to create guest session' });
  }
});

// 2. Student / Parent Registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, display_name, email, avatar, grade } = req.body;

    if (!username || !password || !display_name) {
      return res.status(400).json({ error: 'Please provide username, password, and student name.' });
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }

    // Check if username already exists
    const existing = dbAdapter.queryOne('SELECT id FROM users WHERE username = ?', [trimmedUsername]);
    if (existing) {
      return res.status(400).json({ error: 'Username is already taken. Please choose another one!' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const chosenAvatar = avatar || 'lion';
    const chosenGrade = parseInt(grade, 10) || 3;

    const result = dbAdapter.execute(
      `INSERT INTO users (username, email, password_hash, display_name, avatar, grade, xp, stars, streak_days, is_guest)
       VALUES (?, ?, ?, ?, ?, ?, 100, 10, 1, 0)`,
      [trimmedUsername, email || null, passwordHash, display_name.trim(), chosenAvatar, chosenGrade]
    );

    const user = dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);

    const token = jwt.sign(
      { id: user.id, username: user.username, is_guest: 0 },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Account created successfully! Welcome to TalentHunt!',
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        grade: user.grade,
        xp: user.xp,
        stars: user.stars,
        streak_days: user.streak_days,
        is_guest: false
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register account' });
  }
});

// 3. Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter both username and password.' });
    }

    const user = dbAdapter.queryOne(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username.trim().toLowerCase(), username.trim().toLowerCase()]
    );

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_guest: user.is_guest === 1 },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: `Welcome back, ${user.display_name}!`,
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        grade: user.grade,
        xp: user.xp,
        stars: user.stars,
        streak_days: user.streak_days,
        is_guest: user.is_guest === 1
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// 4. Current User Info
router.get('/me', optionalAuth, (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }

  const user = dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.json({ user: null });
  }

  const attemptsCount = dbAdapter.queryOne(
    'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?',
    [user.id.toString()]
  );

  res.json({
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar: user.avatar,
      grade: user.grade,
      xp: user.xp,
      stars: user.stars,
      streak_days: user.streak_days,
      is_guest: user.is_guest === 1,
      total_quizzes_taken: attemptsCount ? attemptsCount.count : 0
    }
  });
});

// 5. Update Profile (Avatar & Name)
router.patch('/profile', requireAuth, (req, res) => {
  try {
    const { display_name, avatar, grade } = req.body;
    const user = dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedName = display_name ? display_name.trim() : user.display_name;
    const updatedAvatar = avatar || user.avatar;
    const updatedGrade = grade ? parseInt(grade, 10) : user.grade;

    dbAdapter.execute(
      'UPDATE users SET display_name = ?, avatar = ?, grade = ? WHERE id = ?',
      [updatedName, updatedAvatar, updatedGrade, user.id]
    );

    res.json({
      message: 'Profile updated!',
      user: {
        id: user.id,
        display_name: updatedName,
        avatar: updatedAvatar,
        grade: updatedGrade,
        xp: user.xp,
        stars: user.stars
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
