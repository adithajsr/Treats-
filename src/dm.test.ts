import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];
const authSam = ['samuelSchreyer@gmail.com', 'password', 'Sam', 'Schreyer'];

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
    bodyObj: JSON.parse(String(res.getBody())),
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
    bodyObj: JSON.parse(String(res.getBody())),
  };
}

function requestDMRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/dm/remove/v1`,
    {
      qs: { token, dmId },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.getBody())),
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
    bodyObj: JSON.parse(String(res.getBody())),
  };
}

function requestDMLeave(token: string, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}/dm/leave/v1`,
    {
      json: { token, dmId },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.getBody())),
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
    bodyObj: JSON.parse(String(res.getBody())),
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

test('Testing invalid dmId', () => {
  requestClear();
  requestClear();
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj;
  const danielToken = danielUser.token;
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
  const maiyaId = maiyaUser.authUserId;
  const dmId = requestDMCreate(danielToken, maiyaId).bodyObj.dmId;

  const obj = requestDMLeave(danielToken, dmId + 20);
  expect(obj.bodyObj).toMatchObject({ error: 'error' });
  expect(obj.res.statusCode).toBe(OK);
});

test('Non-member attempts to leave', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;
  const maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj.authUserId;
  const dmId = requestDMCreate(danielToken, maiyaId).bodyObj.dmId;
  const obj = requestDMLeave(samToken, dmId);
  expect(obj.bodyObj).toMatchObject({ error: 'error' });
  expect(obj.res.statusCode).toBe(OK);
});

test('Default case', () => {
  requestClear();
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj;
  const danielToken = danielUser.token;
  const danielId = danielUser.authUserId;
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
  const maiyaToken = maiyaUser.token;
  const maiyaId = maiyaUser.authUserId;

  const dmId = requestDMCreate(danielToken, [maiyaId]).bodyObj.dmId;

   const returnObject = requestDMDetails(danielToken, dmId).bodyObj;
   expect(returnObject.name).toEqual('danielyung, maiyataylor'); //NEED TO FIX DM CREATE OR DOUBLE CHECK IT

  requestDMLeave(maiyaToken, dmId);

  const returnObject2 = requestDMDetails(danielToken, dmId);
  expect(returnObject2.bodyObj.members[0].uId).toEqual(danielId);
  expect(returnObject2.res.statusCode).toBe(OK);
});

test('When all members leave', () => {
  requestClear();
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj;
  const danielToken = danielUser.token;
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
  const maiyaToken = maiyaUser.token;
  const maiyaId = maiyaUser.authUserId;

  const dmId = requestDMCreate(danielToken, [maiyaId]).bodyObj.dmId;

   const returnObject = requestDMDetails(danielToken, dmId);
   expect(returnObject.bodyObj.name).toEqual('danielyung, maiyataylor');

  requestDMLeave(danielToken, dmId);
  requestDMLeave(maiyaToken, dmId);

  const returnObject2 = requestDMDetails(danielToken, dmId); // this token would cease to exist or be valid in the system so is
  expect(returnObject2.bodyObj).toMatchObject({ error: 'error' });
  expect(returnObject2.res.statusCode).toBe(OK);
  const returnObject3 = requestDMDetails(maiyaToken, dmId);
  expect(returnObject3.res.statusCode).toBe(OK);
});

describe('dm capabilities', () => {
  beforeEach(() => {
    requestClear();
  });

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

  describe('test /dm/create/v1', () => {
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
    let testDM1: wrapperOutput;
    let testDetails1: wrapperOutput;

    beforeEach(() => {
      // testUser1 is the creator of testDM1
      testDM1 = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId, testUser3.bodyObj.authUserId]);
      expect(testDM1.bodyObj).not.toStrictEqual({ error: 'error' });
      testDetails1 = requestDMDetails(testUser1.bodyObj.token, testDM1.bodyObj.dmId);
    });

    test('Fail DM list, invalid token', () => {
      const testList = requestDMList(testUser4.bodyObj.token + 'a');

      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('One DM, authorised user is in DM', () => {
      // Only DM is testDM1, testUser3 is in testDM1
      const testList = requestDMList(testUser3.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({
        dms: [
          {
            dmId: testDM1.bodyObj.dmId,
            name: testDetails1.bodyObj.name,
          }
        ]
      });
    });

    test('One DM, authorised user is not in DM', () => {
      // Only DM is testDM1, testUser4 is not in testDM1
      const testList = requestDMList(testUser4.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({
        dms: []
      });
    });

    test('Multiple DMs, authorised user is in all DMs', () => {
      // testUser1 is in all DMs
      const dmA = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId]);
      const detailsA = requestDMDetails(testUser1.bodyObj.token, dmA.bodyObj.dmId);

      const dmB = requestDMCreate(testUser4.bodyObj.token, [testUser1.bodyObj.authUserId, testUser3.bodyObj.authUserId]);
      const detailsB = requestDMDetails(testUser4.bodyObj.token, dmB.bodyObj.dmId);

      const dmC = requestDMCreate(testUser2.bodyObj.token, [testUser1.bodyObj.authUserId, testUser3.bodyObj.authUserId, testUser4.bodyObj.authUserId]);
      const detailsC = requestDMDetails(testUser2.bodyObj.token, dmC.bodyObj.dmId);

      const expected = new Set([
        {
          dmId: testDM1.bodyObj.dmId,
          name: testDetails1.bodyObj.name,
        },
        {
          dmId: dmA.bodyObj.dmId,
          name: detailsA.bodyObj.name,
        },
        {
          dmId: dmB.bodyObj.dmId,
          name: detailsB.bodyObj.name,
        },
        {
          dmId: dmC.bodyObj.dmId,
          name: detailsC.bodyObj.name,
        },
      ]);

      const testList = requestDMList(testUser1.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      const received = new Set(testList.bodyObj.dms);
      expect(received).toStrictEqual(expected);
    });

    test('Multiple DMs, authorised user is in some DMs', () => {
      // testUser1 is in some DMs
      const dmA = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId]);
      const detailsA = requestDMDetails(testUser1.bodyObj.token, dmA.bodyObj.dmId);

      requestDMCreate(testUser4.bodyObj.token, [testUser2.bodyObj.authUserId, testUser3.bodyObj.authUserId]);

      requestDMCreate(testUser2.bodyObj.token, [testUser3.bodyObj.authUserId]);

      const expected = new Set([
        {
          dmId: testDM1.bodyObj.dmId,
          name: testDetails1.bodyObj.name,
        },
        {
          dmId: dmA.bodyObj.dmId,
          name: detailsA.bodyObj.name,
        },
      ]);

      const testList = requestDMList(testUser1.bodyObj.token);

      expect(testList.res.statusCode).toBe(OK);
      const received = new Set(testList.bodyObj.dms);
      expect(received).toStrictEqual(expected);
    });

    test('Multiple DMs, authorised user is in no DMs', () => {
      // testUser4 is in no DMs
      requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId]);
      requestDMCreate(testUser2.bodyObj.token, [testUser1.bodyObj.authUserId, testUser3.bodyObj.authUserId]);
      requestDMCreate(testUser2.bodyObj.token, [testUser3.bodyObj.authUserId]);

      const testList = requestDMList(testUser4.bodyObj.token);
      expect(testList.res.statusCode).toBe(OK);
      expect(testList.bodyObj).toStrictEqual({
        dms: []
      });
    });
  });

  describe('test /dm/remove/v1', () => {
    let testDM1: wrapperOutput;

    beforeEach(() => {
      // testUser1 is the original creator of testDM1
      testDM1 = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId, testUser3.bodyObj.authUserId]);
      expect(testDM1.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    test('Success remove DM, two users in DM', () => {
      const testDM = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId]);
      const testRemove = requestDMRemove(testUser1.bodyObj.token, testDM.bodyObj.dmId);
      expect(testRemove.res.statusCode).toBe(OK);
      expect(testRemove.bodyObj).toStrictEqual({});

      // dmId of testDM should now be invalid
      const testDetails = requestDMDetails(testUser1.bodyObj.token, testDM.bodyObj.dmId);
      expect(testDetails.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('Success remove DM, more than two users in DM', () => {
      const testDM = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId, testUser3.bodyObj.authUserId]);

      // testUser 2 leaves
      requestDMLeave(testUser2.bodyObj.token, testDM.bodyObj.dmId);

      const testRemove = requestDMRemove(testUser1.bodyObj.token, testDM.bodyObj.dmId);
      expect(testRemove.res.statusCode).toBe(OK);
      expect(testRemove.bodyObj).toStrictEqual({});

      // dmId of testDM should now be invalid
      const testDetails = requestDMDetails(testUser1.bodyObj.token, testDM.bodyObj.dmId);
      expect(testDetails.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('Fail remove DM, invalid token', () => {
      const testRemove = requestDMRemove(testUser4.bodyObj.token + 'a', testDM1.bodyObj.dmId);
      expect(testRemove.res.statusCode).toBe(OK);
      expect(testRemove.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('Fail remove DM, invalid dmId', () => {
      const testRemove = requestDMRemove(testUser1.bodyObj.token, testDM1.bodyObj.dmId + 20);
      expect(testRemove.res.statusCode).toBe(OK);
      expect(testRemove.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('Fail remove DM, authorised user is not in the DM', () => {
      // testUser4 was never in testDM1
      const testRemove1 = requestDMRemove(testUser4.bodyObj.token, testDM1.bodyObj.dmId);
      expect(testRemove1.res.statusCode).toBe(OK);
      expect(testRemove1.bodyObj).toStrictEqual({ error: 'error' });

      // testUser1 was the original creator of testDM1 but left
      requestDMLeave(testUser1.bodyObj.token, testDM1.bodyObj.dmId);
      const testRemove2 = requestDMRemove(testUser1.bodyObj.token, testDM1.bodyObj.dmId);
      expect(testRemove2.res.statusCode).toBe(OK);
      expect(testRemove2.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('Fail remove DM, authorised user is in the DM but is not the creator', () => {
      // testUser2 is in testDM1 but testUser1 is the creator
      const testRemove = requestDMRemove(testUser3.bodyObj.token, testDM1.bodyObj.dmId);
      expect(testRemove.res.statusCode).toBe(OK);
      expect(testRemove.bodyObj).toStrictEqual({ error: 'error' });
    });
  });
});
