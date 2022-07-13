import { getData, setData } from './dataStore';

const validator = require('validator');

/* <Checks if a handle complies to the rules laid out in 6.2.2 of Iteration 1>

Arguments:
    handle (string) - <minimum length 2, with posibility of >
Return Value:
    Returns <true> on <handle meeting requirements>
    Returns <false> on <handle not meeting requirements> */
export function isHandleValid(handle: string) {
  const regex = /^[a-z]{0,20}$[0-9]*/;
  return regex.test(handle);
}

/* <Checks if a email is already used by another user>

Arguments:
    email (string) - <any>
Return Value:
    Returns <true> on <email is valid>
    Returns <false> on <email is invalid> */
export function doesEmailExist(email: string) {
  const dataSet = getData();
  for (const item of dataSet.user) {
    if (item.email === email) {
      return true;
    }
  }
  return false;
}

/* <Authorises a user to >

Arguments:
    email (string) - <any>
Return Value:
    Returns <true> on <email is valid>
    Returns <false> on <email is invalid> */
export function authLoginV1 (email: string, password: string) {
  const dataSet = getData();
  for (const item of dataSet.user) {
    if (item.email === email) {
      if (item.password === password) {
        // If both arguments match an account
        return { authUserId: item.uId };
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
    Returns <{ error: 'error' }> on <in valid arguments being inputted or already existing email>
    Returns <uID> on <if all arguments are valid and a user is created and store> */
export function authRegisterV1 (email: string, password: string, nameFirst: string, nameLast: string) {
  const dataSet = getData();
  // TEST DETAILS
  if (password.length < 6) {
    return { error: 'error' };
  }
  if (!validator.isEmail(email)) {
    return { error: 'error' };
  }
  if (doesEmailExist(email)) {
    return { error: 'error' };
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'error' };
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'error' };
  }

  // CREATE user Id
  const newUserId = dataSet.user.length + 1;

  // MAKE HANDLE
  const fullName = nameFirst + nameLast;
  let newHandle = fullName.toLowerCase();
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
        const strDigit = newHandle.replace(/^[a-z]{0,20}/, ' ');
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

  // PEFORM RETURN & UPDATE "dataStore"
  let globalPermissions;
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
  setData(dataSet);
  return { authUserId: newUserId };
}
