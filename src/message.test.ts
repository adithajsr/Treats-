import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

type wrapperOutput = {
    res: any,
    bodyObj: any,
};



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
    bodyObj: JSON.parse(String(res.body)),
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
    bodyObj: JSON.parse(String(res.body)),
  };
}

function requestChannelJoin(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/join/v2`,
    {
      json: { email, password, nameFirst, nameLast },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

function requestMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
      json: { token, channelId, message },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

function requestMessageEdit(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
    `${url}:${port}/channels/create/v2`,
    {
      json: { token, channelId, message },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
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
    bodyObj: JSON.parse(String(res.body)),
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

let userRes;
let userBodyObj: user;

function generateString() {
  let length = 1005;
  let set = 'abcdefg';
  const string = [];
  for (let i = 0; i < length; i++) {
    result.push(set.charAt(Math.floor(Math.random() * set.length)))
  }
  return string.join('');
}

let testUser: wrapperOutput;
let testChannel: wrapperOutput;

describe('messages capabilities', () => { 

  describe('message/send/v1 test', () => {

    beforeEach(() => {
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
      expect(testChannel.bodyObj).not.toStrictEqual({ error: 'error' });

      // Have user join channel
      requestChannelJoin(testUser.bodyObj.token, testChannel.bodyObj.channelId);
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
      let longString = generateString();
      const testRequest = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, longString);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });
    
    test('channelId is valid but authorised user not a member of channel, fail message send', () => {
      let testUser2 = requestAuthRegister('avalidemail@gmail.com', 'a123abc!@#', 'aJohn', 'aDoe');
      const testRequest = requestMessageSend(testUser2.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('successful message send', () => {
      const testRequest = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObj.channelId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ messageId : expect.any(Number) });
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

      // Have user join channel
      requestChannelJoin(testUser.bodyObj.token, testChannel.bodyObj.channelId);

      let testMessage = requestMessageSend(testUser.bodyObj.token, testChannel.bodyObjchannelId, 'a message');
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
      let longString = generateString();
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

    // uid????
    // uid????
    // uid????

    test('auth user does not have owner permissions in channel/dm', () => {
      // uid????
      requestRemoveOwner(testUser.bodyObj.token, testChannel.bodyObj.channelId, uId: number)
      const testRequest = requestMessageEdit(testUser.bodyObj.token, testMessage.bodyObj.messageId, 'a message');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('message is empty string, message delete successful, successful message edit', () => {
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

});