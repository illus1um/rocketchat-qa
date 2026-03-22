const axios = require('axios');

const BASE_URL = process.env.ROCKETCHAT_URL || 'http://localhost:3000';
const API = `${BASE_URL}/api/v1`;

// Admin credentials (set during Rocket.Chat setup wizard)
const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'admin123';

let authToken = '';
let userId = '';

describe('Authentication API', () => {
  test('POST /login - should authenticate with valid credentials', async () => {
    const response = await axios.post(`${API}/login`, {
      user: ADMIN_USER,
      password: ADMIN_PASS,
    });

    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.data).toHaveProperty('authToken');
    expect(response.data.data).toHaveProperty('userId');

    // Store for subsequent tests
    authToken = response.data.data.authToken;
    userId = response.data.data.userId;
  });

  test('POST /login - should reject invalid password', async () => {
    try {
      await axios.post(`${API}/login`, {
        user: ADMIN_USER,
        password: 'wrongpassword',
      });
      fail('Expected request to fail');
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.status).toBe('error');
    }
  });

  test('POST /login - should reject non-existent user', async () => {
    try {
      await axios.post(`${API}/login`, {
        user: 'nonexistentuser12345',
        password: 'anypassword',
      });
      fail('Expected request to fail');
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.status).toBe('error');
    }
  });

  test('GET /me - should return current user info with valid token', async () => {
    const response = await axios.get(`${API}/me`, {
      headers: {
        'X-Auth-Token': authToken,
        'X-User-Id': userId,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('username', ADMIN_USER);
    expect(response.data).toHaveProperty('_id', userId);
    expect(response.data).toHaveProperty('active', true);
  });

  test('POST /logout - should invalidate the session', async () => {
    const response = await axios.post(
      `${API}/logout`,
      {},
      {
        headers: {
          'X-Auth-Token': authToken,
          'X-User-Id': userId,
        },
      }
    );

    expect(response.status).toBe(200);
    // Rocket.Chat 8 may return an empty body on successful logout.
    if (response.data && typeof response.data === 'object' && 'status' in response.data) {
      expect(response.data.status).toBe('success');
    }

    // Verify token is no longer valid
    try {
      await axios.get(`${API}/me`, {
        headers: {
          'X-Auth-Token': authToken,
          'X-User-Id': userId,
        },
      });
      fail('Expected request to fail after logout');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });
});
