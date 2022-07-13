import { getData, setData } from './dataStore';

// TODO: documentation
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

// TODO: Documentation
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
function dmCreateV1(token: string, uIds: number[]) {
  // TODO: use helper functions

  const data = getData();

  const tokenIndex = data.token.findIndex(a => a.token === token);

  // Invalid token
  if (tokenIndex === -1) {
    return { error: 'error' };
  }

  const creatoruId = data.token[tokenIndex].uId;

  // Any uId does not refer to a valid user
  for (const uId of uIds) {
    if (data.user.find(a => a.uId === uId) === undefined) {
      // Invalid uId
      return { error: 'error' };
    } else if (uId === creatoruId) {
      // uIds should not include the creator
      return { error: 'error' };
    }
  }

  // Duplicate uId's in uIds
  if (hasDuplicates(uIds) === true) {
    return { error: 'error' };
  }

  // Generate dmId
  const newDMId = data.dm.length + 1;

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

export { dmCreateV1 };
