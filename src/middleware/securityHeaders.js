/**
 * Modern Security Headers Middleware
 * Protects against XSS, clickjacking, MIME-type sniffing, and enforces referrer policies.
 */
function securityHeaders(req, res, next) {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Mitigate clickjacking attacks
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Enforce XSS protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict sensitive browser features (camera, mic, geolocation) unless explicitly needed
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Remove default Express fingerprinting
  res.removeHeader('X-Powered-By');

  next();
}

module.exports = { securityHeaders };
