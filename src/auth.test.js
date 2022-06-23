import { authLoginV1, authRegisterV1, isHandleValid, isUuidValid, isUuidInUse, doesEmailExist } from './auth';
import { clearV1 } from './other';
import { validator } from 'validator';
import { getData, setData } from './dataStore';

let dataSet = getData();

// ======================================== authRegisterV1 Testing ========================================

describe('Testing for authRegisterV1', () => {  
    test('Test 1 affirmitive', () => {
      // all should be well
        testUserEmail = 'who.is.joe@is.the.question.com';
        testUserPw = 'yourmumma'
        testUserFN = 'John';
        testUserLN = 'Smith';
        testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(isUuidValid(testUserId)).toBe(true);
        expect(isHandleValid(data.user[0].handle)).toBe(true);
        expect(validator.isEmail(data.user[0].email)).toBe(true);
        expect(data.user[0].password).toBe('yourmumma');
        expect(data.user[0].nameFirst).toBe('John');
        expect(data.user[0].nameLast).toBe('Smith');
        expect(data.user[0].globalPerms).toBe('owner');
    });

    test('Test 2 invalid email', () => {
      // invalid email - no '@' smymbol
        testUserEmail = 'z5420895$ad.unsw.edu.au';
        testUserPw = 'myrealpassword'
        testUserFN = 'Jonathan';
        testUserLN = 'Schmidt';
        testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toBe({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(false);
    });

    test('Test 3 invalid password', () => {
      // invalid password - less than 5 characters
        testUserEmail = 'i.love.to.code@university.com';
        testUserPw = 'this5'
        testUserFN = 'Jean';
        testUserLN = 'McQueen';
        testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toBe({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });

    test('Test 4 invalid first name', () => {
      // invalid nameFirst - below [1-50] range
        testUserEmail = 'having.fun@writing.tests.com';
        testUserPw = 'thispasswordislongenough'
        testUserFN = '';
        testUserLN = 'Tou';
        testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toBe({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });

    test('Test 5 invalid last name', () => {
      // invalid nameLast - above [1-50] range
        testUserEmail = 'still.having.fun@writing.tests.com';
        testUserPw = 'thispasswordismorethanlongenough'
        testUserFN = 'Tim';
        testUserLN = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'; // 52 characters long
        testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toBe({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });
});

// ======================================== authLoginV1 Testing ========================================

describe('Testing for authLoginV1', () => {
  test('Test 1 affirmitive', () => {
    // all should be well
      testUserEmail = 'who.is.joe@is.the.question.com';
      testUserPw = 'yourmumma'
      testUserId = authLoginV1(testUserEmail, testUserPw);
      expect(isUuidValid(testUserId)).toBe(true);
      expect(isUuidInUse(testUserId, user)).toBe(true);
      expect(doesEmailExist(testUserEmail)).toBe(true);
      expect(data.user[0].email).toBe('who.is.joe@is.the.question.com');
      expect(data.user[0].password).toBe('yourmumma');
  });

  test('Test 2 invalid email', () => {
    // invalid email - no existing email
      testUserEmail = 'z5420895@ad.unsw.edu.au';
      testUserPw = 'myrealpassword'
      testUserId = authLoginV1(testUserEmail, testUserPw);
      expect(testUserId).toBe({ error: 'error'});
      expect(doesEmailExist(testUserEmail)).toBe(false);
  });

  test('Test 3 invalid password', () => {
    // invalid password - wrong password with associated email
      testUserEmail = 'who.is.joe@is.the.question.com';
      testUserPw = 'yourdad'
      testUserId = authLoginV1(testUserEmail, testUserPw);
      expect(testUserId).toBe({ error: 'error'});
      expect(validator.isEmail(testUserEmail)).toBe(true);
      expect(doesEmailExist(testUserEmail)).toBe(true);
  });
});

clearV1();