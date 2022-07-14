import { isHandleValid } from './auth';
import validator from 'validator';
import { validate as validateV4uuid } from 'uuid';
import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/login/v2`,
    {
      json: {
        email: email,
        password: password,
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestAuthLogout(token: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/logout/v1`,
    {
      json: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

export function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}/user/profile/v2`,
    {
      qs: {
        token: token,
        uId: uId
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
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
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

// ======================================== requestAuthRegister Testing ========================================

describe('Testing for requestAuthRegister', () => {
  afterEach(() => {
    requestClear();
  });

  test('Test 1 affirmitive', () => {
    // all should be well
    const response = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const testUserObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handle: 'johnsmith',
    };
    expect(isHandleValid(requestUserProfile(testToken, testUserId).bodyObj.handle)).toBe(true);
    expect(validator.isEmail(requestUserProfile(testToken, testUserId).bodyObj.email)).toBe(true);
    expect(validateV4uuid(testToken)).toBe(true);
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(testUserObject);
  });

  test('Test 2 invalid email', () => {
    // invalid email - no '@' smymbol
    const testUserEmail = 'z5420895$ad.unsw.edu.au';
    const testUserPw = 'myrealpassword';
    const testUserFN = 'Jonathan';
    const testUserLN = 'Schmidt';
    const response = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(false);
  });

  test('Test 3 invalid password', () => {
    // invalid password - less than 5 characters
    const testUserEmail = 'i.love.to.code@university.com';
    const testUserPw = 'this5';
    const testUserFN = 'Jean';
    const testUserLN = 'McQueen';
    const response = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });

  test('Test 4 invalid first name', () => {
    // invalid nameFirst - below [1-50] range
    const testUserEmail = 'having.fun@writing.tests.com';
    const testUserPw = 'thispasswordislongenough';
    const testUserFN = '';
    const testUserLN = 'Tou';
    const response = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });

  test('Test 5 invalid last name', () => {
    // invalid nameLast - above [1-50] range
    const testUserEmail = 'still.having.fun@writing.tests.com';
    const testUserPw = 'thispasswordismorethanlongenough';
    const testUserFN = 'Tim';
    const testUserLN = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'; // 52 characters long
    const response = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });
});

// ======================================== requestAuthLogin Testing ========================================

describe('Testing for requestAuthLogin', () => {
  afterEach(() => {
    requestClear();
  });

  test('Test 1 affirmitive', () => {
    // all should be well
    requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const response = requestAuthLogin('who.is.joe@is.the.question.com', 'yourmumma');
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const testUserObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handle: 'johnsmith',
    };
    expect(requestAuthRegister(requestUserProfile(testToken, testUserId).bodyObj.email, 'myownmumma', 'Jack', 'Fieldson').bodyObj).toStrictEqual({ error: 'error' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(testUserObject);
  });

  test('Test 2 invalid email', () => {
    // invalid email - no existing email
    const testUserEmail = 'z5420895@ad.unsw.edu.au';
    const testUserPw = 'myrealpassword';
    requestAuthRegister('z5420895$ad.unsw.edu.au', testUserPw, 'Jonathan', 'Schmidt');
    const response = requestAuthLogin(testUserEmail, testUserPw);
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(requestAuthRegister(testUserEmail, testUserPw, 'Jonathan', 'Schmidt').bodyObj).not.toBe({ error: 'error' });
  });

  test('Test 3 invalid password', () => {
    // invalid password - wrong password with associated email
    const testUserEmail = 'who.is.joe@is.the.question.com';
    const testUserPw = 'yourdad';
    requestAuthRegister(testUserEmail, 'yourmumma', 'John', 'Smith');
    const response = requestAuthLogin(testUserEmail, testUserPw);
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
    expect(requestAuthRegister(testUserEmail, testUserPw, 'John', 'Smith').bodyObj).not.toBe({ error: 'error' });
  });
});

type wrapperOutput = {
  res: any,
  bodyObj: any,
};

describe('test /auth/logout/v1', () => {
  beforeEach(() => {
    requestClear();
  });

  let testUser: wrapperOutput;

  beforeEach(() => {
    // Create a test user
    testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
  });

  test('Success user log out', () => {
    const testLogout1 = requestAuthLogout(testUser.bodyObj.token);
    expect(testLogout1.res.statusCode).toBe(OK);
    expect(testLogout1.bodyObj).toStrictEqual({});

    // Attempt to log out again with newly invalid token
    const testLogout2 = requestAuthLogout(testUser.bodyObj.token);
    expect(testLogout2.res.statusCode).toBe(OK);
    expect(testLogout2.bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Fail user log out, invalid token', () => {
    const testLogout = requestAuthLogout(testUser.bodyObj.token + 'a');
    expect(testLogout.res.statusCode).toBe(OK);
    expect(testLogout.bodyObj).toStrictEqual({ error: 'error' });
  });
});
