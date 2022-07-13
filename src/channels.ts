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
    authUserId (integer)    - user ID of the user requesting a list of channels

Return Value:
    Returns { channels } if no error
    Returns { error: 'error' } on invalid authUserId
*/
/*
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
*/

/* <channelsListallV2 returns an array of all channels, regardless of whether they
  are public or private, when initiated by a valid authUserId>

Arguments:
    <token> (<string>)    - <The token is required to start the function>

Return Value:
    Returns <[{channels}]> on <token was valid and there were channels in data>
    Returns <[]> on <no channels in data>
Returns <[{ error: error }]> on <inappropriate or invalid authUserId> */

interface Database {
  user: any[];
  channel: any[];
  token: any[];
  dm: any[];
}

function checkToken(token: string, data: Database) {
  if (data.token.find((a: any) => a.token === token) === undefined) {
    return false;
  }
  return true;
}

function channelsListallV2(token: string) {
  const data = getData();

  // invalid token - invalid, or token is not in database
  if (checkToken(token, data) === false) {
    console.log('invalid token');
    return { error: 'error' };
  }

  const foundChannels = [];
  for (const i in data.channel) {
    console.log(data.channel[i].channelId);
    foundChannels.push({ channelId: data.channel[i].channelId, name: data.channel[i].channelName });
  }

  return {
    channels: foundChannels
  };
}

export { channelsCreateV2, channelsListallV2 };
