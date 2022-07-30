import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import { requestClear } from './users.test';

import { requestAuthRegister } from './auth.test';

import { requestChannelsCreate } from './channels.test';

import { requestDMCreate } from './dm.test';

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

function requestMessageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { token, channelId, message });
}

function requestMessageEdit(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v2', { token, messageId, message });
}

function requestMessageRemove(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', { token, messageId });
}

function requestSendDm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', { token, dmId, message });
}

function requestRemoveOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v1', { token, channelId, uId });
}

function requestChannelJoinV2(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v2', { token, channelId });
}

function requestChannelAddownerV1(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v1', { token, channelId, uId });
}

// -------------------------------------------------------------------------//

/*
Generates a random string of length 1004

Arguments:
{}

Return Value:
  Returns { string }      - consists of letters
*/
function generateString() {
  const length = 1005;
  const set = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  let string = '';
  for (let i = 0; i < length; i++) {
    const rnum = Math.floor(Math.random() * set.length);
    string += set[rnum];
  }
  return string;
}

let testUser: any;
let testChannel: any;
let testDm: any;
let testMessage: any;
let nextUser: any;
let testDmMessage: any;

describe('messages capabilities', () => {
  describe('message/send/v1 test', () => {
    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');

      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail message send', () => {
      const testRequest = requestMessageSend(testUser.bodyObj.token + 'a', testChannel.bodyObj.channelId, 'a message');
      expect(testRequest).toBe(403);
    });

    test('channelId does not refer to valid channel, fail message send', () => {
      const testRequest = requestMessageSend(testUser.bodyObj.token, 9999, 'a message');
      expect(testRequest).toBe(400);
    });

    test('length of message is less than 1 character, fail message send', () => {
      const testRequest = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, '');
      expect(testRequest).toBe(400);
    });

    test('length of message is over 1000 characters, fail message send', () => {
      const longString = generateString();
      const testRequest = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, longString);
      expect(testRequest).toBe(400);
    });

    test('channelId is valid but authorised user not a member of channel, fail message send', () => {
      const testUser2 = requestAuthRegister('avalidemail@gmail.com', 'a123abc!@#', 'aJohn', 'aDoe');
      const testRequest = requestMessageSend(testUser2.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
      expect(testRequest).toBe(403);
    });

    test('successful message send', () => {
      const testRequest = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
      expect(testRequest).toStrictEqual({ messageId: expect.any(Number) });
    });
  });

  describe('message/edit/v1 test', () => {
    describe('channel related tests', () => {
      beforeEach(() => {
        requestClear();
        // Create a test user
        testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
        // Create a test channel
        testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);

        testMessage = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
      });

      afterEach(() => {
        requestClear();
      });

      test('invalid token, fail message edit', () => {
        const testRequest = requestMessageEdit(testUser.bodyObj.token + 'a', testMessage.messageId, 'a message');
        expect(testRequest).toBe(403);
      });

      test('message length over 1000 characters, fail message edit', () => {
        const longString = generateString();
        const testRequest = requestMessageEdit(testUser.bodyObj.token, testMessage.messageId, longString);
        expect(testRequest).toBe(400);
      });

      test('messageId not valid in channel that user has joined, fail message edit', () => {
        const testRequest = requestMessageEdit(testUser.bodyObj.token, 9999, 'message id not valid in channel that user has joined');
        expect(testRequest).toBe(400);
      });

      test('message not sent by auth user making this request, fail message edit', () => {
        const testUser2 = requestAuthRegister('vaalidemail@gmail.com', '12a3abc!@#', 'Johan', 'Daoe');
        const testRequest = requestMessageEdit(testUser2.bodyObj.token, testMessage.messageId, 'a message');
        expect(testRequest).toBe(403);
      });

      test('auth user does not have owner permissions in channel', () => {
        const addUser = requestAuthRegister('valiademail@gmail.com', '123abc!a@#', 'Joahn', 'Doea');
        requestChannelJoinV2(addUser.bodyObj.token, testChannel.bodyObj.channelId);
        requestChannelAddownerV1(testUser.bodyObj.token, testChannel.bodyObj.channelId, addUser.bodyObj.authUserId);
        const addtestMessage = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'added a message');
        requestRemoveOwner(testUser.bodyObj.token, testChannel.bodyObj.channelId, addUser.bodyObj.authUserId);
        const testRequest = requestMessageEdit(addUser.bodyObj.token, addtestMessage.messageId, 'testing auth user does not have owner permissions in channel');
        expect(testRequest).toBe(403);
      });

      test('message is empty string, message remove successful, successful channel message edit', () => {
        const testRequest = requestMessageEdit(testUser.bodyObj.token, testMessage.messageId, '');
        expect(testRequest).toStrictEqual({});
      });

      test('successful channel message edit', () => {
        const testRequest = requestMessageEdit(testUser.bodyObj.token, testMessage.messageId, 'an edited message');
        expect(testRequest).toStrictEqual({});
      });
    });
    describe('dm related tests', () => {
      beforeEach(() => {
        requestClear();
        // Create a test user
        testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
        nextUser = requestAuthRegister('student@unsw.com', 'password', 'Alice', 'Schmoe');
        // Create a test dm
        testDm = requestDMCreate(testUser.bodyObj.token, [nextUser.bodyObj.authUserId]);
        testDmMessage = requestSendDm(testUser.bodyObj.token, testDm.bodyObj.dmId, 'a message');
      });

      afterEach(() => {
        requestClear();
      });

      test('message not sent by auth user making this request, fail dmmessage edit', () => {
        const testRequest = requestMessageEdit(nextUser.token, testDmMessage.messageId, 'edit');
        expect(testRequest).toBe(403);
      });

      test('message is empty string, message remove successful, successful dm message edit', () => {
        const testRequest = requestMessageEdit(testUser.bodyObj.token, testDmMessage.messageId, '');
        expect(testRequest).toStrictEqual({});
      });

      test('successful dm message edit', () => {
        const testRequest = requestMessageEdit(testUser.bodyObj.token, testDmMessage.messageId, 'an edited message');
        expect(testRequest).toStrictEqual({});
      });
    });
  });

  describe('message/remove/v1 test', () => {
    describe('channel related tests', () => {
      beforeEach(() => {
        requestClear();
        // Create a test user
        testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');

        // Create a test channel
        testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);

        testMessage = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
      });

      afterEach(() => {
        requestClear();
      });

      test('invalid token, fail message remove', () => {
        const testRequest = requestMessageRemove(testUser.bodyObj.token + 'a', testMessage.messageId);
        expect(testRequest).toBe(403);
      });

      test('messageId not a valid message in channel/DM, fail message remove', () => {
        const testRequest = requestMessageRemove(testUser.bodyObj.token, 9999);
        expect(testRequest).toBe(400);
      });

      test('message was not sent by auth user making this request, fail message remove', () => {
        const diffUser = requestAuthRegister('avalidemail@gmail.com', 'a123abc!@#', 'aJohn', 'aDoe');
        const testRequest = requestMessageRemove(diffUser.bodyObj.token, testMessage.messageId);
        expect(testRequest).toBe(403);
      });

      test('auth user does not have owner permission in channel, fail message remove', () => {
        const addUser = requestAuthRegister('valiademail@gmail.com', '123abc!a@#', 'Joahn', 'Doea');
        requestChannelJoinV2(addUser.bodyObj.token, testChannel.bodyObj.channelId);
        requestChannelAddownerV1(testUser.bodyObj.token, testChannel.bodyObj.channelId, addUser.bodyObj.authUserId);
        const addtestMessage = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'added a message');
        requestRemoveOwner(testUser.bodyObj.token, testChannel.bodyObj.channelId, addUser.bodyObj.authUserId);
        const testRequest = requestMessageRemove(addUser.bodyObj.token, addtestMessage.messageId);
        expect(testRequest).toBe(403);
      });

      test('successful message remove', () => {
        const testRequest = requestMessageRemove(testUser.bodyObj.token, testMessage.messageId);
        expect(testRequest).toStrictEqual({});
      });
    });

    describe('dm related tests', () => {
      beforeEach(() => {
        requestClear();
        // Create a test user
        testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
        nextUser = requestAuthRegister('student@unsw.com', 'password', 'Alice', 'Schmoe');
        // Create a test dm
        testDm = requestDMCreate(testUser.bodyObj.token, [nextUser.bodyObj.authUserId]);
        testDmMessage = requestSendDm(testUser.bodyObj.token, testDm.bodyObj.dmId, 'a message');
      });

      afterEach(() => {
        requestClear();
      });

      test('message not sent by auth user making this request, fail dmmessage remove', () => {
        const testRequest = requestMessageRemove(nextUser.token, testDmMessage.messageId);
        expect(testRequest).toBe(403);
      });

      test('message is empty string, message remove successful, successful dm message remove', () => {
        const testRequest = requestMessageRemove(testUser.bodyObj.token, testDmMessage.messageId);
        expect(testRequest).toStrictEqual({});
      });

      test('successful dm message remove', () => {
        const testRequest = requestMessageRemove(testUser.bodyObj.token, testDmMessage.messageId);
        expect(testRequest).toStrictEqual({});
      });
    });
  });

  describe('message/senddm/v1 test', () => {
    let testUser2;

    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      // Create test user 2
      testUser2 = requestAuthRegister('student@unsw.com', 'password', 'Alice', 'Schmoe');
      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
      // Create a test dm
      testDm = requestDMCreate(testUser.bodyObj.token, [testUser2.bodyObj.authUserId]);
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail send dm', () => {
      const testRequest = requestSendDm(testUser.bodyObj.token + 'a', testDm.bodyObj.dmId, 'a message');
      expect(testRequest).toBe(403);
    });

    test('dmId does not refer to a valid dm, fail send dm', () => {
      const testRequest = requestSendDm(testUser.bodyObj.token, 9999, 'a message');
      expect(testRequest).toBe(400);
    });

    test('length of message is less than 1 character, fail send dm', () => {
      const testRequest = requestSendDm(testUser.bodyObj.token, testDm.bodyObj.dmId, '');
      expect(testRequest).toBe(400);
    });

    test('length of message is over 1000 characters, fail send dm', () => {
      const longString = generateString();
      const testRequest = requestSendDm(testUser.bodyObj.token, testDm.bodyObj.dmId, longString);
      expect(testRequest).toBe(400);
    });

    test('dmId valid but auth user is not a member of the dm, fail send dm', () => {
      const badUser = requestAuthRegister('astudent@unsw.com', 'apassword', 'aAlice', 'aSchmoe');
      const testRequest = requestSendDm(badUser.bodyObj.token, testDm.bodyObj.dmId, 'a message');
      expect(testRequest).toBe(403);
    });

    test('successful send dm', () => {
      const testRequest = requestSendDm(testUser.bodyObj.token, testDm.bodyObj.dmId, 'a message');
      expect(testRequest).toStrictEqual({ messageId: expect.any(Number) });
    });
  });
});

export { requestAuthRegister, requestChannelsCreate, requestMessageSend };
