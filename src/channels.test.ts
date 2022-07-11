import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

// TODO: potentially improve types
type wrapperOutput = {
  res: any,
  bodyObj: any,
};

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

beforeEach(() => {
  requestClear();
});

describe('channels capabilities', () => {
  describe('test /channels/create/v2', () => {
    let testUser: wrapperOutput;

    beforeEach(() => {
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
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

    let testUser1: wrapperOutput;
    let testUser2: wrapperOutput;
    let testUser3: wrapperOutput;
    let testUser4: wrapperOutput;
    let testChannel1: wrapperOutput;

    beforeEach(() => {
      // Create test user 1
      testUser1 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser1.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 2
      testUser2 = requestAuthRegister('student@unsw.com', 'password', 'Jane', 'Schmoe');
      expect(testUser2.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 3
      testUser3 = requestAuthRegister('tsmith@yahoo.com', 'qwerty', 'Tom', 'Smith');
      expect(testUser3.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 4
      testUser4 = requestAuthRegister('jbloggs@proton.com', '111111', 'Jo', 'Bloggs');
      expect(testUser4.bodyObj).not.toStrictEqual({ error: 'error' });

      // TODO: use channelJoin to add more people to channels

      // testUser1 created testChannel1 so they automatically join it
      testChannel1 = requestChannelsCreate(testUser1.bodyObj.token, 'channelName', true);
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
            name: testChannel1.bodyObj.name,
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
      const c1A = requestChannelsCreate(testUser1.bodyObj.token, 'channel1AName', false);
      const c1B = requestChannelsCreate(testUser1.bodyObj.token, 'channel1BName', true);
      const c1C = requestChannelsCreate(testUser1.bodyObj.token, 'channel1CName', false);

      const expected = new Set([
        {
          channelId: testChannel1.bodyObj.channelId,
          name: testChannel1.bodyObj.name,
        },
        {
          channelId: c1A.bodyObj.channelId,
          name: c1A.bodyObj.name,
        },
        {
          channelId: c1B.bodyObj.channelId,
          name: c1B.bodyObj.name,
        },
        {
          channelId: c1C.bodyObj.channelId,
          name: c1C.bodyObj.name,
        },
      ]);

      const testList = requestChannelsList(testUser1.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      const received = new Set(testList.bodyObj.channels);
      expect(received).toStrictEqual(expected);
    });

    test('Multiple channels, authorised user is in some channels', () => {
      // testUser1 is in some channels, remaining channels created by testUser2
      const c1A = requestChannelsCreate(testUser1.bodyObj.token, 'channel1AName', false);
      const c2A = requestChannelsCreate(testUser2.bodyObj.token, 'channel2AName', true);
      const c2B = requestChannelsCreate(testUser2.bodyObj.token, 'channel2BName', false);

      const expected = new Set([
        {
          channelId: testChannel1.bodyObj.channelId,
          name: testChannel1.bodyObj.name,
        },
        {
          channelId: c1A.bodyObj.channelId,
          name: c1A.bodyObj.name,
        },
      ]);

      const testList = requestChannelsList(testUser1.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      const received = new Set(testList.bodyObj.channels);
      expect(received).toStrictEqual(expected);
    });

    test('Multiple channels, authorised user is in no channels', () => {
      // testUser2 is in no channels, all channels created by testUser1
      const c1A = requestChannelsCreate(testUser1.bodyObj.token, 'channel1AName', false);
      const c1B = requestChannelsCreate(testUser1.bodyObj.token, 'channel1BName', true);
      const c1C = requestChannelsCreate(testUser1.bodyObj.token, 'channel1CName', false);

      const testList = requestChannelsList(testUser2.bodyObj.token);
      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({
        channels: []
      });

    });
  });

  /*
  describe('channelsListallV1 test', () => {
    test('authid is invalid - not an existing user', () => {
      let testUser: user;
      testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');

      expect(channelsListallV1(testUser.authUserId + 1)).toStrictEqual({ error: 'error' });
    });

    test('no channels in database', () => {
      const testUser1 = requestAuthRegister('who@question.com', 'yourmumma', 'John', 'Smith');
      expect(channelsListallV1(testUser1.authUserId)).toStrictEqual({ channels: [] });
    });

    test('return one channel', () => {
      const testUser2 = requestAuthRegister('whom@question.com', 'youmumma', 'Joh', 'Smit');
      const testChannel1 = createTestChannel(testUser2.authUserId, 'channelName', true);
      expect(channelsListallV1(testUser2.authUserId)).toStrictEqual({
        channels: [
          {
            channelId: testChannel1.channelId,
            name: testChannel1.name,
          }
        ]
      });
    });

    test('return multiple channels', () => {
      const testUser3 = requestAuthRegister('who@questin.com', 'youumma', 'Jon', 'Smih');
      const c1A = createTestChannel(testUser3.authUserId, 'channel1AName', false);
      const c1B = createTestChannel(testUser3.authUserId, 'channel1BName', true);
      const c1C = createTestChannel(testUser3.authUserId, 'channel1CName', false);

      const expected = new Set([
        {
          channelId: c1A.channelId,
          name: c1A.name,
        },
        {
          channelId: c1B.channelId,
          name: c1B.name,
        },
        {
          channelId: c1C.channelId,
          name: c1C.name,
        },
      ]);
      const received = new Set(channelsListallV1(testUser3.authUserId).channels);
      expect(received).toStrictEqual(expected);
    });
  }); */
});
