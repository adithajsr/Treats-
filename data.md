// In the database, there are arrays of object user, and arrays of object channel

let data = {
  user: [
    {
      uId: 10,
      email: 'student@unsw.com',
      password: 'password',
      nameFirst: 'John',
      nameLast: 'Doe',
      handle: 'johndoe0',
      profileImgUrl: 'http://localhost:5001/imgurl/randomstring.jpg',
      globalPerms: 1,
      notifications: [
        {
          channelId: 999,
          dmId: -1,
          notificationMessage: 'johndoe0 tagged you in channel: Hello to myself',
        },
      ],
      channelsJoined: [
        {
          numChannelsJoined: 0,
          timeStamp: 1500000000,
        },
        {
          numChannelsJoined: 1,
          timeStamp: 1658848908,
        },
      ],
      dmsJoined: [
        {
          numDmsJoined: 0,
          timeStamp: 1500000000,
        },
        {
          numDmsJoined: 1,
          timeStamp: 1658848922,
        },
      ],
      messagesSent: [
        {
          numMessagesSent: 0,
          timeStamp: 1500000000,
        },
        {
          numMessagesSent: 1,
          timeStamp: 1858848922,
        },
      ], 
      involvementRate: 0.6,
    },
  ],

  channel: [
    {
      channelId: 999,
      channelName: 'channel',
      isPublic: true,
      isActive: false,
      isActiveUid: -1,
      queue: [
        {
          handle: 'a handle'
          message: 'a message'
        }
      ]
      members: [
        {
          uId: -999,
          channelPerms: 2,
        },
      ],
      messages: [
        {
          messageId: 1,
          uId: -999,
          message: 'Hello world',
          timeSent: '001',
          pinned: 0,
          react: 0,
        },
      ],
    },
  ],

  token: [
    {
      token: 'tokenstring',
      uId: 10,
    }
  ],

  dm: [
    {
      dmId: 1,
      name: 'aliceschmoe, johndoe0',
      members: [
        {
          uId: 3,
          dmPerms: 1,
        },
        {
          uId: 50,
          dmPerms: 2,
        },
      ],
      messages: [
        {
          messageId: 20,
          uId: 3,
          message: 'Express',
          timeSent: '500',
          pinned: 0,
          react: 0
        },
      ],
    }
  ],

  workspaceStats: {
    channelsExist: [
      {
        numChannelsExist: 0,
        timeStamp: 1500000000,
      },
      {
        numChannelsExist: 1,
        timeStamp: 1658848908,
      },
      {
        numChannelsExist: 2,
        timeStamp: 2323221432,
      },
    ], 
    dmsExist: [
      {
        numDmsExist: 0,
        timeStamp: 1500000000,
      },
      {
        numDmsExist: 1,
        timeStamp: 1658848922,
      },
      {
        numDmsExist: 2,
        timeStamp: 2323221457,
      },
    ], 
    messagesExist: [
      {
        numMessagesExist: 0,
        timeStamp: 1500000000,
      },
      {
        numMessagesExist: 1,
        timeStamp: 1858848922,
      },
      {
        numMessagesExist: 2,
        timeStamp: 2058848922,
      },
    ], 
    utilizationRate: 0.5,
  }

}