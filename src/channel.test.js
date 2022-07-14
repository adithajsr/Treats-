// // import {
// //   channelPublic, globalPermissions, channelPermissions, uIdExists,
// //   channelExists, memberExists, channelDetailsV1, channelJoinV1,
// //   channelInviteV1, channelMessagesV1
// // } from './channel';
// // import { channelsCreateV1 } from './channels';
// // import { authRegisterV1 } from './auth';
// // import { clearV1 } from './other';
// // import { getData, setData } from './dataStore';

// // Defined numbers.
// const GLOBAL = 1;

// describe('Testing of channel functions', () => {
// // data setup
//   const test_user = 34546;
//   const test_user2 = 75646;
//   const test_channel = 999;
//   const database = {
//     user: [{
//       uId: 34546,
//       email: 'student@unsw.com',
//       password: 'password',
//       nameFirst: 'John',
//       nameLast: 'Doe',
//       handleStr: 'JohnD123',
//       globalPerms: 'global',
//     }, {
//       uId: 75646,
//       email: 'student@unsw.com',
//       password: 'password',
//       nameFirst: 'Jack',
//       nameLast: 'Smith',
//       handleStr: 'Jacksmith5',
//       globalPerms: 'global',
//     }, {
//       uId: 37383,
//       email: 'student@unsw.com',
//       password: 'password',
//       nameFirst: 'Grace',
//       nameLast: 'Shim',
//       handleStr: 'Graceshim0',
//       globalPerms: 'global',
//       channelPerms: 'owner',
//     }, {
//       uId: 34526,
//       email: 'student@unsw.com',
//       password: 'password',
//       nameFirst: 'Nathan',
//       nameLast: 'Fawkes',
//       handleStr: 'Nathanfawkes3',
//       globalPerms: 'global',
//       channelPerms: 'member',
//     }, {
//       uId: 74623,
//       email: 'student@unsw.com',
//       password: 'password',
//       nameFirst: 'Dylan',
//       nameLast: 'Shadbolt',
//       handleStr: 'Dylanshadbolt3',
//       globalPerms: 'global',
//       channelPerms: 'member',
//     }, {
//       uId: 54728,
//       email: 'student@unsw.com',
//       password: 'password',
//       nameFirst: 'Alice',
//       nameLast: 'Jones',
//       handleStr: 'Alicejones2',
//       globalPerms: 'global',
//       channelPerms: 'member',
//     }],

//     channel: [{
//       channelId: 999,
//       channelName: 'channel',
//       isPublic: true,
//       start: 0,
//       members: [{
//         uId: 34546,
//         email: 'student@unsw.com',
//         password: 'password',
//         nameFirst: 'John',
//         nameLast: 'Doe',
//         handleStr: 'JohnD123',
//         globalPerms: 'global',
//         channelPerms: 'owner',
//       },
//       {
//         uId: 75646,
//         email: 'student@unsw.com',
//         password: 'password',
//         nameFirst: 'Jack',
//         nameLast: 'Smith',
//         handleStr: 'Jacksmith5',
//         globalPerms: 'global',
//         channelPerms: 'member',
//       }],
//       messages: [{
//         uId: '75646',
//         timestamp: '001',
//         message: 'Hello world',
//       }]
//     },
//     {
//       channelId: 654,
//       channelName: 'channel 2',
//       isPublic: false,
//       start: 0,
//       members: [{
//         uId: 37383,
//         email: 'student@unsw.com',
//         password: 'password',
//         nameFirst: 'Grace',
//         nameLast: 'Shim',
//         handleStr: 'Graceshim0',
//         globalPerms: 'global',
//         channelPerms: 'owner',
//       },
//       {
//         uId: 34526,
//         email: 'student@unsw.com',
//         password: 'password',
//         nameFirst: 'Nathan',
//         nameLast: 'Fawkes',
//         handleStr: 'Nathanfawkes3',
//         globalPerms: 'global',
//         channelPerms: 'member',
//       },
//       {
//         uId: 74623,
//         email: 'student@unsw.com',
//         password: 'password',
//         nameFirst: 'Dylan',
//         nameLast: 'Shadbolt',
//         handleStr: 'Dylanshadbolt3',
//         globalPerms: 'global',
//         channelPerms: 'member',
//       },
//       {
//         uId: 54728,
//         email: 'student@unsw.com',
//         password: 'password',
//         nameFirst: 'Alice',
//         nameLast: 'Jones',
//         handleStr: 'Alicejones2',
//         globalPerms: 'global',
//         channelPerms: 'member',
//       }
//       ],
//       messages: [{
//         uId: '75646',
//         timestamp: '001',
//         message: 'Hello world',
//       },
//       {
//         uId: '63783',
//         timestamp: '013',
//         message: 'Hello world 2',
//       }
//       ]
//     }]
//   };

//   setData(database);

//   // Actual testing
//   test('channel states test', () => {
//     expect(channelPublic(100000)).toStrictEqual('false'); // 100000 is a random non existent channel id.
//     expect(channelPublic(999)).toStrictEqual('true');
//   });

//   test('channel exists tests', () => { // what does that mean
//     expect(channelExists(100000)).toStrictEqual('false'); // 100000 is a random non existent channel id.
//     expect(channelExists(999)).toStrictEqual('true');
//     expect(channelExists(654)).toStrictEqual('true');
//   });

//   test('uId exists tests', () => { // what does that mean
//     expect(memberExists(100000, 75646)).toStrictEqual('false');// 100000 is a random non existent channel id.
//     expect(memberExists(9999, 100000)).toStrictEqual('false');// 100000 is a random non existent uId.
//     expect(memberExists(999, 75646)).toStrictEqual('true');
//     expect(memberExists(654, 75646)).toStrictEqual('false');
//   });

//   test('Permissions of a uId', () => { // what does that mean
//     expect(channelPermissions(100000, 75646)).toStrictEqual('invalid');// 100000 is a random non existent channel id.
//     expect(channelPermissions(999, 100000)).toStrictEqual('invalid');// 100000 is a random non existent uId.
//     expect(channelPermissions(999, 75646)).toStrictEqual('member');
//     expect(channelPermissions(654, 37383)).toStrictEqual('owner');
//   });

//   test('Permissions of a uId', () => { // what does that mean
//     expect(globalPermissions(100000)).toStrictEqual('invalid');// 100000 is a random non existent uid.
//     expect(globalPermissions(34546)).toStrictEqual('global');
//   });

//   test('channelJoinV1 channel does not exist error', () => {
//     expect(channelJoinV1(37383, 888)).toStrictEqual({ error: 'error' });
//   });

//   test('channelJoinV1 already exists error', () => {
//     expect(channelJoinV1(34546, 999)).toStrictEqual({ error: 'error' });
//   });
//   test('channelJoinV1 private channel error', () => {
//     expect(channelJoinV1(37383, 654)).toStrictEqual({ error: 'error' });
//   });

//   test('channelJoinV1 useralready exists error', () => {
//     expect(channelJoinV1(34546, 999)).toStrictEqual({ error: 'error' });
//   });

//   test('channelJoinV1 pass', () => {
//     expect(channelJoinV1(34946, 999)).toStrictEqual({});
//   });

//   test('channelInviteV1 full test', () => { // what does that mean
//     expect(channelInviteV1(10000, 999, 657392)).toStrictEqual({ error: 'error' }); // 100000 is a random non existent channel id.
//     expect(channelInviteV1(75646, 999, 54728)).toStrictEqual({});
//   });
// });

describe('channelDetailsV1 check', () => {
  beforeEach(() => {
    clearV1();
  });

  test('test error returned on invalid channel - empty string', () => {
    expect(channelDetailsV1(123, '')).toStrictEqual({ error: 'error' });
  });

  test('test error returned on invalid channel - not a number', () => {
    expect(channelDetailsV1(123, 'abcdef')).toStrictEqual({ error: 'error' });
  });

  test('test error returned on valid channel but authorised user is not a member of the channel', () => {
    const c1 = channelsCreateV1(12345, 'channelone', true);
    expect(channelDetailsV1(999999, c1)).toStrictEqual({ error: 'error' });
  });

  test('test successful return', () => {
    const a1 = authRegisterV1('email@unsw.com', 'password', 'john', 'doe');
    const c1 = channelsCreateV1(a1.authUserId, 'channelone', true);
    channelJoinV1(a1.authUserId, c1);
    expect(channelDetailsV1(a1.authUserId, c1.channelId)).toStrictEqual({
      name: 'channelone',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });
});

// test('Testing channel validity', () => {
//   clearV1();
//   const danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
//   const danielChannel = channelsCreateV1(danielId, 'testName', 1);

//   const returnValue = channelMessagesV1(danielId, danielChannel - 1, 0);
//   expect(returnValue).toMatchObject({ error: 'error' });
// });

// // Testing if the member is a part of the given channel
// test('Testing user access', () => {
//   // Input for authUserId must be incongruent with valid channelIds
//   // What to do if authUserId is an invalid number? eg. -15
//   clearV1();

//   const danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
//   const danielChannel = channelsCreateV1(danielId, 'testName', 1);

//   const maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');
//   channelInviteV1(danielId, danielChannel, maddyId);

//   const samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer');

//   const returnValue = channelMessagesV1(samuelId, danielChannel, 0);
//   expect(returnValue).toMatchObject({ error: 'error' });
// });
// /*
// //Testing when start is > no. of messages in given channelId
// test('Invalid start argument', () => {
// 	//Input for start must be > no. of msgs in given channelId
// 	clear();

// 	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
// 	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

// 	//HOW TO ACTUALLY PASS MESSAGES TO THIS CHANNEL? DO I JUST USE SETDATA?

// 	let returnValue = channelMessagesV1(danielId, danielChannel, 26);
// 	expect(returnValue).toMatchObject({error: 'error'});

// })

// //Testing default case
// test('Default case', () => {

// 	clear();

// 	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
// 	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

// 	//HOW TO ACTUALLY PASS MESSAGES TO THIS CHANNEL? DO I JUST USE SETDATA?

// 	let returnValue = channelMessagesV1(danielId, danielChannel, 0);

// })

// //Testing when start + 50 is greater than the amount of messages in the channel
// test('When end is greater than final message', () => {
// 	clear();

// 	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
// 	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

// 	//HOW TO ACTUALLY PASS MESSAGES TO THIS CHANNEL?

// 	let returnValue = channelMessagesV1(danielId, danielChannel, 35);
// 	expect(returnValue[3]).toBe(-1);
// })
// */
