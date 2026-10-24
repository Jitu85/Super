const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { initSchema } = require('./src/db/database');
const { seedDatabase } = require('./src/db/seedData');

// Route modules
const authRoutes = require('./src/routes/auth');
const contentRoutes = require('./src/routes/content');
const quizRoutes = require('./src/routes/quiz');
const progressRoutes = require('./src/routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database & Seed CBSE Class III Data
console.log('🚀 Initializing TalentHunt Platform...');
initSchema();
seedDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);

// Health check endpoint for uptime monitoring & hosting checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'TalentHunt CBSE Learning & Olympiad Portal',
    target_class: 'Class III (CBSE)',
    timestamp: new Date().toISOString()
  });
});

// Single Page Application Fallback (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🌟 TalentHunt CBSE Platform running live at:`);
  console.log(`👉 Local:   http://localhost:${PORT}`);
  console.log(`👉 Network: Ready for private hosting & custom domain`);
  console.log(`=======================================================`);
});

module.exports = app;
