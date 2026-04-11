const axios = require('axios');

const BASE_URL = process.env.ROCKETCHAT_URL || 'http://localhost:3000';
const API = `${BASE_URL}/api/v1`;

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'AdminPass123!@#';

let authToken = '';
let userId = '';
let testChannelId = '';
const testChannelName = `edge-test-${Date.now()}`;

beforeAll(async () => {
  const loginRes = await axios.post(`${API}/login`, {
    user: ADMIN_USER,
    password: ADMIN_PASS,
  });
  authToken = loginRes.data.data.authToken;
  userId = loginRes.data.data.userId;

  const channelRes = await axios.post(
    `${API}/channels.create`,
    { name: testChannelName },
    { headers: authHeaders() }
  );
  testChannelId = channelRes.data.channel._id;
});

afterAll(async () => {
  try {
    await axios.post(
      `${API}/channels.delete`,
      { roomId: testChannelId },
      { headers: authHeaders() }
    );
  } catch (e) { /* ignore */ }
});

function authHeaders() {
  return { 'X-Auth-Token': authToken, 'X-User-Id': userId };
}

describe('Messaging — Edge Cases & Invalid Input', () => {

  // --- Edge Cases ---

  test('TC-MSG-EDGE-01: should handle sending empty message', async () => {
    try {
      const res = await axios.post(
        `${API}/chat.sendMessage`,
        { message: { rid: testChannelId, msg: '' } },
        { headers: authHeaders() }
      );
      // Some RC versions allow empty messages, some don't
      expect(res.status).toBe(200);
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC-MSG-EDGE-02: should handle sending message with special characters & unicode', async () => {
    const specialMsg = '🚀 <b>bold</b> & "quotes" \' ` ${{template}} \0 \n\t ñ 中文 العربية';
    const res = await axios.post(
      `${API}/chat.sendMessage`,
      { message: { rid: testChannelId, msg: specialMsg } },
      { headers: authHeaders() }
    );
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.message.msg).toBe(specialMsg);
  });

  test('TC-MSG-EDGE-03: should handle sending very large message (50KB)', async () => {
    const largeMsg = 'X'.repeat(50000);
    try {
      const res = await axios.post(
        `${API}/chat.sendMessage`,
        { message: { rid: testChannelId, msg: largeMsg } },
        { headers: authHeaders() }
      );
      expect(res.status).toBe(200);
      expect(res.data.message.msg).toBe(largeMsg);
    } catch (error) {
      // Server may reject oversized messages — that's valid behavior
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  // --- Failure Scenarios ---

  test('TC-MSG-FAIL-01: should reject sending message to non-existent room', async () => {
    try {
      await axios.post(
        `${API}/chat.sendMessage`,
        { message: { rid: 'nonexistentroom123', msg: 'test' } },
        { headers: authHeaders() }
      );
      fail('Expected error');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC-MSG-FAIL-02: should reject sending message without authentication', async () => {
    try {
      await axios.post(
        `${API}/chat.sendMessage`,
        { message: { rid: testChannelId, msg: 'unauthorized' } }
      );
      fail('Expected 401');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  test('TC-MSG-FAIL-03: should reject updating non-existent message', async () => {
    try {
      await axios.post(
        `${API}/chat.update`,
        { roomId: testChannelId, msgId: 'fakemsgid12345', text: 'updated' },
        { headers: authHeaders() }
      );
      fail('Expected error');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC-MSG-FAIL-04: should reject deleting non-existent message', async () => {
    try {
      await axios.post(
        `${API}/chat.delete`,
        { roomId: testChannelId, msgId: 'fakemsgid12345' },
        { headers: authHeaders() }
      );
      fail('Expected error');
    } catch (error) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });
});

describe('Messaging — Concurrency', () => {

  test('TC-MSG-CONC-01: should handle 10 simultaneous messages without data loss', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      axios.post(
        `${API}/chat.sendMessage`,
        { message: { rid: testChannelId, msg: `concurrent-msg-${i}` } },
        { headers: authHeaders() }
      )
    );

    const results = await Promise.all(promises);
    results.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });

    // Verify all messages are in history
    const history = await axios.get(`${API}/channels.history`, {
      headers: authHeaders(),
      params: { roomId: testChannelId, count: 50 },
    });

    const concurrentMsgs = history.data.messages.filter((m) =>
      m.msg.startsWith('concurrent-msg-')
    );
    expect(concurrentMsgs.length).toBe(10);
  });

  test('TC-MSG-CONC-02: should handle rapid send-then-delete without errors', async () => {
    // Send a message
    const sendRes = await axios.post(
      `${API}/chat.sendMessage`,
      { message: { rid: testChannelId, msg: 'rapid-delete-test' } },
      { headers: authHeaders() }
    );
    const msgId = sendRes.data.message._id;

    // Immediately delete it
    const delRes = await axios.post(
      `${API}/chat.delete`,
      { roomId: testChannelId, msgId },
      { headers: authHeaders() }
    );
    expect(delRes.status).toBe(200);

    // Verify it's gone
    const history = await axios.get(`${API}/channels.history`, {
      headers: authHeaders(),
      params: { roomId: testChannelId },
    });
    const found = history.data.messages.find((m) => m._id === msgId);
    expect(found).toBeUndefined();
  });
});
