import { getData, setData } from './dataStore.js';

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

{/* <channelsListallV1 returns an array of all channels, regardless of whether they
  are public or private, when initiated by a valid authUserId>

Arguments:
    <authUserId> (<integer>)    - <The authUserId is the user who initates the function>

Return Value:
    Returns <[{channel}]> on <authUserId was valid and there were channels in data>
    Returns <[]> on <no channels in data>  
    Returns <[{ error: error }]> on <inappropriate or invalid authUserId> */}


function channelsListallV1(authUserId) {
  const data = getData();
  let foundChannels = [];

  // inappropriate authUserId
  if (isNaN(authUserId) === true || authUserId === '') {
    return { error: 'error' }
  }

  // user not in database
  if (data.user.find(a => a.uId === authUserId) === undefined) {
    return { error: 'error' };
  }

  // check if any channels in data
  if (data.channel.length <= 0) {
    return foundChannels;
  }

  // const {channel} = data;
  // if (channel.length <= 0) {
  //   return foundChannels;
  // }

  // let data = getData();
  // const {channel} = data; // extracts channel array from data
  // //creates a new array with the keys extracted from channels array. The new key names have been done to match brief.
  // const result = channel.map(channel => ({channelId: channel.channelId, name: channel.name}));
  // return { channels: result }; //an array of channel information containing keys channelId and channelName

  for (const i in data.channel) {
    foundChannels.push({channelId: data.channel[i].channelId, name: data.channel[i].name});
  }

  return {
    channels: foundChannels 
  };
}
  
export { channelsCreateV1, channelsListV1, channelsListallV1 };