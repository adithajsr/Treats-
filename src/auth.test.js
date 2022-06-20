import { authLoginV1, authRegisterV1, isHandleValid, isUuidValid } from './auth';
// import { clearV1 } from './other';
import { validator } from 'validator';

describe('Testing for authRegisterV1', () => {
    beforeEach(() => {
      // clearV1();
      dataSet = getData();
    });
  
    afterAll(() => {
      // clearV1();
    });
  
    test('Test 1 affirmitive', () => {
      // all should be well
        testUserEmail = 'who.is.joe@is.the.question.com';
        testUserPw = 'yourmumma'
        testUserId = authRegisterV1(testUserEmail, testUserPw);
        expect(isUuidValid(testUserId)).toBe(true);
        expect(isHandleValid(data.user[0].handle)).toBe(true);
        expect(validator.isEmail(data.user[0].email)).toBe(true);
        expect(data.user[0].password).not.toBe(null);
        expect(data.user[0].nameFirst).not.toBe(null);
        expect(data.user[0].nameLast).not.toBe(null);
    });

    test('Test 1', () => {
        //
        expect(authRegisterV1(email, password)).toStrictEqual({ error: 'error' });
        });

    test('Test 1', () => {
      //
      expect(authRegisterV1(email, password)).toStrictEqual({ error: 'error' });
    });

    test('Test 1', () => {
        //
        expect(authRegisterV1(email, password)).toStrictEqual({ error: 'error' });
      });
});