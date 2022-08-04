import { getData, setData } from './dataStore';
import { v4 as generateV4uuid } from 'uuid';
import validator from 'validator';
import HTTPError from 'http-errors';
import crypto from 'crypto';
// eslint-disable-next-line
// @ts-ignore
import codec from 'string-codec';
import nodemailer from 'nodemailer';
import { findTokenIndex } from './channels';
import config from './config.json';

const url = config.url;
const port = config.port;
const SECRET = 'AERO';

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

  let highestUid = 0;
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
      if (item.password === crypto.createHash('sha256', SECRET + password)) {
        // If both arguments match an account
        const uuid: string = crypto.createHash('sha256', SECRET + generateV4uuid());
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
Also creates the first data points for all user analytics metrics

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

  // Create the first data points for all analytics metrics
  const accountCreationTime = Math.floor((new Date()).getTime() / 1000);
  const firstChannelJoined = {
    numChannelsJoined: 0,
    timeStamp: accountCreationTime,
  };
  const firstDMJoined = {
    numDmsJoined: 0,
    timeStamp: accountCreationTime,
  };
  const firstMessageSent = {
    numMessagesSent: 0,
    timeStamp: accountCreationTime,
  };

  dataSet.user.push({
    uId: newUserId,
    email: email,
    password: crypto.createHash('sha256', SECRET + password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    handle: newHandle,
    profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    globalPerms: globalPermissions,
    notifications: [],
    channelsJoined: [firstChannelJoined],
    dmsJoined: [firstDMJoined],
    messagesSent: [firstMessageSent],
    involvementRate: 0,
    shouldRetrieve: true
  });

  const uuid: string = crypto.createHash('sha256', SECRET + generateV4uuid());
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

/* <Checks if a uId has an associated token already in the database>

Arguments:
uId (number) - <positive integer>
Return Value:
returns <boolean> on <depending on existence of uId in token array> */
function isInSession(uId: number) : boolean {
  const dataSet = getData();
  for (const item of dataSet.token) {
    if (item.uId === uId) {
      return true;
    }
  }
  return false;
}

/* <Sends an encrypted code to a given email>

Arguments:
email (string) - <any>
encryptedCode (string) - <an encrpted combination of a uuid and uId> */
function sendEmail(email: string, encryptedCode: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'm13a.areo@gmail.com',
      pass: 'gkkuhqgntyfjulsq', // M13A_AERO
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
  });

  const mailOptions = {
    from: 'M13A_AERO <m13a.areo@gmail.com>',
    to: `User <${email}>`,
    subject: 'Password Reset Request',
    text: `Reset code is ${encryptedCode}`,
  };

  transporter.sendMail(mailOptions, function(err, success) {
    if (err) {
      // only be able to cover line below if server was down or invalid email, however other fns stop the latter from happening
      console.log(err);
    } else {
      console.log('Email sent successfully!');
    }
  });
}

/* <Checks for a valid email, to which the user associated is logged out>

Arguments:
email (string) - <email structure>
Return Value:
returns <{}> on <all cases for security reasons> */
export function passwordRequest(email: string) {
  const dataSet = getData();
  for (const item of dataSet.user) {
    if (item.email === email && !isInSession(item.uId)) {
      const uuidV4Code = generateV4uuid();
      const passwordUid = -1 * item.uId;
      const encryptedCode = codec.encoder(String(uuidV4Code + String(passwordUid)), 'base64');
      sendEmail(email, encryptedCode);
      dataSet.token.push({
        token: uuidV4Code,
        uId: passwordUid,
      });
      setData(dataSet);
      return {};
    }
  }
  return {};
}

/* <Checks for a valid resetCode, to which the user associated gets their password replaced and the resetCode expires>

Arguments:
resetCode (string) - <encrypted uId and uuid>
newPassword (string) - <greater then or equal to 6 in length>
Return Value:
throws HTTP Error on <invalid newPassword or wrong resetCode>
returns <{}> on <changed password> */
export function passwordReset(resetCode: string, newPassword: string) {
  const dataSet = getData();
  if (newPassword.length < 6) {
    throw HTTPError(400, 'password entered is less than 6 characters long');
  }
  const decryptedCode = codec.decoder(resetCode, 'base64');
  const uId = decryptedCode.replace(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}-/i, '');
  const tokenCode = decryptedCode.replace('-' + uId, '');

  for (const i in dataSet.token) {
    if (dataSet.token[i].token === tokenCode && dataSet.token[i].uId === Number('-' + uId)) {
      // above condition cannot be accessed except through the email, therefore coverage can't get here
      for (const user of dataSet.user) {
        if (user.uId === Number(uId)) {
          user.password = crypto.createHash('sha256', SECRET + newPassword);
          dataSet.token.splice(Number(i), 1);
          setData(dataSet);
          return {};
        }
      }
    }
  }
  throw HTTPError(400, 'resetCode is not a valid reset code');
}
