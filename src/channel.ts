// ======================================== Imports. ========================================

import express, {
  json,
  Request,
  Response
} from 'express';
import cors from 'cors';

import { getData, setData } from './dataStore';


// Constants
const OWNER = 1;
const USER = 0;
// ======================================== Main Functions. ========================================

/* Description: Adds a user to a channel
Arguments:
  <token> (integer)    - <The token of the user who initates the function>
  <channelId> (integer)    - <The channelId of the channel which is getting the new user.>

Return Value:
  Returns <{}> on <successfully added user to channel>
  Returns <{error: 'error'}> on <user was not added due to failing an error test>
*/
export function channelJoinV2(token: string, channelId: number){
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
		uIdExists(authUserId) === false ||
    memberExists(channelId, authUserId) === true ||
		(channelPublic(channelId) === false && globalPermissions(authUserId) !== OWNER)) {
    return { error: 'error' };
  } else {
    addUser(channelId, authUserId);
    return {};
  }
};

/* Description: Invites user to the channel
Arguments:
  <token> (integer)    - <The token of the user who initates the function>
  <channelId> (integer)    - <The channelId of the channel which is getting the new user.>
  <uId> (integer)    - <The uId of the person being added to the channel.>

Return Value:
  Returns <{}> on <successfully added user to channel>
  Returns <{error: 'error'}> on <user was not added due to failing an error test>
*/
export function channelInviteV2(token: string, channelId: number, uId: number){
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
		uIdExists(uId) === false ||
		memberExists(channelId, uId) === true ||
		memberExists(channelId, authUserId) === false) {
    return { error: 'error' };
  } else {
    addUser(channelId, uId);
    return {};
  }
}

/* Description: Removes a user from a channel.
Arguments:
    <token> (integer)    - <The token of the user who initates the function>
    <channelId> (integer)    - <The channelId of the channel.>

Return Value:
    Returns <{}> on <successfully removed user from the channel.>
    Returns <{error: 'error'}> on <user couldn't be removed from channel.>
*/
export function channelLeaveV1(token: string, channelId: number){
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
    memberExists(channelId, authUserId) === false) {
    return { error: 'error' }
  } else {
    leaveChannel(channelId, authUserId);
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
    Returns <{error: 'error'}> on <user was not made an owner>
*/
export function channelAddownerV1(token: string, channelId: number, uId: number){
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
		uIdExists(uId) === false ||
		memberExists(channelId, uId) === false ||
    channelPermissions(channelId, uId) === OWNER ||
    channelPermissions(channelId, authUserId) !== OWNER) {
    return { error: 'error' };
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
    Returns <{error: 'error'}> on <user was not removed as an owner>
*/
export function channelRemoveownerV1(token: string, channelId: number, uId: number){
  const authUserId = tokenConvert(token);
  if (channelExists(channelId) === false ||
		uIdExists(uId) === false ||
		channelPermissions(channelId, uId) !== OWNER ||
		numOwners(channelId) <= 1 ||
		channelPermissions(channelId, authUserId) !== OWNER) {
    return { error: 'error' }
  } else {
    changePerms(channelId, uId, USER);
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
function memberExists(channelId: number, uId: number): boolean {
  let uidSearch = null;
  const data = getData();
  const channelSearch = data.channel.find(data => data.channelId === channelId);
  if (channelSearch != null) {
    const { members } = channelSearch;
    uidSearch = members.find(data => data.uId === uId);
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
function channelExists(channelId) :boolean {
  let data = getData();
  const search = data.channel.find(data => data.channelId === channelId);
  return (search != null) ? true : false;
}

/* Description: Checks whether a user  exists in the database
Arguments:
  <uId> (integer)    - <The uId of the user thats being checked.>
Return Value:
  Returns <true> on <uId is found.>
  Returns <false> on <uId was not found.>
*/
function uIdExists(uId): boolean {
  let data = getData();
  const search = data.user.find(data => data.uId === uId);
  return (search != null) ? true : false;
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
  const channelSearch = channel.find(data => data.channelId === channelId);
  if (channelSearch != null) {
    const { members } = channelSearch;
    uidSearch = members.find(data => data.uId === uId);
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
  const search = data.user.find(data => data.uId === uId);
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
  const search = data.channel.find(data => data.channelId === channelId && data.isPublic === true);
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
function changePerms(channelId: number, uId: number, newPerm) {
  const data = getData();
  const i = data.channel.findIndex(data => data.channelId === channelId);
  const j = data.channel[i].members.findIndex(data => data.uId === uId);
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
  const i = channel.findIndex(data => data.channelId === channelId);
  return channel[i].members.filter(x => x.channelPerms === OWNER).length;
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
  const tokenSearch = data.token.find(data => data.token === token);
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
  const i = data.channel.findIndex(data => data.channelId === channelId);
  const j = data.channel[i].members.findIndex(data => data.uId === uId);
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
  const newUser = { uId: uId, channelPerms: USER };
  const i = data.channel.findIndex(data => data.channelId === channelId);
  data.channel[i].members.push(newUser);
  setData(data);
}
