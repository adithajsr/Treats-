import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import { requestAuthRegister } from './auth.test';
import { requestChannelsCreate } from './channels.test';
import { requestClear } from './users.test';
import { generateString } from './message.test';

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

describe('standup capabilities', () => {
  describe('standup/start/v1 test', () => {
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

    test('active standup currently running in channel, fail standup start', () => {
    });

    test('channelId valid but auth user is not a member of the channel, fail standup start', () => {
      const testRequest = requestStandupStart(badUser.bodyObj.token, testChannel.bodyObj.channelId, 3);
      expect(testRequest).toBe(403);
    });

    test('successful standup start', () => {
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

    test('successful standup active', () => {
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
      const testRequest = requestStandupSend(badUser.bodyObj.token, testChannel.bodyObj.channelId, longString);
      expect(testRequest).toBe(403);
    });

    test('active standup currently not running in channel, fail standup send', () => {
    });

    test('successful standup send', () => {
    });
  });
});