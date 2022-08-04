import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

interface Database {
  user: any[];
  channel: any[];
  token: any[];
  dm: any[];
}

import { channel, dm } from './dataStore';

/*
Checks validity of a token

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  data (database)     - database that is being interacted with
  message (string)      - message they want to send

Throws Error
  403 - if token is invalid
*/
export function checkToken(token: string, data: Database) {
  if (data.token.find((a: any) => a.token === token) === undefined) {
    throw HTTPError(403, 'invalid token!');
  }
}

/*
Converts a token to its relevant uid

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  data (database)     - database that is being interacted with

Return Value:
  Returns { uId }      - relevant uId corresponding to token
*/
export function tokenToUid(token: string, data: Database) {
  const index = data.token.findIndex(a => a.token === token);
  const uId = data.token[index].uId;
  return uId;
}

/*
Arguments:
  messageId (number)         - messageId to find in channel
  channel (channel [])     - channel to search through

Return Value:
  Returns { index }      - undefined if non existent, else channel index of the messageId
*/

export function getChannelIndex(messageId: number, channel: channel[]) {
  let index;
  for (let i = 0; i < channel.length; i++) {
    for (let j = 0; j < channel[i].messages.length; j++) {
      if (channel[i].messages[j].messageId === messageId) {
        index = i;
      }
    }
  }
  return index;
}

/*
Arguments:
  messageId (number)         - messageId to find in channel
  dm (dm [])     - channel to search through

Return Value:
  Returns { index }      - undefined if non existent, else dm index of the messageId
*/

export function getDmIndex(messageId: number, dm: dm[]) {
  let index;
  for (let i = 0; i < dm.length; i++) {
    for (let j = 0; j < dm[i].messages.length; j++) {
      if (dm[i].messages[j].messageId === messageId) {
        index = i;
      }
    }
  }
  return index;
}

/*
Creates a new message in the channel

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  channelId (number)     - id of the channel they want to send a message to
  message (string)      - message they want to send

Return Value:
  Returns { messageId } - id of the message

Throws a 400 error    - if channelId doesn't refer to a valid channel
                      - length of message is less than 1 or over 1000 characters
Throw a 403 error     - channelId was valid but auth user wasn't a member of channel
*/

export function messageSendV2 (token: string, channelId: number, message: string) {
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'invalid message length!');
  }
  const data = getData();
  checkToken(token, data);

  const uId = tokenToUid(token, data);
  // check for channel in database
  if (data.channel.find(a => a.channelId === channelId) === undefined) {
    throw HTTPError(400, 'invalid channelId!');
    // check for user in channel
  } else {
    const i = data.channel.findIndex(data => data.channelId === channelId);
    if (data.channel[i].members.find(a => a.uId === uId) === undefined) {
      throw HTTPError(403, 'authorised user is not a member!');
    }
  }

  const channelIndex = data.channel.findIndex(a => a.channelId === channelId);
  const messageId = Math.floor(Math.random() * 1000);
  const time = Math.floor((new Date()).getTime() / 1000);

  data.channel[channelIndex].messages.push(
    {
      messageId: messageId,
      uId: uId,
      message: message,
      timeSent: time,
      isPinned: 0,
      reacts: 0,
    }
  );

  setData(data);
  return { messageId: messageId };
}

/*
Edits an existing message in the channel

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  channelId (number)     - id of the channel they want to send a message to
  message (string)      - message they want to send

Return Value:
  Returns {} - if new message successfully created

Throws a 400 error    - length of message is over 1000 characters
                      - messageId does not refer to a valid message within channel/DM
Throw a 403 error     - auth user does not have owner permission and message wasn't sent by them
*/

export function messageEditV2 (token: string, messageId: number, message: string) {
  const data = getData();
  checkToken(token, data);
  if (message.length > 1000) {
    throw HTTPError(400, 'invalid message length!');
  }

  const uId = tokenToUid(token, data);

  const { channel } = data;
  const { dm } = data;
  let messageIndex;
  const channelIndex = getChannelIndex(messageId, channel);
  const dmIndex = getDmIndex(messageId, dm);
  if (channelIndex === undefined && dmIndex === undefined) {
    throw HTTPError(400, 'invalid messageId!');
  }

  // check info surrounding message
  if (channelIndex === undefined) {
    messageIndex = dm[dmIndex].messages.findIndex(a => a.messageId === messageId);

    if (dm[dmIndex].messages[messageIndex].uId !== uId) {
      throw HTTPError(403, 'dm not sent by this user, cannot edit!');
    }
    const memberIndex = dm[dmIndex].members.findIndex(a => a.uId === uId);
    const globalPermIndex = data.user.findIndex(a => a.uId === uId);

    if (dm[dmIndex].members[memberIndex].dmPerms === 2 &&
      data.user[globalPermIndex].globalPerms !== 1) {
      throw HTTPError(403, 'no permissions!');
    }

    if (message === '') {
      dm[dmIndex].messages.splice(messageIndex, 1);
    } else {
      dm[dmIndex].messages[messageIndex].message = message;
    }
  } else if (dmIndex === undefined) {
    messageIndex = channel[channelIndex].messages.findIndex(a => a.messageId === messageId);

    if (channel[channelIndex].messages[messageIndex].uId !== uId) {
      throw HTTPError(403, 'no permissions!');
    }
    const memberIndex = channel[channelIndex].members.findIndex(a => a.uId === uId);
    const globalPermIndex = data.user.findIndex(a => a.uId === uId);
    if (channel[channelIndex].members[memberIndex].channelPerms === 2 &&
      data.user[globalPermIndex].globalPerms !== 1) {
      throw HTTPError(403, 'no permissions!');
    }

    if (message === '') {
      channel[channelIndex].messages.splice(messageIndex, 1);
    } else {
      channel[channelIndex].messages[messageIndex].message = message;
    }
  }

  setData(data);
  return {};
}

/*
Removes a message in the channel

Arguments:
  token (string)          - represents the session of the user who is creating the channel
  messageId (number)      - id of message to be removed

Return Value:
  Returns { } if no error  - if message successfully removed

Throws a 400 error    - messageId does not refer to a valid message within channel/DM
Throw a 403 error     - auth user does not have owner permission and message wasn't sent by them
*/

export function messageRemoveV2(token: string, messageId: number) {
  const data = getData();
  checkToken(token, data);

  const uId = tokenToUid(token, data);
  let messageIndex;
  const { channel } = data;
  const { dm } = data;

  const channelIndex = getChannelIndex(messageId, channel);
  const dmIndex = getDmIndex(messageId, dm);

  if (channelIndex === undefined && dmIndex === undefined) {
    throw HTTPError(400, 'invalid messageId!');
  }

  // check info surrounding message
  if (channelIndex === undefined) {
    messageIndex = dm[dmIndex].messages.findIndex(a => a.messageId === messageId);
    if (dm[dmIndex].messages[messageIndex].uId !== uId) {
      throw HTTPError(403, 'no permissions!');
    }
    const memberIndex = dm[dmIndex].members.findIndex(a => a.uId === uId);
    const globalPermIndex = data.user.findIndex(a => a.uId === uId);
    if (dm[dmIndex].members[memberIndex].dmPerms === 2 &&
      data.user[globalPermIndex].globalPerms !== 1) {
      throw HTTPError(403, 'no permissions!');
    }
    dm[dmIndex].messages.splice(messageIndex, 1);
  } else if (dmIndex === undefined) {
    messageIndex = channel[channelIndex].messages.findIndex(a => a.messageId === messageId);
    if (channel[channelIndex].messages[messageIndex].uId !== uId) {
      throw HTTPError(403, 'no permissions!');
    }
    const memberIndex = channel[channelIndex].members.findIndex(a => a.uId === uId);
    const globalPermIndex = data.user.findIndex(a => a.uId === uId);
    if (channel[channelIndex].members[memberIndex].channelPerms === 2 &&
      data.user[globalPermIndex].globalPerms !== 1) {
      throw HTTPError(403, 'no permissions!');
    }
    channel[channelIndex].messages.splice(messageIndex, 1);
  }

  setData(data);
  return {};
}

/*
Send a message from the authorised user to a specified DM

Arguments:
  token (string)          - represents the session of the user who is creating the channel
  dmId (number)           - id of the DM they want to send a message to
  message (string)        - message they want to send

Return Value:
  Returns { messageId }  - id of dm message, if successfully snet

Throws a 400 error    - length of message is less than 1 or over 1000 characters
                      - dmId does not refer to a valid DM
Throw a 403 error     - dmId valid and auth user is not a member of the DM
*/

export function messageSendDmV2 (token: string, dmId: number, message: string) {
  if (message.length < 1 || message === '' || message.length > 1000) {
    throw HTTPError(400, 'invalid message length!');
  }

  const data = getData();
  checkToken(token, data);

  const uId = tokenToUid(token, data);

  // check for dmId in data
  if (data.dm.find(a => a.dmId === dmId) === undefined) {
    throw HTTPError(400, 'invalid dmId!');
  }
  // dm valid, but auth user is not a member
  const i = data.dm.findIndex(data => data.dmId === dmId);
  if (data.dm[i].members.find(a => a.uId === uId) === undefined) {
    throw HTTPError(403, 'auth user is not a member!');
  }

  const messageId = Math.floor(Math.random() * 100);
  const time = Math.floor((new Date()).getTime() / 1000);

  data.dm[i].messages.push(
    {
      messageId: messageId,
      uId: uId,
      message: message,
      timeSent: time,
      isPinned: 0,
      reacts: 0,
    }
  );
  setData(data);
  return { messageId: messageId };
}

function pushMessage(channelIndex: number, messageId: number, uId: number, message: string, timeSent: number) {
  const data = getData();
  data.channel[channelIndex].messages.push(
    {
      messageId: messageId,
      uId: uId,
      message: message,
      timeSent: timeSent,
      isPinned: 0,
      reacts: 0,
    }
  );

  setData(data);
  return {};
}

export function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number) {
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'invalid message length!');
  }

  if (timeSent < Math.floor(Date.now() / 1000)) {
    throw HTTPError(400, 'Time must be in the future!');
  }

  const waitingTime = timeSent - Math.floor(Date.now() / 1000);

  const data = getData();
  checkToken(token, data);

  const uId = tokenToUid(token, data);
  // check for channel in database
  if (data.channel.find(a => a.channelId === channelId) === undefined) {
    throw HTTPError(400, 'invalid channelId!');
    // check for user in channel
  } else {
    const i = data.channel.findIndex(data => data.channelId === channelId);
    if (data.channel[i].members.find(a => a.uId === uId) === undefined) {
      throw HTTPError(403, 'authorised user is not a member!');
    }
  }
  const channelIndex = data.channel.findIndex(a => a.channelId === channelId);
  const messageId = Math.floor(Math.random() * 1000);

  setTimeout(pushMessage, waitingTime * 1000, channelIndex, messageId, uId, message, timeSent); // THIS ISN'T WAITING
  return { messageId: messageId };
}
/*
Shares a message from a channel/DM to another channel/DM

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  ogMessageId (number)   - represents the messageId of the message to be shared
  message (string)       - message they want concatenated on to the shared message
  channelId (number)     - id of the channel they want the message shared to (-1 if sharing to DM)
  dmID (number)          - id of the dm they want the message shared to (-1 if sharing to channel)

Return Value:
  Returns sharedMessageId (number) if successful

Throws a 400 error    - length of message is over 1000 characters
                      - ogMessageId does not refer to a valid message within channel/DM that user is a part of
                      - channelId and dmId are both -1
                      - both channelId and dmId do not refer to valid addresses
Throw a 403 error     - if token is invalid
                      - if they are not a part of the channel/dm they wish to share a message to
*/

export function MessageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'Specify channel/DM');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Message length must be below 1000 characters');
  }
  const data = getData();
  const tokenIndex = data.token.findIndex(a => a.token === token);
  const uId = data.token[tokenIndex].uId;

  if (tokenIndex === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  // if sending to DM
  if (channelId === -1) {
    const sendIndex = data.dm.findIndex(a => a.dmId === dmId);
    if (sendIndex === -1) {
      throw HTTPError(400, 'invalid dmId!');
    }
    if (data.dm[sendIndex].members.findIndex(a => a.uId === uId) === -1) {
      throw HTTPError(403, 'User not part of DM');
    }
    // searching for ogMessageId in the DMs and sending associated message to specified DM
    for (const element of data.dm) {
      const messageIndex = element.messages.findIndex(a => a.messageId === ogMessageId);
      if (messageIndex !== -1) {
        // checking if member is a part of the dm they are trying to send a msg from
        const memberIndex = element.members.findIndex(a => a.uId === uId);
        if (memberIndex === -1) throw HTTPError(403, 'Unauthorised access');
        // Sharing to DM
        const newMessage = message + element.messages[messageIndex].message;
        const sharedMessageId = messageSendDmV2(token, dmId, newMessage);
        return sharedMessageId;
      }
    }

    // searching for ogMessageId in the channels and sending associated message to specified DM
    for (const element of data.channel) {
      const messageIndex = element.messages.findIndex(a => a.messageId === ogMessageId);
      if (messageIndex !== -1) {
        // checking if member is a part of the channel they are trying to send a msg from
        const memberIndex = element.members.findIndex(a => a.uId === uId);
        if (memberIndex === -1) throw HTTPError(403, 'Unauthorised access');
        // Sharing to DM
        const newMessage = message + element.messages[messageIndex].message;
        const sharedMessageId = messageSendDmV2(token, dmId, newMessage);
        return sharedMessageId;
      }
    }
  } else { // if sending to channel
    if (data.channel.find(a => a.channelId === channelId) === undefined) {
      throw HTTPError(400, 'invalid channelId!');
    }
    const sendIndex = data.channel.findIndex(a => a.channelId === channelId);
    if (sendIndex === -1) {
      throw HTTPError(400, 'invalid dmId!');
    }
    if (data.channel[sendIndex].members.findIndex(a => a.uId === uId) === -1) {
      throw HTTPError(403, 'User not part of DM');
    }
    // searching for ogMessageId in the DMs and sending associated message to specified channel
    for (const element of data.dm) {
      const messageIndex = element.messages.findIndex(a => a.messageId === ogMessageId);
      if (messageIndex !== -1) {
        // checking if member is a part of the dm they are trying to send a msg from
        const memberIndex = element.members.findIndex(a => a.uId === uId);
        if (memberIndex === -1) throw HTTPError(403, 'Unauthorised access');
        // Sharing to DM
        const newMessage = message + element.messages[messageIndex].message;
        const sharedMessageId = messageSendV2(token, channelId, newMessage);
        return sharedMessageId;
      }
    }

    // searching for ogMessageId in the channels and sending associated message to specified channel
    for (const element of data.channel) {
      const messageIndex = element.messages.findIndex(a => a.messageId === ogMessageId);
      if (messageIndex !== -1) {
        // checking if member is a part of the channel they are trying to send a msg from
        const memberIndex = element.members.findIndex(a => a.uId === uId);
        if (memberIndex === -1) throw HTTPError(403, 'Unauthorised access');
        // Sharing to DM
        const newMessage = message + element.messages[messageIndex].message;
        const sharedMessageId = messageSendV2(token, channelId, newMessage);
        return sharedMessageId;
      }
    }
  }
  throw HTTPError(400, 'Invalid messageId');
}
