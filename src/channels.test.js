import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { clearV1 } from './other';
import { validate as uuidValidate, v4 } from 'uuid';
import { getData, setData } from './dataStore';

describe ('channelsListallV1 test', () => {

    beforeEach(() => {
        clearV1();
      });

    test('authid is invalid', () => {

        expect(channelsListallV1('not a UUID')).toStrictEqual({ error: 'error' });

    });

    test('no channels in database', () => {
        
        expect(channelsListallV1(123)).toStrictEqual([]);

    });

    test('return one channel', () => {       
        const c1 = channelsCreateV1(12345, 'apple', true);
        expect(channelsListallV1(1)).toStrictEqual({
            channels: [
                {
                    channelId: c1, 
                    name: 'apple',
                }
            ]
        });
        
    });

    test('return multiple channels', () => {
        const c1 = channelsCreateV1(123, 'apple', true);
        const c2 = channelsCreateV1(456, 'banana', false);
        const c3 = channelsCreateV1(789, 'carrot', true);
        const expected = new Set([
            {
                channelId: c1,
                name: 'apple',
            },
            {
                channelId: c2,
                name: 'banana',
            },
            {
                channelId: c3,
                name: 'carrot',
            }
        ]);
        const received = new Set(channelsListallV1(99).channels);
        expect(received).toStrictEqual(expected);

    });

});