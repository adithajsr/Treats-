import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import { requestMessageSend } from './message.test';

const OK = 200;
const port = config.port;
const url = config.url;

const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authSam = ['samuelSchreyer@gmail.com', 'password', 'Sam', 'Schreyer'];

// -------------------------------------------------------------------------//

type payloadObj = {
  token?: string;
  channelId?: number;
};

function requestHelper(method: HttpVerb, path: string, payload: payloadObj) {
  let qs = {};
  let json = {};
  let headers = {};

  // Check if token key exists in payload
  if (payload.token !== undefined) {
    headers = { token: payload.token };
    delete payload.token;
  }

  let res;
  if (method === 'GET' || method === 'DELETE') {
    qs = payload;
    res = request(method, `${url}:${port}` + path, { qs, headers });
  } else {
    json = payload;
    res = request(method, `${url}:${port}` + path, { json, headers });
  }
  if (res.statusCode === 400 || res.statusCode === 403) {
    return res.statusCode;
  }
  if (res.statusCode === 200) {
    // return {
    //   res: res,
    //   bodyObj: JSON.parse(res.body as string),
    // };
    return JSON.parse(res.getBody() as string);
  }
}

// -------------------------------------------------------------------------//

export function requestChannelDetailsHelper(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', { token, channelId });
}

function requestClearHelper() {
  return requestHelper('DELETE', '/clear/v1', {});
}

// -------------------------------------------------------------------------//

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v3`,
    {
      json: { name, isPublic },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestChannelMessages(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/messages/v3`,
    {
      qs: {
        channelId, start,
      },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
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

test('Invalid channelId', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const channelId = requestChannelsCreate(danielToken, 'danielChannel', true).bodyObj.channelId;
  expect(requestChannelMessages(danielToken, channelId + 20, 0).res.statusCode).toBe(400);
});

test('Requesting user is not member of channel', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;
  const channelId = requestChannelsCreate(danielToken, 'danielChannel', true).bodyObj.channelId;
  expect(requestChannelMessages(samToken, channelId, 0).res.statusCode).toBe(403);
});

test('Default case', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const channelId = requestChannelsCreate(danielToken, 'danielChannel', true).bodyObj.channelId;

  requestMessageSend(danielToken, channelId, 'First message');
  requestMessageSend(danielToken, channelId, 'Second message');
  requestMessageSend(danielToken, channelId, 'Third message');
  requestMessageSend(danielToken, channelId, 'Fourth message');
  requestMessageSend(danielToken, channelId, 'Fifth message');
  requestMessageSend(danielToken, channelId, 'Sixth message');

  const returnObject = ['First message', 'Second message', 'Third message', 'Fourth message', 'Fifth message', 'Sixth message'];
  expect(requestChannelMessages(danielToken, channelId, 0).bodyObj.messages[0].message).toStrictEqual(returnObject[0]);
  expect(requestChannelMessages(danielToken, channelId, 0).bodyObj.messages[1].message).toStrictEqual(returnObject[1]);
  expect(requestChannelMessages(danielToken, channelId, 0).bodyObj.messages[2].message).toStrictEqual(returnObject[2]);
  expect(requestChannelMessages(danielToken, channelId, 0).bodyObj.messages[3].message).toStrictEqual(returnObject[3]);
  expect(requestChannelMessages(danielToken, channelId, 0).bodyObj.messages[4].message).toStrictEqual(returnObject[4]);
  expect(requestChannelMessages(danielToken, channelId, 0).bodyObj.messages[5].message).toStrictEqual(returnObject[5]);
  expect(requestChannelMessages(danielToken, channelId, 0).res.statusCode).toBe(OK);
});

test('Start at integer > 0', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const channelId = requestChannelsCreate(danielToken, 'danielChannel', true).bodyObj.channelId;

  requestMessageSend(danielToken, channelId, 'First message');
  requestMessageSend(danielToken, channelId, 'Second message');
  requestMessageSend(danielToken, channelId, 'Third message');
  requestMessageSend(danielToken, channelId, 'Fourth message');
  requestMessageSend(danielToken, channelId, 'Fifth message');
  requestMessageSend(danielToken, channelId, 'Sixth message');

  expect(requestChannelMessages(danielToken, channelId, 3).bodyObj.messages[0].message).toStrictEqual('Fourth message');
  expect(requestChannelMessages(danielToken, channelId, 3).res.statusCode).toBe(OK);
});

describe('channel/details/v3 testing', () => {
  let testUser: any;
  let testChannel: any;

  beforeEach(() => {
    requestClearHelper();
    // Create a test user
    testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    testChannel = requestChannelsCreate(testUser.bodyObj.token, 'channelName', true);
  });

  afterEach(() => {
    requestClearHelper();
  });

  test('invalid token, fail channel details', () => {
    const testRequest = requestChannelDetailsHelper(testUser.bodyObj.token + 'a', testChannel.bodyObj.channelId);
    expect(testRequest).toBe(403);
  });

  test('channelId does not refer to valid channel, valid token, fail channel details', () => {
    const testRequest = requestChannelDetailsHelper(testUser.bodyObj.token, 9999);
    expect(testRequest).toBe(400);
  });

  test('channelId valid but authorised user is not a member of the channel, fail channel details', () => {
    const testUser2 = requestAuthRegister('validemail1@gmail.com', '123abc!@#1', 'Johna', 'Doea');
    const testRequest = requestChannelDetailsHelper(testUser2.bodyObj.token, testChannel.bodyObj.channelId);
    expect(testRequest).toBe(403);
  });

  test('successful channel details return', () => {
    const testRequest = requestChannelDetailsHelper(testUser.bodyObj.token, testChannel.bodyObj.channelId);
    expect(testRequest.channelDetails).toStrictEqual({
      name: 'channelName',
      isPublic: true,
      ownerMembers: [
        {
          email: 'validemail@gmail.com',
          handle: 'johndoe',
          nameFirst: 'John',
          nameLast: 'Doe',
          uId: 1,
        },
      ],
      allMembers: [
        {
          email: 'validemail@gmail.com',
          handle: 'johndoe',
          nameFirst: 'John',
          nameLast: 'Doe',
          uId: 1,
        },
      ],
    });
  });
});

// ======================================== Setup ========================================
interface authRegUser {
  token: string,
  authUserId: number,
}

let channel1: number;
let channel2: number;
let channel3: number;
let admin: authRegUser;
let user1: authRegUser;
let user2: authRegUser;
let user3: authRegUser;

// ======================================== Helper functions ========================================

function setupDatabase() {
  admin = requestAuthRegisterNoRes('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Hancock');
  user1 = requestAuthRegisterNoRes('who.is.zac@is.the.question.com', 'zaccool', 'Zac', 'Li');
  user2 = requestAuthRegisterNoRes('who.is.nick@is.the.question.com', 'yeyyey', 'Nick', 'Smith');
  user3 = requestAuthRegisterNoRes('who.is.yet@is.the.question.com', 'nicolea', 'Nicole', 'pi');
  const c1 = requestChannelsCreateNoRes(admin.token, 'Channel1', true);
  const c2 = requestChannelsCreateNoRes(admin.token, 'Channel2', true);
  const c3 = requestChannelsCreateNoRes(admin.token, 'Channel3', false); // channel3 is private

  channel1 = c1.channelId;
  channel2 = c2.channelId;
  channel3 = c3.channelId;

  // Add users to respective channels having admin as the owner.
  let body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
  sendPost('channel/invite/v2', body);

  body = { token: admin.token, channelId: channel2, uId: user2.authUserId };
  sendPost('channel/invite/v2', body);

  body = { token: admin.token, channelId: channel3, uId: user3.authUserId };
  sendPost('channel/invite/v2', body);
}

let headers = {};
type sendPostObj = {
  token?: string;
  channelId?: number;
  uId?: number;
};

function sendPost(path:string, body: sendPostObj) {
  // Check if token key exists in body
  if (body.token !== undefined) {
    headers = { token: body.token };
    delete body.token;
  }

  const res = request(
    'POST',
      `${url}:${port}/${path}`,
      {
        json: body,
        headers,
      }
  );
  return JSON.parse(res.body as string);
}

// Changed function name due to duplication errors
function requestAuthRegisterNoRes(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
      `${url}:${port}/auth/register/v3`,
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }
      }
  );
  return JSON.parse(res.body as string);
}

function requestChannelsCreateNoRes(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v3`,
    {
      json: { name, isPublic },
      headers: { token },
    }
  );
  return JSON.parse(res.body as string);
}

// ======================================== channel/join/v2 ========================================

describe('Testing for channel/join/v2', () => {
  test('channel/join/v2 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.token, channelId: 9999 };
    expect(sendPost('channel/join/v2', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/join/v2 user already exists error', () => {
    const body = { token: admin.token, channelId: channel1 };
    expect(sendPost('channel/join/v2', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/join/v2 private channel error', () => {
    const body = { token: user1.token, channelId: channel3 };
    expect(sendPost('channel/join/v2', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/join/v2 pass', () => {
    const body = { token: user1.token, channelId: channel2 };
    expect(sendPost('channel/join/v2', body)).toStrictEqual({});
    requestClear();
  });
});
requestClear();

// // ======================================== channel/invite/v2 ========================================
describe('Testing for channel/invite/v2', () => {
  test('channel/invite/v2 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.token, channelId: 9999, uId: user1.authUserId };
    expect(sendPost('channel/invite/v2', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/invite/v2 user already exists error', () => {
    const body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
    expect(sendPost('channel/invite/v2', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/invite/v2 pass', () => {
    const body = { token: admin.token, channelId: channel2, uId: user1.authUserId };
    expect(sendPost('channel/invite/v2', body)).toStrictEqual({});
    requestClear();
  });
});

// // ======================================== channel/leave/v1 ========================================
describe('Testing for channel/leave/v1  ', () => {
  test('channel/leave/v1 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.token, channelId: 9999 };
    expect(sendPost('channel/leave/v1', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/leave/v1 user doesnt exists error', () => {
    const body = { token: user1.token, channelId: channel2 };
    expect(sendPost('channel/leave/v1', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/leave/v1 passing', () => {
    const body = { token: user1.token, channelId: channel1 };
    expect(sendPost('channel/leave/v1', body)).toStrictEqual({});
    requestClear();
  });
});
requestClear();

// // ======================================== channel/addowner/v1 ========================================
describe('Testing for channel/addowner/v1  ', () => {
  test('channel/addowner/v1 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.token, channelId: 9999, uId: user1.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/addowner/v1 user doesnt exists error', () => {
    const body = { token: admin.token, channelId: channel1, uId: 99999 };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/addowner/v1 user is not a member of the channel', () => {
    const body = { token: admin.token, channelId: channel1, uId: user2.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/addowner/v1 user is already an owner', () => {
    setupDatabase();
    // make user1 an owner of channel1;
    let body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({});
    // try to make user1 an owner of channel1 again;
    body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/addowner/v1 authorised user doesnt have permissions', () => {
    setupDatabase();
    // add user1 to channel 2
    const body1 = { token: user1.token, channelId: channel2 };
    expect(sendPost('channel/join/v2', body1)).toStrictEqual({});
    const body = { token: user1.token, channelId: channel2, uId: user2.authUserId };
    expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });
});

// // ======================================== channel/removeowner/v1 ========================================
describe('Testing for channel/removeowner/v1', () => {
  test('channel/removeowner/v1 channel does not exist error', () => {
    setupDatabase();
    const body = { token: admin.token, channelId: 9999, uId: user1.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/removeowner/v1 user doesnt exists error', () => {
    const body = { token: admin.token, channelId: channel1, uId: 99999 };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/removeowner/v1 user is not a member of the channel', () => {
    const body = { token: admin.token, channelId: channel1, uId: user2.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/removeowner/v1 user is not an owner', () => {
    const body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
  });

  test('channel/removeowner/v1 there is only one admin', () => {
    const body = { token: admin.token, channelId: channel1, uId: admin.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });

  test('channel/removeowner/v1 authorised user doesnt have permissions', () => {
    setupDatabase();
    // add user1 to channel 2
    const body1 = { token: user1.token, channelId: channel2 };
    sendPost('channel/join/v2', body1);
    // have user1 try and revoke permissions.
    const body = { token: user1.token, channelId: channel2, uId: user2.authUserId };
    expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
    requestClear();
  });
});
