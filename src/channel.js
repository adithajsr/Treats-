let data = {};
// Use get() to access the data
function getData() {
  return data;
}

function setData(newData) {
  data = newData;
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
            handle: 'JohnD123',
            global_perms: "global"
        }],
    
        channel: [{
            channelId: 999,
            channelName: 'channel',
            isPublic: true,
            start: 0,
            members: [{
                    uId: 34546,
                    channel_perms: 'owner',
                },
    {
                    uId: 75646,
                    channel_perms: 'member',
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
                  channel_perms: 'owner',
              },
              {
                  uId: 34526,
                  channel_perms: 'member',
              },
              {
                uId: 74623,
                channel_perms: 'member',
              },
              {
                uId: 54728,
                pchannel_perms: 'member',
              }
            ],
          messages: [{
                  uId: "75646",
                  timestamp: '001',
                  message: "Hello world",
              }]
      }]
    }

 
setData(database);

//Actual testing
        test('channel states test', () => {
          expect(channel_public(100000)).toStrictEqual('false'); //100000 is a random non existent channel id.
          expect(channel_public(999)).toStrictEqual('true');
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
