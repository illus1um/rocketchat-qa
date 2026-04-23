'use strict';
/**
 * Input validation utilities
 */

const { ValidationError } = require('./errors');

const MAX_USERNAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_CHANNEL_NAME_LENGTH = 64;
const MIN_PASSWORD_LENGTH = 1;
const CHANNEL_NAME_PATTERN = /^[a-z0-9._-]+$/i;

function assertNonEmptyString(value, field) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`, field);
  }
  if (value.length === 0) {
    throw new ValidationError(`${field} must not be empty`, field);
  }
}

function validateCredentials(username, password) {
  assertNonEmptyString(username, 'username');
  assertNonEmptyString(password, 'password');
  if (username.length > MAX_USERNAME_LENGTH) {
    throw new ValidationError('username too long', 'username');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError('password too short', 'password');
  }
}

function validateChannelName(name) {
  assertNonEmptyString(name, 'name');
  if (name.length > MAX_CHANNEL_NAME_LENGTH) {
    throw new ValidationError('channel name too long', 'name');
  }
  if (!CHANNEL_NAME_PATTERN.test(name)) {
    throw new ValidationError('channel name contains invalid characters', 'name');
  }
}

function validateMessage(roomId, text) {
  assertNonEmptyString(roomId, 'roomId');
  if (typeof text !== 'string') {
    throw new ValidationError('text must be a string', 'text');
  }
  if (text.length === 0) {
    throw new ValidationError('text must not be empty', 'text');
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    throw new ValidationError('text exceeds max length', 'text');
  }
}

function buildAuthHeaders(session) {
  if (!session || !session.userId || !session.authToken) {
    throw new ValidationError('missing session', 'session');
  }
  return {
    'X-Auth-Token': session.authToken,
    'X-User-Id': session.userId,
  };
}

module.exports = {
  validateCredentials,
  validateChannelName,
  validateMessage,
  buildAuthHeaders,
  CHANNEL_NAME_PATTERN,
  MAX_USERNAME_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_CHANNEL_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
};
