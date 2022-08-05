import { getData } from './dataStore';
import HTTPError from 'http-errors';

/*
Searches through all channels/DMs user is part of to find messages that include the query string

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  queryStr (string)      - represents the message the user wants searched

Return Value:
  Returns messages (array of objects including the message string) if successful
  Throws a 403 error if token is invalid
*/
export function searchV1(token: string, queryStr: string) {
  const data = getData();

  if (queryStr.length < 1 || queryStr.length > 1000) throw HTTPError(400, 'Invalid length');

  // finding correct user
  const tokenIndex = data.token.findIndex(a => a.token === token);
  if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');
  const uId = data.token[tokenIndex].uId;

  const messages = [];

  for (const element of data.channel) {
    const memberIndex = element.members.findIndex(a => a.uId === uId);
    if (memberIndex !== -1) {
      for (const element2 of element.messages) {
        if (element2.message.toLowerCase().includes(queryStr.toLowerCase()) === true) messages.push(element2);
      }
    }
  }

  for (const element of data.dm) {
    const memberIndex = element.members.findIndex(a => a.uId === uId);
    if (memberIndex !== -1) {
      for (const element2 of element.messages) {
        if (element2.message.toLowerCase().includes(queryStr.toLowerCase()) === true) messages.push(element2);
      }
    }
  }
  return { messages };
}
