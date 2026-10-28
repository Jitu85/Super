const jwt = require('jsonwebtoken');

const KNOWN_INSECURE_SECRETS = new Set([
  'talenthunt_cbse_super_secret_key_2026',
  'talenthunt_cbse_super_secret_key_2026_change_in_production',
  'talenthunt_local_dev_only_jwt_secret_not_for_production',
  'secret',
  'jwt_secret',
  'changeme',
  'password',
  '123456',
  'admin',
  'supersecret'
]);

const DEV_FALLBACK_SECRET = 'talenthunt_local_dev_only_jwt_secret_not_for_production';
let devWarningLogged = false;

function validateJwtConfiguration(env = process.env) {
  const isProd = env.NODE_ENV === 'production';
  const secret = (env.JWT_SECRET || '').trim();

  if (isProd) {
    if (!secret) {
      throw new Error('FATAL: JWT_SECRET environment variable is mandatory in production.');
    }
    if (KNOWN_INSECURE_SECRETS.has(secret.toLowerCase())) {
      throw new Error('FATAL: Configured JWT_SECRET matches a known insecure or default fallback. A unique, high-entropy secret is required.');
    }
    if (secret.length < 32) {
      throw new Error('FATAL: Configured JWT_SECRET in production must be at least 32 characters in length.');
    }
  }
  return true;
}

function getJwtSecret() {
  const isProd = process.env.NODE_ENV === 'production';
  let secret = (process.env.JWT_SECRET || '').trim();

  if (isProd) {
    if (!secret) {
      const crypto = require('crypto');
      const autoSecret = crypto.randomBytes(32).toString('hex');
      process.env.JWT_SECRET = autoSecret;
      secret = autoSecret;
      if (!devWarningLogged) {
        devWarningLogged = true;
        console.warn('⚠️ [PRODUCTION NOTICE] JWT_SECRET environment variable was unset in production.');
        console.warn('   A cryptographically secure 256-bit random secret was automatically generated for this session.');
        console.warn('   👉 To persist user login sessions across container restarts, add JWT_SECRET in your Render Dashboard (Environment tab).');
      }
    }
    validateJwtConfiguration(process.env);
    return secret;
  }

  if (secret) {
    return secret;
  }

  if (!devWarningLogged && process.env.NODE_ENV !== 'test') {
    devWarningLogged = true;
    console.warn('⚠️ [DEV WARNING] JWT_SECRET is unset. Using temporary local development fallback secret. Set a secure JWT_SECRET before deploying to production.');
  }

  return DEV_FALLBACK_SECRET;
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || !decoded.is_admin) {
      return res.status(403).json({ error: 'Administrator access required.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin session. Please log in again.' });
  }
}

function requireRegisteredUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Registration required. Please register or sign in to access full courses and Olympiads.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.is_guest) {
      return res.status(403).json({ error: 'Guest access restricted. Please register to access full courses and Olympiad portals.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

module.exports = {
  get JWT_SECRET() {
    return getJwtSecret();
  },
  getJwtSecret,
  validateJwtConfiguration,
  optionalAuth,
  requireAuth,
  requireRegisteredUser,
  requireAdmin
};
