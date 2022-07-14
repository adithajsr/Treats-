import { getData, setData } from './dataStore';

interface dmMember {
  uId: number,
  dmPerms: number,
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
  dmName += -String(', ');

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
    Returns false if arguments are invalid
*/
const areArgumentsValidDMRemove = (tokenIndex: number, dmId: number) => {
  const data = getData();

  // Invalid token
  if (tokenIndex === -1) {
    return false;
  }

  const dmIndex = data.dm.findIndex(a => a.dmId === dmId);
  // Invalid dmId
  if (dmIndex === -1) {
    return false;
  }

  const useruId = data.token[tokenIndex].uId;
  const memberIndex = data.dm[dmIndex].members.findIndex(a => a.uId === useruId);
  if (memberIndex === -1) {
    // Authorised user is not in the DM
    return false;
  } else if (data.dm[dmIndex].members[memberIndex].dmPerms !== 1) {
    // Authorised user is in the DM but is not the creator
    return false;
  }

  return true;
};

/*
Creates a new DM with the creator as the owner of the DM

Arguments:
    token (string)    - represents the session of the user who is creating the DM
    uIds (number[])   - name of new channel

Return Value:
    Returns { dmId } if no error
    Returns { error: 'error' } on invalid token or invalid uIds
*/
function dmCreateV1(token: string, uIds: number[]) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  // Invalid token
  if (tokenIndex === -1) {
    return { error: 'error' };
  }

  const creatoruId = data.token[tokenIndex].uId;

  if (areUIdsValidDMCreate(uIds, creatoruId) === false) {
    return { error: 'error' };
  }

  const newDMId = data.dm.length + 1;
  const dmMembers = createMembersListDMCreate(uIds, creatoruId);
  const dmName = createNameDMCreate(dmMembers);

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
    Returns { error: 'error' } on invalid token
*/
function dmListV1(token: string) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  // Invalid token
  if (tokenIndex === -1) {
    return { error: 'error' };
  }

  const userId = data.token[tokenIndex].uId;
  const dmsList = createListDMList(userId);

  return {
    dms: dmsList,
  };
}

/*
Removes all members from an existing DM

Arguments:
    token (string)  - represents the session of the user who is removing the DM
    dmId (number)   - dmId of existing DM

Return Value:
    Returns {} if no error
    Returns { error: 'error' } on invalid token, invalid dmId, or invalid user
*/
function dmRemoveV1(token: string, dmId: number) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  if (areArgumentsValidDMRemove(tokenIndex, dmId) === false) {
    return { error: 'error' };
  }

  // Remove all members from the DM
  const dmIndex = data.dm.findIndex(a => a.dmId === dmId);
  data.dm[dmIndex].members = [];

  setData(data);

  return {};
}

export { dmCreateV1, dmListV1, dmRemoveV1 };
