import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import { requestClear } from './users.test';

// -------------------------------------------------------------------------//

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  let res;
  if (method === 'GET' || method === 'DELETE') {
    qs = payload;
    res = request(method, `${url}:${port}` + path, { qs });
  } else {
    json = payload;
    res = request(method, `${url}:${port}` + path, { json });
  }
  if (res.statusCode === 400 || res.statusCode === 403) {
    return res.statusCode;
  }
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
}

// -------------------------------------------------------------------------//

function requestAdminUserRemove(token: string, uId: number) {
  return requestHelper('DELETE', '/admin/user/remove/v1', { token, uId });
}

// -------------------------------------------------------------------------//

let testUser: any;
let byeUser: any;

describe('admin/user/remove/v1 test', () => {
  beforeEach(() => {
    requestClear();
    // // Create a test channel
    // testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
  });

  afterEach(() => {
    requestClear();
  });

  test('invalid token, fail user remove', () => {
    testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    byeUser = requestAuthRegister('avalidemail@gmail.com', 'a123abc!@#', 'Jane', 'Doe');
    const testRequest = requestAdminUserRemove(testUser.bodyObj.token + 'a', byeUser.bodyObj.authUserId);
    expect(testRequest).toBe(403);
  });

  test('uId does not refer to a valid user, fail user remove', () => {
    testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    byeUser = requestAuthRegister('avalidemail@gmail.com', 'a123abc!@#', 'Jane', 'Doe');
    const testRequest = requestAdminUserRemove(testUser.bodyObj.token + 'a', 9999);
    expect(testRequest).toBe(400);
  });

  test('auth user is not a global owner, fail user remove', () => {
    testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    byeUser = requestAuthRegister('avalidemail@gmail.com', 'a123abc!@#', 'Jane', 'Doe');
    const testRequest = requestAdminUserRemove(byeUser.bodyObj.authUserId, testUser.bodyObj.token);
    expect(testRequest).toBe(403);
  });

  test('uId is the only global owner, fail user remove', () => {
    testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    const testRequest = requestAdminUserRemove(byeUser.bodyObj.authUserId, testUser.bodyObj.token);
    expect(testRequest).toBe(403);
  });

});