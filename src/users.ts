import { getData, setData } from './dataStore';
import { doesEmailExist } from './auth';
import validator from 'validator';
import HTTPError from 'http-errors';

/* This function returns the important information about a user's profile.

<authUserId> This function checks whether a valid authUserId is calling the function

<uId> This is the uId that is searched for to return the user's profile

Return Value:
{error: 'error'} if the authUserId or uId are invalid
{info} if the authUserId and uId are valid, returns
important info about a user's profile */

export function userProfileV3(token: string, uId: number) {
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
    throw HTTPError(403, 'Invalid token');
  }

  // Searching for the uId
  for (const element in data.user) {
    if (uId === data.user[element].uId) {
      return {
        uId: data.user[element].uId,
        email: data.user[element].email,
        nameFirst: data.user[element].nameFirst,
        nameLast: data.user[element].nameLast,
        handleStr: data.user[element].handle,
      };
    }
  }

  // If uId doesn't match any uId in data object
  throw HTTPError(400, 'Invalid uId');
}

/* <checks if a Token is in use>

Arguments:
token (string) - <uuidV4>
Return Value:
returns <true> on <existing token>
returns <false> on <non-existant token> */
function doesTokenExist(token: string) : boolean {
  const dataSet = getData();
  for (const item of dataSet.token) {
    if (item.token === token) {
      return true;
    }
  }
  return false;
}

/* <checks if a handle is valid and unique>

Arguments:
handleStr (string) - <handle>
Return Value:
returns <true> on <unique and valid handle>
returns <false> on <existant or invalid handle> */
function isHandleAllowed(handleStr: string) : boolean {
  const dataSet = getData();
  for (const item of dataSet.user) {
    if (item.handle === handleStr) {
      return false;
    }
  }
  const regex = /^[a-z0-9]{0,20}$/i;
  return regex.test(handleStr);
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
  if (!doesTokenExist(token)) {
    throw HTTPError(403, 'Invalid token');
    return;
  }
  // uuid assiociated to token is found here
  let uId: number;
  for (const item of dataSet.token) {
    if (item.token === token) {
      uId = item.uId;
    }
  }

  // that uuid is then used to fund associated user
  for (const user of dataSet.user) {
    if (user.uId === uId) {
      if (dataKey === 'names') {
        user.nameFirst = var1;
        user.nameLast = var2;
      } else if (dataKey === 'email') {
        user.email = var1;
      } else if (dataKey === 'handle') {
        user.handle = var1;
      }
      setData(dataSet);
      return {};
    }
  }
  // this below line cannot be accessed for coverage if uuid in token object is a valid uId, in other words, no way of running this line in working code
  throw HTTPError(403, 'Invalid token');
  return;
}

/* <Update the authorised user's first and last name>

Arguments:
nameFirst (string) - <1-50 characters long>
nameLast (string) - <1-50 characters long>
Return Value:
returns <'empty'> on <success>
returns <{ error: 'error' }> on <invalid arguments> */
export function userProfileSetName(token: string, nameFirst: string, nameLast: string) {
  if ((nameFirst.length < 1) || (nameFirst.length > 50) ||
      (nameLast.length < 1) || (nameLast.length > 50)) {
        throw HTTPError(400, 'invalid input details');
        return;
  }
  return findAndSet(nameFirst, token, 'names', nameLast);
}

/* <Update the authorised user's email address>

Arguments:
email (string) - <valid email string>
Return Value:
returns <void> on <success>
returns <{ error: 'error' }> on <invalid arguments> */
export function userProfileSetEmail(token: string, email: string) {
  if ((!validator.isEmail(email)) || (doesEmailExist(email))) {
    throw HTTPError(400, 'invalid input details');
    return;
  }
  return findAndSet(email, token, 'email');
}

/* <Update the authorised user's email address>

Arguments:
newHandle (string) - <any>
Return Value:
returns <void> on <success>
returns <{ error: 'error' }> on <invalid arguments> */
export function userProfileSetHandle(token: string, handleStr: string) {
  if ((handleStr.length < 3) || (handleStr.length > 20) ||
      !isHandleAllowed(handleStr)) {
    throw HTTPError(400, 'invalid input details');
    return;
  }
  return findAndSet(handleStr, token, 'handle');
}

/* <Gets a list of all users>

Arguments:
token (string) - <uuidV4>
Return Value:
returns <an array of users with their uId, email, full name and handle> on <success>
returns <{ error: 'error' }> on <invalid token> */
export function usersAll() {
  const dataSet = getData();
  const returnObject = [];
  for (const item of dataSet.user) {
    returnObject.push({
      uId: item.uId,
      email: item.email,
      nameFirst: item.nameFirst,
      nameLast: item.nameLast,
      handleStr: item.handle,
    });
  }
  return { users: returnObject };
}
