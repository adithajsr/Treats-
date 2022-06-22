import { channelJoinV1, channelInviteV1, channelDetailsV1, channelMessagesV1 } from './channel.js';
import { clearV1 } from './other.js';
import { validate as uuidValidate, v4 } from 'uuid';

describe('channelDetailsV1 check', () => {

    beforeEach(() => {
        clearV1();
    });
    
    test('test error returned on invalid channel', () => {

        let result = channelDetailsV1(123, "");
        expect(result).toStrictEqual({ error: 'error' });

    });

    test('test error returned on valid channel but non-member authorised user', () => {

        expect(channelDetailsV1('not a UUID')).toStrictEqual({ error: 'error' });

    });

    test('test successful return', () => {
        let authUserId = v4();
        let channelInfo = {
            channelId: 1, 
            name: 'apple', 
            isPublic: false, 
            ownerMembers: [
                {
                uId: 20,
                email: 'johndoe@unsw.com',
                nameFirst: 'john',
                nameLast: 'doe',
                handleStr: 'johnDoe0'
                }
            ], 
            allMembers: [
                {
                uId: 20,
                email: 'johndoe@unsw.com',
                nameFirst: 'john',
                nameLast: 'doe',
                handleStr: 'johnDoe0'
                },
                {
                uId: 50,
                email: 'janedoe@unsw.com',
                nameFirst: 'jane',
                nameLast: 'doe',
                handleStr: 'janeDoe0'
                }
            ]
        }
        expect(channelDetailsV1(authUserId, 1)).toStrictEqual({
            name: 'apple', 
            isPublic: false,
            ownerMembers: [
                {
                uId: 20,
                email: 'johndoe@unsw.com',
                nameFirst: 'john',
                nameLast: 'doe',
                handleStr: 'johnDoe0'
                }
            ], 
            allMembers: [
                {
                uId: 20,
                email: 'johndoe@unsw.com',
                nameFirst: 'john',
                nameLast: 'doe',
                handleStr: 'johnDoe0'
                },
                {
                uId: 50,
                email: 'janedoe@unsw.com',
                nameFirst: 'jane',
                nameLast: 'doe',
                handleStr: 'janeDoe0'
                }
            ]
        });
    });


});