import request, { HttpVerb } from 'sync-request';
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

export function requestUsersAll() {
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

function requestHelper(method: HttpVerb, path: string, token: string, payload: object) {
  let qs = {};
  let json = {};
  const headers = { token };

  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  const res = request(method, `${url}:${port}` + path, { qs, json, headers });
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestUserStats(token: string) {
  return requestHelper('GET', '/user/stats/v1', token, {});
}

function requestUsersStats(token: string) {
  return requestHelper('GET', '/users/stats/v1', token, {});
}

function requestMessageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', token, { channelId, message });
}

function requestMessageRemove(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', token, { messageId });
}

function requestChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', token, { channelId });
}

function requestChannelLeave(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', token, { channelId });
}

function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', token, { channelId, uId });
}

function requestAdminUserRemove(token: string, uId: number) {
  return requestHelper('DELETE', '/admin/user/remove/v1', token, { uId });
}

function requestChannelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v2', token, { channelId, uId });
}

function requestMessageSendDM(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', token, { dmId, message });
}

function requestStandupStart(token: string, channelId: number, length: number) {
  return requestHelper('POST', '/standup/start/v1', token, { channelId, length });
}

function requestStandupSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', token, { channelId, message });
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
    let user1Token: string;
    let user1Id: number;
    let testUser2: wrapperOutput;
    let user2Token: string;
    let user2Id: number;

    beforeEach(() => {
      // Create test user 1 and generate the time their account as created
      testUser1 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      user1Token = testUser1.bodyObj.token;
      user1Id = testUser1.bodyObj.authUserId;

      // Create test user 2
      testUser2 = requestAuthRegister('student@unsw.com', 'password', 'Alice', 'Schmoe');
      user2Token = testUser2.bodyObj.token;
      user2Id = testUser2.bodyObj.authUserId;
    });

    test('Fail fetch user\'s stats, invalid token', () => {
      const testUserStats = requestUserStats(user1Token + 'a');
      expect(testUserStats.res.statusCode).toBe(INVALID_TOKEN);
      expect(testUserStats.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
    });

    test('Test first data points', () => {
      const testUserStats = requestUserStats(user1Token);
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

      // Check all data points were created at the same time
      const userStatsObject = testUserStats.bodyObj.userStats;
      const accountCreationTime = userStatsObject.channelsJoined[0].timeStamp;
      expect(userStatsObject.dmsJoined[0].timeStamp).toStrictEqual(accountCreationTime);
      expect(userStatsObject.messagesSent[0].timeStamp).toStrictEqual(accountCreationTime);
    });

    test('Test metrics, basic', () => {
      // Create a test channel and DM, and send a test message to the channel
      const testChannel = requestChannelsCreate(user1Token, 'channelName', true);
      requestDMCreate(user1Token, []);
      requestMessageSend(user1Token, testChannel.bodyObj.channelId, 'message');

      const testUserStats = requestUserStats(user1Token);
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
      // user1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const channel1 = requestChannelsCreate(user1Token, 'channel1Name', true);
      requestDMCreate(user1Token, []);
      requestMessageSend(user1Token, channel1.bodyObj.channelId, 'message1');

      // user2 creates a channel, increasing numChannels
      // numChannels will only increase over time, it will never decrease
      // as there is no way to remove channels
      const channel2 = requestChannelsCreate(user2Token, 'channel2Name', true);
      const user1StatsA = requestUserStats(user1Token);
      expect(user1StatsA.res.statusCode).toBe(OK);
      expect(user1StatsA.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (2 + 1 + 1));

      // user1 joins user2's channel, increasing numChannelsJoined
      requestChannelJoin(user1Token, channel2.bodyObj.channelId);
      const channelJoinTime = Math.floor((new Date()).getTime() / 1000);
      const user1StatsB = requestUserStats(user1Token);
      expect(user1StatsB.res.statusCode).toBe(OK);

      expect(user1StatsB.bodyObj.userStats.channelsJoined.length).toStrictEqual(3);
      expect(user1StatsB.bodyObj.userStats.channelsJoined[2].numChannelsJoined).toStrictEqual(2);
      expect(user1StatsB.bodyObj.userStats.channelsJoined[2].timeStamp).toBeLessThanOrEqual(channelJoinTime);
      expect(user1StatsB.bodyObj.userStats.involvementRate).toStrictEqual((2 + 1 + 1) / (2 + 1 + 1));

      // user1 leaves user2's channel, decreasing numChannelsJoined
      requestChannelLeave(user1Token, channel2.bodyObj.channelId);
      const channelLeaveTime = Math.floor((new Date()).getTime() / 1000);
      const user1StatsC = requestUserStats(user1Token);
      expect(user1StatsC.res.statusCode).toBe(OK);

      expect(user1StatsC.bodyObj.userStats.channelsJoined.length).toStrictEqual(4);
      expect(user1StatsC.bodyObj.userStats.channelsJoined[3].numChannelsJoined).toStrictEqual(1);
      expect(user1StatsC.bodyObj.userStats.channelsJoined[3].timeStamp).toBeLessThanOrEqual(channelLeaveTime);
      expect(user1StatsC.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (2 + 1 + 1));

      // user2 invites user1 to their channel, increasing numChannelsJoined
      requestChannelInvite(user2Token, channel2.bodyObj.channelId, user1Id);
      const channelInviteTime = Math.floor((new Date()).getTime() / 1000);
      const user1StatsD = requestUserStats(user1Token);
      expect(user1StatsD.res.statusCode).toBe(OK);

      expect(user1StatsD.bodyObj.userStats.channelsJoined.length).toStrictEqual(5);
      expect(user1StatsD.bodyObj.userStats.channelsJoined[4].numChannelsJoined).toStrictEqual(2);
      expect(user1StatsD.bodyObj.userStats.channelsJoined[4].timeStamp).toBeLessThanOrEqual(channelInviteTime);
      expect(user1StatsD.bodyObj.userStats.involvementRate).toStrictEqual((2 + 1 + 1) / (2 + 1 + 1));
    });

    test('numDms increase and decrease, numDmsJoined increase and decrease', () => {
      // user1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const channel1 = requestChannelsCreate(user1Token, 'channel1Name', true);
      const DM1 = requestDMCreate(user1Token, []);
      requestMessageSend(user1Token, channel1.bodyObj.channelId, 'message1');

      // user2 creates a testDM2A (not directed to user1), increasing numDms
      requestDMCreate(user2Token, []);
      const user1StatsA = requestUserStats(user1Token);
      expect(user1StatsA.res.statusCode).toBe(OK);
      expect(user1StatsA.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 2 + 1));

      const user2StatsA = requestUserStats(user2Token);
      expect(user2StatsA.res.statusCode).toBe(OK);
      expect(user2StatsA.bodyObj.userStats.dmsJoined.length).toStrictEqual(2);
      expect(user2StatsA.bodyObj.userStats.involvementRate).toStrictEqual((0 + 1 + 0) / (1 + 2 + 1));

      // user2 creates a DM directed to user1
      // numDmsJoined (and numDms) increases for both user1 and user2
      const DM2B = requestDMCreate(user2Token, [user1Id]);
      const dmCreateTime = Math.floor((new Date()).getTime() / 1000);
      const user1StatsB = requestUserStats(user1Token);
      expect(user1StatsB.res.statusCode).toBe(OK);

      expect(user1StatsB.bodyObj.userStats.dmsJoined.length).toStrictEqual(3);
      expect(user1StatsB.bodyObj.userStats.dmsJoined[2].numDmsJoined).toStrictEqual(2);
      expect(user1StatsB.bodyObj.userStats.dmsJoined[2].timeStamp).toBeLessThanOrEqual(dmCreateTime);
      expect(user1StatsB.bodyObj.userStats.involvementRate).toStrictEqual((1 + 2 + 1) / (1 + 3 + 1));

      const user2StatsB = requestUserStats(user2Token);
      expect(user2StatsB.res.statusCode).toBe(OK);
      expect(user2StatsB.bodyObj.userStats.dmsJoined.length).toStrictEqual(3);
      expect(user2StatsB.bodyObj.userStats.dmsJoined[2].numDmsJoined).toStrictEqual(2);
      expect(user2StatsB.bodyObj.userStats.dmsJoined[2].timeStamp).toBeLessThanOrEqual(dmCreateTime);
      expect(user2StatsB.bodyObj.userStats.involvementRate).toStrictEqual((0 + 2 + 0) / (1 + 3 + 1));

      // user1 leaves user2's DM, decreasing numDmsJoined
      requestDMLeave(user1Token, DM2B.bodyObj.dmId);
      const dmLeaveTime = Math.floor((new Date()).getTime() / 1000);
      const user1StatsC = requestUserStats(user1Token);
      expect(user1StatsC.res.statusCode).toBe(OK);

      expect(user1StatsC.bodyObj.userStats.dmsJoined.length).toStrictEqual(4);
      expect(user1StatsC.bodyObj.userStats.dmsJoined[3].numDmsJoined).toStrictEqual(1);
      expect(user1StatsC.bodyObj.userStats.dmsJoined[3].timeStamp).toBeLessThanOrEqual(dmLeaveTime);
      expect(user1StatsC.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 3 + 1));

      // user2 removes the DM previously with user1, decreasing numDms
      requestDMRemove(user2Token, DM2B.bodyObj.dmId);
      const user1StatsD = requestUserStats(user1Token);
      expect(user1StatsD.res.statusCode).toBe(OK);
      expect(user1StatsD.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 2 + 1));

      // user1 removes their DM, decreasing numDmsJoined (and numDms)
      requestDMRemove(user1Token, DM1.bodyObj.dmId);
      const dm1RemoveTime = Math.floor((new Date()).getTime() / 1000);
      const user1StatsE = requestUserStats(user1Token);
      expect(user1StatsE.res.statusCode).toBe(OK);

      expect(user1StatsE.bodyObj.userStats.dmsJoined.length).toStrictEqual(5);
      expect(user1StatsE.bodyObj.userStats.dmsJoined[4].numDmsJoined).toStrictEqual(0);
      expect(user1StatsE.bodyObj.userStats.dmsJoined[4].timeStamp).toBeLessThanOrEqual(dm1RemoveTime);
      expect(user1StatsE.bodyObj.userStats.involvementRate).toStrictEqual((1 + 0 + 1) / (1 + 1 + 1));
    });

    test('Channels: numMsgs increase and decrease, numMsgsSent increase', () => {
      // user1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const channel1 = requestChannelsCreate(user1Token, 'channel1Name', true);
      requestDMCreate(user1Token, []);
      requestMessageSend(user1Token, channel1.bodyObj.channelId, 'message 1A');

      // user2 joins the channel and sends a message, increasing numMsgs
      requestChannelJoin(user2Token, channel1.bodyObj.channelId);
      const message2 = requestMessageSend(user2Token, channel1.bodyObj.channelId, 'message 2');
      const user1StatsA = requestUserStats(user1Token);
      expect(user1StatsA.res.statusCode).toBe(OK);
      expect(user1StatsA.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 1 + 2));

      // user1 sends another message to channel, increasing numMsgsSent (and numMsgs)
      const message1B = requestMessageSend(user1Token, channel1.bodyObj.channelId, 'message 1B');
      const msg1BSendTime = Math.floor((new Date()).getTime() / 1000);
      const user1StatsB = requestUserStats(user1Token);
      expect(user1StatsB.res.statusCode).toBe(OK);

      expect(user1StatsB.bodyObj.userStats.messagesSent.length).toStrictEqual(3);
      expect(user1StatsB.bodyObj.userStats.messagesSent[2].numMessagesSent).toStrictEqual(2);
      expect(user1StatsB.bodyObj.userStats.messagesSent[2].timeStamp).toBeLessThanOrEqual(msg1BSendTime);
      expect(user1StatsB.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 2) / (1 + 1 + 3));

      // user1 makes user2 a channel owner so that user2 can remove
      // their message, decreasing numMsgs
      requestChannelAddOwner(user1Token, channel1.bodyObj.channelId, user2Id);
      requestMessageRemove(user2Token, message2.bodyObj.messageId);
      const user1StatsC = requestUserStats(user1Token);
      expect(user1StatsC.res.statusCode).toBe(OK);
      expect(user1StatsC.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 2) / (1 + 1 + 2));

      // user1 removes their own message, decreasing numMsgs but
      // not numMsgsSent since message removal does not affect numMsgsSent
      requestMessageRemove(user1Token, message1B.bodyObj.messageId);
      const user1StatsD = requestUserStats(user1Token);
      expect(user1StatsD.res.statusCode).toBe(OK);
      expect(user1StatsD.bodyObj.userStats.messagesSent.length).toStrictEqual(3);
      // If the involvement is greater than 1, it should be capped at 1
      // (1 + 1 + 2) / (1 + 1 + 1) > 1
      expect(user1StatsD.bodyObj.userStats.involvementRate).toStrictEqual(1);
    });

    test('DMs: numMsgs increase and decrease, numMsgsSent increase', () => {
      // user1 creates a channel and DM (directed to user2),
      // and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const channel1 = requestChannelsCreate(user1Token, 'channel1Name', true);
      const DM1 = requestDMCreate(user1Token, [user2Id]);
      requestMessageSend(user1Token, channel1.bodyObj.channelId, 'message 1A');

      // user2 sends a message to the DM, increasing numMsgs
      requestMessageSendDM(user2Token, DM1.bodyObj.dmId, 'message 2');
      const user1StatsA = requestUserStats(user1Token);
      expect(user1StatsA.res.statusCode).toBe(OK);
      expect(user1StatsA.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 1 + 2));

      // user1 sends a message to DM, increasing numMsgsSent (and numMsgs)
      const message1B = requestMessageSendDM(user1Token, DM1.bodyObj.dmId, 'message 1B');
      const msg1BSendTime = Math.floor((new Date()).getTime() / 1000);
      const user1StatsB = requestUserStats(user1Token);
      expect(user1StatsB.res.statusCode).toBe(OK);

      expect(user1StatsB.bodyObj.userStats.messagesSent.length).toStrictEqual(3);
      expect(user1StatsB.bodyObj.userStats.messagesSent[2].numMessagesSent).toStrictEqual(2);
      expect(user1StatsB.bodyObj.userStats.messagesSent[2].timeStamp).toBeLessThanOrEqual(msg1BSendTime);
      expect(user1StatsB.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 2) / (1 + 1 + 3));

      // user1 removes their own message, decreasing numMsgs but
      // not numMsgsSent since message removal does not affect numMsgsSent
      requestMessageRemove(user1Token, message1B.bodyObj.messageId);
      const user1StatsC = requestUserStats(user1Token);
      expect(user1StatsC.res.statusCode).toBe(OK);
      expect(user1StatsC.bodyObj.userStats.messagesSent.length).toStrictEqual(3);
      expect(user1StatsC.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 2) / (1 + 1 + 2));

      // user1 removes the DM, decreasing numMsgs again (and numDmsJoined and numDms)
      requestDMRemove(user1Token, DM1.bodyObj.dmId);
      const dm1RemoveTime = Math.floor((new Date()).getTime() / 1000);
      const user1StatsD = requestUserStats(user1Token);
      expect(user1StatsD.res.statusCode).toBe(OK);

      expect(user1StatsD.bodyObj.userStats.messagesSent.length).toStrictEqual(3);
      expect(user1StatsD.bodyObj.userStats.dmsJoined.length).toStrictEqual(3);
      expect(user1StatsD.bodyObj.userStats.dmsJoined[2].numDmsJoined).toStrictEqual(0);
      expect(user1StatsD.bodyObj.userStats.dmsJoined[2].timeStamp).toBeLessThanOrEqual(dm1RemoveTime);

      // If the involvement is greater than 1, it should be capped at 1
      // (1 + 0 + 2) / (1 + 0 + 1) > 1
      expect(user1StatsD.bodyObj.userStats.involvementRate).toStrictEqual(1);
    });

    test('standups: numMsgs increase and decrease, numMsgsSent increase', async () => {
      // user1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const channel1 = requestChannelsCreate(user1Token, 'channel1Name', true);
      requestDMCreate(user1Token, []);
      requestMessageSend(user1Token, channel1.bodyObj.channelId, 'message 1A');

      // user1 starts a standup in that channel and sends messages to the queue
      const standupFinish = requestStandupStart(user1Token, channel1.bodyObj.channelId, 2);
      requestStandupSend(user1Token, channel1.bodyObj.channelId, 'standup message 1A');
      requestStandupSend(user1Token, channel1.bodyObj.channelId, 'standup message 1B');
      requestStandupSend(user1Token, channel1.bodyObj.channelId, 'standup message 1C');

      // Standup messages only count when final packaged standup message is sent
      expect(Math.floor((new Date()).getTime() / 1000)).toBeLessThan(standupFinish.bodyObj.timeFinish);
      const user1StatsA = requestUserStats(user1Token);
      expect(user1StatsA.res.statusCode).toBe(OK);
      expect(user1StatsA.bodyObj.userStats.messagesSent.length).toStrictEqual(2);
      expect(user1StatsA.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 1) / (1 + 1 + 1));

      // A standup should only count as a single message in the channel,
      // timestamped at the moment the standup finished
      // The number of messages sent by the user who started the standup
      // should increase by 1 also
      await new Promise((r) => setTimeout(r, 4000));
      expect(Math.floor((new Date()).getTime() / 1000)).toBeGreaterThanOrEqual(standupFinish.bodyObj.timeFinish);
      const user1StatsB = requestUserStats(user1Token);
      expect(user1StatsB.res.statusCode).toBe(OK);
      expect(user1StatsB.bodyObj.userStats.messagesSent.length).toStrictEqual(3);
      expect(user1StatsB.bodyObj.userStats.messagesSent[2]).toStrictEqual({
        numMessagesSent: 2,
        timeStamp: standupFinish.bodyObj.timeFinish,
      });
      expect(user1StatsB.bodyObj.userStats.involvementRate).toStrictEqual((1 + 1 + 2) / (1 + 1 + 2));
    });
  });

  describe('test /users/stats/v1 i.e. workspace stats', () => {
    let testUser1: wrapperOutput;
    let user1Token: string;

    beforeEach(() => {
      // Create test user 1
      testUser1 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      user1Token = testUser1.bodyObj.token;
    });

    test('Fail fetch workspace\'s stats, invalid token', () => {
      const testWorkspaceStats = requestUsersStats(user1Token + 'a');
      expect(testWorkspaceStats.res.statusCode).toBe(INVALID_TOKEN);
      expect(testWorkspaceStats.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
    });

    test('Test first data points', () => {
      const testWorkspaceStats = requestUsersStats(user1Token);
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

      // Check all data points were created at the same time
      const workspaceStatsObject = testWorkspaceStats.bodyObj.workspaceStats;
      const firstUserTime = workspaceStatsObject.channelsExist[0].timeStamp;
      expect(workspaceStatsObject.dmsExist[0].timeStamp).toStrictEqual(firstUserTime);
      expect(workspaceStatsObject.messagesExist[0].timeStamp).toStrictEqual(firstUserTime);
    });

    test('Test metrics, basic', () => {
      // Create a test channel and DM, and send a test message to the channel
      const testChannel = requestChannelsCreate(user1Token, 'channelName', true);
      requestDMCreate(user1Token, []);
      requestMessageSend(user1Token, testChannel.bodyObj.channelId, 'message');

      const testWorkspaceStats = requestUsersStats(user1Token);
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
      // user1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const channel1 = requestChannelsCreate(user1Token, 'channel1Name', true);
      const DM1A = requestDMCreate(user1Token, []);
      requestMessageSend(user1Token, channel1.bodyObj.channelId, 'message1');

      // user2 registers, increasing numUsers
      const testUser2 = requestAuthRegister('student@unsw.com', 'password', 'Alice', 'Schmoe');
      const user2Token = testUser2.bodyObj.token;
      const user2Id = testUser2.bodyObj.authUserId;

      const workspaceStatsA = requestUsersStats(user1Token);
      expect(workspaceStatsA.res.statusCode).toBe(OK);
      expect(workspaceStatsA.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 2);

      // user1 invites user2 to their channel, increasing numUsersWhoAreInLeastOneChannelOrDm
      requestChannelInvite(user1Token, channel1.bodyObj.channelId, user2Id);
      const workspaceStatsB = requestUsersStats(user1Token);
      expect(workspaceStatsB.res.statusCode).toBe(OK);
      expect(workspaceStatsB.bodyObj.workspaceStats.utilizationRate).toStrictEqual(2 / 2);

      // user2 leaves user1's channel, decreasing numUsersWhoAreInLeastOneChannelOrDm
      requestChannelLeave(user2Token, channel1.bodyObj.channelId);
      const workspaceStatsC = requestUsersStats(user1Token);
      expect(workspaceStatsC.res.statusCode).toBe(OK);
      expect(workspaceStatsC.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 2);

      // user1 creates a DM directed to user2,
      // increasing numUsersWhoAreInLeastOneChannelOrDm (and numDmsExist)
      const DM1B = requestDMCreate(user1Token, [user2Id]);
      const dmCreateTime = Math.floor((new Date()).getTime() / 1000);
      const workspaceStatsD = requestUsersStats(user1Token);
      expect(workspaceStatsD.res.statusCode).toBe(OK);

      expect(workspaceStatsD.bodyObj.workspaceStats.dmsExist.length).toStrictEqual(3);
      expect(workspaceStatsD.bodyObj.workspaceStats.dmsExist[2].numDmsExist).toStrictEqual(2);
      expect(workspaceStatsD.bodyObj.workspaceStats.dmsExist[2].timeStamp).toBeLessThanOrEqual(dmCreateTime);
      expect(workspaceStatsD.bodyObj.workspaceStats.utilizationRate).toStrictEqual(2 / 2);

      // user2 leaves user1's DM, decreasing numUsersWhoAreInLeastOneChannelOrDm
      requestDMLeave(user2Token, DM1B.bodyObj.dmId);
      const workspaceStatsE = requestUsersStats(user1Token);
      expect(workspaceStatsE.res.statusCode).toBe(OK);
      expect(workspaceStatsE.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 2);

      // user2 is removed from Treats, decreasing numUsers
      requestAdminUserRemove(user1Token, user2Id);
      const workspaceStatsF = requestUsersStats(user1Token);
      expect(workspaceStatsF.res.statusCode).toBe(OK);
      expect(workspaceStatsF.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 1);

      // user1 removes their DMs (they are still in a channel), decreasing numDmsExist
      requestDMRemove(user1Token, DM1A.bodyObj.dmId);
      requestDMRemove(user1Token, DM1B.bodyObj.dmId);
      const dmRemoveTime = Math.floor((new Date()).getTime() / 1000);
      const workspaceStatsG = requestUsersStats(user1Token);
      expect(workspaceStatsG.res.statusCode).toBe(OK);

      expect(workspaceStatsG.bodyObj.workspaceStats.dmsExist.length).toStrictEqual(5);
      expect(workspaceStatsG.bodyObj.workspaceStats.dmsExist[4].numDmsExist).toStrictEqual(0);
      expect(workspaceStatsG.bodyObj.workspaceStats.dmsExist[4].timeStamp).toBeLessThanOrEqual(dmRemoveTime);
      expect(workspaceStatsG.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 1);

      // user1 leaves their channel, decreasing numUsersWhoAreInLeastOneChannelOrDm
      requestChannelLeave(user1Token, channel1.bodyObj.channelId);
      const workspaceStatsH = requestUsersStats(user1Token);
      expect(workspaceStatsH.res.statusCode).toBe(OK);
      expect(workspaceStatsH.bodyObj.workspaceStats.utilizationRate).toStrictEqual(0 / 1);

      // user1 joins their channel, increasing numUsersWhoAreInLeastOneChannelOrDm
      requestChannelJoin(user1Token, channel1.bodyObj.channelId);
      const workspaceStatsI = requestUsersStats(user1Token);
      expect(workspaceStatsI.res.statusCode).toBe(OK);
      expect(workspaceStatsI.bodyObj.workspaceStats.utilizationRate).toStrictEqual(1 / 1);
    });

    /*
    test('messagesExist increase and decrease, ', () => {
      // user1 creates a channel and DM, and sends a message to that channel
      // Essentially equivalent to metrics, basic test at this point
      const channel1 = requestChannelsCreate(user1Token, 'channel1Name', true);
      const DM1 = requestDMCreate(user1Token, []);
      requestMessageSend(user1Token, channel1.bodyObj.channelId, 'channel message 1A');

      // user1 sends a message to the DM, increasing messagesExist
      const message1B = requestMessageSendDM(user1Token, DM1.bodyObj.dmId, 'message 1B');
      const msg1BSendTime = Math.floor((new Date()).getTime() / 1000);
      const workspaceStatsA = requestUsersStats(user1Token);
      expect(workspaceStatsA.res.statusCode).toBe(OK);

      expect(workspaceStatsA.bodyObj.workspaceStats.messagesExist.length).toStrictEqual(3);
      expect(workspaceStatsA.bodyObj.workspaceStats.messagesExist[2].numMessagesExist).toStrictEqual(2);
      expect(workspaceStatsA.bodyObj.workspaceStats.messagesExist[2].timeStamp).toBeLessThanOrEqual(msg1BSendTime);

      // user1 removes their message in the DM, decreasing messagesExist
      requestMessageRemove(user1Token, message1B.bodyObj.messageId);
      const msg1BRemoveTime = Math.floor((new Date()).getTime() / 1000);
      const workspaceStatsB = requestUsersStats(user1Token);
      expect(workspaceStatsB.res.statusCode).toBe(OK);

      expect(workspaceStatsB.bodyObj.workspaceStats.messagesExist.length).toStrictEqual(4);
      expect(workspaceStatsB.bodyObj.workspaceStats.messagesExist[3].numMessagesExist).toStrictEqual(1);
      expect(workspaceStatsB.bodyObj.workspaceStats.messagesExist[3].timeStamp).toBeLessThanOrEqual(msg1BRemoveTime);

      // user1 sends multiple messages to the DM, increasing messagesExist
      requestMessageSendDM(user1Token, DM1.bodyObj.dmId, 'message 1C');
      requestMessageSendDM(user1Token, DM1.bodyObj.dmId, 'message 1D');
      requestMessageSendDM(user1Token, DM1.bodyObj.dmId, 'message 1E');

      const workspaceStatsC = requestUsersStats(user1Token);
      expect(workspaceStatsC.res.statusCode).toBe(OK);
      expect(workspaceStatsC.bodyObj.workspaceStats.messagesExist.length).toStrictEqual(7);
      expect(workspaceStatsB.bodyObj.workspaceStats.messagesExist[6].numMessagesExist).toStrictEqual(4);

      // user1 removes the DM, also removes the 3 messages that were in it
      // and logs them as one change
      requestDMRemove(user1Token, DM1.bodyObj.dmId);
      const dm1RemoveTime = Math.floor((new Date()).getTime() / 1000);
      const workspaceStatsD = requestUserStats(user1Token);
      expect(workspaceStatsD.res.statusCode).toBe(OK);

      expect(workspaceStatsD.bodyObj.workspaceStats.messagesExist.length).toStrictEqual(8);
      expect(workspaceStatsB.bodyObj.workspaceStats.messagesExist[7].numMessagesExist).toStrictEqual(1);
      expect(workspaceStatsB.bodyObj.workspaceStats.messagesExist[7].timeStamp).toBeLessThanOrEqual(dm1RemoveTime);

      // TODO:
      // Messages which have not been sent yet with message/sendlater or
      // message/sendlaterdm are not included
    }); */
  });
});
