import { channelJoinV1, channelInviteV1, channelDetailsV1, channelMessagesV1 } from './channel';
import { clearV1 } from './other';
import { validate as uuidValidate } from 'uuid';
import { v4 } from "uuid";

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


    for (const channel of result) {

        expect(channel).toStrictEqual(
          expect.objectContaining({
            channelId: expect.any(Number),
            name: expect.any(String),
          })
        );

      }


    test('test successful return', () => {
        let authUserId = v4();
        let result = channelDetailsV1(authUserId, );
        for (const channel of result) {
            expect(channel).toStrictEqual(
                expect.objectContaining({
                    name: expect.any(String);
                    isPublic: expect.any(Boolean);
                    ownerMembers: expect.any(Array);
                    allMembers: expect.any(Array);
                })
            );
        }
    });


}