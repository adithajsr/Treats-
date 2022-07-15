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

function debug(){
  let debug ={
    admin: admin.token,
    user1: user1.token,
    user2: user2.token,
    user3: user3.token,
    adminId: admin.authUserId,
    userId1: user1.authUserId,
    userId2: user2.authUserId,
    userId3: user3.authUserId,
    channel1: channel1,
    channel2: channel2,
    channel3: channel3,
  }
  console.log(debug);
}

// ======================================== Helper functions ========================================

function setupDatabase() {
  admin = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Hancock');
  user1 = requestAuthRegister('who.is.zac@is.the.question.com', 'zaccool', 'Zac', 'Li');
  user2 = requestAuthRegister('who.is.nick@is.the.question.com', 'yeyyey', 'Nick', 'Smith');
  user3 = requestAuthRegister('who.is.yet@is.the.question.com', 'nicolea', 'Nicole', 'pi');
  let c1 = requestChannelsCreate(admin.token, 'Channel1', true);  
  let c2 = requestChannelsCreate(admin.token, 'Channel2', true);
  let c3 = requestChannelsCreate(admin.token, 'Channel3', false); // channel3 is private
  
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

function sendPost(path:string, body: object) {
  const res = request(
    'POST',
      `${url}:${port}/${path}`,
      {
        json: body
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

function join(token: string, channelId: number) {
  const res = request(
    'POST',
      `${url}:${port}/channel/join/v2`,
      {
        json: {
          token: token,
          channelId: channelId,
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
  return JSON.parse(res.getBody() as string);
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
    console.log(body);
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
// describe('Testing for channel/addowner/v1  ', () => {
//   setupDatabase();
//   test('channel/addowner/v1 channel does not exist error', () => {
//     const body = { token: admin.token, channelId: 9999, uId: user1.authUserId };
//     expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
//   });

//   test('channel/addowner/v1 user doesnt exists error', () => {
//     const body = { token: admin.token, channelId: channel1, uId: 99999 };
//     expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
//   });

//   test('channel/addowner/v1 user is not a member of the channel', () => {
//     const body = { token: admin.token, channelId: channel1, uId: user2.authUserId };
//     expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
//     requestClear();
//   });

//   test('channel/addowner/v1 user is already an owner', () => {
//     setupDatabase();
//     // make user1 an owner of channel1;
//     let body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
//     expect(sendPost('channel/addowner/v1', body)).toStrictEqual({});
//     // try to make user1 an owner of channel1 again;
//     body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
//     expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
//     requestClear();
//   });

//   test('channel/addowner/v1 authorised user doesnt have permissions', () => {
//     setupDatabase();
//     // add user1 to channel 2
//     const body1 = { token: user1.token, channelId: channel2 };
//     expect(sendPost('channel/join/v2', body1)).toStrictEqual({});
//     const body = { token: user1.token, channelId: channel2, uId: user2.authUserId };
//     expect(sendPost('channel/addowner/v1', body)).toStrictEqual({ error: 'error' });
//     requestClear();
//   });
// });

// // ======================================== channel/removeowner/v1 ========================================
// describe('Testing for channel/removeowner/v1', () => {
//   test('channel/removeowner/v1 channel does not exist error', () => {
//     setupDatabase();
//     const body = { token: admin.token, channelId: 9999, uId: user1.authUserId };
//     expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
//     requestClear();
//   });

//   test('channel/removeowner/v1 user doesnt exists error', () => {
//     const body = { token: admin.token, channelId: channel1, uId: 99999 };
//     expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
//   });

//   test('channel/removeowner/v1 user is not a member of the channel', () => {
//     const body = { token: admin.token, channelId: channel1, uId: user2.authUserId };
//     expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
//   });

//   test('channel/removeowner/v1 user is not an owner', () => {
//     const body = { token: admin.token, channelId: channel1, uId: user1.authUserId };
//     expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
//   });

//   test('channel/removeowner/v1 there is only one admin', () => {
//     const body = { token: admin.token, channelId: channel1, uId: admin.authUserId };
//     expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
//     requestClear();
//   });

//   test('channel/removeowner/v1 authorised user doesnt have permissions', () => {
//     setupDatabase();
//     // add user1 to channel 2
//     const body1 = { token: user1.token, channelId: channel2 };
//     expect(sendPost('channel/join/v2', body1)).toStrictEqual({});
//     // have user1 try and revoke permissions.
//     const body = { token: user1.token, channelId: channel2, uId: user2.authUserId };
//     expect(sendPost('channel/removeowner/v1', body)).toStrictEqual({ error: 'error' });
//     requestClear();
//   });
// });
