import { getData } from './dataStore';

function channelsCreateV1(authUserId, name, isPublic) {
  return {
    channelId: 1,
  };
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
