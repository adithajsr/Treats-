import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { clearV1 } from './other';

// test('Test successful echo', () => {
//   let result = echo('1');
//   expect(result).toBe('1');
//   result = echo('abc');
//   expect(result).toBe('abc');
// });

// test('Test invalid echo', () => {
//   expect(echo({ echo: 'echo' })).toStrictEqual({ error: 'error' });
// });

describe('channels capabilities', () => {

  describe('channelsCreateV1', () => {

    beforeEach(() => {
      clearV1();
    });

    // Creates a new channel with the given name that is either a public
    // or private channel. The user who created it automatically joins
    // the channel.

    // Parameters: { authUserId, name, isPublic }
    // e.g. channelsCreateV1( 12, 'M13A_AERO', false )

    // Return type if no error: { channelId }

    test('fails on invalid name', () => {

      // length of name is less than 1 character
      expect(channelsCreateV1( 12, '', true )).toStrictEqual({ error: 'error' });
      expect(channelsCreateV1( 12345, '', false )).toStrictEqual({ error: 'error' });

      // length of name is more than 20 characters
      expect(channelsCreateV1( 12, 'Morethantwentycharacters', true )).toStrictEqual({ error: 'error' });
      expect(channelsCreateV1( 12345, 'Veryverylongchannelname', false )).toStrictEqual({ error: 'error' });
      
    });

  });

});