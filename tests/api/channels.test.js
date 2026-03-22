const axios = require('axios');

const BASE_URL = process.env.ROCKETCHAT_URL || 'http://localhost:3000';
const API = `${BASE_URL}/api/v1`;

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'admin123';

let authToken = '';
let userId = '';
let testChannelId = '';
const testChannelName = `test-channel-${Date.now()}`;

beforeAll(async () => {
  const response = await axios.post(`${API}/login`, {
    user: ADMIN_USER,
    password: ADMIN_PASS,
  });
  authToken = response.data.data.authToken;
  userId = response.data.data.userId;
});

function authHeaders() {
  return {
    'X-Auth-Token': authToken,
    'X-User-Id': userId,
  };
}

describe('Channels API', () => {
  test('POST /channels.create - should create a public channel', async () => {
    const response = await axios.post(
      `${API}/channels.create`,
      { name: testChannelName },
      { headers: authHeaders() }
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.channel).toHaveProperty('_id');
    expect(response.data.channel.name).toBe(testChannelName);

    testChannelId = response.data.channel._id;
  });

  test('GET /channels.list - should return list of channels', async () => {
    const response = await axios.get(`${API}/channels.list`, {
      headers: authHeaders(),
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.channels)).toBe(true);
    expect(response.data.channels.length).toBeGreaterThan(0);

    const found = response.data.channels.find((ch) => ch._id === testChannelId);
    expect(found).toBeDefined();
  });

  test('POST /channels.info - should return channel details', async () => {
    const response = await axios.get(`${API}/channels.info`, {
      headers: authHeaders(),
      params: { roomId: testChannelId },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.channel.name).toBe(testChannelName);
    expect(response.data.channel.t).toBe('c'); // public channel type
  });

  test('POST /channels.delete - should delete the channel', async () => {
    const response = await axios.post(
      `${API}/channels.delete`,
      { roomId: testChannelId },
      { headers: authHeaders() }
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify channel no longer exists
    try {
      await axios.get(`${API}/channels.info`, {
        headers: authHeaders(),
        params: { roomId: testChannelId },
      });
      fail('Expected channel to be deleted');
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});
