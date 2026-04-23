'use strict';

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function normalizeError(error) {
  if (error.response) {
    const { status, data } = error.response;
    return new ApiError(
      (data && data.error) || error.message,
      status,
      data,
    );
  }
  return error;
}

module.exports = { ValidationError, ApiError, normalizeError };
