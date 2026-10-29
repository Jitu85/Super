/**
 * Centralized Application Error Boundary Middleware
 * Produces structured JSON errors without leaking sensitive traces in production.
 */
function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Always log 5xx errors server-side — even in production — for incident investigation.
  // Only suppress the stack trace from the client response in production.
  if (statusCode >= 500) {
    console.error('🔥 Server Error Exception:', err);
  }

  // Consistent API error envelope — never expose stack or internal paths to clients
  res.status(statusCode).json({
    error: isProduction && statusCode >= 500 ? 'An internal server error occurred. Please try again.' : message,
    code: err.code || 'INTERNAL_ERROR',
    status: statusCode,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { path: req.originalUrl, stack: err.stack })
  });
}

module.exports = { errorHandler };
