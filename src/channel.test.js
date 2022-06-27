let data = {};
// Use get() to access the data
function getData() {
  return data;
}

function setData(newData) {
  data = newData;
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



describe('Testing of channel functions', () => {
//data setup
    var test_user = 34546;
    var test_user2 = 75646;
    var test_channel = 999;
    const database = {
      user: [{
          uId: 34546,
          email: 'student@unsw.com',
          password: 'password',
          nameFirst: 'John',
          nameLast: 'Doe',
          handleStr: 'JohnD123',
          globalPerms: 'global',
      },{
          uId: 75646,
                  email: 'student@unsw.com',
                  password: 'password',
                  nameFirst: 'Jack',
                  nameLast: 'Smith',
                  handleStr: 'Jacksmith5',
                  globalPerms: 'global',
      },{
          uId: 37383,
                email: 'student@unsw.com',
                password: 'password',
                nameFirst: 'Grace',
                nameLast: 'Shim',
                handleStr: 'Graceshim0',
                globalPerms: 'global',
                channelPerms: 'owner',
      },{
          uId: 34526,
                email: 'student@unsw.com',
                password: 'password',
                nameFirst: 'Nathan',
                nameLast: 'Fawkes',
                handleStr: 'Nathanfawkes3',
                globalPerms: 'global',
                channelPerms: 'member',
      },{
          uId: 74623,
              email: 'student@unsw.com',
              password: 'password',
              nameFirst: 'Dylan',
              nameLast: 'Shadbolt',
              handleStr: 'Dylanshadbolt3',
              globalPerms: 'global',
              channelPerms: 'member',
      },{
          uId: 54728,
              email: 'student@unsw.com',
              password: 'password',
              nameFirst: 'Alice',
              nameLast: 'Jones',
              handleStr: 'Alicejones2',
              globalPerms: 'global',
              channelPerms: 'member',
      }],
  
      channel: [{
          channelId: 999,
          channelName: 'channel',
          isPublic: true,
          start: 0,
          members: [{
                  uId: 34546,
                  email: 'student@unsw.com',
                  password: 'password',
                  nameFirst: 'John',
                  nameLast: 'Doe',
                  handleStr: 'JohnD123',
                  globalPerms: 'global',
                  channelPerms: 'owner',
              },
  {
                  uId: 75646,
                  email: 'student@unsw.com',
                  password: 'password',
                  nameFirst: 'Jack',
                  nameLast: 'Smith',
                  handleStr: 'Jacksmith5',
                  globalPerms: 'global',
                  channelPerms: 'member',
              }],
          messages: [{
                  uId: "75646",
                  timestamp: '001',
                  message: "Hello world",
              }]
      },
      {
        channelId: 654,
        channelName: 'channel 2',
        isPublic: false,
        start: 0,
        members: [{
                uId: 37383,
                email: 'student@unsw.com',
                password: 'password',
                nameFirst: 'Grace',
                nameLast: 'Shim',
                handleStr: 'Graceshim0',
                globalPerms: 'global',
                channelPerms: 'owner',
            },
            {
                uId: 34526,
                email: 'student@unsw.com',
                password: 'password',
                nameFirst: 'Nathan',
                nameLast: 'Fawkes',
                handleStr: 'Nathanfawkes3',
                globalPerms: 'global',
                channelPerms: 'member',
            },
            {
              uId: 74623,
              email: 'student@unsw.com',
              password: 'password',
              nameFirst: 'Dylan',
              nameLast: 'Shadbolt',
              handleStr: 'Dylanshadbolt3',
              globalPerms: 'global',
              channelPerms: 'member',
            },
            {
              uId: 54728,
              email: 'student@unsw.com',
              password: 'password',
              nameFirst: 'Alice',
              nameLast: 'Jones',
              handleStr: 'Alicejones2',
              globalPerms: 'global',
              channelPerms: 'member',
            }
          ],
        messages: [{
                uId: "75646",
                timestamp: '001',
                message: "Hello world",
            },
            {
              uId: "63783",
              timestamp: '013',
              message: "Hello world 2",
          }
          ]
    }]
  }
  
 
setData(database);

//Actual testing
        test('channel states test', () => {
          expect(channelPublic(100000)).toStrictEqual('false'); //100000 is a random non existent channel id.
          expect(channelPublic(999)).toStrictEqual('true');
        });

        test('channel exists tests', () => { //what does that mean
            expect(channelExists(100000)).toStrictEqual('false'); //100000 is a random non existent channel id.
            expect(channelExists(999)).toStrictEqual('true');
            expect(channelExists(654)).toStrictEqual('true');
          });
    
        test('uId exists tests', () => { //what does that mean
            expect(memberExists(100000, 75646)).toStrictEqual('false');//100000 is a random non existent channel id.
            expect(memberExists(9999, 100000)).toStrictEqual('false');//100000 is a random non existent uId.
            expect(memberExists(999,75646)).toStrictEqual('true');
            expect(memberExists(654,75646)).toStrictEqual('false');
          });

        test('Permissions of a uId', () => { //what does that mean
            expect(channelPermissions(100000, 75646)).toStrictEqual('invalid');//100000 is a random non existent channel id.
            expect(channelPermissions(999, 100000)).toStrictEqual('invalid');//100000 is a random non existent uId.
            expect(channelPermissions(999,75646)).toStrictEqual('member');
            expect(channelPermissions(654,37383)).toStrictEqual('owner');
          });

        test('Permissions of a uId', () => { //what does that mean
            expect(globalPermissions(100000)).toStrictEqual('invalid');//100000 is a random non existent uid.
            expect(globalPermissions(34546)).toStrictEqual('global');
          });

        test('channelJoinV1 channel does not exist error', () => {
            expect(channelJoinV1(37383, 888)).toStrictEqual({error: 'error'});
          });
        
        test('channelJoinV1 already exists error', () => {
            expect(channelJoinV1(34546,999)).toStrictEqual({error: 'error'});
          });
        test('channelJoinV1 private channel error', () => {
            expect(channelJoinV1(37383, 654)).toStrictEqual({error: 'error'});
          });         

        test('channelJoinV1 useralready exists error', () => {
            expect(channelJoinV1(34546,999)).toStrictEqual({error: 'error'});
          });

        test('channelJoinV1 pass', () => {
            expect(channelJoinV1(34946,999)).toStrictEqual({});
          });

        test('channelInviteV1 full test', () => { //what does that mean
           expect(channelInviteV1(10000, 999, 657392 )).toStrictEqual({error: 'error'}); //100000 is a random non existent channel id.
           expect(channelInviteV1(75646,999,54728)).toStrictEqual({});
          });
  });
