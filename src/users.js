import { getData } from './dataStore';

export function userProfileV1(authUserId, uId) {
  let data = getData();
  for (const element in data.user) {
    if (uId === data.user[element].uId) {
      return data.user[element];
    }
  }
  // If uId doesn't match any uId in data object
  return { error: 'error' };
}