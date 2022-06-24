import { getData, setData } from './dataStore'

function memberExists(channelId, uId) {
  var uid_search = null;
  let data = getData();
  const {channel} = data;
  const channel_search = channel.find(data => data.channelId === channelId);
  if (channel_search != null) {
    const {members} = channel_search;
    var uid_search = members.find(data => data.uId === uId);
  }
  return (uid_search != null) ? "true" : "false";
}

function channelExists(channelId) {
  let data = getData();
  const {channel} = data;
  const search = channel.find(data => data.channelId === channelId);
  return (search != null) ? "true" : "false";
}


function channelDetailsV1(authUserId, channelId) {
  if (channelExists(channelId) === "false" ||
    memberExists(channelId, authUserId) === "false") {
    return {error: 'error'};
  } else {
    let data = getData();
    const {channel} = data;
    const {user} = data;
    let i = data.channel.findIndex(data => data.channelId === channelId);
    const {members} = channel[i];
    let searchId = members.map(a => a.uId);
    let userInfo = user.filter(({uId}) => searchId.includes(uId));
    const owners = userInfo.filter(data => data.channelPerms === 'owner');
    const details = {
      name: channel[i].channelName,
      isPublic: channel[i].isPublic,
      ownerMembers: owners.map(owners => ({uId: owners.uId,
                                             email: owners.email,
                                             nameFirst: owners.nameFirst,
                                             nameLast: owners.nameLast,
                                             handleStr: owners.handleStr})),
      allMembers:   userInfo.map(userInfo => ({uId: userInfo.uId,
                                             email: userInfo.email,
                                             nameFirst: userInfo.nameFirst,
                                             nameLast: userInfo.nameLast,
                                             handleStr: userInfo.handleStr}))
    }
    return details;
  }
}


function channelJoinV1(authUserId, channelId) {
  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  return {};
}

function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [],
    start: 0,
    end: -1,
  };
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };