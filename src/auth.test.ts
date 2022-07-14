import { authLoginV1, isHandleValid, doesEmailExist,  } from './auth';
import { clearV1 } from './other';
import validator from 'validator';
import { validate as validateV4uuid } from 'uuid';
import request from 'sync-request';
import fs from 'fs';
import config from './config.json';

const port = config.port;
const url = config.url;

function requestAuthRegister(email, password, nameFirst, nameLast) {
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

function requestUserProfile(token, uId) {
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
      let returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
      let testUserId = returnObject.authUserId;
      let testToken = returnObject.token;
      let testUserObject = {
        uId: testUserId,
        email: 'who.is.joe@is.the.question.com',
        nameFirst: 'John',
        nameLast: 'Smith',
        handle: 'johnsmith',
      }
      expect(isHandleValid(requestUserProfile(testToken, testUserId).handle)).toBe(true);
      expect(validator.isEmail(requestUserProfile(testToken, testUserId).email)).toBe(true);
      expect(validateV4uuid(testToken)).toBe(true);
      expect(requestUserProfile(testToken, testUserId)).toStrictEqual(testUserObject);
    });

    test('Test 2 invalid email', () => {
      // invalid email - no '@' smymbol
      let testUserEmail = 'z5420895$ad.unsw.edu.au';
      let testUserPw = 'myrealpassword'
      let testUserFN = 'Jonathan';
      let testUserLN = 'Schmidt';
      let returnObject = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
      expect(returnObject).toStrictEqual({ error: 'error'});
      expect(validator.isEmail(testUserEmail)).toBe(false);
    });

    test('Test 3 invalid password', () => {
      // invalid password - less than 5 characters
      let testUserEmail = 'i.love.to.code@university.com';
      let testUserPw = 'this5'
      let testUserFN = 'Jean';
      let testUserLN = 'McQueen';
      let returnObject = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(returnObject).toStrictEqual({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });

    test('Test 4 invalid first name', () => {
      // invalid nameFirst - below [1-50] range
      let testUserEmail = 'having.fun@writing.tests.com';
      let testUserPw = 'thispasswordislongenough'
      let testUserFN = '';
      let testUserLN = 'Tou';
      let returnObject = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(returnObject).toStrictEqual({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });

    test('Test 5 invalid last name', () => {
      // invalid nameLast - above [1-50] range
      let testUserEmail = 'still.having.fun@writing.tests.com';
      let testUserPw = 'thispasswordismorethanlongenough'
      let testUserFN = 'Tim';
      let testUserLN = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'; // 52 characters long
      let returnObject = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(returnObject).toStrictEqual({ error: 'error'});
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

clearV1();
*/
