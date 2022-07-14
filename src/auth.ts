import { getData, setData } from './dataStore';
import { v4 as generateV4uuid, validate as validateV4uuid } from 'uuid';
import validator from 'validator';

interface ErrorType {
  error: 'error';
}

/* <checks if a uuid is in use and is of the correct structure>

Arguments:
uuid (string) - <any>
Return Value:
returns <true> on <valid uuid>
returns <false> on <in-use or inccorectly structured uuid> */
function isUuidValid(uuid: string) : boolean {
  if (!validateV4uuid(uuid)) {
    return false;
  }
  const dataSet = getData();
  for (const item of dataSet.token) {
    if (item.token === uuid) {
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
    uuid = generateV4uuid();
  }
  return uuid;
}

/* <Checks if a handle complies to the rules laid out in 6.2.2 of Iteration 1>

Arguments:
handle (string) - <minimum length 2, with posibility of >
Return Value:
returns <true> on <handle meeting requirements>
returns <false> on <handle not meeting requirements> */
export function isHandleValid(handle: string) : boolean {
  const regex = /^[a-z]{0,20}$[0-9]*/;
  return regex.test(handle);
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
  if (newHandle.length > 20) {
    newHandle = newHandle.slice(0, 20);
  }
  // test if handle is already in use, find highest number at the end
  let highestIndex = 0;
  let isDupplicate = false;
  for (const item of dataSet.user) {
    if (item.handle.search(newHandle) === 0) {
      if (item.handle.search(/[0-9]{1,}$/) === -1) {
        newHandle = newHandle + '0';
      } else {
        isDupplicate = true;
        const strDigit: string = newHandle.replace(/^[a-z]{0,20}/, '');
        if (parseInt(strDigit) > highestIndex) {
          highestIndex = parseInt(strDigit);
        }
      }
    }
  }

  if (isDupplicate) {
    highestIndex++;
    newHandle = newHandle + `${highestIndex}`;
  }
  return newHandle;
}

/* <Authorises a user to Login>

Arguments:
email (string) - <any>
password (string) - <any>
Return Value:
returns <true> on <email is valid>
returns <false> on <email is invalid> */
export function authLoginV1(email: string, password: string) : { authUserId: number, token: string } | ErrorType {
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
        return { error: 'error' };
      }
    }
  }
  // If no email matches the 1st argument
  return { error: 'error' };
}

/* <Creates a new user and fills out their details and puts it into "dataStore.js">

Arguments:
email (string) - <any>
password (string) - <greater than 5 characters long>
nameFirst (string) - <1-50 characters long>
nameLast (string) - <1-50 characters long>
Return Value:
returns <{ error: 'error' }> on <in valid arguments being inputted or already existing email>
returns <uID> on <if all arguments are valid and a user is created and store> */
export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  const dataSet = getData();
  // TEST DETAILS
  if ((password.length < 6) || (!validator.isEmail(email)) ||
    (doesEmailExist(email)) || (nameFirst.length < 1) ||
    (nameFirst.length > 50) || (nameLast.length < 1) || (nameLast.length > 50)) {
    return { error: 'error' };
  }

  // CREATE user Id
  const newUserId: number = dataSet.user.length + 1;

  // MAKE handle
  const newHandle = makeHandle(nameFirst, nameLast);

  // PEFORM RETURN & UPDATE "dataStore"
  let globalPermissions: number;
  if (dataSet.user === []) {
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
