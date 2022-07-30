import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import { requestClear } from './users.test';
import { requestAuthRegister } from './auth.test';

const OK = 200;
const INPUT_ERROR = 400;
const INVALID_TOKEN = 403;
const url = config.url;
const port = config.port;

type user = {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  res: any,
  bodyObj: any,
};

interface channel {
  token: string,
  name: string,
  isPublic: boolean,
  res: any,
  bodyObj: any,
}

const createTestUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  // auth/register/v2 returns { token, authUserId }
  const requestOutput = requestAuthRegister(email, password, nameFirst, nameLast);

  return {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    res: requestOutput.res,
    bodyObj: requestOutput.bodyObj,
  };
};

const createTestChannel = (token: string, name: string, isPublic: boolean) => {
  // channels/create/v2 returns { channelId }
  const requestOutput = requestChannelsCreate(token, name, isPublic);

  return {
    token: token,
    name: name,
    isPublic: isPublic,
    res: requestOutput.res,
    bodyObj: requestOutput.bodyObj,
  };
};

describe('channels capabilities', () => {
  describe('test /channels/create/v3', () => {
    beforeEach(() => {
      requestClear();
    });

    afterEach(() => {
      requestClear();
    });

    let testUser: user;

    beforeEach(() => {
      // Create a test user
      testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    });

    test('Success create new channel', () => {
      const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'channelName', true);

      expect(testChannel.res.statusCode).toBe(OK);
      expect(testChannel.bodyObj).toStrictEqual({ channelId: expect.any(Number) });
    });

    test('Fail create new channel, invalid token', () => {
      const testChannel = requestChannelsCreate(testUser.bodyObj.token + 'a', 'channelName', true);

      expect(testChannel.res.statusCode).toBe(INVALID_TOKEN);
      expect(testChannel.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
    });

    test.each([
      // length of name is less than 1 or more than 20 characters
      { name: '' },
      { name: 'moreThanTwentyCharacters' },
    ])("Fail create new channel, invalid channel name: '$name'", ({ name }) => {
      const testChannel = requestChannelsCreate(testUser.bodyObj.token, name, true);

      expect(testChannel.res.statusCode).toBe(INPUT_ERROR);
      expect(testChannel.bodyObj.error).toStrictEqual({ message: 'Invalid channel name' });
    });
  });

  describe('test /channels/list/v3', () => {
    beforeEach(() => {
      requestClear();
    });

    let testUser1: user;
    let testUser2: user;
    let testChannel1: channel;

    beforeEach(() => {
      // Create test user 1
      testUser1 = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');

      // Create test user 2
      testUser2 = createTestUser('student@unsw.com', 'password', 'Jane', 'Schmoe');

      // testUser1 created testChannel1 so they automatically join it
      testChannel1 = createTestChannel(testUser1.bodyObj.token, 'channelName', true);
    });

    test('Fail channels list, invalid token', () => {
      const testList = requestChannelsList(testUser2.bodyObj.token + 'a');

      expect(testList.res.statusCode).toBe(INVALID_TOKEN);
      expect(testList.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
    });

    test('One channel, authorised user is in channel', () => {
      // Only channel is testChannel1, testUser1 is in testChannel1
      const testList = requestChannelsList(testUser1.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({
        channels: [
          {
            channelId: testChannel1.bodyObj.channelId,
            name: testChannel1.name,
          }
        ]
      });
    });

    test('One channel, authorised user is not in channel', () => {
      // Only channel is testChannel1, testUser2 is not in testChannel1
      const testList = requestChannelsList(testUser2.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({
        channels: []
      });
    });

    test('Multiple channels, authorised user is in all channels', () => {
      // testUser1 is in all channels
      const c1A = createTestChannel(testUser1.bodyObj.token, 'channel1AName', false);
      const c1B = createTestChannel(testUser1.bodyObj.token, 'channel1BName', true);
      const c1C = createTestChannel(testUser1.bodyObj.token, 'channel1CName', false);

      const expected = new Set([
        {
          channelId: testChannel1.bodyObj.channelId,
          name: testChannel1.name,
        },
        {
          channelId: c1A.bodyObj.channelId,
          name: c1A.name,
        },
        {
          channelId: c1B.bodyObj.channelId,
          name: c1B.name,
        },
        {
          channelId: c1C.bodyObj.channelId,
          name: c1C.name,
        },
      ]);

      const testList = requestChannelsList(testUser1.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      const received = new Set(testList.bodyObj.channels);
      expect(received).toStrictEqual(expected);
    });

    test('Multiple channels, authorised user is in some channels', () => {
      // testUser1 is in some channels, remaining channels created by testUser2
      const c1A = createTestChannel(testUser1.bodyObj.token, 'channel1AName', false);
      createTestChannel(testUser2.bodyObj.token, 'channel2AName', true);
      createTestChannel(testUser2.bodyObj.token, 'channel2BName', false);

      const expected = new Set([
        {
          channelId: testChannel1.bodyObj.channelId,
          name: testChannel1.name,
        },
        {
          channelId: c1A.bodyObj.channelId,
          name: c1A.name,
        },
      ]);

      const testList = requestChannelsList(testUser1.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      const received = new Set(testList.bodyObj.channels);
      expect(received).toStrictEqual(expected);
    });

    test('Multiple channels, authorised user is in no channels', () => {
      // testUser2 is in no channels, all channels created by testUser1
      createTestChannel(testUser1.bodyObj.token, 'channel1AName', false);
      createTestChannel(testUser1.bodyObj.token, 'channel1BName', true);
      createTestChannel(testUser1.bodyObj.token, 'channel1CName', false);

      const testList = requestChannelsList(testUser2.bodyObj.token);
      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({
        channels: []
      });
    });
  });
});

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v3`,
    {
      json: { token, name, isPublic },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestChannelsList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/channels/list/v3`,
    {
      qs: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}
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

function requestChannelsListall(token: string) {
  return requestHelper('GET', '/channels/listall/v3', { token });
}

describe('channels functions testing', () => {
  describe('channels/listall/v3 test', () => {
    let testUser: user;
    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail channels list all', () => {
      const testRequest = requestChannelsListall(testUser.bodyObj.token + 'a');
      expect(testRequest).toBe(403);
    });

    test('no channels in database, channels list all success', () => {
      const testRequest = requestChannelsListall(testUser.bodyObj.token);
      expect(testRequest).toStrictEqual({
        channels: []
      });
    });

    test('return one channel, channels list all success', () => {
      const testChannel = createTestChannel(testUser.bodyObj.token, 'channelName', true);
      const testRequest = requestChannelsListall(testUser.bodyObj.token);
      expect(testRequest).toStrictEqual({
        channels: [
          {
            channelId: testChannel.bodyObj.channelId,
            name: testChannel.name,
          }
        ]
      });
    });

    test('return multiple channels, channels list all success', () => {
      const c1 = createTestChannel(testUser.bodyObj.token, 'ychannelName', true);
      const c2 = createTestChannel(testUser.bodyObj.token, 'dchannelName', false);
      const c3 = createTestChannel(testUser.bodyObj.token, 'hchannelName', true);
      const expected = new Set([
        {
          channelId: c1.bodyObj.channelId,
          name: c1.name,
        },
        {
          channelId: c2.bodyObj.channelId,
          name: c2.name,
        },
        {
          channelId: c3.bodyObj.channelId,
          name: c3.name,
        },
      ]);
      const testRequest = requestChannelsListall(testUser.bodyObj.token);
      const received = new Set(testRequest.channels);
      expect(received).toEqual(expected);
    });
  });
});

export { requestChannelsCreate };
