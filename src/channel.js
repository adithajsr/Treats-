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
    const {channel} = data; // extracts channel array from data
    let i = data.channel.findIndex(data => data.channelId === channelId); // find index in the array of the channel being checked.
    const {members} = channel[i]; //extracts members array from selected channel
    const owners = members.filter(data => data.channelPerms === 'owner'); // creates a new array holding any user that has permissions owner.
    const details = {
      name: channel[i].channelName,
      isPublic: channel[i].isPublic,
      ownerMembers: owners.map(owners => ({uId: owners.uId,
                                             email: owners.email,
                                             nameFirst: owners.nameFirst,
                                             nameLast: owners.nameLast,
                                             handleStr: owners.handleStr})),
      allMembers:   members.map(members => ({uId: members.uId,
                                             email: members.email,
                                             nameFirst: members.nameFirst,
                                             nameLast: members.nameLast,
                                             handleStr: members.handleStr}))
    }
    return details; //an object
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