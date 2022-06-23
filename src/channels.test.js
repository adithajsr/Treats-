import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { clearV1 } from './other';
import { validate as uuidValidate, v4 } from 'uuid';

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
        expect(channelsListallV1(authUserId)).toStrictEqual([]);

    });

    test('return one channel', () => {
        let authUserId = 99;
        const channel1 = channelsCreateV1(99, 'one', true);
        expect(channelsListallV1(1)).toStrictEqual({
            channels: [
                {
                    channelId: 1, 
                    name: 'one'
                }
            ]
        });
        
    });

    test('return multiple channels', () => {
        let authUserId = 99;
        const channel1 = channelsCreateV1(99, 'one', true);
        const channel2 = channelsCreateV1(99, 'two', false);
        const channel3 = channelsCreateV1(99, 'three', true);
        const expected = new Set([
            {
                channelId: expect.any(Number),
                name: 'one',
            },
            {
                channelId: expect.any(Number),
                name: 'two',
            },
            {
                channelId: expect.any(Number),
                name: 'three',
            }
        ]);
        const received = new Set(channelsListallV1(99).channels);
        expect(received).toStrictEqual(expected);

    });

});