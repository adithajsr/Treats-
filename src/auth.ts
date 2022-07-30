import { getData, setData } from './dataStore';
import { v4 as generateV4uuid, validate as validateV4uuid } from 'uuid';
import validator from 'validator';
import HTTPError from 'http-errors';
import { findTokenIndex } from './channels';

/* <checks if a uuid is in use and is of the correct structure>

Arguments:
uuid (string) - <any>
Return Value:
returns <true> on <valid uuid>
returns <false> on <in-use or inccorectly structured uuid> */
export function isUuidValid(uuid: string) : boolean {
  // this function is only called after a random uuidv4 is generated so it is unlikely to access line # and is impossible to access line $
  if (!validateV4uuid(uuid)) {
    // line $ is below
    return false;
  }
  const dataSet = getData();
  for (const item of dataSet.token) {
    if (item.token === uuid) {
      // line # is below
      return false;
    }
  }
  return true;
}

/* <cycles through making new uuid's until one is valid>

Arguments:
Return Value:
returns <uid> on <finding a valid uuid> */
function newUuid() {
  let uuid: string = generateV4uuid();
  while (!isUuidValid(uuid)) {
    // above function is only caleld here 'isUuidValid' and always* returns true because it is given a brand new random uuidv4 so below line cannot be accessed via coverage
    uuid = generateV4uuid();
  }
  return uuid;
}

/* <Checks if a email is already used by another user>

Arguments:
email (string) - <any>
Return Value:
returns <true> on <email is valid>
returns <false> on <email is invalid> */
export function doesEmailExist(email: string) : boolean {
  const dataSet = getData();
  for (const item of dataSet.user) {
    if (item.email === email) {
      return true;
    }
  }
  return false;
}

/* <Makes a new and valid handle>

Arguments:
nameFirst (string) - <1-50 characters long>
nameLast (string) - <1-50 characters long>
Return Value:
returns <newHandle: string> on <all cases> */
export function makeHandle(nameFirst: string, nameLast: string): string {
  const dataSet = getData();
  // make new handle
  const fullName: string = nameFirst + nameLast;
  let newHandle: string = fullName.toLowerCase();
  newHandle = newHandle.replace(/[^a-z0-9]/g, '');
  if (newHandle.length > 20) {
    newHandle = newHandle.slice(0, 20);
  }
  // test if handle is already in use, find highest number at the end
  let highestIndex = -2;
  let isDupplicate = false;
  for (const item of dataSet.user) {
    if (item.handle.search(newHandle) === 0) {
      if (item.handle.search(/[0-9]{1,}$/) === -1 && highestIndex < -1) {
        highestIndex = -1;
      } else {
        const strDigit: string = item.handle.replace(/^[a-z]{0,20}/, '');
        if (parseInt(strDigit) > highestIndex) {
          highestIndex = parseInt(strDigit);
        }
      }
      isDupplicate = true;
    }
  }

  if (isDupplicate) {
    highestIndex++;
    newHandle = newHandle + `${highestIndex}`;
  }
  return newHandle;
}

/* <Makes a new, valid and unique authUserId>

Arguments:
Return Value:
returns <uId: number> on <all cases> */
export function makeUserId(): number {
  const dataSet = getData();

  let highestUid = -1;
  for (const item of dataSet.user) {
    if (highestUid < item.uId) {
      highestUid = item.uId;
    }
  }

  highestUid++;
  return highestUid;
}

/* <Authorises a user to Login>

Arguments:
email (string) - <any>
password (string) - <any>
Return Value:
returns <return { authUserId: item.uId, token: uuid }> on <correct credentials for an existant user>
throws HTTP Error on <incorrect credentials> */
export function authLoginV1(email: string, password: string) : { authUserId: number, token: string } {
  const dataSet = getData();
  for (const item of dataSet.user) {
    if (item.email === email) {
      if (item.password === password) {
        // If both arguments match an account
        const uuid: string = newUuid();
        dataSet.token.push({
          token: uuid,
          uId: item.uId,
        });
        setData(dataSet);
        return {
          authUserId: item.uId,
          token: uuid,
        };
      } else {
        // If password doesn't match the email's
        throw HTTPError(400, 'password is not correct');
      }
    }
  }
  // If no email matches the 1st argument
  throw HTTPError(400, 'email entered does not belong to a user');
}

/* <Creates a new user and fills out their details and puts it into "dataStore.js">

Arguments:
email (string) - <any>
password (string) - <greater than 5 characters long>
nameFirst (string) - <1-50 characters long>
nameLast (string) - <1-50 characters long>
Return Value:
throws HTTP Error on <invalid arguments being inputted or already existing email>
returns <uID> on <if all arguments are valid and a user is created and store> */
export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  const dataSet = getData();
  // TEST DETAILS
  if ((password.length < 6) || (!validator.isEmail(email)) ||
    (doesEmailExist(email)) || (nameFirst.length < 1) ||
    (nameFirst.length > 50) || (nameLast.length < 1) || (nameLast.length > 50)) {
    throw HTTPError(400, 'invalid input details');
  }

  // CREATE user Id
  const newUserId: number = makeUserId();

  // MAKE handle
  const newHandle = makeHandle(nameFirst, nameLast);

  // PEFORM RETURN & UPDATE "dataStore"
  let globalPermissions: number;
  if (dataSet.user.length === 0) {
    globalPermissions = 1; // owner
  } else {
    globalPermissions = 2; // memeber
  }

  dataSet.user.push({
    uId: newUserId,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handle: newHandle,
    globalPerms: globalPermissions,
  });
  const uuid: string = newUuid();
  dataSet.token.push({
    token: uuid,
    uId: newUserId,
  });
  setData(dataSet);
  return {
    authUserId: newUserId,
    token: uuid,
  };
}

/*
Given an active token, invalidates the token to log the user out

Arguments:
    token (string)  - represents the session of the user who is logging out

Return Value:
    Returns {} if no error
    Throws a 403 error on invalid token
*/
export function authLogoutV2(token: string) {
  const data = getData();

  const tokenIndex = findTokenIndex(token);

  // Invalidate the token
  data.token.splice(tokenIndex, 1);

  setData(data);

  return {};
}
