
import { getData, setData } from './dataStore';

/*
This function returns the amount of messages in a specified channel
Arguments: 
    channelId (number) - specifying the channel

Return: 
    messageAmount (number) - amount of messages
*/

export function MessagesLength(channelId: number) {
    const data = getData();
    const channelIndex = data.channel.findIndex(a => a.channelId === channelId);
    messageAmount = data.channel[channelIndex].messages.length;
    return messageAmount;
}

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
export function channelMessagesv2(token: string, channelId: number, start: number) {
    let data = getData();

    //checking for valid channelId
    const channelIndex = data.channel.findIndex(a => a.channelId === channelId)
    if (channelIndex === -1) return {error: 'error'};

    //checking that member is authorised user of channel
    const tokenIndex = data.token.findIndex(a => a.token === token);
    if (tokenIndex === -1) return {error: 'error'}; 
    
    const uId = data.token[tokenIndex].uId;
    const memberIndex = data.channel[channelIndex].members.findIndex(a => a.uId === uId);

    if (memberIndex === -1) return {error: 'error'};

    //checking whether start index is greater than the amount of messages 
    messageAmount = data.channel[channelIndex].messages.length;

    if (start > messageAmount) {
        return {error: 'error'};
    } 

    //Storing start + 50 amount of messages in a new array to be returned 
    let returnMessages = [];

    for (let i = 0; i < start + 50; i++) {
        returnMessages[i] = data.channel[channelIndex].messages[i];
    }
    
    //Checking whether there are less messages than the endIndex
    const endIndex = start + 50;
    if (messageAmount < endIndex) endIndex = -1;


    return {returnMessages, start, endIndex};
}

import { getData } from './dataStore';

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
Checks validity of a token

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

/* Description: Returns details about a channel that an authorised user is a member of
Arguments:
    <token> (<string>)    - <The channelId of the channel that's being checked.>
    <channelId> (<integer>)    - <The token of the user that's checking>

Return Value:
    Returns <name, isPublic, ownerMembers, allMembers> on <valid token and valid channelId>
    Returns <error otherwise>
*/

function channelDetailsV2(token: string, channelId: number) {
  const data = getData();

  // check for token validity
  if (checkToken(token, data) === false) {
    return { error: 'error' };
  }

  const uId = tokenToUid(token, data);

  const { channel } = data;
  const i = data.channel.findIndex(data => data.channelId === channelId);

  // check for channel in database
  if (data.channel.find(a => a.channelId === channelId) === undefined) {
    return { error: 'error' };
    // check for user in channel
  } else {
    if (channel[i].members.find(a => a.uId === uId) === undefined) {
      return { error: 'error' };
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
    // members
    } else if (members[i].channelPerms === 2) {
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
  }
  return details;
}

// Functions being tested
/* Description: Checks whether a Uid is a member of a channel
Arguments:
  <channelId> (integer)    - <The channelId of the channel thats being checked.>
  <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
  Returns <true> on <uId is found in the channel.>
  Returns <false> on <uId was not found in the channel.>
*/
// function memberExists(channelId: number, uId: number) {
//   let uidSearch;
//   const data = getData();
//   const { channel } = data;
//   const channelSearch = channel.find(data => data.channelId === channelId);
//   if (channelSearch != null) {
//     const { members } = channelSearch;
//     uidSearch = members.find(data => data.uId === uId);
//   }
//   return (uidSearch != null) ? 'true' : 'false';
// }

// /*Description: Invites user to the channel
// Arguments:
//   <authUserId> (integer)    - <The authUserId is the user who initates the function>
//   <channelId> (integer)    - <The channelId of the channel which is getting the new user.>
//   <uId> (integer)    - <The uId of the person being added to the channel.>

// Return Value:
//   Returns <{}> on <successfully added user to channel>
//   Returns <{error: 'error'}> on <user was not added due to failing an error test>
// */
// function channelInviteV1(authUserId, channelId, uId) {
//   if (channelExists(channelId) === "false" ||
//       uIdExists(uId) === "false" ||
//       memberExists(channelId, uId) === "true" ||
//       memberExists(channelId, authUserId) === "false")
//   {
//     return {error: "error"};
//   } else {
//     let data = getData();
//     const new_user = {uId: uId,channelPerms: 'member'};
//     let i = data.channel.findIndex(data => data.channelId === channelId);
//     data.channel[i].members.push(new_user);
//     setData(data);
//     return {};
//   }
// }

// //Defined numbers.
// const GLOBAL = 1;

// /*Description: Checks whether a chanel exists in the database
// Arguments:
//   <channelId> (integer)    - <The channelId of the channel thats being checked.>
// Return Value:
//   Returns <true> on <Channel is found.>
//   Returns <false> on <Channel was not found.>
// */
// function channelExists(channelId) {
//   let data = getData();
//   const {channel} = data;
//   const search = channel.find(data => data.channelId === channelId);
//   return (search != null) ? "true" : "false";
// }

// /*Description: Checks whether a user  exists in the database
// Arguments:
//   <uId> (integer)    - <The uId of the user thats being checked.>
// Return Value:
//   Returns <true> on <uId is found.>
//   Returns <false> on <uId was not found.>
// */
// function uIdExists(uId) {
//     let data = getData();
//     const {user} = data;
//     const search = user.find(data => data.uId === uId);
//     return (search != null) ? "true" : "false";
// }

// /*Description: Checks what the channel permissions are of a user
// Arguments:
//   <channelId> (integer)    - <The channelId of the channel thats being checked.>
//   <uId> (<integer>)    - <The uId of the user thats being checked.>

// Return Value:
//   Returns <permissions> if <user is found, its permissions are returned as a string. ie 'member'>
//   Returns <invalid> on <uId was not found in the channel.>
// */
// function channelPermissions(channelId, uId) {
//   var uid_search = null;
//   let data = getData();
//   const {channel} = data;
//   const channel_search = channel.find(data => data.channelId === channelId);
//   if (channel_search != null) {
//     const {members} = channel_search;
//     var uid_search = members.find(data => data.uId === uId);
//   }
//   return (uid_search != null) ? uid_search.channelPerms : "invalid";
// }

// /*Description: Checks what the global permission are of a user
// Arguments:
//   <uId> (<integer>)    - <The uId of the user thats being checked.>

// Return Value:
//   Returns <permissions> if <user is found, its permissions are returned as a string. ie 'member'>
//   Returns <invalid> on <uId was not found in the channel.>
// */
// function globalPermissions(uId) {
//   let data = getData();
//   const {user} = data;
//   const search = user.find(data => data.uId === uId);
//   return (search != null) ? search.globalPerms : "invalid";
// }

// /*Description: Checks whether the channel is private or public.
// Arguments:
//   <channelId> (integer)    - <The channelId of the channel whose state is being queried.>

// Return Value:
//   Returns <true> on <when channel key IsPublic is set to true>
//   Returns <false> on <when channel key IsPublic is set to false>
// */
// function channelPublic(channelId) {
//   let data = getData();
//   const {channel} = data;
//   const search = channel.find(data => data.channelId === channelId &&
//                               data.isPublic === true);
//   return (search != null) ? "true" : "false";
// }

// /*Description: Adds a user to a channel
// Arguments:
//   <authUserId> (integer)    - <The authUserId is the user who initates the function>
//   <channelId> (integer)    - <The channelId of the channel which is getting the new user.>

// Return Value:
//   Returns <{}> on <successfully added user to channel>
//   Returns <{error: 'error'}> on <user was not added due to failing an error test>
// */
// //Add a check to test whether authUserId is valid.
// function channelJoinV1(authUserId, channelId) {
//   if (channelExists(channelId) == "false" ||
//     uIdExists(authUserId) === "true" ||
//     memberExists(channelId, authUserId) == "true" ||
//     (channelPublic(channelId) == "false" && globalPermissions(authUserId) != GLOBAL)) {
//     return {error: "error"};
//   } else {
//     let data = getData();
//     const new_user = {uId: authUserId,channelPerms: 'member'};
//     let i = data.channel.findIndex(data => data.channelId === channelId);
//     data.channel[i].members.push(new_user);
//     setData(data);
//     return {};
//   }
// }

// export { channelPublic, globalPermissions, channelPermissions, uIdExists, channelExists, memberExists, channelDetailsV2, channelJoinV1, channelInviteV1, channelMessagesV1 };
export { channelDetailsV2 };

