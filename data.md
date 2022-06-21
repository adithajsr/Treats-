// In the database, there are arrays of object user, and arrays of object channel

const data_base = {
    user: [{
        uId: 10,
        email: 'student@unsw.com',
        password: 'password',
        nameFirst: 'John',
        nameLast: 'Doe',
        handle: 'JohnD123'
    }]

    channel: [{
        channelId: 999,
        channelName: 'channel',
        isPublic: true,
        start: 0,
        members: [{
                uId: -999,
                permissions: 'owner',
            }],
        messages: [{
                channelId: 999,
                Uid: ‘-999’
                timestamp: '001'
                message: 'Hello world",
            }]
    }]

}
