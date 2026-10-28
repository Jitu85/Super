/**
 * Centralized Application Error Boundary Middleware
 * Produces structured JSON errors without leaking sensitive traces in production.
 */
function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (!isProduction && statusCode >= 500) {
    console.error('🔥 Server Error Exception:', err);
  }

  // Consistent API error envelope
  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    status: statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(isProduction ? {} : { stack: err.stack })
  });
}

module.exports = { errorHandler };
