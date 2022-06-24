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
            const c1A = createTestChannel(testUser3.authUserId, 'channel1AName', false);
            const c1B = createTestChannel(testUser3.authUserId, 'channel1BName', true);
            const c1C = createTestChannel(testUser3.authUserId, 'channel1CName', false);

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