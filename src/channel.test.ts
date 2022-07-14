// ======================================== Imports ========================================
import request from 'sync-request';
import config from './config.json';
import {requestClear} from './auth.test' 
const port = config.port;
const url = config.url;

// ======================================== Setup ========================================
let channel1;
let channel2;
let channel3;
let admin;
let user1;
let user2;
let user3;

// ======================================== Helper functions ========================================

function setupDatabase() {
  admin = requestAuthRegister('who.is.Joe@is.the.question.com', 'joss', 'Joe', 'Spencer');
  user1 = requestAuthRegister('who.is.zac@is.the.question.com', 'zaccool', 'Zac', 'Li');
  user2 = requestAuthRegister('who.is.nick@is.the.question.com', 'nicks', 'Nick', 'Smith');
  user3 = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');

  channel1 = requestChannelsCreate(admin.bodyObj.token, 'Channel1', true);
  channel2 = requestChannelsCreate(admin.bodyObj.token, 'Channel2', true);
  channel3 = requestChannelsCreate(admin.bodyObj.token, 'Channel3', false); // channel3 is private

  // Add users to respective channels having admin as the owner.
  let body = { token: admin.bodyObj.token, channelId: channel1, uId: user1.bodyObj.authUserId };
  expect(sendPost('channel/invite/v2', body)).toStrictEqual({});

  body = { token: admin.bodyObj.token, channelId: channel2, uId: user2.bodyObj.authUserId };
  expect(sendPost('channel/invite/v2', body)).toStrictEqual({});

  body = { token: admin.bodyObj.token, channelId: channel3, uId: user3.bodyObj.authUserId };
  expect(sendPost('channel/invite/v2', body)).toStrictEqual({});
}

function sendPost(path:string, body: object) {
  const res = request(
    'POST',
      `${url}:${port}/${path}`,
      {
        json: { body }
      }
  );
  return JSON.parse(res.getBody() as string);
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
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
  return JSON.parse(res.getBody() as string);
}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
      json: { token, name, isPublic },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.getBody())),
  };
}

// ======================================== channel/join/v2 ========================================

describe('Testing for channel/join/v2', () => {
  test('channel/join/v2 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: 9999 };
    expect(sendPost('channel/join/v2', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/join/v2 user already exists error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel1 };
    expect(sendPost('channel/join/v2', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/join/v2 private channel error', () => {
    setupDatabase();
    const body = { token: user1.bodyObj.token, channelId: channel3 };
    expect(sendPost('channel/join/v2', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/join/v2 pass', () => {
    setupDatabase();
    const body = { token: user1.bodyObj.token, channelId: channel2 };
    expect(sendPost('channel/join/v2', body)).toStrictEqual({});
    requestClear();
  });
});

// ======================================== channel/invite/v2 ========================================
describe('Testing for channel/invite/v2', () => {
  test('channel/invite/v2 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: 9999, uId: user1.bodyObj.authUserId };
    expect(sendPost('channel/invite/v2', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/invite/v2 user already exists error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel1, uId: user1.bodyObj.authUserId };
    expect(sendPost('channel/invite/v2', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/invite/v2 private channel error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel3, uId: user1.bodyObj.authUserId };
    expect(sendPost('channel/invite/v2', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/invite/v2 pass', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel2, uId: user1.bodyObj.authUserId };
    expect(sendPost('channel/invite/v2', body)).toStrictEqual({});
    requestClear();
  });
});

// ======================================== channel/leave/v1 ========================================
describe('Testing for channel/leave/v1  ', () => {
  test('channel/leave/v1 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: 9999 };
    expect(sendPost('channel/leave/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/leave/v1 user doesnt exists error', () => {
    setupDatabase();
    const body = { token: user1.bodyObj.token, channelId: channel2 };
    expect(sendPost('channel/leave/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/leave/v1 passing', () => {
    setupDatabase();
    const body = { token: user1.bodyObj.token, channelId: channel1 };
    expect(sendPost('channel/leave/v1', body)).toStrictEqual({});
    requestClear();
  });
});

// ======================================== channel/addowner/v1 ========================================
describe('Testing for channel/addowner/v1  ', () => {
  test('channel/addowner/v1 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: 9999, uId: user1.bodyObj.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/addowner/v1 user doesnt exists error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel1, uId: 99999 };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/addowner/v1 user is not a member of the channel', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel1, uId: user2.bodyObj.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/addowner/v1 user is already an owner', () => {
    setupDatabase();
    // make user1 an owner of channel1;
    let body = { token: admin.bodyObj.token, channelId: channel1, uId: user1.bodyObj.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({});
    // try to make user1 an owner of channel1 again;
    let body = { token: admin.bodyObj.token, channelId: channel1, uId: user1.bodyObj.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/addowner/v1 authorised user doesnt have permissions', () => {
    setupDatabase();
    // add user1 to channel 2
    const body1 = { token: user1.bodyObj.token, channelId: channel2 };
    expect(sendPost('channel/join/v2', body1)).toStrictEqual({});
    const body = { token: user1.bodyObj.token, channelId: channel2, uId: user2.bodyObj.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });
});

// ======================================== channel/removeowner/v1 ========================================
describe('Testing for channel/removeowner/v1', () => {
  test('channel/removeowner/v1 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: 9999, uId: user1.bodyObj.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/removeowner/v1 user doesnt exists error', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel1, uId: 99999 };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/removeowner/v1 user is not a member of the channel', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel1, uId: user2.bodyObj.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/removeowner/v1 user is not an owner', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel1, uId: user1.bodyObj.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/removeowner/v1 there is only one admin', () => {
    setupDatabase();
    const body = { token: admin.bodyObj.token, channelId: channel1, uId: admin.bodyObj.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/removeowner/v1 authorised user doesnt have permissions', () => {
    setupDatabase();
    // add user1 to channel 2
    const body1 = { token: user1.bodyObj.token, channelId: channel2 };
    expect(sendPost('channel/removeowner/v1', body1)).toStrictEqual({});
    // have user1 try and revoke permissions.
    const body = { token: user1.bodyObj.token, channelId: channel2, uId: user2.bodyObj.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });
});
