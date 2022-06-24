import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels.js';
import { clearV1 } from './other.js';
import { getData, setData } from './dataStore.js';
import { authRegisterV1 } from './auth.js'

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


        // beforeEach(() => {
        //     clearV1();
        // });

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
            // const a1 = authRegisterV1('email@unsw.com', 'password', 'john', 'doe');
            expect(channelsListallV1(testUser1)).toStrictEqual([]);

        });

        test('return one channel', () => {       
            // const c1 = channelsCreateV1(12345, 'apple', true);
            // expect(channelsListallV1(1)).toStrictEqual({
            //     channels: [
            //         {
            //             channelId: c1, 
            //             name: 'apple',
            //         }
            //     ]
            // });
            expect(channelsListallV1(testUser1.authUserId)).toStrictEqual({
                channels: [
                  {
                    channelId: testChannel1.channelId,
                    name : testChannel1.name,
                  }
                ]
              });        
            
        });

        test('return multiple channels', () => {
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
            const received = new Set(channelsListallV1(testUser1.authUserId).channels);
            expect(received).toStrictEqual(expected);

            // const c1 = channelsCreateV1(123, 'apple', true);
            // const c2 = channelsCreateV1(456, 'banana', false);
            // const c3 = channelsCreateV1(789, 'carrot', true);
            // const expected = new Set([
            //     {
            //         channelId: c1,
            //         name: 'apple',
            //     },
            //     {
            //         channelId: c2,
            //         name: 'banana',
            //     },
            //     {
            //         channelId: c3,
            //         name: 'carrot',
            //     }
            // ]);
            // const received = new Set(channelsListallV1(99).channels);
            // expect(received).toStrictEqual(expected);

        });

    });

});