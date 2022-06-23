import { v4 as uuidv4 } from 'uuid';
import { getData, setData } from './dataStore';

/*
let data = {

  users: [
    {
      uId: 10,
      email: 'student@unsw.com',
      password: 'password',
      nameFirst: 'John',
      nameLast: 'Doe',
      handleStr: 'johndoe0',
      globalPerms: 1,
    },
  ],
  
  channels: [
    {
      channelId: 999,
      name: 'channel',
      isPublic: true,
      start: 0,
      members: [
        {
          uId: -999,
          channelPerms: 2,
        }
      ],
      messages: [
        {
          messageId: 5,
          uId: -999,
          message: 'Hello world',
          timeSent: 1656000513,
        }
      ],
    }
  ],

}
*/

function channelsCreateV1(authUserId, name, isPublic) {

  // TODO: Remove below comment before submitting

  // Creates a new channel with the given name that is either a public
  // or private channel.
  // The user who created it automatically joins the channel.

  // Parameters: { authUserId (integer), name (string), isPublic (boolean) }
  // e.g. channelsCreateV1( 12, 'M13A_AERO', false )

  // Return type if no error: { channelId (integer) }
  // e.g.  return {
  //         channelId: 1,
  //       };

  let data = getData();

  // Invalid authUserId
  if (data.user.find(a => a.uId === authUserId) === undefined) {
    return { error: 'error' };
  }
  // Invalid channel name
  if (name.length < 1 || name.length > 20) {
    return { error: 'error' };
  }

  // Generate channeId
  const channelId = uuidv4();

  // The user who created it automatically joins the channel
  const channelOwner = {
    uId: authUserId,
    channelPerms: 'owner',
  };

  // Create a new channel
  data.channel.push({
    channelId: channelId,
    channelName: name,
    isPublic: isPublic,
    members: [channelOwner],
  });

  setData(data);

  return {
    channelId: channelId,
  };
}


function channelsListV1(authUserId) {
  return {
    channels: [] // see interface for contents
  };
}

function channelsListallV1(authUserId) {
  return {
    channels: [] // see interface for contents
  };
}

export { channelsCreateV1, channelsListV1, channelsListallV1 };
