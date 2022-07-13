import { authLoginV1, isHandleValid, doesEmailExist } from './auth';
import { clearV1 } from './other';
import { userProfileV1 } from './users';
import request from 'sync-request';

var validator = require('validator');

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
  return JSON.parse(res.getBody());
}

// ======================================== requestAuthRegister Testing ========================================

describe('Testing for requestAuthRegister', () => {  

    test('Test 1 affirmitive', () => {
      // all should be well
      let testUserId = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').authUserId;
      let testUserObject = {
        uId: testUserId,
        email: 'who.is.joe@is.the.question.com',
        nameFirst: 'John',
        nameLast: 'Smith',
        handle: 'johnsmith',
      }
      expect(isHandleValid(userProfileV1(testUserId, testUserId).handle)).toBe(true);
      expect(validator.isEmail(userProfileV1(testUserId, testUserId).email)).toBe(true);
      expect(userProfileV1(testUserId, testUserId)).toStrictEqual(testUserObject);
    });

    test('Test 2 invalid email', () => {
      // invalid email - no '@' smymbol
      let testUserEmail = 'z5420895$ad.unsw.edu.au';
      let testUserPw = 'myrealpassword'
      let testUserFN = 'Jonathan';
      let testUserLN = 'Schmidt';
      let testUserId = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toStrictEqual({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(false);
    });

    test('Test 3 invalid password', () => {
      // invalid password - less than 5 characters
      let testUserEmail = 'i.love.to.code@university.com';
      let testUserPw = 'this5'
      let testUserFN = 'Jean';
      let testUserLN = 'McQueen';
      let testUserId = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toStrictEqual({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });

    test('Test 4 invalid first name', () => {
      // invalid nameFirst - below [1-50] range
      let testUserEmail = 'having.fun@writing.tests.com';
      let testUserPw = 'thispasswordislongenough'
      let testUserFN = '';
      let testUserLN = 'Tou';
      let testUserId = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toStrictEqual({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });

    test('Test 5 invalid last name', () => {
      // invalid nameLast - above [1-50] range
      let testUserEmail = 'still.having.fun@writing.tests.com';
      let testUserPw = 'thispasswordismorethanlongenough'
      let testUserFN = 'Tim';
      let testUserLN = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'; // 52 characters long
      let testUserId = requestAuthRegister(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toStrictEqual({ error: 'error'});
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
      expect(doesEmailExist(userProfileV1(testUserId, testUserId).email)).toBe(true);
      expect(userProfileV1(testUserId, testUserId)).toStrictEqual(testUserObject);
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
