import request, { HttpVerb } from 'sync-request';
import config from './config.json';
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

type id = {
  token: string,
  authUserId: number,
}

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

export function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
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
let channel1:number;
let channel2:number;
let channel3:number;
let globalAdmin:id;
let admin:id;
let user1:id;
let user2:id;
let user3:id;
let dm1:number;
let message1:number;
let message2:number;
let dmId:number;

// ======================================== Helper functions ========================================

export function setupDatabase() {
  let reg = { email: 'who.is.john@is.the.question.com', password: '12367dhd', nameFirst: 'Nathan', nameLast: 'Spencer' };
  globalAdmin = sendPost('auth/register/v3', 'a', reg);

  reg = { email: 'who.is.joe@is.the.question.com', password: 'yourmumma', nameFirst: 'John', nameLast: 'Hancock' };
  admin = sendPost('auth/register/v3', 'a', reg);

  reg = { email: 'who.is.zac@is.the.question.com', password: 'zaccool', nameFirst: 'Zac', nameLast: 'Li' };
  user1 = sendPost('auth/register/v3', 'a', reg);

  reg = { email: 'who.is.nick@is.the.question.com', password: 'yeyyey', nameFirst: 'Nick', nameLast: 'Smith' };
  user2 = sendPost('auth/register/v3', 'a', reg);

  reg = { email: 'who.is.yet@is.the.question.com', password: 'nicolea', nameFirst: 'Nicole', nameLast: 'pi' };
  user3 = sendPost('auth/register/v3', 'a', reg);

  channel1 = sendPost('channels/create/v3', admin.token, { name: 'Channel1', isPublic: true }).channelId;
  channel2 = sendPost('channels/create/v3', admin.token, { name: 'Channel2', isPublic: true }).channelId;
  channel3 = sendPost('channels/create/v3', admin.token, { name: 'Channel3', isPublic: false }).channelId; // channel3 is private

  // Add users to respective channels having admin as the owner.
  let body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
  sendPost('channel/invite/v3', admin.token, body);

  body = { token: admin.token, channelId: channel2, uId: user2.authUserId };
  sendPost('channel/invite/v3', admin.token, body);

  body = { token: admin.token, channelId: channel3, uId: user3.authUserId };
  sendPost('channel/invite/v3', admin.token, body);

  // Add messages to channels
  message1 = requestMessageSend(user1.token, channel1, 'A message is sent to channel1').messageId;
  message2 = requestMessageSend(user2.token, channel2, 'A message is sent to channel2').messageId;

  // Create a Dm channel.
  const uIds = [user3.authUserId, user2.authUserId, admin.authUserId];
  dmId = requestDMCreate(user1.token, uIds).dmId;
  // Send a dm.
  dm1 = requestSendDm(user2.token, dmId, 'A message is sent to the DM').messageId;
}

export function sendPost(path:string, token:string, body: object) {
  const res = request(
    'POST',
      `${url}:${port}/${path}`,
      {
        json: body,
        headers: { token: token }
      }
  );

  if (res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 404 || res.statusCode === 500) {
    return res.statusCode;
  } else {
    return JSON.parse(res.getBody() as string);
  }
}

function requestMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/send/v2`,
    {
      json: { channelId, message },
      headers: { token: token }
    }
  );
  if (res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 404 || res.statusCode === 500) {
    return res.statusCode;
  } else {
    return JSON.parse(res.getBody() as string);
  }
}

function requestSendDm(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/senddm/v2`,
    {
      json: { dmId, message },
      headers: { token: token }
    }
  );
  if (res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 404 || res.statusCode === 500) {
    return res.statusCode;
  } else {
    return JSON.parse(res.getBody() as string);
  }
}

function requestDMCreate(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v2`,
    {
      json: { uIds },
      headers: { token: token }
    }
  );
  if (res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 404 || res.statusCode === 500) {
    return res.statusCode;
  } else {
    return JSON.parse(res.getBody() as string);
  }
}

// // ======================================== channel/join/v3 ========================================
describe('Testing for channel/join/v3', () => {
  test('channel/join/v3 channel does not exist error', () => {
    setupDatabase();
    const body = { channelId: 9999 };
    expect(sendPost('channel/join/v3', admin.token, body)).toStrictEqual(400);
  });

  test('channel/join/v3 user already exists error', () => {
    const body = { channelId: channel1 };
    expect(sendPost('channel/join/v3', admin.token, body)).toStrictEqual(400);
  });

  test('channel/join/v3 private channel error', () => {
    const body = { channelId: channel3 };
    expect(sendPost('channel/join/v3', user1.token, body)).toStrictEqual(403);
  });

  test('channel/join/v3 pass private channel but global user', () => {
    const body = { channelId: channel3 };
    expect(sendPost('channel/join/v3', globalAdmin.token, body)).toStrictEqual({});
  });

  test('channel/join/v3 pass', () => {
    const body = { channelId: channel2 };
    expect(sendPost('channel/join/v3', user1.token, body)).toStrictEqual({});
    requestClear();
  });
});
// // ======================================== channel/invite/v3 ========================================
describe('Testing for channel/invite/v3', () => {
  test('channel/invite/v3 channel does not exist error', () => {
    setupDatabase();
    const body = { channelId: 9999, uId: user1.authUserId };
    expect(sendPost('channel/invite/v3', admin.token, body)).toStrictEqual(400);
  });

  test('channel/invite/v3 user already exists error', () => {
    const body = { channelId: channel1, uId: user1.authUserId };
    expect(sendPost('channel/invite/v3', admin.token, body)).toStrictEqual(400);
  });

  test('channel/invite/v3 unauthorised user', () => {
    const body = { channelId: channel2, uId: user1.authUserId };
    expect(sendPost('channel/invite/v3', user3.token, body)).toStrictEqual(403);
  });

  test('channel/invite/v3 pass', () => {
    const body = { channelId: channel2, uId: user1.authUserId };
    expect(sendPost('channel/invite/v3', admin.token, body)).toStrictEqual({});
    requestClear();
  });
});

// // ======================================== channel/leave/v2 ========================================
describe('Testing for channel/leave/v2  ', () => {
  test('channel/leave/v2 channel does not exist error', () => {
    setupDatabase();
    const body = { channelId: 9999 };
    expect(sendPost('channel/leave/v2', admin.token, body)).toStrictEqual(400);
  });

  test('channel/leave/v2 user doesnt exists error', () => {
    const body = { channelId: channel1 };
    expect(sendPost('channel/leave/v2', user2.token, body)).toStrictEqual(403);
  });

  test('channel/leave/v2 fails as there is an active standup', () => {
    const body = { channelId: channel1, length: 3000 };
    sendPost('standup/start/v1', user1.token, body);
    const body2 = { channelId: channel1 };
    expect(sendPost('channel/leave/v2', user1.token, body2)).toStrictEqual(400);
    requestClear();
  });

  test('channel/leave/v2 passing', () => {
    setupDatabase();
    const body = { channelId: channel1 };
    expect(sendPost('channel/leave/v2', user1.token, body)).toStrictEqual({});
    requestClear();
  });
});

// ======================================== channel/addowner/v2 ========================================
describe('Testing for channel/addowner/v2  ', () => {
  test('channel/addowner/v2 channel does not exist error', () => {
    setupDatabase();
    const body = { channelId: 9999, uId: user1.authUserId };
    expect(sendPost('channel/addowner/v2', admin.token, body)).toStrictEqual(400);
  });

  test('channel/addowner/v2 user doesnt exists error', () => {
    const body = { channelId: channel1, uId: 99999 };
    expect(sendPost('channel/addowner/v2', admin.token, body)).toStrictEqual(400);
  });

  test('channel/addowner/v2 user is not a member of the channel', () => {
    const body = { channelId: channel1, uId: user2.authUserId };
    expect(sendPost('channel/addowner/v2', admin.token, body)).toStrictEqual(400);
    requestClear();
  });

  test('channel/addowner/v2 user is already an owner', () => {
    setupDatabase();
    // make user1 an owner of channel1;
    let body = { channelId: channel1, uId: user1.authUserId };
    expect(sendPost('channel/addowner/v2', admin.token, body)).toStrictEqual({});
    // try to make user1 an owner of channel1 again;
    body = { channelId: channel1, uId: user1.authUserId };
    expect(sendPost('channel/addowner/v2', admin.token, body)).toStrictEqual(400);
    requestClear();
  });

  test('channel/addowner/v2 fail user doesnt have permissions', () => {
    setupDatabase();
    const body = { channelId: channel2, uId: user2.authUserId };
    expect(sendPost('channel/addowner/v2', user1.token, body)).toStrictEqual(403);
    requestClear();
  });

  test('channel/addowner/v2 authorised user works', () => {
    setupDatabase();
    // add user1 to channel 2
    const body1 = { channelId: channel2 };
    sendPost('channel/join/v3', admin.token, body1);
    const body = { channelId: channel2, uId: user2.authUserId };
    expect(sendPost('channel/addowner/v2', admin.token, body)).toStrictEqual({});
    requestClear();
  });
});

// ======================================== channel/removeowner/v2 ========================================
describe('Testing for channel/removeowner/v2', () => {
  test('channel/removeowner/v2 channel does not exist error', () => {
    setupDatabase();
    const body = { channelId: 9999, uId: user1.authUserId };
    expect(sendPost('channel/removeowner/v2', admin.token, body)).toStrictEqual(400);
  });

  test('channel/removeowner/v2 user doesnt exists error', () => {
    const body = { channelId: channel1, uId: 99999 };
    expect(sendPost('channel/removeowner/v2', admin.token, body)).toStrictEqual(400);
  });

  test('channel/removeowner/v2 user is not a member of the channel', () => {
    const body = { channelId: channel1, uId: user2.authUserId };
    expect(sendPost('channel/removeowner/v2', admin.token, body)).toStrictEqual(400);
  });

  test('channel/removeowner/v2 authorised user doesnt have permissions', () => {
    // add user1 to channel 2
    const body1 = { channelId: channel2 };
    expect(sendPost('channel/join/v3', user1.token, body1)).toStrictEqual({});

    const body2 = { channelId: channel2, uId: user2.authUserId };
    expect(sendPost('channel/addowner/v2', admin.token, body2)).toStrictEqual({});

    const body = { channelId: channel2, uId: admin.authUserId };
    expect(sendPost('channel/removeowner/v2', user1.token, body)).toStrictEqual(403);
    requestClear();
  });

  test('channel/removeowner/v2 user is not an owner', () => {
    setupDatabase();
    const body = { channelId: channel1, uId: user1.authUserId };
    expect(sendPost('channel/removeowner/v2', admin.token, body)).toStrictEqual(400);
  });

  test('channel/removeowner/v2 there is only one admin', () => {
    const body = { channelId: channel1, uId: admin.authUserId };
    expect(sendPost('channel/removeowner/v2', admin.token, body)).toStrictEqual(400);
    requestClear();
  });
});

// ======================================== message/react/v1 ========================================
describe('Testing for message/react/V1', () => {
  test('messageId is not a valid message', () => {
    setupDatabase();
    const body = { messageId: 9999999, reactId: 1 };
    expect(sendPost('message/react/v1', user1.token, body)).toStrictEqual(400);
  });

  test('reactId is not a valid', () => {
    const body = { messageId: message1, reactId: 99999 };
    expect(sendPost('message/react/v1', user1.token, body)).toStrictEqual(400);
  });

  test('react works channel', () => {
    const body = { messageId: message1, reactId: 1 };
    expect(sendPost('message/react/v1', user1.token, body)).toStrictEqual({});
  });

  test('react works dm', () => {
    const body = { messageId: dm1, reactId: 1 };
    expect(sendPost('message/react/v1', user1.token, body)).toStrictEqual({});
    requestClear();
  });
});

// // ======================================== message/unreact/v1 ========================================
describe('Testing for message/unreact/V1', () => {
  test('messageId is not a valid message', () => {
    setupDatabase();
    const body = { messageId: 9999999, reactId: 1 };
    expect(sendPost('message/unreact/v1', user1.token, body)).toStrictEqual(400);
  });

  test('reactId is not a valid', () => {
    const body = { messageId: message1, reactId: 99999 };
    expect(sendPost('message/unreact/v1', user1.token, body)).toStrictEqual(400);
  });

  test('unreact works channel', () => {
    const body1 = { token: user1.token, messageId: message1, reactId: 1 };
    expect(sendPost('message/react/v1', user1.token, body1)).toStrictEqual({});
    const body = { token: user1.token, messageId: message1, reactId: 1 };
    expect(sendPost('message/unreact/v1', user1.token, body)).toStrictEqual({});
    requestClear();
  });

  test('unreact works dm', () => {
    setupDatabase();
    const body1 = { token: user1.token, messageId: dm1, reactId: 1 };
    sendPost('message/react/v1', user1.token, body1);
    const body = { token: user1.token, messageId: dm1, reactId: 1 };
    expect(sendPost('message/unreact/v1', user1.token, body)).toStrictEqual({});
    requestClear();
  });
});

// ======================================== message/pin/v1 ========================================
describe('Testing for message/pin/v1', () => {
  test('messageId is not a valid message', () => {
    setupDatabase();
    const body = { messageId: 9999999 };
    expect(sendPost('message/pin/v1', admin.token, body)).toStrictEqual(400);
  });

  test('pin failed, user doesnt have permissions', () => {
    const body = { messageId: message1 };
    expect(sendPost('message/pin/v1', user1.token, body)).toStrictEqual(403);
  });

  test('pin works channel', () => {
    const body = { messageId: message1 };
    expect(sendPost('message/pin/v1', admin.token, body)).toStrictEqual({});
  });

  test('pin already exists', () => {
    const body = { messageId: message1 };
    expect(sendPost('message/pin/v1', admin.token, body)).toStrictEqual(400);
  });

  test('pin works dm', () => {
    const body = { messageId: dm1 };
    expect(sendPost('message/pin/v1', admin.token, body)).toStrictEqual({});
    requestClear();
  });
});
// // ======================================== message/unpin/v1 ========================================
describe('Testing for message/unpin/v1', () => {
  test('messageId is not a valid message', () => {
    setupDatabase();
    const body = { messageId: 9999999 };
    expect(sendPost('message/unpin/v1', admin.token, body)).toStrictEqual(400);
  });

  test('upin doesnt exist', () => {
    const body = { messageId: message2 };
    expect(sendPost('message/unpin/v1', admin.token, body)).toStrictEqual(400);
  });

  test('upin fails, user doesnt have permissions', () => {
    const body1 = { messageId: message1 };
    expect(sendPost('message/pin/v1', admin.token, body1)).toStrictEqual({});
    const body = { messageId: message1 };
    expect(sendPost('message/unpin/v1', user1.token, body)).toStrictEqual(403);
  });

  test('upin works channel', () => {
    const body1 = { messageId: message1 };
    sendPost('message/pin/v1', admin.token, body1);
    const body = { messageId: message1 };
    expect(sendPost('message/unpin/v1', admin.token, body)).toStrictEqual({});
  });

  test('unpin works dm', () => {
    const body1 = { messageId: dm1 };
    sendPost('message/pin/v1', admin.token, body1);
    const body = { messageId: dm1 };
    expect(sendPost('message/unpin/v1', admin.token, body)).toStrictEqual({});
    requestClear();
  });
});
