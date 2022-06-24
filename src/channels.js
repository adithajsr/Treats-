import { getData, setData } from './dataStore';

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

  // Invalid authUserId
  if (data.user.find(a => a.uId === authUserId) === undefined) {
    return { error: 'error' };
  }

  // Invalid channel name
  if (name.length < 1 || name.length > 20) {

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
}





/*
Provide an array of all channels (and their associated details) that the
authorised user is part of, regardless of publicness

Arguments:
    authUserId (integer)    - user ID of the user requesting a list of channels

Return Value:
    Returns { channels } if no error
    Returns { error: 'error' } on invalid authUserId
*/
function channelsListV1(authUserId) {

  let data = getData();

  // Invalid authUserId
  if (data.user.find(a => a.uId === authUserId) === undefined) {
    return { error: 'error' };
  }

  // Create an array to make the list
  const channelsList = [];

  // Determine whether or not authorised user is in each channel
  for (let i = 0; i < data.channel.length; i++) {

    if (data.channel[i].members.find(a => a.uId === authUserId) !== undefined) {

      channelsList.push({
        channelId: data.channel[i].channelId,
        name: data.channel[i].channelName,
      });

    }

  }

  return {
    channels: channelsList,
  };
}


function channelsListallV1(authUserId) {
  return {
    channels: [] // see interface for contents
  };
}

export { channelsCreateV1, channelsListV1, channelsListallV1 };
