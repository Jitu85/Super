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

  // Content Security Policy — defence-in-depth against XSS attacks
  // Allows: self-origin scripts/styles, inline styles (needed for dynamic UI),
  // Google Fonts, and Web Speech API audio.
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",       // unsafe-inline required for inline event handlers in legacy markup; tighten progressively
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'"
    ].join('; ')
  );

  // HTTP Strict Transport Security — tell browsers to always use HTTPS (max 1 year)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Remove default Express fingerprinting
  res.removeHeader('X-Powered-By');

  next();
}

module.exports = { securityHeaders };
