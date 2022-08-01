// In the database, there are arrays of object user, and arrays of object channel





REMEMBER TO REPLACE WITH DATA FROM MASTER AFTER FINISHING





let data = {
  user: [
    {
      
      uId: 10,
      email: 'student@unsw.com',
      password: 'password',
      // nameFirst -> Removed
      nameFirst: 'John',
      // nameLast -> user
      nameLast: 'Doe',
      handle: 'johndoe0',
      globalPerms: 1,
      // add: shouldRetrieve: true
      
    },
  ],

  channel: [
    {
      channelId: 999,
      channelName: 'channel',
      isPublic: true,
      // remove from members array
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
        // message string w/ uId: replace with "Removed User'
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
      // remove from members array
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
        // message string w/ uId: replace with "Removed User'
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

