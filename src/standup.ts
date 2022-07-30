import { getData, setData } from './dataStore';
import { checkToken } from './message';
import HTTPError from 'http-errors';

/*
Starts a standup period lasting length seconds

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  channelId (number)     - channelId of the channel the stand up is being sent to
  length (number)        - length of the stand up

Return Value:
  Returns { timeFinish } if standup completed
  Throws a 400 error    - if channelId doesn't refer to a valid channel
                        - length is a negative integer
                        - an active standup is currently running in the channel
  Throw a 403 error     - channelId was valid but auth user wasn't a member of channel
*/
export function standupStartV1(token: string, channelId: number, length: number) {
  let timeFinish;

  return { timeFinish: timeFinish};
}

/*
Sends a message to get buffered in the stand up queue if a standup is active in channel

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  channelId (number)     - channelId of the channel the stand up is being sent to

Return Value:
  Returns { isActive } if standup is in progress
  Returns { timeFinish } if standup is in progress
  Throws a 400 error    - if channelId doesn't refer to a valid channel
  Throw a 403 error     - channelId was valid but auth user wasn't a member of channel
*/
export function standupActiveV1(token: string, channelId: number) {
  let timeFinish;
  let isActive;

  return { 
    isActive: isActive,
    timeFinish: timeFinish
  };
}

/*
Sends a message to get buffered in the stand up queue if a standup is active in channel

Arguments:
  token (string)         - represents the session of the user who is creating the channel
  channelId (number)     - channelId of the channel the stand up is being sent to
  message (string)       - message being sent in standup

Return Value:
  Returns { } if standup successfully sent
  Throws a 400 error    - if channelId doesn't refer to a valid channel
                        - length of message is over 1000 characters
                        - an active standup is currently running in the channel
  Throw a 403 error     - channelId was valid but auth user wasn't a member of channel
*/
export function standupSendV1(token: string, channelId: number, message: string) {

  return {};
}