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
  if (isNaN(authUserId) === true || authUserId === '') {
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
// function channelsListallV1(authUserId){
//   //probs needs to check whether authUserId is valid. IDK wasn't clear from documentation.
//   let data = getData();
//   const {channel} = data; // extracts channel array from data
//   //creates a new array with the keys extracted from channels array. The new key names have been done to match brief.
//   const result = channel.map(channel => ({channelId: channel.channelId, name: channel.channelName}));
//   return { channels: result }; //an array of channel information containing keys channelId and channelName
// }

  
export { channelsCreateV1, channelsListV1, channelsListallV1 };