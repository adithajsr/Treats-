import request from 'sync-request';
import config from './config.json';
import { requestAuthRegister } from './auth.test';
import { requestChannelsCreate } from './channels.test';
import { requestDMCreate, requestDMLeave, requestDMRemove } from './dm.test';

const OK = 200;
const INVALID_TOKEN = 403;
const url = config.url;
const port = config.port;

const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];

// ======================================== ClearV1 Testing ========================================

export function requestUserProfileSetName(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setname/v2`,
    {
      json: {
        nameFirst: nameFirst,
        nameLast: nameLast,
      },
      headers: { token },
    }
  );

  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {
      qs: {},
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestUserProfileSetEmail(token: string, email: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/email/v2`,
    {
      json: {
        email: email,
      },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestUserProfileSetHandle(token: string, handleStr: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/handle/v2`,
    {
      json: {
        handleStr: handleStr,
      },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestUsersAll() {
  const res = request(
    'GET',
    `${url}:${port}/users/all/v2`,
    {
      qs: {

      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}/user/profile/v3`,
    {
      qs: {
        uId: uId
      },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

test('Invalid uId', () => {
  requestClear();
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]);
  const maiyaToken = maiyaUser.bodyObj.token;
  const maiyaId = maiyaUser.bodyObj.authUserId;
  expect(requestUserProfile(maiyaToken, maiyaId + 20).res.statusCode).toEqual(400);
  // expect(returnObject.res.statusCode).toBe(400);

  requestClear();
});

test('Testing default case', () => {
  requestClear();

  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]);
  const maiyaToken = maiyaUser.bodyObj.token;
  const maiyaId = maiyaUser.bodyObj.authUserId;
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]);
  const danielToken = danielUser.bodyObj.token;
  const danielId = danielUser.bodyObj.authUserId;

  const maiyaInfo = {
    uId: maiyaId,
    email: 'maiyaTaylor@gmail.com',
    nameFirst: 'Maiya',
    nameLast: 'Taylor',
    handleStr: 'maiyataylor',
  };

  const danielInfo = {
    uId: danielId,
    email: 'danielYung@gmail.com',
    nameFirst: 'Daniel',
    nameLast: 'Yung',
    handleStr: 'danielyung',
  };

  expect(requestUserProfile(danielToken, danielId).bodyObj).toMatchObject(danielInfo);
  const obj1 = requestUserProfile(maiyaToken, maiyaId);
  expect(obj1.bodyObj).toMatchObject(maiyaInfo);
  expect(obj1.res.statusCode).toBe(OK);

  requestClear();
});

// ======================================== requestUserProfileSetName Testing ========================================

describe('Testing for requestUserProfileSetName', () => {
  afterEach(() => {
    requestClear();
  });
  test('Test 1 affirmitive', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetName(testToken, 'Jonathan', 'Schmidt');
    expect(response.res.statusCode).toBe(OK);
    const expectedObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'Jonathan',
      nameLast: 'Schmidt',
      handleStr: 'johnsmith'
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });

  test('Test 2 invalid nameFirst', () => {
    // error
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetName(testToken, '', 'Schmidt');
    expect(response.res.statusCode).toBe(400);
    expect(response.bodyObj.error).toStrictEqual({ message: 'invalid input details' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      email: 'who.is.joe@is.the.question.com',
      uId: testUserId,
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
    });
  });

  test('Test 3 invalid nameLast', () => {
    // error
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetName(testToken, 'Jonathan', 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz');
    expect(response.res.statusCode).toBe(400);
    expect(response.bodyObj.error).toStrictEqual({ message: 'invalid input details' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      email: 'who.is.joe@is.the.question.com',
      uId: testUserId,
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
    });
  });
});

// ======================================== requestUserProfileSetEmail Testing ========================================
describe('Testing for requestUserProfileSetEmail', () => {
  afterEach(() => {
    requestClear();
  });
  test('Test 1 affirmitive', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetEmail(testToken, 'something@gmail.com');
    expect(response.res.statusCode).toBe(OK);
    const expectedObject = {
      uId: testUserId,
      email: 'something@gmail.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith'
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });

  test('Test 2 invalid email', () => {
    // error
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetEmail(testToken, '');
    expect(response.res.statusCode).toBe(400);
    expect(response.bodyObj.error).toStrictEqual({ message: 'invalid input details' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      email: 'who.is.joe@is.the.question.com',
      uId: testUserId,
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
    });
  });
});

// ======================================== requestUserProfileSetHandle Testing ========================================
describe('Testing for requestUserProfileSetHandle', () => {
  afterEach(() => {
    requestClear();
  });
  test('Test 1 affirmitive', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetHandle(testToken, 'BigChungas2000');
    expect(response.res.statusCode).toBe(OK);
    const expectedObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'BigChungas2000'
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });

  test('Test 2 invalid handle', () => {
    // error
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetHandle(testToken, '');
    expect(response.res.statusCode).toBe(400);
    expect(response.bodyObj.error).toStrictEqual({ message: 'invalid input details' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      email: 'who.is.joe@is.the.question.com',
      uId: testUserId,
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
    });
  });

  test('Test 3 occupied handle', () => {
    // all should be well
    requestAuthRegister('something@gmail.com', 'th1sp4ssw0rd', 'big', 'chungas');
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetHandle(testToken, 'bigchungas');
    expect(response.res.statusCode).toBe(400);
    const expectedObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith'
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });

  test('Test 4 negative non-existant token', () => {
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetHandle('incorrecttoken', 'bigchungas');
    expect(response.res.statusCode).toBe(403);
    const expectedObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith'
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });
});

// ======================================== requestUsersAll Testing ========================================

describe('Testing for requestUsersAll', () => {
  afterEach(() => {
    requestClear();
  });
  test('Test 1 affirmitive multiple users', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const uId2 = requestAuthRegister('z5420895@ad.unsw.edu.au', 'myrealpassword', 'Jonathan', 'Schmidt').bodyObj.authUserId;
    const uId3 = requestAuthRegister('validemail@gmail.com', '123abc123', 'John', 'Doe').bodyObj.authUserId;
    const response = requestUsersAll();
    expect(response.res.statusCode).toBe(OK);
    expect(requestUsersAll().bodyObj.users).toStrictEqual([
      {
        uId: returnObject.bodyObj.authUserId,
        email: 'who.is.joe@is.the.question.com',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith',
      }, {
        uId: uId2,
        email: 'z5420895@ad.unsw.edu.au',
        nameFirst: 'Jonathan',
        nameLast: 'Schmidt',
        handleStr: 'jonathanschmidt',
      }, {
        uId: uId3,
        email: 'validemail@gmail.com',
        nameFirst: 'John',
        nameLast: 'Doe',
        handleStr: 'johndoe',
      }
    ]);
  });

  test('Test 2 affirmitive one user', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const response = requestUsersAll();
    expect(response.res.statusCode).toBe(OK);
    expect(requestUsersAll().bodyObj.users).toStrictEqual([
      {
        uId: returnObject.bodyObj.authUserId,
        email: 'who.is.joe@is.the.question.com',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith',
      }
    ]);
  });
});

// ========================================================================= //

type wrapperOutput = {
  res: any,
  bodyObj: any,
};

function requestUserStats(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/user/stats/v1`,
    {
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestUsersStats(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/users/stats/v1`,
    {
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/send/v2`,
    {
      json: { channelId, message },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestMessageRemove(token: string, messageId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/message/remove/v2`,
    {
      qs: { messageId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestChannelJoin(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/join/v3`,
    {
      json: { channelId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestChannelLeave(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/leave/v2`,
    {
      json: { channelId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestChannelInvite(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v3`,
    {
      json: { channelId, uId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestAdminUserRemove(token: string, uId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/admin/user/remove/v1`,
    {
      qs: { uId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestChannelAddOwner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/addowner/v2`,
    {
      json: { channelId, uId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

describe('stats capabilities', () => {
  beforeEach(() => {
    requestClear();
  });

  afterEach(() => {
    requestClear();
  });

  describe('test /user/stats/v1', () => {
    let testUser1: wrapperOutput;
    let expectedAcc1CreatTime: number;
    let testUser2: wrapperOutput;

    beforeEach(() => {
      // Create test user 1 and generate the time their account as created
      testUser1 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expectedAcc1CreatTime = Math.floor((new Date()).getTime() / 1000);

      // Create test user 2
      testUser2 = requestAuthRegister('student@unsw.com', 'password', 'Alice', 'Schmoe');
    });

    test('Fail fetch user\'s stats, invalid token', () => {
      const testUserStats = requestUserStats(testUser1.bodyObj.token + 'a');
      expect(testUserStats.res.statusCode).toBe(INVALID_TOKEN);
      expect(testUserStats.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
    });

    test('Test first data points', () => {
      const testUserStats = requestUserStats(testUser1.bodyObj.token);
      expect(testUserStats.res.statusCode).toBe(OK);

      // The first data point should be 0 for all metrics at the time that
      // the user's account was created
      expect(testUserStats.bodyObj).toStrictEqual({
        userStats: {
          channelsJoined: [
            {
              numChannelsJoined: 0,
              timeStamp: expect.any(Number),
            },
          ],
          dmsJoined: [
            {
              numDmsJoined: 0,
              timeStamp: expect.any(Number),
            },
          ],
          messagesSent: [
            {
              numMessagesSent: 0,
              timeStamp: expect.any(Number),
            },
          ],
          involvementRate: 0,
        }
      });

      // Account for 1 second delay between requests
      const userStatsObject = testUserStats.bodyObj.userStats;

      const accountCreationTime = userStatsObject.channelsJoined[0].timeStamp;
      expect(accountCreationTime).toBeGreaterThanOrEqual(expectedAcc1CreatTime);
      expect(accountCreationTime).toBeLessThan(expectedAcc1CreatTime + 1);

      expect(userStatsObject.dmsJoined[0].timeStamp).toStrictEqual(accountCreationTime);
      expect(userStatsObject.messagesSent[0].timeStamp).toStrictEqual(accountCreationTime);
    });

    test('Test metrics, basic', () => {
      // Create a test channel and DM, and send a test message to the channel
      const testChannel = requestChannelsCreate(testUser1.bodyObj.token, 'channelName', true);
      requestDMCreate(testUser1.bodyObj.token, []);
      requestMessageSend(testUser1.bodyObj.token, testChannel.bodyObj.channelId, 'message');

      const testUserStats = requestUserStats(testUser1.bodyObj.token);
      expect(testUserStats.res.statusCode).toBe(OK);

      // The user's involvement:
      // sum(numChannelsJoined, numDmsJoined, numMsgsSent) divided by
      // sum(numChannels, numDms, numMsgs)

      expect(testUserStats.bodyObj).toStrictEqual({
        userStats: {
          channelsJoined: [
            {
              numChannelsJoined: 0,
              timeStamp: expect.any(Number),
            },
            {
              numChannelsJoined: 1,
              timeStamp: expect.any(Number),
            },
          ],
          dmsJoined: [
            {
              numDmsJoined: 0,
              timeStamp: expect.any(Number),
            },
            {
              numDmsJoined: 1,
              timeStamp: expect.any(Number),
            },
          ],
          messagesSent: [
            {
              numMessagesSent: 0,
              timeStamp: expect.any(Number),
            },
            {
              numMessagesSent: 1,
              timeStamp: expect.any(Number),
            },
          ],
          involvementRate: (1 + 1 + 1) / (1 + 1 + 1),
        }
      });
    });

    test('numChannels increase, numChannelsJoined increase and decrease', () => {
      // testUser1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const testChannel1 = requestChannelsCreate(testUser1.bodyObj.token, 'channel1Name', true);
      requestDMCreate(testUser1.bodyObj.token, []);
      requestMessageSend(testUser1.bodyObj.token, testChannel1.bodyObj.channelId, 'message1');

      // testUser2 creates a channel, increasing numChannels
      // numChannels will only increase over time, it will never decrease
      // as there is no way to remove channels
      const testChannel2 = requestChannelsCreate(testUser2.bodyObj.token, 'channel2Name', true);
      const testUser1StatsA = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsA.res.statusCode).toBe(OK);
      expect(testUser1StatsA.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (2 + 1 + 1));

      // testUser1 joins testUser2's channel, increasing numChannelsJoined
      requestChannelJoin(testUser1.bodyObj.token, testChannel2.bodyObj.channelId);
      const testUser1StatsB = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsB.res.statusCode).toBe(OK);
      expect(testUser1StatsB.bodyObj.userStats.channelsJoined.length).toStrictEqual(3);
      expect(testUser1StatsB.bodyObj.userStats.involvementRate).toStrictEqual((2 + 1 + 1) / (2 + 1 + 1));

      // testUser1 leaves testUser2's channel, decreasing numChannelsJoined
      requestChannelLeave(testUser1.bodyObj.token, testChannel2.bodyObj.channelId);
      const testUser1StatsC = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsC.res.statusCode).toBe(OK);
      expect(testUser1StatsC.bodyObj.userStats.channelsJoined.length).toStrictEqual(2);
      expect(testUser1StatsC.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (2 + 1 + 1));

      // testUser2 invites testUser1 to their channel, increasing numChannelsJoined
      requestChannelInvite(testUser2.bodyObj.token, testChannel2.bodyObj.channelId, testUser1.bodyObj.authUserId);
      const testUser1StatsD = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsD.res.statusCode).toBe(OK);
      expect(testUser1StatsD.bodyObj.userStats.channelsJoined.length).toStrictEqual(3);
      expect(testUser1StatsD.bodyObj.userStats.involvementRate).toStrictEqual((2 + 1 + 1) / (2 + 1 + 1));
    });

    test('numDms increase and decrease, numDmsJoined increase and decrease', () => {
      // testUser1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const testChannel1 = requestChannelsCreate(testUser1.bodyObj.token, 'channel1Name', true);
      const testDM1 = requestDMCreate(testUser1.bodyObj.token, []);
      requestMessageSend(testUser1.bodyObj.token, testChannel1.bodyObj.channelId, 'message1');

      // testUser2 creates a testDM2A (not directed to testUser1), increasing numDms
      requestDMCreate(testUser2.bodyObj.token, []);
      const testUser1StatsA = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsA.res.statusCode).toBe(OK);
      expect(testUser1StatsA.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 2 + 1));

      // testUser2 creates a DM directed to testUser1, increasing numDmsJoined (and numDms)
      const testDM2B = requestDMCreate(testUser2.bodyObj.token, [testUser1.bodyObj.authUserId]);
      const testUser1StatsB = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsB.res.statusCode).toBe(OK);
      expect(testUser1StatsB.bodyObj.userStats.dmsJoined.length).toStrictEqual(3);
      expect(testUser1StatsB.bodyObj.userStats.involvementRate).toStrictEqual((1 + 2 + 1) / (1 + 3 + 1));

      // testUser1 leaves testUser2's DM, decreasing numDmsJoined
      requestDMLeave(testUser1.bodyObj.token, testDM2B.bodyObj.dmId);
      const testUser1StatsC = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsC.res.statusCode).toBe(OK);
      expect(testUser1StatsC.bodyObj.userStats.dmsJoined.length).toStrictEqual(2);
      expect(testUser1StatsC.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 3 + 1));

      // testUser2 removes the DM previously with testUser1, decreasing numDms
      requestDMRemove(testUser2.bodyObj.token, testDM2B.bodyObj.dmId);
      const testUser1StatsD = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsD.res.statusCode).toBe(OK);
      expect(testUser1StatsD.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 2 + 1));

      // testUser1 removes their DM, decreasing numDmsJoined (and numDms)
      requestDMRemove(testUser1.bodyObj.token, testDM1.bodyObj.dmId);
      const testUser1StatsE = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsE.res.statusCode).toBe(OK);
      expect(testUser1StatsC.bodyObj.userStats.dmsJoined.length).toStrictEqual(1);
      expect(testUser1StatsE.bodyObj.userStats.involvementRate).toStrictEqual((1 + 0 + 1) / (1 + 1 + 1));
    });

    test('channels: numMsgs increase and decrease, numMsgsSent increase', () => {
      // testUser1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const testChannel1 = requestChannelsCreate(testUser1.bodyObj.token, 'channel1Name', true);
      requestDMCreate(testUser1.bodyObj.token, []);
      requestMessageSend(testUser1.bodyObj.token, testChannel1.bodyObj.channelId, 'message 1A');

      // testUser2 joins the channel and sends a message, increasing numMsgs
      requestChannelJoin(testUser2.bodyObj.token, testChannel1.bodyObj.channelId);
      const testMessage2 = requestMessageSend(testUser2.bodyObj.token, testChannel1.bodyObj.channelId, 'message 2');
      const testUser1StatsA = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsA.res.statusCode).toBe(OK);
      expect(testUser1StatsA.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 1 + 2));

      // testUser1 sends another message to channel, increasing numMsgsSent (and numMsgs)
      const testMessage1B = requestMessageSend(testUser1.bodyObj.token, testChannel1.bodyObj.channelId, 'message 1B');
      const testUser1StatsB = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsB.res.statusCode).toBe(OK);
      expect(testUser1StatsB.bodyObj.userStats.messagesSent.length).toStrictEqual(3);
      expect(testUser1StatsB.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 2) / (1 + 1 + 3));

      // testUser1 makes testUser2 a channel owner so that testUser2 can remove
      // their message, decreasing numMsgs
      requestChannelAddOwner(testUser1.bodyObj.token, testChannel1.bodyObj.channelId, testUser2.bodyObj.authUserId);
      requestMessageRemove(testUser2.bodyObj.token, testMessage2.bodyObj.messageId);
      const testUser1StatsC = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsC.res.statusCode).toBe(OK);
      expect(testUser1StatsC.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 2) / (1 + 1 + 2));

      // testUser1 removes their own message, decreasing numMsgs but
      // not numMsgsSent since message removal does not affect numMsgsSent
      requestMessageRemove(testUser1.bodyObj.token, testMessage1B.bodyObj.messageId);
      const testUser1StatsD = requestUserStats(testUser1.bodyObj.token);
      expect(testUser1StatsD.res.statusCode).toBe(OK);
      expect(testUser1StatsD.bodyObj.userStats.messagesSent.length).toStrictEqual(3);
      // If the involvement is greater than 1, it should be capped at 1
      // (1 + 1 + 2) / (1 + 1 + 1) > 1
      expect(testUser1StatsD.bodyObj.userStats.involvementRate).toStrictEqual(1);
    });

    test('DMs: numMsgs increase and decrease, numMsgsSent increase', () => {
      // numMsgs is the number of messages that exist at the current time

      // numMsgs can increase over time
      // message/senddm

      // numMsgs should decrease when messages or DMs are removed
      // message/remove (from either channel or DM)
      // dm/remove

      // ***************************************************************

      // The number of messages sent will only increase over time
      // If the involvement is greater than 1, it should be capped at 1
      // message/senddm

      // The removal of messages does NOT affect the number of messages sent
      // message/remove
      // dm/remove

      // The user's involvement:
      // sum(numChannelsJoined, numDmsJoined, numMsgsSent) divided by
      // sum(numChannels, numDms, numMsgs)
    });

    test('standups & sendlater: numMsgs increase and decrease, numMsgsSent increase', () => {
      // standup/send messages only count when the final packaged
      // standup message from standup/start has been sent
      // A standup should only count as single message in the channel,
      // timestamped at the moment the standup finished

      // When a standup is sent, the number of messages sent by the user
      // who started the standup should increase by 1

      // STANDUPS MAY END UP BEING UNDER CHANNELS TEST

      // ***************************************************************

      // Messages which have not been sent yet with message/sendlater or
      // message/sendlaterdm are not included

      // The user's involvement:
      // sum(numChannelsJoined, numDmsJoined, numMsgsSent) divided by
      // sum(numChannels, numDms, numMsgs)
    });
  });

  describe('test /users/stats/v1 i.e. workspace stats', () => {
    let testUser1: wrapperOutput;
    let expectedFirstUserTime: number;

    beforeEach(() => {
      // Create test user 1
      testUser1 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expectedFirstUserTime = Math.floor((new Date()).getTime() / 1000);
    });

    test('Fail fetch workspace\'s stats, invalid token', () => {
      const testWorkspaceStats = requestUsersStats(testUser1.bodyObj.token + 'a');
      expect(testWorkspaceStats.res.statusCode).toBe(INVALID_TOKEN);
      expect(testWorkspaceStats.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
    });

    test('Test first data points', () => {
      const testWorkspaceStats = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStats.res.statusCode).toBe(OK);

      // The first data point should be 0 for all metrics at the time
      // that the first user registers
      expect(testWorkspaceStats.bodyObj).toStrictEqual({
        workspaceStats: {
          channelsExist: [
            {
              numChannelsExist: 0,
              timeStamp: expect.any(Number),
            },
          ],
          dmsExist: [
            {
              numDmsExist: 0,
              timeStamp: expect.any(Number),
            },
          ],
          messagesExist: [
            {
              numMessagesExist: 0,
              timeStamp: expect.any(Number),
            },
          ],
          utilizationRate: 0,
        }
      });

      // Account for 1 second delay between requests
      const workspaceStatsObject = testWorkspaceStats.bodyObj.workspaceStats;

      const firstUserTime = workspaceStatsObject.channelsExist[0].timeStamp;
      expect(firstUserTime).toBeGreaterThanOrEqual(expectedFirstUserTime);
      expect(firstUserTime).toBeLessThan(expectedFirstUserTime + 1);

      expect(workspaceStatsObject.dmsExist[0].timeStamp).toStrictEqual(firstUserTime);
      expect(workspaceStatsObject.messagesExist[0].timeStamp).toStrictEqual(firstUserTime);
    });

    test('Test metrics, basic', () => {
      // Create a test channel and DM, and send a test message to the channel
      const testChannel = requestChannelsCreate(testUser1.bodyObj.token, 'channelName', true);
      requestDMCreate(testUser1.bodyObj.token, []);
      requestMessageSend(testUser1.bodyObj.token, testChannel.bodyObj.channelId, 'message');

      const testWorkspaceStats = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStats.res.statusCode).toBe(OK);

      // The workspace's utilization:
      // numUsersWhoAreInLeastOneChannelOrDm / numUsers

      expect(testWorkspaceStats.bodyObj).toStrictEqual({
        workspaceStats: {
          channelsExist: [
            {
              numChannelsExist: 0,
              timeStamp: expect.any(Number),
            },
            {
              numChannelsExist: 1,
              timeStamp: expect.any(Number),
            },
          ],
          dmsExist: [
            {
              numDmsExist: 0,
              timeStamp: expect.any(Number),
            },
            {
              numDmsExist: 1,
              timeStamp: expect.any(Number),
            },
          ],
          messagesExist: [
            {
              numMessagesExist: 0,
              timeStamp: expect.any(Number),
            },
            {
              numMessagesExist: 1,
              timeStamp: expect.any(Number),
            },
          ],
          utilizationRate: 1 / 1,
        }
      });
    });

    test('numUsers increase and decrease, numUsersWhoAreInLeastOneChannelOrDm increase and decrease', () => {
      // testUser1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const testChannel1 = requestChannelsCreate(testUser1.bodyObj.token, 'channel1Name', true);
      const testDM1A = requestDMCreate(testUser1.bodyObj.token, []);
      requestMessageSend(testUser1.bodyObj.token, testChannel1.bodyObj.channelId, 'message1');

      // testUser2 registers, increasing numUsers
      testUser2 = requestAuthRegister('student@unsw.com', 'password', 'Alice', 'Schmoe');
      const testWorkspaceStatsA = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStatsA.res.statusCode).toBe(OK);
      expect(testWorkspaceStatsA.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 2);

      // testUser1 invites testUser2 to their channel, increasing numUsersWhoAreInLeastOneChannelOrDm
      requestChannelInvite(testUser1.bodyObj.token, testChannel1.bodyObj.channelId, testUser2.bodyObj.authUserId);
      const testWorkspaceStatsB = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStatsB.res.statusCode).toBe(OK);
      expect(testWorkspaceStatsB.bodyObj.workspaceStats.utilizationRate).toStrictEqual(2 / 2);

      // testUser2 leaves testUser1's channel, decreasing numUsersWhoAreInLeastOneChannelOrDm
      requestChannelLeave(testUser2.bodyObj.token, testChannel1.bodyObj.channelId);
      const testWorkspaceStatsC = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStatsC.res.statusCode).toBe(OK);
      expect(testWorkspaceStatsC.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 2);

      // testUser1 creates a DM directed to testUser2,
      // increasing numUsersWhoAreInLeastOneChannelOrDm (and numDmsExist)
      const testDM1B = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId]);
      const testWorkspaceStatsD = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStatsD.res.statusCode).toBe(OK);
      expect(testWorkspaceStatsD.bodyObj.workspaceStats.dmsExist.length).toStrictEqual(3);
      expect(testWorkspaceStatsD.bodyObj.workspaceStats.utilizationRate).toStrictEqual(2 / 2);

      // testUser2 leaves testUser1's DM, decreasing numUsersWhoAreInLeastOneChannelOrDm
      requestDMLeave(testUser2.bodyObj.token, testDM1B.bodyObj.dmId);
      const testWorkspaceStatsE = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStatsE.res.statusCode).toBe(OK);
      expect(testWorkspaceStatsE.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 2);

      // testUser2 is removed from Treats, decreasing numUsers
      requestAdminUserRemove(testUser1.bodyObj.token, testUser2.bodyObj.authUserId);
      const testWorkspaceStatsF = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStatsF.res.statusCode).toBe(OK);
      expect(testWorkspaceStatsF.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 1);

      // testUser1 removes their DM (they are still in a channel), decreasing numDmsExist
      requestDMRemove(testUser1.bodyObj.token, testDM1A.bodyObj.dmId);
      const testWorkspaceStatsG = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStatsG.res.statusCode).toBe(OK);
      expect(testWorkspaceStatsG.bodyObj.workspaceStats.dmsExist.length).toStrictEqual(2);
      expect(testWorkspaceStatsG.bodyObj.workspaceStats.involvementRate).toStrictEqual(1 / 1);

      // testUser1 leaves their channel, decreasing numUsersWhoAreInLeastOneChannelOrDm
      requestChannelLeave(testUser1.bodyObj.token, testChannel1.bodyObj.channelId);
      const testWorkspaceStatsH = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStatsH.res.statusCode).toBe(OK);
      expect(testWorkspaceStatsH.bodyObj.workspaceStats.utilizationRate).toStrictEqual(0 / 1);

      // testUser1 joins their channel, increasing numUsersWhoAreInLeastOneChannelOrDm
      requestChannelJoin(testUser1.bodyObj.token, testChannel1.bodyObj.channelId);
      const testWorkspaceStatsI = requestUsersStats(testUser1.bodyObj.token);
      expect(testWorkspaceStatsI.res.statusCode).toBe(OK);
      expect(testWorkspaceStatsI.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 1);
    });

    test('messagesExist/numMsgs increase and decrease, ', () => {

      // numMsgs is the number of messages that exist at the current time

      // numMsgs can increase over time
      // message/send
      // message/senddm

      // standup/send messages only count when the final packaged
      // standup message from standup/start has been sent
      // A standup should only count as single message,
      // timestamped at the moment the standup finished

      // numMsgs should decrease when messages or DMs are removed
      // message/remove (from either channel or DM)
      // dm/remove

      // Messages which have not been sent yet with message/sendlater or
      // message/sendlaterdm are not included

      // FIXME: *********************************************************
    });
  });
});
