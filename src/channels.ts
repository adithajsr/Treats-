import { getData, setData } from './dataStore';

interface user {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  authUserId?: number,
};

interface channelMember {
  uId: number,
  channelPerms: number,
}

/*
Creates a new channel with the given name that is either a public
or private channel

Arguments:
    token (string)          - represents the session of the user who is creating the channel
    name (string)           - name of new channel
    isPublic (boolean)      - publicness of new channel

Return Value:
    Returns { channelId } if no error
    Returns { error: 'error' } on invalid token or invalid channel name
*/
function channelsCreateV2(token: string, name: string, isPublic: boolean) {

  // TODO: use helper functions

  const data = getData();

  const tokenIndex = data.token.findIndex(a => a.token === token);

  // Invalid token
  if (tokenIndex === -1) {
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
    uId: data.token[tokenIndex].uId,
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
    token (string)    - represents the session of the user requesting a list of channels

Return Value:
    Returns { channels } if no error
    Returns { error: 'error' } on invalid token
*/
function channelsListV2(token: string) {

  // TODO: use helper functions

  const data = getData();

  const tokenIndex = data.token.findIndex(a => a.token === token);

  // Invalid token
  if (tokenIndex === -1) {
    return { error: 'error' };
  }

  // Create an array to make the list
  const channelsList = [];

  const userId = data.token[tokenIndex].uId;

  // Determine whether or not authorised user is in each channel
  for (let i = 0; i < data.channel.length; i++) {
    const members: channelMember[] = data.channel[i].members;

    if (members.find(b => b.uId === userId) !== undefined) {
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

  // FIXME:

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

export { channelsCreateV2, channelsListV2, channelsListallV1 };
