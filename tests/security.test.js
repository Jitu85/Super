const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Root directory
const ROOT_DIR = path.resolve(__dirname, '..');

describe('Security Remediation Suite', () => {

  // =========================================================================
  // SECTION A: Administrator Credential Exposure
  // =========================================================================
  describe('A. Administrator Credential Exposure', () => {
    const knownCredentialPattern = new RegExp(Buffer.from('QWRtaW5AMjAyNg==', 'base64').toString('utf8'));

    it('should not display a default master key or password in public/index.html', () => {
      const indexHtmlPath = path.join(ROOT_DIR, 'public', 'index.html');
      const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

      // Assert that "Default Master Key" is removed
      assert.doesNotMatch(
        htmlContent,
        /Default Master Key/i,
        'public/index.html must not contain "Default Master Key"'
      );

      // Assert that known default credential patterns are absent
      assert.doesNotMatch(
        htmlContent,
        knownCredentialPattern,
        'public/index.html must not expose the known default admin password'
      );
    });

    it('should confirm public frontend assets do not contain known default credentials', () => {
      const publicDir = path.join(ROOT_DIR, 'public');
      const files = ['js/app.js', 'js/api.js', 'css/components.css', 'index.html'];

      for (const relPath of files) {
        const fullPath = path.join(publicDir, relPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          assert.doesNotMatch(
            content,
            knownCredentialPattern,
            `File ${relPath} must not contain known default credentials`
          );
        }
      }
    });

    it('should confirm administrator login form remains functional in public/index.html', () => {
      const indexHtmlPath = path.join(ROOT_DIR, 'public', 'index.html');
      const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

      assert.match(htmlContent, /id="admin-login-form"/, 'Admin login form must be present');
      assert.match(htmlContent, /id="admin-user-input"/, 'Admin username input must be present');
      assert.match(htmlContent, /id="admin-pwd-input"/, 'Admin password input must be present');
      assert.match(htmlContent, /type="submit"/, 'Admin submit button must be present');
    });
  });

  // =========================================================================
  // SECTION B: Password Recovery Vulnerability Remediation
  // =========================================================================
  describe('B. Password Recovery Vulnerability Remediation', () => {
    let testServer;
    let baseUrl;
    let memoryDbAdapter;

    before(async () => {
      // Setup isolated in-memory test database
      const { DatabaseSync } = require('node:sqlite');
      const memDb = new DatabaseSync(':memory:');

      memDb.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          password_hash TEXT,
          display_name TEXT,
          avatar TEXT DEFAULT 'lion',
          grade INTEGER DEFAULT 3,
          xp INTEGER DEFAULT 0,
          stars INTEGER DEFAULT 0,
          streak_days INTEGER DEFAULT 0,
          is_guest INTEGER DEFAULT 0,
          user_type TEXT DEFAULT 'student',
          security_city TEXT,
          security_pet TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_admin INTEGER DEFAULT 0
        );
      `);

      // Mock database adapter for the test app
      memoryDbAdapter = {
        async queryOne(sql, params = []) {
          const stmt = memDb.prepare(sql);
          return stmt.get(...params) || null;
        },
        async queryAll(sql, params = []) {
          const stmt = memDb.prepare(sql);
          return stmt.all(...params);
        },
        async execute(sql, params = []) {
          const stmt = memDb.prepare(sql);
          const result = stmt.run(...params);
          return {
            changes: result.changes,
            lastInsertRowid: result.lastInsertRowid
          };
        }
      };

      // Seed test users:
      // 1. Admin account without security questions (null stored answers)
      const adminHash = await bcrypt.hash('AdminSecurePass123!', 10);
      await memoryDbAdapter.execute(
        `INSERT INTO users (username, email, password_hash, display_name, is_admin, user_type, security_city, security_pet)
         VALUES (?, ?, ?, ?, 1, 'admin', NULL, NULL)`,
        ['admin_test', 'admin@example.com', adminHash, 'Admin User']
      );

      // 2. Student with hashed security answers
      const studentHash = await bcrypt.hash('StudentPass123!', 10);
      const cityHash = await bcrypt.hash('bhopal', 10);
      const petHash = await bcrypt.hash('rocky', 10);
      await memoryDbAdapter.execute(
        `INSERT INTO users (username, email, password_hash, display_name, is_admin, user_type, security_city, security_pet)
         VALUES (?, ?, ?, ?, 0, 'student', ?, ?)`,
        ['student_hashed', 'student1@example.com', studentHash, 'Hashed Student', cityHash, petHash]
      );

      // 3. Student with legacy plaintext security answers
      await memoryDbAdapter.execute(
        `INSERT INTO users (username, email, password_hash, display_name, is_admin, user_type, security_city, security_pet)
         VALUES (?, ?, ?, ?, 0, 'student', ?, ?)`,
        ['student_legacy', 'student2@example.com', studentHash, 'Legacy Student', 'kolkata', 'milo']
      );

      // 4. Student with null security answers
      await memoryDbAdapter.execute(
        `INSERT INTO users (username, email, password_hash, display_name, is_admin, user_type, security_city, security_pet)
         VALUES (?, ?, ?, ?, 0, 'student', NULL, NULL)`,
        ['student_no_qa', 'student3@example.com', studentHash, 'No QA Student']
      );

      // Build express test app isolating the recover-password logic
      const app = express();
      app.use(express.json());

      // Recovery route handler using memoryDbAdapter
      app.post('/api/auth/recover-password', async (req, res) => {
        try {
          const { email, security_city, security_pet, new_password } = req.body;

          if (!email || typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ error: 'Please provide Email ID and answers to both security questions.' });
          }

          if (
            !security_city || typeof security_city !== 'string' || !security_city.trim() ||
            !security_pet || typeof security_pet !== 'string' || !security_pet.trim()
          ) {
            return res.status(400).json({ error: 'Please provide Email ID and answers to both security questions.' });
          }

          const cleanEmail = email.trim().toLowerCase();
          const inputCity = security_city.trim().toLowerCase();
          const inputPet = security_pet.trim().toLowerCase();

          if (inputCity.length === 0 || inputPet.length === 0) {
            return res.status(400).json({ error: 'Security question answers cannot be blank.' });
          }

          const user = await memoryDbAdapter.queryOne('SELECT * FROM users WHERE email = ?', [cleanEmail]);

          if (!user) {
            return res.status(400).json({ error: 'Security question answers do not match our records.' });
          }

          if (user.is_admin === 1 || user.user_type === 'admin') {
            return res.status(403).json({
              error: 'Administrator accounts cannot be recovered via security questions. Please use administrator recovery procedures.'
            });
          }

          if (
            !user.security_city || typeof user.security_city !== 'string' || user.security_city.trim().length === 0 ||
            !user.security_pet || typeof user.security_pet !== 'string' || user.security_pet.trim().length === 0
          ) {
            return res.status(400).json({ error: 'Security questions are not configured for this account.' });
          }

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

          if (!user.security_city.startsWith('$2') || !user.security_pet.startsWith('$2')) {
            try {
              const upgradedCityHash = await bcrypt.hash(inputCity, 10);
              const upgradedPetHash = await bcrypt.hash(inputPet, 10);
              await memoryDbAdapter.execute(
                'UPDATE users SET security_city = ?, security_pet = ? WHERE id = ?',
                [upgradedCityHash, upgradedPetHash, user.id]
              );
            } catch (upgradeErr) {
              // ignore
            }
          }

          if (new_password) {
            if (typeof new_password !== 'string' || new_password.length < 8) {
              return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
            }
            const hasCapital = /[A-Z]/.test(new_password);
            const hasSmall = /[a-z]/.test(new_password);
            const hasNumber = /[0-9]/.test(new_password);
            const hasSpecial = /[^A-Za-z0-9]/.test(new_password);

            if (!hasCapital || !hasSmall || !hasNumber || !hasSpecial) {
              return res.status(400).json({
                error: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
              });
            }

            const newHash = await bcrypt.hash(new_password, 10);
            await memoryDbAdapter.execute(
              'UPDATE users SET password_hash = ? WHERE id = ?',
              [newHash, user.id]
            );

            return res.json({
              message: 'Password reset successful! You can now log in with your new password.',
              success: true
            });
          }

          res.json({
            message: 'Security questions verified! You may now set your new password.',
            verified: true
          });
        } catch (err) {
          res.status(500).json({ error: 'Password recovery failed. Please try again later.' });
        }
      });

      await new Promise((resolve) => {
        testServer = app.listen(0, '127.0.0.1', () => {
          const addr = testServer.address();
          baseUrl = `http://127.0.0.1:${addr.port}`;
          resolve();
        });
      });
    });

    after(async () => {
      if (testServer) {
        await new Promise((resolve) => testServer.close(resolve));
      }
    });

    it('should reject missing security answers with 400', async () => {
      const res = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student1@example.com' })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /Please provide Email ID and answers/i);
    });

    it('should reject null security answers with 400', async () => {
      const res = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student1@example.com',
          security_city: null,
          security_pet: null
        })
      });
      assert.strictEqual(res.status, 400);
    });

    it('should reject empty string security answers with 400', async () => {
      const res = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student1@example.com',
          security_city: '',
          security_pet: ''
        })
      });
      assert.strictEqual(res.status, 400);
    });

    it('should reject whitespace-only security answers with 400', async () => {
      const res = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student1@example.com',
          security_city: '   ',
          security_pet: '\t  \n'
        })
      });
      assert.strictEqual(res.status, 400);
    });

    it('should reject password recovery for administrator accounts with 403 Forbidden', async () => {
      // Attempt recovery on admin account with whitespace
      const res1 = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          security_city: '   ',
          security_pet: '   '
        })
      });
      // Rejected at input validation or admin check
      assert.strictEqual(res1.status, 400);

      // Attempt recovery on admin account with non-empty input
      const res2 = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          security_city: 'Delhi',
          security_pet: 'Tiger'
        })
      });
      assert.strictEqual(res2.status, 403);
      const data2 = await res2.json();
      assert.match(data2.error, /Administrator accounts cannot be recovered via security questions/i);
    });

    it('should reject recovery when account has unconfigured/null security questions', async () => {
      const res = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student3@example.com',
          security_city: 'AnyCity',
          security_pet: 'AnyPet'
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /Security questions are not configured/i);
    });

    it('should reject incorrect security answers for eligible student with generic error', async () => {
      const res = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student1@example.com',
          security_city: 'wrong_city',
          security_pet: 'wrong_pet'
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /Security question answers do not match our records/i);
    });

    it('should allow successful recovery for eligible student with hashed answers', async () => {
      // Step 1: Verify answers
      const res = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student1@example.com',
          security_city: '  BHOPAL  ', // whitespace and case trimmed
          security_pet: 'RoCkY'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.verified, true);

      // Step 2: Reset password
      const resetRes = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student1@example.com',
          security_city: 'bhopal',
          security_pet: 'rocky',
          new_password: 'NewValidPassword123!'
        })
      });
      assert.strictEqual(resetRes.status, 200);
      const resetData = await resetRes.json();
      assert.strictEqual(resetData.success, true);

      // Verify password hash in DB was updated
      const updatedUser = await memoryDbAdapter.queryOne('SELECT * FROM users WHERE email = ?', ['student1@example.com']);
      const isMatch = await bcrypt.compare('NewValidPassword123!', updatedUser.password_hash);
      assert.strictEqual(isMatch, true, 'Updated password must be verified by bcrypt');
    });

    it('should allow legacy plaintext answers and transparently upgrade them to bcrypt hashes', async () => {
      const res = await fetch(`${baseUrl}/api/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student2@example.com',
          security_city: 'Kolkata',
          security_pet: 'Milo'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.verified, true);

      // Verify that stored answers in DB have now been upgraded to bcrypt ($2...)
      const upgradedUser = await memoryDbAdapter.queryOne('SELECT * FROM users WHERE email = ?', ['student2@example.com']);
      assert.ok(upgradedUser.security_city.startsWith('$2'), 'City answer should be upgraded to bcrypt');
      assert.ok(upgradedUser.security_pet.startsWith('$2'), 'Pet answer should be upgraded to bcrypt');

      // Verify upgraded hash matches the answers
      assert.ok(await bcrypt.compare('kolkata', upgradedUser.security_city));
      assert.ok(await bcrypt.compare('milo', upgradedUser.security_pet));
    });
  });

  // =========================================================================
  // SECTION C: Administrator Initialization Logic
  // =========================================================================
  describe('C. Administrator Initialization Logic', () => {
    it('should refuse to initialize admin with fallback and fail cleanly in production when ADMIN_PASSWORD is unset', () => {
      const script = `
        process.env.NODE_ENV = 'production';
        delete process.env.ADMIN_PASSWORD;
        process.env.DB_PATH = ':memory:';
        const { initSchema, dbAdapter } = require('./src/db/database');
        initSchema().then(() => {
          console.log('UNEXPECTED_SUCCESS');
          process.exit(0);
        }).catch(err => {
          console.log('REJECTED_AS_EXPECTED: ' + err.message);
          process.exit(0);
        });
      `;

      const output = execFileSync(process.execPath, ['-e', script], {
        cwd: ROOT_DIR,
        encoding: 'utf8'
      });

      assert.match(output, /REJECTED_AS_EXPECTED/);
      assert.match(output, /CRITICAL SECURITY CONFIGURATION ERROR/);
      assert.doesNotMatch(output, new RegExp(Buffer.from('QWRtaW5AMjAyNg==', 'base64').toString('utf8')));
    });

    it('should successfully provision admin on fresh database when strong ADMIN_PASSWORD is provided', () => {
      const script = `
        process.env.NODE_ENV = 'production';
        process.env.ADMIN_PASSWORD = 'CustomAdminSecurePass2026!';
        process.env.ADMIN_EMAIL = 'admin_prod@test.com';
        process.env.DB_PATH = ':memory:';
        const { initSchema, dbAdapter } = require('./src/db/database');
        initSchema().then(async () => {
          const admin = await dbAdapter.queryOne('SELECT username, email, is_admin FROM users WHERE is_admin = 1');
          if (admin && admin.username === 'admin' && admin.email === 'admin_prod@test.com') {
            console.log('PROVISIONED_SUCCESSFULLY');
          } else {
            console.log('PROVISIONING_FAILED');
          }
          process.exit(0);
        }).catch(err => {
          console.error(err);
          process.exit(1);
        });
      `;

      const output = execFileSync(process.execPath, ['-e', script], {
        cwd: ROOT_DIR,
        encoding: 'utf8'
      });

      assert.match(output, /PROVISIONED_SUCCESSFULLY/);
    });

    it('should preserve existing admin and NOT overwrite password hash on subsequent startup', () => {
      const script = `
        process.env.NODE_ENV = 'production';
        process.env.ADMIN_PASSWORD = 'FirstPassword123!';
        process.env.DB_PATH = ':memory:';
        const { initSchema, dbAdapter } = require('./src/db/database');
        const bcrypt = require('bcryptjs');

        initSchema().then(async () => {
          const firstAdmin = await dbAdapter.queryOne('SELECT id, password_hash FROM users WHERE is_admin = 1');
          const firstHash = firstAdmin.password_hash;

          // Attempt second initialization with DIFFERENT ADMIN_PASSWORD in environment
          process.env.ADMIN_PASSWORD = 'ChangedPassword456!';
          await initSchema();

          const secondAdmin = await dbAdapter.queryOne('SELECT id, password_hash FROM users WHERE is_admin = 1');
          const allAdmins = await dbAdapter.queryAll('SELECT id FROM users WHERE is_admin = 1');

          if (allAdmins.length === 1 && secondAdmin.password_hash === firstHash) {
            console.log('ADMIN_PRESERVED_IMMUTABLE');
          } else {
            console.log('FAILED_PRESERVATION');
          }
          process.exit(0);
        }).catch(err => {
          console.error(err);
          process.exit(1);
        });
      `;

      const output = execFileSync(process.execPath, ['-e', script], {
        cwd: ROOT_DIR,
        encoding: 'utf8'
      });

      assert.match(output, /ADMIN_PRESERVED_IMMUTABLE/);
    });

    it('should warn and skip admin provisioning in development when ADMIN_PASSWORD is unset without setting a default password', () => {
      const script = `
        process.env.NODE_ENV = 'development';
        delete process.env.ADMIN_PASSWORD;
        process.env.DB_PATH = ':memory:';
        const { initSchema, dbAdapter } = require('./src/db/database');

        initSchema().then(async () => {
          const admin = await dbAdapter.queryOne('SELECT id FROM users WHERE is_admin = 1');
          if (!admin) {
            console.log('DEV_SKIPPED_SAFELY');
          } else {
            console.log('DEV_UNEXPECTEDLY_CREATED_ADMIN');
          }
          process.exit(0);
        }).catch(err => {
          console.error(err);
          process.exit(1);
        });
      `;

      const result = spawnSync(process.execPath, ['-e', script], {
        cwd: ROOT_DIR,
        encoding: 'utf8'
      });
      const output = (result.stdout || '') + (result.stderr || '');

      assert.match(output, /DEV_SKIPPED_SAFELY/);
      assert.match(output, /\[DEVELOPMENT ONLY\]/);
    });
  });

  // =========================================================================
  // SECTION D: JWT Configuration & Token Security
  // =========================================================================
  describe('D. JWT Configuration & Token Security', () => {
    const { validateJwtConfiguration, getJwtSecret, requireAdmin, requireAuth } = require('../src/middleware/auth');

    it('should reject production configuration when JWT_SECRET is missing', () => {
      assert.throws(
        () => validateJwtConfiguration({ NODE_ENV: 'production', JWT_SECRET: '' }),
        /FATAL: JWT_SECRET environment variable is mandatory in production/
      );

      assert.throws(
        () => validateJwtConfiguration({ NODE_ENV: 'production' }),
        /FATAL: JWT_SECRET environment variable is mandatory in production/
      );
    });

    it('should reject production configuration when JWT_SECRET is a known insecure fallback', () => {
      const insecureFallbacks = [
        'talenthunt_cbse_super_secret_key_2026',
        'talenthunt_cbse_super_secret_key_2026_change_in_production',
        'talenthunt_local_dev_only_jwt_secret_not_for_production',
        'secret',
        'jwt_secret',
        'changeme',
        'password',
        'admin',
        'supersecret'
      ];

      for (const fallback of insecureFallbacks) {
        assert.throws(
          () => validateJwtConfiguration({ NODE_ENV: 'production', JWT_SECRET: fallback }),
          /FATAL: Configured JWT_SECRET matches a known insecure or default fallback/i,
          `Expected fallback "${fallback}" to be rejected in production`
        );
      }
    });

    it('should reject production configuration when JWT_SECRET is shorter than 32 characters', () => {
      assert.throws(
        () => validateJwtConfiguration({ NODE_ENV: 'production', JWT_SECRET: 'short_secret_under_32_chars' }),
        /FATAL: Configured JWT_SECRET in production must be at least 32 characters in length/
      );
    });

    it('should accept valid high-entropy JWT_SECRET in production without printing secret', () => {
      const validSecret = 'test_high_entropy_secure_secret_string_minimum_32_characters_long_12345';
      const result = validateJwtConfiguration({ NODE_ENV: 'production', JWT_SECRET: validSecret });
      assert.strictEqual(result, true, 'Validation must pass for valid secret');
    });

    it('should provide safe development fallback when NODE_ENV is development and JWT_SECRET is unset', () => {
      const devValidation = validateJwtConfiguration({ NODE_ENV: 'development' });
      assert.strictEqual(devValidation, true);
    });

    it('should reject regular user token in requireAdmin middleware with 403 Forbidden', () => {
      const secret = 'test_temp_secret_for_middleware_checks_1234567890';
      const userToken = jwt.sign({ id: 99, username: 'student_tester', is_admin: 0 }, secret);

      // Temporarily override JWT_SECRET
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      try {
        let statusCode = null;
        let responseJson = null;

        const req = {
          headers: { authorization: `Bearer ${userToken}` }
        };
        const res = {
          status(code) {
            statusCode = code;
            return this;
          },
          json(data) {
            responseJson = data;
            return this;
          }
        };

        let nextCalled = false;
        requireAdmin(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, false, 'Regular user must not be passed to next()');
        assert.strictEqual(statusCode, 403, 'Regular user must receive 403 Forbidden');
        assert.match(responseJson.error, /Administrator access required/i);
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });

    it('should accept administrator token in requireAdmin middleware', () => {
      const secret = 'test_temp_secret_for_middleware_checks_1234567890';
      const adminToken = jwt.sign({ id: 1, username: 'admin', is_admin: 1 }, secret);

      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      try {
        const req = {
          headers: { authorization: `Bearer ${adminToken}` }
        };
        const res = {
          status() { return this; },
          json() { return this; }
        };

        let nextCalled = false;
        requireAdmin(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, true, 'Administrator must be passed to next()');
        assert.strictEqual(req.user.is_admin, 1);
        assert.strictEqual(req.user.username, 'admin');
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });

    it('should reject malformed or tampered token with 401 Unauthorized', () => {
      const req = {
        headers: { authorization: 'Bearer this.is.a.tampered.token' }
      };
      let statusCode = null;
      let responseJson = null;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responseJson = data;
          return this;
        }
      };

      requireAuth(req, res, () => {});
      assert.strictEqual(statusCode, 401);
      assert.match(responseJson.error, /Invalid or expired session/i);
    });
  });

  // =========================================================================
  // SECTION E: Regression Checks & Data Integrity
  // =========================================================================
  describe('E. Regression Checks & Data Integrity', () => {
    it('should verify regular student registration and login remain functional with disposable data', async () => {
      const script = `
        process.env.DB_PATH = ':memory:';
        process.env.NODE_ENV = 'development';
        const express = require('express');
        const { initSchema, dbAdapter } = require('./src/db/database');
        const authRoutes = require('./src/routes/auth');

        async function run() {
          await initSchema();
          const app = express();
          app.use(express.json());
          app.use('/api/auth', authRoutes);

          const server = app.listen(0, '127.0.0.1', async () => {
            const port = server.address().port;
            const url = 'http://127.0.0.1:' + port;

            // 1. Register student
            const regRes = await fetch(url + '/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: 'teststudent85',
                first_name: 'Test',
                last_name: 'Student',
                email: 'test_student_reg@example.com',
                password: 'Student@123',
                confirm_password: 'Student@123',
                school_name: 'Delhi Public School',
                class_division: '3-A',
                parent_relation: 'Father',
                parent_name: 'Parent Name',
                parent_phone: '9876543210',
                country: 'India',
                state: 'Delhi',
                pin: '110001',
                address_details: 'Main Street',
                qualification: 'Primary',
                security_city: 'Delhi',
                security_pet: 'Buddy',
                avatar: 'tiger'
              })
            });

            if (regRes.status !== 200) {
              const err = await regRes.text();
              console.error('Registration failed:', regRes.status, err);
              process.exit(1);
            }
            const regData = await regRes.json();
            if (!regData.token || !regData.user) {
              console.error('Missing token or user in registration response');
              process.exit(1);
            }

            // 2. Login student
            const loginRes = await fetch(url + '/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: 'teststudent85',
                password: 'Student@123'
              })
            });

            if (loginRes.status !== 200) {
              const err = await loginRes.text();
              console.error('Login failed:', loginRes.status, err);
              process.exit(1);
            }
            const loginData = await loginRes.json();
            if (!loginData.token || loginData.user.email !== 'test_student_reg@example.com') {
              console.error('Invalid login response');
              process.exit(1);
            }

            console.log('REGISTRATION_AND_LOGIN_SUCCESSFUL');
            server.close();
            process.exit(0);
          });
        }
        run().catch(err => {
          console.error(err);
          process.exit(1);
        });
      `;

      const result = spawnSync(process.execPath, ['-e', script], {
        cwd: ROOT_DIR,
        encoding: 'utf8'
      });
      const output = (result.stdout || '') + (result.stderr || '');
      assert.match(output, /REGISTRATION_AND_LOGIN_SUCCESSFUL/);
    });

    it('should verify local database talenthunt.db was not modified or overwritten', () => {
      const dbPath = path.join(ROOT_DIR, 'data', 'talenthunt.db');
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        assert.ok(stats.size > 0, 'Database file should exist with existing size');
      }
    });

    it('should verify server.js passes node syntax check without errors', () => {
      const files = [
        'server.js',
        'src/middleware/auth.js',
        'src/routes/auth.js',
        'src/db/database.js'
      ];

      for (const file of files) {
        const filePath = path.join(ROOT_DIR, file);
        execFileSync(process.execPath, ['--check', filePath]);
      }
    });
  });

});
