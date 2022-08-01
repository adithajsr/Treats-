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

Return Value:
  Returns { true } if token is valid
  Returns { false } if token is invalid
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
  Returns { } if no error
  Returns { error: 'error' } on invalid token, length less than or over 1000 characters, not a valid messageId
                              message wasn't sent by an authorised user, auth user does not have
                              owner permission
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
      pinned: 0,
      react: 0,
    }
  );

  setData(data);
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
    Returns { } if no error
    Returns { error: 'error' } on invalid token, not a valid messageId
                               message wasn't sent by an authorised user, auth user does not have
                               owner permission
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
    Returns { messageId } if no error
    Returns { error: 'error' } on invalid token, invalid dmId, or invalid message length
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
      pinned: 0,
      react: 0,
    }
  );
  setData(data);
  return { messageId: messageId };
}

export function MessageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const data = getData();

  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'Specify channel/DM');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Message length must be below 1000 characters');
  }

  const dmIndex = 0;

  //if sending to DM
  if (channelId === -1) {
    //searching for ogMessageId in the DMs and sending associated message to specified DM
    for (const element of data.dm) {
      const messageIndex = element.messages.findIndex(a => a.messageId === ogMessageId);
      if (messageIndex !== -1) {
        //token checking 
        const tokenIndex = element.token.findIndex(a => a.token === token);
        if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');
       //checking if member is a part of the dm they are trying to send a msg from
        const uId = data.token[tokenIndex].uId;
        const memberIndex = element.members.findIndex(a => a.uId === uId);
        if (memberIndex === -1) throw HTTPError(400, 'Unauthorised access')
        //Sharing to DM
        const newMessage = element.messages[messageIndex].message + message;
        const sharedMessageId = messageSendDmV2(dmId, newMessage);
        break;
      }
    }

    //searching for ogMessageId in the channels and sending associated message to specified DM
    for (const element of data.channel) {
      const messageIndex = element.messages.findIndex(a => a.messageId === ogMessageId);
      if (messageIndex !== -1) {
        //token checking 
        const tokenIndex = element.token.findIndex(a => a.token === token);
        if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');
       //checking if member is a part of the channel they are trying to send a msg from
        const uId = data.token[tokenIndex].uId;
        const memberIndex = element.members.findIndex(a => a.uId === uId);
        if (memberIndex === -1) throw HTTPError(400, 'Unauthorised access')
        //Sharing to DM
        const newMessage = element.messages[messageIndex].message + message;
        const sharedMessageId = messageSendDmV2(dmId, newMessage);
        break;
      }
    }
  }

  //if sending to channel
  else {
     //searching for ogMessageId in the DMs and sending associated message to specified channel
    for (const element of data.dm) {
      const messageIndex = element.messages.findIndex(a => a.messageId === ogMessageId);
      if (messageIndex !== -1) {
        //token checking 
        const tokenIndex = element.token.findIndex(a => a.token === token);
        if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');
       //checking if member is a part of the dm they are trying to send a msg from
        const uId = data.token[tokenIndex].uId;
        const memberIndex = element.members.findIndex(a => a.uId === uId);
        if (memberIndex === -1) throw HTTPError(400, 'Unauthorised access')
        //Sharing to DM
        const newMessage = element.messages[messageIndex].message + message;
        const sharedMessageId = messageSendV2(channelId, newMessage);
        break;
      }
    }

    //searching for ogMessageId in the channels and sending associated message to specified channel
    for (const element of data.channel) {
      const messageIndex = element.messages.findIndex(a => a.messageId === ogMessageId);
      if (messageIndex !== -1) {
        //token checking 
        const tokenIndex = element.token.findIndex(a => a.token === token);
        if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');
       //checking if member is a part of the channel they are trying to send a msg from
        const uId = data.token[tokenIndex].uId;
        const memberIndex = element.members.findIndex(a => a.uId === uId);
        if (memberIndex === -1) throw HTTPError(400, 'Unauthorised access')
        //Sharing to DM
        const newMessage = element.messages[messageIndex].message + message;
        const sharedMessageId = messageSendV2(channelId, newMessage);
        break;
      }
    }    

  }



  
  return sharedMessageId;
}