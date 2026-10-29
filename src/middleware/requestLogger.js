/**
 * High-Efficiency Request Performance & Activity Logger
 * Logs HTTP method, sanitized path, response status, duration, and client details.
 */
function requestLogger(req, res, next) {
  // Skip noisy static asset requests to keep terminal clean
  if (
    req.path.endsWith('.css') ||
    req.path.endsWith('.js') ||
    req.path.endsWith('.png') ||
    req.path.endsWith('.jpg') ||
    req.path.endsWith('.ico') ||
    req.path.endsWith('.svg') ||
    req.path.endsWith('.woff2')
  ) {
    return next();
  }

  const startTime = Date.now();
  // Capture client IP for audit/security investigation purposes
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Status color code indicator
    let statusLabel = `[${statusCode}]`;
    if (statusCode >= 500) {
      statusLabel = `🔴 [${statusCode}]`;
    } else if (statusCode >= 400) {
      statusLabel = `🟡 [${statusCode}]`;
    } else {
      statusLabel = `🟢 [${statusCode}]`;
    }

    // Only log in non-test mode or when debugging
    if (process.env.NODE_ENV !== 'test') {
      console.log(`📡 ${statusLabel} ${req.method} ${req.originalUrl || req.url} - ${duration}ms [${clientIp}]`);
    }
  });

  next();
}

module.exports = { requestLogger };
