import { getData, setData, message } from './dataStore';
import { checkToken, tokenToUid } from './message';
import HTTPError from 'http-errors';

interface Database {
  user: any[];
  channel: any[];
  token: any[];
  dm: any[];
}

/*
Checks if channelId is valid and if a uId

Arguments:
  channelId (number)      - channelId in question
  uId(number)             - uId of person to check if existing in channel
  data (Database)         - database to inspect

Return Value:
  Throws a 400 error    - if channelId doesn't refer to a valid channel
  Throw a 403 error     - channelId was valid but auth user wasn't a member of channel
*/
export function checkChannelMemberExist(channelId: number, uId: number, data: Database) {
  if (data.channel.find(a => a.channelId === channelId) === undefined) {
    throw HTTPError(400, 'invalid channelId');
    // check for user in channel
  } else {
    const i = data.channel.findIndex(data => data.channelId === channelId);
    if (data.channel[i].members.find((a: any) => a.uId === uId) === undefined) {
      throw HTTPError(403, 'auth user is not a member!');
    }
  }
}

/*
Packages messages received from standups and pushes it to the message queue to the channel

Arguments:
  channelIndex (number) - index of the channel the stand up is sent to
  timeSent (number) - time the standup will be sent
  uId (number) - uId of the person that started the standup

Return Value:
  Returns nothing
*/

function doStandupStart(channelIndex: number, timeSent: number, uId: number) {
  const data = getData();
  const { channel } = data;
  let messageString = '';
  for (let i = 0; i < channel[channelIndex].queue.length; i++) {
    if (i === channel[channelIndex].queue.length - 1) {
      messageString += channel[channelIndex].queue[i];
    } else {
      messageString += channel[channelIndex].queue[i] + '\n';
    }
  }

  const packageMessage: message = {
    messageId: Math.floor(Math.random() * 1000),
    uId: uId,
    message: messageString,
    timeSent: timeSent,
    isPinned: 0,
    reacts: [],
  };

  channel[channelIndex].messages.push(packageMessage);
  channel[channelIndex].isActive = false;
  channel[channelIndex].isActiveUid = -1;
  channel[channelIndex].standupFinish = 0;
  channel[channelIndex].queue = [];

  setData(data);
}

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
  const timeFinish = (Math.floor((new Date()).getTime() / 1000)) + length;
  if (length < 0) throw HTTPError(400, 'invalid length for stand up!');
  const data = getData();
  checkToken(token, data);
  const uId = tokenToUid(token, data);
  const { channel } = data;
  checkChannelMemberExist(channelId, uId, data);

  const i = data.channel.findIndex(channel => channel.channelId === channelId);

  if (standupActiveV1(token, channelId).isActive === true) throw HTTPError(400, 'standup already in progress!');

  setTimeout(doStandupStart, length * 1000, i, timeFinish, uId, data);
  channel[i].isActive = true;
  channel[i].isActiveUid = uId;
  channel[i].standupFinish = timeFinish;

  setData(data);
  return { timeFinish: timeFinish };
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
  const data = getData();
  checkToken(token, data);
  const uId = tokenToUid(token, data);
  checkChannelMemberExist(channelId, uId, data);

  const i = data.channel.findIndex(channel => channel.channelId === channelId);

  return {
    isActive: data.channel[i].isActive,
    timeFinish: data.channel[i].standupFinish
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
let standupMessage: string;
export function standupSendV1(token: string, channelId: number, message: string) {
  if (message.length > 1000) throw HTTPError(403, 'length of standup message is over 1000!');

  const data = getData();
  checkToken(token, data);
  const uId = tokenToUid(token, data);
  const { channel } = data;
  checkChannelMemberExist(channelId, uId, data);

  if (standupActiveV1(token, channelId).isActive === false) throw HTTPError(400, 'standup not active!');

  const i = channel.findIndex(channel => channel.channelId === channelId);

  // find handle
  const handleIndex = data.user.findIndex(user => user.uId === uId);
  const handle = data.user[handleIndex].handle;

  standupMessage = handle + ': ' + message;
  channel[i].queue.push(standupMessage);
  setData(data);
  return {};
}
