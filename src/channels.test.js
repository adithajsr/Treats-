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

    // Return type if no error: { channels (???) }
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

      // TODO:

      // let result = channelsCreateV1( 12, 'publicChannel', true );
      // expect(uuidValidate(String(result.channelId))).toBe(true);

      // result = channelsCreateV1( 12345, 'privateChannel', false );
      // expect(uuidValidate(String(result.channelId))).toBe(true);
      
    });

    test('test invalid list channels', () => {

      // TODO: invalid authUserId
      // assume: returns object {error: 'error'} 

      // length of name is less than 1 character
      // expect(channelsCreateV1( 12, '', true )).toStrictEqual({ error: 'error' });
      // expect(channelsCreateV1( 12345, '', false )).toStrictEqual({ error: 'error' });
      
    });

  });

});
