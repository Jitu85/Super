const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbAdapter } = require('../db/database');
const { JWT_SECRET, requireAuth, optionalAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 1. Instant Guest Initialization
router.post('/guest', (req, res) => {
  try {
    const { display_name, avatar } = req.body;
    const name = (display_name && display_name.trim()) || 'Champion Learner';
    const chosenAvatar = avatar || 'lion';
    const guestUsername = 'guest_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const result = dbAdapter.execute(
      `INSERT INTO users (username, display_name, avatar, grade, xp, stars, streak_days, is_guest, user_type)
       VALUES (?, ?, ?, 3, 50, 5, 1, 1, 'guest')`,
      [guestUsername, name, chosenAvatar]
    );

    const userId = result.lastInsertRowid;
    const user = dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [userId]);

    const token = jwt.sign(
      { id: user.id, username: user.username, is_guest: 1, is_admin: 0 },
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
        is_guest: true,
        user_type: 'guest'
      }
    });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ error: 'Failed to create guest session' });
  }
});

// 2. Full Dedicated Registration (Students & Other)
router.post('/register', async (req, res) => {
  try {
    const {
      user_type,
      first_name,
      middle_name,
      last_name,
      email,
      class_division,
      school_name,
      parent_relation,
      parent_name,
      parent_phone,
      country,
      state,
      pin,
      address_details,
      username,
      password,
      security_city,
      security_pet,
      qualification,
      avatar
    } = req.body;

    const type = (user_type === 'other') ? 'other' : 'student';

    // Validate User ID
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      return res.status(400).json({ error: 'User ID must be alphanumeric, all small caps with no special characters (e.g., abhijit85).' });
    }

    // Check unique username
    const existingUser = dbAdapter.queryOne('SELECT id FROM users WHERE username = ?', [cleanUsername]);
    if (existingUser) {
      return res.status(400).json({ error: 'This User ID is already taken. Please choose another one.' });
    }

    // Validate Email
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email ID cannot be left blank. A verification PIN will be sent to the email." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existingEmail = dbAdapter.queryOne('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existingEmail) {
      return res.status(400).json({ error: 'This Email is already registered. Please login or use Password Recovery.' });
    }

    // Validate Password
    // Condition: 8 characters, alphanumeric, with at least one special char (*, @, #) and at least one capital letter
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    const hasCapital = /[A-Z]/.test(password);
    const hasSpecial = /[*@#]/.test(password);
    const hasAlphaNum = /[0-9]/.test(password) && /[a-z]/i.test(password);

    if (!hasCapital || !hasSpecial || !hasAlphaNum) {
      return res.status(400).json({
        error: 'Password must be at least 8 digits/characters, alphanumeric, containing at least one special character (*, @, #) and at least one capital letter.'
      });
    }

    // Validate Security Questions
    if (!security_city || !security_city.trim() || !security_pet || !security_pet.trim()) {
      return res.status(400).json({ error: 'Please answer both security questions for password recovery.' });
    }
    const cleanCity = security_city.trim().toLowerCase();
    const cleanPet = security_pet.trim().toLowerCase();

    // Student specific validations
    if (type === 'student') {
      if (!first_name || !first_name.trim()) {
        return res.status(400).json({ error: 'Student First Name is required.' });
      }
    } else {
      if (!first_name || !first_name.trim()) {
        return res.status(400).json({ error: 'Name is required.' });
      }
    }

    const fullNameParts = [first_name, middle_name, last_name].filter(Boolean).map(s => s.trim());
    const displayName = fullNameParts.join(' ') || cleanUsername;
    const passwordHash = await bcrypt.hash(password, 10);
    const chosenAvatar = avatar || (type === 'student' ? 'lion' : 'owl');

    const result = dbAdapter.execute(
      `INSERT INTO users (
        username, email, password_hash, display_name, avatar, grade, xp, stars, streak_days,
        is_guest, user_type, first_name, middle_name, last_name, school_name, class_division,
        parent_relation, parent_name, parent_phone, country, state, pin, address_details,
        qualification, security_city, security_pet, is_admin
      ) VALUES (?, ?, ?, ?, ?, ?, 100, 10, 1, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        cleanUsername,
        cleanEmail,
        passwordHash,
        displayName,
        chosenAvatar,
        3,
        type,
        first_name ? first_name.trim() : null,
        middle_name ? middle_name.trim() : null,
        last_name ? last_name.trim() : null,
        school_name ? school_name.trim() : null,
        class_division ? class_division.trim() : null,
        parent_relation || null,
        parent_name ? parent_name.trim() : null,
        parent_phone ? parent_phone.trim() : null,
        country || 'India',
        state || null,
        pin ? pin.trim() : null,
        address_details ? address_details.trim() : null,
        qualification ? qualification.trim() : null,
        cleanCity,
        cleanPet
      ]
    );

    const user = dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);

    const token = jwt.sign(
      { id: user.id, username: user.username, is_guest: 0, is_admin: 0 },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Account registered successfully! Verification PIN sent to your email.',
      verification_pin_notice: 'A 6-digit confirmation PIN has been dispatched to ' + cleanEmail + '.',
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        user_type: user.user_type,
        avatar: user.avatar,
        grade: user.grade,
        xp: user.xp,
        stars: user.stars
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. ' + err.message });
  }
});

// 3. User Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter both User ID and Password.' });
    }

    const cleanInput = username.trim().toLowerCase();
    const user = dbAdapter.queryOne(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [cleanInput, cleanInput]
    );

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid User ID or Password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid User ID or Password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_guest: user.is_guest === 1, is_admin: user.is_admin === 1 },
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
        email: user.email,
        user_type: user.user_type,
        avatar: user.avatar,
        grade: user.grade,
        xp: user.xp,
        stars: user.stars,
        is_admin: user.is_admin === 1
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// 4. Password Recovery via Security Questions
router.post('/recover-password', async (req, res) => {
  try {
    const { email, security_city, security_pet, new_password } = req.body;

    if (!email || !security_city || !security_pet) {
      return res.status(400).json({ error: 'Please provide Email ID and answers to both security questions.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = dbAdapter.queryOne('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!user) {
      return res.status(404).json({ error: 'No account found with this Email ID.' });
    }

    // Check answers (case-insensitive, trimmed)
    const userCity = (user.security_city || '').trim().toLowerCase();
    const userPet = (user.security_pet || '').trim().toLowerCase();

    const inputCity = security_city.trim().toLowerCase();
    const inputPet = security_pet.trim().toLowerCase();

    if (userCity !== inputCity || userPet !== inputPet) {
      return res.status(400).json({ error: 'Security question answers do not match our records.' });
    }

    // If new password is provided, reset it
    if (new_password) {
      if (new_password.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      }
      const hasCapital = /[A-Z]/.test(new_password);
      const hasSpecial = /[*@#]/.test(new_password);
      const hasAlphaNum = /[0-9]/.test(new_password) && /[a-z]/i.test(new_password);

      if (!hasCapital || !hasSpecial || !hasAlphaNum) {
        return res.status(400).json({
          error: 'Password must be at least 8 digits/characters, alphanumeric, containing at least one special character (*, @, #) and at least one capital letter.'
        });
      }

      const newHash = await bcrypt.hash(new_password, 10);
      dbAdapter.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);

      return res.json({
        message: 'Password successfully reset! You can now log in with your new password.',
        verified: true
      });
    }

    // Verification step passed
    res.json({
      message: 'Security details verified! Please enter your new password.',
      verified: true
    });
  } catch (err) {
    console.error('Password recovery error:', err);
    res.status(500).json({ error: 'Password recovery failed. ' + err.message });
  }
});

// 5. Admin Authentication
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter admin username and password.' });
    }

    const cleanUser = username.trim().toLowerCase();
    const user = dbAdapter.queryOne(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_admin = 1',
      [cleanUser, cleanUser]
    );

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: 1 },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin access authorized! Welcome to Control Center.',
      token,
      admin: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// 6. Admin Control Center: List Users & Metrics
router.get('/admin/users', requireAdmin, (req, res) => {
  try {
    const users = dbAdapter.queryAll(
      `SELECT id, username, email, display_name, avatar, grade, xp, stars, streak_days,
              is_guest, user_type, first_name, middle_name, last_name, school_name,
              class_division, parent_relation, parent_name, parent_phone, country, state,
              pin, address_details, qualification, is_admin, created_at
       FROM users
       WHERE is_guest = 0
       ORDER BY created_at DESC`
    );

    const totalCount = users.length;
    const studentCount = users.filter(u => u.user_type === 'student').length;
    const otherCount = users.filter(u => u.user_type === 'other').length;

    res.json({
      stats: {
        total_registered_users: totalCount,
        student_count: studentCount,
        other_count: otherCount
      },
      users
    });
  } catch (err) {
    console.error('Admin fetch users error:', err);
    res.status(500).json({ error: 'Failed to retrieve registered users' });
  }
});

// 7. Admin Control Center: Reset User Password
router.post('/admin/reset-password', requireAdmin, async (req, res) => {
  try {
    const { user_id, new_password } = req.body;
    if (!user_id || !new_password) {
      return res.status(400).json({ error: 'User ID and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const targetUser = dbAdapter.queryOne('SELECT id, username, display_name FROM users WHERE id = ?', [user_id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    dbAdapter.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user_id]);

    res.json({
      message: `Password for user "${targetUser.display_name}" (@${targetUser.username}) has been successfully reset!`,
      user_id,
      username: targetUser.username
    });
  } catch (err) {
    console.error('Admin reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password: ' + err.message });
  }
});

// 8. Current User Info
router.get('/me', optionalAuth, (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }

  const user = dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.json({ user: null });
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      avatar: user.avatar,
      grade: user.grade,
      xp: user.xp,
      stars: user.stars,
      streak_days: user.streak_days,
      is_guest: user.is_guest === 1,
      is_admin: user.is_admin === 1,
      user_type: user.user_type
    }
  });
});

module.exports = router;
