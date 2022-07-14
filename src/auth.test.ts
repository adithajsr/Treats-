import { isHandleValid } from './auth'; // will require authLogin and doesEmailExist
import { clearV1 } from './other';
import validator from 'validator';
import { validate as validateV4uuid } from 'uuid';
import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
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
  return JSON.parse(res.getBody() as string);
}

function requestUserProfile(token: string, uId: number) {
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
  return JSON.parse(res.getBody() as string);
}

// ======================================== requestAuthRegister Testing ========================================

describe('Testing for requestAuthRegister', () => {
  test('Test 1 affirmitive', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const testUserObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handle: 'johnsmith',
    };
    expect(isHandleValid(requestUserProfile(testToken, testUserId).handle)).toBe(true);
    expect(validator.isEmail(requestUserProfile(testToken, testUserId).email)).toBe(true);
    expect(validateV4uuid(testToken)).toBe(true);
    expect(requestUserProfile(testToken, testUserId)).toStrictEqual(testUserObject);
  });

  test('Test 2 invalid email', () => {
    // invalid email - no '@' smymbol
    const testUserEmail = 'z5420895$ad.unsw.edu.au';
    const testUserPw = 'myrealpassword';
    const testUserFN = 'Jonathan';
    const testUserLN = 'Schmidt';
    const returnObject = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(false);
  });

  test('Test 3 invalid password', () => {
    // invalid password - less than 5 characters
    const testUserEmail = 'i.love.to.code@university.com';
    const testUserPw = 'this5';
    const testUserFN = 'Jean';
    const testUserLN = 'McQueen';
    const returnObject = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });

  test('Test 4 invalid first name', () => {
    // invalid nameFirst - below [1-50] range
    const testUserEmail = 'having.fun@writing.tests.com';
    const testUserPw = 'thispasswordislongenough';
    const testUserFN = '';
    const testUserLN = 'Tou';
    const returnObject = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });

  test('Test 5 invalid last name', () => {
    // invalid nameLast - above [1-50] range
    const testUserEmail = 'still.having.fun@writing.tests.com';
    const testUserPw = 'thispasswordismorethanlongenough';
    const testUserFN = 'Tim';
    const testUserLN = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'; // 52 characters long
    const returnObject = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(returnObject).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });
});

/*
// ======================================== authLoginV1 Testing ========================================

describe('Testing for authLoginV1', () => {
  test('Test 1 affirmitive', () => {
    // all should be well
    let testUserId = authLoginV1('who.is.joe@is.the.question.com', 'yourmumma').authUserId;
    let testUserObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handle: 'johnsmith',
    }
      expect(doesEmailExist(requestUserProfile(testUserId, testUserId).email)).toBe(true);
      expect(requestUserProfile(testUserId, testUserId)).toStrictEqual(testUserObject);
  });

  test('Test 2 invalid email', () => {
    // invalid email - no existing email
    let testUserEmail = 'z5420895@ad.unsw.edu.au';
    let testUserPw = 'myrealpassword'
    let testUserId = authLoginV1(testUserEmail, testUserPw);
      expect(testUserId).toStrictEqual({ error: 'error'});
      expect(doesEmailExist(testUserEmail)).toBe(false);
  });

  test('Test 3 invalid password', () => {
    // invalid password - wrong password with associated email
    let testUserEmail = 'who.is.joe@is.the.question.com';
    let testUserPw = 'yourdad'
    let testUserId = authLoginV1(testUserEmail, testUserPw);
      expect(testUserId).toStrictEqual({ error: 'error'});
      expect(validator.isEmail(testUserEmail)).toBe(true);
      expect(doesEmailExist(testUserEmail)).toBe(true);
  });
});
*/
clearV1();
