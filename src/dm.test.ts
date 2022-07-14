import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

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

// function requestDMList(token: string) {
//   const res = request(
//     'GET',
//     `${url}:${port}/dm/list/v1`,
//     {
//       qs: { token },
//     }
//   );
//   return {
//     res: res,
//     bodyObj: JSON.parse(String(res.getBody())),
//   };
// }

// function requestDMRemove(token: string, dmId: number) {
//   const res = request(
//     'DELETE',
//     `${url}:${port}/dm/remove/v1`,
//     {
//       qs: { token, dmId },
//     }
//   );
//   return {
//     res: res,
//     bodyObj: JSON.parse(String(res.getBody())),
//   };
// }

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

// function requestDMLeave(token: string, dmId: number) {
//   const res = request(
//     'POST',
//     `${url}:${port}/dm/leave/v1`,
//     {
//       json: { token, dmId },
//     }
//   );
//   return {
//     res: res,
//     bodyObj: JSON.parse(String(res.getBody())),
//   };
// }

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
});
