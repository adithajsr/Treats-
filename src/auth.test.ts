import { authLoginV1, authRegisterV1, isHandleValid, doesEmailExist } from './auth';
import { clearV1 } from './other';
import { userProfileV1 } from './users';

const validator = require('validator');

// ======================================== authRegisterV1 Testing ========================================

describe('Testing for authRegisterV1', () => {
  test('Test 1 affirmitive', () => {
    // all should be well
    const testUserId = authRegisterV1('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').authUserId;
    const testUserObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handle: 'johnsmith',
    };
    expect(isHandleValid(userProfileV1(testUserId, testUserId).handle)).toBe(true);
    expect(validator.isEmail(userProfileV1(testUserId, testUserId).email)).toBe(true);
    expect(userProfileV1(testUserId, testUserId)).toStrictEqual(testUserObject);
  });

  test('Test 2 invalid email', () => {
    // invalid email - no '@' smymbol
    const testUserEmail = 'z5420895$ad.unsw.edu.au';
    const testUserPw = 'myrealpassword';
    const testUserFN = 'Jonathan';
    const testUserLN = 'Schmidt';
    const testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(testUserId).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(false);
  });

  test('Test 3 invalid password', () => {
    // invalid password - less than 5 characters
    const testUserEmail = 'i.love.to.code@university.com';
    const testUserPw = 'this5';
    const testUserFN = 'Jean';
    const testUserLN = 'McQueen';
    const testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(testUserId).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });

  test('Test 4 invalid first name', () => {
    // invalid nameFirst - below [1-50] range
    const testUserEmail = 'having.fun@writing.tests.com';
    const testUserPw = 'thispasswordislongenough';
    const testUserFN = '';
    const testUserLN = 'Tou';
    const testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(testUserId).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });

  test('Test 5 invalid last name', () => {
    // invalid nameLast - above [1-50] range
    const testUserEmail = 'still.having.fun@writing.tests.com';
    const testUserPw = 'thispasswordismorethanlongenough';
    const testUserFN = 'Tim';
    const testUserLN = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'; // 52 characters long
    const testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
    expect(testUserId).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
  });
});

// ======================================== authLoginV1 Testing ========================================

describe('Testing for authLoginV1', () => {
  test('Test 1 affirmitive', () => {
    // all should be well
    const testUserId = authLoginV1('who.is.joe@is.the.question.com', 'yourmumma').authUserId;
    const testUserObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handle: 'johnsmith',
    };
    expect(doesEmailExist(userProfileV1(testUserId, testUserId).email)).toBe(true);
    expect(userProfileV1(testUserId, testUserId)).toStrictEqual(testUserObject);
  });

  test('Test 2 invalid email', () => {
    // invalid email - no existing email
    const testUserEmail = 'z5420895@ad.unsw.edu.au';
    const testUserPw = 'myrealpassword';
    const testUserId = authLoginV1(testUserEmail, testUserPw);
    expect(testUserId).toStrictEqual({ error: 'error' });
    expect(doesEmailExist(testUserEmail)).toBe(false);
  });

  test('Test 3 invalid password', () => {
    // invalid password - wrong password with associated email
    const testUserEmail = 'who.is.joe@is.the.question.com';
    const testUserPw = 'yourdad';
    const testUserId = authLoginV1(testUserEmail, testUserPw);
    expect(testUserId).toStrictEqual({ error: 'error' });
    expect(validator.isEmail(testUserEmail)).toBe(true);
    expect(doesEmailExist(testUserEmail)).toBe(true);
  });
});

clearV1();
