import { channelJoinV1, channelInviteV1, channelDetailsV1, channelMessagesV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js'
import { authRegisterV1 } from './auth.js'
import { clearV1 } from './other.js';
import { validate as uuidValidate, v4 } from 'uuid';

describe('channelDetailsV1 check', () => {

    beforeEach(() => {
        clearV1();
    });
    
    test('test error returned on invalid channel - empty string', () => {

        expect(channelDetailsV1(123, "")).toStrictEqual({ error: 'error' });

    });

    test('test error returned on invalid channel - not a number', () => {

        expect(channelDetailsV1(123, "abcdef")).toStrictEqual({ error: 'error' });

    });

    test('test error returned on valid channel but authorised user is not a member of the channel', () => {

        const c1 = channelsCreateV1(12345, 'channelone', true); 
        expect(channelDetailsV1(999999, c1)).toStrictEqual({ error: 'error' });

    });

    test('test successful return', () => {

        const c1 = channelsCreateV1(12345, 'channelone', true); 
        const a1 = authRegisterV1('email@unsw.com', 'password', 'john', 'doe')
        channelJoin(a1, c1);
        expect(channelDetailsV1(a1, c1)).toStrictEqual({
            name: c1.channelName,
            isPublic: c1.isPublic,
            ownerMembers: c1.ownerMembers,
            allMembers: c1.allMembers,
        });
    });

    

});