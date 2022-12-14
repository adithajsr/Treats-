import createHttpError from 'http-errors';
import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { checkToken } from './message';

/*
This function returns 50 messages in a specified channel from a specified startpoint

Arguments:
    token (string) - to determine if valid user requesting function
    channelId(number) - to specify the channel
    start (number) - to specify where we start from

Return:
    Returns {error: 'error'} if invalid dmId, unauthorised member or start >
    messages in channel
    Returns an array of messages, start and end indexes if successful

*/
export function channelMessagesV2(token: string, channelId: number, start: number) {
  const data = getData();

  // checking for valid channelId
  const channelIndex = data.channel.findIndex(a => a.channelId === channelId);
  if (channelIndex === -1) throw HTTPError(400, 'Invalid channelId');

  // checking that member is authorised user of channel
  const tokenIndex = data.token.findIndex(a => a.token === token);
  if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');

  const uId = data.token[tokenIndex].uId;
  const memberIndex = data.channel[channelIndex].members.findIndex(a => a.uId === uId);

  if (memberIndex === -1) throw HTTPError(403, 'User does not have access to channel');

  // checking whether start index is greater than the amount of messages

  const messageAmount = data.channel[channelIndex].messages.length;

  if (start > messageAmount) {
    throw HTTPError(400, 'Start is greater than the total amount of messages in the channel');
  }

  // Storing start + 50 amount of messages in a new array to be returned
  const messages = [];

  for (let i = start; i < start + 50; i++) {
    if (i >= data.channel[channelIndex].messages.length) break;
    messages.push(data.channel[channelIndex].messages[i]);
  }

  // Checking whether there are less messages than the endIndex
  let endIndex = start + 50;
  if (messageAmount < endIndex) endIndex = -1;
  return { messages, start, endIndex };
}

interface Database {
  user: any[],
  channel: any[],
  token: any[],
  dm: any[],
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

/* Description: Returns details about a channel that an authorised user is a member of
Arguments:
    <token> (<string>)    - <The channelId of the channel that's being checked.>
    <channelId> (<integer>)    - <The token of the user that's checking>

Return Value:
    Returns <name, isPublic, ownerMembers, allMembers> on <valid token and valid channelId>
    Returns <error otherwise>
*/

export function channelDetailsV3(token: string, channelId: number) {
  const data = getData();
  checkToken(token, data);

  const uId = tokenToUid(token, data);

  const { channel } = data;
  const i = data.channel.findIndex(data => data.channelId === channelId);

  // check for channel in database
  if (data.channel.find(a => a.channelId === channelId) === undefined) {
    throw HTTPError(400, 'invalid channelId');
    // check for user in channel
  } else {
    if (channel[i].members.find(a => a.uId === uId) === undefined) {
      throw HTTPError(403, 'auth user is not a member!');
    }
  }

  const { members } = channel[i];
  const { user } = data;

  const name = channel[i].channelName;
  const isPublic = channel[i].isPublic;
  const ownerMembers = [];
  const allMembers = [];

  for (const i in members) {
    const index = data.user.findIndex(a => a.uId === members[i].uId);
    if (members[i].channelPerms === 1) {
      ownerMembers.push(
        {
          uId: user[index].uId,
          email: user[index].email,
          nameFirst: user[index].nameFirst,
          nameLast: user[index].nameLast,
          handle: user[index].handle,
        }
      );
    }
    allMembers.push(
      {
        uId: user[index].uId,
        email: user[index].email,
        nameFirst: user[index].nameFirst,
        nameLast: user[index].nameLast,
        handle: user[index].handle,
      }
    );
  }

  return { name, isPublic, ownerMembers, allMembers };
}

// ======================================== Imports. ========================================
// Constants
const OWNER = 1;
const USER = 2;
const ERROR = -1;
// ======================================== Main Functions. =======================================

/* Description: Adds a user to a channel
Arguments:
  <token> (integer)    - <The token of the user who initates the function>
  <channelId> (integer)    - <The channelId of the channel which is getting the new user.>

Return Value:
  Returns <{}> on <successfully added user to channel>
    Returns <403> on <authId does not have permissions>
    Returns <403> on <error>
*/

export function channelJoinV3(token: string, channelId: number): object {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === true && channelPublic(channelId) === false && globalPermissions(authUserId) !== OWNER) {
    throw createHttpError(403, '403 error');
  } else if (channelExists(channelId) === false ||
    uIdExists(authUserId) === false ||
    memberExists(channelId, authUserId) === true) {
    throw createHttpError(400, 'error');
  } else {
    addUser(channelId, authUserId);

    // Update analytics metrics
    const data = getData();
    const channelJoinTime = Math.floor((new Date()).getTime() / 1000);
    const userObj = data.user[data.user.findIndex(a => a.uId === authUserId)];
    const oldnumChJoined = userObj.channelsJoined[userObj.channelsJoined.length - 1].numChannelsJoined;
    userObj.channelsJoined.push({
      numChannelsJoined: oldnumChJoined + 1,
      timeStamp: channelJoinTime,
    });
    setData(data);

    return {};
  }
}

/* Description: Invites user to the channel
Arguments:
  <token> (integer)    - <The token of the user who initates the function>
  <channelId> (integer)    - <The channelId of the channel which is getting the new user.>
  <uId> (integer)    - <The uId of the person being added to the channel.>

Return Value:
  Returns <{}> on <successfully added user to channel>
    Returns <403> on <authId does not have permissions>
    Returns <403> on <error>
*/
export function channelInviteV3(token: string, channelId: number, uId: number): object {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === true && memberExists(channelId, authUserId) === false) {
    throw createHttpError(403, 'error');
  } else if (channelExists(channelId) === false ||
    uIdExists(uId) === false ||
    memberExists(channelId, uId) === true) {
    throw createHttpError(400, 'error userPermission');
  } else {
    // Add user to the channel
    addUser(channelId, uId);

    // Adding newNotification to user's notification array
    const data = getData();
    const channelIndex = data.channel.findIndex((data) => data.channelId === channelId);
    const channelName = data.channel[channelIndex].channelName;
    const authUserIndex = data.user.findIndex(a => a.uId === authUserId);
    const notificationMessage = data.user[authUserIndex].handle + ' added you to ' + channelName;
    const dmId = -1;
    const newNotification = { channelId, dmId, notificationMessage };
    const userIndex = data.user.findIndex(a => a.uId === uId);
    data.user[userIndex].notifications.push(newNotification);

    // Update analytics metrics
    const channelInviteTime = Math.floor((new Date()).getTime() / 1000);
    const userObj = data.user[data.user.findIndex(a => a.uId === uId)];
    const oldnumChJoined = userObj.channelsJoined[userObj.channelsJoined.length - 1].numChannelsJoined;
    userObj.channelsJoined.push({
      numChannelsJoined: oldnumChJoined + 1,
      timeStamp: channelInviteTime,
    });
    setData(data);

    return {};
  }
}

/* Description: Removes a user from a channel.
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <channelId> (integer)    - <The channelId of the channel.>

Return Value:
    Returns <{}> on <successfully removed user from the channel.>
    Returns <403> on <authId does not have permissions>
    Returns <403> on <error>
*/
export function channelLeaveV2(token: string, channelId: number): object {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === true && memberExists(channelId, authUserId) === false) {
    throw createHttpError(403, 'error');
  } else if (channelExists(channelId) === false || standupActive(channelId, authUserId) === true) {
    throw createHttpError(400, 'error');
  } else {
    leaveChannel(channelId, authUserId);

    // Update analytics metrics
    const data = getData();
    const channelLeaveTime = Math.floor((new Date()).getTime() / 1000);
    const userObj = data.user[data.user.findIndex(a => a.uId === authUserId)];
    const oldnumChJoined = userObj.channelsJoined[userObj.channelsJoined.length - 1].numChannelsJoined;
    userObj.channelsJoined.push({
      numChannelsJoined: oldnumChJoined - 1,
      timeStamp: channelLeaveTime,
    });
    setData(data);

    return {};
  }
}

/* Description: Make a member an owner of a channel
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <channelId> (integer)    - <The channelId of the channel.>
    <uId> (<integer>)    - <The uId of the user thats being made a member.>

Return Value:
    Returns <{}> on <successfully made user owner>
    Returns <403> on <authId does not have permissions>
    Returns <403> on <error>
*/
export function channelAddownerV2(token: string, channelId: number, uId: number): object {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === true && channelPermissions(channelId, authUserId) !== OWNER) {
    throw createHttpError(403, 'error');
  } else if (channelExists(channelId) === false ||
    uIdExists(uId) === false ||
    memberExists(channelId, uId) === false ||
    channelPermissions(channelId, uId) === OWNER) {
    throw createHttpError(400, 'error');
  } else {
    changePerms(channelId, uId, OWNER);
    return {};
  }
}

/* Description: Remove member as an owner of a channel
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <channelId> (integer)    - <The channelId of the channel.>
    <uId> (<integer>)    - <The uId of the user thats being made a member.>

Return Value:
    Returns <{}> on <successfully removed user as owner>
    Returns <403> on <authId does not have permissions>
    Returns <403> on <error>
*/
export function channelRemoveownerV2(token: string, channelId: number, uId: number): object {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === true && channelPermissions(channelId, authUserId) !== OWNER) {
    throw createHttpError(403, 'error');
  } else if (channelExists(channelId) === false ||
    uIdExists(uId) === false ||
    channelPermissions(channelId, uId) !== OWNER ||
    numOwners(channelId) <= 1) {
    throw createHttpError(400, 'error');
  } else {
    changePerms(channelId, uId, USER);
    return {};
  }
}

/* Description: Adds a react to a message
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <messageId> (integer)    - <The messageId of the message.>
    <reactId> (<integer>)    - <The new reactId.>

Return Value:
    Returns <{}> on <successfully removed user as owner>
    Returns <403> on <authId does not have permissions>
    Returns <403> on <error>
*/
export function react(token: string, messageId: number, reactId: number): object {
  const authUserId = tokenConvert(token);
  if (messageValid(authUserId, messageId) === false ||
reactId !== 1 ||
reactStatus(authUserId, messageId, reactId) === true) {
    throw createHttpError(400, 'error');
  } else {
    // user's handle
    // channel/dm name
    const data = getData();
    const userIndex = data.user.findIndex(a => a.uId === authUserId);
    const userHandle = data.user[userIndex].handle;

    const messageIndex = messageLocation(messageId).j;
    const locationId = messageLocation(messageId).channelId;

    let locationName = '';
    let uId = 0;
    let newNotification = { channelId: 0, dmId: 0, notificationMessage: '' };

    if (messageLocation(messageId).location === 'channel') {
      const channelIndex = data.channel.findIndex(a => a.channelId === locationId);
      locationName = data.channel[channelIndex].channelName;
      uId = data.channel[channelIndex].messages[messageIndex].uId;
      newNotification = { channelId: locationId, dmId: -1, notificationMessage: userHandle + ' reacted to your message in ' + locationName };
    } else {
      const dmIndex = data.dm.findIndex(a => a.dmId === locationId);
      locationName = data.dm[dmIndex].name;
      uId = data.dm[dmIndex].messages[messageIndex].uId;
      newNotification = { channelId: -1, dmId: locationId, notificationMessage: userHandle + ' reacted to your message in ' + locationName };
    }

    const userIndexReceiving = data.user.findIndex(a => a.uId === uId);
    data.user[userIndexReceiving].notifications.push(newNotification);
    setData(data);
    changeReact(authUserId, messageId, 1);
    return {};
  }
}

/* Description: Unreacts a message
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <messageId> (integer)    - <The messageId of the message.>
    <reactId> (<integer>)    - <The reactId to remove.>

Return Value:
    Returns <{}> on <successfully removed user as owner>
    Returns <403> on <authId does not have permissions>
    Returns <403> on <error>
*/
export function unReact(token: string, messageId: number, reactId: number): object {
  const authUserId = tokenConvert(token);
  if (messageValid(authUserId, messageId) === false ||
  reactId !== 1 || reactStatus(authUserId, messageId, reactId) === false) {
    throw createHttpError(400, 'error');
  } else {
    changeReact(authUserId, messageId, 0);
    return {};
  }
}

/* Description: Unreacts a message
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <messageId> (integer)    - <The messageId of the message thats being pinned.>

Return Value:
    Returns <{}> on <successfully removed user as owner>
    Returns <403> on <authId does not have permissions>
    Returns <403> on <error>
*/
export function pin(token: string, messageId: number): object {
  const authUserId = tokenConvert(token);
  if (messageLocation(messageId).location !== 'error' && channelPermissions(messageLocation(messageId).channelId, authUserId) !== OWNER) {
    throw createHttpError(403, 'error');
  } else if (messageValid(authUserId, messageId) === false || pinStatus(messageId) === true) {
    throw createHttpError(400, 'error');
  } else {
    changePin(messageId, 1);
    return {};
  }
}

/* Description: Unreacts a message
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <messageId> (integer)    - <The messageId of the message thats being unpinned.>

Return Value:
    Returns <{}> on <successfully removed user as owner>
    Returns <403> on <authId does not have permissions>
    Returns <403> on <error>
*/
export function unPin(token: string, messageId: number): object {
  const authUserId = tokenConvert(token);
  if (messageLocation(messageId).location !== 'error' && channelPermissions(messageLocation(messageId).channelId, authUserId) !== OWNER) {
    throw createHttpError(403, 'error');
  } else if (messageLocation(messageId).location === 'error' || pinStatus(messageId) === false) {
    throw createHttpError(400, 'error');
  } else {
    changePin(messageId, 0);
    return {};
  }
}

// ======================================== Helper Functions ========================================

/* Description: Checks whether a Uid is a member of a channel
Arguments:
    <channelId> (integer)    - <The channelId of the channel thats being checked.>
    <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
    Returns <true> on <uId is found in the channel.>
    Returns <false> on <uId was not found in the channel.>
*/
export function memberExists(channelId: number, uId: number): boolean {
  let uidSearch = null;
  const data = getData();
  const channelSearch = data.channel.find((data) => data.channelId === channelId);
  if (channelSearch != null) {
    const { members } = channelSearch;
    uidSearch = members.find((data) => data.uId === uId);
  }
  return (uidSearch != null);
}

/* Description: Checks whether a Uid is a member of a dm
Arguments:
    <dmId> (integer)    - <The dmId of the channel thats being checked.>
    <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
    Returns <true> on <uId is found in the dm.>
    Returns <false> on <uId was not found in the dm.>
*/
export function dmMemberExists(dmId: number, uId: number): boolean {
  let uidSearch = null;
  const data = getData();
  const dmSearch = data.dm.find((data) => data.dmId === dmId);
  if (dmSearch != null) {
    const { members } = dmSearch;
    uidSearch = members.find((data) => data.uId === uId);
  }
  return (uidSearch != null);
}

/* Description: Given a messageId find its location.
Arguments:
  <messageId> (integer)    - <The id of the message thats being pinned.>

Return Value:
  Returns <{i: number, j: number, location: string, channelId: number}> (on <successfully found message>)
*/
export function messageLocation(messageId: number): {i: number, j: number, location: string, channelId: number} {
  const data = getData();
  for (let i = 0; i < data.channel.length; i++) {
    const messageIndex = data.channel[i].messages.findIndex((data) => data.messageId === messageId);
    if (messageIndex !== ERROR) {
      return { i: i, j: messageIndex, location: 'channel', channelId: data.channel[i].channelId };
    }
  }
  for (let i = 0; i < data.dm.length; i++) {
    const messageIndex = data.dm[i].messages.findIndex((data) => data.messageId === messageId);
    if (messageIndex !== ERROR) {
      return { i: i, j: messageIndex, location: 'dm', channelId: data.dm[i].dmId };
    }
  }
  return { i: ERROR, j: ERROR, location: 'error', channelId: ERROR };
}
/* Description: Changes react state
Arguments:
  <messageId> (integer)    - <The id of the message thats being pinned.>
  <newReact> (integer)    - <The new react state.>

Return Value:
  Returns <void>
*/
export function pinStatus(messageId: number): boolean {
  const data = getData();
  const index = messageLocation(messageId);
  if (index.location === 'channel') {
    return (data.channel[index.i].messages[index.j].isPinned === 1);
  } else if (index.location === 'dm') {
    return (data.dm[index.i].messages[index.j].isPinned === 1);
  } else {
    return false;
  }
}

/* Description: Checks whether message has been reacted to.
Arguments:
  <messageId> (integer)    - <The id of the message thats being pinned.>
  <newReact> (integer)    - <The new react state.>

Return Value:
  Returns <true> on <message found in dm or channel is reacted to .>
  Returns <false> on <Channel was not found.>
*/
// Check dm or channel. Then search to see if can find id matches and react matches. Similar to previous search functions.
export function reactStatus(uId: number, messageId: number, reactId: number): boolean {
  const data = getData();
  const index = messageLocation(messageId);
  if (index.location === 'channel') {
    const z = data.channel[index.i].messages[index.j].reacts.findIndex((data) => data.reactId === reactId);
    if (z !== ERROR) {
      const search = data.channel[index.i].messages[index.j].reacts[z].uIds.findIndex((data: any) => data === uId);
      return (search !== ERROR);
    }
  } else if (index.location === 'dm') {
    const z = data.dm[index.i].messages[index.j].reacts.findIndex((data) => data.reactId === reactId);
    if (z !== ERROR) {
      const search = data.dm[index.i].messages[index.j].reacts[z].uIds.findIndex((data: any) => data === uId);
      return (search !== ERROR);
    }
  }
  return false;
}

/* Description: Changes react state
Arguments:
  <messageId> (integer)    - <The id of the message thats being pinned.>
  <newReact> (integer)    - <The new react state.>

Return Value:
  Returns <void>
*/
export function changeReact(uId:number, messageId:number, newReact:number): void {
  const data = getData();
  const index = messageLocation(messageId);
  const uIdArray: number[] = [];
  if (index.location === 'channel') {
    const z = data.channel[index.i].messages[index.j].reacts.findIndex((data) => data.reactId === newReact);
    if (z === -1) {
      uIdArray.push(uId);
      data.channel[index.i].messages[index.j].reacts.push({ reactId: newReact, uIds: uIdArray });
    } else if (newReact === 0) {
      const x = data.channel[index.i].messages[index.j].reacts[z].uIds.findIndex((data: any) => data === uId);
      data.channel[index.i].messages[index.j].reacts[z].uIds.splice(x, 1);
    } else {
      data.channel[index.i].messages[index.j].reacts[z].uIds.push(uId);
    }
  } else {
    const z = data.dm[index.i].messages[index.j].reacts.findIndex((data) => data.reactId === newReact);
    if (z === -1) {
      uIdArray.push(uId);
      data.dm[index.i].messages[index.j].reacts.push({ reactId: newReact, uIds: uIdArray });
    } else if (newReact === 0) {
      const x = data.dm[index.i].messages[index.j].reacts[z].uIds.findIndex((data: any) => data === uId);
      data.dm[index.i].messages[index.j].reacts[z].uIds.splice(x, 1);
    } else {
      data.dm[index.i].messages[index.j].reacts[z].uIds.push(uId);
    }
  }
  setData(data);
}

/* Description: Changes pinned state
Arguments:
  <messageId> (integer)    - <The id of the message thats being pinned.>
  <newPin> (integer)    - <The new pin state.>

Return Value:
  Returns <void>
*/
export function changePin(messageId:number, newPin:number): void {
  const data = getData();
  const index = messageLocation(messageId);
  if (index.location !== 'error') {
    if (index.location === 'channel') {
      data.channel[index.i].messages[index.j].isPinned = newPin;
    } else {
      data.dm[index.i].messages[index.j].isPinned = newPin;
    }
  }
  setData(data);
}

/* Description: Checks whether a chanel exists in the database
Arguments:
  <channelId> (integer)    - <The channelId of the channel thats being checked.>
Return Value:
  Returns <true> on <Channel is found.>
  Returns <false> on <Channel was not found.>
*/
export function channelExists(channelId:number) :boolean {
  const data = getData();
  const search = data.channel.find((data) => data.channelId === channelId);
  return (search !== undefined);
}

/* Description: Checks whether a user  exists in the database
Arguments:
  <uId> (integer)    - <The uId of the user thats being checked.>
Return Value:
  Returns <true> on <uId is found.>
  Returns <false> on <uId was not found.>
*/
export function uIdExists(uId:number): boolean {
  const data = getData();
  const search = data.user.find((data) => data.uId === uId);
  return (search !== undefined);
}

/* Description: Checks what the channel permissions are of a user
Arguments:
  <channelId> (integer)    - <The channelId of the channel thats being checked.>
  <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
  Returns <permissions> if <user is found, its permissions are returned as a string. ie 0>
  Returns <ERROR> on <uId was not found in the channel.>
*/
export function channelPermissions(channelId: number, uId: number): number {
  let uidSearch;
  const data = getData();
  const { channel } = data;
  const channelSearch = channel.find((data) => data.channelId === channelId);
  if (channelSearch !== undefined) {
    const { members } = channelSearch;
    uidSearch = members.find((data) => data.uId === uId);
  }
  return ((uidSearch !== undefined) ? uidSearch.channelPerms : ERROR);
}

/* Description: Checks what the global permission are of a user
Arguments:
  <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
  Returns <permissions> if <user is found, its permissions are returned as a string. ie 0>
  Returns <ERROR> on <uId was not found in the channel.>
*/
export function globalPermissions(uId: number): number {
  const data = getData();
  const search = data.user.find((data) => data.uId === uId);
  return (search !== undefined) ? search.globalPerms : ERROR;
}

/* Description: Checks whether the channel is private or public.
Arguments:
  <channelId> (integer)    - <The channelId of the channel whose state is being queried.>

Return Value:
  Returns <true> on <when channel key IsPublic is set to true>
  Returns <false> on <when channel key IsPublic is set to false>
*/
export function channelPublic(channelId: number): boolean {
  const data = getData();
  const search = data.channel.find((data) => data.channelId === channelId && data.isPublic === true);
  return (search !== undefined);
}

/* Description: Changes a user permissions in a channel.
    Arguments:
      <channelId> (integer)    - <The channel thats being edited>
      <uId> (integer)    - <The uId of the user thats being edited>
      <newPerm> (string)    - <The new permission>

  Return Value:
      Returns <null>
  */
export function changePerms(channelId: number, uId: number, newPerm:number): void {
  const data = getData();
  const i = data.channel.findIndex((data) => data.channelId === channelId);
  const j = data.channel[i].members.findIndex((data) => data.uId === uId);
  data.channel[i].members[j].channelPerms = newPerm;
  setData(data);
}

/* Description: Counts numbers of owners in a channel
  Arguments:
    <channelId> (integer)    - <The channel thats being checked>

  Return Value:
    Returns <number> the <number of owners that are in the channel.>
  */
export function numOwners(channelId: number): number {
  const data = getData();
  const { channel } = data;
  const i = channel.findIndex((data) => data.channelId === channelId);
  return channel[i].members.filter((x) => x.channelPerms === OWNER).length;
}

export function numGlobalOwners(): number {
  const data = getData();
  return data.user.filter((x) => x.globalPerms === OWNER).length;
}

/* Description: Converts a token to a userId
  Arguments:
    <token> (string)    - <The token thats being converted>

  Return Value:
    Returns <uId> on <string was found in the database attached to the returned uId>
    Returns <ERROR> on <string could not be found in the>
  */
export function tokenConvert(token: string) : number {
  const data = getData();
  const tokenSearch = data.token.find(data => data.token === token);
  return (tokenSearch !== undefined) ? tokenSearch.uId : ERROR;
}

/* Description: removes user from a channels database.
    Arguments:
      <channelId> (integer)    - <The channel thats being edited>
      <uId> (integer)    - <The uId of the user thats being edited>

  Return Value:
      Returns <null>
  */
export function leaveChannel(channelId: number, uId: number) {
  const data = getData();
  const i = data.channel.findIndex(data => data.channelId === channelId);
  const j = data.channel[i].members.findIndex((data) => data.uId === uId);
  data.channel[i].members.splice(j, 1);
  setData(data);
}

/* Description: adds user to a channels database.
    Arguments:
    <channelId> (integer)    - <The channel thats being edited>
    <uId> (integer)    - <The uId of the user thats being edited>

  Return Value:
    Returns <null>
*/
export function addUser(channelId: number, uId: number): void {
  const data = getData();
  const newUser = { uId, channelPerms: USER };
  const i = data.channel.findIndex((data) => data.channelId === channelId);
  data.channel[i].members.push(newUser);
  setData(data);
}

export function messageValid(authUserId: number, messageId:number): boolean {
  const data = getData();
  const message = messageLocation(messageId);
  if (message.location === 'error') {
    return false;
  } else if (message.location === 'channel') {
    const channel = data.channel[message.i].channelId;
    return memberExists(channel, authUserId);
  } else {
    const dm = data.dm[message.i].dmId;
    return dmMemberExists(dm, authUserId);
  }
}

export function standupActive(channelId: number, authUserId: number): boolean {
  const data = getData();
  const i = data.channel.findIndex((data) => data.channelId === channelId);
  return data.channel[i].isActiveUid === authUserId;
}
