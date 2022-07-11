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
      globalPerms: 1,
    },
  ],

  channel: [
    {
      channelId: 999,
      channelName: 'channel',
      isPublic: true,
      start: 0,
      members: [
        {
          uId: -999,
          channelPerms: 2,
        },
      ],
      messages: [
        {
          uId: -999,
          message: 'Hello world',
          timestamp: '001',
        },
      ],
    },
  ],

  token: [
    {
      token: 'tokenstring',
      uId: 10,
    }
  ]

}
