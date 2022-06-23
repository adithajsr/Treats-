import { authLoginV1, authRegisterV1, isHandleValid, isUuidValid } from './auth';
import { clearV1 } from './other';
import { validator } from 'validator';
import { getData, setData } from './dataStore';

describe('Testing for authRegisterV1', () => {
    beforeEach(() => {
      clearV1();
      dataSet = getData();
    });
  
    afterAll(() => {
      clearV1();
    });
  
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