import { channelsCreateV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

beforeEach(() => {
  clearV1();
});

// FIXME: testing and implementation has mostly been completed for
// channelsCreateV1, which can be properly tested after
// authRegisterV1 and clearV1 have been fully implemented and
// merged into master & this branch

describe('channels capabilities', () => {

  const createTestUser = (email, password, nameFirst, nameLast) => {
    // authRegisterV1 returns { authUserId }
    // FIXME: can probably remove a few of these return values if not needed
    return { email, password, nameFirst, nameLast, ...authRegisterV1(email, password, nameFirst, nameLast) };
  };

  const createTestChannel = (authUserId, name, isPublic) => {
    // channelsCreateV1 returns { channelId }
    // FIXME: can probably remove a few of these return values if not needed
    return { authUserId, name, isPublic, ...channelsCreateV1(authUserId, name, isPublic) };
  };

  let testUser;
  let testChannel;
  
  beforeEach(() => {
    testUser = createTestUser('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    expect(testUser.authUserId).not.toStrictEqual({ error: 'error' });

    testChannel = createTestChannel(testUser.authUserId, 'channelName', true);
    expect(testChannel.channelId).not.toStrictEqual({ error: 'error' });
  });
  
  describe('channelsCreateV1', () => {

    // TODO: Remove below comment before submitting

    // Creates a new channel with the given name that is either a public
    // or private channel.
    // The user who created it automatically joins the channel.

    // Parameters: { authUserId (integer), name (string), isPublic (boolean) }
    // e.g. channelsCreateV1( 12, 'M13A_AERO', false )

    // Return type if no error: { channelId (integer) }
    // e.g.  return {
    //         channelId: 1,
    //       };

    test('Invalid authUserId', () => {
      expect(channelsCreateV1('notANumber', 'channelName', true)).toStrictEqual({ error: 'error' });
    });

    test.each([
      // length of name is less than 1 or more than 20 characters
      { name: '' },
      { name: 'moreThanTwentyCharacters' },
    ])("Invalid channel name: '$name'", ({ name }) => {
      expect(channelsCreateV1(testUser.authUserId, name, true)).toStrictEqual({ error: 'error' });
    });

    const channelsCreateObject = expect.objectContaining({
      channelId: expect.any(Number),
    });

    test('Containing the right keys', () => {
      expect(channelsCreateV1(testUser.authUserId, 'channelName', true)).toEqual(channelsCreateObject);
    });

    // FIXME: not sure if this test is necessary
    // I think this tests that channelsCreateV1 creates different channelId's?
    test('Can register same channel name, same publicness', () => {
      const c1 = channelsCreateV1(testUser.authUserId, 'channelName', true);
      const c2 = channelsCreateV1(testUser.authUserId, 'channelName', true);
      expect(c1).toStrictEqual(channelsCreateObject);
      expect(c2).toStrictEqual(channelsCreateObject);
      expect(c1).not.toStrictEqual(c2);
    });

  });

});
