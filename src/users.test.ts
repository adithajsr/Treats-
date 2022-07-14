// A file to test the function userProfile for Iteration 1
// Written by Aditha Jayasuriya, started on 17/06/2022

// This function returns the important information about a user's profile.
/*
<authUserId> This function checks whether a valid authUserId is calling the function

<uId> This is the uId that is searched for to return the user's profile

Return Value:
  {error: 'error'} if the authUserd or uId are invalid
  {info} if the authUserId and uId are valid, returns
  important info about a user's profile

*/

import { requestClear, requestAuthRegister, requestUserProfile } from './auth.test';
import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

function requestUserProfileSetName(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setname/v1`,
    {
      json: {
        token: token,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

// AWAITING ADITHA TO IMPLEMENT
/*
test('Testing invalid uId', () => {
  clearV1();
  let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');

  let returnValue = userProfileV1(maddyId/2, maddyId/2);
  expect(returnValue).toMatchObject({error: 'error'});
})

//Testing default case
test('Default case', () => {

  clearV1();

  let maiyaId = authRegisterV1('maiyaTaylor@gmail.com', 'password3', 'Maiya', 'Taylor').authUserId;
  let samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer').authUserId;
  let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung').authUserId;
  let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines').authUserId;

  const maiyaInfo = {
    uId: maiyaId,
      email: 'maiyaTaylor@gmail.com',
      nameFirst: 'Maiya',
      nameLast: 'Taylor',
      handle: 'maiyataylor'
    }

  expect(userProfileV1(maiyaId, maiyaId)).toMatchObject(maiyaInfo);
})
*/

// ======================================== requestUserProfileSetName Testing ========================================

describe('Testing for requestUserProfileSetName', () => {
  afterEach(() => {
    requestClear();
  });
  test('Test 1 affirmitive', () => {
    // all should be well
	const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetName(testToken, 'Jonathan', 'Schmidt');
    expect(response.res.statusCode).toBe(OK);
    const expectedObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'Jonathan',
      nameLast: 'Schmidt',
      handleStr: 'johnsmith'
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });

  test('Test 2 invalid nameFirst', () => {
    // error
	const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetName(testToken, '', 'Schmidt');
    expect(response.res.statusCode).toBe(OK);
	expect(response.bodyObj).toStrictEqual({ error: 'error' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
		email: 'who.is.joe@is.the.question.com',
        uId: testUserId,
		nameFirst: 'John',
		nameLast: 'Smith',
		handleStr: 'johnsmith',
	});
  });

  test('Test 3 invalid nameLast', () => {
    // error
	const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetName(testToken, 'Jonathan', 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz');
    expect(response.res.statusCode).toBe(OK);
	expect(response.bodyObj).toStrictEqual({ error: 'error' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
		email: 'who.is.joe@is.the.question.com',
        uId: testUserId,
		nameFirst: 'John',
		nameLast: 'Smith',
		handleStr: 'johnsmith',
	});
  });
});
