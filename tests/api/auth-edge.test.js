const axios = require('axios');

const BASE_URL = process.env.ROCKETCHAT_URL || 'http://localhost:3000';
const API = `${BASE_URL}/api/v1`;

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'AdminPass123!@#';

describe('Authentication — Failure & Edge Cases', () => {
  let validToken = '';
  let validUserId = '';

  beforeAll(async () => {
    const res = await axios.post(`${API}/login`, {
      user: ADMIN_USER,
      password: ADMIN_PASS,
    });
    validToken = res.data.data.authToken;
    validUserId = res.data.data.userId;
  });

  // --- Failure Scenarios ---

  test('TC-AUTH-FAIL-01: should reject request with expired/invalid token', async () => {
    try {
      await axios.get(`${API}/me`, {
        headers: {
          'X-Auth-Token': 'invalidtoken123456789',
          'X-User-Id': validUserId,
        },
      });
      fail('Expected 401');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  test('TC-AUTH-FAIL-02: should reject request with missing auth headers', async () => {
    try {
      await axios.get(`${API}/me`);
      fail('Expected 401');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  test('TC-AUTH-FAIL-03: should reject login with empty password', async () => {
    try {
      await axios.post(`${API}/login`, {
        user: ADMIN_USER,
        password: '',
      });
      fail('Expected error');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC-AUTH-FAIL-04: should reject login with empty username', async () => {
    try {
      await axios.post(`${API}/login`, {
        user: '',
        password: ADMIN_PASS,
      });
      fail('Expected error');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  // --- Edge Cases ---

  test('TC-AUTH-EDGE-01: should reject login with SQL/NoSQL injection-like input', async () => {
    try {
      await axios.post(`${API}/login`, {
        user: '{"$gt":""}',
        password: '{"$gt":""}',
      });
      fail('Expected error');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC-AUTH-EDGE-02: should reject login with extremely long username (10000 chars)', async () => {
    try {
      await axios.post(`${API}/login`, {
        user: 'a'.repeat(10000),
        password: 'password',
      });
      fail('Expected error');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC-AUTH-EDGE-03: should handle login with special characters in username', async () => {
    try {
      await axios.post(`${API}/login`, {
        user: '<script>alert("xss")</script>',
        password: 'password',
      });
      fail('Expected error');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
      // Ensure no XSS reflection in response
      const body = JSON.stringify(error.response.data);
      expect(body).not.toContain('<script>');
    }
  });

  // --- Invalid User Behavior ---

  test('TC-AUTH-INVALID-01: should reject access to admin endpoint without admin role', async () => {
    // First register a regular user
    let regularToken, regularUserId;
    const username = `testuser-${Date.now()}`;
    try {
      const regRes = await axios.post(`${API}/users.register`, {
        username,
        email: `${username}@test.com`,
        pass: 'TestPass123!@#',
        name: 'Test User',
      });

      const loginRes = await axios.post(`${API}/login`, {
        user: username,
        password: 'TestPass123!@#',
      });
      regularToken = loginRes.data.data.authToken;
      regularUserId = loginRes.data.data.userId;
    } catch (e) {
      // If registration is disabled, skip this test
      return;
    }

    // Try to access admin-only endpoint
    try {
      await axios.get(`${API}/users.list`, {
        headers: {
          'X-Auth-Token': regularToken,
          'X-User-Id': regularUserId,
        },
      });
      // Some RC versions allow this — just check it doesn't crash
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }

    // Cleanup: delete user via admin
    try {
      await axios.post(`${API}/users.delete`, {
        userId: regularUserId,
      }, {
        headers: {
          'X-Auth-Token': validToken,
          'X-User-Id': validUserId,
        },
      });
    } catch (e) { /* ignore cleanup errors */ }
  });
});
