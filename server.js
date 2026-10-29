const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { initSchema, dbAdapter } = require('./src/db/database');
const { seedDatabase } = require('./src/db/seedData');
const { validateJwtConfiguration, getJwtSecret } = require('./src/middleware/auth');
const { securityHeaders } = require('./src/middleware/securityHeaders');
const { requestLogger } = require('./src/middleware/requestLogger');
const { errorHandler } = require('./src/middleware/errorHandler');

// Route modules
const authRoutes = require('./src/routes/auth');
const contentRoutes = require('./src/routes/content');
const quizRoutes = require('./src/routes/quiz');
const progressRoutes = require('./src/routes/progress');
const communityRoutes = require('./src/routes/community');
const aiRoutes = require('./src/routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;
const serverStartTime = Date.now();

// 1. Security & Diagnostic Middleware
app.use(securityHeaders);
app.use(requestLogger);

// 2. CORS — restrict to configured origins in production
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : null; // null = allow all (development default)

app.use(cors({
  origin: allowedOrigins
    ? (origin, callback) => {
        // Allow requests with no Origin header (e.g. server-to-server, curl) and configured origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: origin '${origin}' is not allowed.`));
        }
      }
    : true, // allow all in development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Standard Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Serve Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/ai', aiRoutes);

// 6. System Health Check & Performance Monitoring Endpoint
app.get('/api/health', async (req, res) => {
  const memory = process.memoryUsage();
  let dbConnected = false;
  let dbEngine = dbAdapter.isPg() ? 'PostgreSQL (Cloud)' : 'SQLite (Local Engine)';

  // Attempt a real lightweight DB ping to confirm connectivity
  try {
    await dbAdapter.queryOne('SELECT 1 AS ping');
    dbConnected = true;
  } catch (err) {
    dbConnected = false;
    console.error('Health check DB ping failed:', err.message);
  }

  res.json({
    status: dbConnected ? 'online' : 'degraded',
    platform: 'TalentHunt CBSE Learning, Olympiads & Vedic Mathematics',
    target_standards: 'Class III to Class X (CBSE)',
    node_version: process.version,
    uptime_seconds: Math.floor((Date.now() - serverStartTime) / 1000),
    database: {
      engine: dbEngine,
      connected: dbConnected
    },
    memory: {
      heap_used_mb: Math.round(memory.heapUsed / (1024 * 1024)),
      heap_total_mb: Math.round(memory.heapTotal / (1024 * 1024))
    },
    timestamp: new Date().toISOString()
  });
});

// 7. Single Page Application Fallback (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

// 8. Centralized Error Boundary Middleware
app.use(errorHandler);

// Async Bootstrap Server
let serverInstance = null;

async function startServer() {
  try {
    console.log('🚀 Initializing TalentHunt Modern Platform Architecture...');
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      getJwtSecret();
    } else {
      validateJwtConfiguration();
    }

    if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_PASSWORD.trim())) {
      const crypto = require('crypto');
      const autoAdminPassword = 'Admin_' + crypto.randomBytes(8).toString('hex') + '!';
      process.env.ADMIN_PASSWORD = autoAdminPassword;
      console.warn('⚠️ [PRODUCTION NOTICE] ADMIN_PASSWORD environment variable was unset.');
      console.warn(`🔑 Generated secure Administrator password: ${autoAdminPassword}`);
      console.warn('👉 Use this password or set your custom ADMIN_PASSWORD in your hosting dashboard.');
    }

    await initSchema();
    await seedDatabase();

    serverInstance = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🌟 TalentHunt Modernized Platform running live at:`);
      console.log(`👉 Local:   http://localhost:${PORT}`);
      console.log(`👉 Network: Ready for private hosting & custom domain`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful Process Termination Listeners
function handleGracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down TalentHunt server...`);
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('✅ HTTP server closed cleanly. Goodbye!');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();

module.exports = app;

