const axios = require('axios');

const BASE_URL = process.env.ROCKETCHAT_URL || 'http://localhost:3000';
const API = `${BASE_URL}/api/v1`;

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'AdminPass123!@#';

let authToken = '';
let userId = '';
let testChannelId = '';
let testMessageId = '';
const testChannelName = `msg-test-${Date.now()}`;

beforeAll(async () => {
  // Login
  const loginRes = await axios.post(`${API}/login`, {
    user: ADMIN_USER,
    password: ADMIN_PASS,
  });
  authToken = loginRes.data.data.authToken;
  userId = loginRes.data.data.userId;

  // Create a test channel
  const channelRes = await axios.post(
    `${API}/channels.create`,
    { name: testChannelName },
    { headers: authHeaders() }
  );
  testChannelId = channelRes.data.channel._id;
});

afterAll(async () => {
  // Cleanup: delete test channel
  try {
    await axios.post(
      `${API}/channels.delete`,
      { roomId: testChannelId },
      { headers: authHeaders() }
    );
  } catch (e) {
    // Ignore cleanup errors
  }
});

function authHeaders() {
  return {
    'X-Auth-Token': authToken,
    'X-User-Id': userId,
  };
}

describe('Messaging API', () => {
  test('POST /chat.sendMessage - should send a message to a channel', async () => {
    const response = await axios.post(
      `${API}/chat.sendMessage`,
      {
        message: {
          rid: testChannelId,
          msg: 'Hello from QA test suite!',
        },
      },
      { headers: authHeaders() }
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toHaveProperty('_id');
    expect(response.data.message.msg).toBe('Hello from QA test suite!');
    expect(response.data.message.rid).toBe(testChannelId);

    testMessageId = response.data.message._id;
  });

  test('GET /channels.history - should retrieve message history', async () => {
    const response = await axios.get(`${API}/channels.history`, {
      headers: authHeaders(),
      params: { roomId: testChannelId },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.messages)).toBe(true);

    const found = response.data.messages.find((m) => m._id === testMessageId);
    expect(found).toBeDefined();
    expect(found.msg).toBe('Hello from QA test suite!');
  });

  test('POST /chat.update - should edit an existing message', async () => {
    const response = await axios.post(
      `${API}/chat.update`,
      {
        roomId: testChannelId,
        msgId: testMessageId,
        text: 'Updated message from QA test suite!',
      },
      { headers: authHeaders() }
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message.msg).toBe('Updated message from QA test suite!');
    expect(response.data.message._id).toBe(testMessageId);
  });

  test('POST /chat.delete - should delete a message', async () => {
    const response = await axios.post(
      `${API}/chat.delete`,
      {
        roomId: testChannelId,
        msgId: testMessageId,
      },
      { headers: authHeaders() }
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify message is no longer in history
    const historyRes = await axios.get(`${API}/channels.history`, {
      headers: authHeaders(),
      params: { roomId: testChannelId },
    });

    const found = historyRes.data.messages.find((m) => m._id === testMessageId);
    expect(found).toBeUndefined();
  });
});
