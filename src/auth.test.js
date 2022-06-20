import { authLoginV1, authRegisterV1 } from './auth';
import { validator } from 'validator';

describe('Testing for authRegisterV1', () => {
    beforeEach(() => {
      // clear();
    });
  
    afterAll(() => {
      // clear();
    });
  
    test('Test 1', () => {
        testUserEmail = 'who.is.joe@is.the.question.com';
        testUserPw = 'yourmumma'
        testUserId = authRegisterV1(testUserEmail, testUserPw);
        expect(testUserId).toStrictEqual({
            
        });
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