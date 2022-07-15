import { getData } from './dataStore';

interface Database {
  user: any[];
  channel: any[];
  token: any[];
  dm: any[];
}

/*
Checks validity of a tkoen

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  data (database)     - database that is being interacted with
  message (string)      - message they want to send

Return Value:
  Returns { true } if token is valid
  Returns { false } if token is invalid
*/
function checkToken(token: string, data: Database) {
  if (data.token.find((a: any) => a.token === token) === undefined) {
    return false;
  }
  return true;
}

/*
Converts a token to its relevant uid

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  data (database)     - database that is being interacted with

Return Value:
  Returns { uId }      - relevant uId corresponding to token
*/
function tokenToUid(token: string, data: Database) {
  const index = data.token.findIndex(a => a.token === token);
  const uId = data.token[index].uId;
  return uId;
}

/*
Creates a new message in the channel

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  channelId (number)     - id of the channel they want to send a message to
  message (string)      - message they want to send

Return Value:
  Returns { } if no error
  Returns { error: 'error' } on invalid token, length less than or over 1000 characters, not a valid messageId
                              message wasn't sent by an authorised user, auth user does not have
                              owner permission
*/

function messageSendV1 (token: string, channelId: number, message: string) {
  if (message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }
  const data = getData();
  // check for token validity
  if (checkToken(token, data) === false) {
    return { error: 'error' };
  }
  const uId = tokenToUid(token, data);
  // check for channel in database
  if (data.channel.find(a => a.channelId === channelId) === undefined) {
    return { error: 'error' };
    // check for user in channel
  } else {
    const i = data.channel.findIndex(data => data.channelId === channelId);
    if (data.channel[i].members.find(a => a.uId === uId) === undefined) {
      return { error: 'error' };
    }
  }

  const channelIndex = data.channel.findIndex(a => a.channelId === channelId);
  const messageId = Math.floor(Math.random() * 100);
  const time = Math.floor((new Date()).getTime() / 1000);

  data.channel[channelIndex].messages.push(
    {
      messageId: messageId,
      uId: uId,
      message: message,
      timeSent: time,
    }
  );

  return { messageId: messageId };
}

/*
Edits an existing message in the channel

Arguments:
    token (string)         - represents the session of the user who is creating the channel
    messageId (number)     - id of the message they want to edit
    message (string)      - new message they want to update the old message with

Return Value:
    Returns { } if no error
    Returns { error: 'error' } on invalid token, length over 1000 characters, not a valid messageId
                               message wasn't sent by an authorised user, auth user does not have
                               owner permission
*/

const NOTFOUND = -50;

function messageEditV1 (token: string, messageId: number, message: string) {
  const data = getData();

  if (checkToken(token, data) === false) {
    return { error: 'error' };
  }
  if (message.length > 1000) {
    return { error: 'error' };
  }

  const uId = tokenToUid(token, data);
  let channelIndex = NOTFOUND;
  let messageIndex;
  const { channel } = data;

  for (let i = 0; i < channel.length; i++) {
    for (let j = 0; j < channel[i].messages.length; j++) {
      if (channel[i].messages[j].messageId === messageId) {
        channelIndex = i;
        messageIndex = j;
        // auth uid didn't send the message
        if (channel[i].messages[j].uId !== uId) {
          return { error: 'error' };
        }
        // check if uId has owner permissions
        for (let k = 0; k < channel[i].members.length; k++) {
          if (channel[i].members[k].uId === uId && channel[i].members[k].channelPerms !== 1) {
            return { error: 'error' };
          }
        }
      }
    }
  }
  if (channelIndex === NOTFOUND) {
    return { error: 'error' };
  }

  if (message === '') {
    channel[channelIndex].messages = channel[channelIndex].messages.filter(
      a => a.messageId === messageId
    );
  } else {
    channel[channelIndex].messages[messageIndex].message = message;
  }

  return { };
}

/*
Removes a message in the channel

Arguments:
    token (string)          - represents the session of the user who is creating the channel
    messageId (number)      - id of message to be removed

Return Value:
    Returns { } if no error
    Returns { error: 'error' } on invalid token, not a valid messageId
                               message wasn't sent by an authorised user, auth user does not have
                               owner permission
*/

function messageRemoveV1(token: string, messageId: number) {
  const data = getData();

  if (checkToken(token, data) === false) {
    return { error: 'error' };
  }

  const uId = tokenToUid(token, data);
  let channelIndex = NOTFOUND;
  const { channel } = data;

  for (let i = 0; i < channel.length; i++) {
    for (let j = 0; j < channel[i].messages.length; j++) {
      if (channel[i].messages[j].messageId === messageId) {
        channelIndex = i;
        // auth uid didn't send the message
        if (channel[i].messages[j].uId !== uId) {
          return { error: 'error' };
        }
        // check if uId has owner permissions
        for (let k = 0; k < channel[i].members.length; k++) {
          if (channel[i].members[k].uId === uId && channel[i].members[k].channelPerms !== 1) {
            return { error: 'error' };
          }
        }
      }
    }
  }
  if (channelIndex === NOTFOUND) {
    return { error: 'error' };
  }

  channel[channelIndex].messages = channel[channelIndex].messages.filter(
    a => a.messageId === messageId
  );

  return { };
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

function messageSendDmV1 (token: string, dmId: number, message: string) {
  const data = getData();
  if (message.length < 1 || message === '' || message.length > 1000) {
    return { error: 'error' };
  }
  // token validity
  if (checkToken(token, data) === false) {
    return { error: 'error' };
  }
  const uId = tokenToUid(token, data);
  // check for dm in channel
  if (data.dm.find(a => a.dmId === dmId) === undefined) {
    return { error: 'error' };
  }
  // dm valid, but auth user is not a member
  const i = data.dm.findIndex(data => data.dmId === dmId);
  if (data.dm[i].members.find(a => a.uId === uId) === undefined) {
    return { error: 'error' };
  }

  const messageId = Math.floor(Math.random() * 100);
  const time = Math.floor((new Date()).getTime() / 1000);

  data.dm[i].messages.push(
    {
      messageId: messageId,
      uId: uId,
      message: message,
      timeSent: time
    }
  );

  return { messageId: messageId };
}

export { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1 };
