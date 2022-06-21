import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { clearV1 } from './other';
import { validate as uuidValidate } from 'uuid';

// test('Test successful echo', () => {
//   let result = echo('1');
//   expect(result).toBe('1');
//   result = echo('abc');
//   expect(result).toBe('abc');
// });

describe('channels capabilities', () => {

  describe('channelsCreateV1', () => {

    beforeEach(() => {
      clearV1();
    });

    // Creates a new channel with the given name that is either a public
    // or private channel.
    // The user who created it automatically joins the channel.

    // Parameters: { authUserId (integer), name (string), isPublic (boolean) }
    // e.g. channelsCreateV1( 12, 'M13A_AERO', false )

    // Return type if no error: { channelId (integer) }

    test('test successful channel creation', () => {

      let result = channelsCreateV1( 12, 'publicChannel', true );
      expect(uuidValidate(String(result))).toBe(true);

      result = channelsCreateV1( 12345, 'privateChannel', false );
      expect(uuidValidate(String(result))).toBe(true);

      // TODO: test if user who created it joined the channel?
      
    });

    test('test invalid channel creation', () => {

      // length of name is less than 1 character
      expect(channelsCreateV1( 12, '', true )).toStrictEqual({ error: 'error' });
      expect(channelsCreateV1( 12345, '', false )).toStrictEqual({ error: 'error' });

      // length of name is more than 20 characters
      expect(channelsCreateV1( 12, 'moreThanTwentyCharacters', true )).toStrictEqual({ error: 'error' });
      expect(channelsCreateV1( 12345, 'veryVeryLongChannelName', false )).toStrictEqual({ error: 'error' });
      
    });

  });

});
