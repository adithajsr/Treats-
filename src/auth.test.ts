import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

// TODO: potentially improve types
type wrapperOutput = {
  res: any,
  bodyObj: any,
};

function requestAuthLogout(token: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/logout/v1`,
    {
      json: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
      json: { email, password, nameFirst, nameLast },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

function requestClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {
      qs: {},
    }
  );
  return JSON.parse(String(res.getBody()));
}

beforeEach(() => {
  requestClear();
});

describe('test /auth/logout/v1', () => {
  let testUser: wrapperOutput;

  beforeEach(() => {
    // Create a test user
    testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
  });

  test('Success user log out', () => {
    const testLogout1 = requestAuthLogout(testUser.bodyObj.token);
    expect(testLogout1.res.statusCode).toBe(OK);
    expect(testLogout1.bodyObj).toStrictEqual({});

    // Attempt to log out again with newly invalid token
    const testLogout2 = requestAuthLogout(testUser.bodyObj.token);
    expect(testLogout2.res.statusCode).toBe(OK);
    expect(testLogout2.bodyObj).toStrictEqual({ error: 'error' });
  });

  test('Fail user log out, invalid token', () => {
    const testLogout = requestAuthLogout(testUser.bodyObj.token + 'a');
    expect(testLogout.res.statusCode).toBe(OK);
    expect(testLogout.bodyObj).toStrictEqual({ error: 'error' });
  });
});
