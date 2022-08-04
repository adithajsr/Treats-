import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import { requestChannelMessages } from './channel.test';
import { requestClear } from './users.test';
import { generateString } from './message.test';

const port = config.port;
const url = config.url;

// -------------------------------------------------------------------------//

type payloadObj = {
  token?: string;
  channelId?: number;
  length?: number;
  message?: string;
};

type id = {
  token: string,
  authUserId: number,
}

// ======================================== Setup ========================================
let channel1:number;
let channel2:number;
let channel3:number;
let admin:id;
let user1:id;
let user2:id;
let user3:id;
// ======================================== Helper functions ========================================

export function setupDatabase() {
  let reg = { email: 'who.is.john@is.the.question.com', password: '12367dhd', nameFirst: 'Nathan', nameLast: 'Spencer' };

  reg = { email: 'who.is.joe@is.the.question.com', password: 'yourmumma', nameFirst: 'John', nameLast: 'Hancock' };
  admin = sendPost('auth/register/v3', 'a', reg);

  reg = { email: 'who.is.zac@is.the.question.com', password: 'zaccool', nameFirst: 'Zac', nameLast: 'Li' };
  user1 = sendPost('auth/register/v3', 'a', reg);

  reg = { email: 'who.is.nick@is.the.question.com', password: 'yeyyey', nameFirst: 'Nick', nameLast: 'Smith' };
  user2 = sendPost('auth/register/v3', 'a', reg);

  reg = { email: 'who.is.yet@is.the.question.com', password: 'nicolea', nameFirst: 'Nicole', nameLast: 'pi' };
  user3 = sendPost('auth/register/v3', 'a', reg);

  channel1 = sendPost('channels/create/v3', admin.token, { name: 'Channel1', isPublic: true }).channelId;
  channel2 = sendPost('channels/create/v3', admin.token, { name: 'Channel2', isPublic: true }).channelId;
  channel3 = sendPost('channels/create/v3', admin.token, { name: 'Channel3', isPublic: false }).channelId; // channel3 is private

  // Add users to respective channels having admin as the owner.
  let body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
  sendPost('channel/invite/v3', admin.token, body);

  body = { token: admin.token, channelId: channel2, uId: user2.authUserId };
  sendPost('channel/invite/v3', admin.token, body);

  body = { token: admin.token, channelId: channel3, uId: user3.authUserId };
  sendPost('channel/invite/v3', admin.token, body);
}

export function sendPost(path:string, token:string, body: object) {
  const res = request(
    'POST',
      `${url}:${port}/${path}`,
      {
        json: body,
        headers: { token: token }
      }
  );

  if (res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 404 || res.statusCode === 500) {
    return res.statusCode;
  } else {
    return JSON.parse(res.getBody() as string);
  }
}

function requestHelper(method: HttpVerb, path: string, payload: payloadObj) {
  let qs = {};
  let json = {};
  let headers = {};

  // Check if token key exists in payload
  if (payload.token !== undefined) {
    headers = { token: payload.token };
    delete payload.token;
  }

  let res;
  if (method === 'GET' || method === 'DELETE') {
    qs = payload;
    res = request(method, `${url}:${port}` + path, { qs, headers });
  } else {
    json = payload;
    res = request(method, `${url}:${port}` + path, { json, headers });
  }
  if (res.statusCode === 400 || res.statusCode === 403) {
    return res.statusCode;
  }
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
}

// -------------------------------------------------------------------------//

function requestStandupActive(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { token, channelId });
}

function requestStandupSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', { token, channelId, message });
}

// -------------------------------------------------------------------------//

describe('standup capabilities', () => {
  describe('standup/start/v1 test', () => {
    beforeEach(() => {
      requestClear();
      setupDatabase();
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail standup start', () => {
      const body = { channelId: channel1, length: 2 };
      expect(sendPost('standup/start/v1', '99999', body)).toBe(403);
    });

    test('channelId does not refer to a valid channel, fail standup start', () => {
      const body = { channelId: 99999, length: 2 };
      expect(sendPost('standup/start/v1', user1.token, body)).toBe(400);
    });

    test('length is a negative integer, fail standup start', () => {
      const body = { channelId: channel1, length: -3 };
      expect(sendPost('standup/start/v1', user1.token, body)).toBe(400);
    });

    test('channelId valid but auth user is not a member of the channel, fail standup start', () => {
      const body = { channelId: channel1, length: 3 };
      expect(sendPost('standup/start/v1', user2.token, body)).toBe(403);
    });

    test('successful standup start', () => {
      const body = { channelId: channel1, length: 3 };
      expect(sendPost('standup/start/v1', user1.token, body)).toStrictEqual({ timeFinish: expect.any(Number) });
    });

    test('active standup currently running in channel, fail standup start', () => {
      const body = { channelId: channel1, length: 3 };
      expect(sendPost('standup/start/v1', user1.token, body)).toStrictEqual({ timeFinish: expect.any(Number) });
      const abody = { channelId: channel1, length: 3 };
      expect(sendPost('standup/start/v1', user1.token, abody)).toBe(400);
    });
  });

  describe('standup/active/v1 test', () => {
    beforeEach(() => {
      requestClear();
      setupDatabase();
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail standup active', () => {
      const testRequest = requestStandupActive(user1.token + 'a', channel1);
      expect(testRequest).toBe(403);
    });

    test('channelId does not refer to a valid channel, fail standup active', () => {
      const testRequest = requestStandupActive(user1.token, 9999);
      expect(testRequest).toBe(400);
    });

    test('channelId valid but auth user is not a member of the channel, fail standup active', () => {
      const testRequest = requestStandupActive(user2.token, channel1);
      expect(testRequest).toBe(403);
    });

    test('successful standup active - standup not in progress', () => {
      const testRequest = requestStandupActive(user1.token, channel1);
      expect(testRequest).toStrictEqual({
        isActive: false,
        timeFinish: null
      });
    });

    test('successful standup active - standup in progress', () => {
      const body = { channelId: channel1, length: 3 };
      expect(sendPost('standup/start/v1', user1.token, body)).toStrictEqual({ timeFinish: expect.any(Number) });
      const testRequest = requestStandupActive(user1.token, channel1);
      expect(testRequest).toStrictEqual({
        isActive: true,
        timeFinish: expect.any(Number)
      });
    });
  });

  describe('standup/send/v1 test', () => {
    beforeEach(() => {
      requestClear();
      setupDatabase();
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail standup send', () => {
      const testRequest = requestStandupSend(user1.token + 'a', channel1, 'valid message');
      expect(testRequest).toBe(403);
    });

    test('channelId does not refer to a valid channel, fail standup send', () => {
      const testRequest = requestStandupSend(user1.token, 9999, 'valid message');
      expect(testRequest).toBe(400);
    });

    test('length of message is over 1000 characters, fail standup send', () => {
      const longString = generateString();
      const testRequest = requestStandupSend(user1.token, channel1, longString);
      expect(testRequest).toBe(403);
    });

    test('active standup currently not running in channel, fail standup send', () => {
      const testRequest = requestStandupSend(user1.token, channel1, 'single successful standup send');
      expect(testRequest).toBe(400);
    });

    test('successful standup send none', async () => {
      const body = { channelId: channel1, length: 1 };
      expect(sendPost('standup/start/v1', user1.token, body)).toStrictEqual({ timeFinish: expect.any(Number) });
      await new Promise((r) => setTimeout(r, 1000));
      const checkSent = requestChannelMessages(user1.token, channel1, 0);
      expect(checkSent.bodyObj.messages).toStrictEqual([]);
    });

    test('successful standup send single', async () => {
      const body = { channelId: channel1, length: 2 };
      expect(sendPost('standup/start/v1', user1.token, body)).toStrictEqual({ timeFinish: expect.any(Number) });

      const dbody = { channelId: channel1, message: 'single successful standup send' };
      expect(sendPost('standup/send/v1', user1.token, dbody)).toStrictEqual({});

      await new Promise((r) => setTimeout(r, 3000));
      const checkSent = requestChannelMessages(user1.token, channel1, 0);
      expect(checkSent.bodyObj.messages[0].message).toStrictEqual('zacli: single successful standup send');
    });

    test('successful standup send multiple', async () => {
      const ubody = { channelId: channel1 };
      sendPost('channel/join/v3', user2.token, ubody);

      const body = { channelId: channel1, length: 2 };
      expect(sendPost('standup/start/v1', user1.token, body)).toStrictEqual({ timeFinish: expect.any(Number) });

      const dbody = { channelId: channel1, message: 'single successful standup send' };
      expect(sendPost('standup/send/v1', user1.token, dbody)).toStrictEqual({});

      const abody = { channelId: channel1, message: 'single successful standup send' };
      expect(sendPost('standup/send/v1', user2.token, abody)).toStrictEqual({});

      await new Promise((r) => setTimeout(r, 3000));
      const checkSent = requestChannelMessages(user1.token, channel1, 0);
      expect(checkSent.bodyObj.messages[0].message).toStrictEqual(
        'zacli: single successful standup send' + '\n' +
        'nicksmith: single successful standup send'
      );
    });
  });
});
