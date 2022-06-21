function channelJoinV1( authUserId, channelId ) {
  return 'authUserId' + 'channelId';
}

function channelInviteV1(authUserId, channelId, uId) {
  return 'authUserId' + 'channelId'+ 'uId';
}

function channelDetailsV1(authUserId, channelId) {
  return {
    name: 'secret candy crush team', 
    isPublic: true,
    ownerMembers: [],
    allMembers: [],
  };
}


function channelMessagesV1(authUserId, channelId, start) {
  return 'authUserId' + 'channelId' + 'start'
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };

