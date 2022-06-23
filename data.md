// In the database, there are arrays of object user, and arrays of object channel

const data = {
    user: [{
        uId: 10,
        email: 'student@unsw.com',
        password: 'password',
        nameFirst: 'John',
        nameLast: 'Doe',
        handle: 'JohnD123'
        globalPerms: 'global'
    }]

    channel: [{
        channelId: 999,
        channelName: 'channel',
        isPublic: true,
        start: 0,
        members: [{
                    uId: 10,
                    email: 'student@unsw.com',
                    password: 'password',
                    nameFirst: 'John',
                    nameLast: 'Doe',
                    handleStr: 'JohnD123'
                    globalPerms: 'global'
                    channelPerms: 'owner',
            }],
        messages: [{
                uId: ‘-999’
                timestamp: '001'
                message: 'Hello world",
            }]
    }]
}

uId, email, nameFirst, nameLast, handleStr
