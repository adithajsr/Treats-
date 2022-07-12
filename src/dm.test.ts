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
    let testUser5: wrapperOutput;

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
      testUser4 = requestAuthRegister('jbloggs@proton.com', '111111', 'Jo', 'Bloggs');
      expect(testUser4.bodyObj).not.toStrictEqual({ error: 'error' });

      // Create test user 5
      testUser5 = requestAuthRegister('samb@yandex.com', 'dragon', 'Sam', 'Bloggs');
      expect(testUser5.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    test('Success create new DM, two users in DM', () => {

      // FIXME:

      // Creator of DM is first alphabetically
      const testDM1 = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId]);
      expect(testDM1.res.statusCode).toBe(OK);
      expect(testDM1.bodyObj).toStrictEqual({ error: 'error' });

      // Creator of DM is second alphabetically
    });

    test('Success create new DM, more than two users in DM', () => {
      // TODO: try a few different creators and number of users
    });

    test('Fail create new DM, invalid token', () => {
      const testDM = requestDMCreate(testUser4.bodyObj.token + 'a', [testUser1.bodyObj.authUserId, testUser2.bodyObj.authUserId]);
      expect(testDM.res.statusCode).toBe(OK);
      expect(testDM.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('Fail create new DM, invalid uId(s)', () => {
      // One invalid uId, invalid uId is not creator's uID
      const testDM1 = requestDMCreate(testUser1.bodyObj.token, [testUser4.bodyObj.authUserId, testUser5.bodyObj.authUserId + 20]);
      expect(testDM1.res.statusCode).toBe(OK);
      expect(testDM1.bodyObj).toStrictEqual({ error: 'error' });

      // One invalid uId, invalid uId is creator's uID
      const testDM2 = requestDMCreate(testUser1.bodyObj.token, [testUser1.bodyObj.authUserId, testUser2.bodyObj.authUserId]);
      expect(testDM2.res.statusCode).toBe(OK);
      expect(testDM2.bodyObj).toStrictEqual({ error: 'error' });

      // Multiple invalid uIds
      const testDM3 = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId + 20, testUser5.bodyObj.authUserId + 20]);
      expect(testDM3.res.statusCode).toBe(OK);
      expect(testDM3.bodyObj).toStrictEqual({ error: 'error' });
    });

    test('Fail create new DM, duplicate uIds', () => {
      // One pair of duplicate uIds
      const testDM1 = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId, testUser2.bodyObj.authUserId, testUser4.bodyObj.authUserId, testUser5.bodyObj.authUserId]);
      expect(testDM1.res.statusCode).toBe(OK);
      expect(testDM1.bodyObj).toStrictEqual({ error: 'error' });

      // Multiple pairs of duplicate uIds
      const testDM2 = requestDMCreate(testUser1.bodyObj.token, [testUser2.bodyObj.authUserId, testUser2.bodyObj.authUserId, testUser5.bodyObj.authUserId, testUser5.bodyObj.authUserId]);
      expect(testDM2.res.statusCode).toBe(OK);
      expect(testDM2.bodyObj).toStrictEqual({ error: 'error' });
    });

  });

});
