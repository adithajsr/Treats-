import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { findTokenIndex } from './channels';

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

export function dmMessagesV2(token: string, dmId: number, start: number) {
  const data = getData();
  // checking for valid dmId
  const dmIndex = data.dm.findIndex(channel => channel.dmId === dmId);
  if (dmIndex === -1) throw HTTPError(400, 'Invalid dmId');

  // checking that member is authorised user of DM
  const tokenIndex = data.token.findIndex(a => a.token === token);
  if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');

  const uId = data.token[tokenIndex].uId;
  const memberIndex = data.dm[dmIndex].members.findIndex(a => a.uId === uId);

  if (memberIndex === -1) throw HTTPError(403, 'Unauthorised access to DM');

  const messageAmount = data.dm[dmIndex].messages.length;

  if (start > messageAmount) {
    throw HTTPError(400, 'Start is greater than the total number of messages in the DM');
  }

  // Storing start + 50 amount of messages in a new array to be returned
  const messages = [];

  for (let i = start; i < start + 50; i++) {
    if (i >= data.dm[dmIndex].messages.length) break;
    messages.push(data.dm[dmIndex].messages[i]);
  }

  let endIndex = start + 50;
  if (messageAmount < endIndex) endIndex = -1;

  return { messages, start, endIndex };
}

interface dmMember {
  uId: number,
  dmPerms: number,
}

/*
Helper function: checks if an array has duplicate values

Arguments:
    array (number[])          - array of values

Return Value:
    Returns true if array has duplicate values
    Returns false if array does not have duplicate values
*/
const hasDuplicates = (array: number[]) => {
  const valuesSoFar = [];
  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    if (valuesSoFar.includes(value) === true) {
      return true;
    }
    valuesSoFar.push(value);
  }
  return false;
};

/*
Helper function: Checks if the uIds for dmCreateV1() are valid

Arguments:
    uIds (number[])          - the user(s) that the DM is directed to
    creatoruId (number)      - uId of user creating the DM

Return Value:
    Returns true if arguments are valid
    Returns false if arguments are invalid
*/
const areUIdsValidDMCreate = (uIds: number[], creatoruId: number) => {
  const data = getData();

  // Any uId does not refer to a valid user
  for (const uId of uIds) {
    if (data.user.find(a => a.uId === uId) === undefined) {
      // Invalid uId
      return false;
    } else if (uId === creatoruId) {
      // uIds should not include the creator
      return false;
    }
  }

  // Duplicate uId's in uIds
  if (hasDuplicates(uIds) === true) {
    return false;
  }

  return true;
};

/*
Helper function: Creates a valid and unique dmId for the new DM

Arguments:
    n/a

Return Value:
    Returns newDMId
*/
const createIdDMCreate = () => {
  const data = getData();

  let newDMId = 0;

  // Find the largest existing dmId in the database
  for (const dm of data.dm) {
    if (newDMId < dm.dmId) {
      newDMId = dm.dmId;
    }
  }

  // Increment largest existing dmId to generate the new dmId
  newDMId++;

  return newDMId;
};

/*
Helper function: Creates an array of all members in the new DM

Arguments:
    uIds (number)           - the user(s) that the DM is directed to
    creatoruId (number)     - uId of user creating the DM

Return Value:
    Returns dmMembers
*/
const createMembersListDMCreate = (uIds: number[], creatoruId: number) => {
  // Create an array to make the members list
  const dmMembers = [];

  // The creator is the owner of the DM
  dmMembers.push({
    uId: creatoruId,
    dmPerms: 1,
  });

  // Other users in the DM have member permissions
  for (const uId of uIds) {
    dmMembers.push({
      uId: uId,
      dmPerms: 2,
    });
  }

  return dmMembers;
};

/*
Helper function: Creates the name of the new DM based on the users that are
in the DM

Arguments:
    dmMembers (dmMember[])    - members in the DM

Return Value:
    Returns dmName
*/
const createNameDMCreate = (dmMembers: dmMember[]) => {
  const data = getData();

  // Obtain the user handles and alphabetically sort them
  const userIndexes = dmMembers.map((dmMember) => data.user.findIndex(a => a.uId === dmMember.uId));
  const handles: string[] = userIndexes.map((userIndex) => data.user[userIndex].handle);
  handles.sort((a, b) => a.localeCompare(b));

  // Generate the DM name
  let dmName = '';
  for (const handle of handles) {
    dmName += handle + String(', ');
  }
  dmName = dmName.substring(0, dmName.length - 2);

  return dmName;
};

/*
Helper function: Creates an array of all DMs that the authorised user is part of

Arguments:
    userId (number)    - uId of the user corresponding to the given token

Return Value:
    Returns dmsList
*/
const createListDMList = (userId: number) => {
  const data = getData();

  // Create an array to make the list
  const dmsList = [];

  // Determine whether or not authorised user is in each channel
  for (let i = 0; i < data.dm.length; i++) {
    const members: dmMember[] = data.dm[i].members;

    if (members.find(b => b.uId === userId) !== undefined) {
      dmsList.push({
        dmId: data.dm[i].dmId,
        name: data.dm[i].name,
      });
    }
  }

  return dmsList;
};

/*
Helper function: Checks if the arguments for dmRemoveV1() are valid

Arguments:
    tokenIndex (number)          - index of token in tokens array in database
    dmId (number)                - dmId of existing DM

Return Value:
    Returns true if arguments are valid
    Throws a 400 error on invalid dmId
    Throws a 403 error if the authorised user is not in the DM
    or is not the original DM creator
*/
const areArgumentsValidDMRemove = (tokenIndex: number, dmId: number) => {
  const data = getData();

  const dmIndex = data.dm.findIndex(a => a.dmId === dmId);
  // Invalid dmId
  if (dmIndex === -1) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const useruId = data.token[tokenIndex].uId;
  const memberIndex = data.dm[dmIndex].members.findIndex(a => a.uId === useruId);
  if (memberIndex === -1) {
    // Authorised user is not in the DM
    throw HTTPError(403, 'The authorised user is not in the DM');
  } else if (data.dm[dmIndex].members[memberIndex].dmPerms !== 1) {
    // Authorised user is in the DM but is not the creator
    throw HTTPError(403, 'The authorised user is not the original DM creator');
  }

  return true;
};

/*
Creates a new DM with the creator as the owner of the DM

Arguments:
    token (string)    - represents the session of the user who is creating the DM
    uIds (number[])   - the user(s) that the DM is directed to

Return Value:
    Returns { dmId } if no error
    Throws a 403 error on invalid token
    Throws a 400 error on invalid uIds
*/
export function dmCreateV2(token: string, uIds: number[]) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  const creatoruId = data.token[tokenIndex].uId;

  if (areUIdsValidDMCreate(uIds, creatoruId) === false) {
    throw HTTPError(400, 'Invalid uIds');
  }

  const newDMId = createIdDMCreate();
  const dmMembers = createMembersListDMCreate(uIds, creatoruId);
  const dmName = createNameDMCreate(dmMembers);

  // Update analytics metrics
  const dmCreationTime = Math.floor((new Date()).getTime() / 1000);

  for (const member of dmMembers) {
    const userObj = data.user[data.user.findIndex(a => a.uId === member.uId)];
    const oldnumDmsJoined = userObj.dmsJoined[userObj.dmsJoined.length - 1].numDmsJoined;

    userObj.dmsJoined.push({
      numDmsJoined: oldnumDmsJoined + 1,
      timeStamp: dmCreationTime,
    });
  }

  const workspaceObj = data.workspaceStats;
  const oldnumDmsExist = workspaceObj.dmsExist[workspaceObj.dmsExist.length - 1].numDmsExist;

  workspaceObj.dmsExist.push({
    numDmsExist: oldnumDmsExist + 1,
    timeStamp: dmCreationTime,
  });

  // Create a new DM
  data.dm.push({
    dmId: newDMId,
    name: dmName,
    members: dmMembers,
    messages: [],
  });

  setData(data);

  return {
    dmId: newDMId,
  };
}

/*
Provide an array of all DMs that the authorised user is part of

Arguments:
    token (string)  - represents the session of the user requesting a list of DMs

Return Value:
    Returns { dms } if no error
    Throws a 403 error on invalid token
*/
export function dmListV2(token: string) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  const userId = data.token[tokenIndex].uId;
  const dmsList = createListDMList(userId);

  return {
    dms: dmsList,
  };
}

/*
Removes an existing DM from the database

Arguments:
    token (string)  - represents the session of the user who is removing the DM
    dmId (number)   - dmId of existing DM

Return Value:
    Returns {} if no error
    Throws a 400 error on invalid dmId
    Throws a 403 error if token is invalid, the authorised user is not in the DM,
    or the authorised user is not the original DM creator
*/
export function dmRemoveV2(token: string, dmId: number) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  areArgumentsValidDMRemove(tokenIndex, dmId);
  const dmIndex = data.dm.findIndex(a => a.dmId === dmId);

  // Update analytics metrics
  const dmRemoveTime = Math.floor((new Date()).getTime() / 1000);

  for (const member of data.dm[dmIndex].members) {
    const userObj = data.user[data.user.findIndex(a => a.uId === member.uId)];
    const oldnumDmsJoined = userObj.dmsJoined[userObj.dmsJoined.length - 1].numDmsJoined;

    userObj.dmsJoined.push({
      numDmsJoined: oldnumDmsJoined - 1,
      timeStamp: dmRemoveTime,
    });
  }

  const workspaceObj = data.workspaceStats;
  const oldnumDmsExist = workspaceObj.dmsExist[workspaceObj.dmsExist.length - 1].numDmsExist;
  workspaceObj.dmsExist.push({
    numDmsExist: oldnumDmsExist - 1,
    timeStamp: dmRemoveTime,
  });

  // When a DM is removed, all the messages in it are also removed
  // and logged as one change in terms of analytics
  const oldnumMsgsExist = workspaceObj.messagesExist[workspaceObj.messagesExist.length - 1].numMessagesExist;
  workspaceObj.messagesExist.push({
    numMessagesExist: oldnumMsgsExist - data.dm[dmIndex].messages.length,
    timeStamp: dmRemoveTime,
  });

  // Remove the DM from the database
  data.dm.splice(dmIndex, 1);

  setData(data);

  return {};
}

/*
This function returns the name and members of a specified DM

Arguments:
    token (string): To ensure the caller is an authorised user
    dmId (number): To specify which DM it is

Return:
    Returns {error: 'error'} if the token is unauthorised or the dmId is invalid
    Returns the name and members of the specified DM if successful
*/

export function dmDetailsV2(token: string, dmId: number) {
  const data = getData();
  // checking if dmId is valid

  const dmIndex = data.dm.findIndex(a => a.dmId === dmId);

  if (dmIndex === -1) throw HTTPError(400, 'Invalid dmId');

  // checking that member is authorised user of DM

  const tokenIndex = data.token.findIndex(a => a.token === token);
  if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');

  const uId = data.token[tokenIndex].uId;
  const memberIndex = data.dm[dmIndex].members.findIndex(a => a.uId === uId);
  if (memberIndex === -1) throw HTTPError(403, 'Unauthorised access to DM');

  return { name: data.dm[dmIndex].name, members: data.dm[dmIndex].members };
}

/*
This function allows someone to leave a DM channel
Arguments:
    token (string): this argument is used to identify the member wanting to leave
    dmId (number): this argument is used to identify the DM channel

Reurns:
    {error: 'error'} if the token or dmId are invalid
    {} if successful
*/
export function dmLeaveV2(token: string, dmId: number) {
  const data = getData();

  // checking for valid dmId
  const dmIndex = data.dm.findIndex(channel => channel.dmId === dmId);
  if (dmIndex === -1) throw HTTPError(400, 'Invalid dmId');

  // checking that member is authorised user of DM
  const tokenIndex = data.token.findIndex(a => a.token === token);
  if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');

  const uId = data.token[tokenIndex].uId;
  const memberIndex = data.dm[dmIndex].members.findIndex(a => a.uId === uId);

  if (memberIndex === -1) throw HTTPError(403, 'Unauthorised access to DM');
  // removes member from members array in DM array
  data.dm[dmIndex].members.splice(memberIndex, 1);

  // Update analytics metrics
  const dmLeaveTime = Math.floor((new Date()).getTime() / 1000);
  const userObj = data.user[data.user.findIndex(a => a.uId === uId)];
  const oldnumDmsJoined = userObj.dmsJoined[userObj.dmsJoined.length - 1].numDmsJoined;
  userObj.dmsJoined.push({
    numDmsJoined: oldnumDmsJoined - 1,
    timeStamp: dmLeaveTime,
  });

  setData(data);

  return {};
}
