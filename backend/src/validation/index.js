const { ApiError } = require('../middleware/errors');

const allowedStatuses = new Set(['reported', 'verified', 'resolved', 'rejected']);

function body(req) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new ApiError(400, 'Request body must be a JSON object');
  }
  return req.body;
}

function pagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ApiError(400, 'page must be a positive integer and limit must be between 1 and 100');
  }
  return { page, limit, offset: (page - 1) * limit };
}

function optionalNumber(value, field, min, max) {
  if (value === undefined || value === null || value === '') return null;
  const result = Number(value);
  if (!Number.isFinite(result) || (min !== undefined && result < min) || (max !== undefined && result > max)) {
    throw new ApiError(400, `${field} must be a number${min !== undefined ? ` between ${min} and ${max}` : ''}`);
  }
  return result;
}

function requiredString(value, field, max = 5000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new ApiError(400, `${field} is required and must be a string no longer than ${max} characters`);
  }
  return value.trim();
}

function optionalString(value, field, max = 5000) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || value.length > max) {
    throw new ApiError(400, `${field} must be a string no longer than ${max} characters`);
  }
  return value.trim() || null;
}

function integerId(value, field = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new ApiError(400, `${field} must be a positive integer`);
  return id;
}

function status(value) {
  if (value === undefined || value === null) return 'reported';
  if (!allowedStatuses.has(value)) throw new ApiError(400, `status must be one of: ${[...allowedStatuses].join(', ')}`);
  return value;
}

module.exports = { body, pagination, optionalNumber, requiredString, optionalString, integerId, status };
