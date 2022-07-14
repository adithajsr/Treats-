import { getData, setData } from './dataStore';

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
*/
const findTokenIndex = (token: string) => {
  const data = getData();
  const tokenIndex = data.token.findIndex(a => a.token === token);
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
  // Invalid token
  if (tokenIndex === -1) {
    return false;
  }
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
    token (string)          - represents the session of the user who is creating the channel
    name (string)           - name of new channel
    isPublic (boolean)      - publicness of new channel

Return Value:
    Returns { channelId } if no error
    Returns { error: 'error' } on invalid token or invalid channel name
*/
function channelsCreateV2(token: string, name: string, isPublic: boolean) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  if (areArgumentsValidChannelsCreate(tokenIndex, name) === false) {
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
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  // Invalid token
  if (tokenIndex === -1) {
    return { error: 'error' };
  }

  const userId = data.token[tokenIndex].uId;
  const channelsList = createListChannelsList(userId);

  return {
    channels: channelsList,
  };
}

export { channelsCreateV2, channelsListV2 };
