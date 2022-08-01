import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

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

  // check if token valid - 403

  // check if uId refers to a valid user - 400

  // check if token user is a global owner - 403

  // check if uId is the only global owner - 400



  return {};
}