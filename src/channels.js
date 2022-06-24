import { getData, setData } from './dataStore';

// FIXME: testing and implementation has mostly been completed for
// channelsCreateV1, which can be properly tested after
// authRegisterV1 and clearV1 have been fully implemented and
// merged into master & this branch


/*
Creates a new channel with the given name that is either a public
or private channel

Arguments:
    authUserId (integer)    - user ID of the user who is creating the channel
    name (string)           - name of new channel
    isPublic (boolean)      - publicness of new channel

Return Value:
    Returns { channelId } if no error
    Returns { error: 'error' } on invalid channel name
*/
function channelsCreateV1(authUserId, name, isPublic) {

  let data = getData();

  // FIXME:
  console.log(data);
  console.log(authUserId);

  // Invalid authUserId
  if (!(data.user.find(a => a.uId === authUserId))) {
    console.log('invalid authUserId');
    return { error: 'error' };
  }

  // // Invalid authUserId
  // if (data.user.find(a => a.uId === authUserId) === undefined) {
  //   return { error: 'error' };
  // }

  // Invalid channel name
  if (name.length < 1 || name.length > 20) {
    console.log('invalid channel name');
    return { error: 'error' };
  }

  // Generate channeId
  const newChannelId = data.channel.length + 1;

  // The user who created it automatically joins the channel
  const channelOwner = {
    uId: authUserId,
    channelPerms: 1,
  };

  // Create a new channel
  data.channel.push({
    channelId: newChannelId,
    channelName: name,
    isPublic: isPublic,
    members: [channelOwner],
  });

  setData(data);

  return {
    channelId: newChannelId,
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
