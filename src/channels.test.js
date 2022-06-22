import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { clearV1 } from './other';
import { validate as uuidValidate } from 'uuid';

describe ('channelsListallV1 test', () => {

    beforeEach(() => {
        clearV1();
      });

    test('authid is invalid', () => {

        expect(channelsListallV1('not a UUID')).toStrictEqual({ error: 'error' });

    });

    test('no channels in database', () => {
        // double check
        let authUserId = v4();
        expect(channelsListallV1(authUserId)).toStrictEqual({ error: 'error' });

    });

    test('return one channel', () => {
        // necessary?
        let authUserId = v4();
        let channelInfo = {channelId: 1, name: 'apple', isPublic: false, ownerMembers: [1], allMembers: [1, 2, 3, 4]}
        expect(channelsListallV1(authUserId)).toStrictEqual({
            
        });
    });

    test('return multiple channels', () => {
        // to fix
        let authUserId = v4();
        
    });

});