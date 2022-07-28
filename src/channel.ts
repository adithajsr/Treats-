
import { getData, setData } from './dataStore';
import { checkToken } from './message';
import HTTPError from 'http-errors';

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
  if (channelIndex === -1) return { error: 'error' };

  // checking that member is authorised user of channel
  const tokenIndex = data.token.findIndex(a => a.token === token);
  if (tokenIndex === -1) return { error: 'error' };

  const uId = data.token[tokenIndex].uId;
  const memberIndex = data.channel[channelIndex].members.findIndex(a => a.uId === uId);

  if (memberIndex === -1) return { error: 'error' };

  // checking whether start index is greater than the amount of messages

  const messageAmount = data.channel[channelIndex].messages.length;

  if (start > messageAmount) {
    return { error: 'error' };
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

interface Details {
  name: string,
  isPublic: boolean,
  ownerMembers: any[],
  allMembers: any[],
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

  const details: Details = {
    name: channel[i].channelName,
    isPublic: channel[i].isPublic,
    ownerMembers: [],
    allMembers: [],
  };

  // find the member in the user array, then push details on
  const { user } = data;
  for (const i in members) {
    const index = data.user.findIndex(a => a.uId === members[i].uId);
    // owners
    if (members[i].channelPerms === 1) {
      details.ownerMembers.push(
        {
          uId: user[index].uId,
          email: user[index].email,
          nameFirst: user[index].nameFirst,
          nameLast: user[index].nameLast,
          handle: user[index].handle,
        }
      );
    }
    details.allMembers.push(
      {
        uId: user[index].uId,
        email: user[index].email,
        nameFirst: user[index].nameFirst,
        nameLast: user[index].nameLast,
        handle: user[index].handle,
      }
    );
  }
  return { channelDetails: details };
}

// ======================================== Main Functions. ========================================

// Constants
const OWNER = 1;
const USER = 2;

/* Description: Adds a user to a channel
Arguments:
  <token> (integer)    - <The token of the user who initates the function>
  <channelId> (integer)    - <The channelId of the channel which is getting the new user.>

Return Value:
  Returns <{}> on <successfully added user to channel>
  Returns <{error: 'error'}> on <user was not added due to failing an error test>
*/
export function channelJoinV2(token: string, channelId: number) {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
    uIdExists(authUserId) === false ||
    memberExists(channelId, authUserId) === true ||
    (channelPublic(channelId) === false && globalPermissions(authUserId) !== OWNER)) {
    return { error: 'error' };
  }
  addUser(channelId, authUserId);
  return {};
}

/* Description: Invites user to the channel
Arguments:
  <token> (integer)    - <The token of the user who initates the function>
  <channelId> (integer)    - <The channelId of the channel which is getting the new user.>
  <uId> (integer)    - <The uId of the person being added to the channel.>

Return Value:
  Returns <{}> on <successfully added user to channel>
  Returns <{error: 'error'}> on <user was not added due to failing an error test>
*/
export function channelInviteV2(token: string, channelId: number, uId: number) {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
    uIdExists(uId) === false ||
    memberExists(channelId, uId) === true ||
    memberExists(channelId, authUserId) === false) {
    return { error: 'error' };
  }
  addUser(channelId, uId);
  return {};
}

/* Description: Removes a user from a channel.
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <channelId> (integer)    - <The channelId of the channel.>

Return Value:
    Returns <{}> on <successfully removed user from the channel.>
    Returns <error: 'error'> on <user couldn't be removed from channel.>
*/
export function channelLeaveV1(token: string, channelId: number) {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
    memberExists(channelId, authUserId) === false) {
    return { error: 'error' };
  }
  leaveChannel(channelId, authUserId);
  return {};
}

/* Description: Make a member an owner of a channel
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <channelId> (integer)    - <The channelId of the channel.>
    <uId> (<integer>)    - <The uId of the user thats being made a member.>

Return Value:
    Returns <{}> on <successfully made user owner>
    Returns <{error: 'error'}> on <user was not made an owner>
*/
export function channelAddownerV1(token: string, channelId: number, uId: number) {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
    uIdExists(uId) === false ||
    memberExists(channelId, uId) === false ||
    channelPermissions(channelId, uId) === OWNER ||
    channelPermissions(channelId, authUserId) !== OWNER) {
    return { error: 'error' };
  }
  changePerms(channelId, uId, OWNER);
  return {};
}

/* Description: Remove member as an owner of a channel
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <channelId> (integer)    - <The channelId of the channel.>
    <uId> (<integer>)    - <The uId of the user thats being made a member.>

Return Value:
    Returns <{}> on <successfully removed user as owner>
    Returns <{error: 'error'}> on <user was not removed as an owner>
*/
export function channelRemoveownerV1(token: string, channelId: number, uId: number) {
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
    uIdExists(uId) === false ||
    channelPermissions(channelId, uId) !== OWNER ||
    numOwners(channelId) <= 1 ||
    channelPermissions(channelId, authUserId) !== OWNER) {
    return { error: 'error' };
  }
  changePerms(channelId, uId, USER);
  return {};
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
function memberExists(channelId: number, uId: number): boolean {
  let uidSearch = null;
  const data = getData();
  const channelSearch = data.channel.find((data) => data.channelId === channelId);
  if (channelSearch != null) {
    const { members } = channelSearch;
    uidSearch = members.find((data) => data.uId === uId);
  }
  return (uidSearch != null);
}

/* Description: Checks whether a chanel exists in the database
Arguments:
  <channelId> (integer)    - <The channelId of the channel thats being checked.>
Return Value:
  Returns <true> on <Channel is found.>
  Returns <false> on <Channel was not found.>
*/
function channelExists(channelId: number) :boolean {
  const data = getData();
  const search = data.channel.find((data) => data.channelId === channelId);
  return (search != null);
}

/* Description: Checks whether a user  exists in the database
Arguments:
  <uId> (integer)    - <The uId of the user thats being checked.>
Return Value:
  Returns <true> on <uId is found.>
  Returns <false> on <uId was not found.>
*/
function uIdExists(uId: number): boolean {
  const data = getData();
  const search = data.user.find((data) => data.uId === uId);
  return (search != null);
}

/* Description: Checks what the channel permissions are of a user
Arguments:
  <channelId> (integer)    - <The channelId of the channel thats being checked.>
  <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
  Returns <permissions> if <user is found, its permissions are returned as a string. ie 0>
  Returns <invalid> on <uId was not found in the channel.>
*/
function channelPermissions(channelId: number, uId: number) {
  let uidSearch = null;
  const data = getData();
  const { channel } = data;
  const channelSearch = channel.find((data) => data.channelId === channelId);
  if (channelSearch != null) {
    const { members } = channelSearch;
    uidSearch = members.find((data) => data.uId === uId);
  }
  return (uidSearch != null) ? uidSearch.channelPerms : 'invalid';
}

/* Description: Checks what the global permission are of a user
Arguments:
  <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
  Returns <permissions> if <user is found, its permissions are returned as a string. ie 0>
  Returns <invalid> on <uId was not found in the channel.>
*/
function globalPermissions(uId: number) {
  const data = getData();
  const search = data.user.find((data) => data.uId === uId);
  return (search != null) ? search.globalPerms : 'invalid';
}

/* Description: Checks whether the channel is private or public.
Arguments:
  <channelId> (integer)    - <The channelId of the channel whose state is being queried.>

Return Value:
  Returns <true> on <when channel key IsPublic is set to true>
  Returns <false> on <when channel key IsPublic is set to false>
*/
function channelPublic(channelId: number): boolean {
  const data = getData();
  const search = data.channel.find((data) => data.channelId === channelId && data.isPublic === true);
  return (search != null);
}

/* Description: Changes a user permissions in a channel.
    Arguments:
      <channelId> (integer)    - <The channel thats being edited>
      <uId> (integer)    - <The uId of the user thats being edited>
      <newPerm> (string)    - <The new permission>

  Return Value:
      Returns <null>
  */
function changePerms(channelId: number, uId: number, newPerm: number) {
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
function numOwners(channelId: number) {
  const data = getData();
  const { channel } = data;
  const i = channel.findIndex((data) => data.channelId === channelId);
  return channel[i].members.filter((x) => x.channelPerms === OWNER).length;
}

/* Description: Converts a token to a userId
  Arguments:
    <token> (string)    - <The token thats being converted>

  Return Value:
    Returns <uId> on <string was found in the database attached to the returned uId>
    Returns <invalid> on <string could not be found in the>
  */
function tokenConvert(token: string) : number {
  const data = getData();
  const tokenSearch = data.token.find((data) => data.token === token);
  return (tokenSearch != null) ? tokenSearch.uId : 0;
}

/* Description: removes user from a channels database.
    Arguments:
      <channelId> (integer)    - <The channel thats being edited>
      <uId> (integer)    - <The uId of the user thats being edited>

  Return Value:
      Returns <null>
  */
function leaveChannel(channelId: number, uId: number) {
  const data = getData();
  const i = data.channel.findIndex((data) => data.channelId === channelId);
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
function addUser(channelId: number, uId: number) {
  const data = getData();
  const newUser = { uId, channelPerms: USER };
  const i = data.channel.findIndex((data) => data.channelId === channelId);
  data.channel[i].members.push(newUser);
  setData(data);
}
