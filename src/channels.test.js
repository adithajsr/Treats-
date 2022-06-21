import { channelsListV1 } from './channels';
import { clearV1 } from './other';


describe('channels capabilities', () => {

  describe('channelsListV1', () => {

    beforeEach(() => {
      clearV1();
    });

    // TODO: Remove below comment before submitting

    // Provide an array of all channels (and their associated details)
    // that the authorised user is part of, regardless of publicness

    // Parameters: { authUserId (integer) }
    // e.g. channelsListV1( 12 )

    // Return type if no error: { channels }
    // i.e. array of objects, where each object contains types { channelId, name }
    /* e.g.
    [
      {
        channelId: 1,
        name: 'channel1',
      },
      {
        channelId: 2,
        name: 'channel2',
      }
    ]
    */

    test('test successful list channels', () => {

      const result = channelsListV1( 12 );

      for (const channel of result) {

        expect(channel).toStrictEqual(
          expect.objectContaining({
            channelId: expect.any(Number),
            name: expect.any(String),
          })
        );

      }

      // FIXME: check if channelId is a valid UUID?
      // check if name is between 1 and 20 characters?
      
    });

    test('test invalid list channels', () => {
      
      // invalid authUserId
      // assume: returns object {error: 'error'} 
      expect(channelsListV1( 'not a UUID' )).toStrictEqual({ error: 'error' });

    });

  });

});
