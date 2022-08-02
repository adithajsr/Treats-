import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { checkToken, tokenToUid } from './message';

/*
Arguments:
  token (string)         - represents the session of the user who is creating the channel
  uId (number)         - uId of user to remove

Return Value:
  Returns {}      -  successful user removal

Throws Error:
  403 - invalid token
      - the authorised user is not a global owner
  400 - uId does not refer to a valid user
      - uId refers to a user to is the only global owner
*/

export function adminUserRemoveV1(token: string, uId: number) {
  const data = getData();
  checkToken(token, data);
  const tokenUid = tokenToUid(token, data);
  const { user } = data;
  const { channel } = data;
  const { dm } = data;

  // check if uId refers to a valid user - 400
  if (user.find(a => a.uId === uId) === undefined) throw HTTPError(400, 'uId is not valid user!');

  // check if token user is a global owner - 403
  const tokenId = user.findIndex(a => a.uId === tokenUid);
  if (user[tokenId].globalPerms !== 1) throw HTTPError(403, 'token user is not a global owner!');

  // check if uId is the only global owner - 400
  const uIdindex = user.findIndex(a => a.uId === uId);
  let globalPermNumber = 0;
  for (const i in user) {
    if (user[i].globalPerms === 1) {
      globalPermNumber++;
    }
  }
  if (user[uIdindex].globalPerms === 1 && globalPermNumber < 2) throw HTTPError(400, 'uId is only global owner!');

  // edit user object
  user[uIdindex].globalPerms = 3;
  user[uIdindex].nameFirst = 'Removed';
  user[uIdindex].nameLast = 'user';
  user[uIdindex].shouldRetrieve = false;
  user[uIdindex].email = '';
  user[uIdindex].handle = '';

  let memberIndex;

  // edit channel object
  for (const i in channel) {
    for (let j = 0; j < channel[i].members.length; j++) {
      // if a member is in the channel
      if (channel[i].members.find(a => a.uId === uId)) {
        // change all messages
        for (const k in channel[i].messages) {
          if (channel[i].messages[k].uId === uId) {
            channel[i].messages[k].message = 'Removed user';
          }
        }
        memberIndex = channel[i].members.findIndex(a => a.uId === uId);
        channel[i].members.splice(memberIndex, 1);
      } 
    }
  }

  // edit dm object
  for (const i in dm) {
    for (let j = 0; j < dm[i].members.length; j++) {
      // if a member is in the dm
      if (dm[i].members.find(a => a.uId === uId)) {
        // change all messages
        for (const k in dm[i].messages) {
          if (dm[i].messages[k].uId === uId) {
            dm[i].messages[k].message = 'Removed user';
          }
        }
        memberIndex = dm[i].members.findIndex(a => a.uId === uId);
        dm[i].members.splice(memberIndex, 1);
      } 
    }
  }

  // edit token object
  const tokenIndex = data.token.findIndex(a => a.uId === uId);
  data.token.splice(tokenIndex, 1);

  setData(data);
  return {};
}
