/*import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

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
  describe('test /channels/create/v2', () => {
    beforeEach(() => {
      requestClear();
    });

    let testUser: user;

    beforeEach(() => {
      // Create a test user
      testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    test('Success create new channel', () => {
      const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'channelName', true);

      expect(testChannel.res.statusCode).toBe(OK);
      expect(testChannel.bodyObj).toStrictEqual({ channelId: expect.any(Number) });
    });

    test('Fail create new channel, invalid token', () => {
      const testChannel = requestChannelsCreate(testUser.bodyObj.token + 'a', 'channelName', true);

      expect(testChannel.res.statusCode).toBe(OK);
      expect(testChannel.bodyObj).toStrictEqual({ error: 'error' });
    });

    test.each([
      // length of name is less than 1 or more than 20 characters
      { name: '' },
      { name: 'moreThanTwentyCharacters' },
    ])("Fail create new channel, invalid channel name: '$name'", ({ name }) => {
      const testChannel = requestChannelsCreate(testUser.bodyObj.token, name, true);

      expect(testChannel.res.statusCode).toBe(OK);
      expect(testChannel.bodyObj).toStrictEqual({ error: 'error' });
    });
  });

  describe('test /channels/list/v2', () => {
    beforeEach(() => {
      requestClear();
    });

    let testUser1: user;
    let testUser2: user;
    let testUser3: user;
    let testUser4: user;
    let testChannel1: channel;

    beforeEach(() => {
      // Create test user 1
      testUser1 = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser1.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 2
      testUser2 = createTestUser('student@unsw.com', 'password', 'Jane', 'Schmoe');
      expect(testUser2.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 3
      testUser3 = createTestUser('tsmith@yahoo.com', 'qwerty', 'Tom', 'Smith');
      expect(testUser3.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 4
      testUser4 = createTestUser('jbloggs@proton.com', '111111', 'Jo', 'Bloggs');
      expect(testUser4.bodyObj).not.toStrictEqual({ error: 'error' });

      // testUser1 created testChannel1 so they automatically join it
      testChannel1 = createTestChannel(testUser1.bodyObj.token, 'channelName', true);
      expect(testChannel1.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    test('Fail channels list, invalid token', () => {
      const testList = requestChannelsList(testUser2.bodyObj.token + 'a');

      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({ error: 'error' });
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

function requestChannelsList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/channels/list/v2`,
    {
      qs: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
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
  return JSON.parse(res.getBody() as string);
}

function requestChannelsListall(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/channels/listall/v2`,
    {
      qs: {
        token
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

describe('channels functions testing', () => {
  describe('channels/listall/v2 test', () => {
    let testUser: user;
    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail channels list all', () => {
      const testRequest = requestChannelsListall(testUser.bodyObj.token + 'a');
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('no channels in database, channels list all success', () => {
      const testRequest = requestChannelsListall(testUser.bodyObj.token);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({
        channels: []
      });
    });

    test('return one channel, channels list all success', () => {
      const testChannel = createTestChannel(testUser.bodyObj.token, 'channelName', true);
      const testRequest = requestChannelsListall(testUser.bodyObj.token);
      expect(testRequest.res.statusCode).toBe(OK);
      expect(testRequest.bodyObj).toStrictEqual({
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

      expect(testRequest.res.statusCode).toBe(OK);
      const received = new Set(testRequest.bodyObj.channels);
      expect(received).toStrictEqual(expected);
    });
  });

  describe('test /channels/list/v2', () => {
    beforeEach(() => {
      requestClear();
    });

    let testUser1: user;
    let testUser2: user;
    let testUser3: user;
    let testUser4: user;
    let testChannel1: channel;

    beforeEach(() => {
      // Create test user 1
      testUser1 = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser1.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 2
      testUser2 = createTestUser('student@unsw.com', 'password', 'Jane', 'Schmoe');
      expect(testUser2.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 3
      testUser3 = createTestUser('tsmith@yahoo.com', 'qwerty', 'Tom', 'Smith');
      expect(testUser3.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 4
      testUser4 = createTestUser('jbloggs@proton.com', '111111', 'Jo', 'Bloggs');
      expect(testUser4.bodyObj).not.toStrictEqual({ error: 'error' });

      // testUser1 created testChannel1 so they automatically join it
      testChannel1 = createTestChannel(testUser1.bodyObj.token, 'channelName', true);
      expect(testChannel1.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    test('Fail channels list, invalid token', () => {
      const testList = requestChannelsList(testUser2.bodyObj.token + 'a');

      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({ error: 'error' });
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
*/
