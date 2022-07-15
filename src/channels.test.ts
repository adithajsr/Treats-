// ======================================== Imports ========================================
import request from 'sync-request';
import config from './config.json';
import {requestClear} from './auth.test' 
const OK = 200;
const port = config.port;
const url = config.url;
// =========================================================================================

type user = {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  res: any,
  bodyObj: any,
};

interface channel {
  token: string,
  name: string,
  isPublic: boolean,
  res: any,
  bodyObj: any,
}

const createTestUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  // auth/register/v2 returns { token, authUserId }
  const requestOutput = requestAuthRegister(email, password, nameFirst, nameLast);

  return {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    res: requestOutput.res,
    bodyObj: requestOutput.bodyObj,
  };
};

const createTestChannel = (token: string, name: string, isPublic: boolean) => {
  // channels/create/v2 returns { channelId }
  const requestOutput = requestChannelsCreate(token, name, isPublic);

  return {
    token: token,
    name: name,
    isPublic: isPublic,
    res: requestOutput.res,
    bodyObj: requestOutput.bodyObj,
  };
};

describe('channels capabilities', () => {
//   describe('test /channels/create/v2', () => {
//     beforeEach(() => {
//       requestClear();
//     });

//     let testUser: user;

//     beforeEach(() => {
//       // Create a test user
//       testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
//       expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
//     });

//     test('Success create new channel', () => {
//       const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'channelName', true);

//       expect(testChannel.res.statusCode).toBe(OK);
//       expect(testChannel.bodyObj).toStrictEqual({ channelId: expect.any(Number) });
//     });

//     test('Fail create new channel, invalid token', () => {
//       const testChannel = requestChannelsCreate(testUser.bodyObj.token + 'a', 'channelName', true);

//       expect(testChannel.res.statusCode).toBe(OK);
//       expect(testChannel.bodyObj).toStrictEqual({ error: 'error' });
//     });

//     test.each([
//       // length of name is less than 1 or more than 20 characters
//       { name: '' },
//       { name: 'moreThanTwentyCharacters' },
//     ])("Fail create new channel, invalid channel name: '$name'", ({ name }) => {
//       const testChannel = requestChannelsCreate(testUser.bodyObj.token, name, true);

//       expect(testChannel.res.statusCode).toBe(OK);
//       expect(testChannel.bodyObj).toStrictEqual({ error: 'error' });
//     });
//   });

//   describe('test /channels/list/v2', () => {
//     beforeEach(() => {
//       requestClear();
//     });

//     let testUser1: user;
//     let testUser2: user;
//     let testUser3: user;
//     let testUser4: user;
//     let testChannel1: channel;

//     beforeEach(() => {
//       // Create test user 1
//       testUser1 = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
//       expect(testUser1.bodyObj).not.toStrictEqual({ error: 'error' });

//       // Create test user 2
//       testUser2 = createTestUser('student@unsw.com', 'password', 'Jane', 'Schmoe');
//       expect(testUser2.bodyObj).not.toStrictEqual({ error: 'error' });

//       // Create test user 3
//       testUser3 = createTestUser('tsmith@yahoo.com', 'qwerty', 'Tom', 'Smith');
//       expect(testUser3.bodyObj).not.toStrictEqual({ error: 'error' });

//       // Create test user 4
//       testUser4 = createTestUser('jbloggs@proton.com', '111111', 'Jo', 'Bloggs');
//       expect(testUser4.bodyObj).not.toStrictEqual({ error: 'error' });

//       // testUser1 created testChannel1 so they automatically join it
//       testChannel1 = createTestChannel(testUser1.bodyObj.token, 'channelName', true);
//       expect(testChannel1.bodyObj).not.toStrictEqual({ error: 'error' });
//     });

//     test('Fail channels list, invalid token', () => {
//       const testList = requestChannelsList(testUser2.bodyObj.token + 'a');

//       expect(testList.res.statusCode).toBe(OK);
//       expect(testList.bodyObj).toStrictEqual({ error: 'error' });
//     });

//     test('One channel, authorised user is in channel', () => {
//       // Only channel is testChannel1, testUser1 is in testChannel1
//       const testList = requestChannelsList(testUser1.bodyObj.token);

//       expect(testList.res.statusCode).toBe(OK);
//       expect(testList.bodyObj).toStrictEqual({
//         channels: [
//           {
//             channelId: testChannel1.bodyObj.channelId,
//             name: testChannel1.name,
//           }
//         ]
//       });
//     });

//     test('One channel, authorised user is not in channel', () => {
//       // Only channel is testChannel1, testUser2 is not in testChannel1
//       const testList = requestChannelsList(testUser2.bodyObj.token);

//       expect(testList.res.statusCode).toBe(OK);
//       expect(testList.bodyObj).toStrictEqual({
//         channels: []
//       });
//     });

//     test('Multiple channels, authorised user is in all channels', () => {
//       // testUser1 is in all channels
//       const c1A = createTestChannel(testUser1.bodyObj.token, 'channel1AName', false);
//       const c1B = createTestChannel(testUser1.bodyObj.token, 'channel1BName', true);
//       const c1C = createTestChannel(testUser1.bodyObj.token, 'channel1CName', false);

//       const expected = new Set([
//         {
//           channelId: testChannel1.bodyObj.channelId,
//           name: testChannel1.name,
//         },
//         {
//           channelId: c1A.bodyObj.channelId,
//           name: c1A.name,
//         },
//         {
//           channelId: c1B.bodyObj.channelId,
//           name: c1B.name,
//         },
//         {
//           channelId: c1C.bodyObj.channelId,
//           name: c1C.name,
//         },
//       ]);

//       const testList = requestChannelsList(testUser1.bodyObj.token);

//       expect(testList.res.statusCode).toBe(OK);
//       const received = new Set(testList.bodyObj.channels);
//       expect(received).toStrictEqual(expected);
//     });

//     test('Multiple channels, authorised user is in some channels', () => {
//       // testUser1 is in some channels, remaining channels created by testUser2
//       const c1A = createTestChannel(testUser1.bodyObj.token, 'channel1AName', false);
//       createTestChannel(testUser2.bodyObj.token, 'channel2AName', true);
//       createTestChannel(testUser2.bodyObj.token, 'channel2BName', false);

//       const expected = new Set([
//         {
//           channelId: testChannel1.bodyObj.channelId,
//           name: testChannel1.name,
//         },
//         {
//           channelId: c1A.bodyObj.channelId,
//           name: c1A.name,
//         },
//       ]);

//       const testList = requestChannelsList(testUser1.bodyObj.token);

//       expect(testList.res.statusCode).toBe(OK);
//       const received = new Set(testList.bodyObj.channels);
//       expect(received).toStrictEqual(expected);
//     });

//     test('Multiple channels, authorised user is in no channels', () => {
//       // testUser2 is in no channels, all channels created by testUser1
//       createTestChannel(testUser1.bodyObj.token, 'channel1AName', false);
//       createTestChannel(testUser1.bodyObj.token, 'channel1BName', true);
//       createTestChannel(testUser1.bodyObj.token, 'channel1CName', false);

//       const testList = requestChannelsList(testUser2.bodyObj.token);
//       expect(testList.res.statusCode).toBe(OK);
//       expect(testList.bodyObj).toStrictEqual({
//         channels: []
//       });
//     });
//   });
// });

// function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
//   const res = request(
//     'POST',
//     `${url}:${port}/channels/create/v2`,
//     {
//       json: { token, name, isPublic },
//     }
//   );
//   return {
//     res: res,
//     bodyObj: JSON.parse(res.getBody() as string),
//   };
// }

// function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
//   const res = request(
//     'POST',
//     `${url}:${port}/auth/register/v2`,
//     {
//       json: { email, password, nameFirst, nameLast },
//     }
//   );
//   return {
//     res: res,
//     bodyObj: JSON.parse(res.getBody() as string),
//   };
// }

// function requestChannelsList(token: string) {
//   const res = request(
//     'GET',
//     `${url}:${port}/channels/list/v2`,
//     {
//       qs: { token },
//     }
//   );
//   return {
//     res: res,
//     bodyObj: JSON.parse(res.getBody() as string),
//   };
// }

// function requestClear() {
//   const res = request(
//     'DELETE',
//     `${url}:${port}/clear/v1`,
//     {
//       qs: {},
//     }
//   );
//   return JSON.parse(res.getBody() as string);
// }

// function requestChannelsListall(token: string) {
//   const res = request(
//     'GET',
//     `${url}:${port}/channels/listall/v2`,
//     {
//       qs: {
//         token
//       }
//     }
//   );
//   return {
//     res: res,
//     bodyObj: JSON.parse(res.getBody() as string),
//   };
// }

// describe('channels functions testing', () => {
//   describe('channels/listall/v2 test', () => {
//     let testUser: user;
//     beforeEach(() => {
//       requestClear();
//       // Create a test user
//       testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
//       expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
//     });

//     afterEach(() => {
//       requestClear();
//     });

//     test('invalid token, fail channels list all', () => {
//       const testRequest = requestChannelsListall(testUser.bodyObj.token + 'a');
//       expect(testRequest.res.statusCode).toBe(OK);
//       expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
//     });

//     test('no channels in database, channels list all success', () => {
//       const testRequest = requestChannelsListall(testUser.bodyObj.token);
//       expect(testRequest.res.statusCode).toBe(OK);
//       expect(testRequest.bodyObj).toStrictEqual({
//         channels: []
//       });
//     });

//     test('return one channel, channels list all success', () => {
//       const testChannel = createTestChannel(testUser.bodyObj.token, 'channelName', true);
//       const testRequest = requestChannelsListall(testUser.bodyObj.token);
//       expect(testRequest.res.statusCode).toBe(OK);
//       expect(testRequest.bodyObj).toStrictEqual({
//         channels: [
//           {
//             channelId: testChannel.bodyObj.channelId,
//             name: testChannel.name,
//           }
//         ]
//       });
//     });

//     test('return multiple channels, channels list all success', () => {
//       const c1 = createTestChannel(testUser.bodyObj.token, 'ychannelName', true);
//       const c2 = createTestChannel(testUser.bodyObj.token, 'dchannelName', false);
//       const c3 = createTestChannel(testUser.bodyObj.token, 'hchannelName', true);
//       const expected = new Set([
//         {
//           channelId: c1.bodyObj.channelId,
//           name: c1.name,
//         },
//         {
//           channelId: c2.bodyObj.channelId,
//           name: c2.name,
//         },
//         {
//           channelId: c3.bodyObj.channelId,
//           name: c3.name,
//         },
//       ]);
//       const testRequest = requestChannelsListall(testUser.bodyObj.token);

//       expect(testRequest.res.statusCode).toBe(OK);
//       const received = new Set(testRequest.bodyObj.channels);
//       expect(received).toStrictEqual(expected);
//     });
//   });

//   describe('test /channels/list/v2', () => {
//     beforeEach(() => {
//       requestClear();
//     });

//     let testUser1: user;
//     let testUser2: user;
//     let testUser3: user;
//     let testUser4: user;
//     let testChannel1: channel;

//     beforeEach(() => {
//       // Create test user 1
//       testUser1 = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
//       expect(testUser1.bodyObj).not.toStrictEqual({ error: 'error' });

//       // Create test user 2
//       testUser2 = createTestUser('student@unsw.com', 'password', 'Jane', 'Schmoe');
//       expect(testUser2.bodyObj).not.toStrictEqual({ error: 'error' });

//       // Create test user 3
//       testUser3 = createTestUser('tsmith@yahoo.com', 'qwerty', 'Tom', 'Smith');
//       expect(testUser3.bodyObj).not.toStrictEqual({ error: 'error' });

//       // Create test user 4
//       testUser4 = createTestUser('jbloggs@proton.com', '111111', 'Jo', 'Bloggs');
//       expect(testUser4.bodyObj).not.toStrictEqual({ error: 'error' });

//       // testUser1 created testChannel1 so they automatically join it
//       testChannel1 = createTestChannel(testUser1.bodyObj.token, 'channelName', true);
//       expect(testChannel1.bodyObj).not.toStrictEqual({ error: 'error' });
//     });

//     test('Fail channels list, invalid token', () => {
//       const testList = requestChannelsList(testUser2.bodyObj.token + 'a');

//       expect(testList.res.statusCode).toBe(OK);
//       expect(testList.bodyObj).toStrictEqual({ error: 'error' });
//     });

//     test('One channel, authorised user is in channel', () => {
//       // Only channel is testChannel1, testUser1 is in testChannel1
//       const testList = requestChannelsList(testUser1.bodyObj.token);

//       expect(testList.res.statusCode).toBe(OK);
//       expect(testList.bodyObj).toStrictEqual({
//         channels: [
//           {
//             channelId: testChannel1.bodyObj.channelId,
//             name: testChannel1.name,
//           }
//         ]
//       });
//     });

//     test('One channel, authorised user is not in channel', () => {
//       // Only channel is testChannel1, testUser2 is not in testChannel1
//       const testList = requestChannelsList(testUser2.bodyObj.token);

//       expect(testList.res.statusCode).toBe(OK);
//       expect(testList.bodyObj).toStrictEqual({
//         channels: []
//       });
//     });

//     test('Multiple channels, authorised user is in all channels', () => {
//       // testUser1 is in all channels
//       const c1A = createTestChannel(testUser1.bodyObj.token, 'channel1AName', false);
//       const c1B = createTestChannel(testUser1.bodyObj.token, 'channel1BName', true);
//       const c1C = createTestChannel(testUser1.bodyObj.token, 'channel1CName', false);

//       const expected = new Set([
//         {
//           channelId: testChannel1.bodyObj.channelId,
//           name: testChannel1.name,
//         },
//         {
//           channelId: c1A.bodyObj.channelId,
//           name: c1A.name,
//         },
//         {
//           channelId: c1B.bodyObj.channelId,
//           name: c1B.name,
//         },
//         {
//           channelId: c1C.bodyObj.channelId,
//           name: c1C.name,
//         },
//       ]);

//       const testList = requestChannelsList(testUser1.bodyObj.token);

//       expect(testList.res.statusCode).toBe(OK);
//       const received = new Set(testList.bodyObj.channels);
//       expect(received).toStrictEqual(expected);
//     });

//     test('Multiple channels, authorised user is in some channels', () => {
//       // testUser1 is in some channels, remaining channels created by testUser2
//       const c1A = createTestChannel(testUser1.bodyObj.token, 'channel1AName', false);
//       createTestChannel(testUser2.bodyObj.token, 'channel2AName', true);
//       createTestChannel(testUser2.bodyObj.token, 'channel2BName', false);

//       const expected = new Set([
//         {
//           channelId: testChannel1.bodyObj.channelId,
//           name: testChannel1.name,
//         },
//         {
//           channelId: c1A.bodyObj.channelId,
//           name: c1A.name,
//         },
//       ]);

//       const testList = requestChannelsList(testUser1.bodyObj.token);

//       expect(testList.res.statusCode).toBe(OK);
//       const received = new Set(testList.bodyObj.channels);
//       expect(received).toStrictEqual(expected);
//     });

//     test('Multiple channels, authorised user is in no channels', () => {
//       // testUser2 is in no channels, all channels created by testUser1
//       createTestChannel(testUser1.bodyObj.token, 'channel1AName', false);
//       createTestChannel(testUser1.bodyObj.token, 'channel1BName', true);
//       createTestChannel(testUser1.bodyObj.token, 'channel1CName', false);

//       const testList = requestChannelsList(testUser2.bodyObj.token);
//       expect(testList.res.statusCode).toBe(OK);
//       expect(testList.bodyObj).toStrictEqual({
//         channels: []
//       });
//     });
//   });
});



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
