import { getData, setData } from './dataStore';
import { checkToken } from './message';
import HTTPError from 'http-errors';

interface channelMember {
  uId: number,
  channelPerms: number,
}

/*
Helper function: finds the index of the given token in the tokens array
in the database 

Arguments:
    token (string)          - represents a user session

Return Value:
    Returns tokenIndex
    Throws a 403 error if token is invalid
*/
export const findTokenIndex = (token: string) => {
  const data = getData();
  const tokenIndex = data.token.findIndex(a => a.token === token);

  // Invalid token
  if (tokenIndex === -1) {
    throw HTTPError(403, 'Invalid token');
  };

  return tokenIndex;
};

/*
Helper function: Checks if the arguments for channelsCreateV2() are valid

Arguments:
    tokenIndex (number)          - index of token in tokens array in database
    name (string)                - name of new channel

Return Value:
    Returns true if arguments are valid
    Returns false if arguments are invalid
*/
const areArgumentsValidChannelsCreate = (tokenIndex: number, name: string) => {
  // Invalid channel name
  if (name.length < 1 || name.length > 20) {
    return false;
  }
  return true;
};

/*
Helper function: Creates an array of all channels (and their associated details)
that the authorised user is part of

Arguments:
    userId (number)    - uId of the user corresponding to the given token

Return Value:
    Returns channelsList
*/
const createListChannelsList = (userId: number) => {
  const data = getData();

  // Create an array to make the list
  const channelsList = [];

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
  return channelsList;
};

/*
Creates a new channel with the given name that is either a public
or private channel

Arguments:
    token (string)          - represents the session of the user creating the channel
    name (string)           - name of new channel
    isPublic (boolean)      - publicness of new channel

Return Value:
    Returns { channelId } if no error
    Throws an error on invalid token (403) or invalid channel name (400)
*/

export function channelsCreateV3(token: string, name: string, isPublic: boolean) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  if (areArgumentsValidChannelsCreate(tokenIndex, name) === false) {
    throw HTTPError(400, 'Invalid channel name');
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
    Throws a 403 error on invalid token
*/
export function channelsListV3(token: string) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  const userId = data.token[tokenIndex].uId;
  const channelsList = createListChannelsList(userId);

  return {
    channels: channelsList,
  };
}

/* <channelsListallV2 returns an array of all channels, regardless of whether they
  are public or private, when initiated by a valid authUserId>

Arguments:
    <token> (<string>)    - <The token is required to start the function>

Return Value:
    Returns <[{channels}]> on <token was valid and there were channels in data>
    Returns <[]> on <no channels in data>
Returns <[{ error: error }]> on <inappropriate or invalid authUserId> */

export function channelsListallV3(token: string) {
  const data = getData();
  checkToken(token, data);

  const foundChannels = [];
  for (const i in data.channel) {
    foundChannels.push({ channelId: data.channel[i].channelId, name: data.channel[i].channelName });
  }

  return {
    channels: foundChannels
  };
}
