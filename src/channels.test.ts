import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

interface user {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  res: any,
  bodyObj: any,
}

// interface channel {
//   token: string,
//   name: string,
//   isPublic: boolean,
//   res: any,
//   bodyObj: any,
// }

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
    bodyObj: JSON.parse(String(res.getBody())),
  };
}

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
//     bodyObj: JSON.parse(String(res.getBody())),
//   };
// }

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

// const createTestChannel = (token: string, name: string, isPublic: boolean) => {
//   // channels/create/v2 returns { channelId }
//   const requestOutput = requestChannelsCreate(token, name, isPublic);

//   return {
//     token: token,
//     name: name,
//     isPublic: isPublic,
//     res: requestOutput.res,
//     bodyObj: requestOutput.bodyObj,
//   };
// };

describe('channels capabilities', () => {
  describe('test /channels/create/v2', () => {
    beforeEach(() => {
      requestClear();
    });

    let testUser: user;

    beforeEach(() => {
      // Create a test user
      testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      expect(testUser.bodyObj).not.toStrictEqual({ error: 'error' });
    });

    test('Success create new channel', () => {
      const testChannel = requestChannelsCreate(testUser.bodyObj.token, 'channelName', true);

      expect(testChannel.res.statusCode).toBe(OK);
      expect(testChannel.bodyObj).toStrictEqual({ channelId: expect.any(Number) });
    });

    test('Fail create new channel, invalid token', () => {
      const testChannel = requestChannelsCreate(testUser.bodyObj.token + 'a', 'channelName', true);

      expect(testChannel.res.statusCode).toBe(OK);
      expect(testChannel.bodyObj).toStrictEqual({ error: 'error' });
    });

    test.each([
      // length of name is less than 1 or more than 20 characters
      { name: '' },
      { name: 'moreThanTwentyCharacters' },
    ])("Fail create new channel, invalid channel name: '$name'", ({ name }) => {
      const testChannel = requestChannelsCreate(testUser.bodyObj.token, name, true);

      expect(testChannel.res.statusCode).toBe(OK);
      expect(testChannel.bodyObj).toStrictEqual({ error: 'error' });
    });
  });
});
