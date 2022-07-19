import request from 'sync-request';
import config from './config.json';
import { requestAuthRegister } from './auth.test';
import { requestClear } from './users.test';

const OK = 200;
const port = config.port;
const url = config.url;

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

function requestMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/send/v1`,
    {
      json: { token, channelId, message },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestMessageEdit(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
    `${url}:${port}/message/edit/v1`,
    {
      json: { token, messageId, message },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestMessageRemove(token: string, messageId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/message/remove/v1`,
    {
      qs: { token, messageId },
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

function requestRemoveOwner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/removeowner/v1`,
    {
      json: { token, channelId, uId },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestChannelJoinV2(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/join/v2`,
    {
      json: { token, channelId },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestChannelAddownerV1(token: string, channelId: number, uId:number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/addowner/v1`,
    {
      json: { token, channelId, uId },
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

type wrapperOutput = {
  res: any,
  bodyObj: any,
};

let testUser: wrapperOutput;
let testChannel: wrapperOutput;
let testDm: wrapperOutput;
let testMessage: wrapperOutput;

describe('messages capabilities', () => {
  describe('message/send/v1 test', () => {
    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
      expect(testChannel.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    afterEach(() => {
      requestClear();
    });

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

    afterEach(() => {
      requestClear();
    });

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
      const testUser2 = requestAuthRegister('vaalidemail@gmail.com', '12a3abc!@#', 'Johan', 'Daoe');
      const testRequest = requestMessageEdit(testUser2.bodyObj.token, testMessage.bodyObj.messageId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('auth user does not have owner permissions in channel/dm', () => {
      const addUser = requestAuthRegister('valiademail@gmail.com', '123abc!a@#', 'Joahn', 'Doea');
      requestChannelJoinV2(addUser.bodyObj.token, testChannel.bodyObj.channelId);
      requestChannelAddownerV1(testUser.bodyObj.token, testChannel.bodyObj.channelId, addUser.bodyObj.authUserId);
      requestRemoveOwner(addUser.bodyObj.token, testChannel.bodyObj.channelId, testUser.bodyObj.authUserId);
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
      requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
      expect(testChannel.bodyObj).not.toStrictEqual({ error: 'error' });

      testMessage = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
    });

    afterEach(() => {
      requestClear();
    });

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
      const addUser = requestAuthRegister('valiademail@gmail.com', '123abc!a@#', 'Joahn', 'Doea');
      requestChannelJoinV2(addUser.bodyObj.token, testChannel.bodyObj.channelId);
      requestChannelAddownerV1(testUser.bodyObj.token, testChannel.bodyObj.channelId, addUser.bodyObj.authUserId);
      requestRemoveOwner(addUser.bodyObj.token, testChannel.bodyObj.channelId, testUser.bodyObj.authUserId);
      const testRequest = requestMessageRemove(testUser.bodyObj.token, testMessage.bodyObj.messageId);
      expect(testRequest.res.statusCode).toBe(OK);
      // expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('successful message remove', () => {
      const testRequest = requestMessageRemove(testUser.bodyObj.token, testMessage.bodyObj.messageId);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ });
    });
  });

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
