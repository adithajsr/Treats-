import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import { requestAuthRegister } from './auth.test';
import { requestChannelsCreate } from './channels.test';
import { requestChannelMessages } from './channel.test'
import { requestClear } from './users.test';
import { requestChannelJoinV2, generateString } from './message.test';

const port = config.port;
const url = config.url;

// -------------------------------------------------------------------------//

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  let res;
  if (method === 'GET' || method === 'DELETE') {
    qs = payload;
    res = request(method, `${url}:${port}` + path, { qs });
  } else {
    json = payload;
    res = request(method, `${url}:${port}` + path, { json });
  }
  if (res.statusCode === 400 || res.statusCode === 403) {
    return res.statusCode;
  }
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
}

// -------------------------------------------------------------------------//

function requestStandupStart(token: string, channelId: number, length: number) {
  return requestHelper('POST', '/standup/start/v1', { token, channelId, length });
}

function requestStandupActive(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { token, channelId });
}

function requestStandupSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', { token, channelId, message });
}

// -------------------------------------------------------------------------//
let testUser: any;
let badUser: any;
let testChannel: any;
let testStandup: any;
let timeNow: any;
let timeFinish: any;

// handle for testUser is johndoe0

describe('standup capabilities', () => {
  describe('standup/start/v1 test', () => {
    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      badUser = requestAuthRegister('validemail@gmail.coma', '123aabc!@#', 'Jane', 'Doe');
      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail standup start', () => {
      const testRequest = requestStandupStart(testUser.bodyObj.token + 'a', testChannel.bodyObj.channelId, 3);
      expect(testRequest).toBe(403);
    });

    test('channelId does not refer to a valid channel, fail standup start', () => {
      const testRequest = requestStandupStart(testUser.bodyObj.token, 9999, 3);
      expect(testRequest).toBe(400);
    });

    test('length is a negative integer, fail standup start', () => {
      const testRequest = requestStandupStart(testUser.bodyObj.token, testChannel.bodyObj.channelId, -3);
      expect(testRequest).toBe(400);
    });

    test('channelId valid but auth user is not a member of the channel, fail standup start', () => {
      const testRequest = requestStandupStart(badUser.bodyObj.token, testChannel.bodyObj.channelId, 3);
      expect(testRequest).toBe(403);
    });

    test('successful standup start', () => {
      timeNow = Math.floor((new Date()).getTime() / 1000);
      timeFinish = timeNow + 3;
      const testRequest = requestStandupStart(testUser.bodyObj.token, testChannel.bodyObj.channelId, 3);
      // expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(testRequest).toStrictEqual({ timeFinish: timeFinish});
    });

    test('active standup currently running in channel, fail standup start', () => {
      timeNow = Math.floor((new Date()).getTime() / 1000);
      timeFinish = timeNow + 3;
      const testRequest = requestStandupStart(testUser.bodyObj.token, testChannel.bodyObj.channelId, 6);
      expect(testRequest).toStrictEqual({ timeFinish: timeFinish});
      const badRequest = requestStandupStart(testUser.bodyObj.token, testChannel.bodyObj.channelId, 3);
      expect(badRequest).toBe(400);
      // expect(setTimeout).toHaveBeenCalledTimes(1);
    });
  
  });

  describe('standup/active/v1 test', () => {
    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      badUser = requestAuthRegister('validemail@gmail.coma', '123aabc!@#', 'aJohn', 'aDoe');
      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail standup active', () => {
      const testRequest = requestStandupActive(testUser.bodyObj.token + 'a', testChannel.bodyObj.channelId);
      expect(testRequest).toBe(403);
    });

    test('channelId does not refer to a valid channel, fail standup active', () => {
      const testRequest = requestStandupActive(testUser.bodyObj.token, 9999);
      expect(testRequest).toBe(400);
    });

    test('channelId valid but auth user is not a member of the channel, fail standup active', () => {
      const testRequest = requestStandupActive(badUser.bodyObj.token, testChannel.bodyObj.channelId);
      expect(testRequest).toBe(403);
    });

    test('successful standup active - standup not in progress', () => {
      const testRequest = requestStandupActive(testUser.bodyObj.token, testChannel.bodyObj.channelId);
      expect(testRequest).toStrictEqual({
        isActive: false,
        timeFinish: null
      });
    });

    test('successful standup active - standup in progress', () => {
      timeNow = Math.floor((new Date()).getTime() / 1000);
      timeFinish = timeNow + 3;
      const testStandup = requestStandupStart(testUser.bodyObj.token, testChannel.bodyObj.channelId, 6);
      // expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(testStandup).toStrictEqual({ timeFinish: timeFinish});
      const testRequest = requestStandupActive(testUser.bodyObj.token, testChannel.bodyObj.channelId);
      expect(testRequest).toStrictEqual({ 
        isActive: true,
        timeFinish: timeFinish
      });
    });
  
  });

  describe('standup/send/v1 test', () => {
    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      badUser = requestAuthRegister('validemail@gmail.coma', '123aabc!@#', 'aJohn', 'aDoe');
      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail standup send', () => {
      const testRequest = requestStandupSend(testUser.bodyObj.token + 'a', testChannel.bodyObj.channelId, 'valid message');
      expect(testRequest).toBe(403);
    });

    test('channelId does not refer to a valid channel, fail standup send', () => {
      const testRequest = requestStandupSend(testUser.bodyObj.token, 9999, 'valid message');
      expect(testRequest).toBe(400);
    });

    test('length of message is over 1000 characters, fail standup send', () => {
      const longString = generateString();
      const testRequest = requestStandupSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, longString);
      expect(testRequest).toBe(403);
    });

    test('active standup currently not running in channel, fail standup send', () => {
      const testRequest = requestStandupSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'single successful standup send');
      expect(testRequest).toBe(400);
    });

    test('successful standup send none', () => {
      // check standup
      timeNow = Math.floor((new Date()).getTime() / 1000);
      timeFinish = timeNow + 3;
      const testStandup = requestStandupStart(testUser.bodyObj.token, testChannel.bodyObj.channelId, 3);
      // check standup active
      const testActive = requestStandupActive(testUser.bodyObj.token, testChannel.bodyObj.channelId);
      expect(testActive).toStrictEqual({ 
        isActive: true,
        timeFinish: timeFinish
      });
      const checkSent = requestChannelMessages(testUser.bodyObj.token, testChannel.bodyObj.channelId, 0);
      expect(checkSent.bodyObj.messages).toStrictEqual([]);
    });

    test('successful standup send single', () => {
      // check standup
      timeNow = Math.floor((new Date()).getTime() / 1000);
      timeFinish = timeNow + 3;

      const testStandup = requestStandupStart(testUser.bodyObj.token, testChannel.bodyObj.channelId, 3);
      // standup send check
      const testRequest = requestStandupSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'single successful standup send');
      expect(testRequest).toStrictEqual({});
      setTimeout(() => {
        const checkSent = requestChannelMessages(testUser.bodyObj.token, testChannel.bodyObj.channelId, 0);
        expect(checkSent.bodyObj.messages).toStrictEqual(['johndoe0: single successful standup send']);
      }, 4000)
      jest.useFakeTimers()
      jest.advanceTimersByTime(10000)
    });

    test('successful standup send multiple', () => {
      // check standup
      timeNow = Math.floor((new Date()).getTime() / 1000);
      timeFinish = timeNow + 3;

      const testStandup = requestStandupStart(testUser.bodyObj.token, testChannel.bodyObj.channelId, 3);
      // standup send check
      requestChannelJoinV2(badUser.bodyObj.token, testChannel.bodyObj.channelId)
      requestStandupSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'testUser string');
      requestStandupSend(badUser.bodyObj.token, testChannel.bodyObj.channelId, 'badUser string');
      // expect for standup messages to be there
      const testRequest = requestStandupSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'testUser successful standup send');
      expect(testRequest).toStrictEqual({});
      const testRequest2 = requestStandupSend(badUser.bodyObj.token, testChannel.bodyObj.channelId, 'badUser successful standup send');
      expect(testRequest2).toStrictEqual({});

      setTimeout(() => {
        const checkSent = requestChannelMessages(testUser.bodyObj.token, testChannel.bodyObj.channelId, 0);
        expect(checkSent.bodyObj.messages).toStrictEqual([
          'johndoe0: testUser successful standup send' + '\n' +
          'janedoe0: badUser successful standup send'
        ]);
      }, 6000)
      jest.useFakeTimers()
      jest.advanceTimersByTime(10000)

      // expect(setTimeout).toHaveBeenCalledTimes(2);
    });
  });
});