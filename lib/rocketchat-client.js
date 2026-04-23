'use strict';

const axios = require('axios');
const { ValidationError, ApiError, normalizeError } = require('./errors');
const {
  validateCredentials,
  validateChannelName,
  validateMessage,
  buildAuthHeaders,
  CHANNEL_NAME_PATTERN,
  MAX_USERNAME_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_CHANNEL_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} = require('./validators');
const { isRetryableStatus, withRetry } = require('./retry');

const DEFAULT_BASE_URL = 'http://localhost:3000';

class RocketChatClient {
  constructor({ baseUrl = DEFAULT_BASE_URL, httpClient } = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.http = httpClient || axios.create({ baseURL: this.baseUrl, timeout: 10000 });
    this.session = null;
  }

  async login(username, password) {
    validateCredentials(username, password);
    try {
      const response = await withRetry(() =>
        this.http.post('/api/v1/login', { user: username, password }),
      );
      const { data } = response;
      if (!data || data.status !== 'success' || !data.data) {
        throw new ApiError('unexpected login response', response.status, data);
      }
      this.session = {
        userId: data.data.userId,
        authToken: data.data.authToken,
      };
      return this.session;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async logout() {
    if (!this.session) {
      return { ok: true, alreadyLoggedOut: true };
    }
    const headers = buildAuthHeaders(this.session);
    try {
      await this.http.post('/api/v1/logout', {}, { headers });
      this.session = null;
      return { ok: true, alreadyLoggedOut: false };
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async createChannel(name) {
    validateChannelName(name);
    const headers = buildAuthHeaders(this.session);
    try {
      const response = await this.http.post(
        '/api/v1/channels.create',
        { name },
        { headers },
      );
      return response.data.channel;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async sendMessage(roomId, text) {
    validateMessage(roomId, text);
    const headers = buildAuthHeaders(this.session);
    try {
      const response = await withRetry(() =>
        this.http.post(
          '/api/v1/chat.sendMessage',
          { message: { rid: roomId, msg: text } },
          { headers },
        ),
      );
      return response.data.message;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  isAuthenticated() {
    return Boolean(this.session && this.session.authToken && this.session.userId);
  }
}

// Re-export so the single-entry import surface (used by tests) stays unchanged.
module.exports = {
  RocketChatClient,
  DEFAULT_BASE_URL,
  // errors
  ValidationError,
  ApiError,
  normalizeError,
  // validators
  validateCredentials,
  validateChannelName,
  validateMessage,
  buildAuthHeaders,
  CHANNEL_NAME_PATTERN,
  MAX_USERNAME_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_CHANNEL_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  // retry
  isRetryableStatus,
  withRetry,
};
