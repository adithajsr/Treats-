import validator from 'validator';
import { requestUserProfile, requestClear, requestAuthRegister, requestAuthLogin, requestAuthLogout, requestPasswordRequest, requestPasswordReset } from './test.helpers';
import { getData } from './dataStore';
import config from './config.json';
// eslint-disable-next-line
// @ts-ignore
import codec from 'string-codec';
import { v4 as generateV4uuid } from 'uuid';

const OK = 200;
const INVALID_TOKEN = 403;
const port = config.port;
const url = config.url;

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
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    };
    expect(isHandleValid(requestUserProfile(testToken, testUserId).bodyObj.handleStr)).toBe(true);
    expect(validator.isEmail(requestUserProfile(testToken, testUserId).bodyObj.email)).toBe(true);
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
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
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
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    };
    expect(isHandleValid(requestUserProfile(testToken, testUserId).bodyObj.handleStr)).toBe(true);
    expect(validator.isEmail(requestUserProfile(testToken, testUserId).bodyObj.email)).toBe(true);
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
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
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

describe('test /auth/logout/v2', () => {
  beforeEach(() => {
    requestClear();
  });

  afterEach(() => {
    requestClear();
  });

  let testUser: wrapperOutput;

  beforeEach(() => {
    // Create a test user
    testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
  });

  test('Success user log out', () => {
    const testLogout1 = requestAuthLogout(testUser.bodyObj.token);
    expect(testLogout1.res.statusCode).toBe(OK);
    expect(testLogout1.bodyObj).toStrictEqual({});

    // Attempt to log out again with newly invalid token
    const testLogout2 = requestAuthLogout(testUser.bodyObj.token);
    expect(testLogout2.res.statusCode).toBe(INVALID_TOKEN);
    expect(testLogout2.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
  });

  test('Fail user log out, invalid token', () => {
    const testLogout = requestAuthLogout(testUser.bodyObj.token + 'a');
    expect(testLogout.res.statusCode).toBe(INVALID_TOKEN);
    expect(testLogout.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
  });
});

describe('test /auth/passwordreset/request/v1 & /auth/passwordreset/reset/v1', () => {
  requestClear();
  test('Success user log out', () => {
    const testUser = requestAuthRegister('ithoughtsydneyhadgoodweather@gmail.com', '123abc!@#', 'John', 'Doe');
    const testUid = testUser.bodyObj.authUserId;

    // has not logged out
    requestPasswordRequest('ithoughtsydneyhadgoodweather@gmail.com');

    const testLogout = requestAuthLogout(testUser.bodyObj.token);
    expect(testLogout.res.statusCode).toBe(OK);
    expect(testLogout.bodyObj).toStrictEqual({});

    // has logged out
    requestPasswordRequest('ithoughtsydneyhadgoodweather@gmail.com');
    // logging in again
    requestAuthLogin('ithoughtsydneyhadgoodweather@gmail.com', '123abc!@#');

    const returnValue1 = requestPasswordReset(codec.encoder(String(generateV4uuid() + '-1'), 'base64'), 'this5');
    expect(returnValue1.res.statusCode).toBe(400);
    expect(returnValue1.bodyObj.error).toStrictEqual({ message: 'password entered is less than 6 characters long' });

    const returnValue2 = requestPasswordReset(codec.encoder(String(generateV4uuid() + '-1'), 'base64'), 'therestwelve');
    expect(returnValue2.res.statusCode).toBe(400);
    expect(returnValue2.bodyObj.error).toStrictEqual({ message: 'resetCode is not a valid reset code' });

    // find token and uuid
    const dataSet = getData();
    let workingResetCode;
    for (const item of dataSet.token) {
      if (item.uId === Number(`-${testUid}`)) {
        workingResetCode = codec.encoder(String(item.token + String(item.uId)), 'base64');
      }
    }

    const returnValue3 = requestPasswordReset(workingResetCode, 'therestwelve');
    expect(returnValue3.res.statusCode).toBe(OK);
    expect(returnValue3.bodyObj).toStrictEqual({});

    requestClear();
  });
});
