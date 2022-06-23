import { authLoginV1, authRegisterV1, isHandleValid, isUuidValid, isUuidInUse, doesEmailExist } from './auth';
import { clearV1 } from './other';
import { validator } from 'validator';
import { getData, setData } from './dataStore';

let dataSet = getData();

// ======================================== authRegisterV1 Testing ========================================

describe('Testing for authRegisterV1', () => {  
    test('Test 1 affirmitive', () => {
      // all should be well
        let testUserEmail = 'who.is.joe@is.the.question.com';
        let testUserPw = 'yourmumma'
        let testUserFN = 'John';
        let testUserLN = 'Smith';
        let testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
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
      let testUserEmail = 'z5420895$ad.unsw.edu.au';
      let testUserPw = 'myrealpassword'
      let testUserFN = 'Jonathan';
      let testUserLN = 'Schmidt';
      let testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toStrictEqual({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(false);
    });

    test('Test 3 invalid password', () => {
      // invalid password - less than 5 characters
      let testUserEmail = 'i.love.to.code@university.com';
      let testUserPw = 'this5'
      let testUserFN = 'Jean';
      let testUserLN = 'McQueen';
      let testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toStrictEqual({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });

    test('Test 4 invalid first name', () => {
      // invalid nameFirst - below [1-50] range
      let testUserEmail = 'having.fun@writing.tests.com';
      let testUserPw = 'thispasswordislongenough'
      let testUserFN = '';
      let testUserLN = 'Tou';
      let testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toStrictEqual({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });

    test('Test 5 invalid last name', () => {
      // invalid nameLast - above [1-50] range
      let testUserEmail = 'still.having.fun@writing.tests.com';
      let testUserPw = 'thispasswordismorethanlongenough'
      let testUserFN = 'Tim';
      let testUserLN = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'; // 52 characters long
      let testUserId = authRegisterV1(testUserEmail, testUserPw, testUserFN, testUserLN);
        expect(testUserId).toStrictEqual({ error: 'error'});
        expect(validator.isEmail(testUserEmail)).toBe(true);
    });
});

// ======================================== authLoginV1 Testing ========================================

describe('Testing for authLoginV1', () => {
  test('Test 1 affirmitive', () => {
    // all should be well
    let testUserEmail = 'who.is.joe@is.the.question.com';
    let testUserPw = 'yourmumma'
    let testUserId = authLoginV1(testUserEmail, testUserPw);
      expect(isUuidValid(testUserId)).toBe(true);
      expect(isUuidInUse(testUserId, user)).toBe(true);
      expect(doesEmailExist(testUserEmail)).toBe(true);
      expect(data.user[0].email).toBe('who.is.joe@is.the.question.com');
      expect(data.user[0].password).toBe('yourmumma');
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