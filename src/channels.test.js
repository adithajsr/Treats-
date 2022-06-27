import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels.js';
import { clearV1 } from './other.js';
import { getData, setData } from './dataStore.js';
import { authLoginV1, authRegisterV1, isHandleValid, doesEmailExist } from './auth';

beforeEach(() => {
    clearV1();
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
    
  
    describe('channelsCreateV1', () => {
  
      let testUser;
      let testChannel;
      
      beforeEach(() => {
        testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
        expect(testUser.authUserId).not.toStrictEqual({ error: 'error' });
    
        testChannel = createTestChannel(testUser.authUserId, 'channelName', true);
        expect(testChannel.channelId).not.toStrictEqual({ error: 'error' });
      });
  
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
  
  
    describe('channelsListV1', () => {
  
      let testUser1;
      let testUser2;
      let testChannel1;
      
      beforeEach(() => {
        testUser1 = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
        expect(testUser1.authUserId).not.toStrictEqual({ error: 'error' });
  
        testUser2 = createTestUser('student@unsw.com', 'password', 'Jane', 'Schmoe');
        expect(testUser2.authUserId).not.toStrictEqual({ error: 'error' });
    
        // testUser1 created testChannel so they automatically join it
        testChannel1 = createTestChannel(testUser1.authUserId, 'channelName', true);
        expect(testChannel1.channelId).not.toStrictEqual({ error: 'error' });
      });
  
      test('Invalid authUserId', () => {
        expect(channelsListV1('notANumber')).toStrictEqual({ error: 'error' });
      });
  
      test('One channel, authorised user is in channel', () => {
        // only channel is testChannel1, testUser1 is in testChannel1
        expect(channelsListV1(testUser1.authUserId)).toStrictEqual({
          channels: [
            {
              channelId: testChannel1.channelId,
              name : testChannel1.name,
            }
          ]
        });
      });
  
      test('One channel, authorised user is not in channel', () => {
        // only channel is testChannel1, testUser2 is not in testChannel1
        expect(channelsListV1(testUser2.authUserId)).toStrictEqual({
          channels: []
        });
      });
  
      test('Multiple channels, authorised user is in all channels', () => {
        // testUser1 is in all channels
        const c1A = createTestChannel(testUser1.authUserId, 'channel1AName', false);
        const c1B = createTestChannel(testUser1.authUserId, 'channel1BName', true);
        const c1C = createTestChannel(testUser1.authUserId, 'channel1CName', false);
  
        const expected = new Set([
          {
            channelId: testChannel1.channelId,
            name: testChannel1.name,
          },
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
        const received = new Set(channelsListV1(testUser1.authUserId).channels);
        expect(received).toStrictEqual(expected);
      });
  
      test('Multiple channels, authorised user is in some channels', () => {
        // testUser1 is in some channels, remaining channels created by testUser2
        const c1A = createTestChannel(testUser1.authUserId, 'channel1AName', false);
        const c2A = createTestChannel(testUser2.authUserId, 'channel2AName', true);
        const c2B = createTestChannel(testUser2.authUserId, 'channel2BName', false);
  
        const expected = new Set([
          {
            channelId: testChannel1.channelId,
            name: testChannel1.name,
          },
          {
            channelId: c1A.channelId,
            name: c1A.name,
          },
        ]);
        const received = new Set(channelsListV1(testUser1.authUserId).channels);
        expect(received).toStrictEqual(expected);
      });
  
      test('Multiple channels, authorised user is in no channels', () => {
        // testUser2 is in no channels, all channels created by testUser1
        const c1A = createTestChannel(testUser1.authUserId, 'channel1AName', false);
        const c1B = createTestChannel(testUser1.authUserId, 'channel1BName', true);
        const c1C = createTestChannel(testUser1.authUserId, 'channel1CName', false);
  
        expect(channelsListV1(testUser2.authUserId)).toStrictEqual({
          channels: []
        });
  
      });
  
    });
  
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
            const received = new Set(channelsListallV1(testUser3.authUserId).channels);
            expect(received).toStrictEqual(expected);
        });

    });

});