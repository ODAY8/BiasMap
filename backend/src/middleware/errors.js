class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || (err.code && String(err.code).startsWith('SQLITE_CONSTRAINT') ? 409 : 500);
  const body = { error: { message: status === 500 ? 'Internal server error' : err.message } };
  if (err.details) body.error.details = err.details;
  if (status === 500 && process.env.NODE_ENV !== 'test') console.error(err);
  res.status(status).json(body);
}

module.exports = { ApiError, asyncHandler, notFound, errorHandler };
