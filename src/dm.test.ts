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

function requestDMDetails(token: string, dmId: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/details/v1`,
    {
      qs: { token, dmId },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

function requestDMList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/dm/list/v1`,
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

describe('dm capabilities', () => {
  describe('test /dm/create/v1', () => {
    let testUser1: wrapperOutput;
    let testUser2: wrapperOutput;
    let testUser3: wrapperOutput;
    let testUser4: wrapperOutput;

    beforeEach(() => {
      // Create test user 1
      testUser1 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser1.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 2
      testUser2 = requestAuthRegister('student@unsw.com', 'password', 'Alice', 'Schmoe');
      expect(testUser2.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 3
      testUser3 = requestAuthRegister('tsmith@yahoo.com', 'qwerty', 'Tom', 'Smith');
      expect(testUser3.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 4
      testUser4 = requestAuthRegister('jdoe@proton.com', '111111', 'John', 'Doe');
      expect(testUser4.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    test('Success create new DM, two users in DM', () => {
      const testDM = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId]);

      expect(testDM.res.statusCode).toBe(OK);
      expect(testDM.bodyObj).toStrictEqual({ dmId: expect.any(Number) });

      const testDetails = requestDMDetails(testUser1.bodyObj.token, testDM.bodyObj.dmId);
      expect(testDetails.bodyObj.name).toStrictEqual('aliceschmoe, johndoe');
    });

    test('Success create new DM, more than two users in DM', () => {
      const testDM = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId, testUser3.bodyObj.authUserId, testUser4.bodyObj.authUserId]);

      expect(testDM.res.statusCode).toBe(OK);
      expect(testDM.bodyObj).toStrictEqual({ dmId: expect.any(Number) });

      const testDetails = requestDMDetails(testUser1.bodyObj.token, testDM.bodyObj.dmId);
      expect(testDetails.bodyObj.name).toStrictEqual('aliceschmoe, johndoe, johndoe0, tomsmith');
    });

    test('Fail create new DM, invalid token', () => {
      const testDM = requestDMCreate(testUser4.bodyObj.token + 'a', [testUser1.bodyObj.authUserId, testUser2.bodyObj.authUserId]);
      expect(testDM.res.statusCode).toBe(OK);
      expect(testDM.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('Fail create new DM, invalid uId(s)', () => {
      // One invalid uId, invalid uId is not creator's uID
      const testDM1 = requestDMCreate(testUser1.bodyObj.token, [testUser3.bodyObj.authUserId, testUser4.bodyObj.authUserId + 20]);
      expect(testDM1.res.statusCode).toBe(OK);
      expect(testDM1.bodyObj).toStrictEqual({ error: 'error' });

      // One invalid uId, invalid uId is creator's uID
      const testDM2 = requestDMCreate(testUser1.bodyObj.token, [testUser1.bodyObj.authUserId, testUser2.bodyObj.authUserId]);
      expect(testDM2.res.statusCode).toBe(OK);
      expect(testDM2.bodyObj).toStrictEqual({ error: 'error' });

      // Multiple invalid uIds
      const testDM3 = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId + 20, testUser4.bodyObj.authUserId + 20]);
      expect(testDM3.res.statusCode).toBe(OK);
      expect(testDM3.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('Fail create new DM, duplicate uIds', () => {
      // One pair of duplicate uIds
      const testDM1 = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId, testUser2.bodyObj.authUserId, testUser3.bodyObj.authUserId, testUser4.bodyObj.authUserId]);
      expect(testDM1.res.statusCode).toBe(OK);
      expect(testDM1.bodyObj).toStrictEqual({ error: 'error' });

      // Multiple pairs of duplicate uIds
      const testDM2 = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId, testUser4.bodyObj.authUserId, testUser2.bodyObj.authUserId, testUser4.bodyObj.authUserId]);
      expect(testDM2.res.statusCode).toBe(OK);
      expect(testDM2.bodyObj).toStrictEqual({ error: 'error' });
    });
  });

  describe('test /dm/list/v1', () => {

    // FIXME:

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

});
