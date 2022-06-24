function channelDetailsV1(authUserId, channelId) {
  return {
    name: 'secret candy crush team', 
    isPublic: true,
    ownerMembers: [],
    allMembers: [],
  };
}

function channelJoinV1(authUserId, channelId) {
  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  return {};
}

<<<<<<< HEAD

=======
>>>>>>> 325c57d9d0e567a16e83f661fdf4f6ad0aca98ad
function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [],
    start: 0,
    end: -1,
  };
}


export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
