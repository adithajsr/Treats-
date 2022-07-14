import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
      json: { email, password, nameFirst, nameLast },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
      json: { token, name, isPublic },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestSendDm(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/senddm/v1`,
    {
      json: { token, dmId, message },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestDMCreate(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v1`,
    {
      json: { token, uIds },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.getBody())),
  };
}

function requestClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {
      qs: {},
    }
  );
  return JSON.parse(String(res.getBody()));
}

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

type wrapperOutput = {
  res: any,
  bodyObj: any,
};

let testUser: wrapperOutput;
let testChannel: wrapperOutput;
let testDm: wrapperOutput;

describe('messages capabilities', () => {
  /*
  describe('message/send/v1 test', () => {
    beforeEach(() => {
      // requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
      expect(testChannel.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    // afterEach(() => {
    //   requestClear();
    // });

    test('invalid token, fail message send', () => {
      const testRequest = requestMessageSend(testUser.bodyObj.token + 'a', testChannel.bodyObj.channelId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('channelId does not refer to valid channel, fail message send', () => {
      const testRequest = requestMessageSend(testUser.bodyObj.token, 9999, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('length of message is less than 1 character, fail message send', () => {
      const testRequest = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, '');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('length of message is over 1000 characters, fail message send', () => {
      const longString = generateString();
      const testRequest = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, longString);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('channelId is valid but authorised user not a member of channel, fail message send', () => {
      const testUser2 = requestAuthRegister('avalidemail@gmail.com', 'a123abc!@#', 'aJohn', 'aDoe');
      const testRequest = requestMessageSend(testUser2.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('successful message send', () => {
      const testRequest = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ messageId: expect.any(Number) });
    });
  });

  describe('message/edit/v1 test', () => {
    beforeEach(() => {
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
      expect(testChannel.bodyObj).not.toStrictEqual({ error: 'error' });

      testMessage = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
    });

    // afterEach(() => {
    //   requestClear();
    // });

    test('invalid token, fail message edit', () => {
      const testRequest = requestMessageEdit(testUser.bodyObj.token + 'a', testMessage.bodyObj.messageId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('message length over 1000 characters, fail message edit', () => {
      const longString = generateString();
      const testRequest = requestMessageEdit(testUser.bodyObj.token, testMessage.bodyObj.messageId, longString);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('messageId not valid in channel/DM that user has joined, fail message edit', () => {
      const testRequest = requestMessageEdit(testUser.bodyObj.token, 9999, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('message not sent by auth user making this request, fail message edit', () => {
      const testRequest = requestMessageEdit('9999', testMessage.bodyObj.messageId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('auth user does not have owner permissions in channel/dm', () => {
      requestRemoveOwner(testUser.bodyObj.token, testChannel.bodyObj.channelId, testUser.bodyObj.authUserId);
      const testRequest = requestMessageEdit(testUser.bodyObj.token, testMessage.bodyObj.messageId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('message is empty string, message remove successful, successful message edit', () => {
      const testRequest = requestMessageEdit(testUser.bodyObj.token, testMessage.bodyObj.messageId, '');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ });
    });

    test('successful message edit', () => {
      const testRequest = requestMessageEdit(testUser.bodyObj.token, testMessage.bodyObj.messageId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ });
    });
  });

  describe('message/remove/v1 test', () => {
    beforeEach(() => {
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
      expect(testChannel.bodyObj).not.toStrictEqual({ error: 'error' });

      testMessage = requestMessageSend('tokenstring', 999, 'a message');
    });

    // afterEach(() => {
    //   requestClear();
    // });

    test('invalid token, fail message remove', () => {
      const testRequest = requestMessageRemove(testUser.bodyObj.token + 'a', testMessage.bodyObj.messageId);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('messageId not a valid message in channel/DM, fail message remove', () => {
      const testRequest = requestMessageRemove(testUser.bodyObj.token, 9999);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('message was not sent by auth user making this request, fail message remove', () => {
      const diffUser = requestAuthRegister('avalidemail@gmail.com', 'a123abc!@#', 'aJohn', 'aDoe');
      const testRequest = requestMessageRemove(diffUser.bodyObj.token, testMessage.bodyObj.messageId);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('auth user does not have owner permission in channel/dm, fail message remove', () => {
      // requestRemoveOwner(testUser.bodyObj.token, testChannel.bodyObj.channelId, testUser.bodyObj.authUserId);
      const testRequest = requestMessageRemove(testUser.bodyObj.token, testMessage.bodyObj.messageId);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('successful message remove', () => {
      const testRequest = requestMessageRemove(testUser.bodyObj.token, testMessage.bodyObj.messageId);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ });
    });
  });
*/
  describe('message/senddm/v1 test', () => {
    let testUser2: wrapperOutput;

    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 2
      testUser2 = requestAuthRegister('student@unsw.com', 'password', 'Alice', 'Schmoe');
      expect(testUser2.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
      expect(testChannel.bodyObj).not.toStrictEqual({ error: 'error' });

      // Have user join channel
      // requestChannelJoin(testUser2.bodyObj.token, testChannel.bodyObj.channelId);

      // Create a test dm
      testDm = requestDMCreate(testUser.bodyObj.token, [testUser2.bodyObj.authUserId]);
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail send dm', () => {
      const testRequest = requestSendDm(testUser.bodyObj.token + 'a', testDm.bodyObj.dmId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('dmId does not refer to a valid dm, fail send dm', () => {
      const testRequest = requestSendDm(testUser.bodyObj.token, 9999, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('length of message is less than 1 character, fail send dm', () => {
      const testRequest = requestSendDm(testUser.bodyObj.token, testDm.bodyObj.dmId, '');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('length of message is over 1000 characters, fail send dm', () => {
      const longString = generateString();
      const testRequest = requestSendDm(testUser.bodyObj.token, testDm.bodyObj.dmId, longString);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('dmId valid but auth user is not a member of the dm, fail send dm', () => {
      const badUser = requestAuthRegister('astudent@unsw.com', 'apassword', 'aAlice', 'aSchmoe');
      const testRequest = requestSendDm(badUser.bodyObj.token, testDm.bodyObj.dmId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('successful send dm', () => {
      const testRequest = requestSendDm(testUser.bodyObj.token, testDm.bodyObj.dmId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ messageId: expect.any(Number) });
    });
  });
});
