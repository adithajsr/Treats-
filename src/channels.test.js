
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels.js';
import { clearV1 } from './other.js';
import { getData, setData } from './dataStore.js';
import { authLoginV1, authRegisterV1, isHandleValid, doesEmailExist } from './auth';

beforeEach(() => {
    clearV1();
});  

describe ( 'channels functions testing', () => {


    const createTestUser = (email, password, nameFirst, nameLast) => {
        // authRegisterV1 returns { authUserId }
        return { email, password, nameFirst, nameLast, ...authRegisterV1(email, password, nameFirst, nameLast) };
    };
    
    const createTestChannel = (authUserId, name, isPublic) => {
        // channelsCreateV1 returns { channelId }
        return { authUserId, name, isPublic, ...channelsCreateV1(authUserId, name, isPublic) };
    };
    
    describe ('channelsListallV1 test', () => {

        test('invalid authid input - empty string', () => {

            expect(channelsListallV1('')).toStrictEqual({ error: 'error' });

        });

        test('authid is invalid - not a number', () => {

            expect(channelsListallV1('abcde')).toStrictEqual({ error: 'error' });

        });

        test('authid is invalid - not an existing user', () => {

            expect(channelsListallV1(2893479283)).toStrictEqual({ error: 'error' });

        });

        test('no channels in database', () => {
            let testUser1 = authRegisterV1('who@question.com', 'yourmumma', 'John', 'Smith');
            expect(channelsListallV1(testUser1.authUserId)).toStrictEqual({"channels": []});
        });

        test('return one channel', () => { 
            let testUser2 = authRegisterV1('whom@question.com', 'youmumma', 'Joh', 'Smit');
            let testChannel1 = createTestChannel(testUser2.authUserId, 'channelName', true);
            expect(channelsListallV1(testUser2.authUserId)).toStrictEqual({
                channels: [
                  {
                    channelId: testChannel1.channelId,
                    name : testChannel1.name,
                  }
                ]
              });        
            
        });

        test('return multiple channels', () => {
            let testUser3 = authRegisterV1('who@questin.com', 'youumma', 'Jon', 'Smih');
            let c1A = createTestChannel(testUser3.authUserId, 'channel1AName', false);
            let c1B = createTestChannel(testUser3.authUserId, 'channel1BName', true);
            let c1C = createTestChannel(testUser3.authUserId, 'channel1CName', false);

            const expected = new Set([
                {
                channelId: c1A.channelId,
                name: c1A.name,
                },
                {
                channelId: c1B.channelId,
                name: c1B.name,
                },
                {
                channelId: c1C.channelId,
                name: c1C.name,
                },
            ]);
            const received = new Set(channelsListallV1(testUser3.authUserId).channel);
            expect(received).toStrictEqual(expected);
        });

    });

});



describe('channels capabilities', () => {

  const createTestUser = (email, password, nameFirst, nameLast) => {
    // authRegisterV1 returns { authUserId }
    return { email, password, nameFirst, nameLast, ...authRegisterV1(email, password, nameFirst, nameLast) };
  };

  const createTestChannel = (authUserId, name, isPublic) => {
    // channelsCreateV1 returns { channelId }
    return { authUserId, name, isPublic, ...channelsCreateV1(authUserId, name, isPublic) };
  };

  let testUser;
  let testChannel;
  
  beforeEach(() => {
    testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    expect(testUser.authUserId).not.toStrictEqual({ error: 'error' });

    testChannel = createTestChannel(testUser.authUserId, 'channelName', true);
    expect(testChannel.channelId).not.toStrictEqual({ error: 'error' });
  });
  
  describe('channelsCreateV1', () => {

    test('Invalid authUserId', () => {
      expect(channelsCreateV1('notANumber', 'channelName', true)).toStrictEqual({ error: 'error' });
    });

    test.each([
      // length of name is less than 1 or more than 20 characters
      { name: '' },
      { name: 'moreThanTwentyCharacters' },
    ])("Invalid channel name: '$name'", ({ name }) => {
      expect(channelsCreateV1(testUser.authUserId, name, true)).toStrictEqual({ error: 'error' });
    });

    const channelsCreateObject = expect.objectContaining({
      channelId: expect.any(Number),
    });

    test('Containing the right keys', () => {
      expect(channelsCreateV1(testUser.authUserId, 'channelName', true)).toEqual(channelsCreateObject);
    });

    test('Can register same channel name, same publicness', () => {
      const c1 = channelsCreateV1(testUser.authUserId, 'channelName', true);
      const c2 = channelsCreateV1(testUser.authUserId, 'channelName', true);
      expect(c1).toStrictEqual(channelsCreateObject);
      expect(c2).toStrictEqual(channelsCreateObject);
      expect(c1).not.toStrictEqual(c2);
    });

  });

});

