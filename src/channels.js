import { getData, setData } from './dataStore';

function channelsCreateV1(authUserId, name, isPublic) {
    return {
      channelId: 1,
    };
  }
  
function channelsListV1(authUserId) {
  return {
    channels: [] // see interface for contents
  };
}

function channelsListallV1(authUserId) {
  const data = getData();
  let foundChannels = [];

  // invalid authUserId
  if (isNaN(authUserId) === true) {
    return { error: 'error' }
  }

  // check if any channels in data
  if (data.channel.length <= 0) {
    return foundChannels;
  }

  for (const i in data.channel) {
    foundChannels.push({channelId: data.channel[i].channelId, name: data.channel[i].channelName});
  }

  return {
    channels: foundChannels // see interface for contents
  };
}
  
export { channelsCreateV1, channelsListV1, channelsListallV1 };