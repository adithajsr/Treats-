
import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;


const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authSam = ['samuelSchreyer@gmail.com', 'password', 'Sam', 'Schreyer'];

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
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
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
} function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
      json: { token, name, isPublic },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestChannelMessages(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/messages/v2`,
    {
      qs: {
        token, channelId, start,
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

type user = {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  res: any,
  bodyObj: any,
};


function requestChannelDetails(token: string, channelId: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/details/v2`,
    {
      qs: {
        token, channelId
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/send/v1`,
    {
      json: { token, channelId, message },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
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
  expect(requestChannelMessages(danielToken, channelId + 20, 0).bodyObj).toMatchObject({ error: 'error' });
  expect(requestChannelMessages(danielToken, channelId + 20, 0).res.statusCode).toBe(OK);
});

test('Start is greater than total number of messages', () => {
  requestClear();

  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const channelId = requestChannelsCreate(danielToken, 'danielChannel', true).bodyObj.channelId;

  requestMessageSend(danielToken, channelId, 'First message');
  requestMessageSend(danielToken, channelId, 'Second message');

  expect(requestChannelMessages(danielToken, channelId, 4).bodyObj).toMatchObject({ error: 'error' });
  expect(requestChannelMessages(danielToken, channelId, 4).res.statusCode).toBe(OK);
});


test('Requesting user is not member of channel', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;
  const channelId = requestChannelsCreate(danielToken, 'danielChannel', true).bodyObj.channelId;

  expect(requestChannelMessages(samToken, channelId, 0).bodyObj).toMatchObject({ error: 'error' });
  expect(requestChannelMessages(samToken, channelId, 0).res.statusCode).toBe(OK);
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

// */
// /*
// type user = {
//   email: string,
//   password: string,
//   nameFirst: string,
//   nameLast: string,
//   res: any,
//   bodyObj: any,
// };

// // Defined numbers.
// // const GLOBAL = 1;

// describe('Testing of channel functions', () => {
// //data setup
//     var test_user = 34546;
//     var test_user2 = 75646;
//     var test_channel = 999;
//     const database = {
//       user: [{
//           uId: 34546,
//           email: 'student@unsw.com',
//           password: 'password',
//           nameFirst: 'John',
//           nameLast: 'Doe',
//           handleStr: 'JohnD123',
//           globalPerms: 'global',
//       },{
//           uId: 75646,
//                   email: 'student@unsw.com',
//                   password: 'password',
//                   nameFirst: 'Jack',
//                   nameLast: 'Smith',
//                   handleStr: 'Jacksmith5',
//                   globalPerms: 'global',
//       },{
//           uId: 37383,
//                 email: 'student@unsw.com',
//                 password: 'password',
//                 nameFirst: 'Grace',
//                 nameLast: 'Shim',
//                 handleStr: 'Graceshim0',
//                 globalPerms: 'global',
//                 channelPerms: 'owner',
//       },{
//           uId: 34526,
//                 email: 'student@unsw.com',
//                 password: 'password',
//                 nameFirst: 'Nathan',
//                 nameLast: 'Fawkes',
//                 handleStr: 'Nathanfawkes3',
//                 globalPerms: 'global',
//                 channelPerms: 'member',
//       },{
//           uId: 74623,
//               email: 'student@unsw.com',
//               password: 'password',
//               nameFirst: 'Dylan',
//               nameLast: 'Shadbolt',
//               handleStr: 'Dylanshadbolt3',
//               globalPerms: 'global',
//               channelPerms: 'member',
//       },{
//           uId: 54728,
//               email: 'student@unsw.com',
//               password: 'password',
//               nameFirst: 'Alice',
//               nameLast: 'Jones',
//               handleStr: 'Alicejones2',
//               globalPerms: 'global',
//               channelPerms: 'member',
//       }],

//       channel: [{
//           channelId: 999,
//           channelName: 'channel',
//           isPublic: true,
//           start: 0,
//           members: [{
//                   uId: 34546,
//                   email: 'student@unsw.com',
//                   password: 'password',
//                   nameFirst: 'John',
//                   nameLast: 'Doe',
//                   handleStr: 'JohnD123',
//                   globalPerms: 'global',
//                   channelPerms: 'owner',
//               },
//   {
//                   uId: 75646,
//                   email: 'student@unsw.com',
//                   password: 'password',
//                   nameFirst: 'Jack',
//                   nameLast: 'Smith',
//                   handleStr: 'Jacksmith5',
//                   globalPerms: 'global',
//                   channelPerms: 'member',
//               }],
//           messages: [{
//                   uId: "75646",
//                   timestamp: '001',
//                   message: "Hello world",
//               }]
//       },
//       {
//         channelId: 654,
//         channelName: 'channel 2',
//         isPublic: false,
//         start: 0,
//         members: [{
//                 uId: 37383,
//                 email: 'student@unsw.com',
//                 password: 'password',
//                 nameFirst: 'Grace',
//                 nameLast: 'Shim',
//                 handleStr: 'Graceshim0',
//                 globalPerms: 'global',
//                 channelPerms: 'owner',
//             },
//             {
//                 uId: 34526,
//                 email: 'student@unsw.com',
//                 password: 'password',
//                 nameFirst: 'Nathan',
//                 nameLast: 'Fawkes',
//                 handleStr: 'Nathanfawkes3',
//                 globalPerms: 'global',
//                 channelPerms: 'member',
//             },
//             {
//               uId: 74623,
//               email: 'student@unsw.com',
//               password: 'password',
//               nameFirst: 'Dylan',
//               nameLast: 'Shadbolt',
//               handleStr: 'Dylanshadbolt3',
//               globalPerms: 'global',
//               channelPerms: 'member',
//             },
//             {
//               uId: 54728,
//               email: 'student@unsw.com',
//               password: 'password',
//               nameFirst: 'Alice',
//               nameLast: 'Jones',
//               handleStr: 'Alicejones2',
//               globalPerms: 'global',
//               channelPerms: 'member',
//             }
//           ],
//         messages: [{
//                 uId: "75646",
//                 timestamp: '001',
//                 message: "Hello world",
//             },
//             {
//               uId: "63783",
//               timestamp: '013',
//               message: "Hello world 2",
//           }
//           ]
//     }]
//   }

// setData(database);

// //Actual testing
//         test('channel states test', () => {
//           expect(channelPublic(100000)).toStrictEqual('false'); //100000 is a random non existent channel id.
//           expect(channelPublic(999)).toStrictEqual('true');
//         });

//         test('channel exists tests', () => { //what does that mean
//             expect(channelExists(100000)).toStrictEqual('false'); //100000 is a random non existent channel id.
//             expect(channelExists(999)).toStrictEqual('true');
//             expect(channelExists(654)).toStrictEqual('true');
//           });

//         test('uId exists tests', () => { //what does that mean
//             expect(memberExists(100000, 75646)).toStrictEqual('false');//100000 is a random non existent channel id.
//             expect(memberExists(9999, 100000)).toStrictEqual('false');//100000 is a random non existent uId.
//             expect(memberExists(999,75646)).toStrictEqual('true');
//             expect(memberExists(654,75646)).toStrictEqual('false');
//           });

//         test('Permissions of a uId', () => { //what does that mean
//             expect(channelPermissions(100000, 75646)).toStrictEqual('invalid');//100000 is a random non existent channel id.
//             expect(channelPermissions(999, 100000)).toStrictEqual('invalid');//100000 is a random non existent uId.
//             expect(channelPermissions(999,75646)).toStrictEqual('member');
//             expect(channelPermissions(654,37383)).toStrictEqual('owner');
//           });

//         test('Permissions of a uId', () => { //what does that mean
//             expect(globalPermissions(100000)).toStrictEqual('invalid');//100000 is a random non existent uid.
//             expect(globalPermissions(34546)).toStrictEqual('global');
//           });

//         test('channelJoinV1 channel does not exist error', () => {
//             expect(channelJoinV1(37383, 888)).toStrictEqual({error: 'error'});
//           });

//         test('channelJoinV1 already exists error', () => {
//             expect(channelJoinV1(34546,999)).toStrictEqual({error: 'error'});
//           });
//         test('channelJoinV1 private channel error', () => {
//             expect(channelJoinV1(37383, 654)).toStrictEqual({error: 'error'});
//           });

//         test('channelJoinV1 useralready exists error', () => {
//             expect(channelJoinV1(34546,999)).toStrictEqual({error: 'error'});
//           });

//         test('channelJoinV1 pass', () => {
//             expect(channelJoinV1(34946,999)).toStrictEqual({});
//           });

//         test('channelInviteV1 full test', () => { //what does that mean
//            expect(channelInviteV1(10000, 999, 657392 )).toStrictEqual({error: 'error'}); //100000 is a random non existent channel id.
//            expect(channelInviteV1(75646,999,54728)).toStrictEqual({});
//           });
//   });

// function requestChannelDetails(token: string, channelId: number) {
//   const res = request(
//     'GET',
//     `${url}:${port}/channel/details/v2`,
//     {
//       qs: {
//         token, channelId
//       }
//     }
//   );
//   return {
//     res: res,
//     bodyObj: JSON.parse(res.getBody() as string),
//   };
// }

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

// const createTestUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
//   // auth/register/v2 returns { token, authUserId }
//   const requestOutput = requestAuthRegister(email, password, nameFirst, nameLast);

//   return {
//     email: email,
//     password: password,
//     nameFirst: nameFirst,
//     nameLast: nameLast,
//     res: requestOutput.res,
//     bodyObj: requestOutput.bodyObj,
//   };
// };

// describe('channel/details/v2 testing', () => {
//   let testUser: user;

//   beforeEach(() => {
//     requestClear();
//     // Create a test user
//     testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
//     expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
//   });

//   afterEach(() => {
//     requestClear();
//   });

//   test('invalid token, fail channel details', () => {
//     const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'channelName', true);
//     const testRequest = requestChannelDetails(testUser.bodyObj.token + 'a', testChannel.bodyObj.channelId);
//     expect(testRequest.res.statusCode).toBe(OK);
//     expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
//   });

//   test('channelId does not refer to valid channel, valid token, fail channel details', () => {
//     const testRequest = requestChannelDetails(testUser.bodyObj.token, 9999);
//     expect(testRequest.res.statusCode).toBe(OK);
//     expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
//   });

//   test('channelId valid but authorised user is not a member of the channel, fail channel details', () => {
//     const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
//     const testUser2 = requestAuthRegister('validemail1@gmail.com', '123abc!@#1', 'Johna', 'Doea');
//     const testRequest = requestChannelDetails(testUser2.bodyObj.token, testChannel.bodyObj.channelId);
//     expect(testRequest.res.statusCode).toBe(OK);
//     expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
//   });

//   test('successful channel details return', () => {
//     const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
//     const testRequest = requestChannelDetails(testUser.bodyObj.token, testChannel.bodyObj.channelId);
//     expect(testRequest.res.statusCode).toBe(OK);
//     expect(testRequest.bodyObj).toStrictEqual({
//       name: 'name',
//       isPublic: true,
//       ownerMembers: expect.any(Array),
//       allMembers: expect.any(Array),
//     });
//   });
// });

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

// Changed function name due to duplication errors
function requestAuthRegisterNoRes(email: string, password: string, nameFirst: string, nameLast: string) {
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

function requestChannelsCreateNoRes(token: string, name: string, isPublic: boolean) {
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
