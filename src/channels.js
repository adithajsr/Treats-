import { v4 as uuidv4 } from 'uuid';
import { getData, setData } from './dataStore';

// FIXME: testing and implementation has mostly been completed for
// channelsCreateV1, which can be properly tested after
// authRegisterV1 and clearV1 have been fully implemented and
// merged into master & this branch

function channelsCreateV1(authUserId, name, isPublic) {

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

  let data = getData();

  // Invalid authUserId
  if (data.user.find(a => a.uId === authUserId) === undefined) {
    return { error: 'error' };
  }
  // Invalid channel name
  if (name.length < 1 || name.length > 20) {
    return { error: 'error' };
  }

  // Generate channeId
  const channelId = uuidv4();

  // The user who created it automatically joins the channel
  const channelOwner = {
    uId: authUserId,
    channelPerms: 'owner',
  };

  // Create a new channel
  data.channel.push({
    channelId: channelId,
    channelName: name,
    isPublic: isPublic,
    members: [channelOwner],
  });

  setData(data);

  return {
    channelId: channelId,
  };
}


function channelsListV1(authUserId) {
  return {
    channels: [] // see interface for contents
  };
}

function channelsListallV1(authUserId) {
  return {
    channels: [] // see interface for contents
  };
}

export { channelsCreateV1, channelsListV1, channelsListallV1 };
