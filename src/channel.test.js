import { channelJoinV1, channelInviteV1, channelDetailsV1, channelMessagesV1 } from './channel';
import { clearV1 } from './other';
import { validate as uuidValidate } from 'uuid';
import { v4 } from "uuid";

// return type if no error: name, isPublic, ownerMembers, allMembers

// channelDetailsV1
// Given a channel with ID channelId that the authorised user is a member of, provide basic details about the channel.

describe (channelDetailsV1 check) {

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
        let result = channelDetailsV1(authUserId, );
        expect(result).toEqual();

    });


}