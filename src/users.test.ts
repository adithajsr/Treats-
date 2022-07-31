import { requestAuthRegister } from './auth.test';
import request from 'sync-request';
import config from './config.json';

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
        token: token,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
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
        token: token,
        email: email,
      }

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
        token: token,
        handleStr: handleStr,
      }
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
        token: token,
        uId: uId
      }
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

function requestUserStats(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/user/stats/v1`,
    {
      qs: { token },
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
      qs: { token },
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
    let testUser: user;

    beforeEach(() => {
      // Create a test user
      testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    });

    test('Fail fetch user\'s stats, invalid token', () => {
    });

    test('Test first data points', () => {
      // The first data point should be 0 for all metrics at the time
      // that their account was created
    });

    test('Test metrics other than involvement', () => {
      // The number of channels the user is a part of
      // The number of DMs the user is a part of
      // The number of messages the user has sent
    });

    test('involvement is 0', () => {
      // The user's involvement:
        // sum(numChannelsJoined, numDmsJoined, numMsgsSent) divided by 
        // sum(numChannels, numDms, numMsgs)

      // If the denominator is 0, involvement should be 0
    });

    test('numChannelsJoined increase and decrease', () => {
      // The number of channels that the user is a part of can increase over time
      // If the involvement is greater than 1, it should be capped at 1
      // channels/create
      // channel/join
      // channel/invite

      // The number of channels that the user is a part of can decrease over time
      // channel/leave
    });

    test('numDmsJoined increase and decrease', () => {
      // The number of DMs that the user is a part of can increase over time
      // If the involvement is greater than 1, it should be capped at 1
      // dm/create

      // The number of DMs that the user is a part of can decrease over time
      // dm/remove
      // dm/leave
    });

    test('numMsgsSent increase', () => {
      // The number of messages sent will only increase over time
      // If the involvement is greater than 1, it should be capped at 1
      // message/send
      // message/senddm

      // standup/send messages only count when the final packaged
      // standup message from standup/start has been sent
      // When a standup is sent, the number of messages sent by the user
      // who started the standup should increase by 1

      // The removal of messages does NOT affect the number of messages sent
      // message/remove
      // dm/remove
    });

    test('numChannels increase', () => {
      // The number of channels sent will only increase over time
      // numChannels will never decrease as there is no way to remove channels
      // channels/create
    });

    test('numDms increase and decrease', () => {
      // The number of DMs in the workspace can increase over time
      // dm/create

      // numDms will only decrease when dm/remove is called
      // dm/remove
    });

    test('numMsgs increase and decrease', () => {
      // numMsgs is the number of messages that exist at the current time

      // numMsgs can increase over time
      // message/send
      // message/senddm

      // standup/send messages only count when the final packaged
      // standup message from standup/start has been sent
      // A standup should only count as single message

      // numMsgs should decrease when messages or DMs are removed
      // message/remove
      // dm/remove

      // Messages which have not been sent yet with message/sendlater or
      // message/sendlaterdm are not included
    });
  });

  describe('test /users/stats/v1 i.e. workspace stats', () => {
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

    test('Fail fetch workspace\'s stats, invalid token', () => {
    });

    test('Test first data points', () => {
      // The first data point should be 0 for all metrics at the time
      // that the first user registers
    });

    test('Test metrics other than utilization', () => {
      // The number of channels that exist currently
      // The number of DMs that exist currently
      // The number of messages that exist currently
      // The workspace's utilization
        // numUsersWhoHaveJoinedAtLeastOneChannelOrDm / numUsers

      // admin/user/remove/v1
    });

    test('utilization is 0', () => {
      // The workspace's utilization
        // numUsersWhoHaveJoinedAtLeastOneChannelOrDm / numUsers
        
      // If the denominator is 0, involvement should be 0
    });

    test('numUsersWhoHaveJoinedAtLeastOneChannelOrDm increase and decrease', () => {
      // The number of users who are currently in at least one channel or DM
      // can increase over time
      
      // CHANNELS:
      // channels/create
      // channel/join
      // channel/invite

      // DMS:
      // dm/create

      // The number of users who are currently in at least one channel or DM
      // can decrease over time

      // CHANNELS:
      // channel/leave

      // DMS:
      // dm/remove
      // dm/leave
    });

    test('numUsers increase and decrease', () => {
      // The number of users in the workspace can increase over time
      // auth/register

      // The number of users in the workspace can decrease over time
      // admin/user/remove
    });
  });
});
