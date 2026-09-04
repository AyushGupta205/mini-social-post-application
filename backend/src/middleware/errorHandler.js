const { sendError } = require('../utils/responseHelper');

// 404 handler for unknown routes
const notFoundHandler = (req, res, next) => {
  return sendError(res, 404, `API route not found: ${req.method} ${req.originalUrl}`);
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('. ');
    return sendError(res, statusCode, message, errors);
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    return sendError(res, statusCode, message);
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for parameter: ${err.path}`;
    return sendError(res, statusCode, message);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    return sendError(res, statusCode, message);
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    return sendError(res, statusCode, message);
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum allowed size is 5MB.';
    } else {
      message = `Upload error: ${err.message}`;
    }
    return sendError(res, statusCode, message);
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
  }

  return sendError(res, statusCode, message);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
