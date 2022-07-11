import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

// TODO: potentially improve types
type user = {
  res: any,
  bodyObj: any,
};

// FIXME:
// type channel = {
//   channelId: number,
// };

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
    let testUser: user;

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
      const testChannel = requestChannelsCreate(testUser.bodyObj.token + 1, 'channelName', true);

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

  /*
  describe('channelsListV1', () => {
    let testUser1: user;
    let testUser2: user;
    let testChannel1: channel;

    beforeEach(() => {
      testUser1 = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser1.authUserId).not.toStrictEqual({ error: 'error' });

      testUser2 = createTestUser('student@unsw.com', 'password', 'Jane', 'Schmoe');
      expect(testUser2.authUserId).not.toStrictEqual({ error: 'error' });

      // testUser1 created testChannel so they automatically join it
      testChannel1 = createTestChannel(testUser1.authUserId, 'channelName', true);
      expect(testChannel1.channelId).not.toStrictEqual({ error: 'error' });
    });

    test('Invalid authUserId', () => {
      expect(channelsListV1(testUser2.authUserId + 1)).toStrictEqual({ error: 'error' });
    });

    test('One channel, authorised user is in channel', () => {
      // only channel is testChannel1, testUser1 is in testChannel1
      expect(channelsListV1(testUser1.authUserId)).toStrictEqual({
        channels: [
          {
            channelId: testChannel1.channelId,
            name: testChannel1.name,
          }
        ]
      });
    });

    test('One channel, authorised user is not in channel', () => {
      // only channel is testChannel1, testUser2 is not in testChannel1
      expect(channelsListV1(testUser2.authUserId)).toStrictEqual({
        channels: []
      });
    });

    test('Multiple channels, authorised user is in all channels', () => {
      // testUser1 is in all channels
      const c1A = createTestChannel(testUser1.authUserId, 'channel1AName', false);
      const c1B = createTestChannel(testUser1.authUserId, 'channel1BName', true);
      const c1C = createTestChannel(testUser1.authUserId, 'channel1CName', false);

      const expected = new Set([
        {
          channelId: testChannel1.channelId,
          name: testChannel1.name,
        },
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
      const received = new Set(channelsListV1(testUser1.authUserId).channels);
      expect(received).toStrictEqual(expected);
    });

    test('Multiple channels, authorised user is in some channels', () => {
      // testUser1 is in some channels, remaining channels created by testUser2
      const c1A = createTestChannel(testUser1.authUserId, 'channel1AName', false);
      const c2A = createTestChannel(testUser2.authUserId, 'channel2AName', true);
      const c2B = createTestChannel(testUser2.authUserId, 'channel2BName', false);

      const expected = new Set([
        {
          channelId: testChannel1.channelId,
          name: testChannel1.name,
        },
        {
          channelId: c1A.channelId,
          name: c1A.name,
        },
      ]);
      const received = new Set(channelsListV1(testUser1.authUserId).channels);
      expect(received).toStrictEqual(expected);
    });

    test('Multiple channels, authorised user is in no channels', () => {
      // testUser2 is in no channels, all channels created by testUser1
      const c1A = createTestChannel(testUser1.authUserId, 'channel1AName', false);
      const c1B = createTestChannel(testUser1.authUserId, 'channel1BName', true);
      const c1C = createTestChannel(testUser1.authUserId, 'channel1CName', false);

      expect(channelsListV1(testUser2.authUserId)).toStrictEqual({
        channels: []
      });
    });
  }); */

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
