import validator from 'validator';
import { requestClear, requestUserProfile } from './users.test';
import { validate as validateV4uuid } from 'uuid';
import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
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
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/login/v3`,
    {
      json: {
        email: email,
        password: password,
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
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

function requestPasswordRequest(email: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/request/v1`,
    {
      json: {
        email: email,
      },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

/* <Checks if a handle complies to the rules laid out in 6.2.2 of Iteration 1>

Arguments:
handle (string) - <minimum length 2, with posibility of >
Return Value:
returns <true> on <handle meeting requirements>
returns <false> on <handle not meeting requirements> */
export function isHandleValid(handle: string) : boolean {
  const regex = /^[a-z]{0,20}[0-9]*/;
  return regex.test(handle);
}

// ======================================== requestAuthRegister Testing ========================================

describe('Testing for requestAuthRegister', () => {
  afterEach(() => {
    requestClear();
  });

  test('Test 1 affirmitive', () => {
    // all should be well
    requestClear();
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
      handleStr: 'johnsmith',
    };
    expect(isHandleValid(requestUserProfile(testToken, testUserId).bodyObj.handleStr)).toBe(true);
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
    expect(response.res.statusCode).toBe(400);
    const returnObject = response.bodyObj;
    expect(returnObject.error).toStrictEqual({ message: 'invalid input details' });
    expect(validator.isEmail(testUserEmail)).toBe(false);
  });

  test('Test 3 invalid password', () => {
    // invalid password - less than 5 characters
    const testUserEmail = 'i.love.to.code@university.com';
    const testUserPw = 'this5';
    const testUserFN = 'Jean';
    const testUserLN = 'McQueen';
    const response = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(response.res.statusCode).toBe(400);
    const returnObject = response.bodyObj;
    expect(returnObject.error).toStrictEqual({ message: 'invalid input details' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });

  test('Test 4 invalid first name', () => {
    // invalid nameFirst - below [1-50] range
    const testUserEmail = 'having.fun@writing.tests.com';
    const testUserPw = 'thispasswordislongenough';
    const testUserFN = '';
    const testUserLN = 'Tou';
    const response = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(response.res.statusCode).toBe(400);
    const returnObject = response.bodyObj;
    expect(returnObject.error).toStrictEqual({ message: 'invalid input details' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });

  test('Test 5 invalid last name', () => {
    // invalid nameLast - above [1-50] range
    const testUserEmail = 'still.having.fun@writing.tests.com';
    const testUserPw = 'thispasswordismorethanlongenough';
    const testUserFN = 'Tim';
    const testUserLN = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'; // 52 characters long
    const response = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(response.res.statusCode).toBe(400);
    const returnObject = response.bodyObj;
    expect(returnObject.error).toStrictEqual({ message: 'invalid input details' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });

  test('Test 6 extra-long name', () => {
    const testUserEmail = 'almost.having.fun@writing.tests.com';
    const testUserPw = 'thispasswordismorethanlongenough';
    const testUserFN = 'Sebastian';
    const testUserLN = 'Fitzagamemnon';
    const response = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      uId: 1,
      email: testUserEmail,
      nameFirst: testUserFN,
      nameLast: testUserLN,
      handleStr: 'sebastianfitzagamemn',
    });
  });

  test('Test 7 duplicate handles', () => {
    requestClear();
    requestAuthRegister('blank@is.the.question.com', 'yourmumma', 'John', 'Smith');
    requestAuthRegister('zero@is.the.question.com', 'yourmumma', 'John', 'Smith');
    requestAuthRegister('one@is.the.question.com', 'yourmumma', 'John', 'Smith');
    requestAuthRegister('two@is.the.question.com', 'yourmumma', 'John', 'Smith');
    requestAuthRegister('three@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const response = requestAuthRegister('four@is.the.question.com', 'yourmumma', 'John', 'Smith');
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;

    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const testUserObject = {
      uId: testUserId,
      email: 'four@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith4',
    };
    expect(isHandleValid(requestUserProfile(testToken, testUserId).bodyObj.handleStr)).toBe(true);
    expect(validator.isEmail(requestUserProfile(testToken, testUserId).bodyObj.email)).toBe(true);
    expect(validateV4uuid(testToken)).toBe(true);
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(testUserObject);
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
      handleStr: 'johnsmith',
    };
    expect(requestAuthRegister(requestUserProfile(testToken, testUserId).bodyObj.email, 'myownmumma', 'Jack', 'Fieldson').bodyObj.error).toStrictEqual({ message: 'invalid input details' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(testUserObject);
  });

  test('Test 2 invalid email', () => {
    // invalid email - no existing email
    const testUserEmail = 'z5420895@ad.unsw.edu.au';
    const testUserPw = 'myrealpassword';
    requestAuthRegister('z5420895$ad.unsw.edu.au', testUserPw, 'Jonathan', 'Schmidt');
    const response = requestAuthLogin(testUserEmail, testUserPw);
    expect(response.res.statusCode).toBe(400);
    const returnObject = response.bodyObj;
    expect(returnObject.error).toStrictEqual({ message: 'email entered does not belong to a user' });
    expect(requestAuthRegister(testUserEmail, testUserPw, 'Jonathan', 'Schmidt').bodyObj.error).not.toBe(expect.any(Object));
  });

  test('Test 3 invalid password', () => {
    // invalid password - wrong password with associated email
    const testUserEmail = 'who.is.joe@is.the.question.com';
    const testUserPw = 'yourdad';
    requestAuthRegister(testUserEmail, 'yourmumma', 'John', 'Smith');
    const response = requestAuthLogin(testUserEmail, testUserPw);
    expect(response.res.statusCode).toBe(400);
    const returnObject = response.bodyObj;
    expect(returnObject.error).toStrictEqual({ message: 'password is not correct' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
    expect(requestAuthRegister(testUserEmail, testUserPw, 'John', 'Smith').bodyObj.error).not.toBe(expect.any(Object));
  });

  test('Test 4 invalid token - does not exist', () => {
    requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const response = requestAuthLogin('who.is.joe@is.the.question.com', 'yourmumma');
    expect(response.res.statusCode).toBe(OK);
    const returnObject = response.bodyObj;
    const testUserId = returnObject.authUserId;
    let testToken = returnObject.token;
    let firstNum: any = String(testToken.substr(0, 1));
    if (Number(firstNum.charCodeAt(0)) === 57) {
      firstNum = 0;
    } else {
      firstNum++;
    }
    testToken = String(firstNum) + testToken.slice(1);
    expect(requestUserProfile(testToken, testUserId).bodyObj.error).toStrictEqual({ message: 'Invalid token' });
  });

  test('Test 5 invalid token - incorrect form', () => {
    requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const response1 = requestAuthLogin('who.is.joe@is.the.question.com', 'yourmumma');
    expect(response1.res.statusCode).toBe(OK);
    const returnObject = response1.bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = 'incorrecttokenform';
    const response2 = requestUserProfile(testToken, testUserId);
    expect(response2.res.statusCode).toBe(403);
    expect(response2.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
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
    // Create a test user validemail@gmail.com
    testUser = requestAuthRegister('jack.stuart.braga@gmail.com', '123abc!@#', 'John', 'Doe');
    expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
  });

  test('Success user log out', () => {
    const testLogout1 = requestAuthLogout(testUser.bodyObj.token);
    expect(testLogout1.res.statusCode).toBe(OK);
    expect(testLogout1.bodyObj).toStrictEqual({});

    requestPasswordRequest('jack.stuart.braga@gmail.com');

    // Attempt to log out again with newly invalid token
    const testLogout2 = requestAuthLogout(testUser.bodyObj.token);
    expect(testLogout2.res.statusCode).toBe(OK);
    expect(testLogout2.bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Fail user log out, invalid token', () => {
    const testLogout = requestAuthLogout(testUser.bodyObj.token + 'a');
    expect(testLogout.res.statusCode).toBe(OK);
    expect(testLogout.bodyObj).toStrictEqual({ error: 'error' });
    requestClear();
  });
});

