import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

type user = {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  res: any,
  bodyObj: any,
};

// Defined numbers.
const GLOBAL = 1;
/*
describe('Testing of channel functions', () => {
//data setup
    var test_user = 34546;
    var test_user2 = 75646;
    var test_channel = 999;
    const database = {
      user: [{
          uId: 34546,
          email: 'student@unsw.com',
          password: 'password',
          nameFirst: 'John',
          nameLast: 'Doe',
          handleStr: 'JohnD123',
          globalPerms: 'global',
      },{
          uId: 75646,
                  email: 'student@unsw.com',
                  password: 'password',
                  nameFirst: 'Jack',
                  nameLast: 'Smith',
                  handleStr: 'Jacksmith5',
                  globalPerms: 'global',
      },{
          uId: 37383,
                email: 'student@unsw.com',
                password: 'password',
                nameFirst: 'Grace',
                nameLast: 'Shim',
                handleStr: 'Graceshim0',
                globalPerms: 'global',
                channelPerms: 'owner',
      },{
          uId: 34526,
                email: 'student@unsw.com',
                password: 'password',
                nameFirst: 'Nathan',
                nameLast: 'Fawkes',
                handleStr: 'Nathanfawkes3',
                globalPerms: 'global',
                channelPerms: 'member',
      },{
          uId: 74623,
              email: 'student@unsw.com',
              password: 'password',
              nameFirst: 'Dylan',
              nameLast: 'Shadbolt',
              handleStr: 'Dylanshadbolt3',
              globalPerms: 'global',
              channelPerms: 'member',
      },{
          uId: 54728,
              email: 'student@unsw.com',
              password: 'password',
              nameFirst: 'Alice',
              nameLast: 'Jones',
              handleStr: 'Alicejones2',
              globalPerms: 'global',
              channelPerms: 'member',
      }],

      channel: [{
          channelId: 999,
          channelName: 'channel',
          isPublic: true,
          start: 0,
          members: [{
                  uId: 34546,
                  email: 'student@unsw.com',
                  password: 'password',
                  nameFirst: 'John',
                  nameLast: 'Doe',
                  handleStr: 'JohnD123',
                  globalPerms: 'global',
                  channelPerms: 'owner',
              },
  {
                  uId: 75646,
                  email: 'student@unsw.com',
                  password: 'password',
                  nameFirst: 'Jack',
                  nameLast: 'Smith',
                  handleStr: 'Jacksmith5',
                  globalPerms: 'global',
                  channelPerms: 'member',
              }],
          messages: [{
                  uId: "75646",
                  timestamp: '001',
                  message: "Hello world",
              }]
      },
      {
        channelId: 654,
        channelName: 'channel 2',
        isPublic: false,
        start: 0,
        members: [{
                uId: 37383,
                email: 'student@unsw.com',
                password: 'password',
                nameFirst: 'Grace',
                nameLast: 'Shim',
                handleStr: 'Graceshim0',
                globalPerms: 'global',
                channelPerms: 'owner',
            },
            {
                uId: 34526,
                email: 'student@unsw.com',
                password: 'password',
                nameFirst: 'Nathan',
                nameLast: 'Fawkes',
                handleStr: 'Nathanfawkes3',
                globalPerms: 'global',
                channelPerms: 'member',
            },
            {
              uId: 74623,
              email: 'student@unsw.com',
              password: 'password',
              nameFirst: 'Dylan',
              nameLast: 'Shadbolt',
              handleStr: 'Dylanshadbolt3',
              globalPerms: 'global',
              channelPerms: 'member',
            },
            {
              uId: 54728,
              email: 'student@unsw.com',
              password: 'password',
              nameFirst: 'Alice',
              nameLast: 'Jones',
              handleStr: 'Alicejones2',
              globalPerms: 'global',
              channelPerms: 'member',
            }
          ],
        messages: [{
                uId: "75646",
                timestamp: '001',
                message: "Hello world",
            },
            {
              uId: "63783",
              timestamp: '013',
              message: "Hello world 2",
          }
          ]
    }]
  }

setData(database);

//Actual testing
        test('channel states test', () => {
          expect(channelPublic(100000)).toStrictEqual('false'); //100000 is a random non existent channel id.
          expect(channelPublic(999)).toStrictEqual('true');
        });

        test('channel exists tests', () => { //what does that mean
            expect(channelExists(100000)).toStrictEqual('false'); //100000 is a random non existent channel id.
            expect(channelExists(999)).toStrictEqual('true');
            expect(channelExists(654)).toStrictEqual('true');
          });

        test('uId exists tests', () => { //what does that mean
            expect(memberExists(100000, 75646)).toStrictEqual('false');//100000 is a random non existent channel id.
            expect(memberExists(9999, 100000)).toStrictEqual('false');//100000 is a random non existent uId.
            expect(memberExists(999,75646)).toStrictEqual('true');
            expect(memberExists(654,75646)).toStrictEqual('false');
          });

        test('Permissions of a uId', () => { //what does that mean
            expect(channelPermissions(100000, 75646)).toStrictEqual('invalid');//100000 is a random non existent channel id.
            expect(channelPermissions(999, 100000)).toStrictEqual('invalid');//100000 is a random non existent uId.
            expect(channelPermissions(999,75646)).toStrictEqual('member');
            expect(channelPermissions(654,37383)).toStrictEqual('owner');
          });

        test('Permissions of a uId', () => { //what does that mean
            expect(globalPermissions(100000)).toStrictEqual('invalid');//100000 is a random non existent uid.
            expect(globalPermissions(34546)).toStrictEqual('global');
          });

        test('channelJoinV1 channel does not exist error', () => {
            expect(channelJoinV1(37383, 888)).toStrictEqual({error: 'error'});
          });

        test('channelJoinV1 already exists error', () => {
            expect(channelJoinV1(34546,999)).toStrictEqual({error: 'error'});
          });
        test('channelJoinV1 private channel error', () => {
            expect(channelJoinV1(37383, 654)).toStrictEqual({error: 'error'});
          });

        test('channelJoinV1 useralready exists error', () => {
            expect(channelJoinV1(34546,999)).toStrictEqual({error: 'error'});
          });

        test('channelJoinV1 pass', () => {
            expect(channelJoinV1(34946,999)).toStrictEqual({});
          });

        test('channelInviteV1 full test', () => { //what does that mean
           expect(channelInviteV1(10000, 999, 657392 )).toStrictEqual({error: 'error'}); //100000 is a random non existent channel id.
           expect(channelInviteV1(75646,999,54728)).toStrictEqual({});
          });
  });
*/

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
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

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
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

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

describe('channel/details/v2 testing', () => {
  let testUser: user;

  beforeEach(() => {
    // Create a test user
    testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
  });

  // afterEach(() => {
  //   requestClear();
  // });

  test('invalid token, fail channel details', () => {
    const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'channelName', true);
    const testRequest = requestChannelDetails(testUser.bodyObj.token + 'a', testChannel.bodyObj.channelId);
    expect(testRequest.res.statusCode).toBe(OK);
    expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
  });

  test('channelId does not refer to valid channel, valid token, fail channel details', () => {
    const testRequest = requestChannelDetails(testUser.bodyObj.token, 9999);
    expect(testRequest.res.statusCode).toBe(OK);
    expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
  });

  test('channelId valid but authorised user is not a member of the channel, fail channel details', () => {
    const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
    const testUser2 = requestAuthRegister('validemail1@gmail.com', '123abc!@#1', 'Johna', 'Doea');
    const testRequest = requestChannelDetails(testUser2.bodyObj.token, testChannel.bodyObj.channelId);
    expect(testRequest.res.statusCode).toBe(OK);
    expect(testRequest.bodyObj).toStrictEqual({ error: 'error' });
  });

  test('successful channel details return', () => {
    const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
    const testRequest = requestChannelDetails(testUser.bodyObj.token, testChannel.bodyObj.channelId);
    expect(testRequest.res.statusCode).toBe(OK);
    expect(testRequest.bodyObj).toStrictEqual({
      name: 'name',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });
});

/*
test('Testing channel validity', () => {
	clearV1();
	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

	let returnValue = channelMessagesV1(danielId, danielChannel - 1, 0);
	expect(returnValue).toMatchObject({error: 'error'});
})

//Testing if the member is a part of the given channel
test('Testing user access', () => {
	//Input for authUserId must be incongruent with valid channelIds
	//What to do if authUserId is an invalid number? eg. -15
	clearV1();

	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

	let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');
	channelInviteV1(danielId, danielChannel, maddyId);

	let samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer');

	let returnValue = channelMessagesV1(samuelId, danielChannel, 0);
	expect(returnValue).toMatchObject({error: 'error'});

})
/*
//Testing when start is > no. of messages in given channelId
test('Invalid start argument', () => {
	//Input for start must be > no. of msgs in given channelId
	clear();

	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

	//HOW TO ACTUALLY PASS MESSAGES TO THIS CHANNEL? DO I JUST USE SETDATA?

	let returnValue = channelMessagesV1(danielId, danielChannel, 26);
	expect(returnValue).toMatchObject({error: 'error'});

})

//Testing default case
test('Default case', () => {

	clear();

	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

	//HOW TO ACTUALLY PASS MESSAGES TO THIS CHANNEL? DO I JUST USE SETDATA?

	let returnValue = channelMessagesV1(danielId, danielChannel, 0);

})

//Testing when start + 50 is greater than the amount of messages in the channel
test('When end is greater than final message', () => {
	clear();

	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

	//HOW TO ACTUALLY PASS MESSAGES TO THIS CHANNEL?

	let returnValue = channelMessagesV1(danielId, danielChannel, 35);
	expect(returnValue[3]).toBe(-1);
})
*/
