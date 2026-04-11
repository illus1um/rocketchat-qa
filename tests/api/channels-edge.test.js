const axios = require('axios');

const BASE_URL = process.env.ROCKETCHAT_URL || 'http://localhost:3000';
const API = `${BASE_URL}/api/v1`;

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'AdminPass123!@#';

let authToken = '';
let userId = '';

beforeAll(async () => {
  const res = await axios.post(`${API}/login`, {
    user: ADMIN_USER,
    password: ADMIN_PASS,
  });
  authToken = res.data.data.authToken;
  userId = res.data.data.userId;
});

function authHeaders() {
  return { 'X-Auth-Token': authToken, 'X-User-Id': userId };
}

describe('Channels — Edge Cases & Failure Scenarios', () => {

  // --- Edge Cases ---

  test('TC-CHAN-EDGE-01: should reject creating channel with special characters in name', async () => {
    try {
      await axios.post(
        `${API}/channels.create`,
        { name: 'test channel!@#$%' },
        { headers: authHeaders() }
      );
      fail('Expected error for invalid channel name');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC-CHAN-EDGE-02: should reject creating channel with empty name', async () => {
    try {
      await axios.post(
        `${API}/channels.create`,
        { name: '' },
        { headers: authHeaders() }
      );
      fail('Expected error for empty name');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC-CHAN-EDGE-03: should reject creating duplicate channel', async () => {
    const name = `dup-test-${Date.now()}`;

    // Create first
    const res = await axios.post(
      `${API}/channels.create`,
      { name },
      { headers: authHeaders() }
    );
    expect(res.data.success).toBe(true);
    const channelId = res.data.channel._id;

    // Try creating duplicate
    try {
      await axios.post(
        `${API}/channels.create`,
        { name },
        { headers: authHeaders() }
      );
      fail('Expected error for duplicate channel');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }

    // Cleanup
    await axios.post(`${API}/channels.delete`, { roomId: channelId }, { headers: authHeaders() });
  });

  // --- Failure Scenarios ---

  test('TC-CHAN-FAIL-01: should reject creating channel without authentication', async () => {
    try {
      await axios.post(`${API}/channels.create`, { name: 'unauth-channel' });
      fail('Expected 401');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  test('TC-CHAN-FAIL-02: should return error for non-existent channel info', async () => {
    try {
      await axios.get(`${API}/channels.info`, {
        headers: authHeaders(),
        params: { roomId: 'nonexistentchannelid123' },
      });
      fail('Expected error');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC-CHAN-FAIL-03: should reject deleting already deleted channel', async () => {
    const name = `del-twice-${Date.now()}`;
    const res = await axios.post(
      `${API}/channels.create`,
      { name },
      { headers: authHeaders() }
    );
    const channelId = res.data.channel._id;

    // Delete once
    await axios.post(`${API}/channels.delete`, { roomId: channelId }, { headers: authHeaders() });

    // Delete again
    try {
      await axios.post(`${API}/channels.delete`, { roomId: channelId }, { headers: authHeaders() });
      fail('Expected error for already deleted channel');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  // --- Concurrency ---

  test('TC-CHAN-CONC-01: should handle 5 simultaneous channel creations', async () => {
    const names = Array.from({ length: 5 }, (_, i) => `conc-chan-${Date.now()}-${i}`);
    const promises = names.map((name) =>
      axios.post(`${API}/channels.create`, { name }, { headers: authHeaders() })
    );

    const results = await Promise.all(promises);
    const ids = [];
    results.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      ids.push(res.data.channel._id);
    });

    // Cleanup
    await Promise.all(
      ids.map((id) =>
        axios.post(`${API}/channels.delete`, { roomId: id }, { headers: authHeaders() })
      )
    );
  });
});
