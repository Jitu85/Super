const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbAdapter } = require('../db/database');
const { getJwtSecret, requireAuth, optionalAuth, requireAdmin, requireRegisteredUser } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// 1. Instant Guest Initialization (Rate Limited)
router.post('/guest', authLimiter, async (req, res) => {
  try {
    const { display_name, avatar } = req.body;
    const name = (display_name && display_name.trim()) || 'Champion Learner';
    const chosenAvatar = avatar || 'lion';
    const guestUsername = 'guest_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const result = await dbAdapter.execute(
      `INSERT INTO users (username, display_name, avatar, grade, xp, stars, streak_days, is_guest, user_type)
       VALUES (?, ?, ?, 3, 50, 5, 1, 1, 'guest')`,
      [guestUsername, name, chosenAvatar]
    );

    const userId = result.lastInsertRowid;
    const user = await dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [userId]);

    const token = jwt.sign(
      { id: user.id, username: user.username, is_guest: true, is_admin: false },
      getJwtSecret(),
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

// 2. Full Dedicated Registration (Students & Other) - Rate Limited
router.post('/register', authLimiter, async (req, res) => {
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
    const existingUser = await dbAdapter.queryOne('SELECT id FROM users WHERE username = ?', [cleanUsername]);
    if (existingUser) {
      return res.status(400).json({ error: 'This User ID is already taken. Please choose another one.' });
    }

    // Validate Email
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email ID cannot be left blank. A verification PIN will be sent to the email." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existingEmail = await dbAdapter.queryOne('SELECT id FROM users WHERE email = ?', [cleanEmail]);
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

    // Derive the student's class from the registration form (e.g. "Class 7 - Div A" -> 7).
    let assignedGrade = 3;
    if (class_division) {
      const gradeMatch = String(class_division).match(/(\d+)/);
      if (gradeMatch) {
        const parsedGrade = parseInt(gradeMatch[1], 10);
        if (parsedGrade >= 3 && parsedGrade <= 10) assignedGrade = parsedGrade;
      }
    }
    
    // Child Privacy Protection: Hash security answers so they are never stored in plain text
    const cityHash = await bcrypt.hash(cleanCity, 10);
    const petHash = await bcrypt.hash(cleanPet, 10);

    const chosenAvatar = avatar || (type === 'student' ? 'lion' : 'owl');

    const result = await dbAdapter.execute(
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
        assignedGrade,
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
        cityHash,
        petHash
      ]
    );

    const user = await dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);

    const token = jwt.sign(
      { id: user.id, username: user.username, is_guest: false, is_admin: false },
      getJwtSecret(),
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Account registered successfully! You can now log in with your User ID and password.',
      verification_pin_notice: 'Use your chosen User ID and password on the login screen.',
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

// 3. User Login - Rate Limited
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter both User ID and Password.' });
    }

    const cleanInput = username.trim().toLowerCase();
    const user = await dbAdapter.queryOne(
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
      getJwtSecret(),
      { expiresIn: '30d' }
    );    res.json({
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

// 4. Password Recovery via Security Questions - Rate Limited
router.post('/recover-password', authLimiter, async (req, res) => {
  try {
    const { email, security_city, security_pet, new_password } = req.body;

    // Reject missing, null, non-string, or empty email
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Please provide Email ID and answers to both security questions.' });
    }

    // Reject missing, null, non-string, or whitespace-only security answers
    if (
      !security_city || typeof security_city !== 'string' || !security_city.trim() ||
      !security_pet || typeof security_pet !== 'string' || !security_pet.trim()
    ) {
      return res.status(400).json({ error: 'Please provide Email ID and answers to both security questions.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const inputCity = security_city.trim().toLowerCase();
    const inputPet = security_pet.trim().toLowerCase();

    // Ensure non-zero trimmed length
    if (inputCity.length === 0 || inputPet.length === 0) {
      return res.status(400).json({ error: 'Security question answers cannot be blank.' });
    }

    const user = await dbAdapter.queryOne('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    // Generic safe error message if user not found (prevents account enumeration)
    if (!user) {
      return res.status(400).json({ error: 'Security question answers do not match our records.' });
    }

    // Disallow password recovery for administrator accounts via security questions
    if (user.is_admin === 1 || user.user_type === 'admin') {
      return res.status(403).json({
        error: 'Administrator accounts cannot be recovered via security questions. Please use administrator recovery procedures.'
      });
    }

    // Require stored security answers to exist, be valid strings, and be non-empty
    if (
      !user.security_city || typeof user.security_city !== 'string' || user.security_city.trim().length === 0 ||
      !user.security_pet || typeof user.security_pet !== 'string' || user.security_pet.trim().length === 0
    ) {
      return res.status(400).json({ error: 'Security questions are not configured for this account.' });
    }

    // Check answers: Supports both hashed answers (bcrypt $2...) and legacy plaintext answers
    let cityMatch = false;
    let petMatch = false;

    if (user.security_city.startsWith('$2')) {
      cityMatch = await bcrypt.compare(inputCity, user.security_city);
    } else {
      const storedCity = user.security_city.trim().toLowerCase();
      cityMatch = storedCity.length > 0 && storedCity === inputCity;
    }

    if (user.security_pet.startsWith('$2')) {
      petMatch = await bcrypt.compare(inputPet, user.security_pet);
    } else {
      const storedPet = user.security_pet.trim().toLowerCase();
      petMatch = storedPet.length > 0 && storedPet === inputPet;
    }

    if (!cityMatch || !petMatch) {
      return res.status(400).json({ error: 'Security question answers do not match our records.' });
    }

    // Transparent upgrade: If legacy plaintext answers matched, re-hash them with bcrypt
    if (!user.security_city.startsWith('$2') || !user.security_pet.startsWith('$2')) {
      try {
        const upgradedCityHash = await bcrypt.hash(inputCity, 10);
        const upgradedPetHash = await bcrypt.hash(inputPet, 10);
        await dbAdapter.execute(
          'UPDATE users SET security_city = ?, security_pet = ? WHERE id = ?',
          [upgradedCityHash, upgradedPetHash, user.id]
        );
      } catch (upgradeErr) {
        // Non-fatal if upgrade update fails
      }
    }

    // If new password is provided, validate and reset it
    if (new_password) {
      if (typeof new_password !== 'string' || new_password.length < 8) {
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
      await dbAdapter.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);

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
    console.error('Password recovery error:', err.message);
    res.status(500).json({ error: 'Password recovery failed. Please try again later.' });
  }
});

// 5. Admin Authentication - Rate Limited
router.post('/admin-login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter admin username and password.' });
    }

    const cleanUser = username.trim().toLowerCase();
    const user = await dbAdapter.queryOne(
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
      { id: user.id, username: user.username, is_admin: true, is_guest: false },
      getJwtSecret(),
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
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await dbAdapter.queryAll(
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
        total: totalCount,
        students: studentCount,
        other: otherCount,
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

    const targetUser = await dbAdapter.queryOne('SELECT id, username, display_name FROM users WHERE id = ?', [user_id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await dbAdapter.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user_id]);

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
router.get('/me', optionalAuth, async (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }

  const user = await dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
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
      user_type: user.user_type,
      target_olympiad: user.target_olympiad,
      school_name: user.school_name,
      class_division: user.class_division,
      daily_goal_minutes: user.daily_goal_minutes || 30
    }
  });
});

// 9. Session Verification / Refresh
router.get('/verify', optionalAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  const user = await dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  res.json({
    authenticated: true,
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
      user_type: user.user_type,
      target_olympiad: user.target_olympiad || 'IMO & IEO',
      daily_goal_minutes: user.daily_goal_minutes || 30,
      school_board: user.school_board || 'CBSE'
    }
  });
});

// 10. Comprehensive Academic Profile (Registration Required)
router.get('/profile', requireRegisteredUser, async (req, res) => {
  try {
    const user = await dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Query user's attempt statistics
    const stats = await dbAdapter.queryOne(
      `SELECT COUNT(*) as total_attempts,
              COALESCE(AVG(percentage), 0) as avg_accuracy,
              COALESCE(SUM(correct_count), 0) as total_correct
       FROM quiz_attempts WHERE user_id = ?`,
      [req.user.id.toString()]
    );

    // Query user badges
    const badges = await dbAdapter.queryAll(
      'SELECT badge_id, badge_title, badge_icon, badge_desc, earned_at FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC',
      [req.user.id.toString()]
    );

    res.json({
      profile: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        avatar: user.avatar,
        grade: user.grade || 3,
        school_name: user.school_name || 'Not specified',
        class_division: user.class_division || 'A',
        school_board: user.school_board || 'CBSE',
        target_olympiad: user.target_olympiad || 'IMO (Maths) & IEO (English)',
        preferred_subjects: user.preferred_subjects ? JSON.parse(user.preferred_subjects) : ['Mathematics', 'English Grammar', 'Vedic Math'],
        daily_goal_minutes: user.daily_goal_minutes || 30,
        parent_notification_enabled: user.parent_notification_enabled !== 0,
        xp: user.xp || 0,
        stars: user.stars || 0,
        streak_days: user.streak_days || 1,
        total_attempts: stats ? stats.total_attempts : 0,
        avg_accuracy: stats ? Math.round(stats.avg_accuracy) : 0,
        total_correct: stats ? stats.total_correct : 0,
        badges: badges || []
      }
    });
  } catch (err) {
    console.error('Fetch academic profile error:', err);
    res.status(500).json({ error: 'Failed to load academic profile' });
  }
});

// 11. Update Academic Profile (Registration Required)
router.put('/profile', requireRegisteredUser, async (req, res) => {
  try {
    const {
      display_name,
      avatar,
      grade,
      school_name,
      class_division,
      school_board,
      target_olympiad,
      preferred_subjects,
      daily_goal_minutes,
      parent_notification_enabled
    } = req.body;

    const current = await dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!current) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedGrade = grade ? parseInt(grade, 10) : (current.grade || 3);
    const updatedName = (display_name && display_name.trim()) || current.display_name;
    const updatedAvatar = avatar || current.avatar;
    const updatedSchool = typeof school_name === 'string' ? school_name.trim() : current.school_name;
    const updatedDivision = typeof class_division === 'string' ? class_division.trim() : current.class_division;
    const updatedBoard = typeof school_board === 'string' ? school_board.trim() : (current.school_board || 'CBSE');
    const updatedOlympiad = typeof target_olympiad === 'string' ? target_olympiad.trim() : (current.target_olympiad || 'IMO & IEO');
    const updatedPrefSubs = preferred_subjects ? JSON.stringify(preferred_subjects) : current.preferred_subjects;
    const updatedDailyGoal = daily_goal_minutes ? parseInt(daily_goal_minutes, 10) : (current.daily_goal_minutes || 30);
    const updatedParentNotif = parent_notification_enabled !== undefined ? (parent_notification_enabled ? 1 : 0) : (current.parent_notification_enabled || 1);

    await dbAdapter.execute(
      `UPDATE users
       SET display_name = ?, avatar = ?, grade = ?, school_name = ?, class_division = ?,
           school_board = ?, target_olympiad = ?, preferred_subjects = ?, daily_goal_minutes = ?,
           parent_notification_enabled = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedAvatar,
        updatedGrade,
        updatedSchool,
        updatedDivision,
        updatedBoard,
        updatedOlympiad,
        updatedPrefSubs,
        updatedDailyGoal,
        updatedParentNotif,
        req.user.id
      ]
    );

    res.json({
      message: 'Academic profile updated successfully',
      profile: {
        display_name: updatedName,
        avatar: updatedAvatar,
        grade: updatedGrade,
        school_name: updatedSchool,
        class_division: updatedDivision,
        school_board: updatedBoard,
        target_olympiad: updatedOlympiad,
        daily_goal_minutes: updatedDailyGoal
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update academic profile' });
  }
});

// 12. Authenticated Change Password (Registration Required)
router.post('/change-password', requireRegisteredUser, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both current password and new password are required.' });
    }

    const user = await dbAdapter.queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user || !user.password_hash) {
      return res.status(400).json({ error: 'Unable to update password for this account.' });
    }

    const match = await bcrypt.compare(current_password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Current password does not match.' });
    }

    // Password complexity check
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }
    const hasCapital = /[A-Z]/.test(new_password);
    const hasSpecial = /[*@#]/.test(new_password);
    const hasAlphaNum = /[0-9]/.test(new_password) && /[a-z]/i.test(new_password);

    if (!hasCapital || !hasSpecial || !hasAlphaNum) {
      return res.status(400).json({
        error: 'Password must be alphanumeric, contain at least one capital letter, and at least one special character (*, @, #).'
      });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await dbAdapter.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;
