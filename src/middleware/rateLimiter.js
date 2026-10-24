// Lightweight In-Memory Sliding Window Rate Limiter
// Protects student and admin authentication endpoints against brute-force attacks

const requestBuckets = new Map();

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 5 * 60 * 1000; // default 5 minutes
  const maxRequests = options.max || 20; // default 20 requests per window
  const message = options.message || 'Too many attempts. Please try again after 5 minutes.';

  // Periodic cleanup of stale IP records every 10 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requestBuckets.entries()) {
      if (now - data.firstRequest > windowMs * 2) {
        requestBuckets.delete(ip);
      }
    }
  }, 10 * 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!requestBuckets.has(ip)) {
      requestBuckets.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    const data = requestBuckets.get(ip);
    if (now - data.firstRequest > windowMs) {
      // Reset window
      data.count = 1;
      data.firstRequest = now;
      return next();
    }

    data.count++;
    if (data.count > maxRequests) {
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil((windowMs - (now - data.firstRequest)) / 1000)
      });
    }

    next();
  };
}

module.exports = {
  authLimiter: createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: 'Too many login or registration attempts. Please wait a few minutes before trying again.'
  })
};
