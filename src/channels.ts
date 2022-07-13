import { getData, setData } from './dataStore';

type user = {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  authUserId?: number,
};

type member = {
  uId: number,
  channelPerms: number,
}

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
function channelsCreateV1(authUserId: number, name: string, isPublic: boolean) {
  const data = getData();

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
    messages: [],
  });

  setData(data);

  return {
    channelId: newChannelId,
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
function channelsListV1(authUserId: number) {
  const data = getData();

  // Invalid authUserId
  if (data.user.find(a => a.uId === authUserId) === undefined) {
    return { error: 'error' };
  }

  // Create an array to make the list
  const channelsList = [];

  // Determine whether or not authorised user is in each channel
  for (let i = 0; i < data.channel.length; i++) {
    const members: member[] = data.channel[i].members;

    if (members.find(b => b.uId === authUserId) !== undefined) {
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

/* <channelsListallV1 returns an array of all channels, regardless of whether they
  are public or private, when initiated by a valid authUserId>

Arguments:
    <authUserId> (<integer>)    - <The authUserId is the user who initates the function>

Return Value:
    Returns <[{channel}]> on <authUserId was valid and there were channels in data>
    Returns <[]> on <no channels in data>
    Returns <[{ error: error }]> on <inappropriate or invalid authUserId> */

function channelsListallV1(authUserId: number) {
  const data = getData();
  const foundChannels = [];

  // user not in database
  if (data.user.find(a => a.uId === authUserId) === undefined) {
    return { error: 'error' };
  }

  for (const i in data.channel) {
    foundChannels.push({ channelId: data.channel[i].channelId, name: data.channel[i].channelName });
  }

  // const {channel} = data; // extracts channel array from data
  // //creates a new array with the keys extracted from channels array. The new key names have been done to match brief.
  // const result = channel.map(channel => ({channelId: channel.channelId, name: channel.channelName}));
  // return { channels: result } ;

  return {
    channels: foundChannels
  };
}

export { channelsCreateV1, channelsListV1, channelsListallV1 };
