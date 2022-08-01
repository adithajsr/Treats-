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
  const { user } = data;

  // check if uId refers to a valid user - 400
  if (user.find(a => a.uId === uId) === undefined) throw HTTPError(400, 'uId is not valid user!');

  // check if token user is a global owner - 403
  const tokenId = user.findIndex(a => a.uId === uId);
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



  return {};
}