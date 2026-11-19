const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const jwt = require('jsonwebtoken');
const { dbAdapter } = require('../src/db/database');
const { getJwtSecret } = require('../src/middleware/auth');
const authRouter = require('../src/routes/auth');
const quizRouter = require('../src/routes/quiz');
const contentRouter = require('../src/routes/content');

describe('Course-Wise Enrolment & Commercial Locking Security Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
    app.use('/api/quiz', quizRouter);
    app.use('/api/content', contentRouter);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('should auto-enrol a new student into their registered class on registration', async () => {
    const unique = Date.now() + Math.floor(Math.random() * 1000);
    const regPayload = {
      username: `student${unique}`,
      email: `student${unique}@talenthunt.com`,
      password: 'Password@123',
      security_city: 'Delhi',
      security_pet: 'Tom',
      first_name: 'Test',
      last_name: 'Enrollee',
      class_division: 'Class 5',
      user_type: 'student'
    };

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload)
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Token must be present in response');
    assert.equal(data.user.grade, 5);
    assert.deepEqual(data.user.enrolments, ['class-5']);

    // Verify in database table user_enrolments
    const dbEnr = await dbAdapter.queryAll(
      "SELECT course_id, status FROM user_enrolments WHERE user_id = ? AND status = 'active'",
      [data.user.id]
    );
    assert.equal(dbEnr.length, 1);
    assert.equal(dbEnr[0].course_id, 'class-5');
  });

  it('should return user active enrolments from GET /api/auth/enrolments and all courses for admin', async () => {
    // 1. Regular student token (Grade 3)
    const studentUser = await dbAdapter.queryOne("SELECT id, grade FROM users WHERE is_admin = 0 AND grade = 3 LIMIT 1");
    assert.ok(studentUser, 'Should have at least one grade 3 student in DB');

    const studentToken = jwt.sign(
      { id: studentUser.id, username: 'teststudent', is_guest: false, is_admin: false },
      getJwtSecret()
    );

    const res1 = await fetch(`${baseUrl}/api/auth/enrolments`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.equal(res1.status, 200);
    const data1 = await res1.json();
    assert.equal(data1.authenticated, true);
    assert.equal(data1.is_admin, false);
    assert.ok(data1.enrolments.includes('class-3'), 'Student should have class-3 active enrolment');

    // 2. Admin token
    const adminToken = jwt.sign(
      { id: 9999, username: 'superadmin', is_guest: false, is_admin: true },
      getJwtSecret()
    );

    const res2 = await fetch(`${baseUrl}/api/auth/enrolments`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.authenticated, true);
    assert.equal(data2.is_admin, true);
    assert.ok(data2.enrolments.length >= 10, 'Admin should have universal access to all courses');
    assert.ok(data2.enrolments.includes('class-3') && data2.enrolments.includes('class-10') && data2.enrolments.includes('vedic-maths'));
  });

  it('should allow student to enrol in a new class and standalone masterclass via POST /api/auth/enrol-course', async () => {
    const studentUser = await dbAdapter.queryOne("SELECT id FROM users WHERE is_admin = 0 LIMIT 1");
    const studentToken = jwt.sign(
      { id: studentUser.id, username: 'student_buyer', is_guest: false, is_admin: false },
      getJwtSecret()
    );

    // Enrol into Class 7
    const res1 = await fetch(`${baseUrl}/api/auth/enrol-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ course_id: 'class-7' })
    });
    assert.equal(res1.status, 200);
    const data1 = await res1.json();
    assert.equal(data1.success, true);
    assert.ok(data1.enrolments.includes('class-7'), 'Enrolments must now include class-7');

    // Enrol into Vedic Mathematics Academy
    const res2 = await fetch(`${baseUrl}/api/auth/enrol-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ course_id: 'vedic-maths' })
    });
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.success, true);
    assert.ok(data2.enrolments.includes('vedic-maths'), 'Enrolments must now include vedic-maths');
  });

  it('should block non-enrolled students from practice quizzes with 403 enrolment_required', async () => {
    // Create an isolated user who is ONLY enrolled in class-3
    const unique = Date.now() + Math.floor(Math.random() * 1000);
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `locktest${unique}`,
        email: `locktest${unique}@talenthunt.com`,
        password: 'Password@123',
        security_city: 'Kolkata',
        security_pet: 'Dog',
        first_name: 'Locked',
        class_division: 'Class 3',
        user_type: 'student'
      })
    });
    assert.equal(regRes.status, 200);
    const regData = await regRes.json();
    const token = regData.token;

    // 1. Attempt to access Class 7 practice questions -> Must return 403 Forbidden with enrolment_required
    const resForbidden = await fetch(`${baseUrl}/api/quiz/practice/unit-algebra?subjectId=math-class7`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.equal(resForbidden.status, 403);
    const errData = await resForbidden.json();
    assert.equal(errData.error, 'enrolment_required');
    assert.equal(errData.course_id, 'class-7');

    // 2. Attempt to access Class 3 practice questions -> Must return 200 OK
    const resAllowed = await fetch(`${baseUrl}/api/quiz/practice/unit-numbers?subjectId=math-class3`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.equal(resAllowed.status, 200);
    const allowedData = await resAllowed.json();
    assert.ok(Array.isArray(allowedData.questions) && allowedData.questions.length > 0, 'Enrolled user must receive questions array');
  });

  it('should block non-enrolled students from entering Olympiad mock exam hall with 403 enrolment_required', async () => {
    // Isolated user enrolled only in Class 3
    const unique = Date.now() + Math.floor(Math.random() * 1000);
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `olymlock${unique}`,
        email: `olymlock${unique}@talenthunt.com`,
        password: 'Password@123',
        security_city: 'Mumbai',
        security_pet: 'Cat',
        first_name: 'Olympian',
        class_division: 'Class 3',
        user_type: 'student'
      })
    });
    const regData = await regRes.json();
    const token = regData.token;

    // Attempt to access Class 8 Olympiad Mock -> Must return 403 Forbidden
    const resForbidden = await fetch(`${baseUrl}/api/quiz/olympiad/olympiad-mcq-class8`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.equal(resForbidden.status, 403);
    const errData = await resForbidden.json();
    assert.equal(errData.error, 'enrolment_required');
    assert.equal(errData.course_id, 'class-8');

    // Attempt to access Class 3 Olympiad Mock -> Must return 200 OK
    const resAllowed = await fetch(`${baseUrl}/api/quiz/olympiad/olympiad-c3-math`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.equal(resAllowed.status, 200);
    const allowedData = await resAllowed.json();
    assert.ok(allowedData.exam, 'Enrolled student must enter Olympiad exam hall');
  });

  it('should allow admin universal bypass to access any class practice questions and Olympiads', async () => {
    const adminToken = jwt.sign(
      { id: 9999, username: 'admin', is_guest: false, is_admin: true },
      getJwtSecret()
    );

    // Practice Class 10
    const resPractice = await fetch(`${baseUrl}/api/quiz/practice/unit-algebra?subjectId=math-class10`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.equal(resPractice.status, 200);

    // Olympiad Class 9
    const resOlympiad = await fetch(`${baseUrl}/api/quiz/olympiad/olympiad-mcq-class9`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.equal(resOlympiad.status, 200);
  });

  it('should register a Guest User with grade = null, no initial class enrolments, and locked dashboard access', async () => {
    const unique = Date.now() + Math.floor(Math.random() * 1000);
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `guestusr${unique}`,
        email: `guestusr${unique}@talenthunt.com`,
        password: 'Password@123',
        security_city: 'Bhubaneswar',
        security_pet: 'Puppy',
        first_name: 'Guest',
        last_name: 'Explorer',
        class_division: 'Guest User',
        user_type: 'student'
      })
    });

    assert.equal(regRes.status, 200);
    const regData = await regRes.json();
    assert.ok(regData.token, 'Token must be issued');
    assert.equal(regData.user.grade, null, 'Guest User grade must be null');
    assert.equal(regData.user.class_division, 'Guest User');
    assert.deepEqual(regData.user.enrolments, [], 'Guest User should have 0 initial enrolments');

    const token = regData.token;

    // 1. Verify GET /api/auth/enrolments returns empty enrolments
    const enrRes = await fetch(`${baseUrl}/api/auth/enrolments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.equal(enrRes.status, 200);
    const enrData = await enrRes.json();
    assert.deepEqual(enrData.enrolments, []);

    // 2. Verify all class practice drills return 403 enrolment_required
    const resClass3 = await fetch(`${baseUrl}/api/quiz/practice/eng-verbs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.equal(resClass3.status, 403);
    const err3 = await resClass3.json();
    assert.equal(err3.error, 'enrolment_required');

    // 3. Verify Olympiad returns 403 enrolment_required
    const resOly = await fetch(`${baseUrl}/api/quiz/olympiad/olympiad-c3-math`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.equal(resOly.status, 403);
    const errOly = await resOly.json();
    assert.equal(errOly.error, 'enrolment_required');

    // 4. Standalone Enrolment: Enrol in Vedic Mathematics Masterclass
    const enrolVedicRes = await fetch(`${baseUrl}/api/auth/enrol-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ course_id: 'vedic-maths' })
    });
    assert.equal(enrolVedicRes.status, 200);
    const enrolVedicData = await enrolVedicRes.json();
    assert.ok(enrolVedicData.enrolments.includes('vedic-maths'), 'Vedic Maths must be active');
    // Class 3 should still be locked
    assert.equal(enrolVedicData.enrolments.includes('class-3'), false);

    // 5. Standalone Enrolment: Enrol in Famous Tales with 3-year pass
    const enrolTalesRes = await fetch(`${baseUrl}/api/auth/enrol-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ course_id: 'famous-tales' })
    });
    assert.equal(enrolTalesRes.status, 200);
    const enrolTalesData = await enrolTalesRes.json();
    assert.ok(enrolTalesData.enrolments.includes('famous-tales'), 'Famous Tales must be in active enrolments');

    // Verify in database that expires_at is set ~3 years in the future
    const dbRow = await dbAdapter.queryOne(
      "SELECT expires_at FROM user_enrolments WHERE user_id = ? AND course_id = 'famous-tales'",
      [regData.user.id]
    );
    assert.ok(dbRow && dbRow.expires_at, 'expires_at must be populated for famous-tales');
    const expiryYear = new Date(dbRow.expires_at).getFullYear();
    const currentYear = new Date().getFullYear();
    assert.ok(expiryYear >= currentYear + 2, 'Expiry year must be ~3 years ahead');
  });

  it('should support Easy and Hard difficulty fragmentation and vector question diagram for Class 10', async () => {
    // 1. Verify Q. 1942 has vector SVG asset and image flag
    const q1942 = await dbAdapter.queryOne("SELECT * FROM questions WHERE id = 'q-master-1942' OR id = '1942'");
    assert.ok(q1942, 'Question 1942 must exist in database');
    assert.equal(q1942.difficulty, 'hard');
    assert.equal(q1942.subject_id, 'science-class10');

    // 2. Verify questions table contains both easy and hard questions for senior grades
    const easyCount = await dbAdapter.queryOne(
      "SELECT COUNT(*) as count FROM questions WHERE subject_id = 'science-class10' AND difficulty = 'easy'"
    );
    const hardCount = await dbAdapter.queryOne(
      "SELECT COUNT(*) as count FROM questions WHERE subject_id = 'science-class10' AND difficulty = 'hard'"
    );
    assert.ok(Number(easyCount.count) > 0, 'Class 10 Science must have Easy questions');
    assert.ok(Number(hardCount.count) > 0, 'Class 10 Science must have Hard questions');

    // 3. Verify SVG asset file exists in public/assets/questions/1942.svg
    const fs = require('fs');
    const path = require('path');
    const svgPath = path.join(__dirname, '..', 'public', 'assets', 'questions', '1942.svg');
    assert.ok(fs.existsSync(svgPath), '1942.svg must exist in public/assets/questions/');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    assert.ok(svgContent.includes('<svg'), '1942.svg must be valid SVG XML');
  });
});
