import { getData, setData } from './dataStore';
import { isUuidValid } from './auth'; // doesEmailExist, isHandleValid
// import validator from 'validator';

/* This function returns the important information about a user's profile.

<authUserId> This function checks whether a valid authUserId is calling the function

<uId> This is the uId that is searched for to return the user's profile

Return Value:
{error: 'error'} if the authUserId or uId are invalid
{info} if the authUserId and uId are valid, returns
important info about a user's profile */

export function userProfileV1(token: string, uId: number) {
  const data = getData();
  // Determining whether token is valid
  let count = 0;
  for (const element of data.token) {
    if (token === element.token) {
      count = 1;
      break;
    }
  }

  // If invalid token
  if (count === 0) {
    return { error: 'error' };
  }

  // Searching for the uId
  for (const element in data.user) {
    if (uId === data.user[element].uId) {
      return {
        uId: data.user[element].uId,
        email: data.user[element].email,
        nameFirst: data.user[element].nameFirst,
        nameLast: data.user[element].nameLast,
        handleStr: data.user[element].handle
      };
    }
  }
  // If uId doesn't match any uId in data object
  return { error: 'error' };
}

/* <finds the relevent user and inputs the given data into the given key/field>

Arguments:
var1 (string) - <any>
token (string) - <uuidV4>
dataKey (string) - <names, email or handle>
var1 (string) - <optional>
Return Value:
returns <dataSet> on <success>
returns <{ error: 'error' }> on <invalid token/uId> */
function findAndSet(var1: string, token: string, dataKey: string, var2?: string) {
  const dataSet = getData();
  if (!isUuidValid(token)) {
    return { error: 'error' };
  }
  let uId: number;
  for (const item of dataSet.token) {
    if (item.token === token) {
      uId = item.uId;
    }
  }

  for (const user of dataSet.user) {
    if (user.uId === uId) {
      if (dataKey === 'names') {
        user.nameFirst = var1;
        user.nameLast = var2;
      } else {
        user.dataKey = var1;
      }
      return dataSet;
    }
  }
  return { error: 'error' };
}

/* <Update the authorised user's first and last name>

Arguments:
nameFirst (string) - <1-50 characters long>
nameLast (string) - <1-50 characters long>
Return Value:
returns <'empty'> on <success>
^ !!! convert return to {} !!! ^
returns <{ error: 'error' }> on <invalid arguments> */
export function userProfileSetName(token: string, nameFirst: string, nameLast: string) {
  if ((nameFirst.length < 1) || (nameFirst.length > 50) ||
      (nameLast.length < 1) || (nameLast.length > 50)) {
    return { error: 'error' };
  }
  const result = findAndSet(nameFirst, token, 'names', nameLast);
  if (result === { error: 'error' }) {
    return result;
  } else {
    setData(result);
    return {};
  }
}
