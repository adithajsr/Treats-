import { getData, setData } from './dataStore'


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
    const owners = userInfo.filter(data => data.channelPerms === 1);
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


/*Description: Invites user to the channel
Arguments:
  <authUserId> (integer)    - <The authUserId is the user who initates the function>
  <channelId> (integer)    - <The channelId of the channel which is getting the new user.>
  <uId> (integer)    - <The uId of the person being added to the channel.>

Return Value:
  Returns <{}> on <successfully added user to channel>
  Returns <{error: 'error'}> on <user was not added due to failing an error test>
*/  
function channelInviteV1(authUserId, channelId, uId) {
  if (channelExists(channelId) === "false" ||
      uIdExists(uId) === "false" ||
      memberExists(channelId, uId) === "true" ||
      memberExists(channelId, authUserId) === "false")
  {
    return {error: "error"};
  } else {
    let data = getData();
    const new_user = {uId: uId,channelPerms: 'member'};
    let i = data.channel.findIndex(data => data.channelId === channelId);
    data.channel[i].members.push(new_user);
    setData(data);
    return {};
  }
}

//Defined numbers.
const GLOBAL = 1;

//Functions being tested
/*Description: Checks whether a Uid is a member of a channel
Arguments:
    <channelId> (integer)    - <The channelId of the channel thats being checked.>
    <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
    Returns <true> on <uId is found in the channel.>
    Returns <false> on <uId was not found in the channel.>
*/
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

/*Description: Checks whether a chanel exists in the database
Arguments:
  <channelId> (integer)    - <The channelId of the channel thats being checked.>
Return Value:
  Returns <true> on <Channel is found.>
  Returns <false> on <Channel was not found.>
*/
function channelExists(channelId) {
  let data = getData();
  const {channel} = data;
  const search = channel.find(data => data.channelId === channelId);
  return (search != null) ? "true" : "false";
}

/*Description: Checks whether a user  exists in the database
Arguments:
  <uId> (integer)    - <The uId of the user thats being checked.>
Return Value:
  Returns <true> on <uId is found.>
  Returns <false> on <uId was not found.>
*/
function uIdExists(uId) {
    let data = getData();
    const {user} = data;
    const search = user.find(data => data.uId === uId);
    return (search != null) ? "true" : "false";
}

/*Description: Checks what the channel permissions are of a user
Arguments:
  <channelId> (integer)    - <The channelId of the channel thats being checked.>
  <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
  Returns <permissions> if <user is found, its permissions are returned as a string. ie 'member'>
  Returns <invalid> on <uId was not found in the channel.>
*/
function channelPermissions(channelId, uId) {
  var uid_search = null;
  let data = getData();
  const {channel} = data;
  const channel_search = channel.find(data => data.channelId === channelId);
  if (channel_search != null) {
    const {members} = channel_search;
    var uid_search = members.find(data => data.uId === uId);
  }
  return (uid_search != null) ? uid_search.channelPerms : "invalid";
}


/*Description: Checks what the global permission are of a user
Arguments:
  <uId> (<integer>)    - <The uId of the user thats being checked.>

Return Value:
  Returns <permissions> if <user is found, its permissions are returned as a string. ie 'member'>
  Returns <invalid> on <uId was not found in the channel.>
*/
function globalPermissions(uId) {
  let data = getData();
  const {user} = data;
  const search = user.find(data => data.uId === uId);
  return (search != null) ? search.globalPerms : "invalid";
}

/*Description: Checks whether the channel is private or public.
Arguments:
  <channelId> (integer)    - <The channelId of the channel whose state is being queried.>

Return Value:
  Returns <true> on <when channel key IsPublic is set to true>
  Returns <false> on <when channel key IsPublic is set to false>
*/
function channelPublic(channelId) {
  let data = getData();
  const {channel} = data;
  const search = channel.find(data => data.channelId === channelId &&
                              data.isPublic === true);
  return (search != null) ? "true" : "false";
}


/*Description: Adds a user to a channel
Arguments:
  <authUserId> (integer)    - <The authUserId is the user who initates the function>
  <channelId> (integer)    - <The channelId of the channel which is getting the new user.>

Return Value:
  Returns <{}> on <successfully added user to channel>
  Returns <{error: 'error'}> on <user was not added due to failing an error test>
*/
//Add a check to test whether authUserId is valid.
function channelJoinV1(authUserId, channelId) {
  if (channelExists(channelId) == "false" ||
    uIdExists(authUserId) === "true" ||
    memberExists(channelId, authUserId) == "true" ||
    (channelPublic(channelId) == "false" && globalPermissions(authUserId) != GLOBAL)) {
    return {error: "error"};
  } else {
    let data = getData();
    const new_user = {uId: authUserId,channelPerms: 'member'};
    let i = data.channel.findIndex(data => data.channelId === channelId);
    data.channel[i].members.push(new_user);
    setData(data);
    return {};
  }
}


function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [],
    start: 0,
    end: -1,
  };
}

export { channelPublic, globalPermissions, channelPermissions, uIdExists, channelExists, memberExists, channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };